import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiResponseTimes: Record<string, number>;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    apiResponseTimes: {}
  });

  useEffect(() => {
    // Measure initial load time
    const loadTime = performance.now();
    
    // Measure render time
    const renderStart = performance.now();
    
    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      const renderEnd = performance.now();
      setMetrics(prev => ({
        ...prev,
        loadTime,
        renderTime: renderEnd - renderStart
      }));
    });

    // Monitor navigation timing if available
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        console.log('Performance Metrics:', {
          DNS: nav.domainLookupEnd - nav.domainLookupStart,
          TCP: nav.connectEnd - nav.connectStart,
          Request: nav.responseStart - nav.requestStart,
          Response: nav.responseEnd - nav.responseStart,
          DOM: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          Load: nav.loadEventEnd - nav.loadEventStart,
        });
      }
    }
  }, []);

  const trackApiCall = (endpoint: string, startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    setMetrics(prev => ({
      ...prev,
      apiResponseTimes: {
        ...prev.apiResponseTimes,
        [endpoint]: duration
      }
    }));

    // Log slow API calls
    if (duration > 1000) {
      console.warn(`Slow API call detected: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
  };

  return { metrics, trackApiCall };
};