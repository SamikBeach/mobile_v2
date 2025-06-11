import React, { useState, useCallback, useRef, Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
} from 'react-native';
import { Plus, User } from 'lucide-react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAtomValue } from 'jotai';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReviewType, ReviewResponseDto } from '../../apis/review/types';
import { LoadingSpinner, ReviewCard } from '../../components';
import { ReviewTypeBottomSheet } from '../../components/ReviewTypeBottomSheet';
import { useCommunityReviews, SortOption } from '../../hooks';
import { userAtom } from '../../atoms/user';
import { RootStackParamList } from '../../navigation/types';

type CommunityScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

// 리뷰 타입별 색상과 이름 매핑
const getTypeInfo = (type: ReviewType) => {
  switch (type) {
    case 'general':
      return { name: '일반', color: '#F9FAFB' };
    case 'discussion':
      return { name: '토론', color: '#FEF3C7' };
    case 'review':
      return { name: '리뷰', color: '#F3E8FF' };
    case 'question':
      return { name: '질문', color: '#DBEAFE' };
    case 'meetup':
      return { name: '모임', color: '#E0E7FF' };
    default:
      return { name: '일반', color: '#F9FAFB' };
  }
};

// CreateReviewCard Component
const CreateReviewCard = () => {
  const user = useAtomValue(userAtom);
  const navigation = useNavigation<CommunityScreenNavigationProp>();
  const [selectedType, setSelectedType] = useState<ReviewType>('general');
  const reviewTypeBottomSheetRef = useRef<BottomSheetModal>(null as any);

  // 사용자 정보 처리
  const displayName = user?.username || user?.email?.split('@')[0] || '';
  const initial = displayName.charAt(0);
  const avatarUrl = user?.profileImage || user?.avatar || null;

  // 리뷰 타입 정보
  const typeInfo = getTypeInfo(selectedType);

  // 리뷰 타입 선택 핸들러
  const handleTypeSelect = (type: ReviewType) => {
    setSelectedType(type);
  };

  // 리뷰 타입 선택 Bottom Sheet 열기
  const handleOpenTypeSelector = () => {
    reviewTypeBottomSheetRef.current?.present();
  };

  // 책 추가 버튼 핸들러
  const handleAddBook = () => {
    navigation.navigate('AddBook', {});
  };

  // TODO: 실제 리뷰 작성 모달 열기 (향후 구현)
  const handleOpenCreateReview = () => {
    console.log('리뷰 작성 모달 열기');
  };

  return (
    <>
      <View style={styles.createReviewCard}>
        <View style={styles.createReviewHeader}>
          <View style={styles.createUserAvatar}>
            {user ? (
              avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.createAvatarImage}
                  resizeMode='cover'
                />
              ) : (
                <Text style={styles.createAvatarText}>{initial}</Text>
              )
            ) : (
              <User size={16} color='#6B7280' />
            )}
          </View>
          <View style={styles.createReviewInput}>
            <TouchableOpacity
              style={styles.createTextInputTouchable}
              onPress={handleOpenCreateReview}
              activeOpacity={0.7}
            >
              <Text style={styles.createTextInputPlaceholder}>
                어떤 책에 대해 이야기하고 싶으신가요?
              </Text>
            </TouchableOpacity>
            <View style={styles.createReviewActions}>
              <View style={styles.createLeftActions}>
                <TouchableOpacity
                  style={styles.categorySelector}
                  onPress={handleOpenTypeSelector}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryDot, { backgroundColor: typeInfo.color }]} />
                  <Text style={styles.categorySelectorText}>{typeInfo.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.bookAddButton}
                  onPress={handleAddBook}
                  activeOpacity={0.7}
                >
                  <Plus size={12} color='#6B7280' />
                  <Text style={styles.bookAddButtonText}>책 추가</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleOpenCreateReview}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>제출하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* 리뷰 타입 선택 Bottom Sheet */}
      <ReviewTypeBottomSheet
        bottomSheetRef={reviewTypeBottomSheetRef}
        selectedType={selectedType}
        onTypeSelect={handleTypeSelect}
        originalType='general'
      />
    </>
  );
};

// 이제 공통 ReviewCard 컴포넌트를 사용합니다

// Loading Skeleton Component
const CommunityScreenSkeleton = () => (
  <View style={styles.container}>
    {/* Header Container - 실제와 동일한 구조 */}
    <View style={styles.headerContainer}>
      <View style={styles.filterContainer}>
        <CategoryFilter selectedCategory='all' onCategoryPress={() => {}} />
        <SortFilter selectedSort='recent' onSortPress={() => {}} />
      </View>
    </View>

    {/* Content List - FlatList 구조를 모방 */}
    <ScrollView
      style={styles.flatListStyle}
      contentContainerStyle={[styles.contentContainer, { paddingTop: 0 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ListHeaderComponent와 동일한 구조 */}
      <View style={styles.createReviewWrapper}>
        <CreateReviewCard />
      </View>

      {/* Loading 상태 */}
      <LoadingSpinner />
    </ScrollView>
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
        contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight - 6 }]}
        style={styles.flatListStyle}
        ListHeaderComponent={
          <View style={styles.createReviewWrapper}>
            <CreateReviewCard />
          </View>
        }
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
    gap: 16,
  },
  createReviewWrapper: {
    marginTop: 16,
    marginBottom: -12,
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
  createAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  createTextInputTouchable: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 80,
    justifyContent: 'flex-start',
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  createTextInputPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
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
