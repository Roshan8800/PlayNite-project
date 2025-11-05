
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Settings,
  ShieldCheck,
  Users,
  Video,
  FileCheck,
  List,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/videos', label: 'Videos', icon: Video },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: List },
  { href: '/admin/approval', label: 'Approval Queue', icon: FileCheck },
  { href: '/admin/reports', label: 'Reports', icon: ShieldCheck },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="left" collapsible="icon" variant="sidebar" className="border-r" role="complementary" aria-label="Admin navigation">
      <SidebarHeader className="flex items-center justify-between p-2">
        <div className="group-data-[collapsible=icon]:hidden">
          <Logo />
        </div>
        <SidebarTrigger asChild>
            <Button variant="ghost" size="icon"/>
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <nav aria-label="Admin navigation" role="navigation">
          <SidebarMenu role="menu">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label} role="none">
                <Link href={item.href} role="menuitem">
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className={cn(
                      'w-full justify-start',
                      pathname === item.href && 'bg-primary text-primary-foreground'
                    )}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </nav>
      </SidebarContent>
       <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden" role="contentinfo" aria-label="Admin footer">
        <Button asChild><Link href="/home" className="w-full">Back to App</Link></Button>
      </SidebarFooter>
    </Sidebar>
  );
}
