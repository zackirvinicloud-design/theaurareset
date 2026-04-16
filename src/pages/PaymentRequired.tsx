import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, ArrowRight, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultPostAuthDestination, isEmailVerified } from "@/lib/auth-routing";
import { getWhopCheckoutUrl, PRODUCT_PRIMARY_CTA } from "@/lib/product";
import { useOnboardingProfile } from "@/hooks/useOnboardingProfile";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Personalization Logic
  const healthFlagsList = profile?.healthFlags || [];
  const symptomsText = healthFlagsList.length > 0 
    ? healthFlagsList.slice(0, 2).map(s => s.toLowerCase()).join(" and ") 
    : "debilitating symptoms";
    
  let blockerText = "losing motivation or getting confused";
  if (profile?.primaryBlocker) {
    if (profile.primaryBlocker === 'Confusion') blockerText = "confusion on what to take and when";
    else if (profile.primaryBlocker === 'Lack of time') blockerText = "lack of time and poor meal prep";
    else if (profile.primaryBlocker === 'Losing motivation') blockerText = "losing motivation when die-off hits";
    else if (profile.primaryBlocker === 'Social events') blockerText = "social events and weekend slip-ups";
    else if (profile.primaryBlocker === 'Forgetful') blockerText = "getting busy and forgetting";
    else blockerText = profile.primaryBlocker.toLowerCase();
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 pb-36">

      {/* Diagnostic Readout — compact, monospace, proves we analyzed them */}
      <div className="bg-[#060606] border-b border-zinc-800/60">
        <div className="max-w-md mx-auto px-5 pt-6 pb-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Gut Analysis — Results</span>
          </div>
          <div className="font-mono text-[13px] space-y-2">
            <div className="flex"><span className="text-zinc-600 w-[90px] shrink-0">STATUS</span><span className="text-red-400 font-semibold">At Risk</span></div>
            <div className="flex"><span className="text-zinc-600 w-[90px] shrink-0">FLAGS</span><span className="text-white capitalize">{symptomsText}</span></div>
            <div className="flex"><span className="text-zinc-600 w-[90px] shrink-0">BLOCKER</span><span className="text-zinc-300">{blockerText}</span></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-7">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* ── Timeline ── */}
          <h2 className="text-xl font-bold tracking-tight mb-5">Your 21-Day Reset</h2>

          <div className="relative pl-7 border-l-2 border-zinc-800 space-y-5 mb-8">
            {/* Day 1 */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center"><span className="text-[9px] font-black text-black">1</span></div>
              <p className="text-sm"><span className="text-primary font-bold">Prep Day</span> <span className="text-zinc-400">— Shopping list generated, daily schedule locked.</span></p>
            </div>
            {/* Day 3 — Free Trial hook */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center"><span className="text-[9px] font-bold text-white">3</span></div>
              <p className="text-sm"><span className="text-white font-bold">Die-Off Peak</span> <span className="text-zinc-400">— SOS protocols unlock. This is where most people quit.</span></p>
              <span className="inline-block mt-1 text-[10px] font-bold tracking-widest uppercase text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">← Free trial ends here</span>
            </div>
            {/* Day 7 */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center"><span className="text-[9px] font-bold text-white">7</span></div>
              <p className="text-sm"><span className="text-white font-bold">Cravings Break</span> <span className="text-zinc-400">— Sugar cravings collapse. Energy stabilizes.</span></p>
            </div>
            {/* Day 14 */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-zinc-700 flex items-center justify-center"><span className="text-[9px] font-bold text-white">14</span></div>
              <p className="text-sm"><span className="text-white font-bold">Deep Reset</span> <span className="text-zinc-400">— Biofilm breakdown phase. Gut lining repair begins.</span></p>
            </div>
            {/* Day 21 */}
            <div className="relative">
              <div className="absolute -left-[calc(1.75rem+1px)] top-0.5 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center"><span className="text-[9px] font-black text-black">✓</span></div>
              <p className="text-sm"><span className="text-green-400 font-bold">Flush Complete</span> <span className="text-zinc-400">— Protocol ends. Lifetime access stays.</span></p>
            </div>
          </div>

          {/* ── USP Bullets ── */}
          <div className="space-y-2.5 mb-8">
            <h3 className="text-lg font-bold tracking-tight mb-3">What you get</h3>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">Exact daily schedule — what to take, when, and why</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">Auto-generated shopping list before you start</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">Die-off SOS protocols when symptoms spike</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">24/7 AI nutrition coach trained on your profile</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">Daily symptom tracker to prove it's working</span></div>
            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5">✦</span><span className="text-zinc-300">One payment — lifetime access, no subscriptions</span></div>
          </div>

          {/* ── Killer Final Line ── */}
          <p className="text-center text-sm text-zinc-500 font-medium mb-4 leading-relaxed">
            You've already bought the supplements.&nbsp;
            <span className="text-white font-semibold">This is the system that makes sure you actually finish.</span>
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
