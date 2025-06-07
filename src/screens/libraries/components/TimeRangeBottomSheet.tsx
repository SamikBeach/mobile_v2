import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Calendar } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

interface TimeRangeOption {
  value: string;
  label: string;
}

interface TimeRangeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedTimeRange: string;
  onTimeRangeChange: (range: string) => void;
  timeRangeOptions: TimeRangeOption[];
}

export const TimeRangeBottomSheet: React.FC<TimeRangeBottomSheetProps> = ({
  visible,
  onClose,
  selectedTimeRange,
  onTimeRangeChange,
  timeRangeOptions,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleTimeRangeSelect = (rangeValue: string) => {
    onTimeRangeChange(rangeValue);
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

  useEffect(() => {
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
        {timeRangeOptions.map(option => {
          const isSelected = selectedTimeRange === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={styles.optionItem}
              onPress={() => handleTimeRangeSelect(option.value)}
            >
              <View style={styles.optionLeft}>
                <Calendar size={16} color={isSelected ? '#1D4ED8' : '#6B7280'} />
                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                  {option.label}
                </Text>
              </View>
              {isSelected && <Check size={20} color='#1D4ED8' />}
            </TouchableOpacity>
          );
        })}
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
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
