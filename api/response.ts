import { APIResponse } from '../types';

export function ok<T>(data: T, message?: string): APIResponse<T> {
  return { success: true, data };
}

export function fail(code: string, message: string, details?: unknown) {
  return { success: false, error: { code, message, details } };
}

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>