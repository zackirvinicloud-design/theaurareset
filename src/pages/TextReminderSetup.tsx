import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, MessageSquareText } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { getFriendlyAuthErrorMessage } from "@/lib/auth-errors";
import { isEmailVerified, mergeRedirectParams, sanitizeRedirectPath } from "@/lib/auth-routing";
import { useSmsSubscription } from "@/hooks/useSmsSubscription";

const TextReminderSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = sanitizeRedirectPath(searchParams.get("redirect")) ?? "/protocol";
  const source = searchParams.get("source") ?? "text_reminder_setup";
  const provider = searchParams.get("provider");
  const paymentId = searchParams.get("payment_id");
  const redirectDestination = mergeRedirectParams(redirectPath, {
    provider,
    payment_id: paymentId,
  }) ?? "/protocol";
  const setupPath = useMemo(() => {
    const next = new URLSearchParams();
    next.set("redirect", redirectPath);
    next.set("source", source);
    if (provider) {
      next.set("provider", provider);
    }
    if (paymentId) {
      next.set("payment_id", paymentId);
    }
    return `/setup/text-reminders?${next.toString()}`;
  }, [paymentId, provider, redirectPath, source]);

  const [userId, setUserId] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const { subscription, isLoading, isSaving, saveSubscription } = useSmsSubscription(userId);
  const hasTrackedViewRef = useRef(false);

  const [phone, setPhone] = useState("");
  const [transactionalOptIn, setTransactionalOptIn] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

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
    if (!userId || hasTrackedViewRef.current) {
      return;
    }

    hasTrackedViewRef.current = true;

    const seenAt = new Date().toISOString();

    void supabase
      .from("user_onboarding_profiles")
      .upsert({
        user_id: userId,
        sms_setup_source: source,
        sms_setup_seen_at: seenAt,
      }, { onConflict: "user_id" });
  }, [source, userId]);

  useEffect(() => {
    if (!subscription) {
      return;
    }

    setPhone(subscription.phoneE164);
    setTransactionalOptIn(subscription.transactionalOptIn);
    setMarketingOptIn(subscription.marketingOptIn);
  }, [subscription]);

  const canSave = useMemo(() => phone.trim().length > 0 && transactionalOptIn, [phone, transactionalOptIn]);

  const persistSetupOutcome = async (patch: Record<string, unknown>) => {
    if (!userId) {
      return;
    }

    await supabase
      .from("user_onboarding_profiles")
      .upsert({
        user_id: userId,
        sms_setup_source: source,
        ...patch,
      }, { onConflict: "user_id" });
  };

  const handleContinue = async () => {
    try {
      if (!subscription?.transactionalOptIn) {
        await persistSetupOutcome({
          sms_setup_skipped_at: new Date().toISOString(),
          preferred_reminder_channel: "local",
        });
      }
    } catch (error) {
      console.error("Failed to persist SMS skip state:", error);
    }

    navigate(redirectDestination, { replace: true });
  };

  const handleSave = async () => {
    try {
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
        preferred_reminder_channel: "sms",
      });

      toast({
        title: "Text reminders are on",
        description: "We'll text only when it helps you get back into the right step.",
      });

      navigate(redirectDestination, { replace: true });
    } catch (error) {
      toast({
        title: "Could not save your phone number",
        description: getFriendlyAuthErrorMessage(
          error,
          "Double-check the phone number and try again.",
        ),
        variant: "destructive",
      });
    }
  };

  if (isBootstrapping || isLoading) {
    return (
      <div className="app-shell-dark min-h-screen flex items-center justify-center p-4">
        <Card className="app-panel-dark w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <p className="text-lg font-semibold text-foreground">Loading</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Getting your reminder setup ready.
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
            Keep the app as your command center, then let text reminders pull you back into the exact step when the day gets messy.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile phone</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <p className="text-xs leading-5 text-muted-foreground">
              US-first for now. We only use this for cleanse reminders and rescue nudges.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-4 space-y-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="transactional-opt-in"
                checked={transactionalOptIn}
                onCheckedChange={(value) => setTransactionalOptIn(Boolean(value))}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="transactional-opt-in" className="text-sm font-medium text-foreground">
                  I agree to receive cleanse reminders by text.
                </Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  Transactional only: today's plan, missed-day rescue, shopping prompts, and symptom tracker nudges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="marketing-opt-in"
                checked={marketingOptIn}
                onCheckedChange={(value) => setMarketingOptIn(Boolean(value))}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label htmlFor="marketing-opt-in" className="text-sm font-medium text-foreground">
                  I also want launch drops and future offers by text.
                </Label>
                <p className="text-xs leading-5 text-muted-foreground">
                  Optional. Keep this off if you only want your protocol texts.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4">
            <p className="text-sm font-medium text-foreground">
              This does not turn Coach into an SMS chatbot.
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Text is just the re-entry layer. When you tap through, the app opens the exact surface you need.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-6">
          <Button className="w-full" disabled={!canSave || isSaving} onClick={() => void handleSave()}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save and continue"
            )}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => void handleContinue()}>
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
