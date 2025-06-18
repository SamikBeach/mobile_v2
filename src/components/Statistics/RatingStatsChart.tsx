import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getRatingStats } from '../../apis/user/user';
import { ChartColors } from '../../constants/colors';

interface RatingStatsChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

type TabType = 'distribution' | 'categories' | 'monthly';

export const RatingStatsChart: React.FC<RatingStatsChartProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('distribution');

  const { data, isLoading } = useSuspenseQuery({
    queryKey: ['ratingStats', userId],
    queryFn: () => getRatingStats(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>평점 통계</Text>
        <View style={styles.privateContainer}>
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
        <Text style={styles.title}>평점 통계</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>평점 데이터가 없습니다.</Text>
        </View>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: ChartColors.background,
    backgroundGradientTo: ChartColors.background,
    color: (opacity = 1) => `rgba(252, 211, 77, ${opacity})`, // amber-300
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  // 평점 분포 데이터 전처리
  const fullRatingDistribution = Array.from({ length: 5 }, (_, i) => {
    const rating = i + 1;
    const existingData = data.ratingDistribution.find(item => item.rating === rating);
    return existingData ? existingData : { rating, count: 0 };
  });

  const distributionChartData = {
    labels: ['1점', '2점', '3점', '4점', '5점'],
    datasets: [
      {
        data: fullRatingDistribution.map(item => item.count),
        color: (opacity = 1) => `rgba(252, 211, 77, ${opacity})`,
      },
    ],
  };

  // 카테고리별 평점 데이터 (상위 8개)
  const sortedCategoryRatings = [...data.categoryRatings]
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 8);

  const categoryChartData = {
    labels: sortedCategoryRatings.map(item =>
      item.category.length > 6 ? item.category.substring(0, 6) + '..' : item.category
    ),
    datasets: [
      {
        data: sortedCategoryRatings.map(item => item.averageRating),
        color: (opacity = 1) => `rgba(252, 211, 77, ${opacity})`,
      },
    ],
  };

  // 월별 추이 데이터
  const monthlyChartData = {
    labels: data.monthlyAverageRatings.slice(-6).map(item => {
      const [year, month] = item.month.split('-');
      return `${month}월`;
    }),
    datasets: [
      {
        data: data.monthlyAverageRatings.slice(-6).map(item => item.averageRating),
        color: (opacity = 1) => `rgba(252, 211, 77, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const tabOptions = [
    { id: 'distribution' as TabType, name: '평점 분포' },
    { id: 'categories' as TabType, name: '카테고리별' },
    { id: 'monthly' as TabType, name: '월별 추이' },
  ];

  const renderChart = () => {
    switch (activeTab) {
      case 'distribution':
        return (
          <View style={styles.chartContainer}>
            <BarChart
              data={distributionChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              yAxisLabel=''
              yAxisSuffix=''
            />
          </View>
        );
      case 'categories':
        return (
          <View style={styles.chartContainer}>
            <BarChart
              data={categoryChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              yAxisLabel=''
              yAxisSuffix=''
            />
          </View>
        );
      case 'monthly':
        return (
          <View style={styles.chartContainer}>
            <LineChart
              data={monthlyChartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              bezier
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>평점 통계</Text>

      {/* 평균 평점 표시 */}
      <View style={styles.averageContainer}>
        <Text style={styles.averageLabel}>평균 평점</Text>
        <Text style={styles.averageValue}>{data.averageRating.toFixed(1)}점</Text>
      </View>

      {/* 탭 버튼들 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {tabOptions.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.activeTabButton]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 차트 */}
      {renderChart()}
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
  averageContainer: {
    backgroundColor: ChartColors.grid,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: 12,
    color: ChartColors.lightText,
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f59e0b', // amber-500
  },
  tabContainer: {
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: ChartColors.grid,
  },
  activeTabButton: {
    backgroundColor: '#fcd34d', // amber-300
  },
  tabText: {
    fontSize: 14,
    color: ChartColors.lightText,
    fontWeight: '500',
  },
  activeTabText: {
    color: ChartColors.text,
    fontWeight: '600',
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
