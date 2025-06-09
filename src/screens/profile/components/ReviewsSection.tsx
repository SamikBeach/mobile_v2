import React, { useState, Suspense, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Star, Users, Clock, Calendar, ChevronDown, CalendarClock } from 'lucide-react-native';
import { getUserReviews, getUserReviewTypeCounts } from '../../../apis/user/user';
import { ReviewCard } from '../../../components/Review/ReviewCard';

import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

// Lucide 아이콘들을 컴포넌트로 래핑
const StarIcon = ({ size = 14, color = '#6B7280' }) => <Star size={size} color={color} />;
const ChevronDownIcon = ({ size = 12, color = '#6B7280' }) => (
  <ChevronDown size={size} color={color} />
);
const CalendarIcon = ({ size = 14, color = '#6B7280' }) => <Calendar size={size} color={color} />;
const ClockIcon = ({ size = 14, color = '#6B7280' }) => <Clock size={size} color={color} />;
const UsersIcon = ({ size = 14, color = '#6B7280' }) => <Users size={size} color={color} />;

const CalendarClockIcon = ({ size = 14, color = '#6B7280' }) => (
  <CalendarClock size={size} color={color} />
);

// 정렬 옵션 정의 (리뷰용)
enum ReviewSortOptions {
  RECENT = 'recent',
  POPULAR = 'popular',
  OLDEST = 'oldest',
  RATING_DESC = 'rating_desc',
}

// 시간 범위 옵션 정의
enum TimeRangeOptions {
  ALL = 'all',
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

// 정렬 옵션 정의 (리뷰용)
const reviewSortOptions = [
  {
    id: ReviewSortOptions.RECENT,
    label: '최신순',
    icon: (isActive: boolean) => <ClockIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />,
    supportsTimeRange: true,
  },
  {
    id: ReviewSortOptions.POPULAR,
    label: '인기순',
    icon: (isActive: boolean) => <UsersIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />,
    supportsTimeRange: true,
  },
  {
    id: ReviewSortOptions.RATING_DESC,
    label: '별점 높은순',
    icon: (isActive: boolean) => <StarIcon size={14} color={isActive ? '#2563EB' : '#FFAB00'} />,
    supportsTimeRange: true,
  },
  {
    id: ReviewSortOptions.OLDEST,
    label: '오래된순',
    icon: (isActive: boolean) => (
      <CalendarIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />
    ),
    supportsTimeRange: false,
  },
];

// 시간 범위 옵션 (src_frontend와 동일)
const timeRangeOptions = [
  {
    id: TimeRangeOptions.ALL,
    label: '전체 기간',
    icon: (isActive: boolean) => (
      <CalendarIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />
    ),
  },
  {
    id: TimeRangeOptions.TODAY,
    label: '오늘',
    icon: (isActive: boolean) => <ClockIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />,
  },
  {
    id: TimeRangeOptions.WEEK,
    label: '최근 1주',
    icon: (isActive: boolean) => <ClockIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />,
  },
  {
    id: TimeRangeOptions.MONTH,
    label: '최근 1개월',
    icon: (isActive: boolean) => (
      <CalendarIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />
    ),
  },
  {
    id: TimeRangeOptions.YEAR,
    label: '최근 1년',
    icon: (isActive: boolean) => (
      <CalendarClockIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />
    ),
  },
];

// 리뷰 필터 (src_frontend와 동일한 순서)
const reviewFilters = [
  { id: 'ALL', name: '전체', type: undefined },
  { id: 'REVIEW', name: '리뷰', type: 'review' },
  { id: 'RATING', name: '별점만', type: 'rating' },
];

// 기본값 정의 (src_frontend와 동일)
const DEFAULT_FILTER = undefined;
const DEFAULT_SORT = ReviewSortOptions.RECENT;
const DEFAULT_TIME_RANGE = TimeRangeOptions.ALL;

// LoadingSpinner 컴포넌트 (스타일 정의 전에 간단하게 정의)
const LoadingSpinner: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <ActivityIndicator size='small' color='#2563EB' />
  </View>
);

// 리뷰 타입별 카운트 조회 Hook
const useReviewTypeCounts = (userId: number) => {
  const { data, isLoading } = useSuspenseQuery({
    queryKey: ['user-review-type-counts', userId],
    queryFn: () => getUserReviewTypeCounts(userId),
  });

  return {
    typeCounts: data || {
      general: 0,
      discussion: 0,
      review: 0,
      question: 0,
      meetup: 0,
      total: 0,
    },
    isLoading,
  };
};

