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
      <Skeleton style={styles.bookCoverSkeleton} />
      <View style={styles.bookContentSkeleton}>
        <Skeleton width='100%' height={16} style={{ marginBottom: 8 }} />
        <Skeleton width='70%' height={14} style={{ marginBottom: 8 }} />
        <Skeleton width='50%' height={12} style={{ marginBottom: 8 }} />
        <Skeleton width='40%' height={12} />
      </View>
    </View>
  );
};

export const LibraryCardSkeleton: React.FC = () => {
  return (
    <View style={styles.libraryCardContainer}>
      <View style={styles.libraryHeaderSkeleton}>
        <View style={styles.libraryOwnerSkeleton}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
          <View>
            <Skeleton width={80} height={14} style={{ marginBottom: 4 }} />
            <Skeleton width={120} height={16} />
          </View>
        </View>
        <Skeleton width={40} height={20} borderRadius={10} />
      </View>
      <Skeleton width='100%' height={40} style={{ marginBottom: 12 }} />
      <View style={styles.libraryStatsSkeleton}>
        <Skeleton width={60} height={12} />
        <Skeleton width={80} height={12} />
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
          <View>
            <Skeleton width={80} height={14} style={{ marginBottom: 4 }} />
            <Skeleton width={60} height={12} />
          </View>
        </View>
        <Skeleton width={60} height={16} />
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
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookCoverSkeleton: {
    aspectRatio: 3 / 4.5,
  },
  bookContentSkeleton: {
    padding: 10,
  },
  libraryCardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  libraryHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  libraryOwnerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  libraryStatsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewCardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  reviewStatsSkeleton: {
    flexDirection: 'row',
    gap: 16,
  },
});
