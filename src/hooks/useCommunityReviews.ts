import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { getReviews } from '../apis/review';
import { ReviewType, ReviewResponseDto } from '../apis/review/types';

export type SortOption = 'popular' | 'recent' | 'following';

interface UseCommunityReviewsParams {
  category: ReviewType | 'all';
  sort: SortOption;
  limit?: number;
}

export const useCommunityReviews = ({ category, sort, limit = 10 }: UseCommunityReviewsParams) => {
  const result = useSuspenseInfiniteQuery({
    queryKey: ['communityReviews', category, sort, limit],
    queryFn: ({ pageParam = 1 }) =>
      getReviews(
        pageParam,
        limit,
        sort === 'latest' ? 'recent' : sort,
        category === 'all' ? undefined : category
      ),
    getNextPageParam: lastPage => {
      const { page, totalPages } = lastPage;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2, // 2분
  });

  const reviews = result.data?.pages.flatMap(page => page.reviews) || [];

  return {
    reviews,
    ...result,
  };
};
