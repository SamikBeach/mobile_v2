import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { createOrUpdateRating, deleteRating } from '../apis/rating';
import { createReview, deleteReview, updateReview } from '../apis/review';
import { createOrUpdateReadingStatus, deleteReadingStatusByBookId } from '../apis/reading-status';
import { ReadingStatusType } from '../apis/reading-status/types';
import { Review } from '../apis/review/types';
import { BookDetails } from '../apis/book/types';

interface UserRating {
  id: number;
  rating: number;
  bookId: number;
  comment?: string;
}

interface UseReviewDialogProps {
  book: BookDetails | null;
  isbn: string;
  userRating?: UserRating | null;
  userReadingStatus?: ReadingStatusType | null;
}

export function useReviewDialog({
  book,
  isbn,
  userRating,
  userReadingStatus,
}: UseReviewDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [initialContent, setInitialContent] = useState('');
  const [initialRating, setInitialRating] = useState(0);

  // 리뷰 제출 뮤테이션 (생성/수정/별점 모두 처리)
  const mutation = useMutation({
    mutationFn: async (params: {
      rating: number;
      content: string;
      readingStatus?: ReadingStatusType | null;
    }): Promise<any> => {
      const { rating, content, readingStatus } = params;

      // 책 ID 확인
      if (!book?.id) {
        throw new Error('책 정보가 없습니다.');
      }

      // 리뷰 수정 모드
      if (isEditMode && editingReview) {
        let ratingResponse = null;
        let reviewResponse = null;

        // 별점이 변경된 경우에만 별점 API 호출
        const ratingChanged = rating !== initialRating;

        // 내용이 변경된 경우에만 리뷰 API 호출
        const contentChanged = content !== initialContent;

        // 내용이 완전히 삭제된 경우 (리뷰 삭제)
        const contentDeleted = initialContent && !content.trim();

        if (ratingChanged) {
          // 별점 업데이트 - comment 없이 rating만 전송
          ratingResponse = await createOrUpdateRating(
            book.id,
            { rating },
            book.id < 0 ? isbn : undefined
          );
        }

        if (contentDeleted) {
          // 리뷰 삭제
          await deleteReview(editingReview.id);
          reviewResponse = null;
        } else if (contentChanged) {
          // 리뷰 내용 업데이트
          reviewResponse = await updateReview(editingReview.id, {
            content,
            bookId: book.id,
            isbn: book.id < 0 ? isbn : undefined,
          });
        }

        // 별점과 리뷰 응답을 합쳐서 반환
        return {
          ...(reviewResponse || editingReview),
          rating: ratingResponse ? ratingResponse.rating : rating,
          ratingId: ratingResponse ? ratingResponse.id : editingReview.userRating?.bookId || 0,
          ratingChanged,
          contentChanged,
          contentDeleted,
        };
      }

      // 별점만 등록(또는 업데이트)하는 경우 (내용이 없는 경우)
      if (!content.trim()) {
        // 읽기 상태가 전달된 경우에도 변경해야 함
        let readingStatusResponse = null;
        let readingStatusChanged = false;

        // 먼저 별점 업데이트
        const ratingResponse = await createOrUpdateRating(
          book.id,
          { rating },
          book.id < 0 ? isbn : undefined
        );

        // 읽기 상태 변경 여부 확인
        const isReadingStatusChanged =
          (readingStatus === null && userReadingStatus !== null) ||
          (readingStatus !== null && readingStatus !== userReadingStatus);

        // 읽기 상태가 변경된 경우에만 API 호출
        if (isReadingStatusChanged) {
          // 읽기 상태가 null인 경우 (선택 안함 선택 시)
          if (readingStatus === null) {
            await deleteReadingStatusByBookId(book.id);
            readingStatusChanged = true;
          }
          // 읽기 상태가 전달된 경우 읽기 상태도 업데이트
          else if (readingStatus) {
            readingStatusResponse = await createOrUpdateReadingStatus(
              book.id,
              { status: readingStatus },
              book.id < 0 ? isbn : undefined
            );
            readingStatusChanged = true;
          }
        }

        // 별점과 읽기 상태 응답을 합쳐서 반환
        return {
          ...ratingResponse,
          ratingChanged: true,
          readingStatus: readingStatusResponse ? readingStatusResponse.status : readingStatus,
          readingStatusChanged,
        };
      }

      // 새 리뷰 생성 - 별점과 리뷰를 따로 처리
      // 기존 별점과 비교하여 변경된 경우에만 별점 API 호출
      const ratingChanged = rating !== (userRating?.rating || 0);
      let ratingResponse = null;

      if (ratingChanged) {
        // 먼저 별점 업데이트 - comment 없이 rating만 전송
        ratingResponse = await createOrUpdateRating(
          book.id,
          { rating },
          book.id < 0 ? isbn : undefined
        );
      }

      // 그 다음 리뷰 생성
      const reviewResponse = await createReview({
        content,
        type: 'review',
        bookId: book.id,
        isbn: isbn, // ISBN 항상 포함하도록 수정
      });

      // 읽기 상태 변경 여부 확인
      const isReadingStatusChanged =
        (readingStatus === null && userReadingStatus !== null) ||
        (readingStatus !== null && readingStatus !== userReadingStatus);

      // 읽기 상태가 null인 경우 (선택 안함 선택 시)
      let readingStatusResponse = null;
      let readingStatusChanged = false;

      // 읽기 상태가 변경된 경우에만 API 호출
      if (isReadingStatusChanged) {
        if (readingStatus === null) {
          await deleteReadingStatusByBookId(book.id);
          readingStatusChanged = true;
        }
        // 읽기 상태가 전달된 경우 읽기 상태도 업데이트
        else if (readingStatus) {
          readingStatusResponse = await createOrUpdateReadingStatus(
            book.id,
            { status: readingStatus },
            book.id < 0 ? isbn : undefined
          );
          readingStatusChanged = true;
        }
      }

      // 별점과 리뷰 및 읽기 상태 응답을 합쳐서 반환
      return {
        ...reviewResponse,
        rating: ratingResponse ? ratingResponse.rating : rating,
        ratingId: ratingResponse ? ratingResponse.id : userRating?.id || 0,
        ratingChanged,
        readingStatus: readingStatusResponse ? readingStatusResponse.status : readingStatus,
        readingStatusChanged,
      };
    },
    onSuccess: data => {
      // 직접 book-detail 캐시 업데이트 (별점 즉시 반영)
      if (book && isbn) {
        // 별점 표시를 위한 userRating 데이터 구성
        const userRatingData = {
          id: data.ratingId || data.id,
          rating: data.rating,
          bookId: book.id,
          comment: data.comment || '',
        };

        // book-detail 쿼리 데이터 직접 업데이트
        queryClient.setQueryData(['book-detail', isbn], (oldData: unknown) => {
          if (!oldData) return oldData;

          const typedOldData = oldData as BookDetails;

          // 평균 별점 업데이트 계산
          let newRatingValue = typedOldData.rating || 0;
          let newTotalRatings = typedOldData.totalRatings || 0;

          // 기존에 userRating이 있는지 확인
          const hadPreviousRating = !!typedOldData.userRating;
          const oldRating = typedOldData.userRating?.rating || 0;
          const newRating = data.rating;

          // 별점이 변경된 경우에만 평균 별점 업데이트
          if (data.ratingChanged) {
            if (!hadPreviousRating) {
              // 새 평점 추가 - 총합에 새 평점 추가하고 카운트 증가
              const totalRatingSum = newRatingValue * newTotalRatings + newRating;
              newTotalRatings += 1;
              newRatingValue = newTotalRatings > 0 ? totalRatingSum / newTotalRatings : 0;
            } else if (oldRating !== newRating) {
              // 평점 변경 - 총합에서 이전 평점 제거하고 새 평점 추가
              const totalRatingSum = newRatingValue * newTotalRatings - oldRating + newRating;
              newRatingValue = newTotalRatings > 0 ? totalRatingSum / newTotalRatings : 0;
            }
          }

          // 읽기 상태 업데이트 (읽기 상태가 변경된 경우)
          const updatedUserReadingStatus = data.readingStatusChanged
            ? data.readingStatus === null
              ? null
              : (data.readingStatus as ReadingStatusType)
            : typedOldData.userReadingStatus;

          // 업데이트된 데이터 반환
          return {
            ...typedOldData,
            userRating: userRatingData,
            rating: newRatingValue,
            totalRatings: newTotalRatings,
            userReadingStatus: updatedUserReadingStatus,
          };
        });

        // user-book-rating 캐시 직접 업데이트
        if (book?.id) {
          queryClient.setQueryData(['user-book-rating', book.id], userRatingData);

          // 읽기 상태가 변경된 경우에만 user-reading-status 캐시 업데이트
          if (data.readingStatusChanged) {
            // 읽기 상태가 null인 경우 null로 설정
            queryClient.setQueryData(
              ['user-reading-status', book.id],
              data.readingStatus === null
                ? null
                : { status: data.readingStatus || book.userReadingStatus }
            );
          }
        }

        // 리뷰 목록 쿼리 무효화 (새 리뷰가 목록에 나타나도록)
        queryClient.invalidateQueries({
          queryKey: ['book-reviews', book.id, isbn],
          refetchType: 'active',
        });

        // 별점이 변경된 경우 커뮤니티 리뷰 관련 쿼리 무효화
        if (data.ratingChanged) {
          queryClient.invalidateQueries({
            queryKey: ['communityReviews'],
            refetchType: 'active',
          });
        }

        // 읽기 상태가 변경된 경우에만 관련 쿼리 무효화
        if (data.readingStatusChanged) {
          // 읽기 상태 관련 쿼리 무효화
          queryClient.invalidateQueries({
            queryKey: ['reading-status'],
            refetchType: 'active',
          });
        }
      }

      // 성공 메시지 표시
      if (data.contentDeleted) {
        Toast.show({
          type: 'success',
          text1: '리뷰가 삭제되었습니다',
        });
      } else if (isEditMode) {
        Toast.show({
          type: 'success',
          text1: '리뷰가 수정되었습니다',
        });
      } else if (data.content) {
        Toast.show({
          type: 'success',
          text1: '리뷰가 등록되었습니다',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: '별점이 등록되었습니다',
        });
      }

      setIsSubmitting(false);
    },
    onError: (error: any) => {
      console.error('리뷰 제출 실패:', error);
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: error.message || '리뷰 제출에 실패했습니다.',
      });
      setIsSubmitting(false);
    },
  });

  const handleReviewSubmit = async (
    rating: number,
    content: string,
    readingStatus?: ReadingStatusType | null
  ) => {
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync({ rating, content, readingStatus });
    } catch (error) {
      // 에러는 onError에서 처리됨
    }
  };

  const openEditMode = (review: Review) => {
    setIsEditMode(true);
    setEditingReview(review);
    setInitialContent(review.content);
    setInitialRating(review.userRating?.rating || 0);
  };

  const openCreateMode = () => {
    setIsEditMode(false);
    setEditingReview(null);
    setInitialContent('');
    setInitialRating(userRating?.rating || 0);
  };

  return {
    handleReviewSubmit,
    isSubmitting,
    isEditMode,
    initialContent,
    initialRating,
    openEditMode,
    openCreateMode,
  };
}
