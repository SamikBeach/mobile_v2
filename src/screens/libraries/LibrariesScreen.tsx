import React, { useState, useCallback, useRef, useMemo } from 'react';
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
  TextInput,
} from 'react-native';
import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Clock, Flame, Library, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner, LibraryCard } from '../../components';
import { CreateLibraryBottomSheet } from '../../components/CreateLibraryBottomSheet';
import { getLibraries, getLibraryTags, LibraryListItem } from '../../apis/library';
import { SortBottomSheet } from './components/SortBottomSheet';
import { TimeRangeBottomSheet } from './components/TimeRangeBottomSheet';
import { AppColors } from '../../constants';

// Sort options
const sortOptions = [
  { value: 'popular', label: '인기순', icon: Flame },
  { value: 'books', label: '담긴 책 많은 순', icon: Library },
  { value: 'latest', label: '최신순', icon: Clock },
];

// Get sort icon based on sort option
const getSortIcon = (sortOption: string, isActive: boolean) => {
  const color = isActive ? '#1D4ED8' : '#6B7280';
  const size = 12;

  switch (sortOption) {
    case 'popular':
      return <Flame size={size} color={color} />;
    case 'books':
      return <Library size={size} color={color} />;
    case 'latest':
      return <Clock size={size} color={color} />;
    default:
      return <Flame size={size} color={color} />;
  }
};

// Time range options
const timeRangeOptions = [
  { value: 'all', label: '전체 기간' },
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'year', label: '올해' },
];

