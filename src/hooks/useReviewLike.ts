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
    onSuccess: () => {
      // 리뷰가 포함된 모든 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['communityReviews'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['home', 'popularReviews'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['user-community-reviews'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['user-reviews'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['book-reviews'],
        exact: false,
      });
    },
  });

  // 좋아요 취소 mutation
  const { mutateAsync: removeLike, isPending: isRemoveLikeLoading } = useMutation({
    mutationFn: (reviewId: number) => unlikeReview(reviewId),
    onSuccess: () => {
      // 리뷰가 포함된 모든 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['communityReviews'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['home', 'popularReviews'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['user-community-reviews'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['user-reviews'],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ['book-reviews'],
        exact: false,
      });
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
