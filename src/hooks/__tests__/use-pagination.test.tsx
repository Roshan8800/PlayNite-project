import { renderHook, act } from '@testing-library/react';
import { usePagination } from '../use-pagination';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('usePagination', () => {
  it('should update totalPages and clamp currentPage when totalItems changes', () => {
    const { result, rerender } = renderHook(
      ({ totalItems }) => usePagination({ totalItems, syncWithUrl: false }),
      {
        initialProps: { totalItems: 100 },
      }
    );

    // Go to the last page
    act(() => {
      result.current.setPage(5);
    });

    expect(result.current.currentPage).toBe(5);
    expect(result.current.totalPages).toBe(5);

    // Now, reduce the number of total items, making the current page invalid
    rerender({ totalItems: 30 });

    // The bug is that the hook does not react to this change.
    // The assertions below will fail.
    expect(result.current.totalPages).toBe(2);
    expect(result.current.currentPage).toBe(2);
  });
});
