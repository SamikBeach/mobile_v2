import React, { useState, Suspense, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { FileText, MessageCircle, HelpCircle, Calendar, Users } from 'lucide-react-native';
import { getUserReviews, getUserReviewTypeCounts } from '../../../apis/user/user';
import { ReviewCard } from '../../../components/Review/ReviewCard';
import { LoadingSpinner } from '../../../components';
import { ReviewType } from '../../../apis/review/types';
import { UserReviewTypeCountsDto } from '../../../apis/user/types';

// Lucide 아이콘들을 컴포넌트로 래핑
const FileTextIcon = ({ size = 20, color = '#6B7280' }) => <FileText size={size} color={color} />;
const MessageCircleIcon = ({ size = 20, color = '#6B7280' }) => (
  <MessageCircle size={size} color={color} />
);
const HelpCircleIcon = ({ size = 20, color = '#6B7280' }) => (
  <HelpCircle size={size} color={color} />
);
const CalendarIcon = ({ size = 20, color = '#6B7280' }) => <Calendar size={size} color={color} />;
const UsersIcon = ({ size = 48, color = '#6B7280' }) => <Users size={size} color={color} />;

// 리뷰 타입 필터 정의 (review 타입 제외, src_frontend와 동일)
const reviewTypeFilters = [
  { id: 'all', name: '전체', type: undefined },
  { id: 'general', name: '일반', type: 'general' as ReviewType },
  { id: 'discussion', name: '토론', type: 'discussion' as ReviewType },
  { id: 'question', name: '질문', type: 'question' as ReviewType },
  { id: 'meetup', name: '모임', type: 'meetup' as ReviewType },
];

// 전체 리뷰 타입 배열 (src_frontend와 동일)
const allReviewTypes = ['general', 'discussion', 'question', 'meetup'] as ReviewType[];

// 리뷰 타입별 카운트를 로드하는 훅
const useTypeCountsLoader = (userId: number) => {
  const { data: typeCounts } = useSuspenseQuery<UserReviewTypeCountsDto>({
    queryKey: ['user-review-type-counts', userId],
    queryFn: () => getUserReviewTypeCounts(userId),
  });

  return typeCounts;
};

// 사용자 리뷰 조회 Hook (무한 스크롤, 타입별 필터링)
const useUserReviewsInfinite = (userId: number, selectedTypes: ReviewType[] | undefined) => {
  const PAGE_SIZE = 6;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey: ['user-community-reviews', userId, selectedTypes],
    queryFn: async ({ pageParam = 1 }) => {
      // TODO: API에서 타입 필터링 지원 시 파라미터 추가
      return getUserReviews(userId, pageParam, PAGE_SIZE);
    },
    getNextPageParam: lastPage => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // 모든 페이지의 리뷰 목록을 하나의 배열로 병합
  let reviews = data?.pages.flatMap(page => page.reviews || []) || [];

  // 클라이언트 사이드에서 타입 필터링 (API에서 지원하지 않는 경우)
  if (selectedTypes && selectedTypes.length > 0) {
    reviews = reviews.filter(review => selectedTypes.includes(review.type as ReviewType));
  }

  const total = data?.pages[0]?.total || 0;

  return {
    reviews,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    total,
  };
};

// 메뉴 아이템 컴포넌트
interface MenuItemProps {
  filter: (typeof reviewTypeFilters)[0];
  counts: UserReviewTypeCountsDto;
  selectedType: ReviewType | undefined;
  onSelectType: (type: ReviewType | undefined) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ filter, counts, selectedType, onSelectType }) => {
  const isSelected = selectedType === filter.type;

  // 필터 타입의 키 (all 또는 타입 이름)
  const filterKey = filter.id === 'all' ? 'total' : filter.id;

  // 해당 타입의 카운트 계산 (all인 경우 total에서 review 타입 제외)
  let count = 0;
  if (filter.id === 'all') {
    // 전체 카운트 = 총합에서 review 타입 제외
    count = (counts.total || 0) - (counts.review || 0);
  } else {
    // 개별 타입 카운트
    count = counts[filterKey as keyof UserReviewTypeCountsDto] || 0;
  }

  return (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isSelected ? styles.filterButtonActive : styles.filterButtonInactive,
      ]}
      onPress={() => onSelectType(filter.type)}
    >
      <Text
        style={[
          styles.filterButtonText,
          isSelected ? styles.filterButtonTextActive : styles.filterButtonTextInactive,
        ]}
      >
        {filter.name}
      </Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
};

