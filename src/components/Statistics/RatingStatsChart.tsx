import React, { useState, Suspense } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Switch } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Star, Lock, Globe } from 'lucide-react-native';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRatingStats, updateStatisticsSetting } from '../../apis/user';
import { RatingStatsResponse } from '../../apis/user/types';
import { useCurrentUser } from '../../hooks';
import { LoadingSpinner } from '../LoadingSpinner';

interface RatingStatsChartProps {
  userId: number;
}

type TabType = 'distribution' | 'categories' | 'monthly';

// 차트 색상 정의 (노란색 계열)
const CHART_COLORS = {
  distribution: '#fcd34d', // amber-300
  categories: '#fcd34d',
  monthly: '#fcd34d',
};

// 날짜 포맷팅 함수: YYYY-MM -> YYYY년 M월
const formatMonth = (monthStr: string): string => {
  try {
    if (!monthStr || !monthStr.includes('-')) return monthStr;

    const [year, month] = monthStr.split('-');
    return `${year}년 ${month}월`;
  } catch {
    return monthStr;
  }
};

const RatingStatsChart: React.FC<RatingStatsChartProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('distribution');
  const [isPublic, setIsPublic] = useState(true);
  const CHART_TITLE = '평점';

  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;
  const queryClient = useQueryClient();

  const { data, isLoading } = useSuspenseQuery<RatingStatsResponse>({
    queryKey: ['ratingStats', userId],
    queryFn: () => getRatingStats(userId),
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (isPublic: boolean) => updateStatisticsSetting({ isRatingStatsPublic: isPublic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratingStats', userId] });
    },
  });

  React.useEffect(() => {
    setIsPublic(data.isPublic);
  }, [data.isPublic]);

  // 데이터가 비공개인 경우
  if (!data.isPublic && !isMyProfile) {
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
  if (
    (!data.ratingDistribution || data.ratingDistribution.length === 0) &&
    (!data.categoryRatings || data.categoryRatings.length === 0) &&
    (!data.monthlyAverageRatings || data.monthlyAverageRatings.length === 0)
  ) {
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
          <Text style={styles.noDataText}>평점 데이터가 없습니다</Text>
        </View>
      </View>
    );
  }

  // 평점 분포 데이터 전처리 (빈 평점 채우기)
  const fullRatingDistribution = Array.from({ length: 5 }, (_, i) => {
    const rating = i + 1;
    const existingData = data.ratingDistribution.find(item => item.rating === rating);
    return existingData ? existingData : { rating, count: 0 };
  });

  // 카테고리 평점 상위 표시
  const sortedCategoryRatings = [...data.categoryRatings]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 8);

  // 월별 데이터 처리
  const formattedMonthlyData = data.monthlyAverageRatings.map(item => ({
    ...item,
    formattedMonth: formatMonth(item.month),
  }));

  // 탭 옵션
  const tabOptions = [
    { id: 'distribution' as TabType, name: '평점 분포' },
    { id: 'categories' as TabType, name: '카테고리별' },
    { id: 'monthly' as TabType, name: '월별 추이' },
  ];

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{CHART_TITLE}</Text>
          <View style={styles.subtitleContainer}>
            <Star size={14} color='#fcd34d' fill='#fcd34d' />
            <Text style={styles.subtitle}>평균 {data.averageRating.toFixed(1)}점</Text>
          </View>
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

      {/* 탭 선택 */}
      <View style={styles.tabContainer}>
        {tabOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[styles.tabButton, activeTab === option.id && styles.tabButtonActive]}
            onPress={() => setActiveTab(option.id)}
          >
            <Text
              style={[styles.tabButtonText, activeTab === option.id && styles.tabButtonTextActive]}
            >
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 차트 영역 */}
      <View style={styles.chartContainer}>
        {activeTab === 'distribution' ? (
          fullRatingDistribution.length > 0 ? (
            <BarChart
              data={{
                labels: fullRatingDistribution.map(item => `${item.rating}점`),
                datasets: [
                  {
                    data: fullRatingDistribution.map(item => item.count),
                    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                  },
                ],
              }}
              width={chartWidth}
              height={250}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  strokeWidth: 1,
                  stroke: '#f3f4f6',
                },
                propsForLabels: {
                  fontSize: 11,
                },
                barPercentage: 0.7,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              withHorizontalLabels
              withVerticalLabels
              yAxisLabel=''
              yAxisSuffix=''
              fromZero
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>평점 분포 데이터가 없습니다</Text>
            </View>
          )
        ) : activeTab === 'categories' ? (
          sortedCategoryRatings.length > 0 ? (
            <View style={styles.categoryChartContainer}>
              {sortedCategoryRatings.map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <View style={styles.categoryRatingContainer}>
                    <View style={styles.categoryBar}>
                      <View
                        style={[
                          styles.categoryBarFill,
                          { width: `${(item.averageRating / 5) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryRating}>{item.averageRating.toFixed(1)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>카테고리별 평점 데이터가 없습니다</Text>
            </View>
          )
        ) : formattedMonthlyData.length > 0 ? (
          <LineChart
            data={{
              labels: formattedMonthlyData.slice(-10).map(item => {
                const [, month] = item.month.split('-');
                return `${Number(month)}월`;
              }),
              datasets: [
                {
                  data: formattedMonthlyData.slice(-10).map(item => item.averageRating),
                  color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={chartWidth}
            height={250}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#f59e0b',
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                strokeWidth: 1,
                stroke: '#f3f4f6',
              },
              propsForLabels: {
                fontSize: 11,
              },
            }}
            yAxisMin={0}
            yAxisMax={5}
            bezier
            style={styles.chart}
            withVerticalLines={false}
            withHorizontalLines
            yAxisLabel=''
            yAxisSuffix=''
            yAxisInterval={1}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>월별 평점 데이터가 없습니다</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const RatingStatsChartWrapper: React.FC<RatingStatsChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <RatingStatsChart {...props} />
  </Suspense>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
  },
  tabButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#2563EB',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  categoryChartContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 6,
    fontWeight: '500',
  },
  categoryRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryBar: {
    flex: 1,
    height: 18,
    backgroundColor: '#F3F4F6',
    borderRadius: 9,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 9,
  },
  categoryRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    minWidth: 35,
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

export default RatingStatsChartWrapper;
