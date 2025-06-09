import {
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getReviewComments,
} from '../apis/review';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Comment } from '../apis/review/types';

interface UseReviewCommentsResult {
  comments: Comment[];
  isLoading: boolean;
  error: Error | null;
  commentText: string;
  setCommentText: (text: string) => void;
  handleAddComment: () => Promise<void>;
  handleDeleteComment: (commentId: number) => Promise<void>;
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

      // communityReviews의 모든 관련 쿼리 인스턴스의 commentCount를 직접 증가
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ['communityReviews'] })
        .forEach(query => {
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
                        commentCount: (review.commentCount || 0) + 1,
                      }
                    : review
                ),
              })),
            };
          });
        });
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

      // communityReviews의 모든 관련 쿼리 인스턴스의 commentCount를 직접 감소
      queryClient
        .getQueryCache()
        .findAll({ queryKey: ['communityReviews'] })
        .forEach(query => {
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
                        commentCount: Math.max(0, (review.commentCount || 0) - 1),
                      }
                    : review
                ),
              })),
            };
          });
        });
    },
    onError: () => {
      console.error('댓글 삭제에 실패했습니다.');
    },
  });

  // 댓글 좋아요 뮤테이션
  const { mutate: likeCommentMutation } = useMutation({
    mutationFn: (commentId: number) => likeComment(commentId),
    onSuccess: () => {
      // 댓글 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: ['review-comments', reviewId],
      });
    },
    onError: () => {
      console.error('좋아요 처리에 실패했습니다. 다시 시도해주세요.');
    },
  });

  // 댓글 좋아요 취소 뮤테이션
  const { mutate: unlikeCommentMutation } = useMutation({
    mutationFn: (commentId: number) => unlikeComment(commentId),
    onSuccess: () => {
      // 댓글 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: ['review-comments', reviewId],
      });
    },
    onError: () => {
      console.error('좋아요 취소 처리에 실패했습니다. 다시 시도해주세요.');
    },
  });

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
    refetch,
  };
}
