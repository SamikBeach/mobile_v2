import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Check } from 'lucide-react-native';

interface TimeRangeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedTimeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const timeRangeOptions = [
  { value: 'all', label: '전체 기간' },
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'year', label: '올해' },
];

export const TimeRangeBottomSheet: React.FC<TimeRangeBottomSheetProps> = ({
  visible,
  onClose,
  selectedTimeRange,
  onTimeRangeChange,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleTimeRangeSelect = (value: string) => {
    onTimeRangeChange(value);
    bottomSheetModalRef.current?.dismiss();
  };

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Present modal when visible becomes true
  React.useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

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
        <Text style={styles.headerTitle}>기간</Text>
      </View>

      <View style={styles.optionsContainer}>
        {timeRangeOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionItem}
            onPress={() => handleTimeRangeSelect(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                selectedTimeRange === option.value && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
            {selectedTimeRange === option.value && <Check size={20} color='#1D4ED8' />}
          </TouchableOpacity>
        ))}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  optionsContainer: {
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    minHeight: 56,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '400',
  },
  selectedOptionText: {
    color: '#1D4ED8',
    fontWeight: '500',
  },
});
