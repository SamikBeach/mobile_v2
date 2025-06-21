import React, { useState, Suspense } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Star, Lock, MessageSquare, Clock, TrendingUp, Globe } from 'lucide-react-native';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviewStats, getRatingStats, updateStatisticsSetting } from '../../apis/user';
import { ReviewStatsResponse, RatingStatsResponse } from '../../apis/user/types';
import { useCurrentUser } from '../../hooks';
import { LoadingSpinner } from '../LoadingSpinner';

interface ReviewSummaryStatsChartProps {
  userId: number;
}

const ReviewSummaryStatsChart: React.FC<ReviewSummaryStatsChartProps> = ({ userId }) => {
  const [isPublic, setIsPublic] = useState(true);
  const CHART_TITLE = '리뷰 요약';

  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;
  const queryClient = useQueryClient();

  const { data: reviewData } = useSuspenseQuery<ReviewStatsResponse>({
    queryKey: ['reviewStats', userId],
    queryFn: () => getReviewStats(userId),
  });

  const { data: ratingData } = useSuspenseQuery<RatingStatsResponse>({
    queryKey: ['ratingStats', userId],
    queryFn: () => getRatingStats(userId),
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (isPublic: boolean) => updateStatisticsSetting({ isReviewStatsPublic: isPublic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewStats', userId] });
      queryClient.invalidateQueries({ queryKey: ['ratingStats', userId] });
    },
  });

  React.useEffect(() => {
    setIsPublic(reviewData.isPublic);
  }, [reviewData.isPublic]);

  // 데이터가 비공개인 경우
  if ((!reviewData.isPublic || !ratingData.isPublic) && !isMyProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{CHART_TITLE}</Text>
        </View>
        <View style={styles.privateContainer}>
          <Lock size={48} color='#9CA3AF' />
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 데이터가 없는 경우
  if (reviewData.totalReviews === 0 && ratingData.ratingDistribution.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{CHART_TITLE}</Text>
          {isMyProfile && (
            <View style={styles.privacyToggle}>
              <Text style={styles.privacyLabel}>공개</Text>
              <Switch
                value={isPublic}
                onValueChange={value => {
                  setIsPublic(value);
                  updatePrivacyMutation.mutate(value);
                }}
              />
            </View>
          )}
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>리뷰 및 평점 데이터가 없습니다</Text>
        </View>
      </View>
    );
  }

  // 가상 높은 평점 도서 데이터 (실제로는 API에서 가져와야 함)
  const highestRatedBooks = [
    { title: '사피엔스', author: '유발 하라리', rating: 5 },
    { title: '파이돈', author: '플라톤', rating: 5 },
    { title: '데미안', author: '헤르만 헤세', rating: 5 },
  ];

  // 요약 통계 계산
  const summaryStats = [
    {
      icon: MessageSquare,
      iconColor: '#3B82F6',
      iconBg: '#EFF6FF',
      label: '총 리뷰',
      value: `${reviewData.totalReviews}개`,
    },
    {
      icon: TrendingUp,
      iconColor: '#10B981',
      iconBg: '#ECFDF5',
      label: '평균 길이',
      value: `${Math.round(reviewData.averageReviewLength)}자`,
    },
    {
      icon: Star,
      iconColor: '#F59E0B',
      iconBg: '#FFFBEB',
      label: '평균 평점',
      value: `${ratingData.averageRating.toFixed(1)}점`,
    },
    {
      icon: Clock,
      iconColor: '#8B5CF6',
      iconBg: '#F5F3FF',
      label: '총 평점',
      value: `${ratingData.ratingDistribution.reduce((sum, item) => sum + item.count, 0)}개`,
    },
  ];

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{CHART_TITLE}</Text>
          <Text style={styles.subtitle}>리뷰와 평점 활동 요약</Text>
        </View>
        {isMyProfile && (
          <View style={styles.privacyToggle}>
            <View style={styles.switchWrapper}>
              <Globe size={16} color='#64748B' />
              <Switch
                value={isPublic}
                onValueChange={value => {
                  setIsPublic(value);
                  updatePrivacyMutation.mutate(value);
                }}
                trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                thumbColor={isPublic ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor='#F1F5F9'
                style={styles.switch}
              />
            </View>
          </View>
        )}
      </View>

      <View>
        {/* 요약 통계 카드들 */}
        <View style={styles.summaryGrid}>
          {summaryStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View key={index} style={styles.summaryCard}>
                <View style={[styles.summaryIconContainer, { backgroundColor: stat.iconBg }]}>
                  <IconComponent size={20} color={stat.iconColor} />
                </View>
                <Text style={styles.summaryValue}>{stat.value}</Text>
                <Text style={styles.summaryLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* 가장 높은 평점의 책들 */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>가장 높은 평점의 책</Text>
          <View style={styles.booksList}>
            {highestRatedBooks.map((book, index) => (
              <View key={index} style={styles.bookItem}>
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>{book.author}</Text>
                </View>
                <View style={styles.bookRating}>
                  {Array(book.rating)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} size={16} color='#FCD34D' fill='#FCD34D' />
                    ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 리뷰 유형별 분포 */}
        {reviewData.reviewTypeDistribution.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>리뷰 유형별 분포</Text>
            <View style={styles.typesList}>
              {reviewData.reviewTypeDistribution.map((type, index) => (
                <View key={index} style={styles.typeItem}>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeName}>{type.type}</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${type.percentage}%`,
                            backgroundColor: [
                              '#3B82F6', // blue-500
                              '#EC4899', // pink-500
                              '#F59E0B', // amber-500
                              '#10B981', // green-500
                              '#8B5CF6', // violet-500
                            ][index % 5],
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.typePercentage}>{type.percentage.toFixed(1)}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const ReviewSummaryStatsChartWrapper: React.FC<ReviewSummaryStatsChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <ReviewSummaryStatsChart {...props} />
  </Suspense>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  privacyToggle: {
    justifyContent: 'flex-end',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switch: {
    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
    marginLeft: 2,
  },
  privacyLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  booksList: {
    gap: 8,
  },
  bookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  bookInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#6B7280',
  },
  bookRating: {
    flexDirection: 'row',
    gap: 2,
  },
  typesList: {
    gap: 12,
  },
  typeItem: {
    paddingVertical: 8,
  },
  typeInfo: {
    gap: 6,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  typePercentage: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  privateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    gap: 12,
  },
  privateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default ReviewSummaryStatsChartWrapper;
