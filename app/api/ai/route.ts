import OpenAI from "openai";
import { fail, ok, handleApiError } from "@/lib/api";
import { buildAiPrompts } from "@/lib/ai-prompts";
import { requireUser } from "@/lib/session";
import { aiRequestSchema, parseOrThrow } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    await requireUser();

    if (!process.env.OPENAI_API_KEY) {
      return fail(
        "SERVICE_UNAVAILABLE",
        "AI assistance is not configured. Add an OPENAI_API_KEY to enable it.",
      );
    }

    const body: unknown = await request.json();
    const input = parseOrThrow(aiRequestSchema, body);
    const { system, user } = buildAiPrompts(
      input.action,
      input.content,
      input.instruction,
    );

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const result = completion.choices[0]?.message?.content?.trim();
    if (!result) {
      return fail(
        "SERVICE_UNAVAILABLE",
        "The AI provider returned an empty response. Please try again.",
      );
    }

    return ok({ result, action: input.action });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("[ai] OpenAI error:", error.message);
      return fail(
        "SERVICE_UNAVAILABLE",
        "AI assistance is temporarily unavailable. Please try again later.",
      );
    }
    return handleApiError(error);
  }
}
