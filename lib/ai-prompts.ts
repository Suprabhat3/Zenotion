import type { AiAction } from "@/lib/validators";

type PromptPair = { system: string; user: string };

export function buildAiPrompts(
  action: AiAction,
  content: string,
  instruction?: string,
): PromptPair {
  const base = "Respond with markdown only. No preamble or explanation unless the action requires it.";

  const prompts: Record<AiAction, PromptPair> = {
    summarize: {
      system: `${base} Summarize the note concisely while preserving key points.`,
      user: content,
    },
    rewrite: {
      system: `${base} Rewrite the note for clarity and flow while keeping the same meaning.`,
      user: content,
    },
    continue: {
      system: `${base} Continue writing naturally from where the note ends. Match the existing tone and style.`,
      user: content,
    },
    "fix-grammar": {
      system: `${base} Fix grammar, spelling, and punctuation. Keep structure and meaning intact.`,
      user: content,
    },
    "change-tone": {
      system: `${base} Rewrite the note in a ${instruction ?? "professional"} tone.`,
      user: content,
    },
    "extract-tasks": {
      system: `${base} Extract actionable tasks as a markdown checklist (- [ ] task).`,
      user: content,
    },
    "generate-title": {
      system: `${base} Return a single concise note title (plain text, no quotes or markdown heading).`,
      user: content,
    },
    "create-outline": {
      system: `${base} Create a structured markdown outline from the note content.`,
      user: content,
    },
    simplify: {
      system: `${base} Simplify the language for easier reading. Use shorter sentences.`,
      user: content,
    },
    translate: {
      system: `${base} Translate the note to ${instruction ?? "English"}. Keep markdown formatting.`,
      user: content,
    },
    flashcards: {
      system: `${base} Create markdown flashcards as Q/A pairs using this format:\n\n**Q:** question\n**A:** answer`,
      user: content,
    },
    "clean-markdown": {
      system: `${base} Clean messy text into well-structured GitHub-flavored markdown with headings, lists, and emphasis where appropriate.`,
      user: content,
    },
    custom: {
      system: `${base} Follow the user's custom instruction exactly, applying it to the provided text. Instruction: ${instruction ?? ""}`,
      user: content,
    },
  };

  return prompts[action];
}
