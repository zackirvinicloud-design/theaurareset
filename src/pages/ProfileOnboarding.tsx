import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';
import { isEmailVerified, mergeRedirectParams, sanitizeRedirectPath } from '@/lib/auth-routing';
import { DIET_PATTERN_OPTIONS, useOnboardingProfile } from '@/hooks/useOnboardingProfile';
import { useSmsSubscription } from '@/hooks/useSmsSubscription';
import { calculateGutScore } from '@/lib/gut-score';
import { GutBrainLogo } from '@/components/brand/GutBrainLogo';

const TOTAL_STEPS = 7;
const ALL_HEALTH_FLAG_VALUE = '__all__';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

const HEALTH_FLAG_OPTIONS = [
  { value: 'Stubborn Bloating', label: 'Post-meal bloating and pressure', icon: '🎈' },
  { value: 'Brain Fog & Fatigue', label: 'Brain fog and low mental energy', icon: '🧠' },
  { value: 'Sugar & Carb Cravings', label: 'Strong sugar or carb cravings', icon: '🍩' },
  { value: 'Irregular Digestion (IBS)', label: 'Irregular digestion (IBS-type swings)', icon: '🩺' },
  { value: 'Stress-reactive digestion', label: 'Stress instantly affects my gut', icon: '⚡' },
] as const;

const DURATION_OPTIONS = [
  { value: 'A few weeks', label: 'Recent shift (last few weeks)' },
  { value: 'A few months', label: 'Building for a few months' },
  { value: 'Years', label: 'Long-standing pattern (1+ years)' },
] as const;

const BLOCKER_OPTIONS = [
  { value: 'Confusion', label: 'I do not know what to do in what order' },
  { value: 'Lack of time', label: 'Time and prep friction kills consistency' },
  { value: 'Losing motivation', label: 'I lose momentum when symptoms spike' },
  { value: 'Social events', label: 'Social life and weekends derail me' },
  { value: 'Forgetful', label: 'I get busy and forget key steps' },
] as const;

const GOAL_OPTIONS = [
  { value: 'Flat stomach', label: 'Calmer digestion and flatter stomach', icon: '✨' },
  { value: 'More energy', label: 'Clearer thinking and steadier energy', icon: '🔋' },
  { value: 'Stop cravings', label: 'Less food noise and better control', icon: '🛑' },
  { value: 'Total reset', label: 'Full 21-day reset done the right way', icon: '🔄' },
] as const;

