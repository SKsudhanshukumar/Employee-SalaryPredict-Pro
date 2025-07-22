// Simple performance monitoring utility
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  private static readonly MAX_SAMPLES = 100; // Keep last 100 samples

  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const samples = this.metrics.get(name)!;
    samples.push(value);
    
    // Keep only the last MAX_SAMPLES
    if (samples.length > this.MAX_SAMPLES) {
      samples.shift();
    }
  }

  static getAverageMetric(name: string): number {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) return 0;
    
    return samples.reduce((sum, val) => sum + val, 0) / samples.length;
  }

  static getMetricStats(name: string): { avg: number; min: number; max: number; count: number } {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }
    
    return {
      avg: Math.round(samples.reduce((sum, val) => sum + val, 0) / samples.length),
      min: Math.min(...samples),
      max: Math.max(...samples),
      count: samples.length
    };
  }

  static getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((samples, name) => {
      result[name] = this.getMetricStats(name);
    });
    
    return result;
  }

  static logPerformanceReport(): void {
    console.log('\n📊 Performance Report:');
    console.log('='.repeat(50));
    
    const metrics = this.getAllMetrics();
    
    // Highlight key performance metrics
    if (metrics.prediction_total) {
      const avgTime = metrics.prediction_total.avg;
      const status = avgTime < 50 ? '🚀 EXCELLENT' : avgTime < 100 ? '⚡ GOOD' : avgTime < 200 ? '⚠️ MODERATE' : '🐌 SLOW';
      console.log(`Prediction Performance: ${status} (avg: ${avgTime}ms)`);
    }
    
    for (const [name, stats] of Object.entries(metrics)) {
      console.log(`${name}: avg=${stats.avg}ms, min=${stats.min}ms, max=${stats.max}ms (${stats.count} samples)`);
    }
    
    console.log('='.repeat(50));
  }

  static getPerformanceSummary(): { status: string; avgResponseTime: number; cacheHitRate: number } {
    const totalMetrics = this.getMetricStats('prediction_total');
    const cacheHits = this.getMetricStats('prediction_cache_hit');
    const queueHits = this.getMetricStats('prediction_queue_hit');
    
    const totalRequests = totalMetrics.count + cacheHits.count + queueHits.count;
    const cacheHitRate = totalRequests > 0 ? ((cacheHits.count + queueHits.count) / totalRequests) * 100 : 0;
    
    const avgTime = totalMetrics.avg || 0;
    const status = avgTime < 50 ? 'excellent' : avgTime < 100 ? 'good' : avgTime < 200 ? 'moderate' : 'slow';
    
    return {
      status,
      avgResponseTime: avgTime,
      cacheHitRate: Math.round(cacheHitRate)
    };
  }

  // Auto-report every 5 minutes
  static startAutoReporting(): void {
    setInterval(() => {
      if (this.metrics.size > 0) {
        this.logPerformanceReport();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
}