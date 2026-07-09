/**
 * services.ts
 * Small services barrel and types to start Phase 1 modularization.
 * Keep this file minimal — real implementations will live under services/ in Phase 1.
 */

export interface Service {
  name: string;
  init?: () => Promise<void>;
}

export const services: Record<string, Service> = {};

// Example: import and register concrete service modules under services/ in Phase 1

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>