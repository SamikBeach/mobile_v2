import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Switch } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Globe } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getGenreAnalysis } from '../../apis/user/user';
import { ChartColors } from '../../constants/colors';

interface AuthorPublisherChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

type ChartType = 'authors' | 'publishers';

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
        <Text style={styles.title}>작가 & 출판사 통계</Text>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 가상 작가/출판사 데이터
  const chartData = {
    authors: {
      labels: ['플라톤', '아리스토텔레스', '니체', '칸트', '데카르트'],
      datasets: [
        {
          data: [8, 6, 5, 4, 3],
          color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
        },
      ],
    },
    publishers: {
      labels: ['민음사', '창비', '문학동네', '을유문화사', '열린책들'],
      datasets: [
        {
          data: [14, 11, 9, 8, 7],
          color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
        },
      ],
    },
  };

  const favoriteAuthors = [
    { name: '플라톤', books: 8, genres: ['철학', '고전'] },
    { name: '아리스토텔레스', books: 6, genres: ['철학', '논리학'] },
    { name: '니체', books: 5, genres: ['철학', '문학'] },
    { name: '칸트', books: 4, genres: ['철학', '윤리학'] },
    { name: '데카르트', books: 3, genres: ['철학', '수학'] },
  ];

  const favoritePublishers = [
    { name: '민음사', books: 14, categories: ['문학', '철학'] },
    { name: '창비', books: 11, categories: ['한국문학', '시'] },
    { name: '문학동네', books: 9, categories: ['소설', '에세이'] },
    { name: '을유문화사', books: 8, categories: ['인문', '철학'] },
    { name: '열린책들', books: 7, categories: ['해외문학', '고전'] },
  ];

  const chartConfig = {
    backgroundGradientFrom: ChartColors.background,
    backgroundGradientTo: ChartColors.background,
    color: (opacity = 1) =>
      selectedChart === 'authors'
        ? `rgba(168, 85, 247, ${opacity})`
        : `rgba(245, 158, 11, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const chartOptions = [
    { id: 'authors' as ChartType, name: '작가' },
    { id: 'publishers' as ChartType, name: '출판사' },
  ];

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
        <BarChart
          data={chartData[selectedChart]}
          width={screenWidth - 64}
          height={200}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=''
          yAxisSuffix=''
        />
      </View>

      {/* 상세 정보 */}
      <View style={styles.detailContainer}>
        <Text style={styles.detailTitle}>
          {selectedChart === 'authors' ? '선호 작가 TOP 5' : '선호 출판사 TOP 5'}
        </Text>
        <View style={styles.detailList}>
          {(selectedChart === 'authors' ? favoriteAuthors : favoritePublishers).map(
            (item, index) => (
              <View
                key={index}
                style={[
                  styles.detailItem,
                  index ===
                    (selectedChart === 'authors' ? favoriteAuthors : favoritePublishers).length -
                      1 && styles.lastDetailItem,
                ]}
              >
                <View style={styles.detailInfo}>
                  <Text style={styles.detailName}>{item.name}</Text>
                  <Text style={styles.detailMeta}>
                    {selectedChart === 'authors'
                      ? (item as any).genres.join(', ')
                      : (item as any).categories.join(', ')}
                  </Text>
                </View>
                <Text style={styles.detailCount}>{item.books}권</Text>
              </View>
            )
          )}
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
  chart: {
    borderRadius: 8,
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
