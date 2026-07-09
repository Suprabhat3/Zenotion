import OpenAI from 'openai';
import { env } from '../../lib/env';
import { AIProvider } from '../../lib/providers';

const client = typeof env.OPENAI_API_KEY === 'string' && env.OPENAI_API_KEY.length > 0
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

export const OpenAIAdapter: AIProvider = {
  id: 'openai',
  name: 'OpenAI',
  generate: async ({ prompt, maxTokens = 512, temperature = 0.7 }) => {
    if (!client) throw new Error('OpenAI API key missing');
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature
    } as any);

    const text = Array.isArray(res.choices) && res.choices[0]?.message?.content
      ? res.choices[0].message.content
      : (res as any).text || '';

    return { text };
  }
};

// Register default provider into providers record (safe to import)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const providersModule = require('../../lib/providers');
  if (providersModule && providersModule.providers) {
    providersModule.providers[OpenAIAdapter.id] = OpenAIAdapter;
  }
} catch (e) {
  // ignore in environments where require cache differs
}

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>