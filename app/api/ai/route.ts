import { fail, ok, handleApiError, ApiError } from "@/lib/api";
import {
  AiProviderError,
  mapProviderErrorMessage,
  runAiCompletion,
} from "@/lib/ai-completion";
import { buildAiPrompts } from "@/lib/ai-prompts";
import {
  beginRateLimitedRequest,
  endRateLimitedRequest,
} from "@/lib/rate-limit";
import { getRequestClientIp } from "@/lib/client-ip";
import { assertSameOriginMutation } from "@/lib/request-origin";
import { requireUser } from "@/lib/session";
import { aiRequestSchema, parseOrThrow } from "@/lib/validators";

const AI_TIMEOUT_MS = 45_000;
const AI_RATE_LIMIT = {
  limit: 20,
  windowMs: 60_000,
  maxConcurrent: 2,
} as const;

/** Looser cap per IP to catch abuse from shared networks / scripted clients. */
const AI_IP_RATE_LIMIT = {
  limit: 60,
  windowMs: 60_000,
  maxConcurrent: 5,
} as const;

export async function POST(request: Request) {
  let rateLimitKey: string | null = null;
  let ipRateLimitKey: string | null = null;

  try {
    assertSameOriginMutation(request);
    const user = await requireUser();
    rateLimitKey = `ai:${user.id}`;

    const allowed = beginRateLimitedRequest(rateLimitKey, AI_RATE_LIMIT);
    if (!allowed.ok) {
      throw new ApiError(
        "RATE_LIMITED",
        "Too many AI requests. Wait a moment and try again.",
        { retryAfterMs: allowed.retryAfterMs },
      );
    }

    const clientIp = getRequestClientIp(request);
    ipRateLimitKey = `ai-ip:${clientIp}`;
    const ipAllowed = beginRateLimitedRequest(ipRateLimitKey, AI_IP_RATE_LIMIT);
    if (!ipAllowed.ok) {
      throw new ApiError(
        "RATE_LIMITED",
        "Too many AI requests from this network. Wait a moment and try again.",
        { retryAfterMs: ipAllowed.retryAfterMs },
      );
    }

    const body: unknown = await request.json();
    const input = parseOrThrow(aiRequestSchema, body);
    const { system, user: userPrompt } = buildAiPrompts(
      input.action,
      input.content,
      input.instruction,
    );

    const result = await Promise.race([
      runAiCompletion({
        provider: input.provider,
        apiKey: input.apiKey,
        model: input.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new ApiError(
              "TIMEOUT",
              "The AI request timed out. Try a shorter note or try again.",
            ),
          );
        }, AI_TIMEOUT_MS);
      }),
    ]);

    return ok({ result, action: input.action });
  } catch (error) {
    if (error instanceof AiProviderError) {
      console.error(
        `[ai] ${error.provider} error status=${error.status ?? "unknown"}`,
      );
      return fail("SERVICE_UNAVAILABLE", mapProviderErrorMessage(error));
    }
    return handleApiError(error);
  } finally {
    if (rateLimitKey) {
      endRateLimitedRequest(rateLimitKey);
    }
    if (ipRateLimitKey) {
      endRateLimitedRequest(ipRateLimitKey);
    }
  }
}
