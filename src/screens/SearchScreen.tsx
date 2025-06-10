import React, { Suspense, useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Keyboard,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

import { useDebounce } from '../hooks/useDebounce';
import { useSearchQuery } from '../hooks/useSearchQuery';
import { SearchResults } from '../components/SearchResults';
import { LoadingSpinner } from '../components/LoadingSpinner';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

// 검색 결과를 로드하는 컴포넌트 (서스펜스로 감싸기 위함)
function SearchResultsLoader({
  query,
  view,
  onItemPress,
  setQuery,
}: {
  query: string;
  view: 'recent' | 'results';
  onItemPress: (item: any) => void;
  setQuery: (query: string) => void;
}) {
  // 디바운스된 쿼리를 사용하여 API 호출
  const debouncedQuery = useDebounce(query, 300);
  const { data, isFetching, fetchNextPage, hasNextPage } = useSearchQuery(debouncedQuery);

  // 디바운싱 중인지 확인 (현재 입력 중인 쿼리와 디바운스된 쿼리가 다르면 디바운싱 중)
  const isDebouncing = query.trim() !== debouncedQuery.trim() && query.trim() !== '';

  // 검색 결과를 하나의 배열로 변환
  const searchResults = data?.pages.flatMap(page => page.books) || [];

  // 총 검색 결과 수 (첫 번째 페이지의 total 값)
  const totalResults = data?.pages[0]?.total || 0;

  // 스크롤 핸들러
  const handleLoadMore = () => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 200;

    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      handleLoadMore();
    }
  };

  return (
    <SearchResults
      query={query}
      view={view}
      onItemPress={onItemPress}
      setQuery={setQuery}
      searchResults={searchResults}
      isLoading={isFetching || isDebouncing}
      onLoadMore={handleLoadMore}
      hasNextPage={hasNextPage}
      totalResults={totalResults}
      onScroll={handleScroll}
    />
  );
}

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  // 검색 아이템 클릭 핸들러
  const handleItemPress = (item: any) => {
    const bookIsbn = item.isbn13 || item.isbn || '';
    if (bookIsbn) {
      (navigation as any).navigate('BookDetail', { isbn: bookIsbn });
    }
  };

  // 검색 결과 또는 최근 검색 표시 여부
  const view = query ? 'results' : 'recent';

  useEffect(() => {
    // 화면이 포커스될 때 최근 검색어 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: ['search', 'recent'] });

    // 자동 포커스
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [queryClient]);

  const handleClose = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor='white' />

      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.innerContainer}>
            {/* 검색 입력 */}
            <View style={styles.searchContainer}>
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                style={[styles.searchInput, isTablet && styles.searchInputTablet]}
                placeholder='도서 제목을 검색해보세요'
                placeholderTextColor='#9CA3AF'
                autoFocus
                returnKeyType='search'
                clearButtonMode='never'
              />
            </View>

            {/* 검색 결과 */}
            <View style={styles.resultsContainer}>
              <Suspense
                fallback={
                  <View style={styles.fallbackContainer}>
                    <LoadingSpinner />
                  </View>
                }
              >
                <SearchResultsLoader
                  query={query}
                  view={view}
                  onItemPress={handleItemPress}
                  setQuery={setQuery}
                />
              </Suspense>
            </View>
          </View>
        </View>

        {/* 닫기 버튼 */}
        <TouchableOpacity
          style={[styles.closeButton, isTablet && styles.closeButtonTablet]}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={20} color='#9CA3AF' />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginRight: 40, // X 버튼과 겹치지 않도록 여백 추가
  },
  searchInput: {
    height: 48,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 12,
    textAlignVertical: 'center',
  },
  searchInputTablet: {
    height: 64,
    fontSize: 16,
    paddingVertical: 16,
  },
  resultsContainer: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  fallbackContainer: {
    flex: 1,
    minHeight: 0,
  },
  closeButton: {
    position: 'absolute',
    top: isTablet ? 20 : 20,
    right: isTablet ? 20 : 20,
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 30,
  },
  closeButtonTablet: {
    top: 20,
    right: 20,
  },
});
