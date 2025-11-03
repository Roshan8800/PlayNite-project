/**
 * Performance monitoring utilities
 * Core Web Vitals tracking, loading time analytics
 */

import { smartCache } from './cache';

// Core Web Vitals metrics
export interface CoreWebVitals {
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  lcp: number; // Largest Contentful Paint
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

// Performance metrics collector
export class PerformanceMonitor {
  private static metrics: CoreWebVitals = {
    cls: 0,
    fid: 0,
    lcp: 0,
    fcp: 0,
    ttfb: 0,
  };

  private static observers: PerformanceObserver[] = [];
  private static isInitialized = false;

  static initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.setupCoreWebVitals();
    this.setupNavigationTiming();
    this.setupResourceTiming();
    this.isInitialized = true;
  }

  private static setupCoreWebVitals(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('LCP', this.metrics.lcp);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observation not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.reportMetric('FID', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observation not supported');
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.reportMetric('CLS', this.metrics.cls);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observation not supported');
      }
    }

    // Fallback measurements using Performance API
    this.measureFallbackMetrics();
  }

  private static measureFallbackMetrics(): void {
    // First Contentful Paint
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          this.reportMetric('FCP', this.metrics.fcp);
        }
      });
    }

    // Time to First Byte
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      this.metrics.ttfb = timing.responseStart - timing.requestStart;
      this.reportMetric('TTFB', this.metrics.ttfb);
    }
  }

  private static setupNavigationTiming(): void {
    if ('performance' in window && 'addEventListener' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          if ('getEntriesByType' in performance) {
            const navigationEntries = performance.getEntriesByType('navigation') as any[];
            if (navigationEntries.length > 0) {
              const navEntry = navigationEntries[0];
              this.reportNavigationMetrics(navEntry);
            }
          }
        }, 0);
      });
    }
  }

  private static setupResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.reportResourceMetric(entry);
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource timing observation not supported');
      }
    }
  }

  private static reportMetric(name: string, value: number): void {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    // Cache metrics for batch reporting
    const cacheKey = `perf_metric_${name}`;
    smartCache.set(cacheKey, metric, { memoryTtl: 30000 }); // 30 seconds

    // Send to analytics (you can integrate with your analytics service)
    this.sendToAnalytics(metric);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    }
  }

  private static reportNavigationMetrics(navEntry: any): void {
    const metrics = {
      domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
      loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
      domInteractive: navEntry.domInteractive - navEntry.fetchStart,
      totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.reportMetric(`Navigation_${name}`, value);
    });
  }

  private static reportResourceMetric(entry: any): void {
    const duration = entry.responseEnd - entry.requestStart;
    const metric = {
      name: 'Resource_Load',
      value: duration,
      resource: entry.name,
      type: entry.initiatorType,
      timestamp: Date.now(),
    };

    // Only report slow resources (>500ms)
    if (duration > 500) {
      this.sendToAnalytics(metric);
    }
  }

  private static sendToAnalytics(metric: any): void {
    // Integrate with your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_map: { metric_value: metric.value }
      });
    }

    // Store in local storage for debugging
    try {
      const stored = localStorage.getItem('performance_metrics') || '[]';
      const metrics = JSON.parse(stored);
      metrics.push(metric);
      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100);
      }
      localStorage.setItem('performance_metrics', JSON.stringify(metrics));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  static getMetrics(): CoreWebVitals {
    return { ...this.metrics };
  }

  static getAllStoredMetrics(): any[] {
    try {
      const stored = localStorage.getItem('performance_metrics') || '[]';
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  static clearStoredMetrics(): void {
    try {
      localStorage.removeItem('performance_metrics');
    } catch {
      // Ignore errors
    }
  }

  static destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isInitialized = false;
  }
}

// Loading time analytics
export class LoadingAnalytics {
  private static loadStartTime: number = 0;
  private static milestones: Map<string, number> = new Map();

  static startTracking(): void {
    this.loadStartTime = performance.now();
    this.markMilestone('load_start');
  }

  static markMilestone(name: string): void {
    const time = performance.now() - this.loadStartTime;
    this.milestones.set(name, time);

    PerformanceMonitor['reportMetric'](`Milestone_${name}`, time);
  }

  static getMilestones(): Record<string, number> {
    const result: Record<string, number> = {};
    this.milestones.forEach((time, name) => {
      result[name] = time;
    });
    return result;
  }

  static getTotalLoadTime(): number {
    return performance.now() - this.loadStartTime;
  }

  static reportLoadComplete(): void {
    this.markMilestone('load_complete');
    const totalTime = this.getTotalLoadTime();

    // Report load time categories
    if (totalTime < 1000) {
      this.reportLoadTimeCategory('excellent', totalTime);
    } else if (totalTime < 2500) {
      this.reportLoadTimeCategory('good', totalTime);
    } else if (totalTime < 4000) {
      this.reportLoadTimeCategory('needs_improvement', totalTime);
    } else {
      this.reportLoadTimeCategory('poor', totalTime);
    }
  }

