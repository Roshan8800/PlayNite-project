'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageSizeSelector?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({
    currentPage,
    totalPages,
    onPageChange,
    showPageSizeSelector = false,
    pageSize,
    pageSizeOptions = [10, 20, 50, 100],
    onPageSizeChange,
    className,
    ...props
  }, ref) => {
    const generatePageNumbers = () => {
      const pages: (number | string)[] = [];
      const delta = 2; // Number of pages to show on each side of current page

      // Always show first page
      if (1 < currentPage - delta) {
        pages.push(1);
        if (2 < currentPage - delta) {
          pages.push('...');
        }
      }

      // Show pages around current page
      for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
        pages.push(i);
      }

      // Always show last page
      if (totalPages > currentPage + delta) {
        if (totalPages - 1 > currentPage + delta) {
          pages.push('...');
        }
        pages.push(totalPages);
      }

      return pages;
    };

    const pageNumbers = generatePageNumbers();

    if (totalPages <= 1) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between space-x-2', className)}
        {...props}
      >
        <div className="flex items-center space-x-2">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="flex h-8 w-8 items-center justify-center">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                ) : (
                  <Button
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className="h-8 w-8 p-0"
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        {/* Page size selector */}
        {showPageSizeSelector && onPageSizeChange && pageSize && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Show</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>
        )}

        {/* Page info */}
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

export { Pagination };