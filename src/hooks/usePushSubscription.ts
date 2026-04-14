import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WebPushSubscriptionRecord {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  active: boolean;
  timezone: string;
  source: string;
  lastSeenAt: string;
}

const mapRow = (row: Record<string, unknown>): WebPushSubscriptionRecord => ({
  id: String(row.id),
  userId: String(row.user_id),
  endpoint: String(row.endpoint),
  p256dh: String(row.p256dh),
  auth: String(row.auth),
  active: Boolean(row.active),
  timezone: String(row.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone),
  source: String(row.source ?? 'web'),
  lastSeenAt: String(row.last_seen_at ?? new Date().toISOString()),
});

export const usePushSubscription = (userId: string | null) => {
  const [subscription, setSubscription] = useState<WebPushSubscriptionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userId) {
        if (!cancelled) {
          setSubscription(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from('web_push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('active', true)
        .order('last_seen_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setSubscription(!error && data ? mapRow(data as Record<string, unknown>) : null);
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const saveSubscription = useCallback(async (input: {
    endpoint: string;
    p256dh: string;
    auth: string;
    source?: string;
  }) => {
    if (!userId) {
      throw new Error('You must be signed in to enable push reminders.');
    }

    if (!input.endpoint || !input.p256dh || !input.auth) {
      throw new Error('Push subscription payload is incomplete.');
    }

    setIsSaving(true);

    try {
      const payload = {
        user_id: userId,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        source: input.source ?? 'notification_setup',
        active: true,
        last_seen_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('web_push_subscriptions')
        .upsert(payload, { onConflict: 'user_id,endpoint' })
        .select('*')
        .single();

      if (error || !data) {
        throw error ?? new Error('Could not save push subscription.');
      }

      const next = mapRow(data as Record<string, unknown>);
      setSubscription(next);
      return next;
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  const deactivateSubscription = useCallback(async () => {
    if (!subscription) {
      return;
    }

    setIsSaving(true);
    try {
      await supabase
        .from('web_push_subscriptions')
        .update({ active: false })
        .eq('id', subscription.id);
      setSubscription(null);
    } finally {
      setIsSaving(false);
    }
  }, [subscription]);

  const pushReady = useMemo(
    () => Boolean(subscription?.active && subscription.endpoint),
    [subscription],
  );

  return {
    subscription,
    pushReady,
    isLoading,
    isSaving,
    saveSubscription,
    deactivateSubscription,
  };
};
