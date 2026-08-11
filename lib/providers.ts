/**
 * providers.ts
 * Lightweight provider interfaces for Phase 1.
 * Implement provider adapters (openai, azure, anthropic) in providers/ in Phase 1.
 */

export type AIResponse = {
  text: string;
  tokens?: number;
};

export type AIProvider = {
  id: string;
  name: string;
  generate: (input: { prompt: string; maxTokens?: number; temperature?: number }) => Promise<AIResponse>;
};

export const providers: Record<string, AIProvider> = {};

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>