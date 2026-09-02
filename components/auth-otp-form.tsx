"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { emailOtp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BrandLogo } from "@/components/brand-logo";

const CODE_LENGTH = 6;
/** Matches the server-side rate limit on the send-code endpoint (3 / 60s). */
const RESEND_COOLDOWN_SECONDS = 45;

function messageForVerifyError(code: string | undefined, fallback: string) {
  switch (code) {
    case "INVALID_OTP":
      return "That code doesn't match. Check the digits and try again.";
    case "OTP_EXPIRED":
      return "That code has expired. Request a new one.";
    case "TOO_MANY_ATTEMPTS":
      return "Too many incorrect attempts. Request a new code to continue.";
    case "USER_NOT_FOUND":
      return "We couldn't find an account for this email.";
    default:
      return fallback;
  }
}

export type AuthOtpFormProps = {
  email: string;
  /** Called once the email is verified; the parent completes the sign-in. */
  onVerified: () => Promise<void> | void;
  /** Returns to the email/password form. */
  onBack: () => void;
  /** True when the parent is finishing sign-in after a successful verify. */
  finishing?: boolean;
};

export function AuthOtpForm({
  email,
  onVerified,
  onBack,
  finishing = false,
}: AuthOtpFormProps) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  // Guards against the auto-submit firing twice for the same code.
  const submittedCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const busy = verifying || finishing;

  const verify = useCallback(
    async (value: string) => {
      if (value.length !== CODE_LENGTH || busy) return;
      submittedCodeRef.current = value;
      setVerifying(true);
      setInvalid(false);
      try {
        const { error } = await emailOtp.verifyEmail({ email, otp: value });
        if (error) {
          setInvalid(true);
          setCode("");
          submittedCodeRef.current = null;
          toast.error(
            messageForVerifyError(
              error.code,
              error.message ?? "We couldn't verify that code.",
            ),
          );
          return;
        }
        await onVerified();
      } catch (err) {
        setInvalid(true);
        submittedCodeRef.current = null;
        toast.error(
          err instanceof Error ? err.message : "We couldn't verify that code.",
        );
      } finally {
        setVerifying(false);
      }
    },
    [busy, email, onVerified],
  );

  async function handleResend() {
    if (cooldown > 0 || resending || busy) return;
    setResending(true);
    try {
      const { error } = await emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (error) throw new Error(error.message ?? "Could not send a new code.");
      setCode("");
      setInvalid(false);
      submittedCodeRef.current = null;
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success("A new code is on its way.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not send a new code.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-xl clay-lift-subtle clay-lift transition-shadow duration-300">
      <CardHeader className="space-y-3 pb-2 text-center">
        <BrandLogo className="flex justify-center" />
        <div className="space-y-1.5">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <MailCheck className="h-5 w-5 text-muted-foreground" />
            Check your email
          </CardTitle>
          <CardDescription className="text-base">
            We sent a {CODE_LENGTH}-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>. Enter
            it below to verify your email.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void verify(code);
          }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <p id="otp-label" className="text-center text-sm text-muted-foreground">
              Verification code
            </p>
            <OtpInput
              value={code}
              onChange={(next) => {
                setCode(next);
                if (invalid) setInvalid(false);
              }}
              onComplete={(next) => {
                if (submittedCodeRef.current === next) return;
                void verify(next);
              }}
              length={CODE_LENGTH}
              disabled={busy}
              autoFocus
              invalid={invalid}
              aria-labelledby="otp-label"
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full text-base"
            disabled={busy || code.length !== CODE_LENGTH}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {finishing ? "Signing you in…" : "Verify email"}
          </Button>
        </form>

        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>
            Didn&apos;t get it? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending || busy}
              className="link-underline-grow font-medium text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
            >
              {resending
                ? "sending…"
                : cooldown > 0
                  ? `resend in ${cooldown}s`
                  : "send a new code"}
            </button>
            .
          </p>
          <p className="text-xs">Codes expire 10 minutes after they&apos;re sent.</p>
        </div>
      </CardContent>

      <CardFooter className="justify-center border-t border-border/60 pt-6 text-sm">
        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft className="h-4 w-4" />
          Use a different email
        </button>
      </CardFooter>
    </Card>
  );
}
