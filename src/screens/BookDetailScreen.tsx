import React, { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useAtomValue } from 'jotai';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import {
  Star,
  ChevronDown,
  BookOpen,
  Users,
  UserCheck,
  Library,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  PenLine,
} from 'lucide-react-native';

import { getBookByIsbn, BookDetails } from '../apis/book';
import { getBookReviews, likeReview, unlikeReview, deleteReview } from '../apis/review';
import { Review, BookReviewsResponse } from '../apis/review/types';
import { User } from '../apis/user/types';
import { userAtom } from '../atoms/user';
import { ReadingStatusType, StatusTexts, StatusColors } from '../constants';
import { ReadingStatusBottomSheet } from '../components/ReadingStatusBottomSheet';
import { LibrarySelectionBottomSheet } from '../components/LibrarySelectionBottomSheet';
import { CreateLibraryBottomSheet } from '../components/CreateLibraryBottomSheet';
import { ReviewBottomSheet } from '../components/ReviewBottomSheet';
import { ReviewActionBottomSheet } from '../components/ReviewActionBottomSheet';
import { CommentBottomSheet } from '../components/CommentBottomSheet';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useReviewComments, useReviewCommentCount } from '../hooks/useReviewComments';
import {
  InteractiveRatingStars,
  InteractiveRatingStarsFallback,
} from '../components/InteractiveRatingStars';
import { useBookRating } from '../hooks/useBookRating';

// Route 타입 정의
type BookDetailRouteProp = RouteProp<{ BookDetail: { isbn: string } }, 'BookDetail'>;

// 날짜 포맷팅 함수 (웹 버전과 동일)
const formatReviewDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  } catch {
    return dateStr;
  }
};

// 리뷰의 별점을 가져오는 헬퍼 함수 (웹 버전과 동일)
const getReviewRating = (review: Review): number => {
  // 새로운 API 응답 형식에서 userRating 확인
  const anyReview = review as any;

  // 1. userRating 객체에서 rating 확인
  if (
    anyReview.userRating?.rating !== undefined &&
    typeof anyReview.userRating.rating === 'number'
  ) {
    return anyReview.userRating.rating;
  }

  // 2. 기존 방식: review 객체에 직접 rating 속성이 있는지 확인
  if (anyReview.rating !== undefined && typeof anyReview.rating === 'number') {
    return anyReview.rating;
  }

  // 3. book 객체에 rating이 있는지 확인
  if (anyReview.book?.rating && typeof anyReview.book.rating === 'number') {
    return anyReview.book.rating;
  }

  return 0;
};

// 출간일 포맷팅 함수
const formatPublishDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
};

// 카테고리 태그 컴포넌트
const CategoryTag: React.FC<{ category: string; isSubcategory?: boolean }> = ({
  category,
  isSubcategory = false,
}) => (
  <View style={[styles.categoryTag, isSubcategory && styles.subcategoryTag]}>
    <Text style={[styles.categoryText, isSubcategory && styles.subcategoryText]}>{category}</Text>
  </View>
);

// 읽기 상태 버튼 컴포넌트
const ReadingStatusButton: React.FC<{
  status: ReadingStatusType | null;
  onPress: () => void;
}> = ({ status, onPress }) => {
  const displayText = status ? StatusTexts[status] : '읽기 상태 설정';
  const colors = status ? StatusColors[status] : { background: '#F9FAFB', text: '#374151' };

  const getStatusIcon = () => {
    const iconColor = status ? colors.text : '#6B7280';
    switch (status) {
      case ReadingStatusType.WANT_TO_READ:
        return <BookOpen size={18} color={iconColor} />;
      case ReadingStatusType.READING:
        return <BookOpen size={18} color={iconColor} />;
      case ReadingStatusType.READ:
        return <Star size={18} color={iconColor} fill={iconColor} />;
      default:
        return <BookOpen size={18} color={iconColor} />;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        status && { backgroundColor: colors.background, borderColor: colors.background },
      ]}
      onPress={onPress}
    >
      {getStatusIcon()}
      <Text style={[styles.buttonText, { color: status ? colors.text : '#374151' }]}>
        {displayText}
      </Text>
      <ChevronDown size={14} color={status ? colors.text : '#6B7280'} />
    </TouchableOpacity>
  );
};

// 서재에 담기 버튼 컴포넌트
const LibraryButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={[styles.actionButton, styles.libraryButton]} onPress={onPress}>
    <Library size={18} color='#374151' />
    <Text style={styles.buttonText}>서재에 담기</Text>
    <ChevronDown size={14} color='#6B7280' />
  </TouchableOpacity>
);

