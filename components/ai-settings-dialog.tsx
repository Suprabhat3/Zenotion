"use client";

import { useState } from "react";
import {
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AI_PROVIDER_META,
  AI_PROVIDERS,
  getActiveCredentials,
  getProviderLabel,
  isAiConfigured,
  type AiProviderId,
} from "@/lib/ai-providers";
import {
  clearProviderCredentials,
  readAiConfig,
  setActiveProvider,
  updateProviderCredentials,
  useAiConfig,
} from "@/lib/ai-storage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AiSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ProviderFormState = {
  apiKey: string;
  model: string;
  customModel: boolean;
};

function buildFormState(provider: AiProviderId): ProviderFormState {
  const stored = readAiConfig().providers[provider];
  const meta = AI_PROVIDER_META[provider];
  const model = stored?.model ?? meta.defaultModel;
  const isPreset = meta.models.includes(model);

  return {
    apiKey: stored?.apiKey ?? "",
    model,
    customModel: meta.allowCustomModel && !isPreset,
  };
}

export function AiSettingsDialog({ open, onOpenChange }: AiSettingsDialogProps) {
  const config = useAiConfig();
  const [selectedProvider, setSelectedProvider] = useState<AiProviderId>(
    config.activeProvider,
  );
  const [form, setForm] = useState<ProviderFormState>(() =>
    buildFormState(config.activeProvider),
  );
  const [showKey, setShowKey] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setSelectedProvider(config.activeProvider);
      setForm(buildFormState(config.activeProvider));
      setShowKey(false);
    }
    onOpenChange(next);
  }

  function handleProviderChange(provider: AiProviderId) {
    setSelectedProvider(provider);
    setForm(buildFormState(provider));
    setShowKey(false);
  }

  async function handleSave() {
    const meta = AI_PROVIDER_META[selectedProvider];
    const model = form.customModel ? form.model.trim() : form.model;
    const apiKey = form.apiKey.trim() || storedKey?.trim() || "";

    if (!apiKey) {
      toast.error("Enter an API key before saving.");
      return;
    }

    if (!model) {
      toast.error("Choose a model before saving.");
      return;
    }

    await updateProviderCredentials(selectedProvider, {
      apiKey,
      model,
    });
    await setActiveProvider(selectedProvider);
    toast.success(`${meta.name} saved and set as active provider.`);
    handleOpenChange(false);
  }

  async function handleClearKey() {
    await clearProviderCredentials(selectedProvider);
    setForm((current) => ({ ...current, apiKey: "" }));
    toast.success("API key removed from this browser.");
  }

  const meta = AI_PROVIDER_META[selectedProvider];
  const storedKey = config.providers[selectedProvider]?.apiKey;
  const hasStoredKey = Boolean(storedKey?.trim());
  const configured = isAiConfigured(config);
  const activeLabel = configured
    ? `${getProviderLabel(config.activeProvider)} · ${getActiveCredentials(config)?.model}`
    : "Not configured";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI settings
          </DialogTitle>
          <DialogDescription>
            Zenotion is free — bring your own API keys to unlock AI features.
          </DialogDescription>
        </DialogHeader>

        {/* Trust / security banner */}
        <div className="clay-inset rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold leading-none">
                  Your API key is encrypted before saving
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-400">
                  <Shield className="h-2.5 w-2.5" />
                  AES-256 encrypted
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                We use AES-256-GCM encryption — the same standard banks use — to
                encrypt your key before it ever touches browser storage. Browser
                extensions and other tabs on the same device can&apos;t read it in
                plain text. Your key is never stored in our database; it is only
                decrypted on-device when you trigger an AI action.
              </p>
              <div className="flex flex-wrap gap-3 pt-0.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  Never sent to our database
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  Encrypted at rest in your browser
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  Not logged or cached server-side
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-border/50 pt-3">
            <p className="text-xs text-muted-foreground">
              Active provider:{" "}
              <span className="font-medium text-foreground">{activeLabel}</span>
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[11rem_minmax(0,1fr)]">
          <div className="space-y-1">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Providers
            </p>
            <div className="space-y-1">
              {AI_PROVIDERS.map((provider) => {
                const providerMeta = AI_PROVIDER_META[provider];
                const isActive = config.activeProvider === provider;
                const hasKey = Boolean(config.providers[provider]?.apiKey.trim());

                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => handleProviderChange(provider)}
                    className={cn(
                      "clay-nav-item flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left text-sm",
                      selectedProvider === provider && "clay-nav-item-active",
                    )}
                  >
                    <span className="truncate">{providerMeta.name}</span>
                    <span className="flex items-center gap-1">
                      {hasKey && (
                        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                      {isActive && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          Active
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-medium">{meta.name}</h3>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
              <a
                href={meta.keyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-foreground underline-offset-4 hover:underline"
              >
                Get an API key
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ai-api-key">API key</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="ai-api-key"
                  type={showKey ? "text" : "password"}
                  value={form.apiKey}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, apiKey: e.target.value }))
                  }
                  placeholder={hasStoredKey && !form.apiKey ? "Key saved — enter to replace" : meta.keyPlaceholder}
                  className="pl-9 pr-10"
                  autoComplete="off"
                  spellCheck={false}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => setShowKey((value) => !value)}
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {hasStoredKey && !form.apiKey
                  ? `Encrypted key saved for ${meta.name} — enter a new one to replace it.`
                  : "Your key will be AES-256 encrypted before being saved to this browser."}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ai-model">Model</Label>
              {form.customModel ? (
                <Input
                  id="ai-model"
                  value={form.model}
                  onChange={(e) =>
                    setForm((current) => ({ ...current, model: e.target.value }))
                  }
                  placeholder={meta.defaultModel}
                  spellCheck={false}
                />
              ) : (
                <select
                  id="ai-model"
                  value={form.model}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "__custom__") {
                      setForm((current) => ({
                        ...current,
                        customModel: true,
                        model: "",
                      }));
                      return;
                    }
                    setForm((current) => ({ ...current, model: value }));
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm clay-inset outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {meta.models.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                  {meta.allowCustomModel && (
                    <option value="__custom__">Custom model…</option>
                  )}
                </select>
              )}
              {form.customModel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-0 text-xs"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      customModel: false,
                      model: meta.defaultModel,
                    }))
                  }
                >
                  Back to preset models
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleClearKey}
            disabled={!hasStoredKey && !form.apiKey.trim()}
          >
            <Trash2 className="h-4 w-4" />
            Remove saved key
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save & use {meta.name}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
