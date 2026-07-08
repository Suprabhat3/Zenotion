"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { markNoteSecret } from "@/app/(app)/notes/actions";
import {
  deriveKeys,
  encryptPayload,
  generateSalt,
} from "@/lib/secret-crypto";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

const MIN_PASSWORD_LENGTH = 8;

type SecretNoteDialogProps = {
  noteId: string;
  /** Current (plaintext) note state to encrypt. */
  title: string;
  content: string;
  isPublic: boolean;
  /** Id of the note already holding the secret credit, if any. */
  existingSecretNoteId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SecretNoteDialog({
  noteId,
  title,
  content,
  isPublic,
  existingSecretNoteId,
  open,
  onOpenChange,
}: SecretNoteDialogProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const tooShort =
    password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit =
    password.length >= MIN_PASSWORD_LENGTH &&
    confirm === password &&
    acknowledged &&
    !submitting;

  function handleOpenChange(next: boolean) {
    if (!next) {
      setPassword("");
      setConfirm("");
      setAcknowledged(false);
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const salt = generateSalt();
      const { encKey, verifier } = await deriveKeys(password, salt);
      const envelope = await encryptPayload(encKey, { title, content });

      const formData = new FormData();
      formData.set("noteId", noteId);
      formData.set("ciphertext", envelope.ciphertext);
      formData.set("iv", envelope.iv);
      formData.set("salt", salt);
      formData.set("verifier", verifier);
      await markNoteSecret(formData);

      toast.success("Note encrypted. Only your password can open it now.");
      handleOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not encrypt the note.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // The one secret-note credit is already taken by another note: explain
  // that up front instead of letting the user fill in a password and fail.
  if (existingSecretNoteId && existingSecretNoteId !== noteId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-4 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 shrink-0 text-primary" />
              You already have a secret note
            </DialogTitle>
            <DialogDescription className="text-left">
              Every account gets one secret note, and yours is already in use.
              To make this note secret instead, open your current secret note
              and choose <span className="font-medium text-foreground">Organize → Remove secret protection</span>{" "}
              — that frees your credit, then come back here.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Not now
            </Button>
            <Button asChild className="gap-1.5">
              <Link href={`/notes/${existingSecretNoteId}`}>
                Open my secret note
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] gap-4 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            Make this your secret note
          </DialogTitle>
          <DialogDescription className="text-left">
            The note is encrypted on this device with a password only you
            know. We store ciphertext we cannot read — not even from a backup.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secret-password">Password</Label>
            <PasswordInput
              id="secret-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              autoComplete="new-password"
              autoFocus
            />
            {tooShort && (
              <p className="text-xs text-destructive">
                Use at least {MIN_PASSWORD_LENGTH} characters.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret-password-confirm">Confirm password</Label>
            <PasswordInput
              id="secret-password-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again"
              autoComplete="new-password"
            />
            {mismatch && (
              <p className="text-xs text-destructive">
                The passwords don&apos;t match.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
            <div className="flex items-start gap-2.5">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="space-y-1.5 text-xs leading-relaxed">
                <p className="font-semibold text-destructive">
                  If you forget this password, this note is gone forever.
                  There is no reset and no recovery — we can&apos;t help.
                </p>
                <ul className="list-disc space-y-0.5 pl-4 text-muted-foreground">
                  <li>Version history for this note will be deleted.</li>
                  {isPublic && <li>Its public share link will be revoked.</li>}
                  <li>AI actions and content search won&apos;t work on it.</li>
                  <li>You have one secret note — this uses your credit.</li>
                </ul>
              </div>
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs font-medium">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-destructive"
              />
              I understand that a lost password means this note is
              unrecoverable.
            </label>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={!canSubmit}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {submitting ? "Encrypting…" : "Encrypt and lock this note"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
