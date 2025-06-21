import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Check, Star, Users, Bookmark, Calendar, ArrowDownAZ } from 'lucide-react-native';

interface SortBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

const sortOptions = [
  { value: 'rating-desc', label: '평점 높은순' },
  { value: 'reviews-desc', label: '리뷰 많은순' },
  { value: 'library-desc', label: '서재 추가 많은순' },
  { value: 'publishDate-desc', label: '출간일순' },
  { value: 'title-asc', label: '제목순' },
];

// Get sort icon
const getSortIcon = (sortOption: string, isSelected: boolean) => {
  const color = isSelected ? '#1D4ED8' : '#6B7280';
  const size = 16;

  switch (sortOption) {
    case 'rating-desc':
      return <Star size={size} color={color} />;
    case 'reviews-desc':
      return <Users size={size} color={color} />;
    case 'library-desc':
      return <Bookmark size={size} color={color} />;
    case 'publishDate-desc':
      return <Calendar size={size} color={color} />;
    case 'title-asc':
      return <ArrowDownAZ size={size} color={color} />;
    default:
      return <Star size={size} color={color} />;
  }
};

export const SortBottomSheet: React.FC<SortBottomSheetProps> = ({
  visible,
  onClose,
  selectedSort,
  onSortChange,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleSortSelect = (value: string) => {
    onSortChange(value);
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
        <Text style={styles.headerTitle}>정렬</Text>
      </View>

      <View style={styles.optionsContainer}>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.value}
            style={styles.optionItem}
            onPress={() => handleSortSelect(option.value)}
          >
            <View style={styles.optionLeftContent}>
              {getSortIcon(option.value, selectedSort === option.value)}
              <Text
                style={[
                  styles.optionText,
                  selectedSort === option.value && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </View>
            {selectedSort === option.value && <Check size={20} color='#1D4ED8' />}
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
  optionLeftContent: {
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
