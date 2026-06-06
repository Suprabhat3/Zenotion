export const AI_PROVIDERS = [
  "openai",
  "gemini",
  "anthropic",
  "groq",
  "openrouter",
] as const;

export type AiProviderId = (typeof AI_PROVIDERS)[number];

export type ProviderCredentials = {
  apiKey: string;
  model: string;
};

export type AiConfig = {
  activeProvider: AiProviderId;
  providers: Partial<Record<AiProviderId, ProviderCredentials>>;
};

export type AiProviderMeta = {
  id: AiProviderId;
  name: string;
  description: string;
  keyUrl: string;
  defaultModel: string;
  models: readonly string[];
  allowCustomModel: boolean;
  keyPlaceholder: string;
};

export const AI_PROVIDER_META: Record<AiProviderId, AiProviderMeta> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    description: "GPT-5 family models for writing, summarizing, and editing.",
    keyUrl: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-5.4-mini",
    models: [
      "gpt-5.5",
      "gpt-5.5-pro",
      "gpt-5.4",
      "gpt-5.4-mini",
      "gpt-5.4-nano",
      "gpt-4o-mini",
    ],
    allowCustomModel: true,
    keyPlaceholder: "sk-…",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    description: "Gemini 3 and 2.5 models from Google AI Studio.",
    keyUrl: "https://aistudio.google.com/apikey",
    defaultModel: "gemini-2.5-flash",
    models: [
      "gemini-3.1-pro-preview",
      "gemini-3-flash-preview",
      "gemini-3.5-flash",
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
    ],
    allowCustomModel: true,
    keyPlaceholder: "AIza…",
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude 4.x models for thoughtful writing assistance.",
    keyUrl: "https://console.anthropic.com/settings/keys",
    defaultModel: "claude-sonnet-4-6",
    models: [
      "claude-opus-4-8",
      "claude-sonnet-4-6",
      "claude-haiku-4-5",
      "claude-opus-4-7",
    ],
    allowCustomModel: true,
    keyPlaceholder: "sk-ant-…",
  },
  groq: {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast inference for Llama, GPT-OSS, and open models.",
    keyUrl: "https://console.groq.com/keys",
    defaultModel: "llama-3.3-70b-versatile",
    models: [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "meta-llama/llama-4-scout-17b-16e-instruct",
      "qwen/qwen3-32b",
    ],
    allowCustomModel: true,
    keyPlaceholder: "gsk_…",
  },
  openrouter: {
    id: "openrouter",
    name: "OpenRouter",
    description: "Access many models through one API key.",
    keyUrl: "https://openrouter.ai/keys",
    defaultModel: "openrouter/free",
    models: [
      "openrouter/free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen3-coder:free",
      "google/gemma-4-31b-it:free",
      "openai/gpt-oss-120b:free",
      "google/gemini-2.0-flash-exp:free",
      "moonshotai/kimi-k2.6:free",
    ],
    allowCustomModel: true,
    keyPlaceholder: "sk-or-…",
  },
};

export const DEFAULT_AI_CONFIG: AiConfig = {
  activeProvider: "openai",
  providers: {},
};

export function getProviderLabel(provider: AiProviderId): string {
  return AI_PROVIDER_META[provider].name;
}

export function getActiveCredentials(config: AiConfig): ProviderCredentials | null {
  const creds = config.providers[config.activeProvider];
  if (!creds?.apiKey.trim()) return null;
  return {
    apiKey: creds.apiKey.trim(),
    model: creds.model.trim() || AI_PROVIDER_META[config.activeProvider].defaultModel,
  };
}

export function isAiConfigured(config: AiConfig): boolean {
  return getActiveCredentials(config) !== null;
}
