"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { captureEvent } from "@/lib/analytics";
import { getSafeNextPath } from "@/lib/safe-redirect";
import { AuthOtpForm } from "@/components/auth-otp-form";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";
type Mode = "login" | "signup";

/**
 * Credentials the user just entered, held in memory only while the email
 * verification step is on screen. Keeping the password here lets us complete a
 * real password sign-in right after the code is verified, so verifying an
 * email never becomes a credential of its own.
 */
type PendingCredentials = { email: string; password: string };

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [pending, setPending] = useState<PendingCredentials | null>(null);
  const [finishingSignIn, setFinishingSignIn] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "");

    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await signUp.email({ email, password, name });
        if (error) throw new Error(error.message ?? "Could not create account.");
        captureEvent("user_signed_up", { provider: "email" });
        // `requireEmailVerification` means sign-up issues no session; a code
        // has just been emailed instead.
        setPending({ email, password });
        return;
      }

      const { error } = await signIn.email({ email, password });
      if (error) {
        if (error.code === "EMAIL_NOT_VERIFIED") {
          // The server re-sent a fresh code as part of this attempt.
          toast.info("Verify your email to continue — we sent you a code.");
          setPending({ email, password });
          return;
        }
        throw new Error(error.message ?? "Invalid email or password.");
      }
      captureEvent("user_signed_in", { provider: "email" });
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  /** Runs after the emailed code is accepted: sign in with the held password. */
  const handleVerified = useCallback(async () => {
    if (!pending) return;
    setFinishingSignIn(true);
    try {
      const { error } = await signIn.email({
        email: pending.email,
        password: pending.password,
      });
      if (error) {
        // Verification succeeded, so the account is usable — send them back to
        // the password form rather than leaving them on a dead-end screen.
        setPending(null);
        toast.error(
          error.message ?? "Email verified. Please sign in to continue.",
        );
        return;
      }
      captureEvent("user_email_verified");
      captureEvent("user_signed_in", { provider: "email" });
      router.push(nextPath);
      router.refresh();
    } finally {
      setFinishingSignIn(false);
    }
  }, [nextPath, pending, router]);

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      captureEvent(isSignup ? "user_signed_up" : "user_signed_in", {
        provider: "google",
      });
      await signIn.social({ provider: "google", callbackURL: nextPath });
    } catch {
      toast.error("Google sign-in failed.");
      setGoogleLoading(false);
    }
  }

  // The email verification step replaces the whole card until it resolves.
  if (pending) {
    return (
      <AuthOtpForm
        email={pending.email}
        onVerified={handleVerified}
        onBack={() => setPending(null)}
        finishing={finishingSignIn}
      />
    );
  }

  return (
    <Card className="w-full max-w-md rounded-xl clay-lift-subtle clay-lift transition-shadow duration-300">
      <CardHeader className="space-y-3 pb-2 text-center">
        <BrandLogo className="flex justify-center"/>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">
            {isSignup ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-base">
            {isSignup
              ? "Start writing AI-assisted notes in seconds."
              : "Sign in to your Zenotion workspace."}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full bg-card text-base font-medium"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </Button>

        <div className="clay-divider">or</div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Bhupendra Jogi"
                className="h-11"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="h-11"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={8}
              className="h-11"
              required
            />
          </div>
          <Button
            type="submit"
            className="h-11 w-full text-base"
            disabled={loading || googleLoading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By {isSignup ? "creating an account" : "signing in"}, you agree to
          our{" "}
          <Link
            href="/terms"
            className="link-underline-grow font-medium text-foreground"
          >
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="link-underline-grow font-medium text-foreground"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </CardContent>

      <CardFooter className="justify-center border-t border-border/60 pt-6 text-sm text-muted-foreground">
        {isSignup ? (
          <span>
            Already have an account?{" "}
            <Link
              href="/login"
              className="link-underline-grow font-medium text-foreground"
            >
              Sign in
            </Link>
          </span>
        ) : (
          <span>
            New here?{" "}
            <Link
              href="/signup"
              className="link-underline-grow font-medium text-foreground"
            >
              Create an account
            </Link>
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
