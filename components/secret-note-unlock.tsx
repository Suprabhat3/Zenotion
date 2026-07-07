"use client";

import { useState } from "react";
import { KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import type { NoteDetail, TagSummary } from "@/lib/types";
import { decryptPayload, deriveKeys } from "@/lib/secret-crypto";
import { NoteEditor, type NoteEditorSecret } from "@/components/note-editor";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

type SecretNoteUnlockProps = {
  note: NoteDetail;
  folders: { id: string; name: string }[];
  tags: TagSummary[];
};

type UnlockedState = {
  note: NoteDetail;
  secret: NoteEditorSecret;
};

/**
 * Gate shown instead of the editor for a secret note. The password-derived
 * key lives only in this component's state — refreshing, navigating away, or
 * "Lock now" in the editor drops it and re-shows the gate.
 */
export function SecretNoteUnlock({ note, folders, tags }: SecretNoteUnlockProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState<UnlockedState | null>(null);

  async function handleUnlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password || unlocking) return;
    if (!note.secretSalt || !note.secretIv || !note.secretVerifier) {
      setError("This note's encryption data is incomplete.");
      return;
    }

    setUnlocking(true);
    setError(null);
    try {
      const { encKey, verifier } = await deriveKeys(password, note.secretSalt);
      if (verifier !== note.secretVerifier) {
        setError("Wrong password. Try again.");
        return;
      }
      const payload = await decryptPayload(encKey, note.content, note.secretIv);
      setUnlocked({
        note: { ...note, title: payload.title, content: payload.content },
        secret: { encKey, verifier },
      });
      setPassword("");
    } catch {
      setError("Wrong password. Try again.");
    } finally {
      setUnlocking(false);
    }
  }

  if (unlocked) {
    return (
      <NoteEditor
        key={`unlocked-${note.id}`}
        note={unlocked.note}
        folders={folders}
        tags={tags}
        secret={unlocked.secret}
        onLock={() => setUnlocked(null)}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-lg sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Lock className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-center text-xl font-semibold tracking-tight">
          This note is encrypted
        </h1>
        <p className="mt-1.5 text-center text-sm leading-relaxed text-muted-foreground">
          Enter your password to decrypt it on this device. It was never
          stored on our servers.
        </p>

        <form onSubmit={handleUnlock} className="mt-6 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="unlock-password" className="sr-only">
              Password
            </Label>
            <PasswordInput
              id="unlock-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Password"
              autoComplete="current-password"
              autoFocus
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={!password || unlocking}
          >
            {unlocking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            {unlocking ? "Decrypting…" : "Unlock note"}
          </Button>
        </form>

        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Zero-knowledge encryption: decryption happens in your browser, and a
          forgotten password cannot be reset or recovered.
        </p>
      </div>
    </div>
  );
}
