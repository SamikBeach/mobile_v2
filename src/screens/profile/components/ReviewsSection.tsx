import React, { useState, Suspense, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { getUserReviews, getUserReviewTypeCounts } from '../../../apis/user/user';
import { ReviewCard } from '../../../components/Review/ReviewCard';
import { LoadingSpinner } from '../../../components';

// 리뷰 필터 (src_frontend와 동일한 순서)
const reviewFilters = [
  { id: 'ALL', name: '전체', type: undefined },
  { id: 'REVIEW', name: '리뷰', type: 'review' },
  { id: 'RATING', name: '별점만', type: 'rating' },
];

// 기본값 정의 (src_frontend와 동일)
const DEFAULT_FILTER = undefined;
const DEFAULT_SORT = 'recent';
const DEFAULT_TIME_RANGE = 'all';

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

// FilterMenu 컴포넌트 (정렬 필터 제거됨)
interface FilterMenuProps {
  userId: number;
  selectedFilter: string | undefined;
  onFilterChange: (filter: string | undefined) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ userId, selectedFilter, onFilterChange }) => {
  const { typeCounts } = useReviewTypeCounts(userId);

  const getCountForFilter = (filterType: string | undefined) => {
    if (!typeCounts) return 0;
    if (!filterType) return typeCounts.total || 0;
    if (filterType === 'review') return typeCounts.review || 0;
    if (filterType === 'rating') return 0; // 별점만 카운트는 별도 API 필요
    return 0;
  };

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
}

const ReviewsList: React.FC<ReviewsListProps> = ({ userId, filter }) => {
  const flatListRef = useRef<FlatList>(null);
  const previousFilterRef = useRef<string | undefined>(filter);

  const { reviews, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserReviewsInfinite(
    userId,
    filter,
    DEFAULT_SORT,
    DEFAULT_TIME_RANGE
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

  return (
    <View style={styles.container}>
      {/* 필터 메뉴 */}
      <Suspense fallback={<LoadingSpinner />}>
        <FilterMenu
          userId={userId}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </Suspense>

      {/* 리뷰 목록 */}
      <Suspense fallback={<LoadingSpinner />}>
        <ReviewsList
          key={`${selectedFilter || 'undefined'}`}
          userId={userId}
          filter={selectedFilter}
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

  // FilterMenu 스타일
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
