import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Lock, ShieldCheck, ArrowRight, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDefaultPostAuthDestination, isEmailVerified } from "@/lib/auth-routing";
import { getWhopCheckoutUrl, PRODUCT_NAME, PRODUCT_PRICE, PRODUCT_ORIGINAL_PRICE, PRODUCT_PRIMARY_CTA } from "@/lib/product";
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
    <div className="min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Sticky Top Bar for urgency */}
      <div className="bg-red-950/40 border-b border-red-500/20 py-3 text-center text-xs md:text-sm font-semibold tracking-widest text-red-500 uppercase flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Analysis Complete: Execution Plan Required
      </div>

      <div className="max-w-3xl mx-auto px-5 py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          
          {/* Header Section */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Your gut is demanding a reset. <br className="hidden md:block" />
            <span className="text-zinc-500">But trying to "wing it" will guarantee you fail.</span>
          </h1>

          <div className="prose prose-invert prose-lg md:prose-xl max-w-none text-zinc-300">
            <p className="font-medium text-white mb-8 leading-snug">
              Let's be brutally honest. You are exhausted. You told us you are dealing with <span className="text-primary font-bold">{symptomsText}</span>.
            </p>

            <p>
              You are ready for a cleanse. Good. But right now, you are standing at the edge of a cliff.
            </p>
            
            <p>
              You admitted your biggest roadblock is <strong className="text-white bg-white/10 px-2 py-1 rounded">{blockerText}</strong>. Do you really think a static PDF guide or a saved TikTok video is going to save you when the Candida die-off hits on Day 3? 
            </p>

            <p>
              When the sugar cravings are screaming at you, and your brain fog is so thick you can barely focus... are you going to remember exactly what phase you're in and what you are allowed to eat?
            </p>

            <div className="my-10 p-6 md:p-8 rounded-2xl bg-[#0a0a0a] border border-red-500/20 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] pointer-events-none">
                <Activity className="h-64 w-64 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-red-500 mb-4 relative z-10 m-0">You will crack.</h3>
              <p className="relative z-10 text-zinc-400 m-0 mt-4 leading-relaxed text-base md:text-lg">
                You will order takeout. You will slip up on the weekend. And you will find yourself right back where you started—frustrated, bloated, and tired. That isn't a guess. That is exactly what happens to almost everyone who tries to do this without a system.
              </p>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mt-16 mb-6 leading-tight">
              To survive the next 21 days, you don't need more information. <br/>
              <span className="text-primary">You need ruthless execution.</span>
            </h2>

            <p>
              That is exactly why we built <strong>{PRODUCT_NAME}</strong>. It is not just another wellness portal. It is your daily command center. It bridges the gap between knowing <em>what</em> to do, and actually <em>doing</em> it.
            </p>

            {/* Feature Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 my-12 not-prose">
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-red-500/10 flex items-center justify-center">
                    <X className="h-5 w-5 text-red-500" />
                  </div>
                  <h4 className="font-bold text-xl text-white">The "Wing It" Method</h4>
                </div>
                <ul className="space-y-4 text-zinc-400 text-base md:text-lg font-medium">
                  <li className="flex gap-3"><X className="h-5 w-5 shrink-0 mt-0.5 text-zinc-600"/> Digging through emails for a PDF</li>
                  <li className="flex gap-3"><X className="h-5 w-5 shrink-0 mt-0.5 text-zinc-600"/> Guessing when to take supplements</li>
                  <li className="flex gap-3"><X className="h-5 w-5 shrink-0 mt-0.5 text-zinc-600"/> Quitting when die-off symptoms hit</li>
                  <li className="flex gap-3"><X className="h-5 w-5 shrink-0 mt-0.5 text-zinc-600"/> Zero accountability</li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-[#0a1a10] border border-primary/30 relative overflow-hidden shadow-2xl shadow-primary/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="font-bold text-xl text-white">{PRODUCT_NAME}</h4>
                  </div>
                  <ul className="space-y-4 text-zinc-200 text-base md:text-lg font-medium">
                    <li className="flex gap-3"><Check className="h-5 w-5 shrink-0 mt-0.5 text-primary/70"/> Exact day-by-day directives</li>
                    <li className="flex gap-3"><Check className="h-5 w-5 shrink-0 mt-0.5 text-primary/70"/> Push reminders so you never forget</li>
                    <li className="flex gap-3"><Check className="h-5 w-5 shrink-0 mt-0.5 text-primary/70"/> 24/7 Nutrition Agent for die-off support</li>
                    <li className="flex gap-3"><Check className="h-5 w-5 shrink-0 mt-0.5 text-primary/70"/> One-time payment, yours forever</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Offer Box */}
            <div className="mt-16 mb-8 p-8 md:p-12 rounded-3xl bg-gradient-to-b from-[#111] to-black border border-zinc-800 text-center not-prose relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Lifetime Access. <br className="md:hidden"/>No Subscriptions.</h3>
              <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">Pay once. Keep your cleanse workspace and daily structure forever.</p>
              
              <div className="flex items-center justify-center gap-4 mb-10">
                <span className="text-6xl md:text-7xl font-black text-white tracking-tight">{PRODUCT_PRICE}</span>
                <span className="text-2xl md:text-3xl font-medium text-zinc-600 line-through decoration-red-500/50">{PRODUCT_ORIGINAL_PRICE}</span>
              </div>

              <Button 
                size="lg"
                onClick={handleCheckout} 
                className="w-full text-xl md:text-2xl py-8 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98]"
              >
                {PRODUCT_PRIMARY_CTA}
                <ArrowRight className="ml-3 h-6 w-6 md:h-8 md:w-8" />
              </Button>

              <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm md:text-base text-zinc-500 font-medium">
                 <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full"><ShieldCheck className="h-4 w-4 text-primary/70" /> Secure SSL Checkout</div>
                 <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full"><Lock className="h-4 w-4 text-primary/70" /> Instant Digital Access</div>
              </div>
            </div>

            <div className="text-center pb-20">
              {userId && (
                <button 
                  onClick={handleSignOut} 
                  className="text-sm text-zinc-600 hover:text-zinc-400 underline underline-offset-4 transition-colors"
                >
                  Log out and abandon protocol
                </button>
              )}
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentRequired;
