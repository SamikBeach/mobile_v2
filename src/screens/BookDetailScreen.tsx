import React, { Suspense, useState } from 'react';
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
import { useSuspenseQuery } from '@tanstack/react-query';
import { useRoute, RouteProp } from '@react-navigation/native';

import { Star, Edit3, ChevronDown, X, BookOpen, Users, UserCheck } from 'lucide-react-native';

import { getBookByIsbn, BookDetails } from '../apis/book';
import { ReadingStatusType, StatusTexts, StatusColors } from '../constants';
import { ReadingStatusModal } from '../components/ReadingStatusModal';

// Route 타입 정의
type BookDetailRouteProp = RouteProp<{ BookDetail: { isbn: string } }, 'BookDetail'>;

// 출간일 포맷팅 함수
const formatPublishDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
};

// 별점 컴포넌트
const RatingStars: React.FC<{ rating: number; size?: number; interactive?: boolean }> = ({
  rating,
  size = 16,
  interactive = false,
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} size={size} color='#FCD34D' fill='#FCD34D' />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<Star key={i} size={size} color='#FCD34D' fill='#FCD34D' />);
    } else {
      stars.push(
        <Star key={i} size={size} color='#D1D5DB' fill={interactive ? 'transparent' : '#D1D5DB'} />
      );
    }
  }

  return <View style={styles.starsContainer}>{stars}</View>;
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
    <BookOpen size={18} color='#374151' />
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
const TabSection: React.FC<{ isbn: string }> = ({ isbn: _isbn }) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'libraries' | 'videos'>('reviews');

  return (
    <View style={styles.tabSection}>
      {/* 탭 헤더 */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'reviews' && styles.activeTabItem]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
            리뷰 (3)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'libraries' && styles.activeTabItem]}
          onPress={() => setActiveTab('libraries')}
        >
          <Text style={[styles.tabText, activeTab === 'libraries' && styles.activeTabText]}>
            이 책이 등록된 서재 (1)
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>리뷰가 없습니다.</Text>
          </View>
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

// 메인 책 상세 컴포넌트
const BookDetailContent: React.FC<{ isbn: string }> = ({ isbn }) => {
  const [readingStatusModalVisible, setReadingStatusModalVisible] = useState(false);

  const { data: book } = useSuspenseQuery({
    queryKey: ['book-detail', isbn],
    queryFn: () => getBookByIsbn(isbn),
  });

  const handleAladinPress = () => {
    const url = `https://www.aladin.co.kr/shop/wproduct.aspx?isbn=${isbn}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('오류', '알라딘 페이지를 열 수 없습니다.');
    });
  };

  const handleReadingStatusPress = () => {
    setReadingStatusModalVisible(true);
  };

  const handleReadingStatusSelect = (status: ReadingStatusType | null) => {
    // TODO: API 호출로 읽기 상태 업데이트
    console.log('Selected reading status:', status);
    Alert.alert(
      '읽기 상태 변경',
      `읽기 상태가 "${status ? StatusTexts[status] : StatusTexts['NONE']}"로 변경되었습니다.`
    );
  };

  const handleLibraryPress = () => {
    // TODO: 서재 선택 모달 구현
    Alert.alert('서재에 담기', '서재 선택 기능을 구현해주세요.');
  };

  const handleReviewPress = () => {
    // TODO: 리뷰 작성 화면으로 네비게이션
    Alert.alert('리뷰 작성', '리뷰 작성 기능을 구현해주세요.');
  };

  if (!book) return null;

  const displayRating = typeof book.rating === 'string' ? book.rating : book.rating.toFixed(1);
  const ratingsCount = book.totalRatings || 0;

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior='automatic'
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
            <View style={styles.userRating}>
              <RatingStars rating={book.userRating || 0} size={16} interactive />
              <TouchableOpacity style={styles.ratingClearButton}>
                <X size={16} color='#6B7280' />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.reviewButton} onPress={handleReviewPress}>
              <Edit3 size={12} color='#374151' />
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
                <Text style={styles.statNumber}>{book.readingStats?.wantToRead || 0}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, styles.blueBackground]}>
                <Users size={14} color='white' />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>읽는 중</Text>
                <Text style={styles.statNumber}>{book.readingStats?.reading || 0}</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.iconContainer, styles.greenBackground]}>
                <UserCheck size={14} color='white' />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>읽었어요</Text>
                <Text style={styles.statNumber}>{book.readingStats?.read || 1}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonsRow}>
            <ReadingStatusButton
              status={book.userReadingStatus as ReadingStatusType | null}
              onPress={handleReadingStatusPress}
            />
            <LibraryButton onPress={handleLibraryPress} />
          </View>
        </View>

        {/* 책 상세 정보 */}
        <BookInfo book={book} />

        <Text style={styles.dataProvider}>정보제공: 알라딘</Text>

        {/* 탭 섹션 */}
        <TabSection isbn={isbn} />
      </View>

      {/* 읽기 상태 선택 모달 */}
      <ReadingStatusModal
        isVisible={readingStatusModalVisible}
        onClose={() => setReadingStatusModalVisible(false)}
        currentStatus={book.userReadingStatus as ReadingStatusType | null}
        onStatusSelect={handleReadingStatusSelect}
      />
    </ScrollView>
  );
};

// 로딩 스켈레톤
const BookDetailSkeleton: React.FC = () => (
  <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

// 메인 화면 컴포넌트
export const BookDetailScreen: React.FC = () => {
  const route = useRoute<BookDetailRouteProp>();
  const { isbn } = route.params;

  return (
    <View style={styles.safeArea}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={true}>
        <Suspense fallback={<BookDetailSkeleton />}>
          <BookDetailContent isbn={isbn} />
        </Suspense>
      </ScrollView>
      <ReadingStatusModal
        isVisible={false}
        onClose={() => {}}
        currentStatus={null}
        onStatusSelect={() => {}}
      />
    </View>
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
  userRating: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingClearButton: {
    padding: 4,
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
    fontSize: 12,
    color: '#6B7280',
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
});