// 책 정보 컴포넌트
const BookInfo: React.FC<{ book: BookDetails }> = ({ book }) => {
  const [expanded, setExpanded] = useState(false);

  const bookDescription = book.description || '책 설명이 없습니다.';
  const authorDescription = book.authorInfo || '';

  const shouldShowExpand = bookDescription.length > 200;
  const displayDescription = expanded ? bookDescription : bookDescription.slice(0, 200);

  return (
    <View style={styles.bookInfo}>
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>책 소개</Text>
        <Text style={styles.infoText}>
          {displayDescription}
          {!expanded && shouldShowExpand && '...'}
        </Text>
        {shouldShowExpand && (
          <TouchableOpacity
            style={styles.expandButtonContainer}
            onPress={() => setExpanded(!expanded)}
          >
            <Text style={styles.expandButton}>{expanded ? '접기' : '더 보기'}</Text>
            <ChevronDown
              size={12}
              color='#6B7280'
              style={[styles.expandIcon, expanded && styles.expandIconRotated]}
            />
          </TouchableOpacity>
        )}
      </View>

      {authorDescription && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>저자 소개</Text>
          <Text style={styles.infoText}>{authorDescription}</Text>
        </View>
      )}
    </View>
  );
};

// 탭 섹션 컴포넌트
const TabSection: React.FC<{ isbn: string }> = ({ isbn }) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'libraries' | 'videos'>('reviews');
  const [reviewCount, setReviewCount] = useState(0);

  return (
    <View style={styles.tabSection}>
      {/* 탭 헤더 */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'reviews' && styles.activeTabItem]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            리뷰 ({reviewCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'libraries' && styles.activeTabItem]}
          onPress={() => setActiveTab('libraries')}
        >
          <Text style={[styles.tabText, activeTab === 'libraries' && styles.activeTabText]}>
            이 책이 등록된 서재 (0)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'videos' && styles.activeTabItem]}
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>
            관련 영상
          </Text>
        </TouchableOpacity>
      </View>

      {/* 탭 컨텐츠 */}
      <View style={styles.tabContent}>
        {activeTab === 'reviews' && (
          <BookReviewsList isbn={isbn} onReviewCountChange={setReviewCount} />
        )}
        {activeTab === 'libraries' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>등록된 서재가 없습니다.</Text>
          </View>
        )}
        {activeTab === 'videos' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>관련 영상이 없습니다.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// BookDetailContent props 타입 정의
interface BookDetailContentProps {
  isbn: string;
  onReadingStatusPress: () => void;
  onLibraryPress: () => void;
  onReviewPress: () => void;
}

// 메인 책 상세 컴포넌트
const BookDetailContent: React.FC<BookDetailContentProps> = ({
  isbn,
  onReadingStatusPress,
  onLibraryPress,
  onReviewPress,
}) => {
  const navigation = useNavigation();

  const { data: book } = useSuspenseQuery({
    queryKey: ['book-detail', isbn],
    queryFn: () => getBookByIsbn(isbn),
  });

  // Set header title when book data is loaded
  React.useEffect(() => {
    if (book?.title) {
      navigation.setOptions({
        headerTitle: book.title,
      });
    }
  }, [book?.title, navigation]);

  const handleAladinPress = () => {
    const url = `https://www.aladin.co.kr/shop/wproduct.aspx?isbn=${isbn}`;
    Linking.openURL(url).catch(() => {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '알라딘 페이지를 열 수 없습니다.',
      });
    });
  };

  if (!book) return null;

  const displayRating = typeof book.rating === 'string' ? book.rating : book.rating.toFixed(1);
  const ratingsCount = book.totalRatings || 0;

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior='automatic'
      bounces={true}
      alwaysBounceVertical={true}
      scrollEventThrottle={16}
      nestedScrollEnabled={true}
    >
      <View style={styles.container}>
        {/* 책 표지 */}
        <View style={styles.coverShadowContainer}>
          <TouchableOpacity onPress={handleAladinPress} style={styles.coverContainer}>
            <Image source={{ uri: book.coverImage }} style={styles.coverImage} resizeMode='cover' />
          </TouchableOpacity>
        </View>

        {/* 책 정보 */}
        <View style={styles.bookInfoContainer}>
          <TouchableOpacity onPress={handleAladinPress}>
            <Text style={styles.title}>{book.title}</Text>
          </TouchableOpacity>

          {/* 카테고리 태그들 */}
          <View style={styles.tagsContainer}>
            {book.category && <CategoryTag category={book.category.name} />}
            {book.subcategory && <CategoryTag category={book.subcategory.name} isSubcategory />}
          </View>

          <Text style={styles.author}>{book.author}</Text>
          {book.publisher && <Text style={styles.publisher}>{book.publisher}</Text>}
          {book.publishDate && (
            <Text style={styles.publishDate}>출간일: {formatPublishDate(book.publishDate)}</Text>
          )}
        </View>

        {/* 평점 섹션 */}
        <View style={styles.ratingSection}>
          <View style={styles.ratingHeader}>
            <View style={styles.ratingInfo}>
              <Star size={20} color='#FCD34D' fill='#FCD34D' />
              <Text style={styles.ratingScore}>{displayRating}</Text>
              <Text style={styles.ratingCount}>({ratingsCount}명)</Text>
            </View>
          </View>

          <View style={styles.ratingActions}>
            <Suspense fallback={<InteractiveRatingStarsFallback size={16} />}>
              <InteractiveRatingStars isbn={isbn} size={16} />
            </Suspense>
            <TouchableOpacity style={styles.reviewButton} onPress={onReviewPress}>
              <PenLine size={12} color='#374151' />
              <Text style={styles.reviewButtonText}>리뷰 쓰기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 읽기 통계 */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, styles.purpleBackground]}>
                <BookOpen size={14} color='white' />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>읽고 싶어요</Text>
                <Text style={styles.statNumber}>
                  {book.readingStats?.readingStatusCounts.WANT_TO_READ || 0}
                </Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, styles.blueBackground]}>
                <Users size={14} color='white' />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>읽는 중</Text>
                <Text style={styles.statNumber}>
                  {book.readingStats?.readingStatusCounts.READING || 0}
                </Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, styles.greenBackground]}>
                <UserCheck size={14} color='white' />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>읽었어요</Text>
                <Text style={styles.statNumber}>
                  {book.readingStats?.readingStatusCounts.READ || 1}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonsRow}>
            <ReadingStatusButton
              status={book.userReadingStatus as ReadingStatusType | null}
              onPress={onReadingStatusPress}
            />
            <LibraryButton onPress={onLibraryPress} />
          </View>
        </View>

        {/* 책 상세 정보 */}
        <BookInfo book={book} />

        <Text style={styles.dataProvider}>정보제공: 알라딘</Text>

        {/* 탭 섹션 */}
        <TabSection isbn={isbn} />
      </View>
    </ScrollView>
  );
};

