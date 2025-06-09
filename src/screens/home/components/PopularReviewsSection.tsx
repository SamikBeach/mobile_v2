import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Users } from 'lucide-react-native';
import { ReviewCard, SkeletonLoader } from '../../../components';
import { useHomePopularReviewsQuery } from '../../../hooks/useHomeQueries';
import { HomeReviewPreview } from '../../../apis/review/types';

interface PopularReviewsSectionProps {
  onReviewPress?: (review: HomeReviewPreview) => void;
  onMorePress?: () => void;
}

export const PopularReviewsSection: React.FC<PopularReviewsSectionProps> = ({
  onReviewPress,
  onMorePress,
}) => {
  const { reviews, error } = useHomePopularReviewsQuery(2);

  const handleReviewPress = (review: HomeReviewPreview) => {
    if (onReviewPress) {
      onReviewPress(review);
    } else {
      Alert.alert('리뷰 상세', `${review.author.username}님의 리뷰를 선택했습니다.`);
    }
  };

  const handleMorePress = () => {
    if (onMorePress) {
      onMorePress();
    } else {
      Alert.alert('더보기', '커뮤니티 전체 보기');
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>데이터를 불러오는 중 오류가 발생했습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Users size={20} color='#F59E0B' />
          <Text style={styles.title}>커뮤니티 인기글</Text>
        </View>
        <TouchableOpacity onPress={handleMorePress}>
          <Text style={styles.moreButton}>더보기</Text>
        </TouchableOpacity>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>인기 커뮤니티 글이 없습니다.</Text>
        </View>
      ) : (
        <View style={styles.reviewsList}>
          {reviews.slice(0, 2).map((review, index) => (
            <View key={review.id} style={index > 0 ? styles.reviewItemSpacing : null}>
              <ReviewCard review={review} onPress={() => handleReviewPress(review)} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export const PopularReviewsSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Users size={20} color='#F59E0B' />
          <Text style={styles.title}>커뮤니티 인기글</Text>
        </View>
        <Text style={styles.moreButton}>더보기</Text>
      </View>
      <View style={styles.reviewsList}>
        {[...Array(2)].map((_, index) => (
          <View key={index} style={index > 0 ? styles.reviewItemSpacing : null}>
            <SkeletonLoader.ReviewCardSkeleton />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  moreButton: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  reviewsList: {
    gap: 8,
  },
  reviewItemSpacing: {
    marginTop: 8,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});
