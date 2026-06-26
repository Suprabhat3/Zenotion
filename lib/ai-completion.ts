import OpenAI from "openai";
import type { AiProviderId } from "@/lib/ai-providers";

export type ChatMessage = {
  role: "system" | "user";
  content: string;
};

export type CompletionInput = {
  provider: AiProviderId;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
};

export class AiProviderError extends Error {
  readonly provider: AiProviderId;
  readonly status?: number;

  constructor(provider: AiProviderId, message: string, status?: number) {
    super(message);
    this.name = "AiProviderError";
    this.provider = provider;
    this.status = status;
  }
}

function isOpenAiReasoningModel(model: string): boolean {
  const normalized = model.toLowerCase();
  return normalized.startsWith("gpt-5") || /^o[134]/.test(normalized);
}

function buildOpenAiCompatibleParams(
  provider: AiProviderId,
  input: CompletionInput,
): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
  const reasoning = provider === "openai" && isOpenAiReasoningModel(input.model);
  const tokenLimit = input.maxTokens ?? (reasoning ? 4096 : 2000);

  if (provider === "openai") {
    const params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model: input.model,
      messages: input.messages,
      max_completion_tokens: tokenLimit,
    };

    if (!reasoning) {
      params.temperature = input.temperature ?? 0.4;
    }

    return params;
  }

  return {
    model: input.model,
    messages: input.messages,
    temperature: input.temperature ?? 0.4,
    max_tokens: tokenLimit,
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object") {
      const record = body as Record<string, unknown>;
      if (typeof record.error === "string") return record.error;
      if (record.error && typeof record.error === "object") {
        const err = record.error as Record<string, unknown>;
        if (typeof err.message === "string") return err.message;
      }
      if (typeof record.message === "string") return record.message;
    }
  } catch {
    // Fall through to generic message.
  }
  return "The AI provider rejected the request. Check your API key and model.";
}

async function completeOpenAiCompatible(
  provider: AiProviderId,
  baseURL: string,
  input: CompletionInput,
  extraHeaders?: Record<string, string>,
): Promise<string> {
  const client = new OpenAI({
    apiKey: input.apiKey,
    baseURL,
    defaultHeaders: extraHeaders,
  });

  try {
    const completion = await client.chat.completions.create(
      buildOpenAiCompatibleParams(provider, input),
    );

    const result = completion.choices[0]?.message?.content?.trim();
    if (!result) {
      throw new AiProviderError(provider, "The AI provider returned an empty response.");
    }
    return result;
  } catch (error) {
    if (error instanceof AiProviderError) throw error;
    if (error instanceof OpenAI.APIError) {
      throw new AiProviderError(provider, error.message, error.status);
    }
    throw error;
  }
}

async function completeGemini(input: CompletionInput): Promise<string> {
  const system = input.messages.find((m) => m.role === "system")?.content;
  const user = input.messages.find((m) => m.role === "user")?.content ?? "";

  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent`,
  );
  url.searchParams.set("key", input.apiKey);

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature: input.temperature ?? 0.4,
      maxOutputTokens: input.maxTokens ?? 2000,
    },
  };

  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new AiProviderError(
      "gemini",
      await readErrorMessage(response),
      response.status,
    );
  }

  const json: unknown = await response.json();
  const record = json as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = record.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new AiProviderError("gemini", "The AI provider returned an empty response.");
  }

  return text;
}

async function completeAnthropic(input: CompletionInput): Promise<string> {
  const system = input.messages.find((m) => m.role === "system")?.content ?? "";
  const user = input.messages.find((m) => m.role === "user")?.content ?? "";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: input.model,
      max_tokens: input.maxTokens ?? 2000,
      temperature: input.temperature ?? 0.4,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!response.ok) {
    throw new AiProviderError(
      "anthropic",
      await readErrorMessage(response),
      response.status,
    );
  }

  const json: unknown = await response.json();
  const record = json as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text = record.content
    ?.filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new AiProviderError(
      "anthropic",
      "The AI provider returned an empty response.",
    );
  }

  return text;
}

export async function runAiCompletion(input: CompletionInput): Promise<string> {
  switch (input.provider) {
    case "openai":
      return completeOpenAiCompatible("openai", "https://api.openai.com/v1", input);
    case "groq":
      return completeOpenAiCompatible("groq", "https://api.groq.com/openai/v1", input);
    case "openrouter":
      return completeOpenAiCompatible(
        "openrouter",
        "https://openrouter.ai/api/v1",
        input,
        {
          "HTTP-Referer": "https://zenotion.app",
          "X-Title": "Zenotion",
        },
      );
    case "gemini":
      return completeGemini(input);
    case "anthropic":
      return completeAnthropic(input);
    default: {
      const exhaustive: never = input.provider;
      throw new AiProviderError(exhaustive, "Unsupported AI provider.");
    }
  }
}

export function mapProviderErrorMessage(error: AiProviderError): string {
  if (error.status === 401 || error.status === 403) {
    return "Invalid API key for the selected provider. Update your key in AI settings.";
  }
  if (error.status === 429) {
    return "Rate limit reached. Wait a moment or switch models/providers.";
  }
  if (error.status === 404) {
    return "Model not found. Choose a different model in AI settings.";
  }
  return error.message;
}
