"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { captureEvent } from "@/lib/analytics";
import { getSafeNextPath } from "@/lib/safe-redirect";
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

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
      } else {
        const { error } = await signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Invalid email or password.");
        captureEvent("user_signed_in", { provider: "email" });
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

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
