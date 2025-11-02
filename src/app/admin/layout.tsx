'use client';

import AdminSidebar from '@/components/layout/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useUser } from '@/firebase/auth/use-user';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (user.role !== 'Admin') {
        router.push('/unauthorized');
        return;
      }

      if (user.status === 'Inactive') {
        router.push('/account-suspended');
        return;
      }

      setIsAuthorized(true);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40">
                {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ErrorBoundary>
  );
}
