import React, { useState, Suspense } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { BarChart } from 'react-native-chart-kit';
import { Globe } from 'lucide-react-native';
import { useCurrentUser, useStatisticsSettings } from '../../hooks';
import { getCommunityActivity } from '../../apis/user';
import { CommunityActivityResponse } from '../../apis/user/types';
import { LoadingSpinner } from '../LoadingSpinner';

interface CommunityActivityChartProps {
  userId: number;
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

// 커뮤니티 활동 데이터 항목 타입
interface CommunityActivityDataItem {
  year?: string;
  month?: string;
  week?: string;
  date?: string;
  general: number;
  discussion: number;
  question: number;
  meetup: number;
  [key: string]: any; // 동적 필드 처리를 위한 인덱스 시그니처
}

const CommunityActivityChart: React.FC<CommunityActivityChartProps> = ({ userId }) => {
  const [activePeriod, setActivePeriod] = useState<PeriodType>('monthly');

  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;

  // 항상 useStatisticsSettings를 호출하되 isMyProfile이 아닐 때는 결과를 무시
  const statisticsHook = useStatisticsSettings(userId);
  const { settings, handleUpdateSetting, isUpdating } = isMyProfile
    ? statisticsHook
    : { settings: null, handleUpdateSetting: () => {}, isUpdating: false };

  const { data, isLoading } = useSuspenseQuery<CommunityActivityResponse>({
    queryKey: ['communityActivity', userId],
    queryFn: () => getCommunityActivity(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic && !isMyProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>커뮤니티 활동</Text>
        </View>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 공개/비공개 토글 핸들러
  const handlePrivacyToggle = (isPublic: boolean) => {
    handleUpdateSetting('isCommunityActivityPublic', isPublic);
  };

  // 설정 로딩 중 또는 설정 업데이트 중인지 확인
  const showLoading = isLoading || isUpdating || (isMyProfile && !settings);

  // 주어진 기간에 따라 차트 데이터 생성
  const getChartData = () => {
    if (!data) return [];

    // 데이터 배열 선언
    let chartData: CommunityActivityDataItem[] = [];

    // 월 이름과 날짜 이름을 저장할 배열
    const monthNames: string[] = [];
    const dayNames: string[] = [];

    switch (activePeriod) {
      case 'yearly':
        return data.yearly || [];

      case 'monthly':
        // 최근 5개월 데이터 생성
        for (let i = 4; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          monthNames.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        }

        // 서버 데이터에서 해당 월 데이터 찾아서 매핑
        chartData = monthNames.map(monthKey => {
          const monthData = data.monthly.find(item => item.month === monthKey);
          return (
            monthData || {
              month: monthKey,
              general: 0,
              discussion: 0,
              question: 0,
              meetup: 0,
            }
          );
        });
        return chartData;

      case 'weekly':
        return data.weekly || [];

      case 'daily':
        // 최근 5일 데이터 생성
        for (let i = 4; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dayNames.push(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              '0'
            )}-${String(date.getDate()).padStart(2, '0')}`
          );
        }

        // 서버 데이터에서 해당 일자 데이터 찾아서 매핑
        chartData = dayNames.map(dateKey => {
          const dayData = data.daily.find(item => item.date === dateKey);
          return (
            dayData || {
              date: dateKey,
              general: 0,
              discussion: 0,
              question: 0,
              meetup: 0,
            }
          );
        });
        return chartData;

      default:
        return [];
    }
  };

  // 현재 기간에 따른 X축 데이터 키 결정
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
  const hasNoData = () => {
    const chartData = getChartData();
    return !chartData || chartData.length === 0 || data.totalReviews === 0;
  };

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
          <Text style={styles.title}>커뮤니티 활동</Text>
        </View>
        {isMyProfile && (
          <View style={styles.privacyToggle}>
            <View style={styles.switchWrapper}>
              <Globe size={16} color='#64748B' />
              <Switch
                value={settings?.isCommunityActivityPublic || false}
                onValueChange={handlePrivacyToggle}
                trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                thumbColor={settings?.isCommunityActivityPublic ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor='#F1F5F9'
                style={styles.switch}
                disabled={showLoading}
              />
            </View>
          </View>
        )}
      </View>

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

      <View style={styles.chartContainer}>
        {hasNoData() ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>데이터가 없습니다</Text>
          </View>
        ) : (
          <BarChart
            data={{
              labels: getChartData().map(item => formatXAxisLabel((item as any)[getDataKey()])),
              datasets: [
                {
                  data: getChartData().map(
                    item => item.general + item.discussion + item.question + item.meetup
                  ),
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
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            withHorizontalLabels
            withVerticalLabels
            yAxisLabel=''
            yAxisSuffix=''
            fromZero
          />
        )}
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
  periodContainer: {
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
    minHeight: 250,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 0,
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

const CommunityActivityChartWrapper: React.FC<CommunityActivityChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <CommunityActivityChart {...props} />
  </Suspense>
);

export default CommunityActivityChartWrapper;
