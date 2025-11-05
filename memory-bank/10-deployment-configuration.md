# 10. Deployment and Configuration

## Hosting Platforms

### Firebase Hosting

#### Configuration (`firebase.json`)

```json
{
  "hosting": {
    "public": ".next/static",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.css",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.woff2",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/api/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=300, s-maxage=600"
          }
        ]
      },
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=0, must-revalidate"
          }
        ]
      }
    ],
    "redirects": [
      {
        "source": "/home",
        "destination": "/",
        "type": 301
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

#### Firebase Functions

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const api = functions.https.onRequest((req, res) => {
  // SSR function for API routes
  // This handles Next.js API routes in Firebase Functions
});

export const scheduledCleanup = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    // Clean up old analytics data
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days ago
    
    const analyticsRef = admin.firestore().collection('analytics');
    const oldAnalytics = await analyticsRef
      .where('timestamp', '<', cutoffDate)
      .get();
    
    const batch = admin.firestore().batch();
    oldAnalytics.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Cleaned up ${oldAnalytics.size} old analytics records`);
  });
```

### Vercel Deployment

#### `vercel.json` Configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "regions": ["iad1", "sfo1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, s-maxage=600"
        },
        {
          "key": "X-RateLimit-Limit",
          "value": "100"
        },
        {
          "key": "X-RateLimit-Window",
          "value": "60"
        }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    },
    {
      "source": "/old-path/(.*)",
      "destination": "/new-path/$1",
      "permanent": true
    }
  ]
}
```

#### Environment Variables in Vercel

```bash
# Vercel Dashboard > Project Settings > Environment Variables

# Production Environment Variables
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRODUCTION_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com

# Preview Environment Variables (for staging)
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Development Environment Variables
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEBUG=true
```

## Build Configuration

### Next.js Configuration (`next.config.ts`)

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Environment-specific configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['images.unsplash.com', 'picsum.photos', 'firebase.storage.googleapis.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Bundle analysis
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      // Production bundle optimizations
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.maxSize = 244000; // 244KB
      config.optimization.splitChunks.minSize = 10000; // 10KB

      if (config.optimization.splitChunks.cacheGroups) {
        config.optimization.splitChunks.cacheGroups = {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          firebase: {
            test: /[\\/]node_modules[\\/]firebase[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix-ui',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
        };
      }

      // Bundle analyzer
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './bundle-analyzer-report.html',
            openAnalyzer: false,
          })
        );
      }
    }

    return config;
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'X-RateLimit-Limit',
            value: '100',
          },
          {
            key: 'X-RateLimit-Window',
            value: '60',
          },
        ],
      },
    ];
  },

  // Redirects and rewrites
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```

## Environment Management

### Environment-Specific Configurations

#### Development (`config/development.ts`)

```typescript
export const developmentConfig = {
  firebase: {
    projectId: 'playnite-dev',
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  },
  analytics: {
    enabled: false,
    debug: true,
  },
  logging: {
    level: 'debug',
    remoteLogging: false,
  },
  performance: {
    monitoring: true,
    budgets: {
      enabled: false, // Disable budgets in development
    },
  },
  features: {
    aiModeration: false,
    advancedAnalytics: false,
  },
};
```

#### Staging (`config/staging.ts`)

```typescript
export const stagingConfig = {
  firebase: {
    projectId: 'playnite-staging',
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  },
  analytics: {
    enabled: false,
    debug: false,
  },
  logging: {
    level: 'info',
    remoteLogging: true,
  },
  performance: {
    monitoring: true,
    budgets: {
      enabled: true,
    },
  },
  features: {
    aiModeration: true,
    advancedAnalytics: false,
  },
};
```

#### Production (`config/production.ts`)

```typescript
export const productionConfig = {
  firebase: {
    projectId: 'playnite-prod',
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  },
  analytics: {
    enabled: true,
    debug: false,
  },
  logging: {
    level: 'warn',
    remoteLogging: true,
  },
  performance: {
    monitoring: true,
    budgets: {
      enabled: true,
    },
  },
  features: {
    aiModeration: true,
    advancedAnalytics: true,
  },
};
```

#### Configuration Loader (`src/lib/config.ts`)

```typescript
import { developmentConfig } from './config/development';
import { stagingConfig } from './config/staging';
import { productionConfig } from './config/production';

type Environment = 'development' | 'staging' | 'production';

const configs = {
  development: developmentConfig,
  staging: stagingConfig,
  production: productionConfig,
};

function getEnvironment(): Environment {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 
               process.env.NODE_ENV || 
               'development';
  
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
}

