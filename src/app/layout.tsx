import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AgeGate } from '@/components/age-gate';
import { ErrorBoundary } from '@/components/error-boundary';
import { PerformanceDashboard } from '@/components/performance-dashboard';
import { initializePerformanceMonitoring } from '@/lib/performance-monitoring';
import { initializeOptimizations } from '@/lib/bundle-optimization';
import { initializeProductionOptimizations } from '@/lib/performance-optimization';
import { AccessibilityProvider } from '@/components/accessibility-provider';



export const metadata: Metadata = {
  title: 'PlayNite - Modern Video Streaming Platform',
  description: 'Discover and stream high-quality videos on PlayNite. Watch trending content, explore categories, and enjoy live streams.',
  keywords: 'video streaming, online videos, entertainment, live streams, trending videos',
  authors: [{ name: 'PlayNite Team' }],
  creator: 'PlayNite',
  publisher: 'PlayNite',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://play-nite-project-git-main-roshans-projects-2d6e3f6b.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PlayNite - Modern Video Streaming Platform',
    description: 'Discover and stream high-quality videos on PlayNite.',
    url: 'https://play-nite-project-git-main-roshans-projects-2d6e3f6b.vercel.app',
    siteName: 'PlayNite',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PlayNite - Video Streaming Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlayNite - Modern Video Streaming Platform',
    description: 'Discover and stream high-quality videos on PlayNite.',
    images: ['/og-image.jpg'],
    creator: '@playnite',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  // Accessibility metadata
  other: {
    'color-scheme': 'dark light',
    'supported-color-schemes': 'dark light',
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize performance monitoring and optimizations
  if (typeof window !== 'undefined') {
    initializePerformanceMonitoring();
    initializeOptimizations();
    initializeProductionOptimizations();
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        {/* Performance optimization hints */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className="font-body antialiased">
        <AccessibilityProvider>
          <ErrorBoundary>
            <AgeGate>
              <FirebaseClientProvider>
                {children}
                <PerformanceDashboard />
              </FirebaseClientProvider>
            </AgeGate>
          </ErrorBoundary>
          <Toaster />
        </AccessibilityProvider>
      </body>
    </html>
  );
}
