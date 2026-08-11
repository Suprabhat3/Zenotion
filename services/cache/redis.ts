// Redis cache client stub. Phase 2 will add ioredis and env-driven config.

export const CacheClient = {
  async get(key: string) {
    return null;
  },
  async set(key: string, value: string, ttlSeconds?: number) {
    return true;
  },
  async del(key: string) {
    return true;
  }
};

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>