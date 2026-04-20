import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, MessageSquareText } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';
import { isEmailVerified, mergeRedirectParams, sanitizeRedirectPath } from '@/lib/auth-routing';
import { useSmsSubscription } from '@/hooks/useSmsSubscription';
import { SMS_REMINDERS_ENABLED } from '@/lib/sms';

const TextReminderSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = sanitizeRedirectPath(searchParams.get('redirect')) ?? '/protocol';
  const source = searchParams.get('source') ?? 'text_reminder_setup';
  const provider = searchParams.get('provider');
  const paymentId = searchParams.get('payment_id');
  const redirectDestination = mergeRedirectParams(redirectPath, {
    provider,
    payment_id: paymentId,
  }) ?? '/protocol';
  const setupPath = useMemo(() => {
    const next = new URLSearchParams();
    next.set('redirect', redirectPath);
    next.set('source', source);
    if (provider) {
      next.set('provider', provider);
    }
    if (paymentId) {
      next.set('payment_id', paymentId);
    }
    return `/setup/text-reminders?${next.toString()}`;
  }, [paymentId, provider, redirectPath, source]);
  const notificationSetupPath = useMemo(() => {
    const next = new URLSearchParams();
    next.set('redirect', redirectPath);
    next.set('source', 'text-reminders-unavailable');
    if (provider) {
      next.set('provider', provider);
    }
    if (paymentId) {
      next.set('payment_id', paymentId);
    }
    return `/setup/notifications?${next.toString()}`;
  }, [paymentId, provider, redirectPath]);

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [transactionalOptIn, setTransactionalOptIn] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { subscription, smsReady, isLoading: isSmsLoading, isSaving, saveSubscription } = useSmsSubscription(userId);

  const persistSetupOutcome = useCallback(async (patch: Record<string, unknown>) => {
    if (!userId) {
      return;
    }

    await supabase
      .from('user_onboarding_profiles')
      .upsert({
        user_id: userId,
        sms_setup_source: source,
        ...patch,
      }, { onConflict: 'user_id' });
  }, [source, userId]);

  useEffect(() => {
    if (SMS_REMINDERS_ENABLED) {
      return;
    }

    toast({
      title: 'Text reminders are coming soon',
      description: 'We are routing you into Home Screen install and push reminders while carrier approval clears.',
    });

    navigate(notificationSetupPath, { replace: true });
  }, [navigate, notificationSetupPath]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (!cancelled) {
          navigate(`/auth?redirect=${encodeURIComponent(setupPath)}`, { replace: true });
        }
        return;
      }

      if (!isEmailVerified(session.user)) {
        if (!cancelled) {
          navigate(`/signup?redirect=${encodeURIComponent(setupPath)}`, { replace: true });
        }
        return;
      }

      if (!cancelled) {
        setUserId(session.user.id);
        setIsBootstrapping(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [navigate, setupPath]);

  useEffect(() => {
    if (!subscription?.phoneE164) {
      return;
    }

    setPhone(subscription.phoneE164);
    setTransactionalOptIn(subscription.transactionalOptIn);
    setMarketingOptIn(subscription.marketingOptIn);
  }, [subscription]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    void persistSetupOutcome({
      sms_setup_seen_at: new Date().toISOString(),
    });
  }, [persistSetupOutcome, userId]);

  useEffect(() => {
    if (!isSubmitting && !isBootstrapping && !isSmsLoading && smsReady) {
      navigate(redirectDestination, { replace: true });
    }
  }, [isBootstrapping, isSmsLoading, isSubmitting, navigate, redirectDestination, smsReady]);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await saveSubscription({
        phone,
        transactionalOptIn,
        marketingOptIn,
        consentSource: source,
      });

      await persistSetupOutcome({
        sms_setup_completed_at: new Date().toISOString(),
        sms_setup_skipped_at: null,
        sms_transactional_opt_in: transactionalOptIn,
        sms_marketing_opt_in: marketingOptIn,
        preferred_reminder_channel: 'sms',
      });

      toast({
        title: 'Text reminders are on',
        description: 'We will text you back into the exact step when a reminder is due.',
      });

      navigate(redirectDestination, { replace: true });
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: 'Could not save text reminders',
        description: getFriendlyAuthErrorMessage(error, 'Please check your phone number and try again.'),
        variant: 'destructive',
      });
    }
  };

  const handleSkip = async () => {
    await persistSetupOutcome({
      sms_setup_skipped_at: new Date().toISOString(),
      preferred_reminder_channel: 'local',
    });

    navigate(redirectDestination, { replace: true });
  };

  if (isBootstrapping) {
    return (
      <div className="app-shell-dark min-h-screen flex items-center justify-center p-4">
        <Card className="app-panel-dark w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <p className="text-lg font-semibold text-foreground">Loading</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Preparing your text reminder setup.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-shell-dark min-h-screen flex items-center justify-center p-4">
      <Card className="app-panel-dark w-full max-w-lg border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/15">
            <MessageSquareText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Turn on text reminders</CardTitle>
          <CardDescription className="mx-auto max-w-md text-base leading-7">
            Skip the install friction. We will text you when it is time to jump back into today&apos;s plan.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-primary/25 bg-primary/8 px-4 py-4 text-left">
            <p className="text-sm font-medium text-foreground">What texts will do</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Day-start nudges, task reminders, and rescue messages that reopen the exact app screen you need.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sms-phone">Mobile phone number</Label>
            <Input
              id="sms-phone"
              type="tel"
              autoComplete="tel"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              US numbers only for now. Messages link straight back into your protocol workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-4 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="transactional-opt-in"
                checked={transactionalOptIn}
                onCheckedChange={(checked) => setTransactionalOptIn(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="transactional-opt-in" className="leading-5">
                  I agree to receive transactional text reminders about my protocol, tasks, and app re-entry.
                </Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  Message frequency varies. Message and data rates may apply.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="marketing-opt-in"
                checked={marketingOptIn}
                onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="marketing-opt-in" className="leading-5">
                  Also send me occasional product updates and new protocol launches.
                </Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  Optional. You can leave this off and still get your core reminder texts.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            Reply STOP to opt out. We use texts to get you back into the exact next step, not to turn this into a chat thread.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-6">
          <Button className="w-full" onClick={() => void handleSave()} disabled={isSaving || !transactionalOptIn}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              'Enable text reminders'
            )}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => void handleSkip()}>
            Skip for now
          </Button>
          <Link to={redirectDestination} className="text-xs text-muted-foreground underline underline-offset-4 text-center">
            Go straight to the app
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TextReminderSetup;
