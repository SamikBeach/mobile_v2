import { useInfiniteQuery } from '@tanstack/react-query';
import { getPopularBooks } from '../apis/book/book';
import {
  BookSearchResponse,
  PopularBooksParams,
  PopularBooksSortOptions,
  TimeRangeOptions,
  HomeBookPreview,
} from '../apis/book/types';
import { useMemo } from 'react';

interface UsePopularBooksParams {
  categoryId?: number;
  subcategoryId?: number;
  sort?: string;
  timeRange?: string;
}

export function usePopularBooks(params: UsePopularBooksParams) {
  const PAGE_SIZE = 12;

  // Map legacy sort options to the new enum values if needed
  const getMappedSortParam = (sortValue: string): PopularBooksSortOptions => {
    switch (sortValue) {
      case 'library-desc':
        return PopularBooksSortOptions.LIBRARY_COUNT_DESC;
      case 'rating-desc':
        return PopularBooksSortOptions.RATING_DESC;
      case 'reviews-desc':
        return PopularBooksSortOptions.REVIEWS_DESC;
      case 'publishDate-desc':
        return PopularBooksSortOptions.PUBLISH_DATE_DESC;
      case 'title-asc':
        return PopularBooksSortOptions.TITLE_ASC;
      default:
        return PopularBooksSortOptions.RATING_DESC;
    }
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery<BookSearchResponse>({
      queryKey: [
        'popular-books',
        params.categoryId,
        params.subcategoryId,
        params.sort,
        params.timeRange,
      ],
      queryFn: async ({ pageParam = 1 }) => {
        const apiParams: PopularBooksParams = {
          categoryId: params.categoryId,
          subcategoryId: params.subcategoryId,
          sort: getMappedSortParam(params.sort || 'rating-desc'),
          timeRange: (params.timeRange as TimeRangeOptions) || TimeRangeOptions.ALL,
          page: pageParam as number,
          limit: PAGE_SIZE,
        };

        return await getPopularBooks(apiParams);
      },
      getNextPageParam: lastPage => {
        return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
      },
      initialPageParam: 1,
      gcTime: 1000 * 60 * 10, // 10분간 캐시 유지
      staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    });

  // 모든 페이지의 books를 하나의 배열로 합치기
  const books = useMemo(() => {
    return data?.pages.flatMap(page => page.books) || [];
  }, [data?.pages]);

  // 총 데이터 수는 첫 페이지의 total 값을 사용
  const total = data?.pages[0]?.total || 0;

  return {
    books,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    total,
  };
}
