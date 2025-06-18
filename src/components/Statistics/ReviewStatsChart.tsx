import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getReviewStats } from '../../apis/user/user';
import { ChartColors } from '../../constants/colors';

interface ReviewStatsChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const ReviewStatsChart: React.FC<ReviewStatsChartProps> = ({ userId }) => {
  const { data, isLoading } = useSuspenseQuery({
    queryKey: ['reviewStats', userId],
    queryFn: () => getReviewStats(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>리뷰 통계</Text>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 데이터가 없는 경우
  if (data.totalReviews === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>리뷰 통계</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>작성한 리뷰가 없습니다.</Text>
        </View>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: ChartColors.background,
    backgroundGradientTo: ChartColors.background,
    color: (opacity = 1) => `rgba(147, 197, 253, ${opacity})`, // blue-300
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  // 월별 리뷰 수 차트 데이터 (최근 6개월)
  const monthlyChartData =
    data.monthlyReviewCounts.length > 0
      ? {
          labels: data.monthlyReviewCounts.slice(-6).map(item => {
            const [year, month] = item.month.split('-');
            return `${month}월`;
          }),
          datasets: [
            {
              data: data.monthlyReviewCounts.slice(-6).map(item => item.count),
              color: (opacity = 1) => `rgba(147, 197, 253, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        }
      : null;

  // 리뷰 유형별 분포 차트 데이터
  const typeDistributionData =
    data.reviewTypeDistribution.length > 0
      ? data.reviewTypeDistribution.map((item, index) => ({
          name: item.type,
          population: item.percentage,
          color: ChartColors.PASTEL_COLORS[index % ChartColors.PASTEL_COLORS.length],
          legendFontColor: ChartColors.text,
          legendFontSize: 12,
        }))
      : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>리뷰 통계</Text>

      {/* 요약 정보 */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{data.totalReviews}</Text>
          <Text style={styles.summaryLabel}>총 리뷰</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{Math.round(data.averageReviewLength)}</Text>
          <Text style={styles.summaryLabel}>평균 글자수</Text>
        </View>
      </View>

      {/* 월별 리뷰 수 차트 */}
      {monthlyChartData && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>월별 리뷰 작성 수</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={monthlyChartData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />
          </View>
        </View>
      )}

      {/* 리뷰 유형별 분포 */}
      {typeDistributionData && typeDistributionData.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>리뷰 유형별 분포</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={typeDistributionData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              accessor='population'
              backgroundColor='transparent'
              paddingLeft='15'
              center={[10, 10]}
              absolute
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: ChartColors.text,
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: ChartColors.grid,
    borderRadius: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6', // blue-500
  },
  summaryLabel: {
    fontSize: 12,
    color: ChartColors.lightText,
    marginTop: 4,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ChartColors.text,
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
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
  noDataContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: ChartColors.lightText,
    textAlign: 'center',
  },
});
