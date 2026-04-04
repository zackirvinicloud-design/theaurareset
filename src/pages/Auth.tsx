import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/hooks/use-toast";
import { getDefaultPostAuthDestination, isEmailVerified, withAuthTimeout } from "@/lib/auth-routing";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const redirectPath = searchParams.get("redirect");
    const resolveDestination = async (userId: string) => {
      if (redirectPath) {
        if (!cancelled) {
          navigate(redirectPath, { replace: true });
        }
        return;
      }

      const destination = await getDefaultPostAuthDestination(userId);
      if (!cancelled) {
        navigate(destination, { replace: true });
      }
    };

    const handleSession = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (!session) return;

      if (!isEmailVerified(session.user)) {
        if (!cancelled) {
          navigate("/signup", { replace: true });
        }
        return;
      }

      await resolveDestination(session.user.id);
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void handleSession(session);
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      const { data, error } = await withAuthTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        "Sign-in timed out. Please try again.",
      );

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data.user || !data.session) {
        toast({
          title: "Sign in failed",
          description: "No active session was returned. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!isEmailVerified(data.user)) {
        toast({
          title: "Verify your email first",
          description: "Open your confirmation email, then continue.",
        });
        navigate("/signup", { replace: true });
        return;
      }

      const destination = await getDefaultPostAuthDestination(data.user.id);
      navigate(destination, { replace: true });
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: "Something went wrong while signing in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      emailSchema.parse(email);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);

    try {
      const { error } = await withAuthTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        }),
        "Password reset timed out. Please try again.",
      );

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a password reset link",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="app-shell-dark min-h-screen flex items-center justify-center p-4">
      <Card className="app-panel-dark w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription>Sign in to access your protocol workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="text-center mt-2">
            <Button
              variant="link"
              onClick={handlePasswordReset}
              disabled={isResettingPassword}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {isResettingPassword ? "Sending..." : "Forgot password?"}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t border-border/60 pt-6">
          <div className="text-sm text-muted-foreground">
            Need to create an account?{" "}
            <Link 
              to={`/signup${searchParams.get("redirect") ? `?redirect=${searchParams.get("redirect")}` : ""}`}
              className="text-primary hover:underline"
            >
              Create account
            </Link>
          </div>
          <Button variant="link" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
