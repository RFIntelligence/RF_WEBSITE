const TIMING_THRESHOLD_MS = 1000;

export async function withTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const debug = process.env.DEBUG_TIMING === "true" || process.env.DEBUG_PRISMA_QUERIES === "true";
  try {
    const result = await fn();
    const duration = Math.round((performance.now() - start) * 100) / 100;
    // Only log slow operations (>1000ms) by default to avoid noisy console spam,
    // or log everything if debug timing is enabled
    if (duration >= TIMING_THRESHOLD_MS || debug) {
      console.log(`[TIMING SLOW] ${label} finished in ${duration}ms (threshold: ${TIMING_THRESHOLD_MS}ms)`);
    }
    return result;
  } catch (error) {
    const duration = Math.round((performance.now() - start) * 100) / 100;
    console.error(`[TIMING ERROR] ${label} failed after ${duration}ms:`, error);
    throw error;
  }
}
