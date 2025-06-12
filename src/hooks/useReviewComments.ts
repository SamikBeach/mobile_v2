import {
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
  updateComment,
  getReviewComments,
} from '../apis/review';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { Comment } from '../apis/review/types';

interface UseReviewCommentsResult {
  comments: Comment[];
  isLoading: boolean;
  error: Error | null;
  commentText: string;
  setCommentText: (text: string) => void;
  handleAddComment: () => Promise<void>;
  handleDeleteComment: (commentId: number) => Promise<void>;
  handleUpdateComment: (commentId: number, content: string) => Promise<void>;
  handleLikeComment: (commentId: number, isLiked: boolean) => Promise<void>;
  refetch: () => Promise<any>;
}

export function useReviewComments(
  reviewId: number,
  showComments: boolean = false
): UseReviewCommentsResult {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  // 댓글 목록 조회 - showComments가 true일 때만 활성화
  const {
    data: commentsResponse = { comments: [] },
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['review-comments', reviewId],
    queryFn: () => getReviewComments(reviewId),
    enabled: showComments, // 댓글이 표시될 때만 데이터 가져오기
  });

  const comments = commentsResponse.comments || [];

  // 리뷰의 댓글 수만 업데이트하는 헬퍼 함수 (웹 버전과 동일한 로직)
  const updateReviewCommentCount = useCallback(
    (reviewId: number, changeAmount: number) => {
      // 모든 리뷰 관련 쿼리 키들을 가져옴
      const queryKeys = queryClient.getQueryCache().findAll();

      queryKeys.forEach(query => {
        // communityReviews 쿼리 처리
        if (query.queryKey[0] === 'communityReviews') {
          queryClient.setQueryData(query.queryKey, (oldData: any) => {
            if (!oldData || !oldData.pages) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                reviews: page.reviews.map((review: any) =>
                  review.id === reviewId
                    ? {
                        ...review,
                        commentCount: Math.max(0, (review.commentCount || 0) + changeAmount),
                      }
                    : review
                ),
              })),
            };
          });
        }

        // book-reviews 쿼리 처리 (무한 쿼리 형태)
        if (query.queryKey[0] === 'book-reviews') {
          queryClient.setQueryData(query.queryKey, (oldData: any) => {
            // 무한 쿼리 형태인 경우 ({ pages: [{...}] })
            if (oldData?.pages && Array.isArray(oldData.pages)) {
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => {
                  if (!page || !page.reviews || !Array.isArray(page.reviews)) return page;

                  return {
                    ...page,
                    reviews: page.reviews.map((review: any) =>
                      review.id === reviewId
                        ? {
                            ...review,
                            commentCount: Math.max(0, (review.commentCount || 0) + changeAmount),
                          }
                        : review
                    ),
                  };
                }),
              };
            }

            // 일반 배열 형태인 경우
            if (Array.isArray(oldData)) {
              return oldData.map((review: any) =>
                review.id === reviewId
                  ? {
                      ...review,
                      commentCount: Math.max(0, (review.commentCount || 0) + changeAmount),
                    }
                  : review
              );
            }

            // { reviews: [...] } 형태인 경우
            if (oldData?.reviews && Array.isArray(oldData.reviews)) {
              return {
                ...oldData,
                reviews: oldData.reviews.map((review: any) =>
                  review.id === reviewId
                    ? {
                        ...review,
                        commentCount: Math.max(0, (review.commentCount || 0) + changeAmount),
                      }
                    : review
                ),
              };
            }

            return oldData;
          });
        }
      });
    },
    [queryClient, reviewId]
  );

  // 댓글 추가 mutation
  const { mutateAsync: addComment } = useMutation({
    mutationFn: async () => {
      return createComment(reviewId, {
        content: commentText,
      });
    },
    onSuccess: () => {
      // 댓글 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: ['review-comments', reviewId],
      });

      // 리뷰 목록의 댓글 수 업데이트
      updateReviewCommentCount(reviewId, 1);
    },
    onError: () => {
      console.error('댓글 작성에 실패했습니다.');
    },
  });

  // 댓글 삭제 mutation
  const { mutateAsync: deleteCommentMutation } = useMutation({
    mutationFn: async (commentId: number) => {
      return deleteComment(commentId);
    },
    onSuccess: () => {
      // 댓글 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: ['review-comments', reviewId],
      });

      // 리뷰 목록의 댓글 수 업데이트
      updateReviewCommentCount(reviewId, -1);
    },
    onError: () => {
      console.error('댓글 삭제에 실패했습니다.');
    },
  });

  // 댓글 좋아요 뮤테이션 (낙관적 업데이트 추가)
  const { mutate: likeCommentMutation } = useMutation({
    mutationFn: (commentId: number) => likeComment(commentId),
    onMutate: async commentId => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({
        queryKey: ['review-comments', reviewId],
      });

      const previousComments = queryClient.getQueryData(['review-comments', reviewId]);

      queryClient.setQueryData(['review-comments', reviewId], (old: any) => {
        if (!old || !old.comments) return old;
        return {
          ...old,
          comments: old.comments.map((comment: any) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: true,
                  likeCount: (comment.likeCount || 0) + 1,
                }
              : comment
          ),
        };
      });

      return { previousComments };
    },
    onSuccess: () => {
      // 서버 상태와 동기화
      queryClient.invalidateQueries({
        queryKey: ['review-comments', reviewId],
      });
    },
    onError: (_, __, context) => {
      // 실패 시 이전 상태로 복원
      if (context?.previousComments) {
        queryClient.setQueryData(['review-comments', reviewId], context.previousComments);
      }
      console.error('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    },
  });

  // 댓글 좋아요 취소 뮤테이션 (낙관적 업데이트 추가)
  const { mutate: unlikeCommentMutation } = useMutation({
    mutationFn: (commentId: number) => unlikeComment(commentId),
    onMutate: async commentId => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({
        queryKey: ['review-comments', reviewId],
      });

      const previousComments = queryClient.getQueryData(['review-comments', reviewId]);

      queryClient.setQueryData(['review-comments', reviewId], (old: any) => {
        if (!old || !old.comments) return old;
        return {
          ...old,
          comments: old.comments.map((comment: any) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: false,
                  likeCount: Math.max(0, (comment.likeCount || 0) - 1),
                }
              : comment
          ),
        };
      });

      return { previousComments };
    },
    onSuccess: () => {
      // 서버 상태와 동기화
      queryClient.invalidateQueries({
        queryKey: ['review-comments', reviewId],
      });
    },
    onError: (_, __, context) => {
      // 실패 시 이전 상태로 복원
      if (context?.previousComments) {
        queryClient.setQueryData(['review-comments', reviewId], context.previousComments);
      }
      console.error('좋아요 취소 처리에 실패했습니다. 다시 시도해주세요.');
    },
  });

  // 댓글 수정 뮤테이션
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(commentId, { content }),
    onMutate: async ({ commentId, content }) => {
      // 낙관적 업데이트
      await queryClient.cancelQueries({
        queryKey: ['review', 'comments', reviewId],
      });

      const previousComments = queryClient.getQueryData<Comment[]>([
        'review',
        'comments',
        reviewId,
      ]);

      // 댓글 목록에서 해당 댓글 업데이트
      queryClient.setQueryData<Comment[]>(['review', 'comments', reviewId], old => {
        if (!old) return [];
        return old.map(comment => (comment.id === commentId ? { ...comment, content } : comment));
      });

      return { previousComments };
    },
    onError: (err, variables, context) => {
      // 에러 시 이전 상태로 롤백
      if (context?.previousComments) {
        queryClient.setQueryData(['review', 'comments', reviewId], context.previousComments);
      }
    },
    onSettled: () => {
      // 성공/실패와 관계없이 댓글 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ['review', 'comments', reviewId],
      });
    },
  });

  // 댓글 수정 핸들러
  const handleUpdateComment = useCallback(
    async (commentId: number, content: string) => {
      await updateCommentMutation.mutateAsync({ commentId, content });
    },
    [updateCommentMutation]
  );

  // 댓글 추가 핸들러
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await addComment();
      // 성공 시 입력 필드 초기화
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // 댓글 삭제 핸들러
  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteCommentMutation(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  // 댓글 좋아요 핸들러
  const handleLikeComment = async (commentId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeCommentMutation(commentId);
      } else {
        await likeCommentMutation(commentId);
      }
    } catch (error) {
      console.error('Failed to toggle comment like:', error);
    }
  };

  return {
    comments,
    isLoading,
    error: error as Error | null,
    commentText,
    setCommentText,
    handleAddComment,
    handleDeleteComment,
    handleLikeComment,
    handleUpdateComment,
    refetch,
  };
}
