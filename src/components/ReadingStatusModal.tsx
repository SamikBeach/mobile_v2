import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { ReadingStatusType, StatusTexts } from '../constants';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

interface ReadingStatusModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentStatus: ReadingStatusType | null;
  onStatusSelect: (status: ReadingStatusType | null) => void;
}

export const ReadingStatusModal: React.FC<ReadingStatusModalProps> = ({
  isVisible,
  onClose,
  currentStatus,
  onStatusSelect,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

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

  const handleStatusSelect = (status: ReadingStatusType | null) => {
    onStatusSelect(status);
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

  const getStatusIcon = (status: ReadingStatusType) => {
    switch (status) {
      case ReadingStatusType.WANT_TO_READ:
        return <Text style={styles.emoji}>📚</Text>;
      case ReadingStatusType.READING:
        return <Text style={styles.emoji}>📖</Text>;
      case ReadingStatusType.READ:
        return <Text style={styles.emoji}>✅</Text>;
      default:
        return <Text style={styles.emoji}>📚</Text>;
    }
  };

  const renderContent = () => (
    <BottomSheetView style={styles.contentContainer}>
      <Text style={styles.modalTitle}>읽기 상태 선택</Text>

      <View style={styles.optionsContainer}>
        {Object.values(ReadingStatusType).map(status => {
          const isSelected = currentStatus === status;

          return (
            <TouchableOpacity
              key={status}
              style={[styles.optionItem]}
              onPress={() => handleStatusSelect(status)}
            >
              {getStatusIcon(status)}
              <Text style={[styles.optionText, isSelected && { color: '#3B82F6' }]}>
                {StatusTexts[status]}
              </Text>
              {isSelected && <Check size={20} color='#3B82F6' />}
            </TouchableOpacity>
          );
        })}

        {/* 선택 안함 옵션 */}
        <TouchableOpacity
          style={[
            styles.optionItem,
            styles.noneOptionBorder,
            currentStatus === null && styles.noneOptionSelected,
          ]}
          onPress={() => handleStatusSelect(null)}
        >
          <Text style={styles.emoji}>❌</Text>
          <Text
            style={[
              styles.optionText,
              currentStatus === null ? { color: '#EF4444' } : { color: '#111827' },
            ]}
          >
            {StatusTexts['NONE']}
          </Text>
          {currentStatus === null && <Check size={20} color='#EF4444' />}
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
    paddingBottom: 34,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    paddingTop: 8,
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
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  emoji: {
    fontSize: 22,
    width: 32,
    textAlign: 'center',
  },
  noneOptionBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 4,
    paddingTop: 20,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  noneOptionSelected: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
});