// 필터 메뉴 컴포넌트
interface FilterMenuProps {
  userId: number;
  selectedType: ReviewType | undefined;
  onSelectType: (type: ReviewType | undefined) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({ userId, selectedType, onSelectType }) => {
  const typeCounts = useTypeCountsLoader(userId);

  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterMenu}>
        {reviewTypeFilters.map(filter => (
          <MenuItem
            key={filter.id}
            filter={filter}
            counts={typeCounts}
            selectedType={selectedType}
            onSelectType={onSelectType}
          />
        ))}
      </View>
    </View>
  );
};

// 빈 상태 컴포넌트
interface EmptyStateProps {
  type: ReviewType | undefined;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  // 타입별 메시지 및 아이콘 설정
  let title = '커뮤니티 활동이 없습니다';
  let description = '아직 커뮤니티 활동이 없습니다. 독서방에 참여하고 다양한 활동을 해보세요.';
  let icon = <UsersIcon size={48} color='#D1D5DB' />;

  if (type === 'general') {
    title = '일반 게시글이 없습니다';
    description = '아직 일반 게시글이 없습니다. 독서 경험이나 생각을 자유롭게 공유해보세요.';
    icon = <FileTextIcon size={48} color='#D1D5DB' />;
  } else if (type === 'discussion') {
    title = '토론 게시글이 없습니다';
    description =
      '아직 토론 게시글이 없습니다. 책에 대한 다양한 토론 주제를 공유하고 의견을 나눠보세요.';
    icon = <MessageCircleIcon size={48} color='#D1D5DB' />;
  } else if (type === 'question') {
    title = '질문 게시글이 없습니다';
    description =
      '아직 질문 게시글이 없습니다. 책에 대한 궁금한 점을 질문하고 다른 독자들의 답변을 들어보세요.';
    icon = <HelpCircleIcon size={48} color='#D1D5DB' />;
  } else if (type === 'meetup') {
    title = '모임 게시글이 없습니다';
    description = '아직 모임 게시글이 없습니다. 함께 책을 읽고 이야기 나눌 모임을 만들어보세요.';
    icon = <CalendarIcon size={48} color='#D1D5DB' />;
  }

  return (
    <View style={styles.emptyContainer}>
      {icon}
      <Text style={styles.emptyText}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
};

// 리뷰 목록 컴포넌트
interface ReviewListProps {
  userId: number;
  selectedType: ReviewType | undefined;
}

const ReviewList: React.FC<ReviewListProps> = ({ userId, selectedType }) => {
  const flatListRef = useRef<FlatList>(null);

  // 선택된 타입에 따라 API 호출에 전달할 타입 배열 생성

  const { reviews, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserReviewsInfinite(
    userId,
    selectedType ? [selectedType] : allReviewTypes
  );

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
    return <EmptyState type={selectedType} />;
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
    />
  );
};

// 필터와 콘텐츠를 함께 로드하는 내부 컴포넌트
interface FilterAndContentLoaderProps {
  userId: number;
}

const FilterAndContentLoader: React.FC<FilterAndContentLoaderProps> = ({ userId }) => {
  const [selectedType, setSelectedType] = useState<ReviewType | undefined>(undefined);

  return (
    <View style={styles.container}>
      {/* 필터 메뉴 */}
      <Suspense fallback={<LoadingSpinner />}>
        <FilterMenu userId={userId} selectedType={selectedType} onSelectType={setSelectedType} />
      </Suspense>

      {/* 리뷰 리스트 영역 - 메뉴 선택에 따라 이 부분만 다시 로드됨 */}
      <Suspense fallback={<LoadingSpinner />}>
        <ReviewList key={selectedType || 'undefined'} userId={userId} selectedType={selectedType} />
      </Suspense>
    </View>
  );
};

// 메인 CommunitySection 컴포넌트
interface CommunitySectionProps {
  userId: number;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ userId }) => {
  return <FilterAndContentLoader userId={userId} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  // 필터 메뉴 스타일 (ReadBooksSection과 동일)
  filterContainer: {
    backgroundColor: 'white',
    paddingTop: 2,
    paddingBottom: 4,
  },
  filterMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
  },
  filterButtonActive: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  filterButtonInactive: {
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#1D4ED8',
  },
  filterButtonTextInactive: {
    color: '#6B7280',
  },
  countBadge: {
    marginLeft: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },

  // 리뷰 목록 스타일 (ReviewsSection과 동일)
  reviewsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  reviewItemContainer: {
    marginBottom: 16,
  },

  // 빈 상태 스타일 (ReviewsSection과 동일)
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
