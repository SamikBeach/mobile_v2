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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Star,
  Users,
  Bookmark,
  Clock,
  Calendar,
  ArrowDownAZ,
  ChevronDown,
  CalendarClock,
} from 'lucide-react-native';
import { ReadingStatusType } from '../../../apis/reading-status/types';
import { UserBooksSortOptions, TimeRangeOptions } from '../../../apis/user/types';
import { getUserBooks, getUserReadingStatusCounts } from '../../../apis/user/user';
import { RootStackParamList } from '../../../navigation/types';

import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { BookCard } from '../../../components/BookCard';

// Navigation type
type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Lucide 아이콘들을 컴포넌트로 래핑
const StarIcon = ({ size = 14, color = '#6B7280' }) => <Star size={size} color={color} />;
const ChevronDownIcon = ({ size = 12, color = '#6B7280' }) => (
  <ChevronDown size={size} color={color} />
);
const CalendarIcon = ({ size = 14, color = '#6B7280' }) => <Calendar size={size} color={color} />;
const ClockIcon = ({ size = 14, color = '#6B7280' }) => <Clock size={size} color={color} />;
const UsersIcon = ({ size = 14, color = '#6B7280' }) => <Users size={size} color={color} />;
const BookmarkIcon = ({ size = 14, color = '#6B7280' }) => <Bookmark size={size} color={color} />;
const ArrowDownAZIcon = ({ size = 14, color = '#6B7280' }) => (
  <ArrowDownAZ size={size} color={color} />
);
const CalendarClockIcon = ({ size = 14, color = '#6B7280' }) => (
  <CalendarClock size={size} color={color} />
);

