"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      } else {
        const { error } = await signIn.email({ email, password });
        if (error) throw new Error(error.message ?? "Invalid email or password.");
      }
      router.push("/dashboard");
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
      await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    } catch {
      toast.error("Google sign-in failed.");
      setGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-xl">
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
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete={isSignup ? "new-password" : "current-password"}
                minLength={8}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
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
      </CardContent>

      <CardFooter className="justify-center border-t border-border/60 pt-6 text-sm text-muted-foreground">
        {isSignup ? (
          <span>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </span>
        ) : (
          <span>
            New here?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