export function getConfig() {
  const env = getEnvironment();
  return configs[env];
}

export const config = getConfig();
```

## CDN and Asset Delivery

### Firebase Storage Configuration

```typescript
// src/lib/storage.ts
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getApp } from 'firebase/app';

const storage = getStorage(getApp());

export class StorageService {
  static async uploadFile(
    path: string, 
    file: File, 
    metadata?: { contentType?: string; customMetadata?: Record<string, string> }
  ): Promise<string> {
    const storageRef = ref(storage, path);
    
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType: metadata?.contentType,
      customMetadata: metadata?.customMetadata,
    });
    
    return getDownloadURL(uploadResult.ref);
  }

  static async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  static getPublicUrl(path: string): string {
    const storageRef = ref(storage, path);
    return `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.projectId}.appspot.com/o/${encodeURIComponent(path)}?alt=media`;
  }

  static async getSignedUrl(path: string, expirationTime: number = 3600): Promise<string> {
    // Implementation for signed URLs with expiration
    const storageRef = ref(storage, path);
    // Note: Firebase Storage doesn't directly support signed URLs like AWS S3
    // This would require a Firebase Function to generate signed URLs
    return this.getPublicUrl(path);
  }
}
```

### Image CDN Configuration

```typescript
// src/lib/image-cdn.ts
export class ImageCDN {
  private static baseUrl = process.env.NEXT_PUBLIC_IMAGE_CDN || 'https://images.playnite.com';
  
  static getOptimizedUrl(
    imagePath: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'avif' | 'jpg' | 'png';
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    } = {}
  ): string {
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);
    if (options.fit) params.set('fit', options.fit);
    
    const queryString = params.toString();
    return `${this.baseUrl}/${imagePath}${queryString ? `?${queryString}` : ''}`;
  }
  
  static getResponsiveSizes(basePath: string): { src: string; width: number }[] {
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    
    return sizes.map(width => ({
      src: this.getOptimizedUrl(basePath, { width, format: 'webp' }),
      width,
    }));
  }
}
```

## Monitoring and Observability

### Application Performance Monitoring

#### Performance Monitoring Setup (`src/lib/performance-monitoring.ts`)

```typescript
import { getPerformance } from 'firebase/performance';
import { getApp } from 'firebase/app';

export class PerformanceMonitoring {
  private static performance = getPerformance(getApp());
  
  static initialize(): void {
    // Core Web Vitals tracking
    this.setupCoreWebVitals();
    
    // Custom metrics
    this.setupCustomMetrics();
    
    // Error tracking
    this.setupErrorTracking();
  }
  
  private static setupCoreWebVitals(): void {
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      // Log to Firebase Performance
      const trace = this.performance.trace('LCP');
      trace.putMetric('value', lastEntry.startTime);
      trace.stop();
      
      // Send to analytics
      this.sendToAnalytics('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID (First Input Delay)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const trace = this.performance.trace('FID');
        trace.putMetric('value', entry.processingStart - entry.startTime);
        trace.stop();
        
        this.sendToAnalytics('FID', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // CLS (Cumulative Layout Shift)
    new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      const trace = this.performance.trace('CLS');
      trace.putMetric('value', clsValue);
      trace.stop();
      
      this.sendToAnalytics('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  private static setupCustomMetrics(): void {
    // Page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      const trace = this.performance.trace('page_load');
      trace.putMetric('duration', loadTime);
      trace.stop();
    });
    
    // API response times
    this.interceptFetch();
  }
  
  private static interceptFetch(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const result = await originalFetch(...args);
      const duration = performance.now() - startTime;
      
      // Track API calls
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      if (url.includes('/api/')) {
        const trace = this.performance.trace('api_call');
        trace.putAttribute('url', url);
        trace.putMetric('duration', duration);
        trace.stop();
      }
      
      return result;
    };
  }
  
  private static setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      // Log JavaScript errors
      console.error('JavaScript Error:', event.error);
      
      // Send to error reporting service
      this.reportError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      // Log unhandled promise rejections
      console.error('Unhandled Promise Rejection:', event.reason);
      
      this.reportError(event.reason, {
        type: 'unhandledrejection',
      });
    });
  }
  
  private static sendToAnalytics(metric: string, value: number): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vitals', {
        event_category: 'Web Vitals',
        event_label: metric,
        value: Math.round(value),
        non_interaction: true,
      });
    }
  }
  
  private static reportError(error: any, context: any): void {
    // Send to error reporting service (e.g., Sentry, Firebase Crashlytics)
    console.error('Error reported:', { error, context });
  }
}
```

### Error Tracking and Logging

#### Error Reporting Setup (`src/lib/error-reporting.ts`)

```typescript
import * as Sentry from '@sentry/nextjs';

