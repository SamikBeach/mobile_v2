import React, { useState, Suspense } from 'react';
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
import { useCurrentUser, useStatisticsSettings } from '../../hooks';
import { LoadingSpinner } from '../LoadingSpinner';

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

// 커스텀 스택형 막대 차트 컴포넌트
interface CustomStackedBarChartProps {
  data: any;
  width: number;
  height: number;
}

const CustomStackedBarChart: React.FC<CustomStackedBarChartProps> = ({ data, width, height }) => {
  const totals = data.data.map((d: any) => d.read + d.reading + d.wantToRead);
  const maxValue = totals.length > 0 ? Math.max(...totals) : 1;
  const chartPadding = 50;
  const availableWidth = width - chartPadding * 2;
  const barWidth = Math.min(Math.max(availableWidth / data.data.length - 12, 20), 40);
  const chartHeight = height - 100;

  // Y축 구간을 더 명확하게 설정
  const yAxisSteps = 4;
  const stepValue = Math.ceil(maxValue / yAxisSteps);

  return (
    <View style={{ width, height, backgroundColor: 'transparent' }}>
      {/* Y축 라벨과 격자선 */}
      <View style={{ position: 'absolute', left: 0, top: 30, height: chartHeight }}>
        {Array.from({ length: yAxisSteps + 1 }, (_, i) => {
          const value = stepValue * (yAxisSteps - i);
          const isZeroLine = i === yAxisSteps; // 맨 아래가 0점
          return (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: (chartHeight * i) / yAxisSteps - 6,
                alignItems: 'flex-end',
                width: 35,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: isZeroLine ? '#374151' : '#6B7280',
                  fontWeight: isZeroLine ? '600' : '500',
                }}
              >
                {value}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 차트 영역 */}
      <View style={{ marginLeft: 45, marginTop: 30, paddingRight: 10 }}>
        {/* 차트와 X축을 분리 */}
        <View style={{ height: chartHeight }}>
          {/* 막대 차트 */}
          <View style={{ flexDirection: 'row', height: chartHeight, alignItems: 'flex-end' }}>
            {data.data.map((item: any, index: number) => {
              const total = item.read + item.reading + item.wantToRead;
              const totalHeight = maxValue > 0 ? (total / maxValue) * chartHeight : 0;
              const readHeight = maxValue > 0 ? (item.read / maxValue) * chartHeight : 0;
              const readingHeight = maxValue > 0 ? (item.reading / maxValue) * chartHeight : 0;
              const wantToReadHeight =
                maxValue > 0 ? (item.wantToRead / maxValue) * chartHeight : 0;

              return (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    height: chartHeight,
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* 총합 숫자 (막대 위) */}
                  {total > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: totalHeight + 8,
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '700',
                          color: '#1F2937',
                          textAlign: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          paddingHorizontal: 4,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}
                      >
                        {total}
                      </Text>
                    </View>
                  )}

                  {/* 스택형 막대 - 0점 기준 */}
                  <View
                    style={{
                      width: barWidth,
                      height: Math.max(totalHeight, total > 0 ? 8 : 4),
                      backgroundColor: total > 0 ? 'transparent' : '#F3F4F6',
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                  >
                    {total > 0 && (
                      <>
                        {/* 읽었어요 (초록) - 맨 아래 */}
                        {item.read > 0 && (
                          <View
                            style={{
                              height: readHeight,
                              backgroundColor: data.barColors[0],
                            }}
                          />
                        )}
                        {/* 읽는 중 (파랑) - 중간 */}
                        {item.reading > 0 && (
                          <View
                            style={{
                              height: readingHeight,
                              backgroundColor: data.barColors[1],
                            }}
                          />
                        )}
                        {/* 읽고 싶어요 (보라) - 맨 위 */}
                        {item.wantToRead > 0 && (
                          <View
                            style={{
                              height: wantToReadHeight,
                              backgroundColor: data.barColors[2],
                            }}
                          />
                        )}
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* X축 기준선과 라벨 - 0점 위치 */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            marginTop: 0,
            paddingTop: 8,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            {data.data.map((item: any, index: number) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: '#6B7280',
                    textAlign: 'center',
                    fontWeight: '600',
                  }}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const ReadingStatusByPeriodChart: React.FC<ReadingStatusByPeriodChartProps> = ({ userId }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');

  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;

  // 항상 useStatisticsSettings를 호출하되 isMyProfile이 아닐 때는 결과를 무시
  const statisticsHook = useStatisticsSettings(userId);
  const { settings, handleUpdateSetting } = isMyProfile
    ? statisticsHook
    : { settings: null, handleUpdateSetting: () => {} };

  const { data } = useSuspenseQuery({
    queryKey: ['readingStatusByPeriod', userId],
    queryFn: () => getReadingStatusByPeriod(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic && !isMyProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>기간별 독서</Text>
        </View>
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
        <View style={styles.header}>
          <Text style={styles.title}>기간별 독서</Text>
          {isMyProfile && (
            <View style={styles.switchContainer}>
              <View style={styles.switchWrapper}>
                <Globe size={16} color='#64748B' />
                <Switch
                  value={settings?.isReadingStatusByPeriodPublic || false}
                  onValueChange={value =>
                    handleUpdateSetting('isReadingStatusByPeriodPublic', value)
                  }
                  trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                  thumbColor={settings?.isReadingStatusByPeriodPublic ? '#FFFFFF' : '#F8FAFC'}
                  ios_backgroundColor='#F1F5F9'
                  style={styles.switch}
                />
              </View>
            </View>
          )}
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>표시할 데이터가 없습니다.</Text>
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
        data: [{ read: 0, reading: 0, wantToRead: 0, label: '데이터 없음' }],
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

    // 커스텀 차트를 위한 데이터 변환
    const data = periodData.map((item: any) => ({
      read: item.readCount || 0,
      reading: item.readingCount || 0,
      wantToRead: item.wantToReadCount || 0,
      label: formatXAxisLabel(item[dataKey]),
    }));

    return {
      labels: data.map(item => item.label),
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
        {isMyProfile && (
          <View style={styles.switchContainer}>
            <View style={styles.switchWrapper}>
              <Globe size={16} color='#64748B' />
              <Switch
                value={settings?.isReadingStatusByPeriodPublic || false}
                onValueChange={value => handleUpdateSetting('isReadingStatusByPeriodPublic', value)}
                trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                thumbColor={settings?.isReadingStatusByPeriodPublic ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor='#F1F5F9'
                style={styles.switch}
              />
            </View>
          </View>
        )}
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
          <CustomStackedBarChart data={chartData} width={screenWidth - 48} height={260} />
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
    marginBottom: 24,
    backgroundColor: '#FAFBFC',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },

  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginHorizontal: 4,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
    fontWeight: '500',
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
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: ChartColors.lightText,
    textAlign: 'center',
  },
});

const ReadingStatusByPeriodChartWrapper: React.FC<ReadingStatusByPeriodChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <ReadingStatusByPeriodChart {...props} />
  </Suspense>
);

export { ReadingStatusByPeriodChartWrapper as ReadingStatusByPeriodChart };
