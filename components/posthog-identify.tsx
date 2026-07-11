"use client";

import { useEffect, useRef } from "react";
import { identifyUser } from "@/lib/analytics";
import type { AuthUser } from "@/lib/session";

type PostHogIdentifyProps = {
  user: AuthUser;
};

/** Links authenticated app sessions to a stable PostHog person profile. */
export function PostHogIdentify({ user }: PostHogIdentifyProps) {
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (identifiedUserId.current === user.id) return;
    identifyUser(user);
    identifiedUserId.current = user.id;
  }, [user]);

  return null;
}
