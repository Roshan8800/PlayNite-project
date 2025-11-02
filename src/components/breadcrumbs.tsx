'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/home' }];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      // Skip 'home' since it's already added
      if (path === 'home') return;

      // Format labels
      let label = path;
      if (path === 'watch' || path === 'video') {
        label = 'Video';
      } else if (path === 'categories') {
        label = 'Categories';
      } else if (path === 'trending') {
        label = 'Trending';
      } else if (path === 'history') {
        label = 'History';
      } else if (path === 'watch-later') {
        label = 'Watch Later';
      } else if (path === 'liked') {
        label = 'Liked Videos';
      } else if (path === 'downloads') {
        label = 'Downloads';
      } else if (path === 'profile') {
        label = 'Profile';
      } else if (path === 'settings') {
        label = 'Settings';
      } else if (path === 'admin') {
        label = 'Admin';
      } else if (path === 'search') {
        label = 'Search Results';
      } else if (/^[a-zA-Z0-9_-]+$/.test(path) && index > 0) {
        // Likely an ID, use the parent path as label
        const parentPath = paths[index - 1];
        if (parentPath === 'watch' || parentPath === 'video') {
          label = 'Video Details';
        }
      }

      breadcrumbs.push({
        label: label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' '),
        href: index === paths.length - 1 ? undefined : currentPath, // No href for current page
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (pathname === '/home' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href || crumb.label} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home className="h-4 w-4" />}
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium flex items-center gap-1">
              {index === 0 && <Home className="h-4 w-4" />}
              {crumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}