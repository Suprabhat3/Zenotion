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

// ---------------------------------------------------------------------------
// AES-GCM obfuscation helpers — API keys are not stored as plaintext, but this
// is NOT a strong secret store. Any same-origin script can derive the key.
// Prefer CSP hardening; treat persisted keys as convenience, not vault-grade.
// ---------------------------------------------------------------------------

const CRYPTO_SALT = "zenotion-ai-salt-v1";
const CRYPTO_ITERATIONS = 100_000;

async function getDerivedKey(): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(
    `${window.location.origin}::${CRYPTO_SALT}`,
  );
  const baseKey = await crypto.subtle.importKey("raw", raw, "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(CRYPTO_SALT),
      iterations: CRYPTO_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptString(plaintext: string): Promise<string> {
  const key = await getDerivedKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );
  // Combine iv + ciphertext and base64-encode for storage.
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

async function decryptString(stored: string): Promise<string> {
  const key = await getDerivedKey();
  const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext,
  );
  return new TextDecoder().decode(plaintext);
}

function subscribe(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(AI_CONFIG_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(AI_CONFIG_CHANGE_EVENT, handler);
  };
}

// Stored shape — apiKey is AES-GCM encrypted, prefixed with "enc:" so we can
// detect legacy plaintext entries and migrate them transparently.
type StoredEntry = { apiKey: string; model: string };
type StoredConfig = {
  activeProvider?: string;
  providers?: Record<string, StoredEntry>;
};

const ENC_PREFIX = "enc:";

async function decryptApiKey(stored: string): Promise<string> {
  if (!stored.startsWith(ENC_PREFIX)) {
    // Legacy plaintext — return as-is; it will be re-encrypted on next write.
    return stored;
  }
  try {
    return await decryptString(stored.slice(ENC_PREFIX.length));
  } catch {
    return "";
  }
}

async function encryptApiKey(plaintext: string): Promise<string> {
  return ENC_PREFIX + (await encryptString(plaintext));
}

async function parseStoredConfig(raw: string | null): Promise<AiConfig> {
  if (!raw) return DEFAULT_AI_CONFIG;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_AI_CONFIG;

    const record = parsed as StoredConfig;

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
        if (typeof entry.apiKey !== "string") continue;

        const apiKey = await decryptApiKey(entry.apiKey);
        if (!apiKey) continue;

        providers[id] = {
          apiKey,
          model:
            typeof entry.model === "string" && entry.model.trim()
              ? entry.model.trim()
              : AI_PROVIDER_META[id].defaultModel,
        };
      }
    }

    return { activeProvider, providers };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

// ---------------------------------------------------------------------------
// Sync snapshot for useSyncExternalStore — we keep a cached decrypted config
// so re-renders don't trigger repeated decryption round-trips.
// ---------------------------------------------------------------------------

let cachedRaw: string | null = null;
let cachedConfig: AiConfig = DEFAULT_AI_CONFIG;
// Promise in flight so concurrent calls coalesce onto a single decryption run.
let pendingLoad: Promise<AiConfig> | null = null;

export function readAiConfig(): AiConfig {
  if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
  const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
  if (raw === cachedRaw) return cachedConfig;

  // Kick off async decryption in the background; return stale cache immediately
  // so the synchronous snapshot stays stable for React.
  if (!pendingLoad) {
    pendingLoad = parseStoredConfig(raw).then((config) => {
      cachedRaw = raw;
      cachedConfig = config;
      pendingLoad = null;
      // Notify subscribers so React re-renders with the decrypted values.
      window.dispatchEvent(new Event(AI_CONFIG_CHANGE_EVENT));
      return config;
    });
  }

  return cachedConfig;
}

/** Resolves once the stored config is fully decrypted. Use before AI calls. */
export async function readAiConfigAsync(): Promise<AiConfig> {
  if (typeof window === "undefined") return DEFAULT_AI_CONFIG;
  if (pendingLoad) return pendingLoad;
  const raw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
  if (raw === cachedRaw) return cachedConfig;
  return parseStoredConfig(raw).then((config) => {
    cachedRaw = raw;
    cachedConfig = config;
    return config;
  });
}

function getServerSnapshot(): AiConfig {
  return DEFAULT_AI_CONFIG;
}

export async function writeAiConfig(config: AiConfig): Promise<void> {
  // Encrypt each apiKey before persisting.
  const encryptedProviders: Record<string, StoredEntry> = {};
  for (const [id, creds] of Object.entries(config.providers)) {
    encryptedProviders[id] = {
      apiKey: await encryptApiKey(creds.apiKey),
      model: creds.model,
    };
  }
  const stored: StoredConfig = {
    activeProvider: config.activeProvider,
    providers: encryptedProviders,
  };
  localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(stored));
  // Update cache with the plaintext config so the next readAiConfig() is fast.
  cachedRaw = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
  cachedConfig = config;
  window.dispatchEvent(new Event(AI_CONFIG_CHANGE_EVENT));
}

export async function updateProviderCredentials(
  provider: AiProviderId,
  credentials: ProviderCredentials,
): Promise<AiConfig> {
  const current = await readAiConfigAsync();
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
  await writeAiConfig(next);
  return next;
}

export async function setActiveProvider(
  provider: AiProviderId,
): Promise<AiConfig> {
  const current = await readAiConfigAsync();
  const next: AiConfig = { ...current, activeProvider: provider };
  await writeAiConfig(next);
  return next;
}

export async function clearProviderCredentials(
  provider: AiProviderId,
): Promise<AiConfig> {
  const current = await readAiConfigAsync();
  const providers = { ...current.providers };
  delete providers[provider];
  const next: AiConfig = { ...current, providers };
  await writeAiConfig(next);
  return next;
}

export function openAiSettings(): void {
  window.dispatchEvent(new Event(AI_SETTINGS_OPEN_EVENT));
}

export function useAiConfig(): AiConfig {
  return useSyncExternalStore(subscribe, readAiConfig, getServerSnapshot);
}
