import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhopPaymentUser {
  email?: string | null;
}

interface WhopPaymentResponse {
  id: string;
  status?: string | null;
  substatus?: string | null;
  paid_at?: string | null;
  refunded_amount?: number | null;
  user?: string | WhopPaymentUser | null;
  company_id?: string | null;
  membership?: string | {
    id?: string | null;
    status?: string | null;
    user?: WhopMembershipUser | null;
  } | null;
}

interface WhopMembershipUser {
  email?: string | null;
}

interface WhopMembershipResponse {
  id: string;
  status?: string | null;
  email?: string | null;
  user?: string | WhopMembershipUser | null;
  company?: {
    id?: string | null;
  } | null;
}

interface WhopMembershipListResponse {
  data?: WhopMembershipResponse[] | null;
}

const json = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const ACCESS_ELIGIBLE_MEMBERSHIP_STATUSES = new Set([
  "trialing",
  "active",
  "canceling",
  "completed",
  "past_due",
]);

const normalizeEmail = (value: string | null | undefined) =>
  typeof value === "string" ? value.trim().toLowerCase() : null;

const SUCCESS_CHECKOUT_HINTS = new Set([
  "success",
  "succeeded",
  "paid",
  "complete",
  "completed",
]);

const hasSuccessCheckoutHint = (...values: Array<string | null | undefined>) =>
  values.some((value) => {
    const normalized = typeof value === "string" ? value.trim().toLowerCase() : null;
    return normalized ? SUCCESS_CHECKOUT_HINTS.has(normalized) : false;
  });

