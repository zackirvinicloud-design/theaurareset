import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultPostAuthDestination, isEmailVerified } from "@/lib/auth-routing";
import { getWhopCheckoutUrl, PRODUCT_PRIMARY_CTA } from "@/lib/product";
import { useOnboardingProfile, type UserOnboardingProfile } from "@/hooks/useOnboardingProfile";
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
  const [localProfile, setLocalProfile] = useState<UserOnboardingProfile | null>(null);

  useEffect(() => {
    if (!userId) {
      const stored = localStorage.getItem('pending_onboarding_profile');
      if (stored) {
        try {
          setLocalProfile(JSON.parse(stored) as UserOnboardingProfile);
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

  const profileHighlights = useMemo(() => {
    const highlights = [
      profile?.protocolGoal
        ? { label: "Main focus", value: profile.protocolGoal }
        : null,
      profile?.primaryBlocker
        ? { label: "Biggest blocker", value: profile.primaryBlocker }
        : null,
      profile?.dietPattern
        ? { label: "Eating style", value: profile.dietPattern }
        : null,
      profile?.routineType
        ? { label: "Routine", value: profile.routineType }
        : null,
    ].filter(Boolean) as Array<{ label: string; value: string }>;

    return highlights.slice(0, 3);
  }, [profile?.dietPattern, profile?.primaryBlocker, profile?.protocolGoal, profile?.routineType]);

  const profileSummary = useMemo(() => {
    if (profile?.whyNow) {
      return profile.whyNow;
    }

    if (profile?.healthFlags?.length) {
      return `You already know why you want structure. We will help you turn that intent into a cleaner day-by-day plan.`;
    }

    return "We organize the next 21 days so you spend less time rereading a protocol and more time following it.";
  }, [profile?.healthFlags, profile?.whyNow]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 pb-36">

      {/* Setup Hero */}
      <div className="bg-gradient-to-b from-[#080808] to-black border-b border-zinc-800/40">
        <div className="max-w-md mx-auto px-5 pt-8 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 text-center mb-5">
            Setup Snapshot
          </p>
          <div className="rounded-3xl border border-zinc-800/70 bg-zinc-950/60 p-5 text-center">
            <motion.h1
              className="text-3xl font-black tracking-tight text-white"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {profile?.firstName ? `${profile.firstName}, your workspace is ready.` : "Your workspace is ready."}
            </motion.h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {profileSummary}
            </p>
          </div>

          {profileHighlights.length > 0 && (
            <div className="mt-4 grid gap-2">
              {profileHighlights.map((highlight) => (
                <div
                  key={highlight.label}
                  className="rounded-2xl border border-zinc-800/70 bg-zinc-950/50 px-4 py-3 text-left"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    {highlight.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-200">{highlight.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-7">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* ── Value Stack ── */}
          <div className="space-y-3.5 mb-8">
            <h2 className="text-xl font-bold tracking-tight mb-4 text-center text-balance">Stop researching. Start executing.</h2>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">See your day broken into clear steps and timing windows — <span className="text-white font-medium">without juggling a PDF, notes app, and saved videos</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Get a cleaner shopping list before Day 1 — <span className="text-white font-medium">without overbuying or forgetting the basics</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Keep reminders, meals, notes, and checklist progress in one workspace — <span className="text-white font-medium">without rebuilding your system every morning</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Use GutBrain for practical help with food swaps, schedule friction, and staying consistent — <span className="text-white font-medium">without opening another search tab</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Track daily check-ins so you keep a useful record of how the plan is going — <span className="text-white font-medium">without losing your thread halfway through</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Get real meal plans and food swaps for your specific diet — <span className="text-white font-medium">without eating boiled chicken and broccoli for 21 days straight</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Wake up every morning knowing exactly what to do today — <span className="text-white font-medium">without opening 4 apps, 3 PDFs, and a saved TikTok playlist to figure it out</span></span></div>

            <div className="flex items-start gap-3 text-sm"><span className="text-primary mt-0.5 shrink-0">✦</span><span className="text-zinc-300">Start with a 3-day free trial, then continue at $47/year only if it is helping — <span className="text-white font-medium">without getting trapped in a sneaky monthly subscription</span></span></div>
          </div>

          {/* ── Killer Final Line ── */}
          <p className="text-center text-sm text-zinc-500 font-medium mb-4 leading-relaxed">
            You already own the supplements.&nbsp;
            <span className="text-white font-semibold">This is the operating system that makes sure you actually finish what you started.</span>
          </p>
          <p className="text-center text-xs leading-relaxed text-zinc-600">
            The Gut Brain Journal is planning and adherence software. It does not diagnose conditions, interpret symptoms, or replace medical care.
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-zinc-500">
            <Link to="/legal/privacy" className="hover:text-zinc-300">Privacy</Link>
            <span>•</span>
            <Link to="/legal/terms" className="hover:text-zinc-300">Terms</Link>
          </div>

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