// 사용자 리뷰 조회 Hook (무한 스크롤)
const useUserReviewsInfinite = (
  userId: number,
  filter: string | undefined,
  sort: string = DEFAULT_SORT,
  timeRange: string = DEFAULT_TIME_RANGE
) => {
  const PAGE_SIZE = 12;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey: ['user-reviews', userId, filter, sort, timeRange],
    queryFn: async ({ pageParam = 1 }) => {
      return getUserReviews(userId, pageParam, PAGE_SIZE);
    },
    getNextPageParam: lastPage => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // 모든 페이지의 리뷰 목록을 하나의 배열로 병합
  const reviews = data?.pages.flatMap(page => page.reviews || []) || [];

  const total = data?.pages[0]?.total || 0;

  return {
    reviews,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    total,
  };
};

// BottomSheet를 사용한 SortDropdown 컴포넌트
interface SortDropdownProps {
  selectedSort: string;
  selectedTimeRange: string;
  onSortChange: (sort: string) => void;
  onTimeRangeChange: (range: string) => void;
  showTimeRangeFilter: boolean;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  selectedSort,
  selectedTimeRange,
  onSortChange,
  onTimeRangeChange,
  showTimeRangeFilter,
}) => {
  const [sortBottomSheetVisible, setSortBottomSheetVisible] = useState(false);
  const [timeBottomSheetVisible, setTimeBottomSheetVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const sortBottomSheetRef = useRef<BottomSheetModal>(null);
  const timeBottomSheetRef = useRef<BottomSheetModal>(null);

  const selectedSortOption = reviewSortOptions.find(opt => opt.id === selectedSort);
  const selectedTimeOption = timeRangeOptions.find(opt => opt.id === selectedTimeRange);

  const isSortActive = selectedSort !== DEFAULT_SORT;
  const isTimeRangeActive = selectedTimeRange !== DEFAULT_TIME_RANGE;

  // Handle sort bottom sheet visibility
  React.useEffect(() => {
    if (sortBottomSheetVisible) {
      sortBottomSheetRef.current?.present();
    } else {
      sortBottomSheetRef.current?.dismiss();
    }
  }, [sortBottomSheetVisible]);

  // Handle time bottom sheet visibility
  React.useEffect(() => {
    if (timeBottomSheetVisible) {
      timeBottomSheetRef.current?.present();
    } else {
      timeBottomSheetRef.current?.dismiss();
    }
  }, [timeBottomSheetVisible]);

  const handleSortPress = useCallback(() => {
    setSortBottomSheetVisible(true);
  }, []);

  const handleTimePress = useCallback(() => {
    setTimeBottomSheetVisible(true);
  }, []);

  const handleSortSelect = useCallback(
    (sortId: string) => {
      onSortChange(sortId);
      setSortBottomSheetVisible(false);
    },
    [onSortChange]
  );

  const handleTimeSelect = useCallback(
    (timeId: string) => {
      onTimeRangeChange(timeId);
      setTimeBottomSheetVisible(false);
    },
    [onTimeRangeChange]
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        enableTouchThrough={false}
      />
    ),
    []
  );

  const handleSortSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setSortBottomSheetVisible(false);
    }
  }, []);

  const handleTimeSheetChange = useCallback((index: number) => {
    if (index === -1) {
      setTimeBottomSheetVisible(false);
    }
  }, []);

  return (
    <>
      <View style={styles.sortContainer}>
        {/* 시간 범위 버튼 (조건부 렌더링) */}
        {showTimeRangeFilter && (
          <TouchableOpacity
            style={[styles.sortButton, isTimeRangeActive && styles.sortButtonActive]}
            onPress={handleTimePress}
          >
            <View style={styles.sortButtonIcon}>{selectedTimeOption?.icon(isTimeRangeActive)}</View>
            <Text style={[styles.sortButtonText, isTimeRangeActive && styles.sortButtonTextActive]}>
              {selectedTimeOption?.label}
            </Text>
            <ChevronDownIcon size={12} color={isTimeRangeActive ? '#2563EB' : '#6B7280'} />
          </TouchableOpacity>
        )}

        {/* 정렬 버튼 */}
        <TouchableOpacity
          style={[styles.sortButton, isSortActive && styles.sortButtonActive]}
          onPress={handleSortPress}
        >
          <View style={styles.sortButtonIcon}>{selectedSortOption?.icon(isSortActive)}</View>
          <Text style={[styles.sortButtonText, isSortActive && styles.sortButtonTextActive]}>
            {selectedSortOption?.label}
          </Text>
          <ChevronDownIcon size={12} color={isSortActive ? '#2563EB' : '#6B7280'} />
        </TouchableOpacity>
      </View>

      {/* 정렬 옵션 BottomSheet */}
      <BottomSheetModal
        ref={sortBottomSheetRef}
        snapPoints={['50%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onChange={handleSortSheetChange}
        handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 36, height: 4 }}
        backgroundStyle={{
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <BottomSheetView style={[styles.bottomSheetContent, { paddingBottom: insets.bottom + 16 }]}>
          {reviewSortOptions.map(option => {
            const isActive = option.id === selectedSort;
            return (
              <TouchableOpacity
                key={option.id}
                style={[styles.bottomSheetItem, isActive && styles.bottomSheetItemActive]}
                onPress={() => handleSortSelect(option.id)}
              >
                <View style={styles.bottomSheetItemIcon}>{option.icon(isActive)}</View>
                <Text
                  style={[styles.bottomSheetItemText, isActive && styles.bottomSheetItemTextActive]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BottomSheetView>
      </BottomSheetModal>

      {/* 시간 범위 BottomSheet */}
      {showTimeRangeFilter && (
        <BottomSheetModal
          ref={timeBottomSheetRef}
          snapPoints={['45%']}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          onChange={handleTimeSheetChange}
          handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 36, height: 4 }}
          backgroundStyle={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <BottomSheetView
            style={[styles.bottomSheetContent, { paddingBottom: insets.bottom + 16 }]}
          >
            {timeRangeOptions.map(option => {
              const isActive = option.id === selectedTimeRange;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.bottomSheetItem, isActive && styles.bottomSheetItemActive]}
                  onPress={() => handleTimeSelect(option.id)}
                >
                  <View style={styles.bottomSheetItemIcon}>{option.icon(isActive)}</View>
                  <Text
                    style={[
                      styles.bottomSheetItemText,
                      isActive && styles.bottomSheetItemTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </BottomSheetView>
        </BottomSheetModal>
      )}
    </>
  );
};

// FilterMenu 컴포넌트 (ReadBooksSection과 완전히 동일)
interface FilterMenuProps {
  userId: number;
  selectedFilter: string | undefined;
  selectedSort: string;
  selectedTimeRange: string;
  onFilterChange: (filter: string | undefined) => void;
  onSortChange: (sort: string) => void;
  onTimeRangeChange: (range: string) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  userId,
  selectedFilter,
  selectedSort,
  selectedTimeRange,
  onFilterChange,
  onSortChange,
  onTimeRangeChange,
}) => {
  const { typeCounts } = useReviewTypeCounts(userId);

  const getCountForFilter = (filterType: string | undefined) => {
    if (!typeCounts) return 0;
    if (!filterType) return typeCounts.total || 0;
    if (filterType === 'review') return typeCounts.review || 0;
    if (filterType === 'rating') return 0; // 별점만 카운트는 별도 API 필요
    return 0;
  };

  const showTimeRangeFilter = [
    ReviewSortOptions.RECENT,
    ReviewSortOptions.POPULAR,
    ReviewSortOptions.RATING_DESC,
  ].includes(selectedSort as ReviewSortOptions);

  return (
    <View style={styles.filterContainer}>
      {/* 리뷰 타입 필터 */}
      <View style={styles.statusContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusScrollView}
          contentContainerStyle={styles.statusScrollContent}
        >
          {reviewFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.statusFilterButton,
                selectedFilter === filter.type && styles.statusFilterButtonActive,
              ]}
              onPress={() => onFilterChange(filter.type)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  selectedFilter === filter.type && styles.statusFilterTextActive,
                ]}
              >
                {filter.name}
              </Text>
              <View style={styles.statusFilterBadge}>
                <Text style={styles.statusFilterBadgeText}>{getCountForFilter(filter.type)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 정렬 드롭다운 */}
      <SortDropdown
        selectedSort={selectedSort}
        selectedTimeRange={selectedTimeRange}
        onSortChange={onSortChange}
        onTimeRangeChange={onTimeRangeChange}
        showTimeRangeFilter={showTimeRangeFilter}
      />
    </View>
  );
};

// 빈 상태 컴포넌트
const EmptyState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>리뷰가 없습니다</Text>
    <Text style={styles.emptyDescription}>
      아직 작성한 리뷰가 없습니다. 첫 리뷰를 작성해보세요.
    </Text>
  </View>
);

// 리뷰 목록 컴포넌트
interface ReviewsListProps {
  userId: number;
  filter: string | undefined;
  sort: string;
  timeRange: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ userId, filter, sort, timeRange }) => {
  const flatListRef = useRef<FlatList>(null);
  const previousFilterRef = useRef<string | undefined>(filter);

  const { reviews, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserReviewsInfinite(
    userId,
    filter,
    sort,
    timeRange
  );

  // 필터가 변경될 때만 스크롤을 맨 위로 이동
  React.useEffect(() => {
    if (previousFilterRef.current !== filter) {
      if (previousFilterRef.current !== undefined) {
        // 필터가 변경된 경우에만 맨 위로 스크롤
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        }, 50);
      }
      previousFilterRef.current = filter;
    }
  }, [filter]);

  const handleReviewPress = (review: any) => {
    // TODO: 리뷰 상세 페이지 네비게이션
    console.log('Review pressed:', review);
  };

  // 자동으로 모든 페이지 로드
  React.useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderReviewItem = ({ item: review }: { item: any }) => (
    <View style={styles.reviewItemContainer}>
      <ReviewCard review={review} onPress={() => handleReviewPress(review)} />
    </View>
  );

  if (reviews.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={reviews}
      renderItem={renderReviewItem}
      keyExtractor={item => item.id.toString()}
      numColumns={1}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      nestedScrollEnabled={true}
      contentContainerStyle={styles.reviewsContainer}
      ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
      removeClippedSubviews={false}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
    />
  );
};

// 메인 ReviewsSection 컴포넌트
interface ReviewsSectionProps {
  userId: number;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ userId }) => {
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(DEFAULT_FILTER);
  const [selectedSort, setSelectedSort] = useState<string>(DEFAULT_SORT);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(DEFAULT_TIME_RANGE);

  return (
    <View style={styles.container}>
      {/* 필터 메뉴 */}
      <Suspense fallback={<LoadingSpinner />}>
        <FilterMenu
          userId={userId}
          selectedFilter={selectedFilter}
          selectedSort={selectedSort}
          selectedTimeRange={selectedTimeRange}
          onFilterChange={setSelectedFilter}
          onSortChange={setSelectedSort}
          onTimeRangeChange={setSelectedTimeRange}
        />
      </Suspense>

      {/* 리뷰 목록 */}
      <Suspense fallback={<LoadingSpinner />}>
        <ReviewsList
          key={`${selectedFilter || 'undefined'}_${selectedSort}_${selectedTimeRange}`}
          userId={userId}
          filter={selectedFilter}
          sort={selectedSort}
          timeRange={selectedTimeRange}
        />
      </Suspense>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // FilterMenu 스타일 (ReadBooksSection과 완전히 동일)
  filterContainer: {
    backgroundColor: 'white',
    paddingTop: 2,
    paddingBottom: 4,
  },
  statusContainer: {
    paddingBottom: 8,
  },
  statusScrollView: {
    paddingHorizontal: 20,
  },
  statusScrollContent: {
    paddingRight: 20,
  },
  statusFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32, // ReadBooksSection과 동일
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    marginRight: 8,
    flexShrink: 0,
  },
  statusFilterButtonActive: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  statusFilterText: {
    fontSize: 14, // ReadBooksSection과 동일
    fontWeight: '500',
    color: '#6B7280',
  },
  statusFilterTextActive: {
    color: '#1D4ED8',
  },
  statusFilterBadge: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 4,
  },
  statusFilterBadgeText: {
    fontSize: 11,
    color: '#6B7280',
  },

  // SortDropdown 스타일 (ReadBooksSection과 완전히 동일)
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
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
    borderColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
    minHeight: 32,
  },
  sortButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  sortButtonIcon: {
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  sortButtonText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 5,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#1D4ED8',
  },

  // BottomSheet 스타일
  bottomSheetContent: {
    padding: 16,
  },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  bottomSheetItemActive: {
    backgroundColor: '#EFF6FF',
  },
  bottomSheetItemIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bottomSheetItemText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  bottomSheetItemTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },

  // 리뷰 목록 스타일 (ReadBooksSection과 동일)
  reviewsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  reviewItemContainer: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
  },
});