// Tag Filter Component
const TagFilter = ({
  selectedTag,
  onTagPress,
  tags,
}: {
  selectedTag: string;
  onTagPress: (tag: string) => void;
  tags: any[];
}) => {
  // src_frontend와 동일한 파스텔 색상 배열
  const tagColors = [
    '#FFF8E2', // 파스텔 옐로우
    '#F2E2FF', // 파스텔 퍼플
    '#FFE2EC', // 파스텔 코럴
    '#E2FFFC', // 파스텔 민트
    '#E2F0FF', // 파스텔 블루
    '#FFECDA', // 파스텔 오렌지
    '#ECFFE2', // 파스텔 그린
    '#FFE2F7', // 파스텔 핑크
  ];

  return (
    <View style={styles.tagContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagScrollView}
        contentContainerStyle={styles.tagScrollContent}
      >
        {/* 전체 태그 */}
        <TouchableOpacity
          style={[
            styles.tagButton,
            {
              backgroundColor: selectedTag === 'all' ? '#111827' : '#E2E8F0',
            },
          ]}
          onPress={() => onTagPress('all')}
        >
          <Text
            style={[
              styles.tagButtonText,
              {
                color: selectedTag === 'all' ? 'white' : '#374151',
              },
            ]}
          >
            전체
          </Text>
        </TouchableOpacity>

        {/* 동적 태그들 */}
        {tags.map((tag, index) => {
          const backgroundColor =
            selectedTag === String(tag.id)
              ? '#111827'
              : tagColors[index % tagColors.length] || '#F9FAFB';

          return (
            <TouchableOpacity
              key={tag.id}
              style={[styles.tagButton, { backgroundColor }]}
              onPress={() => onTagPress(String(tag.id))}
            >
              <Text
                style={[
                  styles.tagButtonText,
                  {
                    color: selectedTag === String(tag.id) ? 'white' : '#374151',
                  },
                ]}
              >
                {tag.tagName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Search Bar Component
const SearchBar = ({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchInputContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder='서재 검색...'
        placeholderTextColor='#9CA3AF'
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  </View>
);

// Sort Filter Component
const SortFilter = ({
  selectedSort,
  timeRange,
  onSortPress,
  onTimeRangePress,
}: {
  selectedSort: string;
  timeRange: string;
  onSortPress: () => void;
  onTimeRangePress: () => void;
}) => (
  <View style={styles.sortContainer}>
    <TouchableOpacity
      style={[styles.sortButton, timeRange !== 'all' && styles.activeSortButton]}
      onPress={onTimeRangePress}
    >
      <Calendar size={14} color={timeRange !== 'all' ? '#1D4ED8' : '#6B7280'} />
      <Text style={[styles.sortButtonText, timeRange !== 'all' && styles.activeSortButtonText]}>
        {timeRangeOptions.find(opt => opt.value === timeRange)?.label || '전체 기간'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.sortButton, selectedSort !== 'popular' && styles.activeSortButton]}
      onPress={onSortPress}
    >
      {getSortIcon(selectedSort, selectedSort !== 'popular')}
      <Text
        style={[styles.sortButtonText, selectedSort !== 'popular' && styles.activeSortButtonText]}
      >
        {sortOptions.find(opt => opt.value === selectedSort)?.label || '인기순'}
      </Text>
    </TouchableOpacity>
  </View>
);

// Loading Skeleton Component
const LibrariesScreenSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.headerContainer}>
      <View style={styles.filterContainer}>
        <TagFilter selectedTag='all' onTagPress={() => {}} tags={[]} />
        <View style={styles.searchAndSortContainer}>
          <SearchBar value='' onChangeText={() => {}} />
          <SortFilter
            selectedSort='popular'
            timeRange='all'
            onSortPress={() => {}}
            onTimeRangePress={() => {}}
          />
        </View>
      </View>
    </View>
    <View style={styles.loadingContainer}>
      <LoadingSpinner />
    </View>
  </View>
);

// Main Libraries Screen Component
export const LibrariesScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  // State - 모든 hooks를 최상단에 위치
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [timeRange, setTimeRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortBottomSheet, setShowSortBottomSheet] = useState(false);
  const [showTimeRangeBottomSheet, setShowTimeRangeBottomSheet] = useState(false);
  const [showCreateLibraryBottomSheet, setShowCreateLibraryBottomSheet] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(120);

  // Animation for filter visibility
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');

  // Tags query
  const { data: tags = [] } = useQuery({
    queryKey: ['library-tags'],
    queryFn: async () => {
      const result = await getLibraryTags(50);
      return result || [];
    },
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 15 * 60 * 1000, // 15분
  });

  // Libraries query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: librariesLoading,
    error: librariesError,
  } = useInfiniteQuery({
    queryKey: ['libraries', selectedTag, selectedSort, timeRange, searchQuery],
    queryFn: ({ pageParam = 1 }) =>
      getLibraries({
        page: pageParam,
        limit: 12,
        tagFilter: selectedTag === 'all' ? undefined : selectedTag,
        sort: selectedSort,
        timeRange: timeRange,
        search: searchQuery || undefined,
      }),
    getNextPageParam: lastPage => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

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

  // All handlers and logic from LibrariesContent
  const handleTagPress = useCallback((tag: string) => {
    setSelectedTag(tag);
  }, []);

  const handleSortPress = useCallback(() => {
    setShowSortBottomSheet(true);
  }, []);

  const handleTimeRangePress = useCallback(() => {
    setShowTimeRangeBottomSheet(true);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSelectedSort(sort);
  }, []);

  const handleTimeRangeChange = useCallback((range: string) => {
    setTimeRange(range);
  }, []);

  const handleLibraryPress = useCallback(
    (library: LibraryListItem) => {
      (navigation as any).navigate('LibraryDetail', { libraryId: library.id });
    },
    [navigation]
  );

  const handleCreateLibrary = useCallback(() => {
    setShowCreateLibraryBottomSheet(true);
  }, []);

  const handleLibraryCreated = useCallback(() => {
    // 새 서재가 생성된 후 목록 새로고침
    queryClient.invalidateQueries({ queryKey: ['libraries'] });
    setShowCreateLibraryBottomSheet(false);
  }, [queryClient]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderLibraryItem = useCallback(
    ({ item }: { item: LibraryListItem }) => (
      <View style={styles.libraryCardContainer}>
        <LibraryCard library={item} onPress={() => handleLibraryPress(item)} />
      </View>
    ),
    [handleLibraryPress]
  );

  // 모든 데이터 계산도 hooks 이후에
  const libraries = useMemo(() => {
    const allLibraries = data?.pages.flatMap(page => page.data) || [];
    // ID 중복 제거
    const uniqueLibraries = allLibraries.filter(
      (library, index, self) => self.findIndex(l => l.id === library.id) === index
    );
    return uniqueLibraries;
  }, [data]);

  // 모든 hooks 호출 후 조건부 렌더링
  if (librariesLoading && !libraries.length) {
    return <LibrariesScreenSkeleton />;
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
        {/* Filter Header */}
        <View style={styles.filterContainer}>
          <TagFilter selectedTag={selectedTag} onTagPress={handleTagPress} tags={tags} />

          {/* Search Bar and Sort Filter Row */}
          <View style={styles.searchAndSortContainer}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            <SortFilter
              selectedSort={selectedSort}
              timeRange={timeRange}
              onSortPress={handleSortPress}
              onTimeRangePress={handleTimeRangePress}
            />
          </View>
        </View>
      </Animated.View>

      {/* Content List */}
      <FlatList
        data={libraries}
        renderItem={renderLibraryItem}
        keyExtractor={(item, index) => `library-${item.id}-${index}`}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight + 16 }]}
        style={styles.flatListStyle}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          librariesError ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>😔</Text>
              <Text style={styles.emptyTitle}>서재를 불러올 수 없습니다</Text>
              <Text style={styles.emptySubtitle}>잠시 후 다시 시도해주세요</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📚</Text>
              <Text style={styles.emptyTitle}>서재가 없습니다</Text>
              <Text style={styles.emptySubtitle}>첫 번째 서재를 만들어보세요!</Text>
            </View>
          )
        }
        ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateLibrary}>
        <Plus size={24} color='white' />
      </TouchableOpacity>

      {/* Bottom Sheets */}
      <SortBottomSheet
        visible={showSortBottomSheet}
        onClose={() => setShowSortBottomSheet(false)}
        selectedSort={selectedSort}
        onSortChange={handleSortChange}
        sortOptions={sortOptions}
      />

      <TimeRangeBottomSheet
        visible={showTimeRangeBottomSheet}
        onClose={() => setShowTimeRangeBottomSheet(false)}
        selectedTimeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        timeRangeOptions={timeRangeOptions}
      />

      <CreateLibraryBottomSheet
        isVisible={showCreateLibraryBottomSheet}
        onClose={() => setShowCreateLibraryBottomSheet(false)}
        onSuccess={handleLibraryCreated}
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
  filterContainer: {
    backgroundColor: 'white',
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tagContainer: {
    paddingBottom: 8,
  },
  tagScrollView: {
    paddingHorizontal: 16,
  },
  tagScrollContent: {
    paddingRight: 16,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchAndSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    position: 'relative',
    width: '100%',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#374151',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 40,
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
    borderColor: '#E5E7EB',
    backgroundColor: '#F8F9FA',
    minHeight: 32,
  },
  sortButtonText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 5,
    fontWeight: '500',
  },
  activeSortButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  activeSortButtonText: {
    color: '#1D4ED8',
  },
  flatListStyle: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16, // px-2 md:px-4 similar to frontend
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  libraryCardContainer: {
    // No flex: 1 for single column layout
    paddingHorizontal: 0, // No additional padding
    paddingVertical: 0, // No additional padding
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 8,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
