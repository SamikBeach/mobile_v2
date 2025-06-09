import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeReview, unlikeReview } from '../apis/review';

interface UseReviewLikeResult {
  handleLikeToggle: (reviewId: number, isLiked: boolean) => Promise<void>;
  isLoading: boolean;
}

export function useReviewLike(): UseReviewLikeResult {
  const queryClient = useQueryClient();

  // 좋아요 추가 mutation
  const { mutateAsync: addLike, isPending: isAddLikeLoading } = useMutation({
    mutationFn: (reviewId: number) => likeReview(reviewId),
    onMutate: async reviewId => {
      // 낙관적 업데이트를 위해 기존 데이터 저장
      await queryClient.cancelQueries({
        queryKey: ['communityReviews'],
        exact: false,
      });

      // 모든 communityReviews 쿼리 데이터를 찾아서 업데이트
      const queryKeys = queryClient.getQueryCache().findAll({
        queryKey: ['communityReviews'],
      });

      // 각 쿼리 키에 대해 이전 데이터 저장 및 업데이트
      const previousDatas: Record<string, unknown> = {};

      queryKeys.forEach(query => {
        const previousData = queryClient.getQueryData(query.queryKey);
        previousDatas[query.queryKey.join('/')] = previousData;

        // 리뷰 데이터 업데이트
        queryClient.setQueryData(query.queryKey, (old: any) => {
          if (!old || !old.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              reviews: page.reviews.map((review: any) =>
                review.id === reviewId
                  ? {
                      ...review,
                      isLiked: true,
                      likeCount: (review.likeCount || 0) + 1,
                    }
                  : review
              ),
            })),
          };
        });
      });

      return { previousDatas };
    },
    onError: (_, __, context) => {
      // 에러 발생 시 이전 상태로 복원
      if (context?.previousDatas) {
        Object.entries(context.previousDatas).forEach(([key, data]) => {
          const queryKey = key.split('/');
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  // 좋아요 취소 mutation
  const { mutateAsync: removeLike, isPending: isRemoveLikeLoading } = useMutation({
    mutationFn: (reviewId: number) => unlikeReview(reviewId),
    onMutate: async reviewId => {
      // 낙관적 업데이트를 위해 기존 데이터 저장
      await queryClient.cancelQueries({
        queryKey: ['communityReviews'],
        exact: false,
      });

      // 모든 communityReviews 쿼리 데이터를 찾아서 업데이트
      const queryKeys = queryClient.getQueryCache().findAll({
        queryKey: ['communityReviews'],
      });

      // 각 쿼리 키에 대해 이전 데이터 저장 및 업데이트
      const previousDatas: Record<string, unknown> = {};

      queryKeys.forEach(query => {
        const previousData = queryClient.getQueryData(query.queryKey);
        previousDatas[query.queryKey.join('/')] = previousData;

        // 리뷰 데이터 업데이트
        queryClient.setQueryData(query.queryKey, (old: any) => {
          if (!old || !old.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              reviews: page.reviews.map((review: any) =>
                review.id === reviewId
                  ? {
                      ...review,
                      isLiked: false,
                      likeCount: Math.max(0, (review.likeCount || 0) - 1),
                    }
                  : review
              ),
            })),
          };
        });
      });

      return { previousDatas };
    },
    onError: (_, __, context) => {
      // 에러 발생 시 이전 상태로 복원
      if (context?.previousDatas) {
        Object.entries(context.previousDatas).forEach(([key, data]) => {
          const queryKey = key.split('/');
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  // 좋아요 토글 핸들러
  const handleLikeToggle = async (reviewId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        await removeLike(reviewId);
      } else {
        await addLike(reviewId);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  return {
    handleLikeToggle,
    isLoading: isAddLikeLoading || isRemoveLikeLoading,
  };
}