  private static reportLoadTimeCategory(category: string, time: number): void {
    PerformanceMonitor['reportMetric'](`LoadTime_${category}`, time);
  }
}

// User experience scoring
export class UXScore {
  private static scores: Map<string, number> = new Map();

  static calculateUXScore(): number {
    const metrics = PerformanceMonitor.getMetrics();

    // Core Web Vitals scoring (0-100)
    const lcpScore = this.scoreMetric(metrics.lcp, 2500, 4000); // Good: <2.5s, Poor: >4s
    const fidScore = this.scoreMetric(metrics.fid, 100, 300);   // Good: <100ms, Poor: >300ms
    const clsScore = this.scoreMetric(metrics.cls * 1000, 0.1, 0.25); // Good: <0.1, Poor: >0.25

    const coreWebVitalsScore = (lcpScore + fidScore + clsScore) / 3;

    // Loading time score
    const loadTime = LoadingAnalytics.getTotalLoadTime();
    const loadTimeScore = this.scoreMetric(loadTime, 1000, 3000); // Good: <1s, Poor: >3s

    // Overall UX score
    const overallScore = (coreWebVitalsScore + loadTimeScore) / 2;

    this.scores.set('overall', overallScore);
    this.scores.set('core_web_vitals', coreWebVitalsScore);
    this.scores.set('loading', loadTimeScore);

    return overallScore;
  }

  private static scoreMetric(value: number, goodThreshold: number, poorThreshold: number): number {
    if (value <= goodThreshold) return 100;
    if (value >= poorThreshold) return 0;

    // Linear interpolation between good and poor
    return 100 - ((value - goodThreshold) / (poorThreshold - goodThreshold)) * 100;
  }

  static getScores(): Record<string, number> {
    const result: Record<string, number> = {};
    this.scores.forEach((score, name) => {
      result[name] = score;
    });
    return result;
  }

  static getUXRating(): 'excellent' | 'good' | 'needs_improvement' | 'poor' {
    const score = this.calculateUXScore();

    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 50) return 'needs_improvement';
    return 'poor';
  }
}

// Performance budget monitoring
export class PerformanceBudget {
  private static budgets = {
    js: 300 * 1024, // 300KB
    css: 100 * 1024, // 100KB
    images: 500 * 1024, // 500KB
    total: 1000 * 1024, // 1MB
  };

  static checkBudget(): { exceeded: string[]; withinBudget: string[] } {
    const result = { exceeded: [] as string[], withinBudget: [] as string[] };

    if (typeof performance === 'undefined') return result;

    const resources = performance.getEntriesByType('resource') as any[];

    let totalSize = 0;
    const sizes = {
      js: 0,
      css: 0,
      images: 0,
    };

    resources.forEach((resource) => {
      const size = resource.transferSize || 0;
      totalSize += size;

      if (resource.name.includes('.js')) {
        sizes.js += size;
      } else if (resource.name.includes('.css')) {
        sizes.css += size;
      } else if (/\.(jpg|jpeg|png|gif|webp|svg)/.test(resource.name)) {
        sizes.images += size;
      }
    });

    // Check each budget
    Object.entries(sizes).forEach(([type, size]) => {
      const budget = this.budgets[type as keyof typeof this.budgets];
      if (size > budget) {
        result.exceeded.push(`${type}: ${(size / 1024).toFixed(1)}KB / ${(budget / 1024).toFixed(1)}KB`);
      } else {
        result.withinBudget.push(`${type}: ${(size / 1024).toFixed(1)}KB / ${(budget / 1024).toFixed(1)}KB`);
      }
    });

    // Check total budget
    if (totalSize > this.budgets.total) {
      result.exceeded.push(`total: ${(totalSize / 1024).toFixed(1)}KB / ${(this.budgets.total / 1024).toFixed(1)}KB`);
    } else {
      result.withinBudget.push(`total: ${(totalSize / 1024).toFixed(1)}KB / ${(this.budgets.total / 1024).toFixed(1)}KB`);
    }

    return result;
  }

  static setBudget(type: keyof typeof PerformanceBudget.budgets, sizeInKB: number): void {
    this.budgets[type] = sizeInKB * 1024;
  }
}

// Initialize performance monitoring
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  PerformanceMonitor.initialize();
  LoadingAnalytics.startTracking();

  // Mark key milestones
  window.addEventListener('DOMContentLoaded', () => {
    LoadingAnalytics.markMilestone('dom_content_loaded');
  });

  window.addEventListener('load', () => {
    LoadingAnalytics.markMilestone('window_load');
    LoadingAnalytics.reportLoadComplete();

    // Calculate UX score after load
    setTimeout(() => {
      const score = UXScore.calculateUXScore();
      const rating = UXScore.getUXRating();

      console.log(`[UX Score] ${score.toFixed(1)} - ${rating}`);

      // Check performance budget
      const budget = PerformanceBudget.checkBudget();
      if (budget.exceeded.length > 0) {
        console.warn('[Performance Budget] Exceeded:', budget.exceeded);
      }
    }, 100);
  });
}