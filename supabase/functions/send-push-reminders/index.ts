import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

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
  checklist_key: string;
  label: string;
  deep_link_target: string;
  scheduled_at_utc: string;
  last_sent_at: string | null;
}

interface WebPushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  active: boolean;
}

const normalizePath = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const appUrl = Deno.env.get("PUBLIC_APP_URL")?.replace(/\/$/, "");
  if (!appUrl) {
    return normalized;
  }

  return `${appUrl}${normalized}`;
};

const sanitizeError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown push delivery error";
};

const extractStatusCode = (error: unknown): number | null => {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  if ("statusCode" in error && typeof (error as Record<string, unknown>).statusCode === "number") {
    return (error as Record<string, number>).statusCode;
  }

  if ("status" in error && typeof (error as Record<string, unknown>).status === "number") {
    return (error as Record<string, number>).status;
  }

  return null;
};

const buildPushPayload = (reminder: TaskReminderRow) => JSON.stringify({
  title: "Time for your next Gut Brain step",
  body: reminder.label,
  url: normalizePath(reminder.deep_link_target),
  tag: `gut-brain-reminder-${reminder.id}`,
});

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

    const vapidPublicKey = Deno.env.get("WEB_PUSH_VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("WEB_PUSH_VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("WEB_PUSH_SUBJECT") ?? "mailto:support@theaurareset.com";

    if (!vapidPublicKey || !vapidPrivateKey) {
      return json(
        { error: "Missing WEB_PUSH_VAPID_PUBLIC_KEY or WEB_PUSH_VAPID_PRIVATE_KEY" },
        500,
      );
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const nowIso = new Date().toISOString();
    const retryThreshold = new Date(Date.now() - REMINDER_RETRY_MINUTES * 60 * 1000).toISOString();

    const { data: reminderRows, error: reminderError } = await supabaseClient
      .from("task_reminders")
      .select("id, user_id, day_number, checklist_key, label, deep_link_target, scheduled_at_utc, last_sent_at")
      .eq("active", true)
      .eq("delivery_channel", "push")
      .lte("scheduled_at_utc", nowIso)
      .or(`last_sent_at.is.null,last_sent_at.lt.${retryThreshold}`);

    if (reminderError) {
      throw reminderError;
    }

    const reminders = (reminderRows ?? []) as TaskReminderRow[];
    const userIds = Array.from(new Set(reminders.map((reminder) => reminder.user_id).filter(Boolean)));
    const subscriptionsByUserId = new Map<string, WebPushSubscriptionRow[]>();

    if (userIds.length > 0) {
      const { data: subscriptionRows, error: subscriptionError } = await supabaseClient
        .from("web_push_subscriptions")
        .select("id, user_id, endpoint, p256dh, auth, active")
        .eq("active", true)
        .in("user_id", userIds);

      if (subscriptionError) {
        throw subscriptionError;
      }

      for (const row of (subscriptionRows ?? []) as WebPushSubscriptionRow[]) {
        const current = subscriptionsByUserId.get(row.user_id) ?? [];
        current.push(row);
        subscriptionsByUserId.set(row.user_id, current);
      }
    }

    const results: Record<string, unknown>[] = [];

    for (const reminder of reminders) {
      const subscriptions = subscriptionsByUserId.get(reminder.user_id) ?? [];

      if (subscriptions.length === 0) {
        const skippedAt = new Date().toISOString();

        await supabaseClient.from("task_reminders").update({
          last_sent_at: skippedAt,
        }).eq("id", reminder.id);

        await supabaseClient.from("push_delivery_events").insert({
          user_id: reminder.user_id,
          reminder_id: reminder.id,
          status: "skipped_no_subscription",
          error_message: "Missing active web push subscription",
          clicked_target: reminder.deep_link_target,
        });

        results.push({
          reminder_id: reminder.id,
          status: "skipped_no_subscription",
        });
        continue;
      }

      const payload = buildPushPayload(reminder);
      let successCount = 0;
      const failures: string[] = [];

      for (const subscription of subscriptions) {
        try {
          const response = await webpush.sendNotification({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          }, payload);

          successCount += 1;

          await supabaseClient.from("push_delivery_events").insert({
            user_id: reminder.user_id,
            reminder_id: reminder.id,
            web_push_subscription_id: subscription.id,
            status: "sent",
            response_payload: {
              statusCode: response.statusCode,
              body: response.body ?? null,
              headers: response.headers ?? null,
            },
            clicked_target: reminder.deep_link_target,
          });
        } catch (error) {
          const errorMessage = sanitizeError(error);
          failures.push(errorMessage);
          const statusCode = extractStatusCode(error);

          await supabaseClient.from("push_delivery_events").insert({
            user_id: reminder.user_id,
            reminder_id: reminder.id,
            web_push_subscription_id: subscription.id,
            status: statusCode === 404 || statusCode === 410 ? "failed_stale_subscription" : "failed",
            error_message: errorMessage,
            response_payload: {
              statusCode,
            },
            clicked_target: reminder.deep_link_target,
          });

          if (statusCode === 404 || statusCode === 410) {
            await supabaseClient
              .from("web_push_subscriptions")
              .update({
                active: false,
              })
              .eq("id", subscription.id);
          }
        }
      }

      const sentAt = new Date().toISOString();
      if (successCount > 0) {
        await supabaseClient.from("task_reminders").update({
          active: false,
          delivered_at: sentAt,
          last_sent_at: sentAt,
        }).eq("id", reminder.id);

        results.push({
          reminder_id: reminder.id,
          status: "sent",
          deliveries: successCount,
        });
      } else {
        await supabaseClient.from("task_reminders").update({
          last_sent_at: sentAt,
        }).eq("id", reminder.id);

        results.push({
          reminder_id: reminder.id,
          status: "failed",
          error: failures.join("; ") || "No push subscriptions could be reached",
        });
      }
    }

    return json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("send-push-reminders error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});
