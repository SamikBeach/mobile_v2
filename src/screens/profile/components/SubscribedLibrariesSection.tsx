import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { getUserSubscribedLibraries } from '../../../apis/user/user';
import { LibraryPreviewDto } from '../../../apis/user/types';
import { LibraryCard } from '../../../components/Library/LibraryCard';
import { LoadingSpinner } from '../../../components';
import { MaterialIcons } from '@expo/vector-icons';

interface SubscribedLibrariesSectionProps {
  userId: number;
  isMyProfile: boolean;
}

const SubscribedLibrariesSection: React.FC<SubscribedLibrariesSectionProps> = ({
  userId,
  isMyProfile,
}) => {
  const navigation = useNavigation();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey: ['user-subscribed-libraries', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getUserSubscribedLibraries(userId, pageParam, 10);
      return result;
    },
    getNextPageParam: lastPage => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const libraries = data?.pages.flatMap(page => page.libraries) || [];

  const handleLibraryPress = (library: LibraryPreviewDto) => {
    navigation.navigate('LibraryDetail' as never, { libraryId: library.id } as never);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name='favorite-border' size={48} color='#9CA3AF' />
      <Text style={styles.emptyTitle}>
        {isMyProfile ? '구독한 서재가 없습니다' : '이 사용자가 구독한 서재가 없습니다'}
      </Text>
      <Text style={styles.emptyDescription}>
        {isMyProfile ? '다른 사용자의 서재를 구독해보세요' : '다른 사용자를 확인해보세요'}
      </Text>
    </View>
  );

  const renderLibraryItem = ({ item }: { item: LibraryPreviewDto }) => (
    <TouchableOpacity onPress={() => handleLibraryPress(item)}>
      <LibraryCard library={item} />
    </TouchableOpacity>
  );

  const renderLoadingFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.loadingFooter}>
        <LoadingSpinner />
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (libraries.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={libraries}
        renderItem={renderLibraryItem}
        keyExtractor={item => item.id.toString()}
        numColumns={1}
        contentContainerStyle={styles.listContainer}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderLoadingFooter}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 200,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default SubscribedLibrariesSection;
