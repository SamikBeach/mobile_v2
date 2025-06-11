import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { ReviewType } from '../apis/review/types';

interface ReviewTypeBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  selectedType: ReviewType;
  onTypeSelect: (type: ReviewType) => void;
  originalType?: ReviewType;
}

// 커뮤니티 카테고리 색상 정의
const communityCategoryColors = {
  general: '#F9FAFB',
  discussion: '#FEF3C7',
  review: '#F3E8FF',
  question: '#DBEAFE',
  meetup: '#E0E7FF',
};

const reviewTypeOptions = [
  { value: 'general' as ReviewType, label: '일반', color: communityCategoryColors.general },
  { value: 'discussion' as ReviewType, label: '토론', color: communityCategoryColors.discussion },
  { value: 'review' as ReviewType, label: '리뷰', color: communityCategoryColors.review },
  { value: 'question' as ReviewType, label: '질문', color: communityCategoryColors.question },
  { value: 'meetup' as ReviewType, label: '모임', color: communityCategoryColors.meetup },
];

export const ReviewTypeBottomSheet: React.FC<ReviewTypeBottomSheetProps> = ({
  bottomSheetRef,
  selectedType,
  onTypeSelect,
  originalType,
}) => {
  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior='close'
      />
    ),
    []
  );

  const handleTypeSelect = (type: ReviewType) => {
    onTypeSelect(type);
    bottomSheetRef.current?.dismiss();
  };

  // 항상 모든 리뷰 타입 옵션을 표시 (총 5가지)
  const filteredOptions = reviewTypeOptions;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={['40%']}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.optionsContainer}>
          {filteredOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionItem, selectedType === option.value && styles.selectedOption]}
              onPress={() => handleTypeSelect(option.value)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={[styles.colorDot, { backgroundColor: option.color }]} />
                <Text
                  style={[
                    styles.optionText,
                    selectedType === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </View>
              {selectedType === option.value && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  handleIndicator: {
    backgroundColor: '#E5E7EB',
    width: 32,
    height: 4,
  },
  optionsContainer: {
    gap: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  selectedOption: {
    backgroundColor: '#EFF6FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  selectedOptionText: {
    color: '#1D4ED8',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
