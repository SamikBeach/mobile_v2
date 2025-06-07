import React, { useState, useCallback, useRef, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  TextInput,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  Alert,
} from 'react-native';
import { Plus, ThumbsUp, MessageCircle, Star } from 'lucide-react-native';
import { ReviewType, ReviewResponseDto } from '../../apis/review/types';
import { LoadingSpinner } from '../../components';
import { CommentBottomSheet } from '../../components';
import { useCommunityReviews, SortOption, useReviewLike, useReviewComments } from '../../hooks';

interface CategoryOption {
  id: ReviewType | 'all';
  name: string;
  color: string;
}

interface SortOptionItem {
  id: SortOption;
  name: string;
}

// Constants
const categoryOptions: CategoryOption[] = [
  { id: 'all', name: '전체', color: '#F1F5F9' },
  { id: 'general', name: '일반', color: '#FECACA' },
  { id: 'discussion', name: '토론', color: '#FEF3C7' },
  { id: 'review', name: '리뷰', color: '#D1FAE5' },
  { id: 'question', name: '질문', color: '#DBEAFE' },
  { id: 'meetup', name: '모임', color: '#E0E7FF' },
];

const sortOptions: SortOptionItem[] = [
  { id: 'following', name: '팔로잉' },
  { id: 'popular', name: '인기' },
  { id: 'recent', name: '최신' },
];

