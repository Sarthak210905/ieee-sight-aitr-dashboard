/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now()
    
    return fn().finally(() => {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`)
      }
    })
  }

  static measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
    }
  }

  private static recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)
  }

  static getStats(name: string) {
    const durations = this.metrics.get(name) || []
    if (durations.length === 0) return null

    const sorted = [...durations].sort((a, b) => a - b)
    return {
      count: durations.length,
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }

  static logAllStats() {
    console.log('📊 Performance Metrics:')
    this.metrics.forEach((_, name) => {
      const stats = this.getStats(name)
      if (stats) {
        console.log(`  ${name}:`, {
          count: stats.count,
          avg: `${stats.avg.toFixed(2)}ms`,
          p95: `${stats.p95.toFixed(2)}ms`
        })
      }
    })
  }
}

// Usage example:
// await PerformanceMonitor.measureAsync('fetchMembers', async () => {
//   return await fetch('/api/members')
// })
