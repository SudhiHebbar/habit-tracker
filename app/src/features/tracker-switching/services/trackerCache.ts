import type { TrackerWithStats, TrackerCacheEntry } from '../types/trackerSwitching.types';

const CACHE_KEY_PREFIX = 'tracker_cache_';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 10;

class TrackerCache {
  private memoryCache: Map<number, TrackerCacheEntry> = new Map();

  set(trackerId: number, data: TrackerWithStats): void {
    const now = Date.now();
    const entry: TrackerCacheEntry = {
      data,
      timestamp: now,
      expiresAt: now + CACHE_EXPIRY_MS
    };

    this.memoryCache.set(trackerId, entry);
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(`${CACHE_KEY_PREFIX}${trackerId}`, JSON.stringify(entry));
    } catch (e) {
      console.warn('Failed to save tracker to localStorage:', e);
    }

    this.enforceMaxSize();
  }

  get(trackerId: number): TrackerWithStats | null {
    const now = Date.now();
    
    // Check memory cache first
    let entry = this.memoryCache.get(trackerId);
    
    // If not in memory, check localStorage
    if (!entry) {
      try {
        const stored = localStorage.getItem(`${CACHE_KEY_PREFIX}${trackerId}`);
        if (stored) {
          entry = JSON.parse(stored) as TrackerCacheEntry;
          // Restore to memory cache if still valid
          if (entry.expiresAt > now) {
            this.memoryCache.set(trackerId, entry);
          }
        }
      } catch (e) {
        console.warn('Failed to read tracker from localStorage:', e);
      }
    }

    if (entry && entry.expiresAt > now) {
      return entry.data;
    }

    // Clean up expired entry
    this.remove(trackerId);
    return null;
  }

  remove(trackerId: number): void {
    this.memoryCache.delete(trackerId);
    try {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${trackerId}`);
    } catch (e) {
      console.warn('Failed to remove tracker from localStorage:', e);
    }
  }

  clear(): void {
    this.memoryCache.clear();
    
    // Clear from localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear tracker cache from localStorage:', e);
    }
  }

  has(trackerId: number): boolean {
    const data = this.get(trackerId);
    return data !== null;
  }

  getAll(): TrackerWithStats[] {
    const trackers: TrackerWithStats[] = [];
    const now = Date.now();

    this.memoryCache.forEach((entry, trackerId) => {
      if (entry.expiresAt > now) {
        trackers.push(entry.data);
      } else {
        this.remove(trackerId);
      }
    });

    return trackers;
  }

  private enforceMaxSize(): void {
    if (this.memoryCache.size <= MAX_CACHE_SIZE) {
      return;
    }

    // Remove oldest entries
    const sortedEntries = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    while (this.memoryCache.size > MAX_CACHE_SIZE) {
      const [trackerId] = sortedEntries.shift()!;
      this.remove(trackerId);
    }
  }

  invalidate(trackerId: number): void {
    this.remove(trackerId);
  }

  invalidateAll(): void {
    this.clear();
  }

  preload(_trackerIds: number[]): void {
    // This would trigger background loading
    // Implementation would depend on the API service
    // TODO: Implement actual preloading logic
  }
}

export const trackerCache = new TrackerCache();