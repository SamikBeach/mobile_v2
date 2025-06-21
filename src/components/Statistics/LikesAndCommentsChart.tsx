import React, { useState, Suspense } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Switch } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Globe, MessageSquare, ThumbsUp, Heart, Send } from 'lucide-react-native';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserInteraction, updateStatisticsSetting } from '../../apis/user';
import { UserInteractionResponse } from '../../apis/user/types';
import { useCurrentUser } from '../../hooks';
import { LoadingSpinner } from '../LoadingSpinner';
import { ChartColors } from '../../constants/colors';

interface LikesAndCommentsChartProps {
  userId: number;
}

type DataType = 'likes' | 'comments';

const LikesAndCommentsChart: React.FC<LikesAndCommentsChartProps> = ({ userId }) => {
  const [activeDataType, setActiveDataType] = useState<DataType>('likes');
  const [isPublic, setIsPublic] = useState(true);

  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;
  const queryClient = useQueryClient();

  const { data } = useSuspenseQuery<UserInteractionResponse>({
    queryKey: ['userInteraction', userId],
    queryFn: () => getUserInteraction(userId),
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (isPublic: boolean) =>
      updateStatisticsSetting({ isUserInteractionPublic: isPublic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInteraction', userId] });
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
          <Text style={styles.title}>좋아요와 댓글</Text>
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

  // 데이터 타입 옵션
  const dataTypeOptions = [
    { id: 'likes' as DataType, name: '좋아요', icon: ThumbsUp },
    { id: 'comments' as DataType, name: '댓글', icon: MessageSquare },
  ];

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>좋아요와 댓글</Text>
        {isMyProfile && (
          <View style={styles.switchContainer}>
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

      {/* 차트 영역 */}
      <View style={styles.chartContainer}>
        {chartData ? (
          <BarChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) =>
                activeDataType === 'likes'
                  ? `rgba(239, 68, 68, ${opacity})`
                  : `rgba(59, 130, 246, ${opacity})`,
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
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {activeDataType === 'likes' ? '좋아요' : '댓글'} 데이터가 없습니다
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const LikesAndCommentsChartWrapper: React.FC<LikesAndCommentsChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <LikesAndCommentsChart {...props} />
  </Suspense>
);

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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
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
    borderColor: '#BFDBFE',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  engagementCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  engagementLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  engagementValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  engagementBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  engagementFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  dataTypeButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  dataTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  dataTypeButtonTextActive: {
    color: '#2563EB',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
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

export default LikesAndCommentsChartWrapper;
