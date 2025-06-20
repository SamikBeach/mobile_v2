import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Switch, ScrollView } from 'react-native';
import { Globe } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getGenreAnalysis } from '../../apis/user/user';
import { ChartColors } from '../../constants/colors';

interface GenreAnalysisChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

// 가로 막대 차트 컴포넌트
const HorizontalBarChart: React.FC<{
  data: Array<{ category?: string; subCategory?: string; count: number }>;
  width: number;
  height: number;
  title: string;
  isSubCategory?: boolean;
}> = ({ data, width, height, title, isSubCategory = false }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={{ width, height: height / 2, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#9CA3AF', fontSize: 14 }}>데이터가 없습니다</Text>
        </View>
      </View>
    );
  }

  // 상위 8개 항목만 표시
  const topData = [...data].sort((a, b) => b.count - a.count).slice(0, 8);
  const maxValue = Math.max(...topData.map(item => item.count));

  const barHeight = 24;
  const spacing = 8;
  const leftPadding = 100;

  return (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={{ width, height: topData.length * (barHeight + spacing) + 32 }}>
        {topData.map((item, index) => {
          const barWidth = maxValue > 0 ? (item.count / maxValue) * (width - leftPadding - 60) : 0;
          const label = isSubCategory ? item.subCategory : item.category;
          const color = ChartColors.PASTEL_COLORS[index % ChartColors.PASTEL_COLORS.length];

          return (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing,
                paddingHorizontal: 16,
              }}
            >
              <Text
                style={{
                  width: leftPadding - 20,
                  fontSize: 11,
                  color: '#6B7280',
                  textAlign: 'right',
                }}
                numberOfLines={1}
              >
                {label}
              </Text>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View
                  style={{
                    width: Math.max(barWidth, 20),
                    height: barHeight,
                    backgroundColor: color,
                    borderRadius: 4,
                    justifyContent: 'center',
                    paddingHorizontal: 6,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 10,
                      fontWeight: '600',
                      textAlign: 'center',
                    }}
                  >
                    {item.count}권
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const GenreAnalysisChart: React.FC<GenreAnalysisChartProps> = ({ userId }) => {
  const [isPublic, setIsPublic] = useState(true);

  const { data } = useSuspenseQuery({
    queryKey: ['genreAnalysis', userId],
    queryFn: () => getGenreAnalysis(userId),
  });

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

  // 메인 카테고리와 서브 카테고리 데이터
  const mainCategories = data.categoryCounts || [];
  const subCategories = data.subCategoryCounts || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      {/* 메인 카테고리 차트 */}
      <HorizontalBarChart
        data={mainCategories}
        width={screenWidth - 64}
        height={250}
        title='메인 카테고리'
        isSubCategory={false}
      />

      {/* 서브 카테고리 차트 */}
      <HorizontalBarChart
        data={subCategories}
        width={screenWidth - 64}
        height={300}
        title='서브 카테고리'
        isSubCategory={true}
      />

      {/* 주요 카테고리 정보 */}
      {data.mostReadCategory && (
        <View style={styles.highlightContainer}>
          <Text style={styles.highlightLabel}>가장 많이 읽은 장르</Text>
          <Text style={styles.highlightValue}>{data.mostReadCategory}</Text>
        </View>
      )}
    </ScrollView>
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
  chartSection: {
    marginBottom: 24,
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    paddingVertical: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ChartColors.text,
    marginBottom: 16,
    paddingHorizontal: 16,
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
