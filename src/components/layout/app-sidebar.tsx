
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
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
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';

const menuItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/trending', label: 'Trending', icon: Flame },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/watch-later', label: 'Watch Later', icon: Video },
  { href: '/liked', label: 'Liked Videos', icon: ThumbsUp },
  { href: '/downloads', label: 'Downloads', icon: Download },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Handle logout error gracefully
    }
  };
  
  const renderUserArea = () => {
    if (loading) {
      return (
          <div className="flex items-center gap-3 p-2">
             <Skeleton className="h-10 w-10 rounded-full" />
             <div className="flex-grow space-y-2">
               <Skeleton className="h-4 w-24" />
               <Skeleton className="h-3 w-32" />
             </div>
         </div>
      )
    }

    if (!user) {
      return (
        <div className="p-2 space-y-2">
          <Button className="w-full" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      )
    }

    // Check if user is suspended or inactive
    if (user.status === 'Inactive') {
      return (
        <div className="p-2 text-center">
          <p className="text-sm text-muted-foreground mb-2">Account suspended</p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/contact-support">Contact Support</Link>
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
            <Avatar>
              <AvatarImage src={user.avatarUrl!} alt={user.name!} data-ai-hint="person portrait" />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.role === 'Admin' && (
                <p className="text-xs text-primary font-medium">Admin</p>
              )}
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
        <Button variant="ghost" className="w-full justify-start mt-1" onClick={handleLogout}>
           <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </>
    )
  }

  return (
    <Sidebar side="right" collapsible="offcanvas" className="border-l">
      <SidebarHeader className="p-4">
        <Link href="/home" className="flex items-center justify-center">
          <Logo />
        </Link>
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
       {renderUserArea()}
      </SidebarFooter>
    </Sidebar>
  );
}
