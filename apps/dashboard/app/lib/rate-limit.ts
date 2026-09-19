/**
 * In-memory fixed-window rate limiter.
 *
 * This is sufficient for a single-instance/demo deployment. For horizontally
 * scaled/serverless production use, back this with a shared store (e.g. Redis /
 * Upstash) using the same `rateLimit` contract.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
  now: number = Date.now(),
): RateLimitResult {
  const cutoff = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((timestamp) => timestamp > cutoff);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    const retryAfterMs = hits[0] + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  hits.push(now);
  buckets.set(key, hits);

  return {
    allowed: true,
    remaining: limit - hits.length,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(key?: string): void {
  if (key === undefined) {
    buckets.clear();
    return;
  }
  buckets.delete(key);
}
