// Optimized API client with request deduplication and caching
class OptimizedApiClient {
  private pendingRequests = new Map<string, Promise<any>>();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  private getCacheKey(url: string, options?: RequestInit): string {
    return `${url}:${JSON.stringify(options?.body || '')}`;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  async request<T>(url: string, options?: RequestInit & { cacheTtl?: number }): Promise<T> {
    const cacheKey = this.getCacheKey(url, options);
    
    // Check cache first for GET requests
    if (!options?.method || options.method === 'GET') {
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Check for pending request (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Create new request
    const requestPromise = this.executeRequest<T>(url, options);
    
    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache successful GET requests
      if (!options?.method || options.method === 'GET') {
        this.setCachedData(cacheKey, result, options?.cacheTtl);
      }
      
      return result;
    } finally {
      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async executeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text || response.statusText}`);
      }

      const data = await response.json();
      
      // Log performance
      const duration = performance.now() - startTime;
      if (duration > 500) {
        console.warn(`Slow API request: ${url} took ${duration.toFixed(2)}ms`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Clear cache manually if needed
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats for debugging
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const apiClient = new OptimizedApiClient();