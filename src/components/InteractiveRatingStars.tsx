import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, X } from 'lucide-react-native';
import { useAtomValue } from 'jotai';

import { userAtom } from '../atoms/user';
import { useBookRating } from '../hooks/useBookRating';
import { AuthBottomSheet } from './Auth/AuthBottomSheet';

interface InteractiveRatingStarsProps {
  isbn: string;
  size?: number;
}

// 별점을 표시하고 상호작용할 수 있는 컴포넌트
export const InteractiveRatingStars: React.FC<InteractiveRatingStarsProps> = ({
  isbn,
  size = 20,
}) => {
  const {
    userRating,
    isRatingHovered,
    hoveredRating,
    handleRatingClick,
    handleRatingHover,
    handleRatingLeave,
    removeRating,
  } = useBookRating(isbn);
  const currentUser = useAtomValue(userAtom);
  const [authBottomSheetVisible, setAuthBottomSheetVisible] = useState(false);

  // 별 클릭 핸들러 (로그인 체크 추가)
  const handleStarClick = useCallback(
    (star: number) => {
      if (!currentUser) {
        setAuthBottomSheetVisible(true);
        return;
      }
      // 로그인 상태에서만 별점 상태 업데이트
      handleRatingClick(star);
    },
    [currentUser, handleRatingClick]
  );

  // 별 호버 핸들러 (모바일에서는 사용하지 않지만 일관성을 위해 유지)
  const handleStarHover = useCallback(
    (star: number) => {
      handleRatingHover(star);
    },
    [handleRatingHover]
  );

  // 별점 취소 핸들러
  const handleRemoveRating = useCallback(() => {
    if (removeRating) {
      removeRating();
    }
  }, [removeRating]);

  // x버튼 호버 시 별점 호버 상태 해제 (모바일에서는 사용하지 않지만 일관성을 위해 유지)
  const handleXButtonHover = useCallback(() => {
    handleRatingLeave();
  }, [handleRatingLeave]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.starsContainer}>
          {Array.from({ length: 5 }, (_, i) => i + 1).map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => handleStarClick(star)}
              style={styles.starButton}
              activeOpacity={0.7}
            >
              <Star
                size={size}
                color={
                  (isRatingHovered ? hoveredRating >= star : userRating >= star)
                    ? '#FCD34D'
                    : '#D1D5DB'
                }
                fill={
                  (isRatingHovered ? hoveredRating >= star : userRating >= star)
                    ? '#FCD34D'
                    : 'transparent'
                }
              />
            </TouchableOpacity>
          ))}
        </View>
        {userRating > 0 && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveRating}
            activeOpacity={0.7}
          >
            <X size={size * 0.7} color='#6B7280' />
          </TouchableOpacity>
        )}
      </View>

      {/* 로그인 다이얼로그 */}
      <AuthBottomSheet
        isVisible={authBottomSheetVisible}
        onClose={() => setAuthBottomSheetVisible(false)}
        initialMode='login'
      />
    </>
  );
};

// Fallback for rating stars while loading
export const InteractiveRatingStarsFallback: React.FC<{ size?: number }> = ({ size = 20 }) => {
  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} size={size} color='#E5E7EB' fill='transparent' />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starButton: {
    padding: 2,
  },
  removeButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
    marginLeft: 4,
  },
});
