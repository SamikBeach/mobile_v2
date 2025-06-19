import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Switch } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Globe } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getFollowerStats } from '../../apis/user/user';
import { ChartColors } from '../../constants/colors';

interface FollowerStatsChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const FollowerStatsChart: React.FC<FollowerStatsChartProps> = ({ userId }) => {
  const [isPublic, setIsPublic] = useState(true);

  const { data } = useSuspenseQuery({
    queryKey: ['followerStats', userId],
    queryFn: () => getFollowerStats(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>팔로워 통계</Text>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 팔로워 증가 데이터
  const followerGrowthData = {
    labels: data.followerGrowth.slice(-6).map(item => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}월`;
    }),
    datasets: [
      {
        data: data.followerGrowth.slice(-6).map(item => item.count),
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: ChartColors.background,
    backgroundGradientTo: ChartColors.background,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>팔로워 통계</Text>
        <View style={styles.switchContainer}>
          <View style={styles.switchWrapper}>
            <Globe size={16} color='#64748B' />
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
              thumbColor={isPublic ? '#FFFFFF' : '#F8FAFC'}
              ios_backgroundColor='#F1F5F9'
              style={styles.switch}
            />
          </View>
        </View>
      </View>

      {/* 주요 지표 */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{data.followersCount}</Text>
          <Text style={styles.metricLabel}>팔로워</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{data.followingCount}</Text>
          <Text style={styles.metricLabel}>팔로잉</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {data.followersCount > 0 ? (data.followingCount / data.followersCount).toFixed(1) : '0'}
          </Text>
          <Text style={styles.metricLabel}>팔로우 비율</Text>
        </View>
      </View>

      {/* 차트 */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>팔로워 증가 추이 (최근 6개월)</Text>
        <LineChart
          data={followerGrowthData}
          width={screenWidth - 64}
          height={200}
          chartConfig={chartConfig}
          style={styles.chart}
          bezier
        />
      </View>
    </View>
  );
};

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
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: ChartColors.grid,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22C55E',
  },
  metricLabel: {
    fontSize: 12,
    color: ChartColors.lightText,
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: ChartColors.text,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 8,
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
});
