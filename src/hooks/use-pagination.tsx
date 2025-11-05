'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  syncWithUrl?: boolean;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  reset: () => void;
  pageSizeOptions: number[];
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 20,
  totalItems = 0,
  pageSizeOptions = [10, 20, 50, 100],
  syncWithUrl = true,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial values from URL if syncing is enabled
  const getInitialPage = () => {
    if (syncWithUrl) {
      const pageParam = searchParams.get('page');
      const parsed = pageParam ? parseInt(pageParam, 10) : null;
      return parsed && parsed > 0 ? parsed : initialPage;
    }
    return initialPage;
  };

  const getInitialPageSize = () => {
    if (syncWithUrl) {
      const sizeParam = searchParams.get('pageSize');
      const parsed = sizeParam ? parseInt(sizeParam, 10) : null;
      return parsed && pageSizeOptions.includes(parsed) ? parsed : initialPageSize;
    }
    return initialPageSize;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [pageSize, setPageSizeState] = useState(getInitialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Update URL when page or pageSize changes
  const updateUrl = useCallback((page: number, size: number) => {
    if (!syncWithUrl) return;

    const params = new URLSearchParams(searchParams.toString());

    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }

    if (size !== initialPageSize) {
      params.set('pageSize', size.toString());
    } else {
      params.delete('pageSize');
    }

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [syncWithUrl, searchParams, pathname, router, initialPageSize]);

  // Set page with URL sync
  const setPage = useCallback((page: number) => {
    const clampedPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(clampedPage);
    updateUrl(clampedPage, pageSize);
  }, [totalPages, pageSize, updateUrl]);

  // Set page size with URL sync
  const setPageSize = useCallback((size: number) => {
    if (!pageSizeOptions.includes(size)) return;

    setPageSizeState(size);
    // Reset to page 1 when changing page size
    setCurrentPage(1);
    updateUrl(1, size);
  }, [pageSizeOptions, updateUrl]);

  // Navigation methods
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(currentPage + 1);
    }
  }, [hasNextPage, currentPage, setPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(currentPage - 1);
    }
  }, [hasPreviousPage, currentPage, setPage]);

  // Reset to initial state
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
    updateUrl(initialPage, initialPageSize);
  }, [initialPage, initialPageSize, updateUrl]);

  // Update state when URL changes (for browser back/forward)
  useEffect(() => {
    if (!syncWithUrl) return;

    const newPage = getInitialPage();
    const newPageSize = getInitialPageSize();

    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
    if (newPageSize !== pageSize) {
      setPageSizeState(newPageSize);
    }
  }, [searchParams, syncWithUrl, currentPage, pageSize]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    setPage,
    setPageSize,
    nextPage,
    previousPage,
    reset,
    pageSizeOptions,
  };
}