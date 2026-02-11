/**
 * Extraction Result Cache
 * Caches successful extraction results to use when API is unavailable
 */

import { ExtractionResult } from '../types';

export interface CachedExtraction {
  inputHash: string;
  result: ExtractionResult;
  timestamp: number;
  inputLength: number;
}

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_STORAGE_KEY = 'bookly_extraction_cache';
const MAX_CACHE_ENTRIES = 50;

/**
 * Create a simple hash from input string
 */
const createHash = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
  }
  return Math.abs(hash).toString(36);
};

/**
 * Get cache from localStorage
 */
const getCache = (): Record<string, CachedExtraction> => {
  try {
    const cached = localStorage.getItem(CACHE_STORAGE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    console.error('Cache read error:', e);
    return {};
  }
};

/**
 * Save cache to localStorage
 */
const saveCache = (cache: Record<string, CachedExtraction>): void => {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Cache write error:', e);
  }
};

/**
 * Retrieve cached extraction result
 */
export const getCachedExtraction = (input: string): ExtractionResult | null => {
  if (!input || !input.trim()) {
    return null;
  }

  try {
    const hash = createHash(input);
    const cache = getCache();
    const entry = cache[hash];

    if (entry) {
      // Check if cache is still valid
      if (Date.now() - entry.timestamp < CACHE_DURATION_MS) {
        console.log('✅ Using cached extraction result');
        return { ...entry.result, confidence: 'cached' as any };
      } else {
        // Remove expired entry
        delete cache[hash];
        saveCache(cache);
      }
    }
  } catch (e) {
    console.error('Cache retrieval error:', e);
  }

  return null;
};

/**
 * Store extraction result in cache
 */
export const setCachedExtraction = (input: string, result: ExtractionResult): void => {
  if (!input || !input.trim() || !result) {
    return;
  }

  try {
    const hash = createHash(input);
    const cache = getCache();

    // Add new entry
    cache[hash] = {
      inputHash: hash,
      result,
      timestamp: Date.now(),
      inputLength: input.length
    };

    // Cleanup old entries if cache is too large
    const entries = Object.entries(cache);
    if (entries.length > MAX_CACHE_ENTRIES) {
      // Sort by timestamp and keep only the newest
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const newCache: Record<string, CachedExtraction> = {};
      entries.slice(0, MAX_CACHE_ENTRIES).forEach(([key, value]) => {
        newCache[key] = value;
      });
      saveCache(newCache);
    } else {
      saveCache(cache);
    }

    console.log('💾 Cached extraction result');
  } catch (e) {
    console.error('Cache storage error:', e);
  }
};

/**
 * Clear all cached extractions
 */
export const clearExtractionCache = (): void => {
  try {
    localStorage.removeItem(CACHE_STORAGE_KEY);
    console.log('🗑️ Extraction cache cleared');
  } catch (e) {
    console.error('Cache clear error:', e);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): { entries: number; size: string } => {
  try {
    const cache = getCache();
    const entries = Object.keys(cache).length;
    const cacheJson = JSON.stringify(cache);
    const sizeKB = (new Blob([cacheJson]).size / 1024).toFixed(2);

    return { entries, size: `${sizeKB}KB` };
  } catch (e) {
    console.error('Cache stats error:', e);
    return { entries: 0, size: '0KB' };
  }
};
