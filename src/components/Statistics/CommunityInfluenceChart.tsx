import React, { Suspense } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Star, ThumbsUp, Globe } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getReviewInfluence } from '../../apis/user';
import { ReviewInfluenceResponse } from '../../apis/user/types';
import { useCurrentUser, useStatisticsSettings } from '../../hooks';
import { LoadingSpinner } from '../LoadingSpinner';
import { ChartColors } from '../../constants/colors';

interface CommunityInfluenceChartProps {
  userId: number;
}

const CommunityInfluenceChart: React.FC<CommunityInfluenceChartProps> = ({ userId }) => {
  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;

  // 항상 useStatisticsSettings를 호출하되 isMyProfile이 아닐 때는 결과를 무시
  const statisticsHook = useStatisticsSettings(userId);
  const { settings, handleUpdateSetting } = isMyProfile
    ? statisticsHook
    : { settings: null, handleUpdateSetting: () => {} };

  const { data } = useSuspenseQuery<ReviewInfluenceResponse>({
    queryKey: ['reviewInfluence', userId],
    queryFn: () => getReviewInfluence(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic && !isMyProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>커뮤니티 영향력</Text>
        </View>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 인기 게시글 데이터 가공 (최대 표시할 글자 수 제한)
  const processedPopularPosts = data.popularReviews
    ? data.popularReviews.slice(0, 5).map(review => ({
        ...review,
        // 게시글 내용 텍스트 길이 제한 (25자까지만 표시)
        shortContent:
          review.content.length > 25 ? `${review.content.substring(0, 25)}...` : review.content,
      }))
    : [];

  // 데이터 값이 없는 경우 기본값 표시
  const averageLikesPerReview = data.averageLikesPerReview || 0;
  const communityContributionScore = data.communityContributionScore || 0;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>커뮤니티 영향력</Text>
        {isMyProfile && (
          <View style={styles.switchContainer}>
            <View style={styles.switchWrapper}>
              <Globe size={16} color='#64748B' />
              <Switch
                value={settings?.isReviewInfluencePublic || false}
                onValueChange={value => handleUpdateSetting('isReviewInfluencePublic', value)}
                trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                thumbColor={settings?.isReviewInfluencePublic ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor='#F1F5F9'
                style={styles.switch}
              />
            </View>
          </View>
        )}
      </View>

      {/* 통계 카드들 */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.blueCard]}>
          <View style={styles.statCardHeader}>
            <View style={styles.iconContainer}>
              <ThumbsUp size={14} color='#3B82F6' />
            </View>
            <View style={styles.statCardContent}>
              <Text style={styles.statLabel}>게시글당 좋아요</Text>
              <Text style={styles.statValue}>{averageLikesPerReview.toFixed(1)}개</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statCard, styles.purpleCard]}>
          <View style={styles.statCardHeader}>
            <View style={styles.iconContainer}>
              <Star size={14} color='#8B5CF6' />
            </View>
            <View style={styles.statCardContent}>
              <Text style={styles.statLabel}>커뮤니티 기여도</Text>
              <Text style={styles.statValue}>{communityContributionScore.toFixed(0)}점</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 인기 게시글 섹션 */}
      <View style={styles.popularPostsSection}>
        <Text style={styles.sectionTitle}>인기 게시글</Text>

        {processedPopularPosts.length > 0 ? (
          <View style={styles.popularPostsList}>
            {processedPopularPosts.map((post, index) => (
              <View key={post.id} style={styles.popularPostItem}>
                <View style={styles.popularPostContent}>
                  <View style={styles.postRank}>
                    <Text style={styles.postRankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.postContentText} numberOfLines={1}>
                    {post.shortContent}
                  </Text>
                </View>
                <View style={styles.postLikes}>
                  <ThumbsUp size={12} color='#6B7280' />
                  <Text style={styles.postLikesText}>{post.likes}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>인기 게시글 데이터가 없습니다</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const CommunityInfluenceChartWrapper: React.FC<CommunityInfluenceChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <CommunityInfluenceChart {...props} />
  </Suspense>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: ChartColors.text,
  },
  switchContainer: {
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
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
  },
  blueCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  purpleCard: {
    backgroundColor: '#F5F3FF',
    borderColor: '#C4B5FD',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  popularPostsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: ChartColors.text,
    marginBottom: 8,
  },
  popularPostsList: {
    gap: 6,
  },
  popularPostItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  popularPostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
    overflow: 'hidden',
  },
  postRank: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postRankText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  postContentText: {
    fontSize: 10,
    color: '#6B7280',
    flex: 1,
  },
  postLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 8,
  },
  postLikesText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F2937',
  },
  privateContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privateText: {
    fontSize: 14,
    color: ChartColors.lightText,
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  noDataText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default CommunityInfluenceChartWrapper;
