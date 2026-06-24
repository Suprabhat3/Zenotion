import { Check, Gift, Heart, KeyRound, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORM_FREE_ITEMS = [
  "Unlimited notes, folders, and tags",
  "Markdown editor with live preview",
  "Autosave and version history",
  "Public share links",
] as const;

const AI_BYOK_ITEMS = [
  "Optional — use notes without AI anytime",
  "Bring your own API key from any supported provider",
  "Keys stay encrypted in your browser, never on our servers",
  "Pay only your provider — Zenotion adds no markup",
] as const;

const SUPPORTED_PROVIDERS = [
  "OpenAI",
  "Gemini",
  "Anthropic",
  "Groq",
  "OpenRouter",
] as const;

type LandingFreePromiseProps = {
  className?: string;
};

export function LandingFreePromise({ className }: LandingFreePromiseProps) {
  return (
    <section
      className={cn("border-y border-border/60 bg-muted/20 px-6 py-20", className)}
      aria-labelledby="free-promise-heading"
    >
      <div className="mx-auto max-w-5xl">
        <div className="public-fade-up mb-10 text-center">
          <span className="landing-badge mb-4 inline-flex">
            <Gift className="h-3.5 w-3.5" aria-hidden />
            Always free
          </span>
          <h2
            id="free-promise-heading"
            className="mb-4 text-2xl font-semibold sm:text-3xl"
          >
            A gift from one developer to another
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Zenotion is free by nature — not a trial, not a freemium tier. The
            full platform is yours to use. No credit card, no paywalls, no
            surprise limits on the essentials.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="public-fade-up public-fade-up-delay-1 rounded-xl p-6 clay-surface clay-lift">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Heart className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  The platform
                </p>
                <h3 className="text-lg font-semibold">100% free, forever</h3>
              </div>
            </div>
            <ul className="space-y-2.5">
              {PLATFORM_FREE_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="public-fade-up public-fade-up-delay-2 rounded-xl p-6 clay-surface clay-lift">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  AI features
                </p>
                <h3 className="text-lg font-semibold">Bring your own API key</h3>
              </div>
            </div>
            <ul className="mb-4 space-y-2.5">
              {AI_BYOK_ITEMS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
              <KeyRound
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <p className="text-xs text-muted-foreground pt-2">
                Works with{" "}
                {SUPPORTED_PROVIDERS.map((provider, index) => (
                  <span key={provider}>
                    {index > 0 && index < SUPPORTED_PROVIDERS.length - 1
                      ? ", "
                      : null}
                    {index === SUPPORTED_PROVIDERS.length - 1 &&
                    SUPPORTED_PROVIDERS.length > 1
                      ? " & "
                      : null}
                    <span className="font-medium text-foreground">
                      {provider}
                    </span>
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>

        <p className="public-fade-up public-fade-up-delay-3 mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground">
          Built because every developer deserves a calm place for notes — without
          another subscription eating into side-project budgets.
        </p>
      </div>
    </section>
  );
}
