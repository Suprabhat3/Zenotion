import { providers } from '../../lib/providers';

export async function generateFromPrompt(prompt: string, providerId = 'openai'){
  const provider = providers[providerId];
  if (!provider) throw new Error('AI provider not configured');
  return provider.generate({ prompt });
}

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>