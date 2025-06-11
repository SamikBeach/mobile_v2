import React, { Suspense } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Library } from 'lucide-react-native';
import { getUserLibraries } from '../../../apis/user/user';
import { LibraryPreviewDto } from '../../../apis/user/types';
import { useAtomValue } from 'jotai';
import { userAtom } from '../../../atoms/user';
import { LibraryCard } from '../../../components/Library/LibraryCard';
import { LoadingSpinner } from '../../../components';
import { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Lucide 아이콘들을 컴포넌트로 래핑
const PlusIcon = ({ size = 16, color = '#374151' }) => <Plus size={size} color={color} />;
const LibraryIcon = ({ size = 48, color = '#6B7280' }) => <Library size={size} color={color} />;

// 사용자 서재 조회 Hook (무한 스크롤)
const useUserLibrariesInfinite = (userId: number) => {
  const PAGE_SIZE = 6;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery({
    queryKey: ['user-libraries', userId],
    queryFn: async ({ pageParam = 1 }) => {
      return getUserLibraries(userId, pageParam, PAGE_SIZE);
    },
    getNextPageParam: lastPage => {
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // 모든 페이지의 서재 목록을 하나의 배열로 병합
  const libraries = data?.pages.flatMap(page => page.items || []) || [];

  const total = data?.pages[0]?.total || 0;

  return {
    libraries,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    total,
  };
};

// 빈 상태 컴포넌트
interface EmptyStateProps {
  isMyProfile: boolean;
  onCreateLibrary: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ isMyProfile, onCreateLibrary }) => (
  <View style={styles.emptyContainer}>
    <LibraryIcon size={48} color='#D1D5DB' />
    <Text style={styles.emptyText}>서재가 없습니다</Text>
    <Text style={styles.emptyDescription}>
      {isMyProfile ? '첫 번째 서재를 만들어보세요!' : '이 사용자는 아직 서재를 만들지 않았습니다.'}
    </Text>
    {isMyProfile && (
      <TouchableOpacity style={styles.emptyActionButton} onPress={onCreateLibrary}>
        <PlusIcon size={16} color='white' />
        <Text style={styles.emptyActionButtonText}>새 서재 만들기</Text>
      </TouchableOpacity>
    )}
  </View>
);

// 서재 목록 컴포넌트
interface LibrariesListProps {
  userId: number;
  isMyProfile: boolean;
  onCreateLibrary: () => void;
}

const LibrariesList: React.FC<LibrariesListProps> = ({ userId, isMyProfile, onCreateLibrary }) => {
  const currentUser = useAtomValue(userAtom);
  const navigation = useNavigation<NavigationProp>();

  const { libraries, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useUserLibrariesInfinite(userId);

  const handleLibraryPress = (library: LibraryPreviewDto) => {
    navigation.navigate('LibraryDetail', {
      libraryId: library.id,
    });
  };

  // 자동으로 모든 페이지 로드
  React.useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderLibraryItem = ({ item: library }: { item: LibraryPreviewDto }) => (
    <View style={styles.libraryItemContainer}>
      <LibraryCard
        library={library}
        onPress={() => handleLibraryPress(library)}
        currentUserId={currentUser?.id}
      />
    </View>
  );

  if (libraries.length === 0) {
    return <EmptyState isMyProfile={isMyProfile} onCreateLibrary={onCreateLibrary} />;
  }

  return (
    <View style={styles.container}>
      {/* 서재 생성 버튼 (내 프로필인 경우만) */}
      {isMyProfile && (
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.createButton} onPress={onCreateLibrary}>
            <PlusIcon size={16} color='#374151' />
            <Text style={styles.createButtonText}>새 서재 만들기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 서재 목록 */}
      <FlatList
        data={libraries}
        renderItem={renderLibraryItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        contentContainerStyle={styles.librariesContainer}
        ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
        removeClippedSubviews={false}
      />
    </View>
  );
};

// 메인 LibrariesSection 컴포넌트
interface LibrariesSectionProps {
  userId: number;
}

export const LibrariesSection: React.FC<LibrariesSectionProps> = ({ userId }) => {
  const currentUser = useAtomValue(userAtom);
  const isMyProfile = currentUser?.id === userId;

  const handleCreateLibrary = () => {
    // TODO: 서재 생성 BottomSheet 열기
    Alert.alert('서재 생성', '서재 생성 기능은 추후 구현 예정입니다.');
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LibrariesList
        userId={userId}
        isMyProfile={isMyProfile}
        onCreateLibrary={handleCreateLibrary}
      />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
  },
  librariesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  libraryItemContainer: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
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
    marginBottom: 20,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 24,
  },
  emptyActionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    marginLeft: 6,
  },
});
