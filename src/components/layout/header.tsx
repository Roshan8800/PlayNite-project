
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Menu,
  Search,
  Settings,
  User,
  Shield,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useSidebar } from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import { useState } from 'react';
import { smartSearchSuggestions } from '@/ai/flows/ai-search-suggestions';
import { SearchPopover } from '../search-popover';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Skeleton } from '../ui/skeleton';

export default function Header() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { user, loading } = useUser();
  const auth = useAuth();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };


  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const result = await smartSearchSuggestions({ query });
        setSuggestions(result.suggestions);
        setIsPopoverOpen(true);
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSuggestions([]);
        setIsPopoverOpen(false);
      }
    } else {
      setSuggestions([]);
      setIsPopoverOpen(false);
    }
  };
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(`/search?q=${searchQuery}`);
      setIsPopoverOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/search?q=${suggestion}`);
    setIsPopoverOpen(false);
  };

  const renderUserMenu = () => {
    if (loading) {
      return (
        <Button variant="ghost" size="icon" className="rounded-full">
          <Skeleton className="h-8 w-8 rounded-full" />
        </Button>
      )
    }

    if (!user) {
      return (
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl!} alt={user.name!} data-ai-hint="person portrait"/>
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
          </DropdownMenuItem>
          {user.role === 'Admin' && (
            <DropdownMenuItem asChild>
                <Link href="/admin"><Shield className="mr-2 h-4 w-4" />Admin Panel</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="hidden md:block">
        <Logo />
      </div>

      <div className="relative flex-1 md:flex-initial md:ml-auto">
         <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search videos..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                data-ai-hint="smart search suggestions"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length > 2 && setIsPopoverOpen(true)}
              />
            </form>
          </PopoverTrigger>
          {suggestions.length > 0 && (
            <PopoverContent className="p-0 w-[300px] lg:w-[300px]" align="start">
              <SearchPopover suggestions={suggestions} onSuggestionClick={handleSuggestionClick} />
            </PopoverContent>
          )}
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        {renderUserMenu()}
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={toggleSidebar} aria-label="Toggle Menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
