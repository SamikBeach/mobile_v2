import React, { useState, Suspense } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Switch } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Globe, Users, Crown } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getLibraryPopularity } from '../../apis/user';
import { LibraryPopularityResponse } from '../../apis/user/types';
import { useCurrentUser, useStatisticsSettings } from '../../hooks';
import { LoadingSpinner } from '../LoadingSpinner';

interface LibraryPopularityChartProps {
  userId: number;
}

type PeriodType = 'yearly' | 'monthly' | 'weekly' | 'daily';

const LibraryPopularityChart: React.FC<LibraryPopularityChartProps> = ({ userId }) => {
  const [activePeriod, setActivePeriod] = useState<PeriodType>('monthly');

  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;

  const statisticsHook = useStatisticsSettings(userId);
  const { settings, handleUpdateSetting } = isMyProfile
    ? statisticsHook
    : { settings: null, handleUpdateSetting: () => {} };

  const { data } = useSuspenseQuery<LibraryPopularityResponse>({
    queryKey: ['user-statistics', userId, 'library-popularity'],
    queryFn: () => getLibraryPopularity(userId),
  });

  if (!data.isPublic && !isMyProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>서재 인기도</Text>
        </View>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  if (!data.subscribersPerLibrary || data.subscribersPerLibrary.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>서재 인기도</Text>
          {isMyProfile && (
            <View style={styles.switchContainer}>
              <View style={styles.switchWrapper}>
                <Globe size={16} color='#64748B' />
                <Switch
                  value={settings?.isLibraryPopularityPublic || false}
                  onValueChange={value => handleUpdateSetting('isLibraryPopularityPublic', value)}
                  trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                  thumbColor={settings?.isLibraryPopularityPublic ? '#FFFFFF' : '#F8FAFC'}
                  ios_backgroundColor='#F1F5F9'
                  style={styles.switch}
                />
              </View>
            </View>
          )}
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>서재 인기도 데이터가 없습니다</Text>
        </View>
      </View>
    );
  }

  // 라이브러리별 구독자 수 상위 5개
  const currentSubscribersData = data.subscribersPerLibrary.slice(0, 5);

  // 차트 데이터 생성 - 기간별 데이터에서 첫 번째 라이브러리들을 추출
  const getChartData = () => {
    switch (activePeriod) {
      case 'yearly':
        return data.yearly && data.yearly.length > 0 ? data.yearly[0].libraries : [];
      case 'monthly':
        return data.monthly && data.monthly.length > 0 ? data.monthly[0].libraries : [];
      case 'weekly':
        return data.weekly && data.weekly.length > 0 ? data.weekly[0].libraries : [];
      case 'daily':
        return data.daily && data.daily.length > 0 ? data.daily[0].libraries : [];
      default:
        return data.subscribersPerLibrary;
    }
  };

  const chartData = getChartData();

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;

  // 기간 옵션
  const periodOptions = [
    { id: 'daily' as PeriodType, name: '일별' },
    { id: 'weekly' as PeriodType, name: '주별' },
    { id: 'monthly' as PeriodType, name: '월별' },
    { id: 'yearly' as PeriodType, name: '연도별' },
  ];

  const currentChartData = chartData.length > 0 ? chartData.slice(-8) : [];

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>서재 인기도</Text>
          <Text style={styles.subtitle}>
            총 {data.subscribersPerLibrary.length}개 서재
            {data.mostPopularLibrary && ` | 최고 ${data.mostPopularLibrary}`}
          </Text>
        </View>
        {isMyProfile && (
          <View style={styles.switchContainer}>
            <View style={styles.switchWrapper}>
              <Globe size={16} color='#64748B' />
              <Switch
                value={settings?.isLibraryPopularityPublic || false}
                onValueChange={value => handleUpdateSetting('isLibraryPopularityPublic', value)}
                trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                thumbColor={settings?.isLibraryPopularityPublic ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor='#F1F5F9'
                style={styles.switch}
              />
            </View>
          </View>
        )}
      </View>

      {/* 가장 인기있는 서재 하이라이트 */}
      {data.mostPopularLibrary && (
        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <View style={styles.iconContainer}>
              <Crown size={20} color='#F59E0B' />
            </View>
            <View style={styles.highlightInfo}>
              <Text style={styles.highlightLabel}>가장 인기있는 서재</Text>
              <Text style={styles.highlightTitle}>{data.mostPopularLibrary}</Text>
              <Text style={styles.highlightSubtitle}>
                {currentSubscribersData.find(lib => lib.library === data.mostPopularLibrary)
                  ?.subscribers || 0}
                명이 구독 중
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 기간 선택 */}
      <View style={styles.controlsContainer}>
        <View style={styles.periodContainer}>
          {periodOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[styles.periodButton, activePeriod === option.id && styles.periodButtonActive]}
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
      </View>

      {/* 차트 영역 */}
      <View style={styles.chartContainer}>
        {currentChartData.length > 0 ? (
          <BarChart
            data={{
              labels: currentChartData.map(item =>
                item.library.length > 8 ? `${item.library.substring(0, 8)}...` : item.library
              ),
              datasets: [
                {
                  data: currentChartData.map(item => item.subscribers),
                  color: (opacity = 1) => `rgba(251, 191, 36, ${opacity})`,
                },
              ],
            }}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: '#FFFBEB',
              backgroundGradientFrom: '#FFFBEB',
              backgroundGradientTo: '#FFFBEB',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(251, 191, 36, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
              style: { borderRadius: 16 },
              propsForBackgroundLines: {
                strokeDasharray: '',
                strokeWidth: 1,
                stroke: '#FEF3C7',
              },
              propsForLabels: { fontSize: 10 },
              barPercentage: 0.6,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
            yAxisLabel=''
            yAxisSuffix='명'
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>차트 데이터가 없습니다</Text>
          </View>
        )}
      </View>

      {/* 구독자 순위 리스트 */}
      <View style={styles.subscribersList}>
        <View style={styles.subscribersHeader}>
          <Users size={16} color='#6B7280' />
          <Text style={styles.subscribersTitle}>구독자 순위</Text>
        </View>
        {currentSubscribersData.map((library, index) => (
          <View key={`${library.library}-${index}`} style={styles.subscriberItem}>
            <View style={styles.subscriberRank}>
              <Text style={styles.subscriberRankText}>{index + 1}</Text>
            </View>
            <View style={styles.subscriberInfo}>
              <Text style={styles.subscriberName} numberOfLines={1}>
                {library.library}
              </Text>
              <Text style={styles.subscriberCount}>{library.subscribers}명</Text>
            </View>
            <View style={styles.subscriberProgress}>
              <View
                style={[
                  styles.subscriberProgressFill,
                  {
                    width: `${Math.min((library.subscribers / Math.max(...currentSubscribersData.map(l => l.subscribers))) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const LibraryPopularityChartWrapper: React.FC<LibraryPopularityChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <LibraryPopularityChart {...props} />
  </Suspense>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    fontWeight: '500',
    color: '#6B7280',
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
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  highlightInfo: {
    flex: 1,
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
    marginBottom: 4,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#78350F',
    marginBottom: 2,
  },
  highlightSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A16207',
  },
  controlsContainer: {
    marginBottom: 20,
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
  },
  periodButtonActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#D97706',
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chart: {
    borderRadius: 16,
  },
  subscribersList: {
    marginBottom: 24,
  },
  subscribersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribersTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  subscriberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
  },
  subscriberRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subscriberRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  subscriberInfo: {
    flex: 1,
    marginRight: 12,
  },
  subscriberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  subscriberCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  subscriberProgress: {
    width: 60,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  subscriberProgressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  privateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
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

export default LibraryPopularityChartWrapper;
