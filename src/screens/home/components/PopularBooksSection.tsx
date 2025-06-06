import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
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
          <TrendingUp size={20} color='#9333EA' />
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
          <TrendingUp size={20} color='#ㅊㅍ' />
          <Text style={styles.title}>지금 인기 있는 책</Text>
        </View>
        <Text style={styles.moreButton}>더보기</Text>
      </View>
      <View style={styles.flatListContainer}>
        <View style={styles.row}>
          <View style={styles.bookItem}>
            <SkeletonLoader.BookCardSkeleton />
          </View>
          <View style={styles.bookItem}>
            <SkeletonLoader.BookCardSkeleton />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.bookItem}>
            <SkeletonLoader.BookCardSkeleton />
          </View>
          <View style={styles.bookItem}>
            <SkeletonLoader.BookCardSkeleton />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  moreButton: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 8, // gap-2와 비슷
  },
});
