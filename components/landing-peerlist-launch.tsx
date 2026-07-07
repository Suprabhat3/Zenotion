import { ArrowUpRight, Heart, Rocket } from "lucide-react";
import { PeerlistLaunchEmbed } from "@/components/peerlist-launch-embed";
import { Button } from "@/components/ui/button";
import { PEERLIST_PROJECT_URL } from "@/lib/peerlist";
import { cn } from "@/lib/utils";

type LandingPeerlistLaunchProps = {
  className?: string;
};

export function LandingPeerlistLaunch({ className }: LandingPeerlistLaunchProps) {
  return (
    <section
      className={cn("px-6 py-12 sm:py-14", className)}
      aria-labelledby="peerlist-launch-heading"
    >
      <div className="mx-auto max-w-4xl">
        <div className="public-fade-up relative overflow-hidden rounded-2xl border border-emerald-500/15 clay-surface clay-lift">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400/80 via-emerald-500/40 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 top-0 h-32 w-32 rounded-full bg-emerald-500/8 blur-3xl"
            aria-hidden
          />

          <div className="relative grid gap-5 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6 sm:p-6">
            <div className="flex min-w-0 flex-col items-center gap-3 sm:items-start">
              <span className="landing-badge inline-flex border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300">
                <Rocket className="h-3.5 w-3.5" aria-hidden />
                Live on Peerlist Launchpad
              </span>

              <h2
                id="peerlist-launch-heading"
                className="text-center text-xl font-semibold sm:text-left sm:text-2xl"
              >
                Built in public,{" "}
                <span className="landing-highlight">shared with builders</span>
              </h2>

              <p className="max-w-lg text-center text-sm leading-relaxed text-muted-foreground sm:text-left sm:text-[0.9375rem]">
                Zenotion is on Peerlist Launchpad. If a calm, markdown-first
                workspace fits your flow, drop by and show some love.
              </p>

              <p className="flex max-w-lg items-start justify-center gap-1.5 text-xs text-muted-foreground sm:justify-start">
                <Heart
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
                <span>
                  Quote or share your experience — it helps us rank and reach
                  more developers.
                </span>
              </p>

              <div className="flex w-full justify-center sm:justify-start">
                <Button
                  size="default"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  asChild
                >
                  <a
                    href={PEERLIST_PROJECT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Upvote on Peerlist
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-1.5 sm:items-end sm:pt-1">
              <PeerlistLaunchEmbed height={44} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Live rank &amp; upvotes
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
