// Queue client stub. Install BullMQ or alternative in Phase 2 and implement.

export type JobPayload = {
  type: string;
  data: Record<string, unknown>;
};

export const enqueue = async (job: JobPayload) => {
  // No-op for now. Phase 2 will wire this to Redis-backed queue.
  console.debug('Enqueue called (stub)', job.type);
  return { id: 'stub-job-id' };
};

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>