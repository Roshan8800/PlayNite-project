import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AgeGate } from '@/components/age-gate';
import { ErrorBoundary } from '@/components/error-boundary';

export const metadata: Metadata = {
  title: 'PlayNite',
  description: 'A modern video streaming platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ErrorBoundary>
          <AgeGate>
            <FirebaseClientProvider>
              <FirebaseErrorListener />
              {children}
            </FirebaseClientProvider>
          </AgeGate>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
