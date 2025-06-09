import React, { Suspense, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
  MoreHorizontal,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Book,
  Calendar,
  Users,
} from 'lucide-react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

import { getLibraryById, updateLibrary, deleteLibrary } from '../apis/library';
import { Library, UpdateLibraryDto } from '../apis/library/types';
import { BookCard } from '../components';

// Route 타입 정의
type LibraryDetailRouteProp = RouteProp<{ LibraryDetail: { libraryId: number } }, 'LibraryDetail'>;

const { width: screenWidth } = Dimensions.get('window');
// 책 카드 너비 계산 - 간격을 더 줄임
const bookCardWidth = (screenWidth - 40) / 2; // 좌우 패딩 16*2 + 중간 간격 8

// 프로필 아바타 컴포넌트
const ProfileAvatar: React.FC<{ username: string; profileImage?: string }> = ({
  username,
  profileImage,
}) => {
  return (
    <View style={styles.avatarContainer}>
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
};

// 서재 헤더 컴포넌트 - 서재 이름과 설명
const LibraryHeader: React.FC<{
  library: Library;
  isOwner: boolean;
  onMorePress: () => void;
}> = ({ library, isOwner, onMorePress }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.libraryTitleSection}>
          <Text style={styles.libraryTitle}>{library.name}</Text>
          <Text style={styles.libraryDescription}>
            {library.description || '서재에 대한 설명이 없습니다.'}
          </Text>
        </View>
        {isOwner && (
          <TouchableOpacity style={styles.moreButton} onPress={onMorePress}>
            <MoreHorizontal size={20} color='#6B7280' />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// 책 추가 버튼 컴포넌트
const AddBookButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.addBookButton} onPress={onPress}>
    <Plus size={16} color='#6B7280' />
    <Text style={styles.addBookButtonText}>책 추가</Text>
  </TouchableOpacity>
);

// 주인 정보 및 서재 정보 컴포넌트 - 담긴 책 위에 배치
const LibraryInfo: React.FC<{ library: Library }> = ({ library }) => {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  };

  return (
    <View style={styles.libraryInfoSection}>
      <View style={styles.infoCard}>
        {/* 주인 정보 */}
        <View style={styles.ownerInfo}>
          <ProfileAvatar
            username={library.owner.username}
            profileImage={library.owner.profileImage}
          />
          <View style={styles.ownerDetails}>
            <Text style={styles.ownerNameText}>{library.owner.username}</Text>
          </View>
        </View>

        {/* 서재 통계 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Book size={16} color='#6B7280' />
            <Text style={styles.statText}>
              <Text style={styles.statNumber}>{library.books?.length || 0}</Text> 권
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Users size={16} color='#6B7280' />
            <Text style={styles.statText}>
              <Text style={styles.statNumber}>{library.subscriberCount || 0}</Text> 명
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Calendar size={16} color='#6B7280' />
            <Text style={styles.statText}>{formatDate(library.createdAt)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// 최근 활동 섹션 컴포넌트 - 가장 마지막에 배치
const RecentActivity: React.FC<{ library: Library }> = ({ library }) => {
  return (
    <View style={styles.activitySection}>
      <Text style={styles.sectionTitle}>최근 활동</Text>
      <View style={styles.activityCard}>
        <View style={styles.activityItem}>
          <View style={styles.activityIcon}>
            <Book size={14} color='#3B82F6' />
          </View>
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>
              {library.books && library.books.length > 0
                ? `${library.books[0]?.book?.title || '책'} 책이 추가되었습니다.`
                : '첫 번째 책이 추가되었습니다.'}
            </Text>
            <Text style={styles.activityDate}>8일 전</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// 더보기 옵션 바텀시트 컴포넌트
const MoreOptionsBottomSheet: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  library: Library;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}> = ({ isVisible, onClose, library, onEdit, onToggleVisibility, onDelete }) => {
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);

  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        enableTouchThrough={false}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing={true}
      onChange={index => {
        if (index === -1) {
          onClose();
        }
      }}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.dragHandle}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <BottomSheetView style={styles.bottomSheetContent}>
        <TouchableOpacity style={styles.bottomSheetItem} onPress={onEdit}>
          <Edit size={20} color='#374151' />
          <Text style={styles.bottomSheetItemText}>서재 수정하기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomSheetItem} onPress={onToggleVisibility}>
          {library.isPublic ? (
            <EyeOff size={20} color='#374151' />
          ) : (
            <Eye size={20} color='#374151' />
          )}
          <Text style={styles.bottomSheetItemText}>
            {library.isPublic ? '비공개로 변경하기' : '공개로 변경하기'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.bottomSheetItem, styles.deleteItem]} onPress={onDelete}>
          <Trash2 size={20} color='#EF4444' />
          <Text style={[styles.bottomSheetItemText, styles.deleteItemText]}>서재 삭제하기</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

// 메인 서재 상세 컴포넌트
const LibraryDetailContent: React.FC<{ libraryId: number }> = ({ libraryId }) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [currentUser] = useState<{ id: number } | null>({ id: 1 }); // 임시 사용자 정보
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const { data: library } = useSuspenseQuery({
    queryKey: ['library', libraryId],
    queryFn: () => getLibraryById(libraryId),
  });

  // 서재 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateLibraryDto) => updateLibrary(libraryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', libraryId] });
      Alert.alert('성공', '서재가 수정되었습니다.');
    },
  });

  // 서재 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteLibrary(libraryId),
    onSuccess: () => {
      Alert.alert('성공', '서재가 삭제되었습니다.');
      navigation.goBack();
    },
  });

  React.useEffect(() => {
    if (library?.name) {
      navigation.setOptions({
        headerTitle: library.name,
      });
    }
  }, [library?.name, navigation]);

  const isOwner = currentUser?.id === library?.owner?.id;

  const handleMorePress = () => {
    setShowMoreOptions(true);
  };

  const handleEdit = () => {
    setShowMoreOptions(false);
    Alert.alert('서재 수정', '서재 수정 기능을 구현해주세요.');
  };

  const handleDelete = () => {
    setShowMoreOptions(false);
    Alert.alert('서재 삭제', '정말로 이 서재를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  const handleToggleVisibility = () => {
    setShowMoreOptions(false);
    updateMutation.mutate({ isPublic: !library.isPublic });
  };

  const handleAddBook = () => {
    Alert.alert('책 추가', '책 추가 기능을 구현해주세요.');
  };

  const handleBookPress = (book: any) => {
    (navigation as any).navigate('BookDetail', { isbn: book.isbn || book.isbn13 });
  };

  const renderBookItem = ({ item: libraryBook }: { item: any }) => (
    <View style={styles.bookItem}>
      <BookCard
        book={libraryBook.book}
        onPress={() => handleBookPress(libraryBook.book)}
        horizontal={false}
      />
    </View>
  );

  if (!library) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 헤더 */}
      <LibraryHeader library={library} isOwner={isOwner} onMorePress={handleMorePress} />

      {/* 주인 정보 및 서재 정보 - 담긴 책 위에 배치 */}
      <LibraryInfo library={library} />

      {/* 담긴 책 섹션 */}
      <View style={styles.booksSection}>
        <View style={styles.booksSectionHeader}>
          <Text style={styles.booksSectionTitle}>
            담긴 책 <Text style={styles.booksCount}>({library.books?.length || 0})</Text>
          </Text>
          {isOwner && <AddBookButton onPress={handleAddBook} />}
        </View>

        {library.books && library.books.length > 0 ? (
          <FlatList
            data={library.books}
            renderItem={renderBookItem}
            numColumns={2}
            keyExtractor={item => item.id.toString()}
            style={styles.booksList}
            scrollEnabled={false}
            columnWrapperStyle={styles.booksRow}
            ItemSeparatorComponent={() => <View style={styles.bookSeparator} />}
          />
        ) : (
          <View style={styles.emptyBooks}>
            <Book size={48} color='#D1D5DB' />
            <Text style={styles.emptyBooksTitle}>담긴 책이 없습니다</Text>
            <Text style={styles.emptyBooksSubtitle}>
              {isOwner ? '첫 번째 책을 추가해보세요' : '아직 추가된 책이 없습니다'}
            </Text>
          </View>
        )}
      </View>

      {/* 최근 활동 - 가장 마지막에 배치 */}
      <RecentActivity library={library} />

      {/* 더보기 바텀시트 */}
      <MoreOptionsBottomSheet
        isVisible={showMoreOptions}
        onClose={() => setShowMoreOptions(false)}
        library={library}
        onEdit={handleEdit}
        onToggleVisibility={handleToggleVisibility}
        onDelete={handleDelete}
      />
    </ScrollView>
  );
};

