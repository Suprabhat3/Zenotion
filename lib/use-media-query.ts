"use client";

import { useSyncExternalStore } from "react";

function subscribeToMediaQuery(
  query: string,
  onStoreChange: () => void,
): () => void {
  const media = window.matchMedia(query);
  const handler = () => onStoreChange();
  media.addEventListener("change", handler);
  return () => media.removeEventListener("change", handler);
}

export function useMediaQuery(query: string, defaultValue = false): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribeToMediaQuery(query, onStoreChange),
    () => window.matchMedia(query).matches,
    () => defaultValue,
  );
}

export const MOBILE_SIDEBAR_QUERY = "(max-width: 1023px)";
