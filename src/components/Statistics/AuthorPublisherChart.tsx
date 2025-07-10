import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Switch } from 'react-native';
import { Globe } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getGenreAnalysis } from '../../apis/user/user';
import { ChartColors } from '../../constants/colors';

interface AuthorPublisherChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

type ChartType = 'authors' | 'publishers';

interface AuthorPublisherData {
  name: string;
  count: number;
  genres?: string[];
  categories?: string[];
}

// 커스텀 막대 차트 컴포넌트
interface CustomBarChartProps {
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  width: number;
  height: number;
  color: string;
}

const CustomBarChart: React.FC<CustomBarChartProps> = ({ data, width, height, color }) => {
  const maxValue = data.datasets[0].data.length > 0 ? Math.max(...data.datasets[0].data) : 1;
  const chartPadding = 50;
  const availableWidth = width - chartPadding * 2;
  const barWidth = Math.min(Math.max(availableWidth / data.labels.length - 12, 30), 50);
  const chartHeight = height - 80;

  // Y축 구간을 더 명확하게 설정
  const yAxisSteps = 4;
  const stepValue = Math.ceil(maxValue / yAxisSteps);

  return (
    <View style={{ width, height, backgroundColor: 'transparent' }}>
      {/* Y축 라벨 */}
      <View style={{ position: 'absolute', left: 0, top: 20, height: chartHeight }}>
        {Array.from({ length: yAxisSteps + 1 }, (_, i) => {
          const value = stepValue * (yAxisSteps - i);
          const isZeroLine = i === yAxisSteps;
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
      <View style={{ marginLeft: 45, marginTop: 20, paddingRight: 10 }}>
        {/* 차트와 X축을 분리 */}
        <View style={{ height: chartHeight }}>
          {/* 막대 차트 */}
          <View style={{ flexDirection: 'row', height: chartHeight, alignItems: 'flex-end' }}>
            {data.datasets[0].data.map((value: number, index: number) => {
              const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;

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
                  {/* 값 표시 (막대 위) */}
                  {value > 0 && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: barHeight + 8,
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
                        {value}
                      </Text>
                    </View>
                  )}

                  {/* 막대 */}
                  <View
                    style={{
                      width: barWidth,
                      height: Math.max(barHeight, value > 0 ? 8 : 4),
                      backgroundColor: value > 0 ? color : '#F3F4F6',
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* X축 기준선과 라벨 */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            marginTop: 0,
            paddingTop: 8,
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            {data.labels.map((label: string, index: number) => (
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
                    fontWeight: '500',
                  }}
                  numberOfLines={2}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export const AuthorPublisherChart: React.FC<AuthorPublisherChartProps> = ({ userId }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('authors');
  const [isPublic, setIsPublic] = useState(true);

  const { data } = useSuspenseQuery({
    queryKey: ['genreAnalysis', userId],
    queryFn: () => getGenreAnalysis(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>작가 & 출판사 통계</Text>
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
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 임시 데이터 (API 구현 전까지)
  const mockData: { topAuthors: AuthorPublisherData[]; topPublishers: AuthorPublisherData[] } = {
    topAuthors: [],
    topPublishers: [],
  };

  // API 데이터를 차트 형식으로 변환
  const getChartData = () => {
    if (selectedChart === 'authors') {
      return {
        labels: mockData.topAuthors.map((author: AuthorPublisherData) => author.name),
        datasets: [
          {
            data: mockData.topAuthors.map((author: AuthorPublisherData) => author.count),
          },
        ],
      };
    } else {
      return {
        labels: mockData.topPublishers.map((publisher: AuthorPublisherData) => publisher.name),
        datasets: [
          {
            data: mockData.topPublishers.map((publisher: AuthorPublisherData) => publisher.count),
          },
        ],
      };
    }
  };

  // 차트 색상 정의
  const getChartColor = () => {
    return selectedChart === 'authors'
      ? '#86efac' // green-300 (기간별 독서와 동일한 색상)
      : '#93c5fd'; // blue-300 (기간별 독서와 동일한 색상)
  };

  const chartOptions = [
    { id: 'authors' as ChartType, name: '작가' },
    { id: 'publishers' as ChartType, name: '출판사' },
  ];

  // 데이터가 없는 경우
  const currentData = selectedChart === 'authors' ? mockData.topAuthors : mockData.topPublishers;
  if (!currentData || currentData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>작가 & 출판사 통계</Text>
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
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>아직 데이터가 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>작가 & 출판사 통계</Text>
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

      {/* 차트 선택 탭 */}
      <View style={styles.tabContainer}>
        {chartOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[styles.tabButton, selectedChart === option.id && styles.activeTabButton]}
            onPress={() => setSelectedChart(option.id)}
          >
            <Text style={[styles.tabText, selectedChart === option.id && styles.activeTabText]}>
              {option.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 차트 */}
      <View style={styles.chartContainer}>
        <CustomBarChart
          data={getChartData()}
          width={screenWidth - 64}
          height={220}
          color={getChartColor()}
        />
      </View>

      {/* 상세 정보 */}
      <View style={styles.detailContainer}>
        <Text style={styles.detailTitle}>
          {selectedChart === 'authors' ? '선호 작가 TOP 5' : '선호 출판사 TOP 5'}
        </Text>
        <View style={styles.detailList}>
          {currentData.map((item: AuthorPublisherData, index: number) => (
            <View
              key={index}
              style={[styles.detailItem, index === currentData.length - 1 && styles.lastDetailItem]}
            >
              <View style={styles.detailInfo}>
                <Text style={styles.detailName}>{item.name}</Text>
                {selectedChart === 'authors' && item.genres && (
                  <Text style={styles.detailMeta}>{item.genres.join(', ')}</Text>
                )}
                {selectedChart === 'publishers' && item.categories && (
                  <Text style={styles.detailMeta}>{item.categories.join(', ')}</Text>
                )}
              </View>
              <Text style={styles.detailCount}>{item.count}권</Text>
            </View>
          ))}
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
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
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
    marginBottom: 16,
  },
  detailContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: ChartColors.grid,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ChartColors.text,
    marginBottom: 12,
  },
  detailList: {
    // maxHeight 제거로 모든 항목이 스크롤 없이 표시됨
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastDetailItem: {
    borderBottomWidth: 0,
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 14,
    fontWeight: '500',
    color: ChartColors.text,
  },
  detailMeta: {
    fontSize: 12,
    color: ChartColors.lightText,
    marginTop: 2,
  },
  detailCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
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
