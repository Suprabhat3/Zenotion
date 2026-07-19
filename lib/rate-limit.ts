/**
 * Simple in-memory sliding-window rate limiter for API routes.
 * Suitable for single-instance deployments (hackathon / small prod).
 */

type Bucket = {
  timestamps: number[];
  inFlight: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterMs: number };

export type RateLimitOptions = {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Max concurrent in-flight requests for this key (0 = unlimited). */
  maxConcurrent?: number;
};

function getBucket(key: string): Bucket {
  const existing = buckets.get(key);
  if (existing) return existing;
  const created: Bucket = { timestamps: [], inFlight: 0 };
  buckets.set(key, created);
  return created;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const bucket = getBucket(key);
  bucket.timestamps = bucket.timestamps.filter(
    (ts) => now - ts < options.windowMs,
  );

  if (
    options.maxConcurrent !== undefined &&
    options.maxConcurrent > 0 &&
    bucket.inFlight >= options.maxConcurrent
  ) {
    return { ok: false, retryAfterMs: options.windowMs };
  }

  if (bucket.timestamps.length >= options.limit) {
    const oldest = bucket.timestamps[0] ?? now;
    return { ok: false, retryAfterMs: Math.max(0, options.windowMs - (now - oldest)) };
  }

  return { ok: true };
}

export function beginRateLimitedRequest(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const result = checkRateLimit(key, options);
  if (!result.ok) return result;

  const bucket = getBucket(key);
  bucket.timestamps.push(Date.now());
  bucket.inFlight += 1;
  return { ok: true };
}

export function endRateLimitedRequest(key: string): void {
  const bucket = buckets.get(key);
  if (!bucket) return;
  bucket.inFlight = Math.max(0, bucket.inFlight - 1);
}
