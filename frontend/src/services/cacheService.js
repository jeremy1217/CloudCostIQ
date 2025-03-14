import { isEqual } from 'lodash';

class CacheService {
    constructor() {
        this.memoryCache = new Map();
        this.DEFAULT_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    }

    // Generate a cache key based on the parameters
    generateCacheKey(prefix, params = {}) {
        return `${prefix}:${JSON.stringify(params)}`;
    }

    // Set data in both memory and localStorage
    set(key, data, expiration = this.DEFAULT_EXPIRATION) {
        const cacheItem = {
            data,
            timestamp: Date.now(),
            expiration
        };

        // Store in memory
        this.memoryCache.set(key, cacheItem);

        // Store in localStorage
        try {
            localStorage.setItem(key, JSON.stringify(cacheItem));
        } catch (error) {
            console.warn('Failed to store in localStorage:', error);
        }
    }

    // Get data from cache (memory first, then localStorage)
    get(key) {
        // Try memory cache first
        const memoryItem = this.memoryCache.get(key);
        if (memoryItem) {
            if (this.isExpired(memoryItem)) {
                this.delete(key);
                return null;
            }
            return memoryItem.data;
        }

        // Try localStorage if not in memory
        try {
            const storedItem = localStorage.getItem(key);
            if (storedItem) {
                const parsedItem = JSON.parse(storedItem);
                if (this.isExpired(parsedItem)) {
                    this.delete(key);
                    return null;
                }
                // Restore to memory cache
                this.memoryCache.set(key, parsedItem);
                return parsedItem.data;
            }
        } catch (error) {
            console.warn('Failed to retrieve from localStorage:', error);
        }

        return null;
    }

    // Check if cached data is expired
    isExpired(cacheItem) {
        return Date.now() - cacheItem.timestamp > cacheItem.expiration;
    }

    // Delete from both memory and localStorage
    delete(key) {
        this.memoryCache.delete(key);
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    }

    // Clear all cache
    clear() {
        this.memoryCache.clear();
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }

    // Get data with automatic caching
    async getOrSet(key, fetchFn, expiration = this.DEFAULT_EXPIRATION) {
        const cachedData = this.get(key);
        if (cachedData) {
            return cachedData;
        }

        const freshData = await fetchFn();
        this.set(key, freshData, expiration);
        return freshData;
    }

    // Invalidate cache based on prefix
    invalidateByPrefix(prefix) {
        // Memory cache
        for (const key of this.memoryCache.keys()) {
            if (key.startsWith(prefix)) {
                this.memoryCache.delete(key);
            }
        }

        // localStorage
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith(prefix)) {
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.warn('Failed to invalidate localStorage:', error);
        }
    }

    // Check if data needs refresh based on last update time
    needsRefresh(key, maxAge = this.DEFAULT_EXPIRATION) {
        const cachedItem = this.memoryCache.get(key) || JSON.parse(localStorage.getItem(key) || 'null');
        if (!cachedItem) return true;
        return Date.now() - cachedItem.timestamp > maxAge;
    }
}

export default new CacheService(); 