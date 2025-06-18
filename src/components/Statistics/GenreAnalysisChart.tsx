import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getGenreAnalysis } from '../../apis/user/user';
import { ChartColors } from '../../constants/colors';

interface GenreAnalysisChartProps {
  userId: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const GenreAnalysisChart: React.FC<GenreAnalysisChartProps> = ({ userId }) => {
  const { data, isLoading } = useSuspenseQuery({
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

  // 데이터가 없는 경우
  if (!data.categoryCounts || data.categoryCounts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>장르 분석</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>장르 데이터가 없습니다.</Text>
        </View>
      </View>
    );
  }

  // 상위 5개 카테고리 데이터 추출
  const topCategories = [...data.categoryCounts].sort((a, b) => b.count - a.count).slice(0, 5);

  // 차트 데이터 준비
  const chartData = topCategories.map((item, index) => ({
    name: item.category,
    population: item.count,
    color: ChartColors.PASTEL_COLORS[index % ChartColors.PASTEL_COLORS.length],
    legendFontColor: ChartColors.text,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundGradientFrom: ChartColors.background,
    backgroundGradientTo: ChartColors.background,
    color: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  // 총 개수 계산
  const totalCount = topCategories.reduce((sum, item) => sum + item.count, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>장르 분석</Text>
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
      <View style={styles.categoryList}>
        {topCategories.map((category, index) => {
          const percentage =
            totalCount > 0 ? ((category.count / totalCount) * 100).toFixed(1) : '0';
          return (
            <View key={category.category} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View
                  style={[
                    styles.colorIndicator,
                    {
                      backgroundColor:
                        ChartColors.PASTEL_COLORS[index % ChartColors.PASTEL_COLORS.length],
                    },
                  ]}
                />
                <Text style={styles.categoryName}>{category.category}</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryCount}>{category.count}권</Text>
                <Text style={styles.categoryPercentage}>{percentage}%</Text>
              </View>
            </View>
          );
        })}
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryList: {
    marginVertical: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: ChartColors.grid,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: ChartColors.text,
    flex: 1,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '600',
    color: ChartColors.text,
  },
  categoryPercentage: {
    fontSize: 12,
    color: ChartColors.lightText,
    marginTop: 2,
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
