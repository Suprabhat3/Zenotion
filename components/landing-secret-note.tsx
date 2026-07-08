import { KeyRound, Lock, ServerOff, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const SECRET_POINTS = [
  {
    icon: KeyRound,
    title: "Your password, your key",
    desc: "The encryption key is derived from a password you choose. It never leaves your device — we never see it, and we can't reset it.",
  },
  {
    icon: ServerOff,
    title: "We store only ciphertext",
    desc: "The note is encrypted with AES-GCM in your browser before it's saved. Our database — and our backups — hold nothing readable.",
  },
  {
    icon: Lock,
    title: "One secret note, free",
    desc: "Every account gets one secret-note credit. Mark any note as secret, and switch it back whenever you like.",
  },
] as const;

type LandingSecretNoteProps = {
  className?: string;
};

export function LandingSecretNote({ className }: LandingSecretNoteProps) {
  return (
    <section
      className={cn("px-6 py-20", className)}
      aria-labelledby="secret-note-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="public-fade-up mb-10 text-center">
          <span className="landing-badge mb-4 inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Zero-knowledge
          </span>
          <h2
            id="secret-note-heading"
            className="mb-4 text-2xl font-semibold sm:text-3xl"
          >
            Your secrets, encrypted so even we can&apos;t read them
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Keep one note for the things that should stay truly private.
            It&apos;s encrypted end-to-end on your device — no one but you can
            open it. Not other users, not attackers, not even us.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECRET_POINTS.map(({ icon: Icon, title, desc }, index) => (
            <div
              key={title}
              className={`rounded-xl p-6 clay-surface clay-lift public-fade-up public-fade-up-delay-${index + 1}`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mb-1.5 font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </div>
          ))}
        </div>

        <p className="public-fade-up public-fade-up-delay-3 mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
          The trade-off of true zero-knowledge: if you forget your password,
          nobody — including us — can recover that note. That&apos;s the point.
        </p>
      </div>
    </section>
  );
}