// 로딩 스켈레톤
const BookDetailSkeleton: React.FC = () => (
  <ScrollView
    style={styles.scrollView}
    showsVerticalScrollIndicator={false}
    bounces={true}
    alwaysBounceVertical={true}
    scrollEventThrottle={16}
    nestedScrollEnabled={true}
  >
    <View style={styles.container}>
      {/* 책 표지 스켈레톤 */}
      <View style={styles.coverShadowContainer}>
        <View style={[styles.coverContainer, styles.skeleton]} />
      </View>

      {/* 책 정보 스켈레톤 */}
      <View style={styles.bookInfoContainer}>
        <View style={[styles.skeletonText, { width: '80%', height: 20 }]} />
        <View style={styles.tagsContainer}>
          <View style={[styles.skeletonText, { width: 50, height: 16, borderRadius: 12 }]} />
          <View style={[styles.skeletonText, { width: 40, height: 16, borderRadius: 12 }]} />
        </View>
        <View style={[styles.skeletonText, { width: '60%', height: 14, marginTop: 8 }]} />
        <View style={[styles.skeletonText, { width: '50%', height: 14, marginTop: 4 }]} />
        <View style={[styles.skeletonText, { width: '70%', height: 14, marginTop: 4 }]} />
      </View>

      {/* 평점 섹션 스켈레톤 */}
      <View style={[styles.ratingSection, styles.skeleton, { height: 100 }]} />

      {/* 읽기 통계 스켈레톤 */}
      <View style={[styles.statsSection, styles.skeleton, { height: 80 }]} />

      {/* 액션 버튼 스켈레톤 */}
      <View style={styles.actionButtonsContainer}>
        <View style={styles.actionButtonsRow}>
          <View style={[styles.actionButton, styles.skeleton]} />
          <View style={[styles.actionButton, styles.skeleton]} />
        </View>
      </View>

      {/* 책 정보 스켈레톤 */}
      <View style={styles.bookInfo}>
        <View style={styles.infoSection}>
          <View style={[styles.skeletonText, { width: 60, height: 14 }]} />
          <View style={[styles.skeletonText, { width: '100%', height: 14, marginTop: 4 }]} />
          <View style={[styles.skeletonText, { width: '100%', height: 14, marginTop: 2 }]} />
          <View style={[styles.skeletonText, { width: '80%', height: 14, marginTop: 2 }]} />
        </View>
      </View>
    </View>
  </ScrollView>
);

