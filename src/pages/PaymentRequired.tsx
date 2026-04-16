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

          {/* ── Value Stack ── */}
          <div className="space-y-3.5 mb-8">
            <h2 className="text-xl font-bold tracking-tight mb-4 text-balance">The graveyard of half-empty supplement bottles in your cabinet ends today.</h2>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Know exactly what to take, when to take it, and why — <span className="text-white font-medium">without Googling dosages at midnight or cross-referencing 6 different TikToks</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Get a complete personalized shopping list before Day 1 — <span className="text-white font-medium">without overspending on supplements you don't actually need yet</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Survive die-off symptoms with SOS protocols that activate automatically — <span className="text-white font-medium">without panicking and quitting because you think something is wrong</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Get a 24/7 AI coach that already knows your score, your diet, and your biggest blocker — <span className="text-white font-medium">without paying $300/hr for a functional medicine practitioner to tell you the same thing</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Track your symptoms daily so you can see the exact moment your body starts turning around — <span className="text-white font-medium">without second-guessing whether it's "working" or you're just wasting money</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Know the correct full-moon parasite timing and exact herbal dosing schedule — <span className="text-white font-medium">without a $200 lab test or a 6-week wait for a naturopath appointment</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Move through fungal, parasite, and heavy metal phases in the right order — <span className="text-white font-medium">without accidentally chelating metals before breaking down the biofilm that's protecting them</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Get real meal plans and food swaps for your specific diet — <span className="text-white font-medium">without eating boiled chicken and broccoli for 21 days straight</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Wake up every morning knowing exactly what to do today — <span className="text-white font-medium">without opening 4 apps, 3 PDFs, and a saved TikTok playlist to figure it out</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">One payment. Lifetime access. No subscriptions. No upsells — <span className="text-white font-medium">without the guilt of another $49/month membership you forget to cancel</span></span></div>
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
