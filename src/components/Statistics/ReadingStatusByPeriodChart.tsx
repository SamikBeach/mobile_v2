import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Globe } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getReadingStatusByPeriod } from '../../apis/user/user';
import { ReadingStatusType } from '../../constants';
import { ChartColors } from '../../constants/colors';

interface ReadingStatusByPeriodChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

// 읽기 상태별 컬러 매핑 (파스텔톤)
const STATUS_COLORS = {
  [ReadingStatusType.READ]: '#86efac', // green-300 (파스텔)
  [ReadingStatusType.READING]: '#93c5fd', // blue-300 (파스텔)
  [ReadingStatusType.WANT_TO_READ]: '#c4b5fd', // violet-300 (파스텔)
};

// 읽기 상태별 표시 이름
const STATUS_LABELS = {
  [ReadingStatusType.READ]: '읽었어요',
  [ReadingStatusType.READING]: '읽는 중',
  [ReadingStatusType.WANT_TO_READ]: '읽고 싶어요',
};

// 커스텀 스택형 바 차트 컴포넌트
const CustomStackedBarChart: React.FC<{
  data: any;
  width: number;
  height: number;
}> = ({ data, width, height }) => {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <View style={[styles.customChartContainer, { width, height }]}>
        <Text style={styles.noDataText}>데이터가 없습니다</Text>
      </View>
    );
  }

  const chartWidth = width - 40;
  const chartHeight = height - 60;
  const barWidth = Math.max(20, chartWidth / data.labels.length - 16);
  const maxValue = Math.max(...data.data.map((item: number[]) => item.reduce((a, b) => a + b, 0)));
  const scale = maxValue > 0 ? chartHeight / maxValue : 1;

  return (
    <View style={[styles.customChartContainer, { width, height }]}>
      <View style={styles.chartArea}>
        {data.labels.map((label: string, index: number) => {
          const values = data.data[index];
          const total = values.reduce((a: number, b: number) => a + b, 0);

          if (total === 0) {
            return (
              <View key={index} style={styles.barContainer}>
                <View style={[styles.emptyBar, { width: barWidth }]} />
                <Text style={styles.xAxisLabel}>{label}</Text>
              </View>
            );
          }

          let currentHeight = 0;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.bar, { width: barWidth }]}>
                {values.map((value: number, valueIndex: number) => {
                  if (value === 0) return null;
                  const segmentHeight = value * scale;
                  currentHeight += segmentHeight;

                  return (
                    <View
                      key={valueIndex}
                      style={[
                        styles.barSegment,
                        {
                          height: segmentHeight,
                          backgroundColor: data.barColors[valueIndex],
                        },
                      ]}
                    />
                  );
                })}
                {total > 0 && <Text style={styles.barValueText}>{total}</Text>}
              </View>
              <Text style={styles.xAxisLabel}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const ReadingStatusByPeriodChart: React.FC<ReadingStatusByPeriodChartProps> = ({
  userId,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
  const [isPublic, setIsPublic] = useState(true);

  const { data } = useSuspenseQuery({
    queryKey: ['readingStatusByPeriod', userId],
    queryFn: () => getReadingStatusByPeriod(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>기간별 독서</Text>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 선택된 기간의 데이터
  const periodData = data[selectedPeriod];

  // 데이터가 완전히 없는 경우
  if (
    !data.yearly?.length &&
    !data.monthly?.length &&
    !data.weekly?.length &&
    !data.daily?.length
  ) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>기간별 독서</Text>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>표시할 데이터가 없습니다.</Text>
        </View>
      </View>
    );
  }

  // 차트 데이터 변환
  const transformDataForChart = () => {
    if (!periodData || periodData.length === 0) {
      return {
        labels: ['데이터 없음'],
        legend: ['읽었어요', '읽는 중', '읽고 싶어요'],
        data: [[0, 0, 0]],
        barColors: [
          STATUS_COLORS[ReadingStatusType.READ],
          STATUS_COLORS[ReadingStatusType.READING],
          STATUS_COLORS[ReadingStatusType.WANT_TO_READ],
        ],
      };
    }

    // 데이터 키 결정
    const getDataKey = () => {
      switch (selectedPeriod) {
        case 'yearly':
          return 'year';
        case 'monthly':
          return 'month';
        case 'weekly':
          return 'week';
        case 'daily':
          return 'date';
        default:
          return 'month';
      }
    };

    // X축 라벨 포맷팅
    const formatXAxisLabel = (label: string) => {
      if (selectedPeriod === 'yearly') {
        return label; // 년도는 그대로 표시
      } else if (selectedPeriod === 'monthly') {
        // YYYY-MM 형식을 MM월로 변환
        const [year, month] = label.split('-');
        return `${month}월`;
      } else if (selectedPeriod === 'weekly') {
        // 주간은 그대로 표시
        return label;
      } else if (selectedPeriod === 'daily') {
        // 날짜 포맷팅
        try {
          const date = new Date(label);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        } catch {
          return label;
        }
      }
      return label;
    };

    const dataKey = getDataKey();
    const labels = periodData.map((item: any) => formatXAxisLabel(item[dataKey]));

    // 스택형 차트를 위한 데이터 변환
    const data = periodData.map((item: any) => [
      item.readCount || 0,
      item.readingCount || 0,
      item.wantToReadCount || 0,
    ]);

    return {
      labels,
      legend: ['읽었어요', '읽는 중', '읽고 싶어요'],
      data,
      barColors: [
        STATUS_COLORS[ReadingStatusType.READ],
        STATUS_COLORS[ReadingStatusType.READING],
        STATUS_COLORS[ReadingStatusType.WANT_TO_READ],
      ],
    };
  };

  const chartData = transformDataForChart();

  const periodOptions = [
    { id: 'daily' as PeriodType, name: '일별' },
    { id: 'weekly' as PeriodType, name: '주별' },
    { id: 'monthly' as PeriodType, name: '월별' },
    { id: 'yearly' as PeriodType, name: '연도별' },
  ];

  // 통계 요약 계산
  const getTotalStats = () => {
    if (!periodData || periodData.length === 0) {
      return { read: 0, reading: 0, wantToRead: 0 };
    }

    return periodData.reduce(
      (acc: any, item: any) => ({
        read: acc.read + (item.readCount || 0),
        reading: acc.reading + (item.readingCount || 0),
        wantToRead: acc.wantToRead + (item.wantToReadCount || 0),
      }),
      { read: 0, reading: 0, wantToRead: 0 }
    );
  };

  const totalStats = getTotalStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>기간별 독서</Text>
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
        {periodData && periodData.length > 0 ? (
          <CustomStackedBarChart data={chartData} width={screenWidth - 64} height={240} />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {selectedPeriod === 'daily'
                ? '일별 데이터가 없습니다'
                : selectedPeriod === 'weekly'
                  ? '주별 데이터가 없습니다'
                  : selectedPeriod === 'monthly'
                    ? '월별 데이터가 없습니다'
                    : '연도별 데이터가 없습니다'}
            </Text>
          </View>
        )}
      </View>

      {/* 범례 */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendColor, { backgroundColor: STATUS_COLORS[ReadingStatusType.READ] }]}
          />
          <Text style={styles.legendText}>{STATUS_LABELS[ReadingStatusType.READ]}</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: STATUS_COLORS[ReadingStatusType.READING] },
            ]}
          />
          <Text style={styles.legendText}>{STATUS_LABELS[ReadingStatusType.READING]}</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: STATUS_COLORS[ReadingStatusType.WANT_TO_READ] },
            ]}
          />
          <Text style={styles.legendText}>{STATUS_LABELS[ReadingStatusType.WANT_TO_READ]}</Text>
        </View>
      </View>

      {/* 주요 지표 */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: STATUS_COLORS[ReadingStatusType.READ] }]}>
            {totalStats.read}
          </Text>
          <Text style={styles.metricLabel}>읽은 책</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={[styles.metricValue, { color: STATUS_COLORS[ReadingStatusType.READING] }]}>
            {totalStats.reading}
          </Text>
          <Text style={styles.metricLabel}>읽는 중</Text>
        </View>
        <View style={styles.metricItem}>
          <Text
            style={[styles.metricValue, { color: STATUS_COLORS[ReadingStatusType.WANT_TO_READ] }]}
          >
            {totalStats.wantToRead}
          </Text>
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
  tabContainer: {
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTabButton: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  customChartContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  bar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden',
    minHeight: 20,
    position: 'relative',
  },
  barSegment: {
    width: '100%',
    borderRadius: 2,
  },
  emptyBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  barValueText: {
    position: 'absolute',
    top: -20,
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  noDataContainer: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: ChartColors.lightText,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: ChartColors.text,
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