// 정렬 옵션 정의 (src_frontend와 동일)
const userBooksSortOptions = [
  {
    id: UserBooksSortOptions.RATING_DESC,
    label: '평점 높은순',
    icon: (isActive: boolean) => <StarIcon size={14} color={isActive ? '#2563EB' : '#FFAB00'} />,
    supportsTimeRange: true,
  },
  {
    id: UserBooksSortOptions.REVIEWS_DESC,
    label: '리뷰 많은순',
    icon: (isActive: boolean) => <UsersIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />,
    supportsTimeRange: true,
  },
  {
    id: UserBooksSortOptions.LIBRARY_COUNT_DESC,
    label: '서재에 많이 담긴 순',
    icon: (isActive: boolean) => (
      <BookmarkIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />
    ),
    supportsTimeRange: true,
  },
  {
    id: UserBooksSortOptions.CREATED_AT_DESC,
    label: '최근 읽은 순',
    icon: (isActive: boolean) => <ClockIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />,
    supportsTimeRange: true,
  },
  {
    id: UserBooksSortOptions.PUBLISH_DATE_DESC,
    label: '출간일 최신순',
    icon: (isActive: boolean) => (
      <CalendarIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />
    ),
  },
  {
    id: UserBooksSortOptions.TITLE_ASC,
    label: '제목 가나다순',
    icon: (isActive: boolean) => (
      <ArrowDownAZIcon size={14} color={isActive ? '#2563EB' : '#6B7280'} />
    ),
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

// 독서 상태 필터 (src_frontend와 동일한 순서)
const readingStatusFilters = [
  { id: 'ALL', name: '전체', type: undefined },
  {
    id: 'WANT_TO_READ',
    name: '읽고 싶어요',
    type: ReadingStatusType.WANT_TO_READ,
  },
  {
    id: 'READING',
    name: '읽는중',
    type: ReadingStatusType.READING,
  },
  {
    id: 'READ',
    name: '읽었어요',
    type: ReadingStatusType.READ,
  },
];

// 기본값 정의 (src_frontend와 동일)
const DEFAULT_STATUS = undefined;
const DEFAULT_SORT = UserBooksSortOptions.RATING_DESC;
const DEFAULT_TIME_RANGE = TimeRangeOptions.ALL;

// LoadingSpinner 컴포넌트 (스타일 정의 전에 간단하게 정의)
const LoadingSpinner: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
    <ActivityIndicator size='small' color='#2563EB' />
  </View>
);

// 읽기 상태 카운트 조회 Hook
const useReadingStatusCounts = (userId: number) => {
  const { data, isLoading } = useSuspenseQuery({
    queryKey: ['user-reading-status-counts', userId],
    queryFn: () => getUserReadingStatusCounts(userId),
  });

  return {
    statusCounts: data || {
      WANT_TO_READ: 0,
      READING: 0,
      read: 0,
      total: 0,
    },
    isLoading,
  };
};

// 사용자 책 목록 조회 Hook (무한 스크롤)
const useUserBooks = (
  userId: number,
  status?: ReadingStatusType,
  sort: string = DEFAULT_SORT,
  timeRange: string = DEFAULT_TIME_RANGE
) => {
  const PAGE_SIZE = 12;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey: ['user-books', userId, status, sort, timeRange],
    queryFn: async ({ pageParam = 1 }) => {
      return getUserBooks(userId, status, pageParam, PAGE_SIZE);
    },
    getNextPageParam: lastPage => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // 모든 페이지의 책 목록을 하나의 배열로 병합
  const books =
    data?.pages.flatMap(page =>
      page.items.map(item => ({
        id: item.book.id,
        title: item.book.title,
        author: item.book.author,
        coverImage: item.book.coverImage,
        isbn: item.book.isbn,
        isbn13: item.book.isbn13,
        publisher: item.book.publisher,
        rating: item.book.rating || 0,
        reviews: item.book.reviews || 0,
        totalRatings: item.book.totalRatings,
        description: item.book.description || '',
        status: item.status,
        currentPage: item.currentPage,
        startDate: item.startDate,
        finishDate: item.finishDate,
        createdAt: item.createdAt,
      }))
    ) || [];

  const total = data?.pages[0]?.total || 0;

  return {
    books,
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

  const selectedSortOption = userBooksSortOptions.find(opt => opt.id === selectedSort);
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
          {userBooksSortOptions.map(option => {
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

// FilterMenu 컴포넌트 (PopularScreen 스타일로 완전히 재작성)
interface FilterMenuProps {
  userId: number;
  selectedStatus: ReadingStatusType | undefined;
  selectedSort: string;
  selectedTimeRange: string;
  onStatusChange: (status: ReadingStatusType | undefined) => void;
  onSortChange: (sort: string) => void;
  onTimeRangeChange: (range: string) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  userId,
  selectedStatus,
  selectedSort,
  selectedTimeRange,
  onStatusChange,
  onSortChange,
  onTimeRangeChange,
}) => {
  const { statusCounts } = useReadingStatusCounts(userId);

  const getCountForStatus = (statusType: ReadingStatusType | undefined) => {
    if (!statusCounts) return 0;
    if (!statusType) return statusCounts.total || 0;
    return statusCounts[statusType] || 0;
  };

  const showTimeRangeFilter = [
    UserBooksSortOptions.RATING_DESC,
    UserBooksSortOptions.REVIEWS_DESC,
    UserBooksSortOptions.LIBRARY_COUNT_DESC,
    UserBooksSortOptions.CREATED_AT_DESC,
  ].includes(selectedSort as UserBooksSortOptions);

  return (
    <View style={styles.filterContainer}>
      {/* 독서 상태 필터 */}
      <View style={styles.statusContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusScrollView}
          contentContainerStyle={styles.statusScrollContent}
        >
          {readingStatusFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.statusFilterButton,
                selectedStatus === filter.type && styles.statusFilterButtonActive,
              ]}
              onPress={() => onStatusChange(filter.type)}
            >
              <Text
                style={[
                  styles.statusFilterText,
                  selectedStatus === filter.type && styles.statusFilterTextActive,
                ]}
              >
                {filter.name}
              </Text>
              <View style={styles.statusFilterBadge}>
                <Text style={styles.statusFilterBadgeText}>{getCountForStatus(filter.type)}</Text>
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
    <Text style={styles.emptyText}>책 목록이 없습니다</Text>
    <Text style={styles.emptyDescription}>아직 등록된 책이 없습니다. 책을 추가해보세요.</Text>
  </View>
);

// 책 목록 컴포넌트 (PopularScreen과 동일한 horizontal 레이아웃)
interface BooksListProps {
  userId: number;
  status: ReadingStatusType | undefined;
  sort: string;
  timeRange: string;
}

const BooksList: React.FC<BooksListProps> = ({ userId, status, sort, timeRange }) => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const previousStatusRef = useRef<ReadingStatusType | undefined>(status);

  const { books, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserBooks(
    userId,
    status,
    sort,
    timeRange
  );

  // 상태가 변경될 때만 스크롤을 맨 위로 이동
  React.useEffect(() => {
    if (previousStatusRef.current !== status) {
      if (previousStatusRef.current !== undefined) {
        // 상태가 변경된 경우에만 맨 위로 스크롤
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        }, 50);
      }
      previousStatusRef.current = status;
    }
  }, [status]);

  const handleBookSelect = (book: any) => {
    navigation.navigate('BookDetail', { isbn: book.isbn, title: book.title });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // PopularScreen과 동일한 renderBookItem
  const renderBookItem = ({ item: book }: { item: any }) => (
    <BookCard book={book} onPress={() => handleBookSelect(book)} horizontal={true} />
  );

  if (books.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={books}
      renderItem={renderBookItem}
      keyExtractor={item => item.id.toString()}
      numColumns={1}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.booksContainer}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
      removeClippedSubviews={false}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 100,
      }}
    />
  );
};

// 메인 ReadBooks 컴포넌트
interface ReadBooksSectionProps {
  userId: number;
}

export const ReadBooksSection: React.FC<ReadBooksSectionProps> = ({ userId }) => {
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatusType | undefined>(
    DEFAULT_STATUS
  );
  const [selectedSort, setSelectedSort] = useState<string>(DEFAULT_SORT);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(DEFAULT_TIME_RANGE);

  return (
    <View style={styles.container}>
      {/* 필터 메뉴 */}
      <Suspense fallback={<LoadingSpinner />}>
        <FilterMenu
          userId={userId}
          selectedStatus={selectedStatus}
          selectedSort={selectedSort}
          selectedTimeRange={selectedTimeRange}
          onStatusChange={setSelectedStatus}
          onSortChange={setSelectedSort}
          onTimeRangeChange={setSelectedTimeRange}
        />
      </Suspense>

      {/* 책 목록 */}
      <Suspense fallback={<LoadingSpinner />}>
        <BooksList
          key={`${selectedStatus || 'undefined'}_${selectedSort}_${selectedTimeRange}`}
          userId={userId}
          status={selectedStatus}
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

  // FilterMenu 스타일 (PopularScreen과 동일)
  filterContainer: {
    backgroundColor: 'white',
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    height: 32, // PopularScreen의 subcategoryButton과 동일
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
    fontSize: 14, // PopularScreen과 동일
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

  // SortDropdown 스타일 (PopularScreen과 동일)
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

  // 책 목록 스타일 (PopularScreen과 동일)
  booksContainer: {
    paddingVertical: 16,
    paddingBottom: 100,
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
