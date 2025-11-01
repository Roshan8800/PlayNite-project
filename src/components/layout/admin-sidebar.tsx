
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
import { SheetTitle, SheetDescription } from '@/components/ui/sheet';
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
    <Sidebar side="left" collapsible="icon" variant="sidebar" className="border-r">
      <SheetTitle className="sr-only">Admin Menu</SheetTitle>
      <SheetDescription className="sr-only">
        Navigate the admin sections of the application.
      </SheetDescription>
      <SidebarHeader className="flex items-center justify-between p-2">
        <div className="group-data-[collapsible=icon]:hidden">
          <Logo />
        </div>
        <SidebarTrigger asChild>
            <Button variant="ghost" size="icon"/>
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className={cn(
                    'w-full justify-start',
                    pathname === item.href && 'bg-primary text-primary-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
        <Button asChild><Link href="/home" className="w-full">Back to App</Link></Button>
      </SidebarFooter>
    </Sidebar>
  );
}
