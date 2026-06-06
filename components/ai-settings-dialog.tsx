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

  function handleSave() {
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

    updateProviderCredentials(selectedProvider, {
      apiKey,
      model,
    });
    setActiveProvider(selectedProvider);
    toast.success(`${meta.name} saved and set as active provider.`);
    handleOpenChange(false);
  }

  function handleClearKey() {
    clearProviderCredentials(selectedProvider);
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

        <div className="clay-inset space-y-3 rounded-lg p-4 text-sm">
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium">Your keys stay on your device</p>
              <p className="text-muted-foreground">
                API keys are saved only in this browser&apos;s local storage. We
                never store them in our database. When you run an AI command, your
                key is sent securely to our server only to forward the request to
                your chosen provider — it is not logged or persisted.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Active provider: <span className="font-medium text-foreground">{activeLabel}</span>
          </p>
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
              {hasStoredKey && !form.apiKey && (
                <p className="text-xs text-muted-foreground">
                  A key is already saved for {meta.name} on this device.
                </p>
              )}
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
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
