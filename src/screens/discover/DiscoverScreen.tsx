import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { Calendar, Star, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SortBottomSheet } from '../popular/SortBottomSheet';
import { TimeRangeBottomSheet } from '../popular/TimeRangeBottomSheet';
import { BookCard, LoadingSpinner } from '../../components';
import { useDiscoverBooks, useDiscoverCategories } from '../../hooks';
import { DiscoverCategory, DiscoverSubCategory } from '../../apis/discover-category/types';
import { HomeBookPreview } from '../../apis/book/types';

// Sort options
const sortOptions = [
  { value: 'rating-desc', label: '평점 높은순' },
  { value: 'reviews-desc', label: '리뷰 많은순' },
  { value: 'library-desc', label: '서재 추가 많은순' },
  { value: 'publishDate-desc', label: '출간일순' },
  { value: 'title-asc', label: '제목순' },
];

// Time range options
const timeRangeOptions = [
  { value: 'all', label: '전체 기간' },
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'year', label: '올해' },
];

// Breadcrumb component
const DiscoverBreadcrumb = ({
  selectedCategoryId,
  selectedSubcategoryId,
  categories,
  onCategoryPress,
  onResetFilters,
}: {
  selectedCategoryId: number;
  selectedSubcategoryId: number;
  categories: DiscoverCategory[];
  onCategoryPress: (categoryId: number) => void;
  onResetFilters: () => void;
}) => {
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const selectedSubcategory = selectedCategory?.subCategories?.find(
    sub => sub.id === selectedSubcategoryId
  );

  return (
    <View style={styles.breadcrumbContainer}>
      <TouchableOpacity onPress={onResetFilters}>
        <Text
          style={[styles.breadcrumbText, selectedCategoryId === 0 && styles.breadcrumbTextActive]}
        >
          발견하기
        </Text>
      </TouchableOpacity>

      {selectedCategoryId !== 0 && (
        <>
          <ChevronRight size={14} color='#6B7280' style={styles.breadcrumbChevron} />
          <TouchableOpacity onPress={() => onCategoryPress(selectedCategoryId)}>
            <Text
              style={[
                styles.breadcrumbText,
                selectedSubcategoryId === 0 && styles.breadcrumbTextActive,
              ]}
            >
              {selectedCategory?.name}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {selectedSubcategoryId !== 0 && selectedSubcategory && (
        <>
          <ChevronRight size={14} color='#6B7280' style={styles.breadcrumbChevron} />
          <Text style={[styles.breadcrumbText, styles.breadcrumbTextActive]}>
            {selectedSubcategory.name}
          </Text>
        </>
      )}
    </View>
  );
};

export const DiscoverScreen = () => {
  // Navigation
  const navigation = useNavigation();

  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0); // 0은 "전체"
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number>(0); // 0은 "전체"
  const [sortOption, setSortOption] = useState('rating-desc');
  const [timeRange, setTimeRange] = useState('all');
  const [showSortBottomSheet, setShowSortBottomSheet] = useState(false);
  const [showTimeRangeBottomSheet, setShowTimeRangeBottomSheet] = useState(false);

  // Animation for filter visibility
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');

  const [headerHeight, setHeaderHeight] = useState(120);

  // API hooks
  const { categories, isLoading: categoriesLoading } = useDiscoverCategories();
  const {
    books,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: booksLoading,
  } = useDiscoverBooks({
    discoverCategoryId: selectedCategoryId === 0 ? undefined : selectedCategoryId,
    discoverSubCategoryId: selectedSubcategoryId === 0 ? undefined : selectedSubcategoryId,
    sort: sortOption as any,
    timeRange: timeRange as any,
  });

  // Get current category object
  const selectedCategoryObj = categories.find(category => category.id === selectedCategoryId);
  const subcategories = selectedCategoryObj?.subCategories || [];

  // Check if subcategories are active
  const hasActiveSubcategories = useMemo(() => {
    if (selectedCategoryId === 0) return false;
    return subcategories.length > 0;
  }, [selectedCategoryId, subcategories]);

  // Handlers
  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(0); // Reset subcategory to "전체"
  };

  const handleSubcategoryPress = (subcategoryId: number) => {
    setSelectedSubcategoryId(subcategoryId);
  };

  const handleBookPress = (book: HomeBookPreview) => {
    // Navigate to book detail
    (navigation as any).navigate('BookDetail', { isbn: book.isbn });
  };

  const handleSortPress = () => {
    setShowSortBottomSheet(true);
  };

  const handleTimeRangePress = () => {
    setShowTimeRangeBottomSheet(true);
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  const handleResetFilters = () => {
    setSelectedCategoryId(0);
    setSelectedSubcategoryId(0);
  };

  // Header height measurement
  const onHeaderLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  // Scroll handler for filter visibility
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
    listener: (event: any) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const diff = currentScrollY - lastScrollY.current;

      // 최상단에 도달했을 때는 항상 헤더 표시
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

      // 스크롤이 충분히 이동했을 때만 방향 감지
      if (Math.abs(diff) > 5) {
        const newDirection = diff > 0 ? 'down' : 'up';

        // 방향이 바뀌었을 때만 애니메이션 실행
        if (scrollDirection.current !== newDirection) {
          scrollDirection.current = newDirection;

          // 헤더 높이에 약간의 여유를 더해서 완전히 숨김
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

  // Load more books when reaching the end
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Get category button colors
  const getCategoryButtonStyle = (categoryId: number, index: number) => {
    if (categoryId === selectedCategoryId) {
      return {
        backgroundColor: '#111827', // 선택된 카테고리는 검은색 (gray-900)
      };
    }

    // 이미지에 맞는 정확한 파스텔 색상
    const colors = [
      '#F1F5F9', // 전체 - 연한 회색
      '#FECACA', // 소설/시/희곡 - 연한 핑크
      '#FEF3C7', // 인문학 - 연한 노란색
      '#D1FAE5', // 경제경영 - 연한 초록색
      '#DBEAFE', // 컴퓨터/IT - 연한 파란색
      '#E0E7FF', // 기타 - 연한 보라색
    ];

    return {
      backgroundColor: colors[index % colors.length] || '#F1F5F9',
    };
  };

  // Render category button
  const renderCategoryButton = (category: DiscoverCategory, index: number) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryButton, getCategoryButtonStyle(category.id, index)]}
      onPress={() => handleCategoryPress(category.id)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          {
            color: category.id === selectedCategoryId ? 'white' : '#374151',
          },
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  // Render subcategory button
  const renderSubcategoryButton = (subcategory: DiscoverSubCategory) => (
    <TouchableOpacity
      key={subcategory.id}
      style={[
        styles.subcategoryButton,
        {
          backgroundColor:
            subcategory.id === selectedSubcategoryId
              ? '#EFF6FF' // blue-50 - 웹과 동일한 연한 파란색 배경
              : 'white',
          borderColor:
            subcategory.id === selectedSubcategoryId
              ? '#BFDBFE' // blue-200 - 웹과 동일한 파란색 테두리
              : '#E5E7EB', // gray-200 - 웹과 동일한 회색 테두리
        },
      ]}
      onPress={() => handleSubcategoryPress(subcategory.id)}
    >
      <Text
        style={[
          styles.subcategoryButtonText,
          {
            color: subcategory.id === selectedSubcategoryId ? '#1D4ED8' : '#6B7280', // blue-700 텍스트와 gray-500
          },
        ]}
      >
        {subcategory.name}
      </Text>
    </TouchableOpacity>
  );

  // Render book item
  const renderBookItem = ({ item: book }: { item: HomeBookPreview }) => (
    <BookCard book={book} onPress={() => handleBookPress(book)} horizontal={true} />
  );

  // Loading state
  if (categoriesLoading && !categories.length) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>카테고리를 불러오는 중...</Text>
      </View>
    );
  }

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
        {/* Breadcrumb */}
        <DiscoverBreadcrumb
          selectedCategoryId={selectedCategoryId}
          selectedSubcategoryId={selectedSubcategoryId}
          categories={categories}
          onCategoryPress={handleCategoryPress}
          onResetFilters={handleResetFilters}
        />

        {/* Fixed Filter Header */}
        <View style={styles.filterContainer}>
          {/* Category Filter */}
          <View style={styles.categoryContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScrollView}
              contentContainerStyle={styles.categoryScrollContent}
            >
              {categories.map((category, index) => renderCategoryButton(category, index))}
            </ScrollView>
          </View>

          {/* Subcategory Filter */}
          {hasActiveSubcategories && (
            <View style={styles.subcategoryContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.subcategoryScrollView}
                contentContainerStyle={styles.subcategoryScrollContent}
              >
                <TouchableOpacity
                  style={[
                    styles.subcategoryButton,
                    {
                      backgroundColor: selectedSubcategoryId === 0 ? '#EFF6FF' : 'white',
                      borderColor: selectedSubcategoryId === 0 ? '#BFDBFE' : '#E5E7EB',
                    },
                  ]}
                  onPress={() => handleSubcategoryPress(0)}
                >
                  <Text
                    style={[
                      styles.subcategoryButtonText,
                      {
                        color: selectedSubcategoryId === 0 ? '#1D4ED8' : '#6B7280',
                      },
                    ]}
                  >
                    전체
                  </Text>
                </TouchableOpacity>
                {subcategories.map(renderSubcategoryButton)}
              </ScrollView>
            </View>
          )}

          {/* Sort Options */}
          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={[styles.sortButton, timeRange !== 'all' && styles.activeSortButton]}
              onPress={handleTimeRangePress}
            >
              <Calendar size={14} color={timeRange !== 'all' ? '#1D4ED8' : '#6B7280'} />
              <Text
                style={[styles.sortButtonText, timeRange !== 'all' && styles.activeSortButtonText]}
              >
                {timeRangeOptions.find(opt => opt.value === timeRange)?.label || '전체 기간'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortButton, sortOption !== 'rating-desc' && styles.activeSortButton]}
              onPress={handleSortPress}
            >
              <Star size={14} color={sortOption !== 'rating-desc' ? '#1D4ED8' : '#6B7280'} />
              <Text
                style={[
                  styles.sortButtonText,
                  sortOption !== 'rating-desc' && styles.activeSortButtonText,
                ]}
              >
                {sortOptions.find(opt => opt.value === sortOption)?.label || '평점 높은순'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Books List */}
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={item => item.id.toString()}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.booksContainer, { paddingTop: headerHeight + 16 }]}
        style={styles.flatListStyle}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          booksLoading ? (
            <View>
              <LoadingSpinner />
              <Text style={styles.loadingText}>도서를 불러오는 중...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
              <Text style={styles.emptySubtitle}>다른 조건으로 검색해보세요</Text>
            </View>
          )
        }
        ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
      />

      {/* Sort Bottom Sheet */}
      <SortBottomSheet
        visible={showSortBottomSheet}
        onClose={() => setShowSortBottomSheet(false)}
        selectedSort={sortOption}
        onSortChange={handleSortChange}
      />

      {/* Time Range Bottom Sheet */}
      <TimeRangeBottomSheet
        visible={showTimeRangeBottomSheet}
        onClose={() => setShowTimeRangeBottomSheet(false)}
        selectedTimeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />
    </View>
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
  flatListStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingTop: 4,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    marginRight: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subcategoryContainer: {
    paddingBottom: 8,
  },
  subcategoryScrollView: {
    paddingHorizontal: 16,
  },
  subcategoryScrollContent: {
    paddingRight: 16,
  },
  subcategoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16, // 웹과 동일한 rounded-full
    borderWidth: 1,
    marginRight: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subcategoryButtonText: {
    fontSize: 14, // 웹과 동일한 크기
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 6,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // 기본 회색 테두리
    backgroundColor: '#F8F9FA', // 연한 회색 배경
    minHeight: 32,
  },
  sortButtonText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 5,
    fontWeight: '500',
  },
  activeSortButton: {
    backgroundColor: '#EFF6FF', // 연한 파란색 배경
    borderWidth: 1,
    borderColor: '#BFDBFE', // 파란색 테두리
  },
  activeSortButtonText: {
    color: '#1D4ED8', // 파란색 텍스트
  },
  booksContainer: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: 'white',
  },
  breadcrumbText: {
    fontSize: 14,
    color: '#6B7280',
  },
  breadcrumbTextActive: {
    fontWeight: '500',
    color: '#111827',
  },
  breadcrumbChevron: {
    marginHorizontal: 4,
  },
});
