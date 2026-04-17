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
  membership?: {
    id?: string | null;
    status?: string | null;
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

    const { payment_id: rawPaymentId, payment_provider: paymentProvider } = await req.json();
    const paymentId = typeof rawPaymentId === "string" && rawPaymentId.trim().length > 0
      ? rawPaymentId.trim()
      : null;

    if (paymentProvider !== "whop") {
      return json({ error: "Unsupported payment provider" }, 400);
    }

    const whopApiKey = Deno.env.get("WHOP_API_KEY");
    if (!whopApiKey) {
      return json({ error: "WHOP_API_KEY is not configured" }, 500);
    }

    const companyId = Deno.env.get("WHOP_COMPANY_ID");
    let resolvedPaymentId: string | null = paymentId;
    let resolvedStatus: string | null = null;

    if (paymentId) {
      const paymentUrl = new URL(`https://api.whop.com/api/v2/payments/${paymentId}`);
      paymentUrl.searchParams.append("expand", "user");

      const paymentResponse = await fetch(paymentUrl.toString(), {
        headers: {
          Authorization: `Bearer ${whopApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!paymentResponse.ok) {
        const body = await paymentResponse.text();
        console.error("Whop payment lookup failed:", paymentResponse.status, body);
        return json({ error: "Could not verify payment with Whop" }, 400);
      }

      const payment = await paymentResponse.json() as WhopPaymentResponse;
      const membershipStatus = payment.membership?.status ?? null;
      const accessEligibleMembership = membershipStatus === "trialing"
        || membershipStatus === "active"
        || membershipStatus === "canceling";

      if (payment.id !== paymentId) {
        return json({ error: "Payment verification mismatch" }, 400);
      }

      if ((payment.refunded_amount ?? 0) > 0) {
        return json({ error: "Refunded payments cannot activate access" }, 400);
      }

      if (companyId && payment.company_id && payment.company_id !== companyId) {
        return json({ error: "Payment does not belong to the configured company" }, 400);
      }

      const paymentUserEmail = typeof payment.user === "object" && payment.user
        ? payment.user.email?.toLowerCase() ?? null
        : null;

      if (paymentUserEmail && user.email && paymentUserEmail !== user.email.toLowerCase()) {
        return json({ error: "Payment does not match the signed-in account" }, 400);
      }

      if (payment.status !== "paid" && !accessEligibleMembership) {
        return json({ error: "Payment is not eligible for access" }, 400);
      }

      resolvedStatus = membershipStatus ?? payment.status ?? null;
    } else {
      if (!user.email) {
        return json({ error: "User email is required to verify Whop access" }, 400);
      }

      if (!companyId) {
        return json({ error: "WHOP_COMPANY_ID is required for membership lookup" }, 500);
      }

      const membershipsUrl = new URL("https://api.whop.com/api/v2/memberships");
      membershipsUrl.searchParams.set("company_id", companyId);
      membershipsUrl.searchParams.set("first", "100");
      membershipsUrl.searchParams.set("direction", "desc");
      membershipsUrl.searchParams.set("order", "created_at");
      membershipsUrl.searchParams.append("statuses", "trialing");
      membershipsUrl.searchParams.append("statuses", "active");
      membershipsUrl.searchParams.append("statuses", "canceling");

      const membershipsResponse = await fetch(membershipsUrl.toString(), {
        headers: {
          Authorization: `Bearer ${whopApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!membershipsResponse.ok) {
        const body = await membershipsResponse.text();
        console.error("Whop membership lookup failed:", membershipsResponse.status, body);
        return json({ error: "Could not verify Whop membership" }, 400);
      }

      const memberships = await membershipsResponse.json() as WhopMembershipListResponse;
      const matchedMembership = (memberships.data ?? []).find((membership) => {
        const membershipEmail = (
          membership.email
          ?? (typeof membership.user === "object" && membership.user
            ? membership.user.email
            : null)
        )?.toLowerCase() ?? null;
        return membershipEmail === user.email?.toLowerCase();
      });

      if (!matchedMembership) {
        return json({ error: "No active Whop membership matched this account" }, 400);
      }

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
