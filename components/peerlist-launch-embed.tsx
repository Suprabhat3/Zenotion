"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  getPeerlistEmbedImageUrl,
  PEERLIST_PROJECT_URL,
  type PeerlistEmbedTheme,
} from "@/lib/peerlist";
import { cn } from "@/lib/utils";

type PeerlistLaunchEmbedProps = {
  className?: string;
  imageClassName?: string;
  height?: number;
};

function subscribe() {
  return () => {};
}

export function PeerlistLaunchEmbed({
  className,
  imageClassName,
  height = 56,
}: PeerlistLaunchEmbedProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const theme: PeerlistEmbedTheme =
    mounted && resolvedTheme === "dark" ? "dark" : "light";

  const embedSrc = getPeerlistEmbedImageUrl({ showUpvote: true, theme });

  return (
    <a
      href={PEERLIST_PROJECT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Zenotion on Peerlist Launchpad — view live rank and upvotes"
      className={cn(
        "inline-flex items-center transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Peerlist serves a dynamic stats badge image. */}
      <img
        src={embedSrc}
        alt="Zenotion live stats on Peerlist Launchpad"
        height={height}
        className={cn("h-auto w-auto max-w-full", imageClassName)}
        style={{ height }}
      />
    </a>
  );
}
