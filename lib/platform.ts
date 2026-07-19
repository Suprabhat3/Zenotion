"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function isApplePlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const uaData = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  const platform = uaData.userAgentData?.platform ?? navigator.platform ?? "";
  return /Mac|iPhone|iPad|iPod/i.test(platform);
}

/** True on macOS / iOS once mounted; false during SSR. */
export function useIsApplePlatform(): boolean {
  return useSyncExternalStore(subscribe, isApplePlatform, () => false);
}

export function modKeyLabel(isApple: boolean): string {
  return isApple ? "⌘" : "Ctrl";
}
