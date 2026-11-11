// Конфигурация кэша
const CACHE_TTL = 5 * 60 * 1000; // Время жизни кэша: 5 минут (Expiration / Stale Time)
const cacheStore = new Map();

/**
 * Cache Structure:
 * {
 *   data: any,
 *   timestamp: number
 * }
 */

// Getting data from cache by Query Key
export const getCachedData = (queryKey) => {
  const cached = cacheStore.get(queryKey);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    cacheStore.delete(queryKey); // Expiration Strategy
    return null;
  }

  return cached.data;
};

// Writing data to cache
export const setCachedData = (queryKey, data) => {
  cacheStore.set(queryKey, {
    data,
    timestamp: Date.now(),
  });
};

// Cache Invalidation by Query Key
export const invalidateCache = (queryKey) => {
  if (queryKey) {
    cacheStore.delete(queryKey);
  } else {
    cacheStore.clear(); // Полный сброс кэша
  }
};