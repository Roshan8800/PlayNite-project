'use client';

import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoGridSkeleton } from '@/components/video-skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/error-boundary';
import { PageTransition, RouteLoadingIndicator } from '@/components/page-transition';

function LayoutSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-24" />
      </div>
      <VideoGridSkeleton count={6} />
    </div>
  );
}

function HomeLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Check if user has age verification and meets requirements
      const ageVerified = document.cookie.includes('age_verified=true');
      const userAge = user?.ageRestriction || 18;

      if (!ageVerified && userAge < 18) {
        router.push('/age-gate');
        return;
      }

      // Check parental controls
      if (user?.parentalControlsEnabled && userAge < 18) {
        router.push('/parental-block');
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <RouteLoadingIndicator />
      <div className="flex h-screen w-full">
        <aside
          className="hidden md:flex"
          role="complementary"
          aria-label="Main navigation sidebar"
        >
          <AppSidebar />
        </aside>
        <div className="flex flex-1 flex-col">
          <header role="banner" aria-label="Site header">
            <Header />
          </header>
          <main
            className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-fade-in"
            id="main-content"
            role="main"
            aria-label="Main content"
          >
            <Breadcrumbs />
            <PageTransition>
              <Suspense fallback={<LayoutSkeleton />}>
                {children}
              </Suspense>
            </PageTransition>
          </main>
          <footer
            className="border-t bg-background/80 backdrop-blur-sm px-4 md:px-6 lg:px-8 py-4"
            role="contentinfo"
            aria-label="Site footer"
          >
            <nav aria-label="Footer navigation">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-4">
                  <a href="/about" className="hover:text-foreground transition-colors">About Us</a>
                  <a href="/help" className="hover:text-foreground transition-colors">Help</a>
                  <a href="/contact-support" className="hover:text-foreground transition-colors">Contact</a>
                  <a href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</a>
                  <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
                  <a href="/cookie-policy" className="hover:text-foreground transition-colors">Cookie Policy</a>
                  <a href="/dmca-policy" className="hover:text-foreground transition-colors">DMCA Policy</a>
                </div>
                <div className="text-center md:text-right">
                  <p>&copy; 2024 PlayNite. All rights reserved.</p>
                </div>
              </div>
            </nav>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <HomeLayoutContent>{children}</HomeLayoutContent>
    </ErrorBoundary>
  );
}
