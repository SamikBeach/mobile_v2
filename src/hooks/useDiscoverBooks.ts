import { useInfiniteQuery } from '@tanstack/react-query';
import { getDiscoverBooks } from '../apis/book';
import {
  DiscoverBooksParams,
  HomeBookPreview,
  PopularBooksSortOptions,
  TimeRangeOptions,
} from '../apis/book/types';

interface UseDiscoverBooksOptions extends DiscoverBooksParams {
  enabled?: boolean;
}

export function useDiscoverBooks({
  discoverCategoryId,
  discoverSubCategoryId,
  sort = PopularBooksSortOptions.RATING_DESC,
  timeRange = TimeRangeOptions.ALL,
  limit = 20,
  enabled = true,
}: UseDiscoverBooksOptions = {}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: ['discover-books', discoverCategoryId, discoverSubCategoryId, sort, timeRange],
      queryFn: ({ pageParam = 1 }) =>
        getDiscoverBooks({
          discoverCategoryId,
          discoverSubCategoryId,
          sort,
          timeRange,
          page: pageParam,
          limit,
        }),
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = allPages.length + 1;
        return nextPage <= lastPage.totalPages ? nextPage : undefined;
      },
      initialPageParam: 1,
      enabled,
      staleTime: 1000 * 60 * 5, // 5분 동안 캐시
    });

  // 모든 페이지의 books를 평탄화
  const books: HomeBookPreview[] = data?.pages.flatMap(page => page.books) ?? [];

  return {
    books,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  };
}
