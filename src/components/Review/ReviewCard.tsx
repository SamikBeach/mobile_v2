import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { ThumbsUp, MessageCircle, Star } from 'lucide-react-native';
import { ReviewType, ReviewResponseDto, HomeReviewPreview } from '../../apis/review/types';
import { CommentBottomSheet } from '../CommentBottomSheet';
import { useReviewLike, useReviewComments } from '../../hooks';

// Union type for both review types
type ReviewData = HomeReviewPreview | ReviewResponseDto;

interface ReviewCardProps {
  review: ReviewData;
  onPress?: () => void;
}

// Type guard function
const isReviewResponseDto = (review: ReviewData): review is ReviewResponseDto => {
  return 'type' in review && 'author' in review && 'images' in review;
};

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onPress }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showCommentsBottomSheet, setShowCommentsBottomSheet] = useState(false);

  // Hooks for like and comment functionality (only for detailed reviews)
  const { handleLikeToggle, isLoading: isLikeLoading } = useReviewLike();
  const {
    comments,
    commentText,
    setCommentText,
    handleAddComment,
    handleDeleteComment,
    handleLikeComment,
    isLoading: isCommentLoading,
    refetch: refetchComments,
  } = useReviewComments(
    isReviewResponseDto(review) ? review.id : 0,
    showCommentsBottomSheet && isReviewResponseDto(review)
  );

  const formatDate = (date: Date | string) => {
    const reviewDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '오늘';
    if (diffDays <= 7) return `${diffDays}일 전`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}주 전`;
    return `${Math.ceil(diffDays / 30)}개월 전`;
  };

  const getTypeDisplayName = (type: ReviewType) => {
    switch (type) {
      case 'general':
        return '일반';
      case 'discussion':
        return '토론';
      case 'review':
        return '리뷰';
      case 'question':
        return '질문';
      case 'meetup':
        return '모임';
      default:
        return '일반';
    }
  };

  const getTypeBackgroundColor = (type: ReviewType) => {
    switch (type) {
      case 'general':
        return '#F9FAFB';
      case 'discussion':
        return '#FEF3C7';
      case 'review':
        return '#F3E8FF';
      case 'question':
        return '#DBEAFE';
      case 'meetup':
        return '#E0E7FF';
      default:
        return '#F9FAFB';
    }
  };

  const getTypeTextColor = (type: ReviewType) => {
    switch (type) {
      case 'general':
        return '#6B7280';
      case 'discussion':
        return '#D97706';
      case 'review':
        return '#7C3AED';
      case 'question':
        return '#2563EB';
      case 'meetup':
        return '#5B21B6';
      default:
        return '#6B7280';
    }
  };

  const getInitials = (username: string) => {
    return username.charAt(0);
  };

  // Lucide Star 아이콘을 사용한 별점 렌더링
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} color='#facc15' fill='#facc15' />);
      } else {
        stars.push(<Star key={i} size={14} color='#e5e7eb' fill='#e5e7eb' />);
      }
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  // Extract common data based on review type
  let authorData,
    content,
    createdAt,
    likeCount,
    commentCount,
    displayBook,
    hasRating,
    rating,
    isLiked,
    reviewType;

  if (isReviewResponseDto(review)) {
    authorData = review.author;
    content = review.content;
    createdAt = review.createdAt;
    likeCount = review.likeCount;
    commentCount = review.commentCount;
    displayBook = review.books && review.books.length > 0 ? review.books[0] : null;
    hasRating = review.userRating && review.userRating.rating > 0;
    rating = hasRating && review.userRating ? review.userRating.rating : 0;
    isLiked = review.isLiked;
    reviewType = review.type;
  } else {
    // HomeReviewPreview
    authorData = review.author || { username: review.authorName, profileImage: undefined };
    content = review.content;
    createdAt = review.createdAt;
    likeCount = review.likeCount;
    commentCount = review.commentCount;
    displayBook = review.books && review.books.length > 0 ? review.books[0] : null;
    hasRating = false;
    rating = 0;
    isLiked = false;
    reviewType = review.type;
  }

  // 텍스트가 길면 접어두기
  const lineCount = content.split('\n').length;
  const isLongContent = lineCount > 7 || content.length > 500;
  const shouldShowMore = isLongContent;

  // 좋아요 핸들러
  const handleLike = async () => {
    if (!isReviewResponseDto(review)) return;

    try {
      await handleLikeToggle(review.id, review.isLiked);
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
    }
  };

  // 댓글 토글 핸들러
  const handleToggleComments = () => {
    if (!isReviewResponseDto(review)) return;

    setShowCommentsBottomSheet(true);
    if (!showCommentsBottomSheet) {
      refetchComments();
    }
  };

  // 댓글 제출 핸들러
  const handleSubmitComment = async () => {
    try {
      await handleAddComment();
    } catch (error) {
      console.error('댓글 작성 중 오류:', error);
      Alert.alert('오류', '댓글 작성 중 문제가 발생했습니다.');
    }
  };

  // 댓글 삭제 핸들러
  const handleDeleteCommentWithAlert = async (commentId: number) => {
    try {
      await handleDeleteComment(commentId);
    } catch (error) {
      console.error('댓글 삭제 중 오류:', error);
      Alert.alert('오류', '댓글 삭제 중 문제가 발생했습니다.');
    }
  };

  // 댓글 좋아요 핸들러
  const handleLikeCommentWithAlert = async (commentId: number, isLiked: boolean) => {
    try {
      await handleLikeComment(commentId, isLiked);
    } catch (error) {
      console.error('댓글 좋아요 처리 중 오류:', error);
      Alert.alert('오류', '댓글 좋아요 처리 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.reviewCard}>
      {/* Header */}
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            {authorData.profileImage ? (
              <Image
                source={{ uri: authorData.profileImage }}
                style={styles.avatarImage}
                resizeMode='cover'
              />
            ) : (
              <Text style={styles.avatarText}>{getInitials(authorData.username)}</Text>
            )}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.usernameLine}>
              <Text style={styles.reviewAuthor}>{authorData.username}</Text>
              {reviewType && (
                <View
                  style={[
                    styles.reviewTypeTag,
                    { backgroundColor: getTypeBackgroundColor(reviewType) },
                  ]}
                >
                  <Text style={[styles.reviewTypeText, { color: getTypeTextColor(reviewType) }]}>
                    {getTypeDisplayName(reviewType)}
                  </Text>
                </View>
              )}
              {hasRating && (
                <View style={styles.ratingContainer}>
                  {renderStarRating(rating)}
                  <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.reviewTime}>{formatDate(createdAt)}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <TouchableOpacity
        activeOpacity={shouldShowMore ? 0.7 : 1}
        onPress={shouldShowMore ? () => setShowFullContent(!showFullContent) : onPress}
        disabled={!shouldShowMore && !onPress}
      >
        <Text
          style={styles.reviewContent}
          numberOfLines={showFullContent ? undefined : shouldShowMore ? 7 : undefined}
        >
          {content}
        </Text>
        {shouldShowMore && (
          <Text style={styles.readMore}>{showFullContent ? '접기' : '더 보기'}</Text>
        )}
      </TouchableOpacity>

      {/* Book Section */}
      {displayBook && (
        <View style={styles.bookSection}>
          <View style={styles.bookContainer}>
            <Image
              source={{ uri: displayBook.coverImage }}
              style={styles.bookCover}
              resizeMode='cover'
            />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle} numberOfLines={2}>
                {displayBook.title}
              </Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>
                {displayBook.author}
              </Text>
              <View style={styles.bookRatingSection}>
                <View style={styles.bookRating}>
                  {renderStarRating(4.0)}
                  <Text style={styles.bookRatingText}>4.0</Text>
                  <Text style={styles.bookRatingCount}>(1)</Text>
                </View>
                <View style={styles.bookComments}>
                  <MessageCircle size={14} color='#9CA3AF' />
                  <Text style={styles.bookCommentsText}>3</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.reviewActions}>
        <TouchableOpacity
          style={[styles.actionButton, isLiked && styles.actionButtonLiked]}
          onPress={handleLike}
          disabled={isLikeLoading}
        >
          <ThumbsUp
            size={16}
            color={isLiked ? '#059669' : '#6B7280'}
            fill={isLiked ? '#059669' : 'transparent'}
          />
          <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
            {likeCount || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleToggleComments}>
          <MessageCircle size={16} color='#6B7280' />
          <Text style={styles.actionText}>{commentCount || 0}</Text>
        </TouchableOpacity>
      </View>

      {/* Comment Bottom Sheet */}
      {isReviewResponseDto(review) && (
        <CommentBottomSheet
          isVisible={showCommentsBottomSheet}
          onClose={() => setShowCommentsBottomSheet(false)}
          comments={comments}
          commentText={commentText}
          setCommentText={setCommentText}
          onSubmitComment={handleSubmitComment}
          onDeleteComment={handleDeleteCommentWithAlert}
          onLikeComment={handleLikeCommentWithAlert}
          isLoading={isCommentLoading}
          currentUserId={review.author.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 0,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  usernameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  reviewTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#B45309',
    marginLeft: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  bookSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
  },
  bookContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  bookCover: {
    width: 72,
    height: 110,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  bookRatingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  bookRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bookRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  bookRatingCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  bookComments: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    paddingLeft: 8,
    marginLeft: 8,
    gap: 4,
  },
  bookCommentsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    minHeight: 32,
  },
  actionButtonLiked: {
    backgroundColor: '#ECFDF5',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  actionTextLiked: {
    color: '#059669',
  },
  readMore: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  // Simple styles for home view
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  stats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
});
