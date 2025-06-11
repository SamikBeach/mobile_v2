import React, { Suspense } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { LoadingSpinner } from './LoadingSpinner';
import { SearchResult } from '../apis/search/types';
import { SearchItem } from './SearchItem';
import { RecentSearchList } from './RecentSearchList';
import { PopularSearchList } from './PopularSearchList';
import {
  useRecentSearches,
  useDeleteAllRecentSearches,
  useDeleteRecentSearch,
} from '../hooks/useRecentSearches';
import { usePopularSearches } from '../hooks/usePopularSearches';
import { useLogBookSelection } from '../hooks/useSearchQuery';

interface SearchResultsProps {
  query: string;
  view: 'recent' | 'results';
  onItemPress: (item: any) => void;
  setQuery: (query: string) => void;
  searchResults: SearchResult[];
  isLoading: boolean;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  totalResults?: number;
  onScroll?: (event: any) => void;
}

function RecentSearches({
  onItemPress,
  setQuery,
}: Pick<SearchResultsProps, 'onItemPress' | 'setQuery'>) {
  const { data: recentSearchData } = useRecentSearches();
  const { mutate: deleteAllRecentSearches } = useDeleteAllRecentSearches();
  const { mutate: deleteRecentSearch } = useDeleteRecentSearch();

  const recentSearches = recentSearchData?.books || [];

  return (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* 최근 검색 목록 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Clock size={16} color='#6B7280' />
            <Text style={styles.sectionTitle}>최근 검색 기록</Text>
          </View>
          {recentSearches.length > 0 && (
            <Text style={styles.deleteAllButton} onPress={() => deleteAllRecentSearches()}>
              전체 삭제
            </Text>
          )}
        </View>

        {recentSearches.length > 0 ? (
          <RecentSearchList
            searches={recentSearches}
            onItemPress={onItemPress}
            onDeleteSearch={(searchId: number) => {
              deleteRecentSearch(searchId);
            }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>최근 검색 기록이 없습니다.</Text>
          </View>
        )}
      </View>

      {/* 인기 검색어 */}
      <Suspense fallback={<PopularSearchesSkeleton />}>
        <PopularSearchesContent
          onSearchPress={(term: string) => {
            setQuery(term);
          }}
        />
      </Suspense>
    </ScrollView>
  );
}

// 인기 검색어 스켈레톤
function PopularSearchesSkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>인기 검색어 로딩 중...</Text>
      </View>
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    </View>
  );
}

// 인기 검색어 컴포넌트
function PopularSearchesContent({ onSearchPress }: { onSearchPress: (term: string) => void }) {
  const { data: popularSearches } = usePopularSearches();

  return <PopularSearchList popularSearches={popularSearches} onSearchPress={onSearchPress} />;
}

// 검색 결과 컴포넌트
export function SearchResults({
  query,
  view,
  onItemPress,
  setQuery,
  searchResults,
  isLoading,
  totalResults,
  onScroll,
}: SearchResultsProps) {
  const { mutate: logSelection } = useLogBookSelection();

  // 검색 아이템 클릭 시 검색어 저장
  const handleItemPress = (item: any) => {
    // 책 선택 로그 저장 - 백엔드에서 자동으로 검색어도 함께 저장
    if (query) {
      logSelection({
        term: query,
        bookId: item.bookId,
        title: item.title,
        author: item.author || '',
        coverImage: item.image || '',
        publisher: item.publisher || '',
        description: item.description || '',
        isbn: item.isbn || '',
        isbn13: item.isbn13 || '',
      });
    }

    // 부모 컴포넌트에 아이템 클릭 이벤트 전달
    onItemPress(item);
  };

  // 최근 검색 화면
  if (view === 'recent') {
    return <RecentSearches onItemPress={handleItemPress} setQuery={setQuery} />;
  }

  // 검색 결과 로딩 중 (첫 로딩만 전체 화면 로딩 표시)
  if (isLoading && searchResults.length === 0) {
    return (
      <View style={styles.loadingScreen}>
        <LoadingSpinner />
      </View>
    );
  }

  // 검색어 입력 후 결과가 없는 경우에만 없음 메시지 표시
  const hasNoResults = searchResults.length === 0 && query.trim() !== '';

  // 검색 결과 없음
  if (hasNoResults) {
    return (
      <View style={styles.emptyResultsContainer}>
        <View style={styles.emptyResultsContent}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>📚</Text>
          </View>
          <Text style={styles.emptyResultsTitle}>검색 결과가 없습니다</Text>
          <Text style={styles.emptyResultsSubtitle}>다른 검색어로 시도해보세요</Text>
        </View>
      </View>
    );
  }

  // 검색 결과 목록
  return (
    <View style={styles.resultsWrapper}>
      {/* 검색 결과 헤더 - 상단 고정 */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsHeaderText}>
          &quot;{query}&quot; 검색 결과
          {totalResults ? ` (${totalResults})` : ''}
        </Text>
      </View>

      {/* 스크롤 가능한 검색 결과 */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.resultsContainer}>
          {searchResults.map(book => {
            // ISBN13 또는 ISBN을 우선 사용하고, 둘 다 없는 경우 인덱스를 포함한 고유 키 생성
            const bookKey = (book?.isbn13 ?? '') + (book?.isbn ?? '') + book.title;

            return (
              <SearchItem
                key={bookKey}
                item={{
                  id: book.id,
                  bookId: book.bookId,
                  type: 'book',
                  title: book.title,
                  author: book.author,
                  image: book.coverImage,
                  coverImage: book.coverImage,
                  coverImageWidth: book.coverImageWidth,
                  coverImageHeight: book.coverImageHeight,
                  highlight: query,
                  rating: book.rating,
                  reviews: book.reviews,
                  totalRatings: book.totalRatings,
                  isbn: book.isbn || '',
                  isbn13: book.isbn13 || '',
                  readingStats: book.readingStats,
                  userReadingStatus: book.userReadingStatus,
                  userRating: book.userRating,
                }}
                onPress={() =>
                  handleItemPress({
                    id: book.id,
                    bookId: book.bookId,
                    title: book.title,
                    author: book.author,
                    image: book.coverImage,
                    coverImage: book.coverImage,
                    isbn: book.isbn,
                    isbn13: book.isbn13,
                    rating: book.rating,
                    reviews: book.reviews,
                    totalRatings: book.totalRatings,
                    readingStats: book.readingStats,
                    userReadingStatus: book.userReadingStatus,
                  })
                }
                query={query}
              />
            );
          })}
          {isLoading && (
            <View style={styles.loadMoreContainer}>
              <LoadingSpinner />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  resultsWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 8,
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  deleteAllButton: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResultsContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyResultsTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyResultsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  resultsHeader: {
    backgroundColor: 'white',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultsHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  resultsContainer: {
    backgroundColor: 'white',
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