const parseFoodPreferencesInput = (value: string) => {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const formatFoodPreferencesInput = (values: string[]) => values.join(', ');

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
  const [direction, setDirection] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { profile, isLoading, saveProfile, hasCompletedOnboarding } = useOnboardingProfile(userId);
  const { smsReady, isLoading: isSmsLoading } = useSmsSubscription(userId);

  const [healthFlags, setHealthFlags] = useState<string[]>([]);
  const [whyNow, setWhyNow] = useState('');
  const [primaryBlocker, setPrimaryBlocker] = useState('');
  const [protocolGoal, setProtocolGoal] = useState('');
  const [dietPattern, setDietPattern] = useState('');
  const [foodPreferencesInput, setFoodPreferencesInput] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!cancelled) {
        if (session && isEmailVerified(session.user)) {
          setUserId(session.user.id);
        }
        setIsBootstrapping(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [navigate, setupPath]);

  useEffect(() => {
    setProtocolGoal(profile.protocolGoal ?? '');
    setWhyNow(profile.whyNow ?? '');
    setPrimaryBlocker(profile.primaryBlocker ?? '');
    setDietPattern(profile.dietPattern ?? '');
    setFoodPreferencesInput(formatFoodPreferencesInput(profile.foodPreferences));
    setHealthFlags(profile.healthFlags?.length ? profile.healthFlags : []);
  }, [profile]);

  useEffect(() => {
    if (isBootstrapping || isLoading || isSmsLoading || !userId) {
      return;
    }

    if (hasCompletedOnboarding && !isAnalyzing) {
      if (smsReady) {
        navigate(redirectDestination, { replace: true });
        return;
      }
      const next = new URLSearchParams();
      next.set('redirect', redirectDestination);
      next.set('source', 'profile-onboarding');
      navigate(`/setup/text-reminders?${next.toString()}`, { replace: true });
    }
  }, [hasCompletedOnboarding, isAnalyzing, isBootstrapping, isLoading, isSmsLoading, navigate, redirectDestination, smsReady, userId]);

  const handleNext = () => {
    if (step === TOTAL_STEPS) {
      void handleComplete();
      return;
    }

    setDirection(1);
    setStep((current) => current + 1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSkip = () => {
    if (step === 1) {
      setHealthFlags([]);
    } else if (step === 2) {
      setWhyNow('');
    } else if (step === 3) {
      setPrimaryBlocker('');
    } else if (step === 4) {
      setProtocolGoal('');
    } else if (step === 5) {
      setDietPattern('');
    } else if (step === 6) {
      setFoodPreferencesInput('');
    } else if (step === TOTAL_STEPS) {
      setEmail('');
      void handleComplete();
      return;
    }

    setDirection(1);
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  };

  const selectOption = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
  };

  const toggleHealthFlag = (flag: string) => {
    if (flag === ALL_HEALTH_FLAG_VALUE) {
      setHealthFlags(HEALTH_FLAG_OPTIONS.map((option) => option.value));
      return;
    }
    setHealthFlags((prev) => prev.includes(flag) ? prev.filter((item) => item !== flag) : [...prev, flag]);
  };

  const handleComplete = async () => {
    const foodPreferences = parseFoodPreferencesInput(foodPreferencesInput);

    setIsAnalyzing(true);
    setDirection(1);
    setStep(TOTAL_STEPS + 1);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      if (userId) {
        await saveProfile({
          protocolGoal,
          whyNow,
          primaryBlocker,
          dietPattern,
          foodPreferences,
          healthFlags,
        }, {
          markComplete: true,
          entrySource: source,
        });

        toast({
          title: 'Setup complete',
          description: 'Your account setup is saved.',
        });

        if (smsReady) {
          navigate(redirectDestination, { replace: true });
          return;
        }

        const next = new URLSearchParams();
        next.set('redirect', redirectDestination);
        next.set('source', 'profile-onboarding');
        navigate(`/setup/text-reminders?${next.toString()}`, { replace: true });
      } else {
        localStorage.setItem('pending_onboarding_profile', JSON.stringify({
          firstName: '',
          protocolGoal,
          whyNow,
          primaryBlocker,
          dietPattern,
          foodPreferences,
          routineType: '',
          supportStyle: '',
          healthFlags,
          entrySource: source,
          email,
          gutHealthScore: calculateGutScore({
            healthFlags,
            whyNow: whyNow || null,
            protocolGoal: protocolGoal || null,
            primaryBlocker: primaryBlocker || null,
            dietPattern: dietPattern || null,
            foodPreferences,
          }),
        }));

        toast({
          title: 'Setup complete',
          description: 'Saving your setup and preparing your protocol.',
        });

        navigate(redirectDestination, { replace: true });
      }
    } catch (error) {
      setIsAnalyzing(false);
      setStep(TOTAL_STEPS);
      toast({
        title: 'Could not save your profile',
        description: getFriendlyAuthErrorMessage(error, 'Please try again in a moment.'),
        variant: 'destructive',
      });
    }
  };

  if (isBootstrapping || isLoading || isSmsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const SlideTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-6 md:mb-10 text-center leading-tight">
      {children}
    </h2>
  );

  const ChoiceButton = ({
    selected,
    onClick,
    label,
    icon = null,
  }: {
    selected: boolean;
    onClick: () => void;
    label: string;
    icon?: string | null;
  }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-5 md:p-6 rounded-2xl border-2 transition-all ${
        selected
          ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(currentcolor,0.3)]'
          : 'bg-[#121212] border-[#2A2A2A] hover:border-primary/50 text-white'
      }`}
    >
      <div className="flex items-center gap-4 text-left">
        {icon && <span className="text-2xl">{icon}</span>}
        <span className={`text-lg md:text-xl font-medium ${selected ? 'text-primary' : 'text-zinc-200'}`}>
          {label}
        </span>
      </div>
      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-primary bg-primary' : 'border-zinc-600'}`}>
        {selected && <Check className="h-4 w-4 text-black" strokeWidth={3} />}
      </div>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A1A12] via-black to-black flex flex-col justify-between overflow-hidden">
      {!isAnalyzing && (
        <div className="w-full h-1.5 bg-zinc-900 fixed top-0 z-50">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ ease: 'circOut', duration: 0.5 }}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6 w-full max-w-3xl mx-auto relative mt-12 md:mt-0">
        <div className="absolute top-2 left-1/2 z-20 -translate-x-1/2 rounded-full border border-primary/30 bg-black/60 px-3 py-1.5 backdrop-blur">
          <div className="flex items-center gap-2">
            <GutBrainLogo className="h-4 w-4 rounded-sm" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200">GutBrain Precision Audit</span>
          </div>
        </div>

        {!isAnalyzing && (
          <div className="absolute top-14 left-1/2 z-20 -translate-x-1/2 text-xs font-medium uppercase tracking-[0.15em] text-zinc-500">
            Question {step} of {TOTAL_STEPS}
          </div>
        )}

        <AnimatePresence initial={false} custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 overflow-y-auto"
            >
              <div className="min-h-full flex flex-col items-center justify-center p-6 py-24 mx-auto w-full max-w-3xl">
                <SlideTitle>What patterns are hitting your gut and brain the hardest right now?</SlideTitle>
                <p className="text-zinc-400 text-lg mb-8 text-center -mt-4">Select all that apply. This drives the core risk model.</p>
                <div className="w-full max-w-lg space-y-3">
                  {HEALTH_FLAG_OPTIONS.map((option) => (
                    <ChoiceButton
                      key={option.value}
                      selected={healthFlags.includes(option.value)}
                      onClick={() => toggleHealthFlag(option.value)}
                      label={option.label}
                      icon={option.icon}
                    />
                  ))}
                  <ChoiceButton
                    selected={false}
                    onClick={() => toggleHealthFlag(ALL_HEALTH_FLAG_VALUE)}
                    label="Most of these apply"
                    icon="🎯"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <SlideTitle>How long has this pattern been active?</SlideTitle>
              <div className="w-full max-w-lg space-y-3">
                {DURATION_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.value}
                    selected={whyNow === option.value}
                    onClick={() => selectOption(setWhyNow, option.value)}
                    label={option.label}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <SlideTitle>Where does your execution usually break down?</SlideTitle>
              <div className="w-full max-w-lg space-y-3">
                {BLOCKER_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.value}
                    selected={primaryBlocker === option.value}
                    onClick={() => selectOption(setPrimaryBlocker, option.value)}
                    label={option.label}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <SlideTitle>What outcome matters most in the next 21 days?</SlideTitle>
              <div className="w-full max-w-lg space-y-3">
                {GOAL_OPTIONS.map((option) => (
                  <ChoiceButton
                    key={option.value}
                    selected={protocolGoal === option.value}
                    onClick={() => selectOption(setProtocolGoal, option.value)}
                    label={option.label}
                    icon={option.icon}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 overflow-y-auto"
            >
              <div className="min-h-full flex flex-col items-center justify-center p-6 py-24 mx-auto w-full max-w-3xl">
                <SlideTitle>Which nutrition baseline fits you right now?</SlideTitle>
                <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DIET_PATTERN_OPTIONS.map((option) => (
                    <ChoiceButton
                      key={option}
                      selected={dietPattern === option}
                      onClick={() => selectOption(setDietPattern, option)}
                      label={option}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 overflow-y-auto"
            >
              <div className="min-h-full flex flex-col items-center justify-center p-6 py-24 mx-auto w-full max-w-3xl">
                <SlideTitle>Any allergies or absolute no-go foods?</SlideTitle>
                <p className="text-zinc-400 text-lg mb-8 text-center -mt-4 max-w-lg">
                  Optional, but high value. We use this to avoid bad recommendations and reduce compliance drop-off.
                </p>
                <textarea
                  value={foodPreferencesInput}
                  onChange={(e) => setFoodPreferencesInput(e.target.value)}
                  placeholder={'Examples:\nShellfish\nPeanuts\nNo pork'}
                  className="w-full max-w-lg min-h-[180px] bg-[#121212] border-2 border-[#2A2A2A] focus:border-primary focus:outline-none text-lg text-white p-4 rounded-2xl placeholder:text-zinc-600 transition-colors resize-none"
                />
              </div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div
              key="step7"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <SlideTitle>Where should we send your GutBrain analysis?</SlideTitle>
              <p className="text-zinc-400 text-lg mb-8 text-center -mt-4 max-w-lg">
                Enter your email to save your score, your constraints, and your personalized protocol path.
              </p>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                placeholder="you@example.com"
                className="w-full max-w-lg bg-transparent border-b-2 border-zinc-700 focus:border-primary focus:outline-none text-2xl md:text-3xl text-center text-white py-4 placeholder:text-zinc-700 transition-colors"
                autoComplete="email"
              />
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 border-t-4 border-r-4 border-primary rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-b-4 border-l-4 border-primary/40 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                <GutBrainLogo className="h-10 w-10 rounded-md animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Calculating your GutBrain score...</h2>
              <p className="text-zinc-400 text-lg">Cross-checking symptom load, timeline, behavior friction, and nutrition profile.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isAnalyzing && (
        <div className="w-full p-6 flex items-center justify-between z-10 bg-gradient-to-t from-black via-black/80 to-transparent fixed bottom-0">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-zinc-400 hover:text-white"
            >
              Skip
            </Button>
            <Button
              onClick={handleNext}
              className="rounded-full px-8 bg-white hover:bg-zinc-200 text-black font-semibold"
            >
              {step === TOTAL_STEPS ? 'Continue' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOnboarding;
