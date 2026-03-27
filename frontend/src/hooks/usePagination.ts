
import { useCallback } from 'react';
import { PaginationInfo, DEFAULT_PAGINATION } from '@/types/interfaces';

export const usePagination = () => {
  const extractPaginationFromResponse = useCallback((response: Response): PaginationInfo => {
    // Extract pagination from headers
    const paginationHeader = response.headers.get('X-Pagination');
    let pagination: PaginationInfo = { ...DEFAULT_PAGINATION };
    
    if (paginationHeader) {
      try {
        const parsedPagination = JSON.parse(paginationHeader);
        pagination = {
          page: parsedPagination.page || DEFAULT_PAGINATION.page,
          page_size: parsedPagination.page_size || DEFAULT_PAGINATION.page_size,
          total_items: parsedPagination.total_items || DEFAULT_PAGINATION.total_items,
          total_pages: parsedPagination.total_pages || DEFAULT_PAGINATION.total_pages,
          has_next: parsedPagination.has_next || DEFAULT_PAGINATION.has_next,
          has_prev: parsedPagination.has_prev || DEFAULT_PAGINATION.has_prev,
          next_page: parsedPagination.next_page || DEFAULT_PAGINATION.next_page,
          prev_page: parsedPagination.prev_page || DEFAULT_PAGINATION.prev_page
        };
        console.log('Parsed pagination from header:', pagination);
      } catch (error) {
        console.error('Failed to parse pagination header:', error);
      }
    }
    
    return pagination;
  }, []);

  return { extractPaginationFromResponse };
};
