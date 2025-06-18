import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Keyboard,
  ScrollView,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Search, X, BookOpen, Star, MessageSquare, Check, Clock } from 'lucide-react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchBooks } from '../apis/search/search';
import { SearchBook } from '../apis/search/types';
import { HomeBookPreview } from '../apis/book/types';
import { LoadingSpinner } from './LoadingSpinner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReadingStatusType } from '../constants';

interface AddBookBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  onBookSelect: (book: HomeBookPreview) => void;
  selectedBooks?: HomeBookPreview[];
  onBooksAdd?: (books: HomeBookPreview[]) => void;
}

// 디바운스 훅
const useDebounce = (value: string, delay: number) => {
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
};

// 실제 책 검색 API 사용
const useBookSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['book-search', debouncedQuery],
    queryFn: ({ pageParam = 1 }) => searchBooks(debouncedQuery, pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: debouncedQuery !== undefined && debouncedQuery.trim() !== '',
  });

  // 전체 페이지 병합
  const searchResults = data?.pages.flatMap(page => page.books) || [];
  const totalResults = data?.pages[0]?.total || 0;

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    totalResults,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isDebouncing: debouncedQuery !== searchQuery,
  };
};

export const AddBookBottomSheet: React.FC<AddBookBottomSheetProps> = ({
  bottomSheetRef,
  onBookSelect,
  selectedBooks = [],
  onBooksAdd,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    totalResults,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isDebouncing,
  } = useBookSearch();

  const [localSelectedBooks, setLocalSelectedBooks] = useState<SearchBook[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior='close'
      />
    ),
    []
  );

  // 다이얼로그 열릴 때 초기화 및 포커스
  useEffect(() => {
    // 검색창과 선택된 책들 초기화
    setSearchQuery('');
    setLocalSelectedBooks([]);

    // 포커스 (약간 지연)
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // 책 추가 핸들러
  const handleAddBooks = useCallback(() => {
    if (localSelectedBooks.length === 0) {
      return;
    }

    // SearchBook을 HomeBookPreview로 변환
    const homeBookPreviews: HomeBookPreview[] = localSelectedBooks.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author || '저자 미상',
      coverImage: book.coverImage || book.image || '',
      isbn: book.isbn || book.isbn13 || '',
      rating: book.rating || 0,
      reviews: book.reviews || 0,
      publisher: book.publisher,
    }));

    // 부모에게 선택된 책들 전달
    if (onBooksAdd) {
      onBooksAdd(homeBookPreviews);
    } else {
      // 기존 방식으로 책 하나씩 전달
      homeBookPreviews.forEach(book => onBookSelect(book));
    }

    // 선택 초기화 및 Bottom Sheet 닫기
    setLocalSelectedBooks([]);
    setSearchQuery('');
    bottomSheetRef.current?.dismiss();
  }, [localSelectedBooks, onBooksAdd, onBookSelect, bottomSheetRef, setSearchQuery]);

  // 다이얼로그 닫기 핸들러
  const handleCloseDialog = useCallback(() => {
    setLocalSelectedBooks([]);
    setSearchQuery('');
    bottomSheetRef.current?.dismiss();
  }, [setSearchQuery, bottomSheetRef]);

  // 책 고유 식별자 생성
  const getBookIdentifier = useCallback((book: SearchBook): string => {
    return `${book.isbn}-${book.isbn13}-${book.title}`;
  }, []);

  // 책 선택/해제 핸들러
  const toggleBookSelection = useCallback(
    (book: SearchBook) => {
      const bookIdentifier = getBookIdentifier(book);
      const isSelected = localSelectedBooks.some(
        selectedBook => getBookIdentifier(selectedBook) === bookIdentifier
      );

      if (isSelected) {
        setLocalSelectedBooks(prev =>
          prev.filter(selectedBook => getBookIdentifier(selectedBook) !== bookIdentifier)
        );
      } else {
        setLocalSelectedBooks(prev => [...prev, book]);
      }
    },
    [localSelectedBooks, getBookIdentifier]
  );

  // 선택된 책 제거
  const removeSelectedBook = useCallback(
    (book: SearchBook) => {
      setLocalSelectedBooks(prev =>
        prev.filter(selectedBook => getBookIdentifier(selectedBook) !== getBookIdentifier(book))
      );
    },
    [getBookIdentifier]
  );

  const isBookSelected = useCallback(
    (book: SearchBook) => {
      const bookIdentifier = getBookIdentifier(book);
      return localSelectedBooks.some(
        selectedBook => getBookIdentifier(selectedBook) === bookIdentifier
      );
    },
    [localSelectedBooks, getBookIdentifier]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    Keyboard.dismiss();
  }, [setSearchQuery]);

  // 별점 렌더링
  const renderStarRating = useCallback((rating?: number) => {
    const stars = [];
    const validRating = rating || 0;
    const fullStars = Math.floor(validRating);
    const hasHalfStar = validRating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} color='#FFAB00' fill='#FFAB00' />);
    }

    if (hasHalfStar) {
      stars.push(
        <Star key='half' size={12} color='#FFAB00' fill='#FFAB00' style={{ opacity: 0.5 }} />
      );
    }

    const emptyStars = 5 - Math.ceil(validRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={12} color='#E5E7EB' fill='#E5E7EB' />);
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  }, []);

  // 텍스트 하이라이트
  const highlightText = useCallback((text: string, highlight?: string) => {
    if (!highlight) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
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
    if (url.startsWith('http')) return url;
    return `https:${url}`;
  }, []);

  // 무한 스크롤 처리
  const handleScroll = useCallback(
    ({ nativeEvent }: any) => {
      const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
      const paddingToBottom = 100;

      if (contentOffset.y + layoutMeasurement.height + paddingToBottom >= contentSize.height) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // 책 아이템 렌더링
  const renderBookItem = useCallback(
    ({ item }: { item: SearchBook }) => {
      const isSelected = isBookSelected(item);
      const imageUrl = normalizeImageUrl(item.coverImage || item.image);

      return (
        <TouchableOpacity
          style={[styles.bookItem, isSelected && styles.selectedBookItem]}
          onPress={() => toggleBookSelection(item)}
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
            <Text style={styles.bookTitle} numberOfLines={2}>
              {highlightText(item.title, searchQuery)}
            </Text>

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
                <MessageSquare size={14} color='#9CA3AF' />
                <Text style={styles.reviewsText}>
                  {item.reviews && item.reviews > 999
                    ? `${Math.floor(item.reviews / 1000)}k`
                    : item.reviews || 0}
                </Text>
              </View>
            </View>

            {/* 읽기 상태 배지들 */}
            {item.userReadingStatus && (
              <View style={styles.statusContainer}>
                {item.userReadingStatus === ReadingStatusType.WANT_TO_READ && (
                  <View style={styles.statusBadgeWantToRead}>
                    <Clock size={12} color='#7C3AED' />
                    <Text style={styles.statusTextWantToRead}>읽고 싶어요</Text>
                  </View>
                )}
                {item.userReadingStatus === ReadingStatusType.READING && (
                  <View style={styles.statusBadgeReading}>
                    <BookOpen size={12} color='#2563EB' />
                    <Text style={styles.statusTextReading}>읽는 중</Text>
                  </View>
                )}
                {item.userReadingStatus === ReadingStatusType.READ && (
                  <View style={styles.statusBadgeRead}>
                    <Check size={12} color='#059669' />
                    <Text style={styles.statusTextRead}>읽었어요</Text>
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
    [
      isBookSelected,
      toggleBookSelection,
      highlightText,
      searchQuery,
      normalizeImageUrl,
      renderStarRating,
    ]
  );

  // 빈 상태 렌더링
  const renderEmptyState = useCallback(() => {
    if (searchQuery.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>검색어를 입력해주세요.</Text>
        </View>
      );
    }

    if (isLoading || isDebouncing) {
      return (
        <View style={styles.emptyState}>
          <LoadingSpinner />
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
          </View>
          <Text style={styles.emptyTitle}>검색 결과가 없습니다</Text>
          <Text style={styles.emptyText}>다른 검색어로 시도해보세요</Text>
        </View>
      );
    }

    return null;
  }, [searchQuery, isLoading, isDebouncing, searchResults.length]);

  const snapPoints = useMemo(() => {
    // Safe Area를 고려한 높이 계산 (상단 insets 제외)
    const availableHeight = 100 - insets.top / 8; // 상단 Safe Area를 퍼센트로 계산
    return [`${Math.max(availableHeight, 85)}%`]; // 최소 85% 보장
  }, [insets.top]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      activeOffsetY={[-1, 1]}
      failOffsetX={[-5, 5]}
      handleIndicatorStyle={styles.handleIndicator}
      keyboardBehavior='interactive'
      keyboardBlurBehavior='restore'
      onDismiss={() => {
        setLocalSelectedBooks([]);
        setSearchQuery('');
      }}
    >
      <BottomSheetView style={styles.container}>
        {/* Search Input */}
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
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <X size={16} color='#9CA3AF' />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results Header */}
        {searchQuery.length > 0 && (
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsText}>
              "{searchQuery}" 검색 결과{totalResults ? ` (${totalResults})` : ''}
            </Text>
          </View>
        )}

        {/* Selected Books Section */}
        {localSelectedBooks.length > 0 && (
          <View style={styles.selectedBooksSection}>
            <Text style={styles.selectedBooksTitle}>선택된 책 ({localSelectedBooks.length})</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectedBooksScrollView}
              contentContainerStyle={styles.selectedBooksContent}
              nestedScrollEnabled={true}
            >
              {localSelectedBooks.map(book => (
                <View key={getBookIdentifier(book)} style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText} numberOfLines={1}>
                    {book.title}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeSelectedBook(book)}
                    style={styles.removeBadgeButton}
                  >
                    <X size={12} color='#6B7280' />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Results */}
        {searchResults.length === 0 ? (
          <View style={styles.resultsContainer}>{renderEmptyState()}</View>
        ) : (
          <BottomSheetScrollView
            ref={scrollViewRef}
            style={styles.resultsContainer}
            contentContainerStyle={styles.resultsList}
            showsVerticalScrollIndicator={true}
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
          </BottomSheetScrollView>
        )}

        {/* Footer with Add Button */}
        {localSelectedBooks.length > 0 && (
          <View style={styles.footerContainer}>
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
                onPress={handleCloseDialog}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    minHeight: 600,
    paddingTop: 8,
  },
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
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
    height: 48,
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
  searchResultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  searchResultsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedBooksSection: {
    paddingHorizontal: 16,
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
    maxHeight: 100,
    minHeight: 40,
  },
  selectedBooksContent: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 200,
    minHeight: 36,
  },
  selectedBadgeText: {
    fontSize: 14,
    color: '#1E40AF',
    marginRight: 8,
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  removeBadgeButton: {
    padding: 2,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  resultsList: {
    paddingBottom: 16,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  selectedBookItem: {
    backgroundColor: '#F9FAFB',
  },
  bookImageContainer: {
    width: 80,
    height: 120,
    marginRight: 12,
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
  bookAuthor: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  reviewsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusContainer: {
    marginTop: 6,
  },
  statusBadgeWantToRead: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    gap: 4,
  },
  statusTextWantToRead: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7C3AED',
  },
  statusBadgeReading: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    gap: 4,
  },
  statusTextReading: {
    fontSize: 11,
    fontWeight: '500',
    color: '#2563EB',
  },
  statusBadgeRead: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    gap: 4,
  },
  statusTextRead: {
    fontSize: 11,
    fontWeight: '500',
    color: '#059669',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightText: {
    backgroundColor: '#FEF3C7',
    fontWeight: '600',
  },
  separator: {
    height: 0,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
