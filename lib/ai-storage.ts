"use client";

import { useSyncExternalStore } from "react";
import {
  AI_PROVIDER_META,
  DEFAULT_AI_CONFIG,
  type AiConfig,
  type AiProviderId,
  type ProviderCredentials,
} from "@/lib/ai-providers";

export const AI_CONFIG_STORAGE_KEY = "zenotion-ai-config";
export const AI_CONFIG_CHANGE_EVENT = "zenotion-ai-config-change";
export const AI_SETTINGS_OPEN_EVENT = "zenotion-ai-settings-open";

function subscribe(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(AI_CONFIG_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(AI_CONFIG_CHANGE_EVENT, handler);
  };
}

function parseStoredConfig(raw: string | null): AiConfig {
  if (!raw) return DEFAULT_AI_CONFIG;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_AI_CONFIG;

    const record = parsed as {
      activeProvider?: string;
      providers?: Record<string, Partial<ProviderCredentials>>;
    };

    const activeProviderRaw =
      record.activeProvider === "grok" ? "groq" : record.activeProvider;
    const activeProvider =
      activeProviderRaw && activeProviderRaw in AI_PROVIDER_META
        ? (activeProviderRaw as AiProviderId)
        : DEFAULT_AI_CONFIG.activeProvider;

    const providers: AiConfig["providers"] = {};
    if (record.providers && typeof record.providers === "object") {
      for (const [rawId, entry] of Object.entries(record.providers)) {
        const id = (rawId === "grok" ? "groq" : rawId) as AiProviderId;
        if (!(id in AI_PROVIDER_META)) continue;
        if (!entry || typeof entry !== "object") continue;
        const creds = entry as Partial<ProviderCredentials>;
        if (typeof creds.apiKey !== "string") continue;
        providers[id] = {
          apiKey: creds.apiKey,
          model:
            typeof creds.model === "string" && creds.model.trim()
              ? creds.model.trim()
              : AI_PROVIDER_META[id].defaultModel,
        };
      }
    }

    return { activeProvider, providers };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function readAiConfig(): AiConfig {
  if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
  return parseStoredConfig(localStorage.getItem(AI_CONFIG_STORAGE_KEY));
}

function getServerSnapshot(): AiConfig {
  return DEFAULT_AI_CONFIG;
}

export function writeAiConfig(config: AiConfig): void {
  localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event(AI_CONFIG_CHANGE_EVENT));
}

export function updateProviderCredentials(
  provider: AiProviderId,
  credentials: ProviderCredentials,
): AiConfig {
  const current = readAiConfig();
  const next: AiConfig = {
    ...current,
    providers: {
      ...current.providers,
      [provider]: {
        apiKey: credentials.apiKey.trim(),
        model:
          credentials.model.trim() || AI_PROVIDER_META[provider].defaultModel,
      },
    },
  };
  writeAiConfig(next);
  return next;
}

export function setActiveProvider(provider: AiProviderId): AiConfig {
  const current = readAiConfig();
  const next: AiConfig = { ...current, activeProvider: provider };
  writeAiConfig(next);
  return next;
}

export function clearProviderCredentials(provider: AiProviderId): AiConfig {
  const current = readAiConfig();
  const providers = { ...current.providers };
  delete providers[provider];
  const next: AiConfig = { ...current, providers };
  writeAiConfig(next);
  return next;
}

export function openAiSettings(): void {
  window.dispatchEvent(new Event(AI_SETTINGS_OPEN_EVENT));
}

export function useAiConfig(): AiConfig {
  return useSyncExternalStore(subscribe, readAiConfig, getServerSnapshot);
}
