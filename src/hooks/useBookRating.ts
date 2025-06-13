import { useMutation, useQueryClient, useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAtomValue } from 'jotai';

import { createOrUpdateRating, deleteRating, getUserBookRating } from '../apis/rating';
import { RatingDto } from '../apis/rating/types';
import { getBookByIsbn } from '../apis/book';
import { userAtom } from '../atoms/user';

// 별점 호버 및 표시를 위한 UI 관련 상태와 핸들러를 관리하는 훅
export function useBookRating(isbn: string) {
  const queryClient = useQueryClient();
  const currentUser = useAtomValue(userAtom);

  // 책 정보 가져오기
  const { data: book } = useSuspenseQuery({
    queryKey: ['book-detail', isbn],
    queryFn: () => getBookByIsbn(isbn),
  });

  // 사용자 평점 가져오기 (로그인한 사용자만)
  const { data: userRatingData } = useQuery({
    queryKey: ['user-book-rating', book?.id],
    queryFn: async () => {
      if (!book?.id || !currentUser) return null;
      try {
        return await getUserBookRating(book.id);
      } catch (error) {
        // 평점이 없는 경우 null 반환
        return null;
      }
    },
    enabled: !!book?.id && !!currentUser,
  });

  // UI 관련 상태만 로컬로 유지 (호버 효과 등)
  const [isRatingHovered, setIsRatingHovered] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // 서버에서 가져온 userRating 사용
  const userRating = userRatingData?.rating || 0;
  const comment = userRatingData?.comment || '';

  // 별점 추가 뮤테이션
  const { mutate: addRating, isPending: isUpdating } = useMutation({
    mutationFn: async ({ bookId, ratingData }: { bookId: number; ratingData: RatingDto }) => {
      return createOrUpdateRating(bookId, ratingData, bookId < 0 ? isbn : undefined);
    },
    onSuccess: newRating => {
      // 캐시 직접 업데이트 - 다시 로드하지 않고 UI만 업데이트
      if (book?.id) {
        // user-book-rating 캐시 업데이트
        queryClient.setQueryData(['user-book-rating', book.id], newRating);

        // book-detail 캐시 직접 업데이트
        queryClient.setQueryData(['book-detail', isbn], (oldData: any) => {
          if (!oldData) return oldData;

          // 평균 별점 업데이트 계산
          let newRatingValue = oldData.rating || 0;
          let newTotalRatings = oldData.totalRatings || 0;

          // 기존에 userRating이 있는지 확인
          const hadPreviousRating = !!oldData.userRating;
          const oldRating = oldData.userRating?.rating || 0;
          const updatedRating = newRating.rating;

          if (!hadPreviousRating) {
            // 새 평점 추가 - 총합에 새 평점 추가하고 카운트 증가
            const totalRatingSum = newRatingValue * newTotalRatings + updatedRating;
            newTotalRatings += 1;
            newRatingValue = newTotalRatings > 0 ? totalRatingSum / newTotalRatings : 0;
          } else if (oldRating !== updatedRating) {
            // 평점 변경 - 총합에서 이전 평점 제거하고 새 평점 추가
            const totalRatingSum = newRatingValue * newTotalRatings - oldRating + updatedRating;
            newRatingValue = newTotalRatings > 0 ? totalRatingSum / newTotalRatings : 0;
          }

          // 업데이트된 데이터 반환
          return {
            ...oldData,
            userRating: newRating,
            rating: newRatingValue,
            totalRatings: newTotalRatings,
          };
        });
      }

      // 커뮤니티 리뷰 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['communityReviews'],
        refetchType: 'active',
      });

      // book-reviews 쿼리 무효화
      if (book?.id) {
        queryClient.invalidateQueries({
          queryKey: ['book-reviews', book.id, isbn],
          refetchType: 'active',
        });
      }

      Toast.show({
        type: 'success',
        text1: '평점이 등록되었습니다.',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: '평점 등록에 실패했습니다.',
      });
    },
  });

  // 평점 삭제 뮤테이션
  const { mutate: removeRating, isPending: isDeleting } = useMutation({
    mutationFn: async (ratingId: number) => {
      return deleteRating(ratingId);
    },
    onSuccess: () => {
      // 캐시 직접 업데이트
      if (book?.id) {
        // user-book-rating 캐시 업데이트 (null로 설정)
        queryClient.setQueryData(['user-book-rating', book.id], null);

        // book-detail 캐시 직접 업데이트 (userRating을 null로 설정하고 평균 평점 및 totalRatings 업데이트)
        queryClient.setQueryData(['book-detail', isbn], (oldData: any) => {
          if (!oldData) return oldData;

          // 평점 삭제 시 평균 별점 업데이트
          let newRatingValue = oldData.rating || 0;
          let newTotalRatings = oldData.totalRatings || 0;

          // 이전에 평점이 있었다면
          if (oldData.userRating) {
            const oldRating = oldData.userRating.rating;
            if (newTotalRatings > 1) {
              // 총합에서 삭제된 평점 제거하고 카운트 감소
              const totalRatingSum = newRatingValue * newTotalRatings - oldRating;
              newTotalRatings -= 1;
              newRatingValue = totalRatingSum / newTotalRatings;
            } else {
              // 마지막 평점이 삭제되면 0으로 설정
              newTotalRatings = 0;
              newRatingValue = 0;
            }
          }

          return {
            ...oldData,
            userRating: null,
            rating: newRatingValue,
            totalRatings: newTotalRatings,
          };
        });
      }

      // 커뮤니티 리뷰 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['communityReviews'],
        refetchType: 'active',
      });

      // book-reviews 쿼리 무효화
      if (book?.id) {
        queryClient.invalidateQueries({
          queryKey: ['book-reviews', book.id, isbn],
          refetchType: 'active',
        });
      }

      Toast.show({
        type: 'success',
        text1: '평점이 삭제되었습니다.',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: '평점 삭제에 실패했습니다.',
      });
    },
  });

  // 별점 추가 핸들러
  const handleRatingClick = useCallback(
    (starRating: number) => {
      if (!book?.id) return;

      // API 호출로 별점 저장 - comment 없이 rating만 전송
      addRating({
        bookId: book.id,
        ratingData: { rating: starRating },
      });
    },
    [addRating, book]
  );

  // 별점 호버 핸들러
  const handleRatingHover = useCallback((starRating: number) => {
    setHoveredRating(starRating);
    setIsRatingHovered(true);
  }, []);

  // 별점 호버 아웃 핸들러
  const handleRatingLeave = useCallback(() => {
    setIsRatingHovered(false);
  }, []);

  // 평점 제출 핸들러 (리뷰 다이얼로그에서 사용)
  const handleSubmitRating = useCallback(
    (newRating: number, newComment: string = '') => {
      if (!book?.id) return;

      if (newRating === 0) {
        Toast.show({
          type: 'error',
          text1: '별점을 선택해주세요.',
        });
        return;
      }

      // comment가 있는 경우와 없는 경우 분리
      const ratingData: RatingDto = newComment.trim()
        ? { rating: newRating, comment: newComment }
        : { rating: newRating };

      addRating({
        bookId: book.id,
        ratingData,
      });
    },
    [book, addRating]
  );

  return {
    userRating,
    userRatingData,
    isRatingHovered,
    hoveredRating,
    comment,
    isUpdating,
    isDeleting,
    handleRatingClick,
    handleRatingHover,
    handleRatingLeave,
    handleSubmitRating,
    removeRating: userRatingData?.id ? () => removeRating(userRatingData.id) : undefined,
  };
}
