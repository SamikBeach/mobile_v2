import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { BookCard, SkeletonLoader } from '../../../components';
import { useHomePopularBooksQuery } from '../../../hooks/useHomeQueries';
import { HomeBookPreview } from '../../../apis';

interface PopularBooksSectionProps {
  onBookPress?: (book: HomeBookPreview) => void;
  onMorePress?: () => void;
}

export const PopularBooksSection: React.FC<PopularBooksSectionProps> = ({
  onBookPress,
  onMorePress,
}) => {
  const { books, error } = useHomePopularBooksQuery(4);

  // 디버깅 로그 추가
  console.log('[PopularBooksSection] books:', books);
  console.log('[PopularBooksSection] books.length:', books?.length);
  console.log('[PopularBooksSection] error:', error);

  const handleBookPress = (book: HomeBookPreview) => {
    if (onBookPress) {
      onBookPress(book);
    } else {
      Alert.alert('책 상세', `${book.title}을(를) 선택했습니다.`);
    }
  };

  const handleMorePress = () => {
    if (onMorePress) {
      onMorePress();
    } else {
      Alert.alert('더보기', '인기 도서 전체 보기');
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>데이터를 불러오는 중 오류가 발생했습니다.</Text>
      </View>
    );
  }

  // books가 undefined이거나 빈 배열인 경우 안전하게 처리
  const safeBooks = books || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>💡</Text>
          <Text style={styles.title}>지금 인기 있는 책</Text>
        </View>
        <TouchableOpacity onPress={handleMorePress}>
          <Text style={styles.moreButton}>더보기</Text>
        </TouchableOpacity>
      </View>

      {safeBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>인기 도서가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={safeBooks.slice(0, 4)}
          renderItem={({ item }) => {
            console.log('[PopularBooksSection] rendering book:', item.title);
            return (
              <View style={styles.bookItem}>
                <BookCard book={item} onPress={() => handleBookPress(item)} />
              </View>
            );
          }}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.flatListContainer}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
};

export const PopularBooksSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>💡</Text>
          <Text style={styles.title}>지금 인기 있는 책</Text>
        </View>
        <Text style={styles.moreButton}>더보기</Text>
      </View>
      <View style={styles.booksGrid}>
        {[...Array(3)].map((_, index) => (
          <View key={index} style={styles.bookItem}>
            <SkeletonLoader.BookCardSkeleton />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8, // p-2
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // mb-2
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // gap-1.5
  },
  icon: {
    fontSize: 16, // h-4 w-4
    color: '#9333EA', // text-purple-600
  },
  title: {
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    color: '#111827', // text-gray-900
  },
  moreButton: {
    fontSize: 12, // text-xs
    color: '#6B7280', // text-gray-500
    fontWeight: '500', // font-medium
  },
  booksGrid: {
    // 이제 사용하지 않음
  },
  bookItem: {
    flex: 1,
    marginHorizontal: 4, // gap-2와 비슷
    marginVertical: 4,
  },
  hiddenOnTablet: {
    // 태블릿에서는 숨김 처리 (필요시 구현)
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
  flatListContainer: {
    // paddingHorizontal: 0으로 제거
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8, // gap-2와 비슷
  },
});
