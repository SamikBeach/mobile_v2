import React, { useState, Suspense } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Switch } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Globe } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getFollowerStats } from '../../apis/user';
import { FollowerStatsResponse } from '../../apis/user/types';
import { useCurrentUser, useStatisticsSettings } from '../../hooks';
import { LoadingSpinner } from '../LoadingSpinner';

interface FollowerStatsChartProps {
  userId: number;
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

// 파스텔톤 차트 색상
const PASTEL_COLORS = {
  FOLLOWERS: '#c4b5fd', // violet-300 (파스텔)
  FOLLOWING: '#bef264', // lime-300 (파스텔)
};

const FollowerStatsChart: React.FC<FollowerStatsChartProps> = ({ userId }) => {
  const [activePeriod, setActivePeriod] = useState<PeriodType>('monthly');
  const CHART_TITLE = '팔로워';

  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;

  // 항상 useStatisticsSettings를 호출하되 isMyProfile이 아닐 때는 결과를 무시
  const statisticsHook = useStatisticsSettings(userId);
  const { settings, handleUpdateSetting, isUpdating } = isMyProfile
    ? statisticsHook
    : { settings: null, handleUpdateSetting: () => {}, isUpdating: false };

  const { data, isLoading } = useSuspenseQuery<FollowerStatsResponse>({
    queryKey: ['followerStats', userId],
    queryFn: () => getFollowerStats(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic && !isMyProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{CHART_TITLE}</Text>
        </View>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 공개/비공개 토글 핸들러
  const handlePrivacyToggle = (isPublic: boolean) => {
    handleUpdateSetting('isFollowerStatsPublic', isPublic);
  };

  // 설정 로딩 중 또는 설정 업데이트 중인지 확인
  const showLoading = isLoading || isUpdating || (isMyProfile && !settings);

  // 기간별 데이터 선택
  let chartData = [];
  let dataKey = '';

  switch (activePeriod) {
    case 'yearly':
      chartData = [...(data.yearly || [])].sort((a, b) => a.year.localeCompare(b.year));
      dataKey = 'year';
      break;
    case 'monthly':
      chartData = [...(data.monthly || [])].sort((a, b) => a.month.localeCompare(b.month));
      dataKey = 'month';
      break;
    case 'weekly':
      // 주별 데이터는 단순 사전순 정렬로는 부족함 - 1째주, 2째주 등이 있으므로 별도 처리
      chartData = [...(data.weekly || [])].sort((a, b) => {
        // 월이 다르면 월로 비교
        const aMonth = parseInt(a.week.split('월')[0]);
        const bMonth = parseInt(b.week.split('월')[0]);
        if (aMonth !== bMonth) return aMonth - bMonth;

        // 월이 같으면 주차로 비교
        const aWeek = parseInt(a.week.split('째주')[0].split('월 ')[1]);
        const bWeek = parseInt(b.week.split('째주')[0].split('월 ')[1]);
        return aWeek - bWeek;
      });
      dataKey = 'week';
      break;
    case 'daily':
      chartData = [...(data.daily || [])].sort((a, b) => a.date.localeCompare(b.date));
      dataKey = 'date';
      break;
    default:
      chartData = [...(data.monthly || [])].sort((a, b) => a.month.localeCompare(b.month));
      dataKey = 'month';
  }

  // X축 레이블 포맷터
  const formatXAxisLabel = (label: string) => {
    if (activePeriod === 'yearly') {
      return label;
    } else if (activePeriod === 'monthly') {
      const [_, month] = label.split('-');
      return `${parseInt(month)}월`;
    } else if (activePeriod === 'weekly') {
      return label;
    } else if (activePeriod === 'daily') {
      const [_, month, day] = label.split('-');
      return `${parseInt(month)}/${parseInt(day)}`;
    }
    return label;
  };

  // 데이터가 없는 경우
  const hasNoFollowers = data.followersCount === 0 && data.followingCount === 0;
  const hasNoGrowthData = !chartData || chartData.length === 0;

  if (hasNoFollowers && hasNoGrowthData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{CHART_TITLE}</Text>
          {isMyProfile && (
            <View style={styles.privacyToggle}>
              <View style={styles.switchWrapper}>
                <Globe size={16} color='#64748B' />
                <Switch
                  value={settings?.isFollowerStatsPublic || false}
                  onValueChange={handlePrivacyToggle}
                  trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                  thumbColor={settings?.isFollowerStatsPublic ? '#FFFFFF' : '#F8FAFC'}
                  ios_backgroundColor='#F1F5F9'
                  style={styles.switch}
                  disabled={showLoading}
                />
              </View>
            </View>
          )}
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>팔로워/팔로잉 데이터가 없습니다.</Text>
        </View>
      </View>
    );
  }

  // 기간 옵션
  const periodOptions = [
    { id: 'daily' as PeriodType, name: '일별' },
    { id: 'weekly' as PeriodType, name: '주별' },
    { id: 'monthly' as PeriodType, name: '월별' },
    { id: 'yearly' as PeriodType, name: '연도별' },
  ];

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{CHART_TITLE}</Text>
          <Text style={styles.subtitle}>
            팔로워: {data.followersCount}명 / 팔로잉: {data.followingCount}명
          </Text>
        </View>
        {isMyProfile && (
          <View style={styles.privacyToggle}>
            <View style={styles.switchWrapper}>
              <Globe size={16} color='#64748B' />
              <Switch
                value={settings?.isFollowerStatsPublic || false}
                onValueChange={handlePrivacyToggle}
                trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                thumbColor={settings?.isFollowerStatsPublic ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor='#F1F5F9'
                style={styles.switch}
                disabled={showLoading}
              />
            </View>
          </View>
        )}
      </View>

      {/* 기간 선택 */}
      <View style={styles.periodButtons}>
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

      {/* 차트 */}
      <View style={styles.chartContainer}>
        {chartData.length > 0 ? (
          (() => {
            const recentData = chartData.slice(-6);
            const followersData = recentData.map(item => item.followers);
            const followingData = recentData.map(item => item.following);

            // 모든 값이 0이거나 같은 경우 최소 범위 설정
            const allFollowersValues = followersData.concat(followingData);
            const minValue = Math.min(...allFollowersValues);
            const maxValue = Math.max(...allFollowersValues);
            const hasVariation = maxValue !== minValue || maxValue > 0;

            // Y축 범위를 더 명확하게 만들기 위해 데이터 조정
            let adjustedFollowersData = followersData;
            let adjustedFollowingData = followingData;

            if (!hasVariation) {
              // 모든 값이 같은 경우 약간의 변화를 주어 Y축 스케일이 다양해지도록 함
              adjustedFollowersData = followersData.map((val, idx) => val + idx);
              adjustedFollowingData = followingData.map((val, idx) => val + idx + 0.5);
            }

            // Y축 범위 계산
            const allAdjustedValues = adjustedFollowersData.concat(adjustedFollowingData);
            const maxDataValue = Math.max(...allAdjustedValues);
            const minDataValue = Math.min(...allAdjustedValues);
            const dataRange = maxDataValue - minDataValue;

            // Y축 segments 계산 - 더 명확한 라벨 표시를 위해 수정
            let segments = 4; // 기본값을 4로 설정하여 충분한 라벨 표시

            // segments가 너무 적으면 Y축 라벨이 제대로 표시되지 않으므로 최소값 보장
            if (dataRange <= 1) {
              segments = 2; // 최소 2개의 구간으로 0과 최댓값 표시
            } else if (dataRange <= 5) {
              segments = 3;
            } else {
              segments = 4;
            }

            return (
              <LineChart
                data={{
                  labels: recentData.map(item => formatXAxisLabel((item as any)[dataKey])),
                  datasets: [
                    {
                      data: adjustedFollowersData,
                      color: () => PASTEL_COLORS.FOLLOWERS,
                      strokeWidth: 2,
                    },
                    {
                      data: adjustedFollowingData,
                      color: () => PASTEL_COLORS.FOLLOWING,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={chartWidth}
                height={220}
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
                  fillShadowGradient: '#ffffff',
                  fillShadowGradientOpacity: 0,
                  formatYLabel: (yValue: string) => {
                    const num = parseFloat(yValue);
                    const roundedValue = Math.round(num);

                    // 음수 값은 표시하지 않음
                    if (roundedValue < 0) {
                      return '';
                    }

                    // 소수점이 있는 경우 정수로 반올림하여 표시
                    return roundedValue.toString();
                  },
                }}
                style={styles.chart}
                bezier
                withHorizontalLabels={true}
                withVerticalLabels={true}
                withDots
                withShadow={false}
                withInnerLines={true}
                withOuterLines={true}
                fromZero={true}
                segments={segments}
              />
            );
          })()
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>선택한 기간의 데이터가 없습니다</Text>
          </View>
        )}
      </View>

      {/* 범례 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PASTEL_COLORS.FOLLOWERS }]} />
          <Text style={styles.legendText}>팔로워</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PASTEL_COLORS.FOLLOWING }]} />
          <Text style={styles.legendText}>팔로잉</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  periodButtonActive: {
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#2563EB',
  },
  chartContainer: {
    alignItems: 'center',
    minHeight: 220,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 0,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
  },
  privateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  privateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

const FollowerStatsChartWrapper: React.FC<FollowerStatsChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <FollowerStatsChart {...props} />
  </Suspense>
);

export default FollowerStatsChartWrapper;
