import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BellRing, Loader2, Smartphone } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';
import { isEmailVerified, mergeRedirectParams, sanitizeRedirectPath } from '@/lib/auth-routing';
import { useNotificationSetup } from '@/hooks/useNotificationSetup';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { ensurePushSubscription } from '@/lib/webPush';

const NotificationSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = sanitizeRedirectPath(searchParams.get('redirect')) ?? '/protocol';
  const source = searchParams.get('source') ?? 'notification_setup';
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
    return `/setup/notifications?${next.toString()}`;
  }, [paymentId, provider, redirectPath, source]);

  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const {
    permission,
    isSupported,
    isIOS,
    isEnabled,
    needsIosInstall,
    canRequestPermission,
    requestPermission,
    refresh,
  } = useNotificationSetup();
  const {
    pushReady,
    saveSubscription,
  } = usePushSubscription(userId);

  const persistSetupOutcome = useCallback(async (patch: Record<string, unknown>) => {
    if (!userId) {
      return;
    }

    await supabase
      .from('user_onboarding_profiles')
      .upsert({
        user_id: userId,
        push_setup_source: source,
        ...patch,
      }, { onConflict: 'user_id' });
  }, [source, userId]);

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
    if (!isBootstrapping && isEnabled && pushReady) {
      navigate(redirectDestination, { replace: true });
    }
  }, [isBootstrapping, isEnabled, navigate, pushReady, redirectDestination]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    void persistSetupOutcome({
      push_setup_seen_at: new Date().toISOString(),
      push_permission_status: permission,
    });
  }, [permission, persistSetupOutcome, userId]);

  const handleEnable = async () => {
    try {
      setIsRequesting(true);
      const next = await requestPermission();
      refresh();

      if (next === 'granted') {
        const vapidPublicKey = (import.meta.env.VITE_WEB_PUSH_VAPID_PUBLIC_KEY ?? '').trim();
        if (!vapidPublicKey) {
          throw new Error('Push is not configured yet (missing VAPID key).');
        }

        const subscriptionPayload = await ensurePushSubscription(vapidPublicKey);
        const endpoint = subscriptionPayload.endpoint ?? '';
        const keys = subscriptionPayload.keys ?? {};

        await saveSubscription({
          endpoint,
          p256dh: keys.p256dh ?? '',
          auth: keys.auth ?? '',
          source,
        });

        await persistSetupOutcome({
          push_setup_completed_at: new Date().toISOString(),
          push_setup_skipped_at: null,
          push_permission_status: 'granted',
          preferred_reminder_channel: 'push',
        });

        toast({
          title: 'Push reminders are on',
          description: 'You will now receive closed-app reminder pings on this device.',
        });
        navigate(redirectDestination, { replace: true });
        return;
      }

      if (next === 'denied') {
        await persistSetupOutcome({
          push_permission_status: 'denied',
        });

        toast({
          title: 'Notifications are blocked',
          description: 'Turn them on in browser settings when you are ready.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Could not enable notifications',
        description: getFriendlyAuthErrorMessage(error, 'Please try again in a moment.'),
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = async () => {
    await persistSetupOutcome({
      push_setup_skipped_at: new Date().toISOString(),
      push_permission_status: permission,
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
                Preparing your reminder setup.
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
            <BellRing className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Turn on push reminders</CardTitle>
          <CardDescription className="mx-auto max-w-md text-base leading-7">
            This makes reminders feel like a real app. You get closed-app pings on this device when reminders are due.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isIOS && needsIosInstall ? (
            <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-4 text-left">
              <p className="text-sm font-medium text-foreground">
                iPhone setup (one time)
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                1) Tap Share in Safari. 2) Tap Add to Home Screen. 3) Open the app from your Home Screen, then come back here to enable notifications.
              </p>
              <Button variant="outline" className="mt-3 w-full" onClick={refresh}>
                I added it to Home Screen
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-4 text-left">
              <p className="text-sm font-medium text-foreground">
                Notification status: {isSupported ? permission : 'unsupported'}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Keep this on if you want true phone pings right when your task is due.
              </p>
              {permission === 'denied' && (
                <p className="mt-2 text-xs leading-5 text-destructive">
                  Notifications are currently blocked in browser settings.
                </p>
              )}
            </div>
          )}

          {!isSupported && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-xs leading-5 text-destructive">
              This browser does not support notifications. Switch to Safari or Chrome on your phone.
            </div>
          )}

          <div className="rounded-2xl border border-primary/25 bg-primary/8 px-4 py-4 text-left">
            <p className="text-sm font-medium text-foreground">Skipping means more friction later.</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              If this stays off, you will need to remember timing yourself and you will miss one of the strongest parts of the app.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-6">
          <Button
            className="w-full"
            onClick={() => void handleEnable()}
            disabled={!canRequestPermission || isRequesting}
          >
            {isRequesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enabling
              </>
            ) : (
              <>
                <Smartphone className="mr-2 h-4 w-4" />
                Enable push reminders
              </>
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

export default NotificationSetup;
