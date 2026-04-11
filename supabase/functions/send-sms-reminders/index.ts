import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-reminder-secret",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });

const REMINDER_RETRY_MINUTES = 10;

interface TaskReminderRow {
  id: string;
  user_id: string;
  day_number: number;
  label: string;
  deep_link_target: string;
  scheduled_at_utc: string;
  last_sent_at: string | null;
  sms_enabled: boolean;
}

interface SmsSubscriptionRow {
  id: string;
  user_id: string;
  phone_e164: string;
  transactional_opt_in: boolean;
  status: "active" | "paused" | "revoked" | string;
}

const getAppUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = Deno.env.get("PUBLIC_APP_URL")?.replace(/\/$/, "");
  if (!base) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const buildMessageBody = (label: string, deepLinkTarget: string) => {
  const url = getAppUrl(deepLinkTarget);
  return `Gut Brain: ${label}. Open your next step here: ${url}`;
};

const sendTwilioMessage = async ({
  to,
  body,
}: {
  to: string;
  body: string;
}) => {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER");
  const messagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

  if (!accountSid || !authToken || (!fromNumber && !messagingServiceSid)) {
    throw new Error("Twilio environment variables are not fully configured");
  }

  const payload = new URLSearchParams({
    To: to,
    Body: body,
  });

  if (messagingServiceSid) {
    payload.set("MessagingServiceSid", messagingServiceSid);
  } else if (fromNumber) {
    payload.set("From", fromNumber);
  }

  const auth = btoa(`${accountSid}:${authToken}`);
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  const text = await response.text();
  let parsed: Record<string, unknown> | null = null;

  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    parsed = { raw: text };
  }

  if (!response.ok) {
    throw new Error(typeof parsed?.message === "string" ? parsed.message : "Twilio request failed");
  }

  return parsed;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const reminderSecret = Deno.env.get("REMINDER_WEBHOOK_SECRET");
    if (reminderSecret) {
      const suppliedSecret = req.headers.get("x-reminder-secret");
      if (suppliedSecret !== reminderSecret) {
        return json({ error: "Unauthorized" }, 401);
      }
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const nowIso = new Date().toISOString();
    const retryThreshold = new Date(Date.now() - REMINDER_RETRY_MINUTES * 60 * 1000).toISOString();

    const { data: reminderRows, error: reminderError } = await supabaseClient
      .from("task_reminders")
      .select("id, user_id, day_number, label, deep_link_target, scheduled_at_utc, last_sent_at, sms_enabled")
      .eq("active", true)
      .eq("delivery_channel", "sms")
      .eq("sms_enabled", true)
      .lte("scheduled_at_utc", nowIso)
      .or(`last_sent_at.is.null,last_sent_at.lt.${retryThreshold}`);

    if (reminderError) {
      throw reminderError;
    }

    const reminders = (reminderRows ?? []) as TaskReminderRow[];
    const userIds = Array.from(new Set(reminders.map((reminder) => reminder.user_id).filter(Boolean)));
    const subscriptionByUserId = new Map<string, SmsSubscriptionRow>();

    if (userIds.length > 0) {
      const { data: subscriptionRows, error: subscriptionError } = await supabaseClient
        .from("sms_subscriptions")
        .select("id, user_id, phone_e164, transactional_opt_in, status")
        .in("user_id", userIds);

      if (subscriptionError) {
        throw subscriptionError;
      }

      for (const subscription of (subscriptionRows ?? []) as SmsSubscriptionRow[]) {
        subscriptionByUserId.set(subscription.user_id, subscription);
      }
    }

    const results: Record<string, unknown>[] = [];

    for (const reminder of reminders) {
      const smsSubscription = subscriptionByUserId.get(reminder.user_id);

      if (!smsSubscription || smsSubscription.status !== "active" || !smsSubscription.transactional_opt_in) {
        await supabaseClient.from("sms_delivery_events").insert({
          user_id: reminder.user_id,
          reminder_id: reminder.id,
          sms_subscription_id: smsSubscription?.id ?? null,
          status: "skipped_no_subscription",
          error_message: "Missing active transactional SMS subscription",
          clicked_target: reminder.deep_link_target,
        });

        results.push({ reminder_id: reminder.id, status: "skipped_no_subscription" });
        continue;
      }

      const body = buildMessageBody(reminder.label, reminder.deep_link_target);

      try {
        const sentAt = new Date().toISOString();
        const twilioResponse = await sendTwilioMessage({
          to: smsSubscription.phone_e164,
          body,
        });

        await supabaseClient.from("task_reminders").update({
          active: false,
          delivered_at: sentAt,
          last_sent_at: sentAt,
        }).eq("id", reminder.id);

        await supabaseClient.from("sms_subscriptions").update({
          last_sent_at: sentAt,
        }).eq("id", smsSubscription.id);

        await supabaseClient.from("sms_delivery_events").insert({
          user_id: reminder.user_id,
          reminder_id: reminder.id,
          sms_subscription_id: smsSubscription.id,
          status: typeof twilioResponse.status === "string" ? twilioResponse.status : "queued",
          message_sid: typeof twilioResponse.sid === "string" ? twilioResponse.sid : null,
          response_payload: twilioResponse,
          clicked_target: reminder.deep_link_target,
        });

        results.push({
          reminder_id: reminder.id,
          status: "sent",
          message_sid: twilioResponse.sid ?? null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown SMS error";
        const failedAt = new Date().toISOString();

        await supabaseClient.from("task_reminders").update({
          last_sent_at: failedAt,
        }).eq("id", reminder.id);

        await supabaseClient.from("sms_delivery_events").insert({
          user_id: reminder.user_id,
          reminder_id: reminder.id,
          sms_subscription_id: smsSubscription.id,
          status: "failed",
          error_message: errorMessage,
          clicked_target: reminder.deep_link_target,
        });

        results.push({
          reminder_id: reminder.id,
          status: "failed",
          error: errorMessage,
        });
      }
    }

    return json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("send-sms-reminders error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});
