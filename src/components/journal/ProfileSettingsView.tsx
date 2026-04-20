import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BellRing, Loader2, Settings2, ShieldAlert, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
import { GutBrainLogo } from '@/components/brand/GutBrainLogo';

interface ProfileSettingsViewProps {
  profile: UserOnboardingProfile;
  isProfileLoading?: boolean;
  isProfileSaving?: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  notificationNeedsInstall?: boolean;
  pushReady?: boolean;
  onSaveProfile: (updates: Partial<UserOnboardingProfile>, options?: { markComplete?: boolean; entrySource?: string }) => Promise<void> | void;
  onOpenNotificationsSetup: () => void;
  onDeleteAccount: () => Promise<void> | void;
  isDeletingAccount?: boolean;
  onResetCleanse: () => Promise<void> | void;
  isResettingCleanse?: boolean;
  onBack: () => void;
}

export const ProfileSettingsView = ({
  profile,
  isProfileLoading = false,
  isProfileSaving = false,
  notificationPermission,
  notificationNeedsInstall = false,
  pushReady = false,
  onSaveProfile,
  onOpenNotificationsSetup,
  onDeleteAccount,
  isDeletingAccount = false,
  onResetCleanse,
  isResettingCleanse = false,
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
  const [resetDialogStage, setResetDialogStage] = useState<1 | 2 | null>(null);
  const [resetConfirmationText, setResetConfirmationText] = useState('');

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

  const closeResetFlow = () => {
    setResetDialogStage(null);
    setResetConfirmationText('');
  };

  const resetReady = resetConfirmationText.trim().toLowerCase() === 'reset';

  const handleResetConfirm = async () => {
    if (!resetReady || isResettingCleanse) {
      return;
    }

    await onResetCleanse();
    closeResetFlow();
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
              GutBrain uses this to tailor meals, tone, shopping, and support to you.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <div className="mx-auto w-full max-w-3xl space-y-4 pb-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <GutBrainLogo className="h-4 w-4 rounded-sm" />
                GutBrain profile
              </CardTitle>
              <CardDescription>
                {profile.completedAt
                  ? 'Your core personalization is saved and active.'
                  : 'Finish the core details once so GutBrain can stop sounding generic.'}
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
                Keep this practical. GutBrain should know your name, why you care, how you eat, and what trips you up.
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
                        placeholder="What should GutBrain call you?"
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
                          <SelectValue placeholder="How should GutBrain talk to you?" />
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
                <BellRing className="h-4 w-4 text-primary" />
                Push reminders
              </CardTitle>
              <CardDescription>
                Turn this on if you want real phone taps at reminder time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-3 text-xs leading-5 text-muted-foreground">
                Status: {notificationPermission === 'granted' ? 'enabled' : notificationPermission === 'denied' ? 'blocked' : notificationPermission}
                {pushReady && (
                  <p className="mt-2 text-primary">This device is subscribed for closed-app push reminders.</p>
                )}
                {notificationNeedsInstall && (
                  <p className="mt-2">
                    iPhone requires Add to Home Screen first, then notification permission.
                  </p>
                )}
                {notificationPermission !== 'granted' && (
                  <p className="mt-2">
                    If this stays off, you will miss one of the easiest high-value features in the app.
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={onOpenNotificationsSetup}
              >
                {notificationPermission === 'granted' ? 'Manage push setup' : 'Turn on push reminders'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Legal and privacy</CardTitle>
              <CardDescription>
                These pages explain what data is stored, how reminders work, and how to remove your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm">
                <Link to="/legal/privacy" className="text-primary hover:underline">Privacy policy</Link>
                <Link to="/legal/terms" className="text-primary hover:underline">Terms of service</Link>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/70 px-3 py-3 text-xs leading-5 text-muted-foreground">
                Delete account permanently removes your saved profile, checklist progress, reminders, journal history, and logged check-ins.
              </div>
              <Button
                variant="outline"
                className="w-full justify-center border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive sm:w-auto"
                onClick={() => void onDeleteAccount()}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting account
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete account
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center border-amber-300/50 text-amber-700 hover:bg-amber-50 hover:text-amber-900 sm:w-auto"
                onClick={() => setResetDialogStage(1)}
                disabled={isResettingCleanse}
              >
                {isResettingCleanse ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting cleanse...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Reset cleanse to Day 1
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={resetDialogStage === 1} onOpenChange={(open) => {
        if (!open) {
          closeResetFlow();
        }
      }}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset cleanse?</AlertDialogTitle>
            <AlertDialogDescription>
              This will return your protocol to Day 0 and remove saved progress, checks, reminders, check-ins, shopping changes,
              recipes, and chat history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeResetFlow}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setResetDialogStage(2)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetDialogStage === 2} onOpenChange={(open) => {
        if (!open) {
          closeResetFlow();
        }
      }}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Final confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Type <span className="font-medium">RESET</span> to remove all progress and start Day 1 from scratch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 pb-1">
            <Input
              autoFocus
              value={resetConfirmationText}
              onChange={(event) => setResetConfirmationText(event.target.value)}
              placeholder="Type RESET"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeResetFlow}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!resetReady || isResettingCleanse}
              onClick={() => void handleResetConfirm()}
            >
              {isResettingCleanse ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : 'Reset cleanse'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
