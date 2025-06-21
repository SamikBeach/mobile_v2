import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Library as LibraryIcon } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { getUserLibraries } from '../apis/library';
import { userAtom } from '../atoms/user';

interface LibrarySelectionBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onLibrarySelect: (libraryId: number) => void;
  onCreateNewLibrary: () => void;
}

export const LibrarySelectionBottomSheet: React.FC<LibrarySelectionBottomSheetProps> = ({
  isVisible,
  onClose,
  onLibrarySelect,
  onCreateNewLibrary,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const currentUser = useAtomValue(userAtom);
  const insets = useSafeAreaInsets();

  // 사용자 서재 목록 조회
  const {
    data: librariesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-libraries', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) {
        throw new Error('사용자가 로그인되어 있지 않습니다.');
      }

      // 모든 서재를 가져오기 위해 큰 limit 값 사용
      return await getUserLibraries(currentUser.id, 1000);
    },
    enabled: isVisible && !!currentUser?.id,
    retry: false,
  });

  const libraries = librariesResponse || [];

  // 디버깅: 서재 목록 확인
  React.useEffect(() => {
    if (libraries.length > 0) {
      console.log('서재 목록:', libraries.length, '개', libraries);
    }
  }, [libraries]);

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Present modal when isVisible becomes true
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleLibrarySelect = (libraryId: number) => {
    onLibrarySelect(libraryId);
    bottomSheetModalRef.current?.dismiss();
  };

  const handleCreateNewLibrary = () => {
    onCreateNewLibrary();
    bottomSheetModalRef.current?.dismiss();
  };

  // Backdrop component
  const renderBackdrop = useCallback(
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

  const renderContent = () => (
    <BottomSheetView style={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>서재 선택</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>서재 목록을 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>서재 목록을 불러오는데 실패했습니다.</Text>
        </View>
      ) : libraries.length > 0 ? (
        <FlatList
          data={libraries}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={true}
          style={styles.listContainer}
          contentContainerStyle={styles.listContentContainer}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          windowSize={10}
          nestedScrollEnabled={true}
          renderItem={({ item: library }) => (
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleLibrarySelect(library.id)}
            >
              <LibraryIcon size={20} color='#374151' />
              <View style={styles.libraryInfo}>
                <Text style={styles.libraryName}>{library.name}</Text>
                <Text style={styles.libraryCount}>{library.bookCount || 0}권</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>서재가 없습니다.</Text>
        </View>
      )}

      {/* 새 서재 만들기 옵션 - 하단 고정 */}
      <View style={[styles.fixedBottom, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[styles.optionItem, styles.createOptionBorder]}
          onPress={handleCreateNewLibrary}
        >
          <Plus size={20} color='#374151' />
          <Text style={styles.createOptionText}>새 서재 만들기</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      enableDynamicSizing={true}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.dragHandle}
      backgroundStyle={styles.modalContainer}
    >
      {renderContent()}
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  listContainer: {
    maxHeight: 400, // 버튼 영역을 고려하여 높이 줄임
  },
  listContentContainer: {
    paddingBottom: 16,
  },
  fixedBottom: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: 'white',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dragHandle: {
    backgroundColor: '#D1D5DB',
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  optionsContainer: {
    paddingTop: 0,
    paddingBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    marginBottom: 0,
    gap: 16,
    backgroundColor: 'transparent',
    minHeight: 64,
  },
  libraryInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libraryName: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  libraryCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  createOptionBorder: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  createOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
