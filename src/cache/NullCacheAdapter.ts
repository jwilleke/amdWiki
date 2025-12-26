import ICacheAdapter, { type CacheStats } from './ICacheAdapter';

/**
 * Null cache adapter - no-op implementation
 * Used when caching is disabled or for testing
 */
class NullCacheAdapter extends ICacheAdapter {
  constructor() {
    super();
  }

  get<T = unknown>(): Promise<T | undefined> {
    return Promise.resolve(undefined);
  }

  set(): Promise<void> {
    return Promise.resolve();
  }

  del(): Promise<void> {
    return Promise.resolve();
  }

  clear(): Promise<void> {
    return Promise.resolve();
  }

  keys(): Promise<string[]> {
    const emptyArray: string[] = [];
    return Promise.resolve(emptyArray);
  }

  stats(): Promise<CacheStats> {
    return Promise.resolve({
      hits: 0,
      misses: 0,
      keys: 0,
      ksize: 0,
      vsize: 0
    });
  }

  isHealthy(): Promise<boolean> {
    return Promise.resolve(true);
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}

export default NullCacheAdapter;
