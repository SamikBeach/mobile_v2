import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateShimmer = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animateShimmer();
  }, [shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const BookCardSkeleton: React.FC = () => {
  return (
    <View style={styles.bookCardContainer}>
      <View style={styles.bookImageContainer}>
        <Skeleton style={styles.bookCoverSkeleton} />
      </View>
      <View style={styles.bookContentSkeleton}>
        <Skeleton width='100%' height={20} style={{ marginBottom: 2 }} />
        <Skeleton width='100%' height={20} style={{ marginBottom: 2 }} />
        <Skeleton width='70%' height={18} style={{ marginBottom: 4 }} />
        <View style={styles.bookRatingSkeleton}>
          <View style={styles.bookRatingItem}>
            <Skeleton width={14} height={14} borderRadius={2} style={{ marginRight: 4 }} />
            <Skeleton width={25} height={13} />
          </View>
          <View style={styles.bookRatingItem}>
            <Skeleton width={14} height={14} borderRadius={2} style={{ marginRight: 4 }} />
            <Skeleton width={20} height={13} />
          </View>
        </View>
      </View>
    </View>
  );
};

export const LibraryCardSkeleton: React.FC = () => {
  return (
    <View style={styles.libraryCardContainer}>
      <View style={styles.libraryHeaderSkeleton}>
        <View style={styles.libraryOwnerSkeleton}>
          <Skeleton width={32} height={32} borderRadius={16} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width={80} height={14} style={{ marginBottom: 2 }} />
            <Skeleton width={60} height={12} />
          </View>
        </View>
        <Skeleton width={40} height={20} borderRadius={12} />
      </View>
      <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
        <Skeleton width='100%' height={14} />
      </View>
      <View style={styles.libraryBooksSkeleton}>
        <Skeleton style={styles.libraryBookImageSkeleton} />
        <Skeleton style={styles.libraryBookImageSkeleton} />
        <Skeleton style={styles.libraryBookImageSkeleton} />
      </View>
      <View style={styles.libraryStatsSkeleton}>
        <Skeleton width={40} height={12} />
        <Skeleton width={40} height={12} />
      </View>
    </View>
  );
};

export const ReviewCardSkeleton: React.FC = () => {
  return (
    <View style={styles.reviewCardContainer}>
      <View style={styles.reviewHeaderSkeleton}>
        <View style={styles.reviewUserSkeleton}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width={80} height={14} style={{ marginBottom: 2 }} />
            <Skeleton width={60} height={12} />
          </View>
        </View>
      </View>
      <Skeleton width='100%' height={60} style={{ marginBottom: 12 }} />
      <View style={styles.reviewBookSkeleton}>
        <Skeleton width={40} height={60} borderRadius={4} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Skeleton width='80%' height={14} style={{ marginBottom: 4 }} />
          <Skeleton width='60%' height={12} />
        </View>
      </View>
      <View style={styles.reviewStatsSkeleton}>
        <Skeleton width={40} height={12} />
        <Skeleton width={40} height={12} />
      </View>
    </View>
  );
};

// SkeletonLoader 객체 export
export const SkeletonLoader = {
  Skeleton,
  BookCardSkeleton,
  LibraryCardSkeleton,
  ReviewCardSkeleton,
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
  },
  bookCardContainer: {
    backgroundColor: 'white',
    overflow: 'hidden',
    width: '100%',
  },
  bookCoverSkeleton: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookContentSkeleton: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  libraryCardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    minHeight: 300,
    flex: 1,
  },
  libraryHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    paddingBottom: 8,
  },
  libraryOwnerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  libraryBooksSkeleton: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  libraryBookImageSkeleton: {
    flex: 1,
    aspectRatio: 5 / 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  libraryStatsSkeleton: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  reviewCardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  reviewHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewUserSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewBookSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewStatsSkeleton: {
    flexDirection: 'row',
    gap: 16,
  },
  bookImageContainer: {
    backgroundColor: 'white',
    width: '100%',
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookRatingSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  bookRatingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
