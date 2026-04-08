import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/hooks/use-toast";
import {
  getDefaultPostAuthDestination,
  isEmailVerified,
  mergeRedirectParams,
  sanitizeRedirectPath,
  withAuthTimeout,
} from "@/lib/auth-routing";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

type Step = "create" | "verify";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = sanitizeRedirectPath(searchParams.get("redirect"));
  const provider = searchParams.get("provider");
  const paymentId = searchParams.get("payment_id");
  const redirectDestination = mergeRedirectParams(redirectPath, {
    provider,
    payment_id: paymentId,
  });
  const isLegacyActivationFlow = redirectPath?.startsWith("/payment-success") ?? false;

  const [step, setStep] = useState<Step>("create");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const finishStartedRef = useRef(false);

  const completeSetup = useCallback(async (userId: string) => {
    if (finishStartedRef.current) return;
    finishStartedRef.current = true;
    setIsFinishing(true);

    try {
      const destination = await getDefaultPostAuthDestination(userId);

      toast({
        title: "You're in",
        description: destination === "/protocol"
          ? "Opening your workspace now."
          : "Next up: unlock full access.",
      });

      navigate(destination, { replace: true });
    } catch (error) {
      finishStartedRef.current = false;
      console.error("Failed to finish setup:", error);
      toast({
        title: "Setup incomplete",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFinishing(false);
    }
  }, [navigate]);

  // Bootstrap: check if user is already signed in
  useEffect(() => {
    let cancelled = false;

    const handleSession = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (cancelled) return;
      if (!session) {
        setIsBootstrapping(false);
        return;
      }

      if (redirectDestination) {
        navigate(redirectDestination, { replace: true });
        return;
      }

      if (!isEmailVerified(session.user)) {
        setPendingEmail(session.user.email ?? null);
        setStep("verify");
        setIsBootstrapping(false);
        return;
      }

      await completeSetup(session.user.id);
      if (!cancelled) {
        setIsBootstrapping(false);
      }
    };

    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleSession(session);
    };

    void bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void handleSession(session);
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [completeSetup, navigate, redirectDestination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return;
    }

    setIsSubmitting(true);

    const search = new URLSearchParams();
    search.set("verified", "1");
    if (redirectDestination) search.set("redirect", redirectDestination);
    if (provider) search.set("provider", provider);
    if (paymentId) search.set("payment_id", paymentId);

    try {
      const { error } = await withAuthTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/signup?${search.toString()}`,
          },
        }),
        "Sign-up timed out. Please try again.",
      );

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setPendingEmail(email);
      setStep("verify");

      toast({
        title: "Check your inbox",
        description: "Confirm your email to continue.",
      });
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationCheck = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !isEmailVerified(session.user)) {
      toast({
        title: "Still waiting",
        description: "Open the email we sent and tap the confirmation link first.",
      });
      return;
    }

    if (redirectDestination) {
      navigate(redirectDestination, { replace: true });
      return;
    }

    await completeSetup(session.user.id);
  };

  // Loading state
  if (isBootstrapping || isFinishing) {
    return (
      <div className="app-shell-dark min-h-screen flex items-center justify-center p-4">
        <Card className="app-panel-dark w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <p className="text-lg font-semibold text-foreground">
                {isFinishing ? "Setting things up" : "Loading"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isFinishing
                  ? "Routing you to the next step."
                  : "Checking your account status."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-shell-dark min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute bottom-[-80px] right-[-40px] h-[240px] w-[240px] rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-4 py-10 sm:px-6">
        {/* Left info panel + right form */}
        <div className="flex w-full max-w-3xl flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
          {/* Info sidebar */}
          <aside className="app-panel-muted rounded-[32px] p-5 lg:w-[320px] lg:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
              The Gut Brain Journal
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
              {isLegacyActivationFlow ? "Claim your access" : "Create your account"}
            </h1>

            {isLegacyActivationFlow ? (
              <div className="app-panel-dark mt-6 rounded-[28px] p-5 text-white">
                <div className="flex items-center gap-2 text-primary">
                  <LockKeyhole className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Legacy activation</span>
                </div>
                <p className="mt-4 text-lg font-semibold leading-tight">You already paid. This step just creates the account that holds your access.</p>
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Create an account to unlock the full protocol workspace. One email, one password — that's it.
                </p>

                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Day-by-day protocol guidance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Shopping lists, meal timing, supplement tracking</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>Coach answers about YOUR step</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>One-time payment. Lifetime access.</span>
                  </div>
                </div>
              </>
            )}
          </aside>

          {/* Main form */}
          <main className="flex-1">
            <Card className="app-panel-dark min-h-[400px] rounded-[32px]">
              <CardContent className="p-5 sm:p-8">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.2 }}
                >
                  {step === "verify" ? (
                    <div className="mx-auto flex max-w-xl flex-col items-center py-10 text-center">
                      <Mail className="h-10 w-10 text-primary" />
                      <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                        Check your email
                      </h2>
                      <p className="mt-3 text-base leading-7 text-muted-foreground">
                        We sent a confirmation link to <strong>{pendingEmail}</strong>. Open it, then come back here.
                      </p>
                      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
                        <Button onClick={handleVerificationCheck} disabled={isFinishing} className="h-12">
                          {isFinishing ? "Checking..." : "I verified my email"}
                        </Button>
                        <Button variant="ghost" onClick={() => setStep("create")}>
                          Change email
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto max-w-xl py-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        {isLegacyActivationFlow ? "Create your account" : "Step 1 of 2"}
                      </p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                        {isLegacyActivationFlow
                          ? "Attach your paid access to a real account"
                          : "Create your account"}
                      </h2>
                      <p className="mt-3 text-base leading-7 text-muted-foreground">
                        {isLegacyActivationFlow
                          ? "This keeps your payment connected to the correct login."
                          : "After this, you'll unlock the full workspace with a one-time payment."}
                      </p>

                      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <PasswordInput
                            id="signup-password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                          />
                          <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
                        </div>
                        <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
                          {isSubmitting ? (
                            "Creating account..."
                          ) : (
                            <>
                              Create account
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>

                      <div className="mt-4 text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                          to={`/auth${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
                          className="text-primary hover:underline"
                        >
                          Sign in instead
                        </Link>
                      </div>
                    </div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Signup;
