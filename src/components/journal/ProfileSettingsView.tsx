import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, MessageSquareText, Settings2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { SmsSubscription } from '@/hooks/useSmsSubscription';
import {
  DIET_PATTERN_OPTIONS,
  ROUTINE_TYPE_OPTIONS,
  SUPPORT_STYLE_OPTIONS,
  formatProfileListInput,
  isOnboardingProfileComplete,
  parseProfileListInput,
  type UserOnboardingProfile,
} from '@/hooks/useOnboardingProfile';
import { cn } from '@/lib/utils';

interface ProfileSettingsViewProps {
  profile: UserOnboardingProfile;
  isProfileLoading?: boolean;
  isProfileSaving?: boolean;
  subscription: SmsSubscription | null;
  isSmsLoading?: boolean;
  isSmsSaving?: boolean;
  onSaveProfile: (updates: Partial<UserOnboardingProfile>, options?: { markComplete?: boolean; entrySource?: string }) => Promise<void> | void;
  onSaveSms: (input: {
    phone: string;
    transactionalOptIn: boolean;
    marketingOptIn: boolean;
    consentSource?: string;
  }) => Promise<void> | void;
  onBack: () => void;
}

export const ProfileSettingsView = ({
  profile,
  isProfileLoading = false,
  isProfileSaving = false,
  subscription,
  isSmsLoading = false,
  isSmsSaving = false,
  onSaveProfile,
  onSaveSms,
  onBack,
}: ProfileSettingsViewProps) => {
  const [firstName, setFirstName] = useState('');
  const [protocolGoal, setProtocolGoal] = useState('');
  const [whyNow, setWhyNow] = useState('');
  const [primaryBlocker, setPrimaryBlocker] = useState('');
  const [dietPattern, setDietPattern] = useState('');
  const [foodPreferencesText, setFoodPreferencesText] = useState('');
  const [routineType, setRoutineType] = useState('');
  const [supportStyle, setSupportStyle] = useState('');
  const [healthFocusText, setHealthFocusText] = useState('');
  const [phone, setPhone] = useState('');
  const [transactionalOptIn, setTransactionalOptIn] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

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
    setPhone(subscription?.phoneE164 ?? '');
    setTransactionalOptIn(Boolean(subscription?.transactionalOptIn));
    setMarketingOptIn(Boolean(subscription?.marketingOptIn));
  }, [subscription]);

  const completionPreview = useMemo<UserOnboardingProfile>(() => ({
    ...profile,
    firstName: firstName.trim() || null,
    protocolGoal: protocolGoal.trim() || null,
    whyNow: whyNow.trim() || null,
    primaryBlocker: primaryBlocker.trim() || null,
    dietPattern: dietPattern.trim() || null,
    routineType: routineType.trim() || null,
    supportStyle: supportStyle.trim() || null,
    foodPreferences: parseProfileListInput(foodPreferencesText),
    healthFlags: parseProfileListInput(healthFocusText),
  }), [
    dietPattern,
    firstName,
    foodPreferencesText,
    healthFocusText,
    primaryBlocker,
    profile,
    protocolGoal,
    routineType,
    supportStyle,
    whyNow,
  ]);

  const handleSaveProfile = async () => {
    await onSaveProfile({
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
      markComplete: isOnboardingProfileComplete(completionPreview),
      entrySource: 'settings',
    });
  };

  const handleSaveSms = async () => {
    await onSaveSms({
      phone,
      transactionalOptIn,
      marketingOptIn,
      consentSource: 'settings',
    });
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border/50 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">Edit profile</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Coach uses this to tailor meals, tone, shopping, and support to you.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="mx-auto w-full max-w-3xl space-y-4 pb-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" />
                Coach profile
              </CardTitle>
              <CardDescription>
                {profile.completedAt
                  ? 'Your core personalization is saved and active.'
                  : 'Finish the core details once so Coach can stop sounding generic.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                <div className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  profile.completedAt
                    ? 'border-primary/25 bg-primary/10 text-primary'
                    : 'border-border/60 bg-background/70 text-muted-foreground',
                )}>
                  {profile.completedAt ? 'Personalization active' : 'Profile incomplete'}
                </div>
                {completionPreview.dietPattern && (
                  <div className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                    {completionPreview.dietPattern}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">About you</CardTitle>
              <CardDescription>
                Keep this practical. Coach should know your name, why you care, how you eat, and what trips you up.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {(isProfileLoading) ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading profile...
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="settings-first-name">First name</Label>
                      <Input
                        id="settings-first-name"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="What should Coach call you?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-goal">Main goal</Label>
                      <Input
                        id="settings-goal"
                        value={protocolGoal}
                        onChange={(event) => setProtocolGoal(event.target.value)}
                        placeholder="Bloating, energy, skin, brain fog..."
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="settings-why-now">Why now</Label>
                      <Textarea
                        id="settings-why-now"
                        value={whyNow}
                        onChange={(event) => setWhyNow(event.target.value)}
                        placeholder="What made this feel urgent enough to finally do?"
                        className="min-h-[110px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-blocker">Biggest blocker</Label>
                      <Textarea
                        id="settings-blocker"
                        value={primaryBlocker}
                        onChange={(event) => setPrimaryBlocker(event.target.value)}
                        placeholder="Cravings, social plans, confusion, schedule chaos..."
                        className="min-h-[110px]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Diet pattern</Label>
                      <Select value={dietPattern} onValueChange={setDietPattern}>
                        <SelectTrigger>
                          <SelectValue placeholder="How do you eat right now?" />
                        </SelectTrigger>
                        <SelectContent>
                          {DIET_PATTERN_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Routine type</Label>
                      <Select value={routineType} onValueChange={setRoutineType}>
                        <SelectTrigger>
                          <SelectValue placeholder="What kind of schedule are we working with?" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROUTINE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Support style</Label>
                      <Select value={supportStyle} onValueChange={setSupportStyle}>
                        <SelectTrigger>
                          <SelectValue placeholder="How should Coach talk to you?" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORT_STYLE_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-health-focus">What do you want help with most?</Label>
                      <Textarea
                        id="settings-health-focus"
                        value={healthFocusText}
                        onChange={(event) => setHealthFocusText(event.target.value)}
                        placeholder="Comma-separated: bloating, brain fog, skin, cravings..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="settings-food-preferences">Food preferences / hard no&apos;s</Label>
                    <Textarea
                      id="settings-food-preferences"
                      value={foodPreferencesText}
                      onChange={(event) => setFoodPreferencesText(event.target.value)}
                      placeholder="Comma-separated: no eggs, no fish, quick breakfasts, meal prep only..."
                      className="min-h-[90px]"
                    />
                  </div>

                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => void handleSaveProfile()}
                    disabled={isProfileSaving}
                  >
                    {isProfileSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving profile
                      </>
                    ) : 'Save profile'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquareText className="h-4 w-4 text-primary" />
                Text reminders
              </CardTitle>
              <CardDescription>
                Phone lives here. Keep this separate from the Coach profile so reminder delivery stays clean.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSmsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading text reminder settings...
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="settings-phone">Mobile phone</Label>
                    <Input
                      id="settings-phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="(555) 555-5555"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="settings-transactional"
                      checked={transactionalOptIn}
                      onCheckedChange={(value) => setTransactionalOptIn(Boolean(value))}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="settings-transactional" className="text-sm font-medium text-foreground">
                        Turn on cleanse reminder texts
                      </Label>
                      <p className="text-xs leading-5 text-muted-foreground">
                        These are the functional texts: day-start cues, rescue nudges, shopping reminders, and step reminders.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="settings-marketing"
                      checked={marketingOptIn}
                      onCheckedChange={(value) => setMarketingOptIn(Boolean(value))}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <Label htmlFor="settings-marketing" className="text-sm font-medium text-foreground">
                        I also want future launches and offers
                      </Label>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Optional. Leave this off if you only want protocol texts.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => void handleSaveSms()}
                    disabled={isSmsSaving || !phone.trim() || !transactionalOptIn}
                  >
                    {isSmsSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving texts
                      </>
                    ) : subscription ? 'Update text reminders' : 'Turn on text reminders'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
