import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultPostAuthDestination, isEmailVerified } from "@/lib/auth-routing";
import { getWhopCheckoutUrl, PRODUCT_PRIMARY_CTA } from "@/lib/product";
import { useOnboardingProfile } from "@/hooks/useOnboardingProfile";
import { calculateGutScore, getScoreLabel, getScoreColor } from "@/lib/gut-score";
import { motion } from "framer-motion";

const PaymentRequired = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      if (!isEmailVerified(session.user)) {
        if (!cancelled) {
          // They might have paid already without email verification? In legacy they do.
          // But actually, just let them through or force to signup. Keep it simple.
          navigate("/signup");
        }
        return;
      }

      const destination = await getDefaultPostAuthDestination(session.user.id);
      if (destination !== "/payment-required") {
        if (!cancelled) navigate(destination);
        return;
      }

      if (!cancelled) {
        setUserId(session.user.id);
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const { profile: dbProfile } = useOnboardingProfile(userId);
  const [localProfile, setLocalProfile] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!userId) {
      const stored = localStorage.getItem('pending_onboarding_profile');
      if (stored) {
        try {
          setLocalProfile(JSON.parse(stored));
        } catch (e) {
          console.log(e);
        }
      }
    }
  }, [userId]);

  const profile = userId ? dbProfile : localProfile;

  const handleCheckout = () => {
    const checkoutUrl = getWhopCheckoutUrl();
    if (!checkoutUrl) {
      toast({
        title: "Checkout is not configured yet",
        description: "Add `VITE_WHOP_CHECKOUT_URL` before sending traffic to this page.",
        variant: "destructive",
      });
      return;
    }
    // Deep direct-response funnels perform better taking over the current tab
    window.location.href = checkoutUrl;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Personalization Logic — computed before any conditional returns to obey hooks rules
  const healthFlagsList = profile?.healthFlags || [];
  const symptomsText = healthFlagsList.length > 0
    ? healthFlagsList.slice(0, 3).map(s => s.toLowerCase()).join(", ")
    : "general symptoms";

  const gutScore = useMemo(() => calculateGutScore({
    healthFlags: healthFlagsList,
    primaryBlocker: profile?.primaryBlocker ?? null,
    dietPattern: profile?.dietPattern ?? null,
    routineType: profile?.routineType ?? null,
  }), [healthFlagsList, profile?.primaryBlocker, profile?.dietPattern, profile?.routineType]);

  const scoreLabel = getScoreLabel(gutScore);
  const scoreColor = getScoreColor(gutScore);

  // SVG arc math for the score gauge
  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const arcLength = CIRCUMFERENCE * 0.75; // 270° arc
  const filledLength = arcLength * (gutScore / 10);
  const gapLength = arcLength - filledLength;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 pb-36">

      {/* Score Hero */}
      <div className="bg-gradient-to-b from-[#080808] to-black border-b border-zinc-800/40">
        <div className="max-w-md mx-auto px-5 pt-8 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 text-center mb-5">Gut Health Audit — Results</p>

          {/* Circular Score Gauge */}
          <div className="flex flex-col items-center mb-5">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-[135deg]">
                {/* Background track */}
                <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#1a1a1a" strokeWidth="10"
                  strokeDasharray={`${arcLength} ${CIRCUMFERENCE - arcLength}`}
                  strokeLinecap="round"
                />
                {/* Filled arc */}
                <motion.circle
                  cx="60" cy="60" r={RADIUS} fill="none" stroke={scoreColor} strokeWidth="10"
                  strokeDasharray={`${filledLength} ${gapLength + (CIRCUMFERENCE - arcLength)}`}
                  strokeLinecap="round"
                  initial={{ strokeDasharray: `0 ${CIRCUMFERENCE}` }}
                  animate={{ strokeDasharray: `${filledLength} ${gapLength + (CIRCUMFERENCE - arcLength)}` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
              {/* Score number centered */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-5xl font-black tracking-tight"
                  style={{ color: scoreColor }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  {gutScore}
                </motion.span>
                <span className="text-[11px] font-semibold text-zinc-500 -mt-0.5">out of 10</span>
              </div>
            </div>

            <motion.div
              className="mt-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border"
              style={{ color: scoreColor, borderColor: `${scoreColor}33`, backgroundColor: `${scoreColor}0d` }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              {scoreLabel}
            </motion.div>
          </div>

          {/* Compact flags */}
          <div className="text-center text-[13px] text-zinc-400 leading-relaxed">
            <span className="capitalize">{symptomsText}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-7">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* ── Timeline ── */}
          <h2 className="text-xl font-bold tracking-tight mb-5">Here's exactly what happens inside</h2>

          <div className="relative pl-7 border-l-2 border-zinc-800 space-y-5 mb-8">
            {/* Prep */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center"><span className="text-[9px] font-black text-black">0</span></div>
              <p className="text-sm"><span className="text-primary font-bold">Prep Day</span> <span className="text-zinc-400">— Your exact shopping list drops instantly. No Googling, no guessing which brand. You know what to buy, what to skip, and the one cheap item most people forget that makes or breaks Week 1.</span></p>
            </div>
            {/* Days 1-3 — Fungal + Free Trial */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center"><span className="text-[9px] font-bold text-white">3</span></div>
              <p className="text-sm"><span className="text-white font-bold">Fungal Elimination Begins</span> <span className="text-zinc-400">— Candida die-off usually peaks here. Headaches, brain fog, sugar cravings screaming at you. The app detects die-off patterns and unlocks SOS protocols so you don't white-knuckle it alone. This is where 80% of people quit — you won't.</span></p>
              <span className="inline-block mt-1 text-[10px] font-bold tracking-widest uppercase text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">← Free trial ends here</span>
            </div>
            {/* Day 7 */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center"><span className="text-[9px] font-bold text-white">7</span></div>
              <p className="text-sm"><span className="text-white font-bold">Sugar Cravings Collapse</span> <span className="text-zinc-400">— Energy stabilizes. The daily symptom tracker inside the app will show you the exact moment your body flipped. Your coach recalibrates your plan based on what you're actually feeling — not a generic PDF schedule.</span></p>
            </div>
            {/* Days 8-14 — Parasite */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center"><span className="text-[9px] font-bold text-white">14</span></div>
              <p className="text-sm"><span className="text-white font-bold">Parasite Cleanse Phase</span> <span className="text-zinc-400">— Black walnut, wormwood, clove — timed to the full moon cycle (there's a reason veterinary parasitology does this). The app tells you exactly when to start, what dose, and what the bizarre stool changes actually mean so you don't panic and quit.</span></p>
            </div>
            {/* Days 15-21 — Heavy Metal */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center"><span className="text-[9px] font-bold text-white">21</span></div>
              <p className="text-sm"><span className="text-white font-bold">Heavy Metal Detox</span> <span className="text-zinc-400">— Chlorella, spirulina, zeolite — binding the metals that have been hiding behind the biofilm you just spent two weeks breaking down. Your daily schedule shifts automatically. No manual research required.</span></p>
            </div>
            {/* Complete */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center"><span className="text-[9px] font-black text-black">✓</span></div>
              <p className="text-sm"><span className="text-green-400 font-bold">Protocol Complete</span> <span className="text-zinc-400">— 21 days done. The rebuilding instructions are already loaded. You keep lifetime access to your planner, your coach, and your shopping lists for every future round.</span></p>
            </div>
          </div>

          {/* ── Fascination Bullets ── */}
          <div className="space-y-2.5 mb-8">
            <h3 className="text-lg font-bold tracking-tight mb-3">What's waiting inside</h3>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">The exact daily schedule that tells you what to take, when to take it, and the specific reason behind every single dose</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">A complete shopping list generated before Day 1 — including the one $8 item that prevents the worst die-off side effects</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">Emergency SOS protocols that activate automatically when your symptom tracker flags a die-off spike (so you never have to guess if it's "normal" or a real problem)</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">A 24/7 AI nutrition coach that already knows your diet, your blockers, and your score — and won't give you the same generic advice you've seen in every YouTube video</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">The exact full-moon parasite timing window most practitioners charge $300 to explain at a functional medicine appointment</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">A visual symptom tracker that proves the protocol is working — so on Day 5 when your brain says "this isn't doing anything," the data says otherwise</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">Lifetime access. One payment. No subscriptions. No upsells. Yours forever — including future protocol updates</span></div>
          </div>

          {/* ── Killer Final Line ── */}
          <p className="text-center text-sm text-zinc-500 font-medium mb-4 leading-relaxed">
            You already own the supplements.&nbsp;
            <span className="text-white font-semibold">This is the operating system that makes sure you actually finish what you started.</span>
          </p>

          {userId && (
            <div className="text-center pb-4">
              <button onClick={handleSignOut} className="text-xs text-zinc-700 hover:text-zinc-400 underline underline-offset-4 transition-colors">Sign out</button>
            </div>
          )}

        </motion.div>
      </div>

      {/* ── Fixed Bottom CTA ── */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black to-transparent z-50">
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            onClick={handleCheckout}
            className="w-full text-base md:text-lg py-6 rounded-2xl font-black tracking-[-0.01em] bg-primary hover:bg-primary/95 text-black shadow-2xl shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {PRODUCT_PRIMARY_CTA}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <div className="mt-2.5 flex items-center justify-center gap-4 text-[11px] text-zinc-600 font-medium">
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Secure</span>
            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Instant access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequired;
