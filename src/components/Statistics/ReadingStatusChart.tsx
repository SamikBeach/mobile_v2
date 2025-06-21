import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Switch } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Globe } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getReadingStatusStats } from '../../apis/user/user';
import { ReadingStatusType } from '../../constants';
import { ChartColors } from '../../constants/colors';

interface ReadingStatusChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

// 읽기 상태별 색상 매핑
const STATUS_COLORS = {
  [ReadingStatusType.READ]: '#86efac', // green-300
  [ReadingStatusType.READING]: '#93c5fd', // blue-300
  [ReadingStatusType.WANT_TO_READ]: '#c4b5fd', // violet-300
};

// 읽기 상태별 표시 이름
const STATUS_LABELS = {
  [ReadingStatusType.READ]: '읽었어요',
  [ReadingStatusType.READING]: '읽는 중',
  [ReadingStatusType.WANT_TO_READ]: '읽고 싶어요',
};

export const ReadingStatusChart: React.FC<ReadingStatusChartProps> = ({ userId }) => {
  const [isPublic, setIsPublic] = useState(true);

  const { data, isLoading } = useSuspenseQuery({
    queryKey: ['readingStatusStats', userId],
    queryFn: () => getReadingStatusStats(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>독서 상태별 도서 수</Text>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 데이터가 없는 경우
  const totalBooks = data.readCount + data.readingCount + data.wantToReadCount;
  if (totalBooks === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>독서 상태별 도서 수</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>독서 활동 데이터가 없습니다.</Text>
        </View>
      </View>
    );
  }

  // 차트 데이터 준비
  const chartData = [
    {
      name: STATUS_LABELS[ReadingStatusType.READ],
      population: data.readCount,
      color: STATUS_COLORS[ReadingStatusType.READ],
      legendFontColor: ChartColors.text,
      legendFontSize: 12,
    },
    {
      name: STATUS_LABELS[ReadingStatusType.READING],
      population: data.readingCount,
      color: STATUS_COLORS[ReadingStatusType.READING],
      legendFontColor: ChartColors.text,
      legendFontSize: 12,
    },
    {
      name: STATUS_LABELS[ReadingStatusType.WANT_TO_READ],
      population: data.wantToReadCount,
      color: STATUS_COLORS[ReadingStatusType.WANT_TO_READ],
      legendFontColor: ChartColors.text,
      legendFontSize: 12,
    },
  ].filter(item => item.population > 0);

  const chartConfig = {
    backgroundGradientFrom: ChartColors.background,
    backgroundGradientTo: ChartColors.background,
    color: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>독서 상태별 도서 수</Text>
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
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          accessor='population'
          backgroundColor='transparent'
          paddingLeft='15'
          center={[10, 10]}
          absolute
        />
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.readCount}</Text>
          <Text style={styles.statLabel}>읽었어요</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.readingCount}</Text>
          <Text style={styles.statLabel}>읽는 중</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{data.wantToReadCount}</Text>
          <Text style={styles.statLabel}>읽고 싶어요</Text>
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: ChartColors.grid,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: ChartColors.text,
  },
  statLabel: {
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
