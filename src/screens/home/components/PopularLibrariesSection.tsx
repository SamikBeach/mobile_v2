import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { LibraryCard, SkeletonLoader } from '../../../components';
import { useHomePopularLibrariesQuery } from '../../../hooks/useHomeQueries';
import { LibraryListItem } from '@/apis/library';

interface PopularLibrariesSectionProps {
  onLibraryPress?: (library: LibraryListItem) => void;
  onMorePress?: () => void;
}

export const PopularLibrariesSection: React.FC<PopularLibrariesSectionProps> = ({
  onLibraryPress,
  onMorePress,
}) => {
  const { libraries, error } = useHomePopularLibrariesQuery(2);

  const handleLibraryPress = (library: LibraryListItem) => {
    if (onLibraryPress) {
      onLibraryPress(library);
    } else {
      Alert.alert('서재 상세', `${library.name} 서재를 선택했습니다.`);
    }
  };

  const handleMorePress = () => {
    if (onMorePress) {
      onMorePress();
    } else {
      Alert.alert('더보기', '서재 전체 보기');
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>데이터를 불러오는 중 오류가 발생했습니다.</Text>
      </View>
    );
  }

  const safeLibraries = libraries || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <BookOpen size={20} color='#F43F5E' />
          <Text style={styles.title}>인기 서재</Text>
        </View>
        <TouchableOpacity onPress={handleMorePress}>
          <Text style={styles.moreButton}>더보기</Text>
        </TouchableOpacity>
      </View>

      {safeLibraries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>인기 서재가 없습니다.</Text>
        </View>
      ) : (
        <View style={styles.librariesList}>
          {safeLibraries.slice(0, 2).map((library, index) => (
            <View key={library.id} style={index > 0 ? styles.libraryItemSpacing : null}>
              <LibraryCard library={library} onPress={() => handleLibraryPress(library)} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export const PopularLibrariesSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <BookOpen size={20} color='#F43F5E' />
          <Text style={styles.title}>인기 서재</Text>
        </View>
        <Text style={styles.moreButton}>더보기</Text>
      </View>
      <View style={styles.librariesList}>
        {[...Array(2)].map((_, index) => (
          <View key={index} style={index > 0 ? styles.libraryItemSpacing : null}>
            <SkeletonLoader.LibraryCardSkeleton />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  librariesList: {
    gap: 2,
  },
  libraryItemSpacing: {
    marginTop: 2,
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
});
