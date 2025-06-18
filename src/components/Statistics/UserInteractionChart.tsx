import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getUserInteraction } from '../../apis/user/user';
import { ChartColors } from '../../constants/colors';

interface UserInteractionChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const UserInteractionChart: React.FC<UserInteractionChartProps> = ({ userId }) => {
  const { data, isLoading } = useSuspenseQuery({
    queryKey: ['userInteraction', userId],
    queryFn: () => getUserInteraction(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>사용자 상호작용</Text>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 데이터가 없는 경우
  const hasInteractionData =
    data.totalLikesReceived > 0 ||
    data.totalCommentsReceived > 0 ||
    data.totalLikesGiven > 0 ||
    data.totalCommentsCreated > 0;

  if (!hasInteractionData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>사용자 상호작용</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>상호작용 데이터가 없습니다.</Text>
        </View>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: ChartColors.background,
    backgroundGradientTo: ChartColors.background,
    color: (opacity = 1) => `rgba(249, 168, 212, ${opacity})`, // pink-300
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  // 상호작용 요약 데이터
  const interactionSummaryData = {
    labels: ['받은 좋아요', '받은 댓글', '준 좋아요', '작성 댓글'],
    datasets: [
      {
        data: [
          data.totalLikesReceived,
          data.totalCommentsReceived,
          data.totalLikesGiven,
          data.totalCommentsCreated,
        ],
        color: (opacity = 1) => `rgba(249, 168, 212, ${opacity})`,
      },
    ],
  };

  // 월별 받은 좋아요 추이 (최근 6개월)
  const monthlyLikesData =
    data.monthlyLikesReceived.length > 0
      ? {
          labels: data.monthlyLikesReceived.slice(-6).map(item => {
            const [year, month] = item.month.split('-');
            return `${month}월`;
          }),
          datasets: [
            {
              data: data.monthlyLikesReceived.slice(-6).map(item => item.count),
              color: (opacity = 1) => `rgba(249, 168, 212, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        }
      : null;

  // 월별 받은 댓글 추이 (최근 6개월)
  const monthlyCommentsData =
    data.monthlyCommentsReceived.length > 0
      ? {
          labels: data.monthlyCommentsReceived.slice(-6).map(item => {
            const [year, month] = item.month.split('-');
            return `${month}월`;
          }),
          datasets: [
            {
              data: data.monthlyCommentsReceived.slice(-6).map(item => item.count),
              color: (opacity = 1) => `rgba(147, 197, 253, ${opacity})`, // blue-300
              strokeWidth: 2,
            },
          ],
        }
      : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>사용자 상호작용</Text>

      {/* 참여도 점수 */}
      <View style={styles.engagementContainer}>
        <Text style={styles.engagementLabel}>참여도 점수</Text>
        <Text style={styles.engagementValue}>{(data.engagementRate * 100).toFixed(1)}%</Text>
      </View>

      {/* 상호작용 요약 */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data.totalLikesReceived}</Text>
            <Text style={styles.summaryLabel}>받은 좋아요</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data.totalCommentsReceived}</Text>
            <Text style={styles.summaryLabel}>받은 댓글</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data.totalLikesGiven}</Text>
            <Text style={styles.summaryLabel}>준 좋아요</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{data.totalCommentsCreated}</Text>
            <Text style={styles.summaryLabel}>작성한 댓글</Text>
          </View>
        </View>
      </View>

      {/* 상호작용 요약 차트 */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>상호작용 요약</Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={interactionSummaryData}
            width={screenWidth - 64}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            yAxisLabel=''
            yAxisSuffix=''
          />
        </View>
      </View>

      {/* 월별 받은 좋아요 추이 */}
      {monthlyLikesData && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>월별 받은 좋아요</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={monthlyLikesData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />
          </View>
        </View>
      )}

      {/* 월별 받은 댓글 추이 */}
      {monthlyCommentsData && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>월별 받은 댓글</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={monthlyCommentsData}
              width={screenWidth - 64}
              height={200}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(147, 197, 253, ${opacity})`,
              }}
              style={styles.chart}
              bezier
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
  engagementContainer: {
    backgroundColor: ChartColors.grid,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  engagementLabel: {
    fontSize: 12,
    color: ChartColors.lightText,
    marginBottom: 4,
  },
  engagementValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ec4899', // pink-500
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: ChartColors.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: ChartColors.lightText,
    marginTop: 4,
    textAlign: 'center',
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
