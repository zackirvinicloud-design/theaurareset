import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Check, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';
import { isEmailVerified, mergeRedirectParams, sanitizeRedirectPath } from '@/lib/auth-routing';
import {
  DIET_PATTERN_OPTIONS,
  ROUTINE_TYPE_OPTIONS,
  SUPPORT_STYLE_OPTIONS,
  useOnboardingProfile,
} from '@/hooks/useOnboardingProfile';
import { useSmsSubscription } from '@/hooks/useSmsSubscription';
import { calculateGutScore } from '@/lib/gut-score';

const TOTAL_STEPS = 9;

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

  const { profile, isLoading, isSaving, saveProfile, hasCompletedOnboarding } = useOnboardingProfile(userId);
  const { smsReady, isLoading: isSmsLoading } = useSmsSubscription(userId);

  const [firstName, setFirstName] = useState('');
  const [healthFlags, setHealthFlags] = useState<string[]>([]);
  const [whyNow, setWhyNow] = useState('');
  const [protocolGoal, setProtocolGoal] = useState('');
  const [primaryBlocker, setPrimaryBlocker] = useState('');
  const [dietPattern, setDietPattern] = useState('');
  const [routineType, setRoutineType] = useState('');
  const [supportStyle, setSupportStyle] = useState('');
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
    setFirstName(profile.firstName ?? '');
    setProtocolGoal(profile.protocolGoal ?? '');
    setWhyNow(profile.whyNow ?? '');
    setPrimaryBlocker(profile.primaryBlocker ?? '');
    setDietPattern(profile.dietPattern ?? '');
    setRoutineType(profile.routineType ?? '');
    setSupportStyle(profile.supportStyle ?? '');
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
    if (step === 1 && !firstName.trim()) return;
    if (step === 2 && healthFlags.length === 0) return;
    if (step === 3 && !whyNow) return;
    if (step === 4 && !protocolGoal) return;
    if (step === 5 && !primaryBlocker) return;
    if (step === 6 && !dietPattern) return;
    if (step === 7 && !routineType) return;
    if (step === 8 && !supportStyle) return;

    if (step === TOTAL_STEPS) {
      if (!email.trim()) return;
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

  const selectOption = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
  };

  const toggleHealthFlag = (flag: string) => {
    if (flag === 'All of the above') {
      setHealthFlags(['Stubborn Bloating', 'Brain Fog & Fatigue', 'Sugar & Carb Cravings', 'Irregular Digestion (IBS)']);
      return;
    }
    setHealthFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]);
  };

  const handleComplete = async () => {
    setIsAnalyzing(true);
    setDirection(1);
    setStep(10); // Show analyzing screen

    try {
      // Fake delay for "Analysis" tension
      await new Promise(resolve => setTimeout(resolve, 2500));

      if (userId) {
        await saveProfile({
          firstName,
          protocolGoal,
          whyNow,
          primaryBlocker,
          dietPattern,
          foodPreferences: [], // Optional
          routineType,
          supportStyle,
          healthFlags,
        }, {
          markComplete: true,
          entrySource: source,
        });

        toast({
          title: 'Analysis Complete',
          description: 'You are a strong candidate for a protocol reset.',
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
          firstName,
          protocolGoal,
          whyNow,
          primaryBlocker,
          dietPattern,
          foodPreferences: [],
          routineType,
          supportStyle,
          healthFlags,
          entrySource: source,
          email,
          gutHealthScore: calculateGutScore({ healthFlags, primaryBlocker, dietPattern, routineType }),
        }));
        
        toast({
          title: 'Analysis Complete',
          description: 'Generating your customized roadmap...',
        });
        
        navigate(redirectDestination, { replace: true });
      }
    } catch (error) {
      setIsAnalyzing(false);
      setStep(9);
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

  // --- UI Components ---
  const SlideTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-[-0.03em] mb-6 md:mb-10 text-center leading-tight">
      {children}
    </h2>
  );

  const ChoiceButton = ({ 
    selected, 
    onClick, 
    label, 
    icon = null 
  }: { 
    selected: boolean; 
    onClick: () => void; 
    label: string; 
    icon?: string | null 
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
      
      {/* Progress Bar Header */}
      {!isAnalyzing && (
        <div className="w-full h-1.5 bg-zinc-900 fixed top-0 z-50">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ ease: "circOut", duration: 0.5 }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-6 w-full max-w-3xl mx-auto relative mt-12 md:mt-0">
        <AnimatePresence initial={false} custom={direction}>
          
          {/* SLIDE 1: Name */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <SlideTitle>First, what should we call you?</SlideTitle>
              <input
                type="text"
                autoFocus
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                placeholder="Enter your first name..."
                className="w-full max-w-lg bg-transparent border-b-2 border-zinc-700 focus:border-primary focus:outline-none text-4xl md:text-5xl text-center text-white py-4 placeholder:text-zinc-700 transition-colors"
                autoComplete="off"
              />
            </motion.div>
          )}

          {/* SLIDE 2: Symptoms */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 overflow-y-auto"
            >
              <div className="min-h-full flex flex-col items-center justify-center p-6 py-24 mx-auto w-full max-w-3xl">
                <SlideTitle>What are you experiencing?</SlideTitle>
                <p className="text-zinc-400 text-lg mb-8 text-center -mt-4">Select all that apply.</p>
                <div className="w-full max-w-lg space-y-3">
                  <ChoiceButton selected={healthFlags.includes('Stubborn Bloating')} onClick={() => toggleHealthFlag('Stubborn Bloating')} label="Stubborn Bloating & Gas" icon="🎈" />
                  <ChoiceButton selected={healthFlags.includes('Brain Fog & Fatigue')} onClick={() => toggleHealthFlag('Brain Fog & Fatigue')} label="Brain Fog & Fatigue" icon="🧠" />
                  <ChoiceButton selected={healthFlags.includes('Sugar & Carb Cravings')} onClick={() => toggleHealthFlag('Sugar & Carb Cravings')} label="Intense Sugar/Carb Cravings" icon="🍩" />
                  <ChoiceButton selected={healthFlags.includes('Irregular Digestion (IBS)')} onClick={() => toggleHealthFlag('Irregular Digestion (IBS)')} label="Irregular Digestion (IBS)" icon="🩺" />
                  <ChoiceButton selected={healthFlags.includes('Just feeling off')} onClick={() => toggleHealthFlag('Just feeling off')} label="Just feeling sluggish and 'off'" icon="⚡" />
                  <ChoiceButton selected={false} onClick={() => toggleHealthFlag('All of the above')} label="All of the above" icon="🤷" />
                </div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 3: Duration */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <SlideTitle>How long have you felt like this?</SlideTitle>
              <div className="w-full max-w-lg space-y-3">
                <ChoiceButton selected={whyNow === 'A few weeks'} onClick={() => selectOption(setWhyNow, 'A few weeks')} label="A few weeks, this is new." />
                <ChoiceButton selected={whyNow === 'A few months'} onClick={() => selectOption(setWhyNow, 'A few months')} label="A few months." />
                <ChoiceButton selected={whyNow === 'Years'} onClick={() => selectOption(setWhyNow, 'Years')} label="Years. I feel like I've tried everything." />
              </div>
            </motion.div>
          )}

          {/* SLIDE 4: Goal */}
          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <SlideTitle>What is your #1 goal right now?</SlideTitle>
              <div className="w-full max-w-lg space-y-3">
                <ChoiceButton selected={protocolGoal === 'Flat stomach'} onClick={() => selectOption(setProtocolGoal, 'Flat stomach')} label="Fix bloating & get a flat stomach" icon="✨" />
                <ChoiceButton selected={protocolGoal === 'More energy'} onClick={() => selectOption(setProtocolGoal, 'More energy')} label="Reclaim my energy & focus" icon="🔋" />
                <ChoiceButton selected={protocolGoal === 'Stop cravings'} onClick={() => selectOption(setProtocolGoal, 'Stop cravings')} label="Stop feeling out of control around food" icon="🛑" />
                <ChoiceButton selected={protocolGoal === 'Total reset'} onClick={() => selectOption(setProtocolGoal, 'Total reset')} label="Just hit the ultimate reset button" icon="🔄" />
              </div>
            </motion.div>
          )}

          {/* SLIDE 5: Blocker */}
          {step === 5 && (
            <motion.div
              key="step5"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <SlideTitle>What's your biggest roadblock usually?</SlideTitle>
              <div className="w-full max-w-lg space-y-3">
                <ChoiceButton selected={primaryBlocker === 'Confusion'} onClick={() => selectOption(setPrimaryBlocker, 'Confusion')} label="Confusion on what to take and when" />
                <ChoiceButton selected={primaryBlocker === 'Lack of time'} onClick={() => selectOption(setPrimaryBlocker, 'Lack of time')} label="Lack of time / poor meal prep" />
                <ChoiceButton selected={primaryBlocker === 'Losing motivation'} onClick={() => selectOption(setPrimaryBlocker, 'Losing motivation')} label="Losing motivation when die-off hits" />
                <ChoiceButton selected={primaryBlocker === 'Social events'} onClick={() => selectOption(setPrimaryBlocker, 'Social events')} label="Social events & weekend slip-ups" />
                <ChoiceButton selected={primaryBlocker === 'Forgetful'} onClick={() => selectOption(setPrimaryBlocker, 'Forgetful')} label="I just get busy and forget" />
              </div>
            </motion.div>
          )}

          {/* SLIDE 6: Diet */}
          {step === 6 && (
            <motion.div
              key="step6"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 overflow-y-auto"
            >
              <div className="min-h-full flex flex-col items-center justify-center p-6 py-24 mx-auto w-full max-w-3xl">
                <SlideTitle>How do you usually eat?</SlideTitle>
                <div className="w-full max-w-lg grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DIET_PATTERN_OPTIONS.map(option => (
                    <ChoiceButton key={option} selected={dietPattern === option} onClick={() => selectOption(setDietPattern, option)} label={option} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 7: Routine */}
          {step === 7 && (
            <motion.div
              key="step7"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 overflow-y-auto"
            >
              <div className="min-h-full flex flex-col items-center justify-center p-6 py-24 mx-auto w-full max-w-3xl">
                <SlideTitle>How predictable is your daily schedule?</SlideTitle>
                <p className="text-zinc-400 text-lg mb-8 text-center -mt-4">This helps Coach time your reminders.</p>
                <div className="w-full max-w-lg space-y-3">
                  <ChoiceButton selected={routineType === 'Early mornings'} onClick={() => selectOption(setRoutineType, 'Early mornings')} label="I wake up very early" />
                  <ChoiceButton selected={routineType === 'Standard daytime'} onClick={() => selectOption(setRoutineType, 'Standard daytime')} label="Standard 9 to 5 hours" />
                  <ChoiceButton selected={routineType === 'Night shift / late schedule'} onClick={() => selectOption(setRoutineType, 'Night shift / late schedule')} label="Night shift / Late nights" />
                  <ChoiceButton selected={routineType === 'Unpredictable routine'} onClick={() => selectOption(setRoutineType, 'Unpredictable routine')} label="All over the place" />
                </div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 8: Support Style */}
          {step === 8 && (
            <motion.div
              key="step8"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <SlideTitle>How should Coach talk to you?</SlideTitle>
              <div className="w-full max-w-lg space-y-3">
                <ChoiceButton selected={supportStyle === 'Direct and blunt'} onClick={() => selectOption(setSupportStyle, 'Direct and blunt')} label="Direct and blunt (No excuses)" icon="💪" />
                <ChoiceButton selected={supportStyle === 'Gentle and encouraging'} onClick={() => selectOption(setSupportStyle, 'Gentle and encouraging')} label="Gentle and encouraging (Grace)" icon="🫂" />
                <ChoiceButton selected={supportStyle === 'Data-driven'} onClick={() => selectOption(setSupportStyle, 'Data-driven')} label="Data-driven (Give me facts & science)" icon="🔬" />
              </div>
            </motion.div>
          )}

          {/* SLIDE 9: Email */}
          {step === 9 && (
            <motion.div
              key="step9"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <SlideTitle>Where should we send your results?</SlideTitle>
              <p className="text-zinc-400 text-lg mb-8 text-center -mt-4 max-w-lg">
                The system is finalizing your protocol. Enter your best email below so we can lock in your analysis and send your results.
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

          {/* SLIDE 10: Analyzing */}
          {isAnalyzing && (
            <motion.div
              key="step10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full flex-1 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 border-t-4 border-r-4 border-primary rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-b-4 border-l-4 border-primary/40 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Analyzing your profile...</h2>
              <p className="text-zinc-400 text-lg">Matching symptoms to protocol phases.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
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
          
          <Button 
            onClick={handleNext}
            className="rounded-full px-8 bg-white hover:bg-zinc-200 text-black font-semibold"
          >
            {step === TOTAL_STEPS ? 'See My Results' : 'Next'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileOnboarding;