// 리뷰 텍스트 컴포넌트 (웹 버전과 완전히 동일)
const ReviewText: React.FC<{
  content: string;
  reviewId: number;
  expandedReviews: Record<number, boolean>;
  setExpandedReviews: (updater: (prev: Record<number, boolean>) => Record<number, boolean>) => void;
}> = ({ content, reviewId, expandedReviews, setExpandedReviews }) => {
  // 텍스트가 길면 접어두기 (7줄 기준 - 웹 버전과 동일)
  const lineCount = content.split('\n').length;
  const isLongContent = lineCount > 7 || content.length > 500;
  const expanded = expandedReviews[reviewId] || false;

  const handleExpand = () => {
    if (!expanded) {
      setExpandedReviews(prev => ({
        ...prev,
        [reviewId]: true,
      }));
    }
  };

  const shouldEnableExpand = isLongContent && !expanded;

  return (
    <TouchableOpacity
      style={{ position: 'relative' }}
      onPress={shouldEnableExpand ? handleExpand : undefined}
      activeOpacity={shouldEnableExpand ? 0.7 : 1}
      disabled={!shouldEnableExpand}
    >
      <Text
        style={[
          styles.reviewContentText,
          !expanded && isLongContent && styles.reviewContentClamped,
        ]}
        numberOfLines={!expanded && isLongContent ? 7 : undefined}
      >
        {content}
      </Text>
      {shouldEnableExpand && (
        <TouchableOpacity onPress={handleExpand} style={styles.expandButton}>
          <Text style={styles.expandButtonText}>더 보기</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// 리뷰 아이템 컴포넌트 (React Hook 규칙 준수를 위해 분리)
const ReviewItem: React.FC<{
  review: Review;
  index: number;
  totalCount: number;
  expandedReviews: Record<number, boolean>;
  setExpandedReviews: (updater: (prev: Record<number, boolean>) => Record<number, boolean>) => void;
  likingReviewId: number | null;
  currentUser: User | null;
  handleLike: (reviewId: number, isLiked: boolean) => void;
  handleCommentsToggle: (review: Review) => void;
  handleUserPress: (userId: number) => void;
  handleReviewActionPress: (review: Review) => void;
  isMyReview: (review: Review) => boolean;
}> = ({
  review,
  index,
  totalCount,
  expandedReviews,
  setExpandedReviews,
  likingReviewId,
  currentUser: _currentUser,
  handleLike,
  handleCommentsToggle,
  handleUserPress,
  handleReviewActionPress,
  isMyReview,
}) => {
  // 리뷰 별점 확인
  const rating = getReviewRating(review);

  // 실시간 댓글 개수 가져오기 (src_frontend와 동일한 방식)
  const realTimeCommentCount = useReviewCommentCount(review.id);

  return (
    <View
      key={review.id}
      style={[
        index === 0 ? styles.firstReviewItem : styles.reviewItem,
        index !== totalCount - 1 && styles.reviewItemBorder,
      ]}
    >
      <View style={styles.reviewItemContent}>
        {/* 아바타 */}
        <TouchableOpacity
          style={styles.reviewAvatar}
          onPress={() => handleUserPress(review.author.id)}
        >
          {review.author.profileImage ? (
            <Image source={{ uri: review.author.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{review.author.username.charAt(0)}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* 리뷰 내용 영역 */}
        <View style={styles.reviewContent}>
          {/* 헤더 영역 */}
          <View style={styles.reviewHeaderRow}>
            <View style={styles.reviewHeaderLeft}>
              {/* 사용자명과 날짜를 같은 줄에 배치 (웹 버전과 동일) */}
              <View style={styles.userInfoRow}>
                <TouchableOpacity onPress={() => handleUserPress(review.author.id)}>
                  <Text style={styles.reviewAuthorName}>{review.author.username}</Text>
                </TouchableOpacity>
                <Text style={styles.reviewDate}>{formatReviewDate(review.createdAt)}</Text>
              </View>

              {/* 별점 표시 (웹 버전과 동일하게 별도 줄) */}
              {rating > 0 && (
                <View style={styles.reviewRatingRow}>
                  <View style={styles.starsContainer}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        color={i < Math.floor(rating) ? '#FCD34D' : '#E5E7EB'}
                        fill={i < Math.floor(rating) ? '#FCD34D' : '#E5E7EB'}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewRatingText}>({rating})</Text>
                </View>
              )}
            </View>

            {/* 내 리뷰일 경우 액션 버튼 */}
            {isMyReview(review) && (
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => handleReviewActionPress(review)}
              >
                <MoreHorizontal size={16} color='#6B7280' />
              </TouchableOpacity>
            )}
          </View>

          {/* 리뷰 텍스트 (웹 버전과 동일한 간격) */}
          <View style={styles.reviewTextContainer}>
            <ReviewText
              content={review.content}
              reviewId={review.id}
              expandedReviews={expandedReviews}
              setExpandedReviews={setExpandedReviews}
            />
          </View>

          {/* 이미지가 있는 경우 표시 */}
          {review.images && review.images.length > 0 && (
            <View style={styles.reviewImagesContainer}>
              {review.images.map((image: any) => (
                <View key={image.id} style={styles.reviewImageWrapper}>
                  <Image
                    source={{ uri: image.url }}
                    style={styles.reviewImage}
                    resizeMode='cover'
                  />
                </View>
              ))}
            </View>
          )}

          {/* 액션 버튼들 (웹 버전과 동일한 간격) */}
          <View style={styles.reviewActionsContainer}>
            <TouchableOpacity
              style={[styles.reviewActionButton, review.isLiked && styles.reviewActionButtonLiked]}
              onPress={() => handleLike(review.id, review.isLiked || false)}
              disabled={likingReviewId === review.id}
            >
              <ThumbsUp
                size={14}
                color={review.isLiked ? '#059669' : '#6B7280'}
                fill={review.isLiked ? '#059669' : 'transparent'}
              />
              <Text
                style={[styles.reviewActionText, review.isLiked && styles.reviewActionTextLiked]}
              >
                {review.likesCount || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.reviewActionButton}
              onPress={() => handleCommentsToggle(review)}
            >
              <MessageSquare size={14} color='#6B7280' />
              <Text style={styles.reviewActionText}>
                {realTimeCommentCount > 0 ? realTimeCommentCount : review.commentsCount || 0}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const BookReviewsList: React.FC<{
  isbn: string;
  onReviewCountChange?: (count: number) => void;
}> = ({ isbn, onReviewCountChange }) => {
  const currentUser = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  // 확장된 리뷰 상태 관리 (더보기 기능)
  const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

  // 좋아요 로딩 상태 추적
  const [likingReviewId, setLikingReviewId] = useState<number | null>(null);

  // 리뷰 액션 BottomSheet 관련 상태
  const reviewActionBottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // 댓글 BottomSheet 관련 상태
  const [commentBottomSheetVisible, setCommentBottomSheetVisible] = useState(false);
  const [selectedReviewForComments, setSelectedReviewForComments] = useState<Review | null>(null);

  // useReviewComments 훅 사용 (ReviewCard와 동일한 방식)
  const {
    comments,
    handleAddComment,
    handleDeleteComment,
    handleUpdateComment,
    handleLikeComment,
    isLoading: isCommentLoading,
    refetch: refetchComments,
  } = useReviewComments(
    selectedReviewForComments?.id || 0,
    commentBottomSheetVisible && !!selectedReviewForComments
  );

  // 책 정보 가져오기 (bookId 확인용)
  const { data: book } = useSuspenseQuery({
    queryKey: ['book-detail', isbn],
    queryFn: () => getBookByIsbn(isbn),
  });

  const bookId = book?.id || 0;
  const limit = 5; // 한 페이지에 보여줄 리뷰 수
  const sort = 'likes'; // 웹 버전과 동일하게 고정

  // 리뷰 데이터 가져오기 (웹 버전과 정확히 동일한 로직)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['book-reviews', bookId, isbn, sort], // 웹 버전과 동일한 쿼리 키
    queryFn: async ({ pageParam }) => {
      if (!bookId && !isbn) {
        return {
          data: [],
          meta: { total: 0, page: 1, limit, totalPages: 0, sort },
        } as BookReviewsResponse;
      }

      const page = pageParam as number;
      // bookId가 -1 또는 0이고, isbn이 있는 경우 isbn을 함께 전달
      const shouldUseIsbn = (bookId <= 0 || bookId === -1) && isbn;

      const reviewsData = await getBookReviews(
        bookId,
        page,
        limit,
        sort,
        shouldUseIsbn ? isbn : undefined
      );

      return reviewsData;
    },
    getNextPageParam: (lastPage: BookReviewsResponse) => {
      const { meta } = lastPage;
      // 다음 페이지가 있는지 확인, 없으면 undefined 반환 (hasNextPage가 false가 됨)
      return meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
    placeholderData: keepPreviousData,
    initialPageParam: 1,
  });

  // 모든 페이지의 리뷰를 하나의 배열로 병합 (웹 버전과 동일)
  const reviews = data?.pages.flatMap(page => (Array.isArray(page.data) ? page.data : [])) || [];

  // 메타데이터는 마지막 페이지의 것을 사용 (웹 버전과 동일)
  const meta = data?.pages[data.pages.length - 1]?.meta || null;

  // 리뷰 카운트를 부모에게 전달
  useEffect(() => {
    if (meta?.total !== undefined && onReviewCountChange) {
      onReviewCountChange(meta.total);
    }
  }, [meta?.total, onReviewCountChange]);

  // 리뷰 좋아요 mutation (웹 버전과 동일한 낙관적 업데이트)
  const likeMutation = useMutation({
    mutationFn: async ({ reviewId, isLiked }: { reviewId: number; isLiked: boolean }) => {
      if (isLiked) {
        return await unlikeReview(reviewId);
      } else {
        return await likeReview(reviewId);
      }
    },
    onMutate: async ({ reviewId, isLiked }) => {
      // 낙관적 업데이트 - 무한 쿼리 구조에 맞게 수정
      await queryClient.cancelQueries({
        queryKey: ['book-reviews', bookId, isbn, sort],
      });

      queryClient.setQueryData(['book-reviews', bookId, isbn, sort], (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            if (!page || !page.data) return page;

            return {
              ...page,
              data: page.data.map((review: Review) =>
                review.id === reviewId
                  ? {
                      ...review,
                      isLiked: !isLiked,
                      likesCount: isLiked
                        ? Math.max(0, (review.likesCount || 0) - 1)
                        : (review.likesCount || 0) + 1,
                    }
                  : review
              ),
            };
          }),
        };
      });

      return { queryKey: ['book-reviews', bookId, isbn, sort] };
    },
    onError: (_, __, context) => {
      // 에러 발생시 쿼리 무효화하여 데이터 재조회
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });

  // 리뷰 삭제 mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-reviews', bookId, isbn, sort] });
      Toast.show({
        type: 'success',
        text1: '성공',
        text2: '리뷰가 삭제되었습니다.',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '리뷰 삭제 중 오류가 발생했습니다.',
      });
    },
  });

  // 좋아요 핸들러 (웹 버전과 동일)
  const handleLike = useCallback(
    (reviewId: number, isLiked: boolean) => {
      if (!currentUser) {
        Toast.show({
          type: 'info',
          text1: '로그인 필요',
          text2: '로그인 후 이용해주세요.',
        });
        return;
      }

      setLikingReviewId(reviewId);
      likeMutation.mutate({ reviewId, isLiked });

      setTimeout(() => {
        setLikingReviewId(null);
      }, 500);
    },
    [currentUser, likeMutation]
  );

  // 댓글 토글 핸들러
  const handleCommentsToggle = useCallback(
    (review: Review) => {
      setSelectedReviewForComments(review);
      setCommentBottomSheetVisible(true);
      // 댓글이 처음 열릴 때 데이터 새로고침
      if (!commentBottomSheetVisible) {
        setTimeout(() => refetchComments(), 100);
      }
    },
    [commentBottomSheetVisible, refetchComments]
  );

  // 댓글 제출 핸들러 (useReviewComments 훅의 함수 사용)
  const handleSubmitComment = useCallback(
    async (comment: string) => {
      console.log('🚀 handleSubmitComment called!');
      if (!comment.trim() || !selectedReviewForComments) return;

      try {
        console.log('🚀 handleSubmitComment called');
        console.log('📝 comment:', comment);
        console.log('📝 selectedReviewForComments:', selectedReviewForComments);
        await handleAddComment(comment);
      } catch (error) {
        console.error('댓글 작성 중 오류:', error);
        Toast.show({
          type: 'error',
          text1: '오류',
          text2: '댓글 작성 중 문제가 발생했습니다.',
        });
      }
    },
    [selectedReviewForComments, handleAddComment]
  );

  // 댓글 삭제 핸들러 (Alert 추가)
  const handleDeleteCommentWithAlert = useCallback(
    async (commentId: number) => {
      try {
        await handleDeleteComment(commentId);
      } catch (error) {
        console.error('댓글 삭제 중 오류:', error);
        Toast.show({
          type: 'error',
          text1: '오류',
          text2: '댓글 삭제 중 문제가 발생했습니다.',
        });
      }
    },
    [handleDeleteComment]
  );

  // 댓글 좋아요 핸들러 (Alert 추가)
  const handleLikeCommentWithAlert = useCallback(
    async (commentId: number, isLiked: boolean) => {
      try {
        await handleLikeComment(commentId, isLiked);
      } catch (error) {
        console.error('댓글 좋아요 처리 중 오류:', error);
        Toast.show({
          type: 'error',
          text1: '오류',
          text2: '댓글 좋아요 처리 중 문제가 발생했습니다.',
        });
      }
    },
    [handleLikeComment]
  );

  // 사용자 프로필로 이동
  const handleUserPress = useCallback(
    (userId: number) => {
      (navigation as any).navigate('Profile', { userId });
    },
    [navigation]
  );

  // 내 리뷰인지 확인
  const isMyReview = useCallback(
    (review: Review) => {
      return currentUser?.id === review.author.id;
    },
    [currentUser]
  );

  // 리뷰 액션 메뉴 열기
  const handleReviewActionPress = useCallback((review: Review) => {
    setSelectedReview(review);
    reviewActionBottomSheetRef.current?.present();
  }, []);

  // 리뷰 수정 핸들러
  const handleEditReview = useCallback(() => {
    if (selectedReview) {
      // TODO: 리뷰 수정 기능 구현
      console.log('리뷰 수정:', selectedReview.id);
      Toast.show({
        type: 'info',
        text1: '알림',
        text2: '리뷰 수정 기능은 준비 중입니다.',
      });
    }
  }, [selectedReview]);

  // 리뷰 삭제 핸들러
  const handleDeleteReview = useCallback(() => {
    if (selectedReview) {
      Alert.alert('리뷰 삭제', '이 리뷰를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.', [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => deleteReviewMutation.mutate(selectedReview.id),
        },
      ]);
    }
  }, [selectedReview, deleteReviewMutation]);

  // 더보기 핸들러
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 로딩 중일 때 (LoadingSpinner 사용)
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  // 리뷰가 없는 경우
  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyReviewsContainer}>
        <Text style={styles.emptyReviewsText}>아직 리뷰가 없습니다</Text>
        <TouchableOpacity style={styles.firstReviewButton}>
          <Text style={styles.firstReviewButtonText}>첫 리뷰를 작성해보세요</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.reviewsContainer}>
      <View>
        {reviews.map((review: Review, index: number) => (
          <ReviewItem
            key={review.id}
            review={review}
            index={index}
            totalCount={reviews.length}
            expandedReviews={expandedReviews}
            setExpandedReviews={setExpandedReviews}
            likingReviewId={likingReviewId}
            currentUser={currentUser}
            handleLike={handleLike}
            handleCommentsToggle={handleCommentsToggle}
            handleUserPress={handleUserPress}
            handleReviewActionPress={handleReviewActionPress}
            isMyReview={isMyReview}
          />
        ))}
      </View>

      {/* 리뷰 더보기 버튼 */}
      {hasNextPage && (
        <View style={styles.loadMoreButtonContainer}>
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <View style={styles.loadMoreLoadingContainer}>
                <LoadingSpinner />
                <Text style={styles.loadMoreLoadingText}>로딩 중...</Text>
              </View>
            ) : (
              <Text style={styles.loadMoreButtonText}>리뷰 더 보기</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* 리뷰 액션 BottomSheet */}
      <ReviewActionBottomSheet
        bottomSheetRef={reviewActionBottomSheetRef}
        onEdit={handleEditReview}
        onDelete={handleDeleteReview}
      />

      {/* 댓글 BottomSheet */}
      <CommentBottomSheet
        isVisible={commentBottomSheetVisible}
        onClose={() => setCommentBottomSheetVisible(false)}
        comments={comments}
        onSubmitComment={handleSubmitComment}
        onDeleteComment={handleDeleteCommentWithAlert}
        onUpdateComment={handleUpdateComment}
        onLikeComment={handleLikeCommentWithAlert}
        isLoading={isCommentLoading}
        currentUserId={currentUser?.id}
      />
    </View>
  );
};

