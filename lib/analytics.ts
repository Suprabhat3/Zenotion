import posthog from "posthog-js";
import type { AiAction } from "@/lib/validators";
import type { AuthUser } from "@/lib/session";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();

/** True when a PostHog project key is configured for the browser SDK. */
export function isAnalyticsEnabled(): boolean {
  return Boolean(POSTHOG_KEY);
}

type AnalyticsEventMap = {
  user_signed_up: { provider: "email" | "google" };
  user_signed_in: { provider: "email" | "google" };
  user_signed_out: Record<string, never>;
  note_saved: { save_trigger: "autosave" | "manual" };
  note_favorited: { is_favorite: boolean };
  note_exported: Record<string, never>;
  note_deleted: Record<string, never>;
  note_ai_applied: { action: AiAction };
  note_sharing_toggled: { is_public: boolean };
  share_link_copied: Record<string, never>;
  editor_mode_changed: { mode: "rich" | "markdown" };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

export function captureEvent<E extends AnalyticsEventName>(
  event: E,
  properties?: AnalyticsEventMap[E],
): void {
  if (!isAnalyticsEnabled()) return;
  posthog.capture(event, properties);
}

export function identifyUser(user: AuthUser): void {
  if (!isAnalyticsEnabled()) return;
  posthog.identify(user.id, {
    email: user.email,
    name: user.name,
  });
}

export function resetAnalytics(): void {
  if (!isAnalyticsEnabled()) return;
  posthog.reset();
}