// 로딩 스켈레톤
const LibraryDetailSkeleton: React.FC = () => (
  <ScrollView style={styles.container}>
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonHeaderText}>
          <View style={[styles.skeletonBox, { width: '60%', height: 18 }]} />
        </View>
      </View>

      <View style={styles.skeletonBooks}>
        <View style={[styles.skeletonBox, { width: '50%', height: 20, marginBottom: 16 }]} />
        <View style={styles.skeletonBooksGrid}>
          {[...Array(4)].map((_, index) => (
            <View key={index} style={styles.skeletonBookCard} />
          ))}
        </View>
      </View>

      <View style={styles.skeletonInfo}>
        <View style={[styles.skeletonBox, { width: '40%', height: 18, marginBottom: 16 }]} />
        <View style={styles.skeletonInfoCard}>
          <View style={styles.skeletonOwnerInfo}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonOwnerText}>
              <View style={[styles.skeletonBox, { width: 80, height: 14, marginBottom: 4 }]} />
              <View style={[styles.skeletonBox, { width: 60, height: 12 }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  </ScrollView>
);

// 메인 화면 컴포넌트
export const LibraryDetailScreen: React.FC = () => {
  const route = useRoute<LibraryDetailRouteProp>();
  const { libraryId } = route.params;

  return (
    <View style={styles.safeArea}>
      <Suspense fallback={<LibraryDetailSkeleton />}>
        <LibraryDetailContent libraryId={libraryId} />
      </Suspense>
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

  // 헤더 스타일
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    // 아바타 컨테이너
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  libraryTitleSection: {
    flex: 1,
  },
  libraryTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  libraryDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  ownerName: {
    color: '#111827',
  },
  moreButton: {
    padding: 8,
  },

  // 책 섹션 스타일 - 간격을 더 줄임
  booksSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  booksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  booksSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  booksCount: {
    color: '#6B7280',
    fontWeight: '400',
  },
  addBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  addBookButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  booksList: {
    flex: 1,
  },
  booksRow: {
    justifyContent: 'space-between',
  },
  bookItem: {
    width: bookCardWidth,
  },
  bookSeparator: {
    height: 12, // 간격을 더 줄임
  },
  emptyBooks: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyBooksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  emptyBooksSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  // 섹션 제목 스타일 (공통)
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },

  // 서재 정보 스타일 - 담긴 책 아래 배치
  libraryInfoSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statNumber: {
    fontWeight: '600',
    color: '#111827',
  },

  // 최근 활동 스타일 - 가장 마지막에 배치
  activitySection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  activityCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // 바텀시트 스타일
  dragHandle: {
    backgroundColor: '#D1D5DB',
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetBackground: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  bottomSheetItemText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  deleteItem: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
    paddingTop: 16,
  },
  deleteItemText: {
    color: '#EF4444',
  },

  // 스켈레톤 스타일
  skeletonContainer: {
    padding: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  skeletonHeaderText: {
    flex: 1,
  },
  skeletonBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  skeletonBooks: {
    marginBottom: 32,
  },
  skeletonBooksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonBookCard: {
    width: bookCardWidth,
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonInfo: {
    marginBottom: 32,
  },
  skeletonInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  skeletonOwnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skeletonOwnerText: {
    flex: 1,
  },
});
