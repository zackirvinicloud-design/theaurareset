import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface LeadCaptureInput {
  email: string;
  firstName?: string | null;
  source?: string;
  quizSummary?: Json | null;
}

const normalizeText = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const normalizeLeadEmail = (value: string) => value.trim().toLowerCase();

export const upsertLeadCapture = async ({
  email,
  firstName = null,
  source = 'profile_onboarding',
  quizSummary = null,
}: LeadCaptureInput) => {
  const normalizedEmail = normalizeLeadEmail(email);

  const { error } = await supabase.rpc('upsert_lead_capture', {
    p_email: normalizedEmail,
    p_first_name: normalizeText(firstName),
    p_source: normalizeText(source) ?? 'profile_onboarding',
    p_quiz_summary: quizSummary,
  });

  if (error) {
    throw error;
  }

  return normalizedEmail;
};