export class ErrorReporting {
  static initialize(): void {
    if (typeof window !== 'undefined') {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
        tracesSampleRate: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,
        
        integrations: [
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
      });
    }
  }
  
  static captureException(error: Error, context?: any): void {
    Sentry.captureException(error, {
      tags: {
        component: context?.component,
        userId: context?.userId,
      },
      extra: context,
    });
  }
  
  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: any): void {
    Sentry.captureMessage(message, level, {
      tags: context?.tags,
      extra: context?.extra,
    });
  }
  
  static setUser(user: { id: string; email?: string; username?: string }): void {
    Sentry.setUser(user);
  }
  
  static setTag(key: string, value: string): void {
    Sentry.setTag(key, value);
  }
  
  static addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: Sentry.SeverityLevel;
    data?: any;
  }): void {
    Sentry.addBreadcrumb(breadcrumb);
  }
}
```

## Backup and Recovery

### Database Backup Strategy

```typescript
// scripts/backup.ts
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';

export class BackupService {
  private static storage = new Storage();
  private static bucket = this.storage.bucket('playnite-backups');
  
  static async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `firestore-backup-${timestamp}`;
    
    // Export Firestore data
    const client = new admin.firestore.v1.FirestoreAdminClient();
    const databaseName = client.databasePath(
      process.env.GCP_PROJECT_ID!,
      '(default)'
    );
    
    const [operation] = await client.exportDocuments({
      name: databaseName,
      outputUriPrefix: `gs://${this.bucket.name}/${backupPath}`,
      collectionIds: [], // Export all collections
    });
    
    // Wait for completion
    await operation.promise();
    
    return backupPath;
  }
  
  static async restoreFromBackup(backupPath: string): Promise<void> {
    const client = new admin.firestore.v1.FirestoreAdminClient();
    const databaseName = client.databasePath(
      process.env.GCP_PROJECT_ID!,
      '(default)'
    );
    
    const [operation] = await client.importDocuments({
      name: databaseName,
      inputUriPrefix: `gs://${this.bucket.name}/${backupPath}`,
      collectionIds: [], // Import all collections
    });
    
    await operation.promise();
  }
  
  static async listBackups(): Promise<string[]> {
    const [files] = await this.bucket.getFiles({
      prefix: 'firestore-backup-',
    });
    
    return files.map(file => file.name);
  }
  
  static async cleanupOldBackups(retentionDays: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const [files] = await this.bucket.getFiles({
      prefix: 'firestore-backup-',
    });
    
    const filesToDelete = files.filter(file => {
      const fileDate = new Date(file.metadata.timeCreated);
      return fileDate < cutoffDate;
    });
    
    await Promise.all(filesToDelete.map(file => file.delete()));
  }
}
```

### Automated Backup Schedule

```typescript
// functions/src/backup-scheduler.ts
import * as functions from 'firebase-functions';
import { BackupService } from '../services/backup-service';

export const scheduledBackup = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Starting scheduled backup...');
    
    try {
      const backupPath = await BackupService.createBackup();
      console.log(`Backup completed: ${backupPath}`);
      
      // Cleanup old backups (keep last 30 days)
      await BackupService.cleanupOldBackups(30);
      console.log('Old backups cleaned up');
      
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  });
```

## Security Configuration

### Content Security Policy

```typescript
// src/lib/csp.ts
export class ContentSecurityPolicy {
  static getPolicy(): string {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const policy = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        ...(isDevelopment ? ["'unsafe-inline'"] : [])
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'https://images.unsplash.com',
        'https://picsum.photos',
        'https://firebasestorage.googleapis.com'
      ],
      'media-src': [
        "'self'",
        'https:',
        'blob:'
      ],
      'connect-src': [
        "'self'",
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com',
        'https://firestore.googleapis.com',
        'https://firebase.googleapis.com',
        'wss://firestore.googleapis.com'
      ],
      'frame-src': [
        "'self'",
        'https://www.youtube.com',
        'https://player.vimeo.com'
      ],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': []
    };
    
    return Object.entries(policy)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }
}
```

### HTTPS and SSL Configuration

```typescript
// next.config.ts (additional headers)
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'Content-Security-Policy',
          value: ContentSecurityPolicy.getPolicy()
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        }
      ]
    }
  ];
}
```

This comprehensive deployment and configuration documentation ensures the PlayNite platform can be reliably deployed, monitored, and maintained across different environments while maintaining security, performance, and scalability standards.