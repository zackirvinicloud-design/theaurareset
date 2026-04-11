import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';
import { isEmailVerified, mergeRedirectParams, sanitizeRedirectPath } from '@/lib/auth-routing';
import {
  DIET_PATTERN_OPTIONS,
  ROUTINE_TYPE_OPTIONS,
  SUPPORT_STYLE_OPTIONS,
  formatProfileListInput,
  parseProfileListInput,
  useOnboardingProfile,
} from '@/hooks/useOnboardingProfile';
import { useSmsSubscription } from '@/hooks/useSmsSubscription';

const TOTAL_STEPS = 5;

const ProfileOnboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = sanitizeRedirectPath(searchParams.get('redirect')) ?? '/protocol';
  const source = searchParams.get('source') ?? 'profile_onboarding';
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
    return `/setup/profile?${next.toString()}`;
  }, [paymentId, provider, redirectPath, source]);

  const [userId, setUserId] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [step, setStep] = useState(1);

  const { profile, isLoading, isSaving, saveProfile, hasCompletedOnboarding } = useOnboardingProfile(userId);
  const { smsReady, isLoading: isSmsLoading } = useSmsSubscription(userId);

  const [firstName, setFirstName] = useState('');
  const [protocolGoal, setProtocolGoal] = useState('');
  const [whyNow, setWhyNow] = useState('');
  const [primaryBlocker, setPrimaryBlocker] = useState('');
  const [dietPattern, setDietPattern] = useState('');
  const [foodPreferencesText, setFoodPreferencesText] = useState('');
  const [routineType, setRoutineType] = useState('');
  const [supportStyle, setSupportStyle] = useState('');
  const [healthFocusText, setHealthFocusText] = useState('');

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
    setFirstName(profile.firstName ?? '');
    setProtocolGoal(profile.protocolGoal ?? '');
    setWhyNow(profile.whyNow ?? '');
    setPrimaryBlocker(profile.primaryBlocker ?? '');
    setDietPattern(profile.dietPattern ?? '');
    setFoodPreferencesText(formatProfileListInput(profile.foodPreferences));
    setRoutineType(profile.routineType ?? '');
    setSupportStyle(profile.supportStyle ?? '');
    setHealthFocusText(formatProfileListInput(profile.healthFlags));
  }, [profile]);

  useEffect(() => {
    if (isBootstrapping || isLoading || isSmsLoading || !userId) {
      return;
    }

    if (hasCompletedOnboarding) {
      if (smsReady) {
        navigate(redirectDestination, { replace: true });
        return;
      }

      const next = new URLSearchParams();
      next.set('redirect', redirectDestination);
      next.set('source', 'profile-onboarding');
      navigate(`/setup/text-reminders?${next.toString()}`, { replace: true });
    }
  }, [hasCompletedOnboarding, isBootstrapping, isLoading, isSmsLoading, navigate, redirectDestination, smsReady, userId]);

  const canContinue = useMemo(() => {
    if (step === 1) {
      return Boolean(firstName.trim() && protocolGoal.trim());
    }
    if (step === 2) {
      return Boolean(whyNow.trim() && primaryBlocker.trim());
    }
    if (step === 3) {
      return Boolean(dietPattern.trim());
    }
    if (step === 4) {
      return Boolean(routineType.trim() && supportStyle.trim());
    }
    return true;
  }, [dietPattern, firstName, primaryBlocker, protocolGoal, routineType, step, supportStyle, whyNow]);

  const handleNext = () => {
    if (!canContinue) {
      toast({
        title: 'One more detail',
        description: 'Fill in this step so Coach has enough context to personalize well.',
      });
      return;
    }

    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleComplete = async () => {
    try {
      await saveProfile({
        firstName,
        protocolGoal,
        whyNow,
        primaryBlocker,
        dietPattern,
        foodPreferences: parseProfileListInput(foodPreferencesText),
        routineType,
        supportStyle,
        healthFlags: parseProfileListInput(healthFocusText),
      }, {
        markComplete: true,
        entrySource: source,
      });

      toast({
        title: 'Coach is calibrated',
        description: 'Next up: optional text reminders so re-entry feels effortless.',
      });

      if (smsReady) {
        navigate(redirectDestination, { replace: true });
        return;
      }

      const next = new URLSearchParams();
      next.set('redirect', redirectDestination);
      next.set('source', 'profile-onboarding');
      navigate(`/setup/text-reminders?${next.toString()}`, { replace: true });
    } catch (error) {
      toast({
        title: 'Could not save your profile',
        description: getFriendlyAuthErrorMessage(
          error,
          'Please try again in a moment.',
        ),
        variant: 'destructive',
      });
    }
  };

  if (isBootstrapping || isLoading || isSmsLoading) {
    return (
      <div className="app-shell-dark min-h-screen flex items-center justify-center p-4">
        <Card className="app-panel-dark w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <p className="text-lg font-semibold text-foreground">Loading</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Getting your personalization setup ready.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-shell-dark min-h-screen flex items-center justify-center p-4">
      <Card className="app-panel-dark w-full max-w-2xl border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/25 bg-primary/15">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Make Coach feel personal</CardTitle>
          <CardDescription className="mx-auto max-w-xl text-base leading-7">
            One quick setup so the cleanse stops feeling generic. We&apos;ll use this to tailor meals, tone, shopping, and support around you.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full ${index + 1 <= step ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step 1</p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-foreground">Who are you and what are you trying to fix?</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="onboarding-first-name">First name</Label>
                  <Input
                    id="onboarding-first-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="What should Coach call you?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onboarding-goal">Main goal</Label>
                  <Input
                    id="onboarding-goal"
                    value={protocolGoal}
                    onChange={(event) => setProtocolGoal(event.target.value)}
                    placeholder="Bloating, energy, skin, cravings..."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step 2</p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-foreground">What made this urgent, and what usually knocks you off?</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="onboarding-why-now">Why now</Label>
                  <Textarea
                    id="onboarding-why-now"
                    value={whyNow}
                    onChange={(event) => setWhyNow(event.target.value)}
                    placeholder="What finally made you want structure?"
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onboarding-blocker">Biggest blocker</Label>
                  <Textarea
                    id="onboarding-blocker"
                    value={primaryBlocker}
                    onChange={(event) => setPrimaryBlocker(event.target.value)}
                    placeholder="Cravings, confusion, social pressure, schedule chaos..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step 3</p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-foreground">How do you eat, and what should Coach avoid?</h3>
              </div>
              <div className="space-y-2">
                <Label>Diet pattern</Label>
                <Select value={dietPattern} onValueChange={setDietPattern}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick the closest fit" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIET_PATTERN_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboarding-food-preferences">Food preferences / hard no&apos;s</Label>
                <Textarea
                  id="onboarding-food-preferences"
                  value={foodPreferencesText}
                  onChange={(event) => setFoodPreferencesText(event.target.value)}
                  placeholder="Comma-separated: no eggs, no fish, fast breakfasts, meal prep only..."
                  className="min-h-[110px]"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step 4</p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-foreground">What kind of schedule are we working around?</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Routine type</Label>
                  <Select value={routineType} onValueChange={setRoutineType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your reality" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROUTINE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Support style</Label>
                  <Select value={supportStyle} onValueChange={setSupportStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="How should Coach push you?" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORT_STYLE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step 5</p>
                <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-foreground">What do you most want this cleanse to help?</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="onboarding-health-focus">Health focus</Label>
                <Textarea
                  id="onboarding-health-focus"
                  value={healthFocusText}
                  onChange={(event) => setHealthFocusText(event.target.value)}
                  placeholder="Comma-separated: bloating, brain fog, fatigue, skin, cravings..."
                  className="min-h-[120px]"
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  This helps Coach frame food, troubleshooting, and encouragement around what matters most to you.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <div className="border-t border-border/60 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1 || isSaving}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button onClick={handleNext} disabled={!canContinue || isSaving}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => void handleComplete()} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : 'Save and continue'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileOnboarding;
