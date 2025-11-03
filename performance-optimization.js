/**
 * Performance Optimization Script
 * This script applies various performance improvements to the Next.js project
 */

const fs = require('fs');
const path = require('path');

// 1. Code Splitting Enhancements
function enhanceCodeSplitting() {
  console.log('Enhancing code splitting...');
  // Add dynamic imports for heavy components
  const dynamicImports = `
import dynamic from 'next/dynamic';

// Lazy load heavy components
const VideoPlayer = dynamic(() => import('@/components/video-player'), {
  loading: () => <div>Loading video player...</div>,
  ssr: false
});

const LiveStreamPlayer = dynamic(() => import('@/components/live-stream-player'), {
  loading: () => <div>Loading live stream...</div>,
  ssr: false
});

export { VideoPlayer, LiveStreamPlayer };
`;

  fs.writeFileSync(path.join(__dirname, 'src/lib/dynamic-components.js'), dynamicImports);
  console.log('Dynamic components file created.');
}

// 2. Image Optimization
function optimizeImages() {
  console.log('Optimizing images...');
  // Add next/image configurations and lazy loading
  const imageConfig = `
import Image from 'next/image';

export const OptimizedImage = ({ src, alt, ...props }) => (
  <Image
    src={src}
    alt={alt}
    loading="lazy"
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
    {...props}
  />
);
`;

  fs.writeFileSync(path.join(__dirname, 'src/components/optimized-image.js'), imageConfig);
  console.log('Optimized image component created.');
}

// 3. Caching Strategies
function implementCaching() {
  console.log('Implementing caching strategies...');
  // Update next.config.ts with better caching
  const nextConfigPath = path.join(__dirname, 'next.config.ts');
  let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

  // Add SWC cache and other optimizations
  if (!nextConfig.includes('swcMinify')) {
    nextConfig = nextConfig.replace('const nextConfig: NextConfig = {', `const nextConfig: NextConfig = {
  swcMinify: true,`);
  }

  fs.writeFileSync(nextConfigPath, nextConfig);
  console.log('Caching strategies updated in next.config.ts.');
}

// 4. Bundle Analysis
function setupBundleAnalysis() {
  console.log('Setting up bundle analysis...');
  const webpackConfig = `
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: 'bundle-report.html',
          openAnalyzer: false,
        })
      );
    }
    return config;
  },
};
`;

  fs.writeFileSync(path.join(__dirname, 'webpack.bundle-analyzer.js'), webpackConfig);
  console.log('Bundle analyzer config created.');
}

// 5. Service Worker Setup
function setupServiceWorker() {
  console.log('Setting up service worker...');
  const swContent = `
import { register } from 'workbox-window';

if ('serviceWorker' in navigator) {
  register('/sw.js');
}
`;

  const swFile = `
const { CacheFirst, StaleWhileRevalidate } = require('workbox-strategies');
const { registerRoute } = require('workbox-routing');
const { CacheableResponsePlugin } = require('workbox-cacheable-response');
const { ExpirationPlugin } = require('workbox-expiration');

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// Cache CSS and JS
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);
`;

  fs.writeFileSync(path.join(__dirname, 'public/sw-register.js'), swContent);
  fs.writeFileSync(path.join(__dirname, 'public/sw.js'), swFile);
  console.log('Service worker files created.');
}

// Run all optimizations
function runOptimizations() {
  console.log('Starting performance optimizations...');
  enhanceCodeSplitting();
  optimizeImages();
  implementCaching();
  setupBundleAnalysis();
  setupServiceWorker();
  console.log('Performance optimizations completed!');
}

if (require.main === module) {
  runOptimizations();
}

module.exports = { runOptimizations };