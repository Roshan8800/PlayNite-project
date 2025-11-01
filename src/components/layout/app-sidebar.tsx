
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Clock,
  Download,
  Flame,
  Home,
  LogOut,
  Settings,
  ThumbsUp,
  User,
  Video,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import { users } from '@/lib/data';

const menuItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/trending', label: 'Trending', icon: Flame },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/watch-later', label: 'Watch Later', icon: Video },
  { href: '/liked', label: 'Liked Videos', icon: ThumbsUp },
  { href: '/downloads', label: 'Downloads', icon: Download },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const user = users[0];

  return (
    <Sidebar side="right" collapsible="offcanvas" className="border-l">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className={cn(
                    'w-full justify-start',
                    pathname === item.href && 'bg-accent text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
            <Avatar>
              <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person portrait" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
             <Button variant="outline" size="sm" asChild>
                <Link href="/profile"><User className="mr-2 h-4 w-4" /> Profile</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
                <Link href="/settings"><Settings className="mr-2 h-4 w-4" /> Settings</Link>
            </Button>
        </div>
        <Button variant="ghost" className="w-full justify-start mt-1" asChild>
           <Link href="/"><LogOut className="mr-2 h-4 w-4" /> Logout</Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
