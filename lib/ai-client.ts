import type { AiAction } from "@/lib/validators";
import type { ApiResponse } from "@/lib/api";
import type { AiConfig } from "@/lib/ai-providers";
import { getActiveCredentials } from "@/lib/ai-providers";

export type AiRequestResult = {
  result: string;
  action: AiAction;
};

export async function requestAiCompletion(
  aiConfig: AiConfig,
  input: {
    action: AiAction;
    content: string;
    instruction?: string;
  },
): Promise<AiRequestResult> {
  const credentials = getActiveCredentials(aiConfig);
  if (!credentials) {
    throw new Error("Add an API key in AI settings first.");
  }

  const res = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "Zenotion",
    },
    body: JSON.stringify({
      action: input.action,
      content: input.content,
      instruction: input.instruction,
      provider: aiConfig.activeProvider,
      model: credentials.model,
      apiKey: credentials.apiKey,
    }),
  });

  const json = (await res.json()) as ApiResponse<AiRequestResult>;
  if (!json.success) {
    throw new Error(json.error.message);
  }

  return json.data;
}