// CategoryFilter Component
const CategoryFilter = ({
  selectedCategory,
  onCategoryPress,
}: {
  selectedCategory: ReviewType | 'all';
  onCategoryPress: (category: ReviewType | 'all') => void;
}) => (
  <View style={styles.categoryContainer}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScrollView}
      contentContainerStyle={styles.categoryScrollContent}
    >
      {categoryOptions.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            {
              backgroundColor: selectedCategory === category.id ? '#111827' : category.color,
            },
          ]}
          onPress={() => onCategoryPress(category.id)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              {
                color: selectedCategory === category.id ? 'white' : '#374151',
              },
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// SortFilter Component
const SortFilter = ({
  selectedSort,
  onSortPress,
}: {
  selectedSort: SortOption;
  onSortPress: (sort: SortOption) => void;
}) => (
  <View style={styles.sortContainer}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.sortScrollContent}
    >
      {sortOptions.map(option => (
        <TouchableOpacity
          key={option.id}
          style={[styles.sortButton, selectedSort === option.id && styles.activeSortButton]}
          onPress={() => onSortPress(option.id)}
        >
          <Text
            style={[
              styles.sortButtonText,
              selectedSort === option.id && styles.activeSortButtonText,
            ]}
          >
            {option.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// CreateReviewCard Component
const CreateReviewCard = () => (
  <View style={styles.createReviewCard}>
    <View style={styles.createReviewHeader}>
      <View style={styles.createUserAvatar}>
        <Text style={styles.createAvatarText}>b</Text>
      </View>
      <View style={styles.createReviewInput}>
        <TextInput
          style={styles.createTextInput}
          placeholder='어떤 책에 대해 이야기하고 싶으신가요?'
          placeholderTextColor='#9CA3AF'
          multiline
          editable={false}
        />
        <View style={styles.createReviewActions}>
          <View style={styles.createLeftActions}>
            <TouchableOpacity style={styles.categorySelector}>
              <View style={styles.categoryDot} />
              <Text style={styles.categorySelectorText}>일반</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookAddButton}>
              <Plus size={12} color='#6B7280' />
              <Text style={styles.bookAddButtonText}>책 추가</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>제출하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

// ReviewCard Component
const ReviewCard = ({ review }: { review: ReviewResponseDto }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showCommentsBottomSheet, setShowCommentsBottomSheet] = useState(false);

  // Hooks for like and comment functionality
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
  } = useReviewComments(review.id, showCommentsBottomSheet);

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

  // 첫 번째 책을 표시용으로 사용
  const displayBook = review.books && review.books.length > 0 ? review.books[0] : null;

  // 텍스트가 길면 접어두기 (프론트엔드와 동일한 방식)
  // 1. 줄바꿈 7개 이상이거나
  // 2. 7줄이 안되더라도 500자 이상이면 강제 더보기
  const lineCount = review.content.split('\n').length;
  const isLongContent = lineCount > 7 || review.content.length > 500;
  const shouldShowMore = isLongContent;
  const displayContent = review.content; // 전체 텍스트를 표시하되, numberOfLines로 제한

  // 별점이 있는지 확인
  const hasRating = review.userRating && review.userRating.rating > 0;
  const rating = hasRating && review.userRating ? review.userRating.rating : 0;

  // 좋아요 핸들러
  const handleLike = async () => {
    try {
      await handleLikeToggle(review.id, review.isLiked);
    } catch (error) {
      console.error('좋아요 처리 중 오류:', error);
      Alert.alert('오류', '좋아요 처리 중 문제가 발생했습니다.');
    }
  };

  // 댓글 토글 핸들러
  const handleToggleComments = () => {
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
            {review.author.profileImage ? (
              <Image
                source={{ uri: review.author.profileImage }}
                style={styles.avatarImage}
                resizeMode='cover'
              />
            ) : (
              <Text style={styles.avatarText}>{getInitials(review.author.username)}</Text>
            )}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.usernameLine}>
              <Text style={styles.reviewAuthor}>{review.author.username}</Text>
              <View
                style={[
                  styles.reviewTypeTag,
                  { backgroundColor: getTypeBackgroundColor(review.type) },
                ]}
              >
                <Text style={[styles.reviewTypeText, { color: getTypeTextColor(review.type) }]}>
                  {getTypeDisplayName(review.type)}
                </Text>
              </View>
              {hasRating && (
                <View style={styles.ratingContainer}>
                  {renderStarRating(rating)}
                  <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <Text style={styles.reviewTime}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <TouchableOpacity
        activeOpacity={shouldShowMore ? 0.7 : 1}
        onPress={shouldShowMore ? () => setShowFullContent(!showFullContent) : undefined}
        disabled={!shouldShowMore}
      >
        <Text
          style={styles.reviewContent}
          numberOfLines={showFullContent ? undefined : shouldShowMore ? 7 : undefined}
        >
          {displayContent}
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
          style={[styles.actionButton, review.isLiked && styles.actionButtonLiked]}
          onPress={handleLike}
          disabled={isLikeLoading}
        >
          <ThumbsUp
            size={16}
            color={review.isLiked ? '#059669' : '#6B7280'}
            fill={review.isLiked ? '#059669' : 'transparent'}
          />
          <Text style={[styles.actionText, review.isLiked && styles.actionTextLiked]}>
            {review.likeCount || 0}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleToggleComments}>
          <MessageCircle size={16} color='#6B7280' />
          <Text style={styles.actionText}>{review.commentCount || 0}</Text>
        </TouchableOpacity>
      </View>

      {/* Comment Bottom Sheet */}
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
        currentUserId={review.author.id} // 임시로 리뷰 작성자 ID 사용 (실제로는 현재 로그인된 사용자 ID 사용)
      />
    </View>
  );
};

// Loading Skeleton Component
const CommunityScreenSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.headerContainer}>
      <View style={styles.filterContainer}>
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScrollView}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categoryOptions.map(category => (
              <View
                key={category.id}
                style={[styles.categoryButton, { backgroundColor: category.color }]}
              >
                <Text style={styles.categoryButtonText}>{category.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <SortFilter selectedSort='recent' onSortPress={() => {}} />
      </View>
    </View>
    <View style={[styles.contentContainer, { paddingTop: 120 + 16 }]}>
      <CreateReviewCard />
      <LoadingSpinner />
      <Text style={styles.loadingText}>리뷰를 불러오는 중...</Text>
    </View>
  </View>
);

// Main Content Component
const CommunityContent = () => {
  const [selectedCategory, setSelectedCategory] = useState<ReviewType | 'all'>('all');
  const [selectedSort, setSelectedSort] = useState<SortOption>('recent');

  // Animation for filter visibility
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');
  const [headerHeight, setHeaderHeight] = useState(120);

  // API hook
  const { reviews, fetchNextPage, hasNextPage, isFetchingNextPage } = useCommunityReviews({
    category: selectedCategory,
    sort: selectedSort,
    limit: 10,
  });

  // Handlers
  const handleCategoryPress = useCallback((category: ReviewType | 'all') => {
    setSelectedCategory(category);
  }, []);

  const handleSortPress = useCallback((sort: SortOption) => {
    setSelectedSort(sort);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Header height measurement
  const onHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  }, []);

  // Scroll handler for filter visibility
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const diff = currentScrollY - lastScrollY.current;

      if (currentScrollY <= 0) {
        if (scrollDirection.current !== 'up') {
          scrollDirection.current = 'up';
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
        lastScrollY.current = currentScrollY;
        return;
      }

      if (Math.abs(diff) > 5) {
        const newDirection = diff > 0 ? 'down' : 'up';

        if (scrollDirection.current !== newDirection) {
          scrollDirection.current = newDirection;
          const targetValue = newDirection === 'down' ? -(headerHeight + 10) : 0;

          Animated.timing(headerTranslateY, {
            toValue: targetValue,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }

        lastScrollY.current = currentScrollY;
      }
    },
  });

  const renderReviewItem = useCallback(
    ({ item }: { item: ReviewResponseDto }) => <ReviewCard review={item} />,
    []
  );

  return (
    <View style={styles.container}>
      {/* Animated Header Container */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
        onLayout={onHeaderLayout}
      >
        {/* Filter Header */}
        <View style={styles.filterContainer}>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryPress={handleCategoryPress}
          />
          <SortFilter selectedSort={selectedSort} onSortPress={handleSortPress} />
        </View>
      </Animated.View>

      {/* Content List */}
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight + 16 }]}
        style={styles.flatListStyle}
        ListHeaderComponent={<CreateReviewCard />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📝</Text>
            <Text style={styles.emptyTitle}>게시물이 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              {selectedSort === 'following'
                ? '팔로우하는 사용자의 게시물이 없습니다.'
                : selectedSort === 'popular'
                  ? '인기 게시물이 없습니다.'
                  : '최신 게시물이 없습니다.'}
            </Text>
          </View>
        }
        ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
      />
    </View>
  );
};

// Main CommunityScreen Component
export const CommunityScreen = () => {
  return (
    <Suspense fallback={<CommunityScreenSkeleton />}>
      <CommunityContent />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryContainer: {
    paddingBottom: 8,
  },
  categoryScrollView: {
    paddingHorizontal: 16,
  },
  categoryScrollContent: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortContainer: {
    paddingHorizontal: 16,
  },
  sortScrollContent: {
    paddingRight: 16,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    marginRight: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSortButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeSortButtonText: {
    color: '#1D4ED8',
  },
  flatListStyle: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  createReviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  createReviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  createUserAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAvatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
  createReviewInput: {
    flex: 1,
  },
  createTextInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  createReviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
  },
  createLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 32,
    gap: 6,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F9FAFB',
  },
  categorySelectorText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  bookAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 32,
    gap: 6,
  },
  bookAddButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
