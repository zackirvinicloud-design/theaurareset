import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { normalizePhoneE164 } from '@/lib/sms';

export interface SmsSubscription {
  id: string;
  userId: string;
  phoneE164: string;
  timezone: string;
  transactionalOptIn: boolean;
  marketingOptIn: boolean;
  consentSource: string;
  consentAt: string;
  status: 'active' | 'paused' | 'revoked';
  lastSentAt?: string | null;
}

interface SaveSmsSubscriptionInput {
  phone: string;
  transactionalOptIn: boolean;
  marketingOptIn: boolean;
  consentSource?: string;
}

const mapSmsSubscriptionRow = (row: Record<string, unknown>): SmsSubscription => ({
  id: String(row.id),
  userId: String(row.user_id),
  phoneE164: String(row.phone_e164),
  timezone: String(row.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone),
  transactionalOptIn: Boolean(row.transactional_opt_in),
  marketingOptIn: Boolean(row.marketing_opt_in),
  consentSource: String(row.consent_source ?? 'web_setup'),
  consentAt: String(row.consent_at ?? new Date().toISOString()),
  status: (row.status as SmsSubscription['status']) ?? 'active',
  lastSentAt: typeof row.last_sent_at === 'string' ? row.last_sent_at : null,
});

export const useSmsSubscription = (userId: string | null) => {
  const [subscription, setSubscription] = useState<SmsSubscription | null>(null);
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
        .from('sms_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!cancelled) {
        setSubscription(!error && data ? mapSmsSubscriptionRow(data as Record<string, unknown>) : null);
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const saveSubscription = useCallback(async ({
    phone,
    transactionalOptIn,
    marketingOptIn,
    consentSource = 'web_setup',
  }: SaveSmsSubscriptionInput) => {
    if (!userId) {
      throw new Error('You must be signed in to save SMS preferences.');
    }

    const normalizedPhone = normalizePhoneE164(phone);
    if (!normalizedPhone) {
      throw new Error('Enter a valid US phone number.');
    }

    if (!transactionalOptIn) {
      throw new Error('You need to opt into transactional texts before saving.');
    }

    setIsSaving(true);

    try {
      const payload = {
        user_id: userId,
        phone_e164: normalizedPhone,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        transactional_opt_in: transactionalOptIn,
        marketing_opt_in: marketingOptIn,
        consent_source: consentSource,
        consent_at: new Date().toISOString(),
        status: 'active',
      };

      const { data, error } = await supabase
        .from('sms_subscriptions')
        .upsert(payload, { onConflict: 'user_id' })
        .select('*')
        .single();

      if (error || !data) {
        throw error ?? new Error('Could not save SMS preferences.');
      }

      const nextSubscription = mapSmsSubscriptionRow(data as Record<string, unknown>);
      setSubscription(nextSubscription);
      return nextSubscription;
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  const smsReady = useMemo(() => (
    Boolean(
      subscription
      && subscription.status === 'active'
      && subscription.transactionalOptIn
      && subscription.phoneE164,
    )
  ), [subscription]);

  return {
    subscription,
    smsReady,
    isLoading,
    isSaving,
    saveSubscription,
  };
};
