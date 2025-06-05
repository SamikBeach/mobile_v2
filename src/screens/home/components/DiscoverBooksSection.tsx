import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { BookCard, SkeletonLoader } from '../../../components';
import { useHomeDiscoverBooksQuery } from '../../../hooks/useHomeQueries';
import { HomeBookPreview } from '../../../apis';

interface DiscoverBooksSectionProps {
  onBookPress?: (book: HomeBookPreview) => void;
  onMorePress?: () => void;
}

export const DiscoverBooksSection: React.FC<DiscoverBooksSectionProps> = ({
  onBookPress,
  onMorePress,
}) => {
  const { discoverBooks, error } = useHomeDiscoverBooksQuery(4);

  // discoverBooks.books 배열에서 최대 4개만 표시
  const displayBooks = discoverBooks?.books?.slice(0, 4) || [];

  // 디버깅 로그 추가
  console.log('[DiscoverBooksSection] discoverBooks:', discoverBooks);
  console.log('[DiscoverBooksSection] displayBooks:', displayBooks);
  console.log('[DiscoverBooksSection] displayBooks.length:', displayBooks.length);
  console.log('[DiscoverBooksSection] error:', error);

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
      Alert.alert('더보기', '오늘의 발견 전체 보기');
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>데이터를 불러오는 중 오류가 발생했습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>🧭</Text>
          <Text style={styles.title}>오늘의 발견</Text>
        </View>
        <TouchableOpacity onPress={handleMorePress}>
          <Text style={styles.moreButton}>더보기</Text>
        </TouchableOpacity>
      </View>

      {displayBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>오늘의 발견이 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={displayBooks}
          renderItem={({ item }) => (
            <View style={styles.bookItem}>
              <BookCard book={item} onPress={() => handleBookPress(item)} />
            </View>
          )}
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

export const DiscoverBooksSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>🧭</Text>
          <Text style={styles.title}>오늘의 발견</Text>
        </View>
        <Text style={styles.moreButton}>더보기</Text>
      </View>
      <View style={styles.booksGrid}>
        {[...Array(4)].map((_, index) => (
          <View key={index} style={[styles.bookItem, index === 3 && styles.hiddenOnTablet]}>
            <SkeletonLoader.BookCardSkeleton />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 16,
    color: '#00C471',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  moreButton: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  booksGrid: {
    // 이제 사용하지 않음
  },
  bookItem: {
    flex: 1,
    marginHorizontal: 4,
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
    marginBottom: 8,
  },
});
