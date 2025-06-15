import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Edit3, Trash2 } from 'lucide-react-native';

interface ReviewActionBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  onEdit: () => void;
  onDelete: () => void;
}

export const ReviewActionBottomSheet: React.FC<ReviewActionBottomSheetProps> = ({
  bottomSheetRef,
  onEdit,
  onDelete,
}) => {
  const handleEdit = () => {
    bottomSheetRef.current?.dismiss();
    onEdit();
  };

  const handleDelete = () => {
    bottomSheetRef.current?.dismiss();
    onDelete();
  };

  // Backdrop 컴포넌트 렌더링
  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={['20%']}
      enablePanDownToClose
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.actionList}>
          <TouchableOpacity style={styles.actionItem} onPress={handleEdit}>
            <Edit3 size={20} color='#374151' />
            <Text style={styles.actionText}>수정하기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
            <Trash2 size={20} color='#EF4444' />
            <Text style={[styles.actionText, styles.deleteText]}>삭제하기</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionList: {
    gap: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  deleteText: {
    color: '#EF4444',
  },
});
