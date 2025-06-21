import React, { Suspense } from 'react';
import { View, Text, StyleSheet, Dimensions, Switch } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Globe, Calendar, Activity, TrendingUp } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getLibraryUpdatePattern } from '../../apis/user';
import { LibraryUpdatePatternResponse } from '../../apis/user/types';
import { useCurrentUser, useStatisticsSettings } from '../../hooks';
import { LoadingSpinner } from '../LoadingSpinner';

interface LibraryUpdatePatternChartProps {
  userId: number;
}

const LibraryUpdatePatternChart: React.FC<LibraryUpdatePatternChartProps> = ({ userId }) => {
  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;

  const statisticsHook = useStatisticsSettings(userId);
  const { settings, handleUpdateSetting } = isMyProfile
    ? statisticsHook
    : { settings: null, handleUpdateSetting: () => {} };

  const { data } = useSuspenseQuery<LibraryUpdatePatternResponse>({
    queryKey: ['user-statistics', userId, 'library-update-pattern'],
    queryFn: () => getLibraryUpdatePattern(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic && !isMyProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>서재 업데이트 패턴</Text>
        </View>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 데이터가 없는 경우
  if (data.updateFrequency.length === 0 && data.weekdayActivity.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>서재 업데이트 패턴</Text>
            <Text style={styles.subtitle}>업데이트 기록이 없습니다</Text>
          </View>
          {isMyProfile && (
            <View style={styles.switchContainer}>
              <View style={styles.switchWrapper}>
                <Globe size={16} color='#64748B' />
                <Switch
                  value={settings?.isLibraryUpdatePatternPublic || false}
                  onValueChange={value =>
                    handleUpdateSetting('isLibraryUpdatePatternPublic', value)
                  }
                  trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                  thumbColor={settings?.isLibraryUpdatePatternPublic ? '#FFFFFF' : '#F8FAFC'}
                  ios_backgroundColor='#F1F5F9'
                  style={styles.switch}
                />
              </View>
            </View>
          )}
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>업데이트 패턴 데이터가 없습니다</Text>
        </View>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;

  // 요일별 활동 데이터 (영어 -> 한국어 변환)
  const weekdayMap: Record<string, string> = {
    Monday: '월',
    Tuesday: '화',
    Wednesday: '수',
    Thursday: '목',
    Friday: '금',
    Saturday: '토',
    Sunday: '일',
  };

  const weekdayData = data.weekdayActivity.map(item => ({
    ...item,
    day: weekdayMap[item.day] || item.day,
  }));

  // 총 업데이트 수 계산
  const totalUpdates = data.updateFrequency.reduce((sum, item) => sum + item.updatesPerMonth, 0);

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>서재 업데이트 패턴</Text>
          <Text style={styles.subtitle}>
            총 {data.updateFrequency.length}개 서재 | {totalUpdates}회 업데이트
          </Text>
        </View>
        {isMyProfile && (
          <View style={styles.switchContainer}>
            <View style={styles.switchWrapper}>
              <Globe size={16} color='#64748B' />
              <Switch
                value={settings?.isLibraryUpdatePatternPublic || false}
                onValueChange={value => handleUpdateSetting('isLibraryUpdatePatternPublic', value)}
                trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                thumbColor={settings?.isLibraryUpdatePatternPublic ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor='#F1F5F9'
                style={styles.switch}
              />
            </View>
          </View>
        )}
      </View>

      {/* 가장 활발한 라이브러리 하이라이트 */}
      {data.mostActiveLibrary && (
        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <View style={styles.iconContainer}>
              <Activity size={20} color='#10B981' />
            </View>
            <View style={styles.highlightInfo}>
              <Text style={styles.highlightLabel}>가장 활발한 서재</Text>
              <Text style={styles.highlightTitle}>{data.mostActiveLibrary}</Text>
              <Text style={styles.highlightSubtitle}>
                가장 활발한 서재 •{' '}
                {data.updateFrequency.find(lib => lib.library === data.mostActiveLibrary)
                  ?.updatesPerMonth || 0}
                회 업데이트
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 업데이트 빈도 섹션 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={16} color='#6B7280' />
          <Text style={styles.sectionTitle}>서재별 업데이트 빈도</Text>
        </View>
        <View style={styles.updateFrequencyList}>
          {data.updateFrequency.slice(0, 6).map((item, index) => (
            <View key={item.library} style={styles.updateItem}>
              <View style={styles.updateRank}>
                <Text style={styles.updateRankText}>{index + 1}</Text>
              </View>
              <View style={styles.updateInfo}>
                <Text style={styles.updateLibraryName} numberOfLines={1}>
                  {item.library}
                </Text>
                <View style={styles.updateProgressContainer}>
                  <View style={styles.updateProgress}>
                    <View
                      style={[
                        styles.updateProgressFill,
                        {
                          width: `${Math.min((item.updatesPerMonth / Math.max(...data.updateFrequency.map(u => u.updatesPerMonth))) * 100, 100)}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.updateCount}>{item.updatesPerMonth}회/월</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 요일별 활동 패턴 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>요일별 활동 패턴</Text>

        {weekdayData.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={{
                labels: weekdayData.map(item => item.day),
                datasets: [
                  {
                    data: weekdayData.map(item => item.count),
                    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                  },
                ],
              }}
              width={chartWidth}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
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
                barPercentage: 0.6,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              withHorizontalLabels
              withVerticalLabels
              yAxisLabel=''
              yAxisSuffix='회'
              fromZero
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>요일별 활동 데이터가 없습니다</Text>
          </View>
        )}
      </View>

      {/* 업데이트 요약 */}
      <View style={styles.summarySection}>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Calendar size={18} color='#3B82F6' />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>가장 활발한 요일</Text>
              <Text style={styles.summaryValue}>
                {weekdayData.length > 0
                  ? weekdayData.reduce((max, current) =>
                      max.count > current.count ? max : current
                    ).day + '요일'
                  : '데이터 없음'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Activity size={18} color='#10B981' />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>업데이트 점수</Text>
              <Text style={styles.summaryValue}>
                {totalUpdates > 20
                  ? '매우 활발'
                  : totalUpdates > 10
                    ? '활발'
                    : totalUpdates > 5
                      ? '보통'
                      : '저조'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const LibraryUpdatePatternChartWrapper: React.FC<LibraryUpdatePatternChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <LibraryUpdatePatternChart {...props} />
  </Suspense>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  switchContainer: {
    justifyContent: 'flex-end',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  highlightCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  highlightInfo: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 2,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
  },
  highlightSubtitle: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  updateFrequencyList: {
    gap: 12,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  updateRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  updateRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  updateInfo: {
    flex: 1,
  },
  updateLibraryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  updateProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  updateProgress: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  updateProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  updateCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    minWidth: 50,
    textAlign: 'right',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  summarySection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  privateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  privateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LibraryUpdatePatternChartWrapper;