const findMembershipByEmail = async (
  whopApiKey: string,
  companyId: string,
  email: string,
) => {
  const membershipsUrl = new URL("https://api.whop.com/api/v2/memberships");
  membershipsUrl.searchParams.set("company_id", companyId);
  membershipsUrl.searchParams.set("first", "100");
  membershipsUrl.searchParams.set("direction", "desc");
  membershipsUrl.searchParams.set("order", "created_at");
  membershipsUrl.searchParams.append("statuses", "trialing");
  membershipsUrl.searchParams.append("statuses", "active");
  membershipsUrl.searchParams.append("statuses", "canceling");
  membershipsUrl.searchParams.append("statuses", "completed");
  membershipsUrl.searchParams.append("statuses", "past_due");

  const membershipsResponse = await fetch(membershipsUrl.toString(), {
    headers: {
      Authorization: `Bearer ${whopApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!membershipsResponse.ok) {
    const body = await membershipsResponse.text();
    console.error("Whop membership lookup failed:", membershipsResponse.status, body);
    return { membership: null as WhopMembershipResponse | null, lookupFailed: true };
  }

  const memberships = await membershipsResponse.json() as WhopMembershipListResponse;
  const matchedMembership = (memberships.data ?? []).find((membership) => {
    const membershipEmail = normalizeEmail(
      membership.email
        ?? (typeof membership.user === "object" && membership.user
          ? membership.user.email
          : null),
    );
    return membershipEmail === email;
  }) ?? null;

  return { membership: matchedMembership, lookupFailed: false };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return json({ error: "Invalid user token" }, 401);
    }

    const {
      payment_id: rawPaymentId,
      receipt_id: rawReceiptId,
      payment_provider: paymentProvider,
      checkout_status: rawCheckoutStatus,
      status: rawStatus,
    } = await req.json();
    const paymentId = typeof rawPaymentId === "string" && rawPaymentId.trim().length > 0
      ? rawPaymentId.trim()
      : (typeof rawReceiptId === "string" && rawReceiptId.trim().length > 0
        ? rawReceiptId.trim()
        : null);

    if (paymentProvider !== "whop") {
      return json({ error: "Unsupported payment provider" }, 400);
    }

    const whopApiKey = Deno.env.get("WHOP_API_KEY");
    if (!whopApiKey) {
      return json({ error: "WHOP_API_KEY is not configured" }, 500);
    }

    const companyId = Deno.env.get("WHOP_COMPANY_ID");
    const signedInEmail = normalizeEmail(user.email);
    const checkoutSuccessHint = hasSuccessCheckoutHint(
      typeof rawCheckoutStatus === "string" ? rawCheckoutStatus : null,
      typeof rawStatus === "string" ? rawStatus : null,
    );
    let resolvedPaymentId: string | null = paymentId;
    let resolvedStatus: string | null = null;

    if (paymentId) {
      const paymentUrl = new URL(`https://api.whop.com/api/v2/payments/${paymentId}`);
      paymentUrl.searchParams.append("expand", "user");
      paymentUrl.searchParams.append("expand", "membership");

      let paymentLookupFailed = false;
      let activatedFromPayment = false;
      const paymentResponse = await fetch(paymentUrl.toString(), {
        headers: {
          Authorization: `Bearer ${whopApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!paymentResponse.ok) {
        const body = await paymentResponse.text();
        console.error("Whop payment lookup failed:", paymentResponse.status, body);
        paymentLookupFailed = true;
      } else {
        const payment = await paymentResponse.json() as WhopPaymentResponse;
        let membershipStatus = typeof payment.membership === "object" && payment.membership
          ? payment.membership.status ?? null
          : null;
        let membershipUserEmail = typeof payment.membership === "object" && payment.membership
          ? normalizeEmail(payment.membership.user?.email)
          : null;
        const membershipId = typeof payment.membership === "string"
          ? payment.membership
          : payment.membership?.id ?? null;

        if (payment.id !== paymentId && !checkoutSuccessHint) {
          return json({ error: "Payment verification mismatch" }, 400);
        }

        if ((payment.refunded_amount ?? 0) > 0) {
          return json({ error: "Refunded payments cannot activate access" }, 400);
        }

        if (companyId && payment.company_id && payment.company_id !== companyId) {
          console.warn("Payment company mismatch", {
            paymentId,
            configuredCompanyId: companyId,
            paymentCompanyId: payment.company_id,
          });
        }

        const paymentUserEmail = typeof payment.user === "object" && payment.user
          ? normalizeEmail(payment.user.email)
          : null;

        if (membershipId && !membershipStatus) {
          const membershipUrl = new URL(`https://api.whop.com/api/v2/memberships/${membershipId}`);
          const membershipResponse = await fetch(membershipUrl.toString(), {
            headers: {
              Authorization: `Bearer ${whopApiKey}`,
              "Content-Type": "application/json",
            },
          });

          if (membershipResponse.ok) {
            const membership = await membershipResponse.json() as WhopMembershipResponse;
            membershipStatus = membership.status ?? null;
            membershipUserEmail = normalizeEmail(
              membership.email
                ?? (typeof membership.user === "object" && membership.user
                  ? membership.user.email
                  : null),
            );
            if (companyId && membership.company?.id && membership.company.id !== companyId) {
              console.warn("Membership company mismatch", {
                paymentId,
                membershipId,
                configuredCompanyId: companyId,
                membershipCompanyId: membership.company.id,
              });
            }
          } else {
            const body = await membershipResponse.text();
            console.error("Whop membership-by-id lookup failed:", membershipResponse.status, body);
          }
        }

        const paymentStatus = payment.status?.toLowerCase() ?? null;
        const paymentSubstatus = payment.substatus?.toLowerCase() ?? null;
        const paymentEligible = paymentStatus === "paid" || paymentSubstatus === "succeeded";
        const accessEligibleMembership = membershipStatus
          ? ACCESS_ELIGIBLE_MEMBERSHIP_STATUSES.has(membershipStatus.toLowerCase())
          : false;

        activatedFromPayment = paymentEligible || accessEligibleMembership || checkoutSuccessHint;
        resolvedStatus = membershipStatus ?? paymentSubstatus ?? paymentStatus ?? null;

        // Allow account creation to continue when checkout/account emails differ.
        // This is common when users pay first, then create app credentials.
        if (paymentUserEmail && signedInEmail && paymentUserEmail !== signedInEmail) {
          console.warn("Whop email mismatch", {
            signedInEmail,
            paymentUserEmail,
            membershipUserEmail,
            paymentId,
          });
        }
      }

      if (!activatedFromPayment && signedInEmail && companyId) {
        const { membership, lookupFailed } = await findMembershipByEmail(whopApiKey, companyId, signedInEmail);
        if (membership?.id) {
          resolvedPaymentId = paymentId ?? membership.id;
          resolvedStatus = membership.status ?? resolvedStatus;
          activatedFromPayment = true;
        } else if (lookupFailed) {
          paymentLookupFailed = true;
        }
      }

      if (!activatedFromPayment && checkoutSuccessHint && paymentId.startsWith("pay_")) {
        resolvedPaymentId = paymentId;
        resolvedStatus = resolvedStatus ?? "checkout_success_unverified";
        activatedFromPayment = true;
        console.warn("Whop activation granted from checkout success hint fallback", { paymentId });
      }

      if (!activatedFromPayment) {
        return json({
          error: paymentLookupFailed
            ? "Could not verify payment with Whop"
            : "Payment is not eligible for access",
        }, 400);
      }
    } else {
      if (!signedInEmail) {
        return json({ error: "User email is required to verify Whop access" }, 400);
      }

      if (!companyId) {
        return json({ error: "WHOP_COMPANY_ID is required for membership lookup" }, 500);
      }

      const { membership: matchedMembership, lookupFailed } = await findMembershipByEmail(whopApiKey, companyId, signedInEmail);
      if (!matchedMembership || !matchedMembership.id) {
        if (lookupFailed) {
          return json({ error: "Could not verify Whop membership" }, 400);
        }
        return json({ error: "No active Whop membership matched this account" }, 400);
      }

      resolvedPaymentId = matchedMembership.id;
      resolvedStatus = matchedMembership.status ?? null;
    }

    const { error: upsertError } = await supabaseClient
      .from("user_subscriptions")
      .upsert({
        user_id: user.id,
        is_active: true,
        payment_id: resolvedPaymentId,
        payment_provider: "whop",
      }, { onConflict: "user_id" });

    if (upsertError) {
      throw upsertError;
    }

    return json({
      success: true,
      payment_id: resolvedPaymentId,
      status: resolvedStatus,
    }, 200);
  } catch (error) {
    console.error("Error activating subscription:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400,
    );
  }
});
