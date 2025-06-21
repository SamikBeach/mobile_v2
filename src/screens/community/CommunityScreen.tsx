import React, { useState, useCallback, useRef, Suspense, useEffect } from 'react';
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
  TextInput,
} from 'react-native';
import { Plus, User, Star, X, ChevronDown } from 'lucide-react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useAtomValue } from 'jotai';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReviewType, ReviewResponseDto } from '../../apis/review/types';
import { LoadingSpinner, ReviewCard } from '../../components';
import { ReviewTypeBottomSheet } from '../../components/ReviewTypeBottomSheet';
import { ReadingStatusBottomSheet } from '../../components/ReadingStatusBottomSheet';
import { useCommunityReviews, SortOption } from '../../hooks';
import { userAtom } from '../../atoms/user';
import { RootStackParamList } from '../../navigation/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview } from '../../apis/review';
import { createOrUpdateRating } from '../../apis/rating';
import { createOrUpdateReadingStatus, ReadingStatusType } from '../../apis/reading-status';
import Toast from 'react-native-toast-message';
import { AppColors } from '../../constants';

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
  { id: 'review', name: '리뷰', color: AppColors.border },
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
  const [inputText, setInputText] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [readingStatus, setReadingStatus] = useState<'WANT_TO_READ' | 'READING' | 'READ' | null>(
    'READ'
  );
  const reviewTypeBottomSheetRef = useRef<BottomSheetModal>(null as any);
  const queryClient = useQueryClient();
  const [isReadingStatusVisible, setIsReadingStatusVisible] = useState(false);

  // 읽기 상태 텍스트 매핑
  const statusTexts = {
    [ReadingStatusType.WANT_TO_READ]: '읽고 싶어요',
    [ReadingStatusType.READING]: '읽는 중',
    [ReadingStatusType.READ]: '읽었어요',
    NONE: '선택 안함',
  };

  // 읽기 상태 이모지 매핑
  const statusEmojis = {
    [ReadingStatusType.WANT_TO_READ]: '📚',
    [ReadingStatusType.READING]: '📖',
    [ReadingStatusType.READ]: '✅',
    NONE: '❌',
  };

  // 사용자 정보 처리
  const displayName = user?.username || user?.email?.split('@')[0] || '';
  const initial = displayName.charAt(0);
  const avatarUrl = user?.profileImage || user?.avatar || null;

  // 리뷰 타입 정보
  const typeInfo = getTypeInfo(selectedType);

  // AddBook 화면에서 돌아올 때 선택된 책 받기
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 전역 상태나 다른 방법으로 선택된 책을 받을 수 있도록 구현 예정
    });

    return unsubscribe;
  }, [navigation]);

  // 리뷰 생성 mutation
  const createReviewMutation = useMutation({
    mutationFn: async () => {
      // 리뷰 타입이면서 책이 선택되지 않은 경우 오류
      if (selectedType === 'review' && !selectedBook) {
        throw new Error('리뷰 태그를 선택한 경우, 책을 추가해야 합니다.');
      }

      // 책이 선택되었는데 별점이 없는 경우 오류
      if (selectedBook && rating === 0) {
        throw new Error('책을 추가한 경우, 별점을 입력해야 합니다.');
      }

      let bookId: number | undefined = undefined;
      let bookIsbn = undefined;
      let isNegativeBookId = false;

      if (selectedBook) {
        // ID 추출
        const rawId = selectedBook.bookId ?? selectedBook.id;
        if (typeof rawId === 'number') {
          bookId = rawId;
        } else if (typeof rawId === 'string') {
          const parsedId = parseInt(rawId, 10);
          bookId = isNaN(parsedId) ? -1 : parsedId;
        } else {
          bookId = -1;
        }

        // ISBN 추출
        bookIsbn = selectedBook.isbn13 || selectedBook.isbn || '';

        // 북 ID가 음수인지 확인
        isNegativeBookId = bookId < 0;
        if (isNegativeBookId) {
          bookId = -1;
        }
      }

      // 기본 리뷰 데이터 설정
      const reviewData = {
        content: inputText,
        type: selectedType,
        bookId,
        isbn: isNegativeBookId ? bookIsbn : undefined,
      };

      // 별점이 있는 경우 별점 API 호출
      if (selectedBook && rating > 0 && bookId !== undefined) {
        await createOrUpdateRating(bookId, { rating }, isNegativeBookId ? bookIsbn : undefined);
      }

      // 읽기 상태 API 호출 - 리뷰 타입이고 책이 선택된 경우에만
      if (selectedType === 'review' && bookId !== undefined) {
        if (readingStatus) {
          await createOrUpdateReadingStatus(
            bookId,
            { status: readingStatus as ReadingStatusType },
            isNegativeBookId ? bookIsbn : undefined
          );
        }
      }

      return createReview(reviewData);
    },
    onSuccess: () => {
      // 성공 시 입력 초기화
      setInputText('');
      setSelectedBook(null);
      setRating(0);
      setSelectedType('general');
      setReadingStatus(ReadingStatusType.READ);

      // 토스트 표시
      Toast.show({
        type: 'success',
        text1: '리뷰가 등록되었습니다.',
      });

      // 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['communityReviews'],
        exact: false,
      });
    },
    onError: (error: any) => {
      let errorMessage = '리뷰 등록 중 오류가 발생했습니다.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: 'error',
        text1: '오류',
        text2: errorMessage,
      });
    },
  });

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
    if (selectedType === 'review') {
      navigation.navigate('AddBook', {
        onBookSelect: (book: any) => {
          setSelectedBook(book);
          // 새 책 선택 시 별점과 읽기 상태 초기화
          setRating(0);
          setReadingStatus(ReadingStatusType.READ);
        },
      });
    }
  };

  // 읽기 상태 변경 핸들러
  const handleReadingStatusSelect = (status: ReadingStatusType | null) => {
    setReadingStatus(status);
    setIsReadingStatusVisible(false);
  };

  // 읽기 상태 Bottom Sheet 열기
  const handleOpenReadingStatusSelector = () => {
    setIsReadingStatusVisible(true);
  };

  // 리뷰 제출 핸들러
  const handleSubmitReview = async () => {
    if (!inputText.trim()) {
      return;
    }

    // 리뷰 타입이면서 책이 선택되지 않은 경우
    if (selectedType === 'review' && !selectedBook) {
      Toast.show({
        type: 'info',
        text1: '알림',
        text2: '리뷰 태그를 선택한 경우, 책을 추가해야 합니다.',
      });
      return;
    }

    // 책이 선택되었는데 별점이 없는 경우
    if (selectedBook && rating === 0) {
      Toast.show({
        type: 'info',
        text1: '알림',
        text2: '책을 추가한 경우, 별점을 입력해야 합니다.',
      });
      return;
    }

    try {
      await createReviewMutation.mutateAsync();
    } catch {
      // 오류는 mutation에서 처리됨
    }
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
            <TextInput
              style={styles.createTextInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder='어떤 책에 대해 이야기하고 싶으신가요?'
              placeholderTextColor='#9CA3AF'
              multiline
              numberOfLines={3}
              textAlignVertical='top'
            />

            {/* 선택된 책 정보 표시 */}
            {selectedType === 'review' && selectedBook && (
              <View style={styles.selectedBookContainer}>
                <View style={styles.selectedBookInfo}>
                  <Image
                    source={{ uri: selectedBook.coverImage || selectedBook.image }}
                    style={styles.selectedBookCover}
                    resizeMode='cover'
                  />
                  <View style={styles.selectedBookDetails}>
                    <View style={styles.selectedBookHeader}>
                      <Text style={styles.selectedBookTitle} numberOfLines={1}>
                        {selectedBook.title}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeBookButton}
                        onPress={() => {
                          setSelectedBook(null);
                          setRating(0);
                        }}
                      >
                        <X size={16} color='#6B7280' />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.selectedBookAuthor} numberOfLines={1}>
                      {selectedBook.author}
                    </Text>
                  </View>
                </View>

                {/* 별점과 읽기 상태 */}
                <View style={styles.selectedBookActions}>
                  <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>별점:</Text>
                    <View style={styles.stars}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                          <Star
                            size={16}
                            color={star <= rating ? '#FBBF24' : '#E5E7EB'}
                            fill={star <= rating ? '#FBBF24' : '#E5E7EB'}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    {rating > 0 && (
                      <Text style={styles.createRatingText}>
                        {rating === 1
                          ? '별로예요'
                          : rating === 2
                            ? '아쉬워요'
                            : rating === 3
                              ? '보통이에요'
                              : rating === 4
                                ? '좋아요'
                                : '최고예요'}
                      </Text>
                    )}
                  </View>

                  {/* 읽기 상태 드롭다운 */}
                  <TouchableOpacity
                    style={[
                      styles.readingStatusButton,
                      readingStatus === ReadingStatusType.WANT_TO_READ && styles.wantToReadStatus,
                      readingStatus === ReadingStatusType.READING && styles.readingStatus,
                      readingStatus === ReadingStatusType.READ && styles.readStatus,
                      readingStatus === null && styles.noneStatus,
                    ]}
                    onPress={handleOpenReadingStatusSelector}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.readingStatusEmoji}>
                      {readingStatus ? statusEmojis[readingStatus] : statusEmojis.NONE}
                    </Text>
                    <Text
                      style={[
                        styles.readingStatusText,
                        readingStatus === ReadingStatusType.WANT_TO_READ && styles.wantToReadText,
                        readingStatus === ReadingStatusType.READING && styles.readingText,
                        readingStatus === ReadingStatusType.READ && styles.readText,
                        readingStatus === null && styles.noneText,
                      ]}
                    >
                      {readingStatus ? statusTexts[readingStatus] : statusTexts.NONE}
                    </Text>
                    <ChevronDown size={12} color='#6B7280' />
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
                  style={[
                    styles.bookAddButton,
                    selectedType !== 'review' && styles.bookAddButtonDisabled,
                  ]}
                  onPress={handleAddBook}
                  activeOpacity={0.7}
                  disabled={selectedType !== 'review'}
                >
                  <Plus size={12} color={selectedType === 'review' ? '#6B7280' : '#D1D5DB'} />
                  <Text
                    style={[
                      styles.bookAddButtonText,
                      selectedType !== 'review' && styles.bookAddButtonTextDisabled,
                    ]}
                  >
                    책 추가
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!inputText.trim() || createReviewMutation.isPending) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                activeOpacity={0.7}
                disabled={!inputText.trim() || createReviewMutation.isPending}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    (!inputText.trim() || createReviewMutation.isPending) &&
                      styles.submitButtonTextDisabled,
                  ]}
                >
                  {createReviewMutation.isPending ? '제출 중...' : '제출하기'}
                </Text>
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

      {/* 읽기 상태 선택 Bottom Sheet */}
      <ReadingStatusBottomSheet
        isVisible={isReadingStatusVisible}
        onClose={() => setIsReadingStatusVisible(false)}
        currentStatus={readingStatus as ReadingStatusType | null}
        onStatusSelect={handleReadingStatusSelect}
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
  createTextInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 80,
    backgroundColor: '#F9FAFB',
    marginBottom: 4,
    fontSize: 15,
    color: '#374151',
    textAlignVertical: 'top',
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
  bookAddButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
  },
  bookAddButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  bookAddButtonTextDisabled: {
    color: '#D1D5DB',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
  selectedBookContainer: {
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  selectedBookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedBookCover: {
    width: 48,
    height: 72,
    borderRadius: 4,
  },
  selectedBookDetails: {
    flex: 1,
    marginLeft: 12,
  },
  selectedBookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  selectedBookTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  selectedBookAuthor: {
    fontSize: 12,
    color: '#6B7280',
  },
  removeBookButton: {
    padding: 4,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  createRatingText: {
    fontSize: 10,
    color: '#6B7280',
  },
  selectedBookActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  readingStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  wantToReadStatus: {
    backgroundColor: '#F3E8FF',
    borderColor: '#C084FC',
  },
  readingStatus: {
    backgroundColor: '#DBEAFE',
    borderColor: '#60A5FA',
  },
  readStatus: {
    backgroundColor: AppColors.border,
    borderColor: '#34D399',
  },
  noneStatus: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },
  readingStatusEmoji: {
    fontSize: 12,
  },
  readingStatusText: {
    fontSize: 10,
    fontWeight: '500',
    maxWidth: 60,
  },
  wantToReadText: {
    color: '#7C3AED',
  },
  readingText: {
    color: '#2563EB',
  },
  readText: {
    color: '#059669',
  },
  noneText: {
    color: '#DC2626',
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
