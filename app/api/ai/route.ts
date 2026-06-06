import { fail, ok, handleApiError } from "@/lib/api";
import {
  AiProviderError,
  mapProviderErrorMessage,
  runAiCompletion,
} from "@/lib/ai-completion";
import { buildAiPrompts } from "@/lib/ai-prompts";
import { requireUser } from "@/lib/session";
import { aiRequestSchema, parseOrThrow } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    await requireUser();

    const body: unknown = await request.json();
    const input = parseOrThrow(aiRequestSchema, body);
    const { system, user } = buildAiPrompts(
      input.action,
      input.content,
      input.instruction,
    );

    const result = await runAiCompletion({
      provider: input.provider,
      apiKey: input.apiKey,
      model: input.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    return ok({ result, action: input.action });
  } catch (error) {
    if (error instanceof AiProviderError) {
      console.error(`[ai] ${error.provider} error:`, error.message);
      return fail("SERVICE_UNAVAILABLE", mapProviderErrorMessage(error));
    }
    return handleApiError(error);
  }
}
