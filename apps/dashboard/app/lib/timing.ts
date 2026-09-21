export async function withTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round((performance.now() - start) * 100) / 100;
    console.log(`[TIMING] ${label} finished in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Math.round((performance.now() - start) * 100) / 100;
    console.error(`[TIMING] ${label} failed after ${duration}ms:`, error);
    throw error;
  }
}
