import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Switch } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Globe, MessageSquare, ThumbsUp, Heart, Send } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getUserInteraction } from '../../apis/user';
import { UserInteractionResponse } from '../../apis/user/types';
import { useCurrentUser, useStatisticsSettings } from '../../hooks';

interface UserInteractionChartProps {
  userId: number;
}

type DataType = 'likes' | 'comments';

const { width: screenWidth } = Dimensions.get('window');

const UserInteractionChart: React.FC<UserInteractionChartProps> = ({ userId }) => {
  const [activeDataType, setActiveDataType] = useState<DataType>('likes');

  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;

  // 항상 useStatisticsSettings를 호출하되 isMyProfile이 아닐 때는 결과를 무시
  const statisticsHook = useStatisticsSettings(userId);
  const { settings, handleUpdateSetting } = isMyProfile
    ? statisticsHook
    : { settings: null, handleUpdateSetting: () => {} };

  const { data } = useSuspenseQuery<UserInteractionResponse>({
    queryKey: ['userInteraction', userId],
    queryFn: () => getUserInteraction(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic && !isMyProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>사용자 상호작용</Text>
        </View>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 차트 데이터 준비 (월별 최근 6개월)
  const getChartData = () => {
    const currentData =
      activeDataType === 'likes'
        ? data.monthlyLikesReceived.slice(-6)
        : data.monthlyCommentsReceived.slice(-6);

    if (!currentData.length) return null;

    return {
      labels: currentData.map(item => {
        const [, month] = item.month.split('-');
        return `${parseInt(month)}월`;
      }),
      datasets: [
        {
          data: currentData.map(item => item.count),
          color: (opacity = 1) =>
            activeDataType === 'likes'
              ? `rgba(239, 68, 68, ${opacity})`
              : `rgba(59, 130, 246, ${opacity})`,
        },
      ],
    };
  };

  const chartData = getChartData();

  // 공개/비공개 토글 핸들러
  const handlePrivacyToggle = (value: boolean) => {
    handleUpdateSetting('isUserInteractionPublic', value);
  };

  // 데이터 타입 옵션
  const dataTypeOptions = [
    { id: 'likes' as DataType, name: '좋아요', icon: ThumbsUp },
    { id: 'comments' as DataType, name: '댓글', icon: MessageSquare },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>사용자 상호작용</Text>
        {isMyProfile && (
          <View style={styles.privacyToggle}>
            <Globe size={16} color='#64748B' />
            <Switch
              value={settings?.isUserInteractionPublic || false}
              onValueChange={handlePrivacyToggle}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings?.isUserInteractionPublic ? '#FFFFFF' : '#FFFFFF'}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        )}
      </View>

      {/* 상호작용 통계 카드들 */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.likesReceivedCard]}>
          <View style={styles.statCardHeader}>
            <View style={styles.iconContainer}>
              <Heart size={16} color='#EF4444' />
            </View>
            <View style={styles.statCardContent}>
              <Text style={styles.statLabel}>받은 좋아요</Text>
              <Text style={styles.statValue}>{data.totalLikesReceived.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statCard, styles.commentsReceivedCard]}>
          <View style={styles.statCardHeader}>
            <View style={styles.iconContainer}>
              <MessageSquare size={16} color='#3B82F6' />
            </View>
            <View style={styles.statCardContent}>
              <Text style={styles.statLabel}>받은 댓글</Text>
              <Text style={styles.statValue}>{data.totalCommentsReceived.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statCard, styles.likesGivenCard]}>
          <View style={styles.statCardHeader}>
            <View style={styles.iconContainer}>
              <ThumbsUp size={16} color='#10B981' />
            </View>
            <View style={styles.statCardContent}>
              <Text style={styles.statLabel}>준 좋아요</Text>
              <Text style={styles.statValue}>{data.totalLikesGiven.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statCard, styles.commentsGivenCard]}>
          <View style={styles.statCardHeader}>
            <View style={styles.iconContainer}>
              <Send size={16} color='#F59E0B' />
            </View>
            <View style={styles.statCardContent}>
              <Text style={styles.statLabel}>작성한 댓글</Text>
              <Text style={styles.statValue}>{data.totalCommentsCreated.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 참여도 */}
      <View style={styles.engagementCard}>
        <Text style={styles.engagementLabel}>참여도</Text>
        <Text style={styles.engagementValue}>{(data.engagementRate * 100).toFixed(1)}%</Text>
        <View style={styles.engagementBar}>
          <View
            style={[
              styles.engagementFill,
              { width: `${Math.min(data.engagementRate * 100, 100)}%` },
            ]}
          />
        </View>
      </View>

      {/* 차트 타입 선택 */}
      <View style={styles.dataTypeButtons}>
        {dataTypeOptions.map(option => {
          const IconComponent = option.icon;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.dataTypeButton,
                activeDataType === option.id && styles.dataTypeButtonActive,
              ]}
              onPress={() => setActiveDataType(option.id)}
            >
              <IconComponent
                size={16}
                color={activeDataType === option.id ? '#FFFFFF' : '#6B7280'}
              />
              <Text
                style={[
                  styles.dataTypeButtonText,
                  activeDataType === option.id && styles.dataTypeButtonTextActive,
                ]}
              >
                {option.name} 추이
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 차트 */}
      <View style={styles.chartContainer}>
        {chartData ? (
          <BarChart
            data={chartData}
            width={screenWidth - 32}
            height={200}
            yAxisLabel=''
            yAxisSuffix=''
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) =>
                activeDataType === 'likes'
                  ? `rgba(239, 68, 68, ${opacity})`
                  : `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: { borderRadius: 0 },
              propsForLabels: { fontSize: 10 },
              barPercentage: 0.6,
            }}
            style={styles.chart}
            showValuesOnTopOfBars={false}
            fromZero={true}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>차트 데이터가 없습니다</Text>
          </View>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  likesReceivedCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  commentsReceivedCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  likesGivenCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  commentsGivenCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  engagementCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  engagementLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  engagementValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  engagementBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  engagementFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  dataTypeButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dataTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  dataTypeButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
  dataTypeButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dataTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    alignItems: 'center',
    minHeight: 200,
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

export default UserInteractionChart;
