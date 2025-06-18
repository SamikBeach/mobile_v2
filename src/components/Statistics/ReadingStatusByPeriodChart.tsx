import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getReadingStatusStats } from '../../apis/user/user';
import { ChartColors } from '../../constants/colors';

interface ReadingStatusByPeriodChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

type PeriodType = 'monthly' | 'quarterly' | 'yearly';

export const ReadingStatusByPeriodChart: React.FC<ReadingStatusByPeriodChartProps> = ({
  userId,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');

  const { data } = useSuspenseQuery({
    queryKey: ['readingStatusStats', userId],
    queryFn: () => getReadingStatusStats(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>기간별 독서 현황</Text>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 가상 기간별 데이터
  const periodData = {
    monthly: {
      labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
      datasets: [
        {
          data: [12, 15, 8, 23, 18, 14],
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
    quarterly: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          data: [35, 45, 29, 38],
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
    yearly: {
      labels: ['2020', '2021', '2022', '2023', '2024'],
      datasets: [
        {
          data: [45, 52, 38, 67, 23],
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
  };

  const chartConfig = {
    backgroundGradientFrom: ChartColors.background,
    backgroundGradientTo: ChartColors.background,
    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const periodOptions = [
    { id: 'monthly' as PeriodType, name: '월별' },
    { id: 'quarterly' as PeriodType, name: '분기별' },
    { id: 'yearly' as PeriodType, name: '연도별' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>기간별 독서 현황</Text>

      {/* 기간 선택 탭 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {periodOptions.map(period => (
          <TouchableOpacity
            key={period.id}
            style={[styles.tabButton, selectedPeriod === period.id && styles.activeTabButton]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text style={[styles.tabText, selectedPeriod === period.id && styles.activeTabText]}>
              {period.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 차트 */}
      <View style={styles.chartContainer}>
        <LineChart
          data={periodData[selectedPeriod]}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          bezier
        />
      </View>

      {/* 주요 지표 */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{data.readCount}</Text>
          <Text style={styles.metricLabel}>읽은 책</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{data.readingCount}</Text>
          <Text style={styles.metricLabel}>읽는 중</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{data.wantToReadCount}</Text>
          <Text style={styles.metricLabel}>읽고 싶어요</Text>
        </View>
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
  tabContainer: {
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTabButton: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: ChartColors.grid,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22C55E',
  },
  metricLabel: {
    fontSize: 12,
    color: ChartColors.lightText,
    marginTop: 4,
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
