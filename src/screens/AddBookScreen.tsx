import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  StyleSheet,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useNavigation, type RouteProp, useRoute } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, X, Check, Star, MessageSquare, BookOpen, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';

import { RootStackParamList } from '../navigation/types';
import { searchBooks } from '../apis/search/search';
import { SearchBook } from '../apis/search/types';
import { LoadingSpinner } from '../components/LoadingSpinner';

type AddBookScreenRouteProp = RouteProp<RootStackParamList, 'AddBook'>;
type AddBookScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddBook'>;

interface SearchResultsLoaderProps {
  query: string;
  onBookSelect: (book: SearchBook) => void;
  selectedBooks: SearchBook[];
  onRemoveSelectedBook: (book: SearchBook) => void;
  getBookIdentifier: (book: SearchBook) => string;
  isBookSelected: (book: SearchBook) => boolean;
}

const SearchResultsLoader: React.FC<SearchResultsLoaderProps> = ({
  query,
  onBookSelect,
  selectedBooks,
  onRemoveSelectedBook,
  getBookIdentifier,
  isBookSelected,
}) => {
  const debouncedQuery = useDebounce(query, 300);
  const scrollViewRef = useRef<ScrollView>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['book-search', debouncedQuery],
    queryFn: ({ pageParam = 1 }) => {
      if (!debouncedQuery.trim()) {
        return Promise.resolve({ books: [], page: 1, totalPages: 0, total: 0 });
      }
      return searchBooks(debouncedQuery, pageParam, 10);
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5분
    enabled: debouncedQuery.trim() !== '',
  });

  const searchResults = data?.pages.flatMap(page => page.books) || [];
  const totalResults = data?.pages[0]?.total || 0;
  const isDebouncing = query.trim() !== debouncedQuery.trim() && query.trim() !== '';

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(
    (event: any) => {
      if (!hasNextPage || isFetchingNextPage) return;

      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
      const paddingToBottom = 200;

      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // 평점 렌더링 함수
  const renderStarRating = (rating?: number) => {
    const ratingValue = rating || 0;
    return (
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={12}
            color={i < Math.floor(ratingValue) ? '#FFAB00' : '#E5E7EB'}
            fill={i < Math.floor(ratingValue) ? '#FFAB00' : '#E5E7EB'}
          />
        ))}
      </View>
    );
  };

  // 하이라이트 텍스트 처리
  const highlightText = useCallback((text: string, highlight?: string) => {
    if (!highlight) return <Text style={styles.bookTitle}>{text}</Text>;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text style={styles.bookTitle}>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight?.toLowerCase() ? (
            <Text key={index} style={styles.highlightText}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  }, []);

  // 이미지 URL 정규화
  const normalizeImageUrl = useCallback((url?: string) => {
    if (!url) return 'https://via.placeholder.com/120x180/F3F4F6/9CA3AF?text=책';
    return url.replace(/^https?:\/\//, 'https://');
  }, []);

  // 책 아이템 렌더링
  const renderBookItem = useCallback(
    ({ item }: { item: SearchBook }) => {
      const isSelected = isBookSelected(item);
      const imageUrl = normalizeImageUrl(item.coverImage || item.image);

      return (
        <TouchableOpacity
          style={[styles.bookItem, isSelected && styles.selectedBookItem]}
          onPress={() => onBookSelect(item)}
          activeOpacity={0.7}
        >
          <View style={styles.bookImageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.bookCover}
              defaultSource={{ uri: 'https://via.placeholder.com/120x180/F3F4F6/9CA3AF?text=책' }}
            />
          </View>

          <View style={styles.bookInfo}>
            {highlightText(item.title, query)}

            {item.author && (
              <Text style={styles.bookAuthor} numberOfLines={1}>
                {item.author}
              </Text>
            )}

            <View style={styles.ratingContainer}>
              <View style={styles.ratingItem}>
                {renderStarRating(item.rating)}
                <Text style={styles.ratingText}>
                  {typeof item.rating === 'number' ? item.rating.toFixed(1) : '0.0'}
                </Text>
                <Text style={styles.ratingCount}>({item.totalRatings || 0})</Text>
              </View>

              <View style={styles.reviewsItem}>
                <MessageSquare size={12} color='#9CA3AF' />
                <Text style={styles.reviewsText}>
                  {item.reviews && item.reviews > 999
                    ? `${Math.floor(item.reviews / 1000)}k`
                    : item.reviews || 0}
                </Text>
              </View>
            </View>

            {/* 읽기 상태 배지들 */}
            {item.userReadingStatus && (
              <View style={styles.statusBadgeContainer}>
                {item.userReadingStatus === 'WANT_TO_READ' && (
                  <View style={styles.wantToReadBadge}>
                    <Clock size={12} color='#8B5CF6' />
                    <Text style={styles.wantToReadText}>읽고 싶어요</Text>
                  </View>
                )}
                {item.userReadingStatus === 'READING' && (
                  <View style={styles.readingBadge}>
                    <BookOpen size={12} color='#3B82F6' />
                    <Text style={styles.readingText}>읽는 중</Text>
                  </View>
                )}
                {item.userReadingStatus === 'READ' && (
                  <View style={styles.readBadge}>
                    <Check size={12} color='#10B981' />
                    <Text style={styles.readText}>읽었어요</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Check size={16} color='white' />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [isBookSelected, onBookSelect, highlightText, renderStarRating, normalizeImageUrl, query]
  );

  // 빈 상태 렌더링
  const renderEmptyState = () => {
    if (query.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>검색어를 입력해주세요.</Text>
        </View>
      );
    }

    if (isLoading || isDebouncing) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>📚</Text>
        </View>
        <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
        <Text style={styles.emptyText}>다른 검색어로 시도해보세요</Text>
      </View>
    );
  };

  return (
    <View style={styles.resultsContainer}>
      {/* 검색 결과 헤더 */}
      {query.length > 0 && (
        <View style={styles.searchResultsHeader}>
          <Text style={styles.searchResultsText}>
            {`${query} 검색 결과${totalResults ? ` (${totalResults})` : ''}`}
          </Text>
        </View>
      )}

      {/* 선택된 책 목록 */}
      {selectedBooks.length > 0 && (
        <View style={styles.selectedBooksSection}>
          <Text style={styles.selectedBooksTitle}>선택된 책 ({selectedBooks.length})</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedBooksScrollView}
            contentContainerStyle={styles.selectedBooksContent}
            nestedScrollEnabled={true}
          >
            {selectedBooks.map(book => (
              <View key={getBookIdentifier(book)} style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText} numberOfLines={1}>
                  {book.title}
                </Text>
                <TouchableOpacity
                  onPress={() => onRemoveSelectedBook(book)}
                  style={styles.removeBadgeButton}
                >
                  <X size={12} color='#6B7280' />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 검색 결과 */}
      {searchResults.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.resultsList}
          contentContainerStyle={styles.resultsListContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {searchResults.map((item, index) => (
            <View key={getBookIdentifier(item)}>
              {renderBookItem({ item })}
              {index < searchResults.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
          {isFetchingNextPage && (
            <View style={styles.loadingFooter}>
              <LoadingSpinner />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

// Helper function for debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const AddBookScreen: React.FC = () => {
  const route = useRoute<AddBookScreenRouteProp>();
  const navigation = useNavigation<AddBookScreenNavigationProp>();
  const { onBookSelect } = route.params || {};
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<SearchBook[]>([]);
  const inputRef = useRef<TextInput>(null);

  // 화면 열릴 때 초기화 및 포커스
  useEffect(() => {
    setSearchQuery('');
    setSelectedBooks([]);

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 화면이 닫힐 때 정리
  useEffect(() => {
    return () => {
      setSelectedBooks([]);
      setSearchQuery('');
    };
  }, []);

  // 책 고유 식별자 생성
  const getBookIdentifier = useCallback((book: SearchBook): string => {
    return `${book.isbn}-${book.isbn13}-${book.title}`;
  }, []);

  // 책 선택/해제 핸들러
  const toggleBookSelection = useCallback(
    (book: SearchBook) => {
      if (onBookSelect) {
        onBookSelect(book);
        navigation.goBack();
        return;
      }

      const bookIdentifier = getBookIdentifier(book);
      const isSelected = selectedBooks.some(
        selectedBook => getBookIdentifier(selectedBook) === bookIdentifier
      );

      if (isSelected) {
        setSelectedBooks(prev =>
          prev.filter(selectedBook => getBookIdentifier(selectedBook) !== bookIdentifier)
        );
      } else {
        setSelectedBooks(prev => [...prev, book]);
      }
    },
    [selectedBooks, getBookIdentifier, onBookSelect, navigation]
  );

  // 선택된 책 제거
  const removeSelectedBook = useCallback(
    (book: SearchBook) => {
      setSelectedBooks(prev =>
        prev.filter(selectedBook => getBookIdentifier(selectedBook) !== getBookIdentifier(book))
      );
    },
    [getBookIdentifier]
  );

  const isBookSelected = useCallback(
    (book: SearchBook) => {
      const bookIdentifier = getBookIdentifier(book);
      return selectedBooks.some(selectedBook => getBookIdentifier(selectedBook) === bookIdentifier);
    },
    [selectedBooks, getBookIdentifier]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    Keyboard.dismiss();
  }, []);

  // 검색창 닫기 핸들러
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // 책 추가 핸들러
  const handleAddBooks = useCallback(() => {
    if (selectedBooks.length === 0) {
      return;
    }

    // 여기서 실제 API 호출 로직을 구현
    // TODO: 서재에 책 추가 API 호출

    // 선택 초기화 및 화면 닫기
    setSelectedBooks([]);
    setSearchQuery('');
    navigation.goBack();
  }, [selectedBooks, navigation]);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='white' />

      <View style={styles.container}>
        {/* 검색 입력 */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color='#9CA3AF' style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder='도서 제목, 저자, ISBN 등으로 검색'
              placeholderTextColor='#9CA3AF'
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType='search'
              clearButtonMode='never'
              autoFocus
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <X size={16} color='#9CA3AF' />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleClose} style={styles.clearButton}>
                <X size={16} color='#9CA3AF' />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 검색 결과 컨테이너 */}
        <Suspense
          fallback={
            <View style={styles.fallbackContainer}>
              <LoadingSpinner />
            </View>
          }
        >
          <SearchResultsLoader
            query={searchQuery}
            onBookSelect={toggleBookSelection}
            selectedBooks={selectedBooks}
            onRemoveSelectedBook={removeSelectedBook}
            getBookIdentifier={getBookIdentifier}
            isBookSelected={isBookSelected}
          />
        </Suspense>

        {/* 하단 버튼 */}
        {selectedBooks.length > 0 && (
          <View style={[styles.footerContainer, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddBooks}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>추가하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: 'white',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 0,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchResultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  searchResultsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedBooksSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedBooksTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  selectedBooksScrollView: {
    maxHeight: 60,
    minHeight: 32,
  },
  selectedBooksContent: {
    paddingVertical: 2,
    alignItems: 'center',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    maxWidth: 160,
    minHeight: 24,
  },
  selectedBadgeText: {
    fontSize: 12,
    color: '#1E40AF',
    marginRight: 6,
    flex: 1,
    fontWeight: '500',
    lineHeight: 16,
  },
  removeBadgeButton: {
    padding: 2,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  resultsList: {
    flex: 1,
    backgroundColor: 'white',
  },
  resultsListContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 24,
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    position: 'relative',
  },
  selectedBookItem: {
    backgroundColor: '#F9FAFB',
  },
  bookImageContainer: {
    width: 80,
    height: 120,
    marginRight: 16,
  },
  bookCover: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookInfo: {
    flex: 1,
    paddingTop: 4,
    paddingRight: 32,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 4,
  },
  highlightText: {
    fontWeight: '600',
    color: '#374151',
  },
  bookAuthor: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  reviewsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadgeContainer: {
    marginTop: 8,
  },
  wantToReadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  wantToReadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B5CF6',
    marginLeft: 4,
  },
  readingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  readingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 4,
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  readText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
    marginLeft: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  addButton: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});
