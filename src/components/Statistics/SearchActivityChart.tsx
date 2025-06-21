import React, { useState, Suspense } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Switch } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Lock, Globe, Search, TrendingUp } from 'lucide-react-native';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSearchActivity, updateStatisticsSetting } from '../../apis/user';
import { SearchActivityResponse } from '../../apis/user/types';
import { useCurrentUser } from '../../hooks';
import { LoadingSpinner } from '../LoadingSpinner';

interface SearchActivityChartProps {
  userId: number;
}

type ChartType = 'trends' | 'terms';
type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

// 검색어별 색상
const SEARCH_TERM_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#EF4444'];

// X축 라벨 포맷팅 함수
const formatXAxisLabel = (label: string, periodType: PeriodType): string => {
  if (periodType === 'yearly') {
    return label;
  } else if (periodType === 'monthly') {
    const [year, month] = label.split('-');
    if (year && month) {
      return `${month}월`;
    }
    return label;
  } else if (periodType === 'weekly') {
    return label;
  } else if (periodType === 'daily') {
    try {
      const date = new Date(label);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } catch {
      return label;
    }
  }
  return label;
};

const SearchActivityChart: React.FC<SearchActivityChartProps> = ({ userId }) => {
  const [activeType, setActiveType] = useState<ChartType>('trends');
  const [activePeriod, setActivePeriod] = useState<PeriodType>('monthly');
  const [isPublic, setIsPublic] = useState(true);
  const CHART_TITLE = '검색 활동';

  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery<SearchActivityResponse>({
    queryKey: ['searchActivity', userId],
    queryFn: () => getSearchActivity(userId),
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (isPublic: boolean) =>
      updateStatisticsSetting({ isSearchActivityPublic: isPublic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchActivity', userId] });
    },
  });

  React.useEffect(() => {
    setIsPublic(data.isPublic);
  }, [data.isPublic]);

  // 데이터가 비공개인 경우
  if (!data.isPublic && !isMyProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{CHART_TITLE}</Text>
        </View>
        <View style={styles.privateContainer}>
          <Lock size={48} color='#9CA3AF' />
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 데이터가 없는 경우
  if (
    (data.searchCount || 0) === 0 ||
    ((!data.monthly || data.monthly.length === 0) &&
      (!data.yearly || data.yearly.length === 0) &&
      (!data.weekly || data.weekly.length === 0) &&
      (!data.daily || data.daily.length === 0) &&
      (!data.frequentlySearchedTerms || data.frequentlySearchedTerms.length === 0))
  ) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{CHART_TITLE}</Text>
          {isMyProfile && (
            <View style={styles.privacyToggle}>
              <View style={styles.switchWrapper}>
                <Globe size={16} color='#64748B' />
                <Switch
                  value={isPublic}
                  onValueChange={value => {
                    setIsPublic(value);
                    updatePrivacyMutation.mutate(value);
                  }}
                  trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                  thumbColor={isPublic ? '#FFFFFF' : '#F8FAFC'}
                  ios_backgroundColor='#F1F5F9'
                  style={styles.switch}
                />
              </View>
            </View>
          )}
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>검색 활동 데이터가 없습니다</Text>
        </View>
      </View>
    );
  }

  // 인기 검색어 데이터 가공
  const topTermsData = (data.frequentlySearchedTerms || []).slice(0, 6).map((item, index) => ({
    name: item.term,
    population: item.count,
    color: SEARCH_TERM_COLORS[index % SEARCH_TERM_COLORS.length],
    legendFontColor: '#374151',
    legendFontSize: 12,
  }));

  // 선택된 기간에 따른 데이터 결정
  const getTrendsData = () => {
    if (activePeriod === 'yearly' && data.yearly) {
      return data.yearly || [];
    } else if (activePeriod === 'monthly' && data.monthly) {
      return data.monthly || [];
    } else if (activePeriod === 'weekly' && data.weekly) {
      return data.weekly || [];
    } else if (activePeriod === 'daily' && data.daily) {
      return data.daily || [];
    }
    return [];
  };

  // X축 데이터 키 결정
  const getDataKey = () => {
    switch (activePeriod) {
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

  const trendsData = getTrendsData();

  // 차트 타입 옵션
  const chartTypeOptions = [
    { id: 'trends' as ChartType, name: '검색 추이' },
    { id: 'terms' as ChartType, name: '인기 검색어' },
  ];

  // 기간 옵션
  const periodOptions = [
    { id: 'daily' as PeriodType, name: '일별' },
    { id: 'weekly' as PeriodType, name: '주별' },
    { id: 'monthly' as PeriodType, name: '월별' },
    { id: 'yearly' as PeriodType, name: '연도별' },
  ];

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 80; // 더 많은 여백 확보

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{CHART_TITLE}</Text>
          <Text style={styles.subtitle}>
            총 {data.searchCount || 0}회 검색
            {data.frequentlySearchedTerms &&
              data.frequentlySearchedTerms.length > 0 &&
              ` | 가장 많이 검색한 키워드: ${data.frequentlySearchedTerms[0].term}`}
          </Text>
        </View>
        {isMyProfile && (
          <View style={styles.privacyToggle}>
            <View style={styles.switchWrapper}>
              <Globe size={16} color='#64748B' />
              <Switch
                value={isPublic}
                onValueChange={value => {
                  setIsPublic(value);
                  updatePrivacyMutation.mutate(value);
                }}
                trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                thumbColor={isPublic ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor='#F1F5F9'
                style={styles.switch}
              />
            </View>
          </View>
        )}
      </View>

      {/* 차트 타입 선택 */}
      <View style={styles.controlsContainer}>
        <View style={styles.chartTypeContainer}>
          {chartTypeOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.chartTypeButton,
                activeType === option.id && styles.chartTypeButtonActive,
              ]}
              onPress={() => setActiveType(option.id)}
            >
              <Text
                style={[
                  styles.chartTypeButtonText,
                  activeType === option.id && styles.chartTypeButtonTextActive,
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 기간 선택 (trends 탭에서만) */}
        {activeType === 'trends' && (
          <View style={styles.periodContainer}>
            {periodOptions.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.periodButton,
                  activePeriod === option.id && styles.periodButtonActive,
                ]}
                onPress={() => setActivePeriod(option.id)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    activePeriod === option.id && styles.periodButtonTextActive,
                  ]}
                >
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 차트 영역 */}
      <View style={styles.chartContainer}>
        {activeType === 'trends' ? (
          trendsData.length > 0 ? (
            <BarChart
              data={{
                labels: trendsData.slice(-10).map(item => {
                  const key = getDataKey();
                  const value =
                    key === 'year' && 'year' in item
                      ? item.year
                      : key === 'month' && 'month' in item
                        ? item.month
                        : key === 'week' && 'week' in item
                          ? item.week
                          : key === 'date' && 'date' in item
                            ? item.date
                            : '';
                  return formatXAxisLabel(value, activePeriod);
                }),
                datasets: [
                  {
                    data: trendsData.slice(-10).map(item => item.count),
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  },
                ],
              }}
              width={chartWidth}
              height={250}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  strokeWidth: 1,
                  stroke: '#f3f4f6',
                },
                propsForLabels: {
                  fontSize: 11,
                },
                barPercentage: 0.7,
                paddingRight: 20, // 오른쪽 여백 추가
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              withHorizontalLabels
              withVerticalLabels
              yAxisLabel=''
              yAxisSuffix=''
              fromZero
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                {activePeriod === 'daily'
                  ? '일별'
                  : activePeriod === 'weekly'
                    ? '주별'
                    : activePeriod === 'monthly'
                      ? '월별'
                      : '연도별'}{' '}
                검색 데이터가 없습니다
              </Text>
            </View>
          )
        ) : topTermsData.length > 0 ? (
          <PieChart
            data={topTermsData}
            width={chartWidth}
            height={250}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor='population'
            backgroundColor='transparent'
            paddingLeft='15'
            hasLegend
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>인기 검색어 데이터가 없습니다</Text>
          </View>
        )}
      </View>

      {/* 요약 통계 */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <View style={styles.summaryIcon}>
            <Search size={16} color='#3B82F6' />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>총 검색 횟수</Text>
            <Text style={styles.summaryValue}>{data.searchCount || 0}회</Text>
          </View>
        </View>

        {data.frequentlySearchedTerms && data.frequentlySearchedTerms.length > 0 && (
          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <TrendingUp size={16} color='#10B981' />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>최다 검색어</Text>
              <Text style={styles.summaryValue}>
                {data.frequentlySearchedTerms[0].term} ({data.frequentlySearchedTerms[0].count}회)
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 검색 패턴 */}
      {data.searchPattern && (
        <View style={styles.patternContainer}>
          <Text style={styles.patternTitle}>검색 패턴</Text>
          <Text style={styles.patternText}>{data.searchPattern}</Text>
        </View>
      )}
    </View>
  );
};

const SearchActivityChartWrapper: React.FC<SearchActivityChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <SearchActivityChart {...props} />
  </Suspense>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  privacyToggle: {
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
  controlsContainer: {
    marginBottom: 16,
  },
  chartTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chartTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
  },
  chartTypeButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  chartTypeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  chartTypeButtonTextActive: {
    color: '#2563EB',
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
  },
  periodButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  periodButtonText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#2563EB',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10, // 좌우 여백 추가
    overflow: 'visible', // 내용이 잘리지 않도록
  },
  chart: {
    borderRadius: 16,
    marginRight: 10, // 오른쪽 여백 추가
  },
  summaryContainer: {
    gap: 8,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  patternContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  patternTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  patternText: {
    fontSize: 12,
    color: '#92400E',
  },
  privateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    gap: 12,
  },
  privateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default SearchActivityChartWrapper;
