import AdminSidebar from '@/components/layout/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