// 메인 화면 컴포넌트
export const BookDetailScreen: React.FC = () => {
  const route = useRoute<BookDetailRouteProp>();
  const { isbn } = route.params;

  // useBookRating 훅 사용
  const { handleSubmitRating } = useBookRating(isbn);

  // 바텀시트 상태들
  const [readingStatusBottomSheetVisible, setReadingStatusBottomSheetVisible] = useState(false);
  const [librarySelectionBottomSheetVisible, setLibrarySelectionBottomSheetVisible] =
    useState(false);
  const [createLibraryBottomSheetVisible, setCreateLibraryBottomSheetVisible] = useState(false);
  const [reviewBottomSheetVisible, setReviewBottomSheetVisible] = useState(false);

  const handleReadingStatusPress = () => {
    setReadingStatusBottomSheetVisible(true);
  };

  const handleReadingStatusSelect = (status: ReadingStatusType | null) => {
    // TODO: 실제 API 호출로 읽기 상태 업데이트
    console.log('Reading status selected:', status);
    setReadingStatusBottomSheetVisible(false);
  };

  const handleLibraryPress = () => {
    setLibrarySelectionBottomSheetVisible(true);
  };

  const handleLibrarySelect = async (libraryId: number) => {
    try {
      // TODO: 실제 API 호출로 서재에 책 추가
      console.log('Book added to library:', libraryId);
      Toast.show({
        type: 'success',
        text1: '성공',
        text2: '서재에 책이 추가되었습니다.',
      });
      setLibrarySelectionBottomSheetVisible(false);
    } catch {
      Toast.show({
        type: 'error',
        text1: '오류',
        text2: '서재에 책을 추가하는데 실패했습니다.',
      });
    }
  };

  const handleCreateNewLibrary = () => {
    setLibrarySelectionBottomSheetVisible(false);
    setCreateLibraryBottomSheetVisible(true);
  };

  const handleLibraryCreated = (libraryId: number) => {
    setCreateLibraryBottomSheetVisible(false);
    // 새로 만든 서재에 바로 책 추가
    handleLibrarySelect(libraryId);
  };

  const handleReviewPress = () => {
    setReviewBottomSheetVisible(true);
  };

  const handleReviewSubmit = (
    rating: number,
    content: string,
    _readingStatus?: ReadingStatusType | null
  ) => {
    // useBookRating 훅의 handleSubmitRating 사용
    handleSubmitRating(rating, content);
    setReviewBottomSheetVisible(false);
  };

  return (
    <>
      <View style={styles.safeArea}>
        <Suspense fallback={<BookDetailSkeleton />}>
          <BookDetailContent
            isbn={isbn}
            onReadingStatusPress={handleReadingStatusPress}
            onLibraryPress={handleLibraryPress}
            onReviewPress={handleReviewPress}
          />
        </Suspense>
      </View>

      {/* 읽기 상태 선택 바텀시트 */}
      <ReadingStatusBottomSheet
        isVisible={readingStatusBottomSheetVisible}
        onClose={() => setReadingStatusBottomSheetVisible(false)}
        currentStatus={null} // TODO: 실제 책 데이터에서 가져와야 함
        onStatusSelect={handleReadingStatusSelect}
      />

      {/* 서재 선택 바텀시트 */}
      <LibrarySelectionBottomSheet
        isVisible={librarySelectionBottomSheetVisible}
        onClose={() => setLibrarySelectionBottomSheetVisible(false)}
        onLibrarySelect={handleLibrarySelect}
        onCreateNewLibrary={handleCreateNewLibrary}
      />

      {/* 새 서재 만들기 바텀시트 */}
      <CreateLibraryBottomSheet
        isVisible={createLibraryBottomSheetVisible}
        onClose={() => setCreateLibraryBottomSheetVisible(false)}
        onSuccess={handleLibraryCreated}
      />

      {/* 리뷰 작성 바텀시트 */}
      <ReviewBottomSheet
        isVisible={reviewBottomSheetVisible}
        onClose={() => setReviewBottomSheetVisible(false)}
        bookTitle='' // TODO: 실제 책 제목으로 변경해야 함
        onSubmit={handleReviewSubmit}
        userReadingStatus={null} // TODO: 실제 읽기 상태로 변경해야 함
      />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12, // 웹 버전의 p-3 (12px)에 맞춤
    paddingBottom: 20,
    paddingTop: 12, // 헤더 여백 최소화
    gap: 24, // 웹 버전의 space-y-6 (24px)에 맞춤
  },
  coverShadowContainer: {
    width: 240,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  bookInfoContainer: {
    alignItems: 'center',
    gap: 8, // 웹 버전의 space-y-2 (8px)에 맞춤
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20, // 웹 버전에 맞게 크기 조정
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 28, // 웹 버전에 맞게 조정
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  subcategoryTag: {
    backgroundColor: '#4B5563',
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  subcategoryText: {
    color: 'white',
  },
  author: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  publisher: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  publishDate: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  ratingSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12, // 웹 버전의 rounded-xl (12px)에 맞춤
    padding: 16,
    minHeight: 96, // 웹 버전의 h-24 (96px)에 맞춤
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingScore: {
    fontSize: 24,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  reviewButtonText: {
    fontSize: 12,
    color: '#374151',
  },
  statsSection: {
    backgroundColor: '#F9FAFB', // 웹 버전의 bg-gray-50
    borderRadius: 12, // 웹 버전의 rounded-xl (12px)에 맞춤
    padding: 16, // 웹 버전의 p-4 (16px)
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 웹 버전의 grid grid-cols-3 gap-4에 맞춤
    gap: 16,
  },
  statItem: {
    flex: 1, // 3개 아이템이 균등하게 배치되도록
    flexDirection: 'row', // 웹 버전의 flex items-center gap-2에 맞춤
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 28, // 웹 버전의 h-7 w-7 (28px)에 맞춤
    height: 28,
    borderRadius: 14, // rounded-full
    justifyContent: 'center',
    alignItems: 'center',
  },
  purpleBackground: {
    backgroundColor: '#8B5CF6', // bg-purple-500
  },
  blueBackground: {
    backgroundColor: '#3B82F6', // bg-blue-500
  },
  greenBackground: {
    backgroundColor: '#10B981', // bg-green-500
  },
  statTextContainer: {
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: 12, // 웹 버전의 text-xs
    color: '#6B7280', // text-gray-500
  },
  statNumber: {
    fontSize: 14, // 웹 버전의 text-sm
    fontWeight: '500', // font-medium
    color: '#111827',
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    gap: 12, // 웹 버전의 gap-3 (12px)에 맞춤
    paddingHorizontal: 0,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8, // 웹 버전의 gap-2 (8px)에 맞춤
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, // 웹 버전의 h-10 (40px)에 맞춤
    paddingHorizontal: 16,
    borderRadius: 9999, // 웹 버전의 rounded-full에 맞춤
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 8,
    minHeight: 40, // 웹 버전의 h-10 (40px)에 맞춤
    // shadow 제거됨
  },
  libraryButton: {
    backgroundColor: '#F9FAFB',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  bookInfo: {
    gap: 4, // 웹 버전의 space-y-1 (4px)에 맞춤
  },
  infoSection: {
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  expandButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  expandButton: {
    marginTop: 8,
  },
  expandIcon: {
    marginLeft: 4,
  },
  expandIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dataProvider: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8, // 웹 버전의 mt-2 (8px)에 맞춤
  },
  tabSection: {
    marginTop: 32,
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#111827',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600',
  },
  tabContent: {
    marginTop: 16,
    minHeight: 200,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  skeleton: {
    backgroundColor: '#F3F4F6',
  },
  skeletonText: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  reviewContentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  reviewContentClamped: {
    // Add any necessary styles for clamped text
  },
  expandButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyReviewsContainer: {
    paddingVertical: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyReviewsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  firstReviewButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  firstReviewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  reviewsContainer: {
    flex: 1,
  },
  firstReviewItem: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  reviewItem: {
    paddingVertical: 24,
  },
  reviewItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: 2,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewHeaderLeft: {
    flex: 1,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reviewRatingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  moreButton: {
    padding: 8,
    marginLeft: 4,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  reviewTextContainer: {
    marginTop: 8,
  },
  reviewImagesContainer: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  reviewImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  reviewImage: {
    width: '100%',
    height: '100%',
  },
  reviewActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 4,
  },
  reviewActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  reviewActionButtonLiked: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  reviewActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  reviewActionTextLiked: {
    color: '#059669',
  },
  loadMoreButtonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  loadMoreLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadMoreLoadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
});
