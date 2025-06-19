import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Globe } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getGenreAnalysis } from '../../apis/user/user';
import { ChartColors } from '../../constants/colors';

interface GenreAnalysisChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

type PeriodType = 'all' | 'yearly' | 'monthly' | 'weekly' | 'daily';

// 커스텀 도넛 차트 컴포넌트 (막대형으로 변경)
const CustomGenreChart: React.FC<{
  data: any[];
  width: number;
  height: number;
}> = ({ data, width, height }) => {
  const total = data.reduce((sum, item) => sum + item.population, 0);
  const maxBarWidth = width - 60;

  return (
    <View style={[styles.genreChartContainer, { width, height }]}>
      {data.map((item, index) => {
        const percentage = total > 0 ? (item.population / total) * 100 : 0;
        const barWidth = (percentage / 100) * maxBarWidth;

        return (
          <View key={index} style={styles.genreBarContainer}>
            <View style={styles.genreBarInfo}>
              <View style={[styles.genreColorIndicator, { backgroundColor: item.color }]} />
              <Text style={styles.genreBarLabel}>{item.name}</Text>
            </View>
            <View style={styles.genreBarWrapper}>
              <View style={[styles.genreBar, { width: barWidth, backgroundColor: item.color }]} />
              <Text style={styles.genreBarValue}>{item.population}권</Text>
            </View>
          </View>
        );
      })}
      <View style={styles.genreTotalContainer}>
        <Text style={styles.genreTotalText}>총 {total}권</Text>
      </View>
    </View>
  );
};

export const GenreAnalysisChart: React.FC<GenreAnalysisChartProps> = ({ userId }) => {
  const [isPublic, setIsPublic] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('all');

  const { data } = useSuspenseQuery({
    queryKey: ['genreAnalysis', userId, selectedPeriod],
    queryFn: () => getGenreAnalysis(userId),
  });

  const periodOptions = [
    { id: 'all' as PeriodType, name: '전체' },
    { id: 'daily' as PeriodType, name: '오늘' },
    { id: 'weekly' as PeriodType, name: '최근 1주' },
    { id: 'monthly' as PeriodType, name: '최근 1개월' },
    { id: 'yearly' as PeriodType, name: '최근 1년' },
  ];

  // 데이터가 비공개인 경우
  if (!data.isPublic) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>장르 분석</Text>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 활성 기간에 따른 데이터 가져오기 (프론트엔드 코드 참고)
  const getCategoryDataForPeriod = () => {
    if (selectedPeriod === 'all') {
      // 전체 데이터 (기존 API 응답 구조)
      return data.categoryCounts || [];
    }

    // 기간별 데이터 (새 API 응답 구조)
    const periodData = data[selectedPeriod as keyof typeof data];

    if (!periodData || !Array.isArray(periodData) || periodData.length === 0) {
      return [];
    }

    // 선택된 기간의 모든 데이터를 합산
    const categoryMap = new Map<string, number>();

    periodData.forEach((periodItem: any) => {
      // 카테고리 데이터 합산
      if (periodItem.categories) {
        periodItem.categories.forEach((cat: { category: string; count: number }) => {
          const currentCount = categoryMap.get(cat.category) || 0;
          categoryMap.set(cat.category, currentCount + cat.count);
        });
      }
    });

    // Map을 배열로 변환
    return Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));
  };

  // 현재 선택된 기간의 데이터
  const periodCategories = getCategoryDataForPeriod();

  // 데이터가 없는 경우
  if (!periodCategories || periodCategories.length === 0) {
    const periodName = periodOptions.find(p => p.id === selectedPeriod)?.name || '선택된 기간';
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>장르 분석</Text>
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

        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>{periodName}에 장르 데이터가 없습니다.</Text>
        </View>
      </View>
    );
  }

  // 상위 5개 카테고리 데이터 추출
  const topCategories = [...periodCategories].sort((a, b) => b.count - a.count).slice(0, 5);

  // 차트 데이터 준비
  const chartData = topCategories.map((item, index) => ({
    name: item.category,
    population: item.count,
    color: ChartColors.PASTEL_COLORS[index % ChartColors.PASTEL_COLORS.length],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>장르 분석</Text>
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
        <CustomGenreChart data={chartData} width={screenWidth - 64} height={200} />
      </View>
      {data.mostReadCategory && (
        <View style={styles.highlightContainer}>
          <Text style={styles.highlightLabel}>가장 많이 읽은 장르</Text>
          <Text style={styles.highlightValue}>{data.mostReadCategory}</Text>
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
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  genreChartContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  genreBarContainer: {
    marginBottom: 12,
  },
  genreBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  genreColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  genreBarLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: ChartColors.text,
    flex: 1,
  },
  genreBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    height: 20,
  },
  genreBar: {
    height: '100%',
    borderRadius: 4,
  },
  genreBarValue: {
    fontSize: 11,
    fontWeight: '600',
    color: ChartColors.text,
    marginLeft: 8,
    marginRight: 8,
  },
  genreTotalContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  genreTotalText: {
    fontSize: 14,
    fontWeight: '600',
    color: ChartColors.text,
  },

  highlightContainer: {
    backgroundColor: ChartColors.grid,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 12,
    color: ChartColors.lightText,
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: '600',
    color: ChartColors.text,
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
