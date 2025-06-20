import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Globe, Clock, BookOpen, Target } from 'lucide-react-native';
import { ChartColors } from '../../constants/colors';

interface ReadingSpeedChartProps {
  userId: number;
}

export const ReadingSpeedChart: React.FC<ReadingSpeedChartProps> = ({ userId: _userId }) => {
  const [isPublic, setIsPublic] = useState(true);

  // 가상 독서 속도 통계 데이터 (실제로는 API에서 가져올 데이터)
  const readingSpeedData = {
    avgPagesPerHour: 60,
    fastestRead: { title: '동물농장', author: '조지 오웰', pagesPerHour: 85 },
    slowestRead: { title: '순수이성비판', author: '임마누엘 칸트', pagesPerHour: 22 },
    totalReadingDays: 238,
    longestReadingStreak: 14,
    currentReadingStreak: 3,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>독서 속도 & 스트릭</Text>
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

      {/* 독서 속도 섹션 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Clock size={20} color='#3B82F6' />
          <Text style={styles.sectionTitle}>독서 속도</Text>
        </View>

        {/* 평균 독서 속도 */}
        <View style={styles.avgSpeedCard}>
          <Text style={styles.avgSpeedLabel}>시간당 평균 페이지</Text>
          <Text style={styles.avgSpeedValue}>{readingSpeedData.avgPagesPerHour} 페이지</Text>
        </View>

        {/* 가장 빠른 / 느린 독서 */}
        <View style={styles.extremeReads}>
          <View style={styles.extremeReadCard}>
            <View style={styles.extremeReadHeader}>
              <Target size={16} color='#10B981' />
              <Text style={styles.extremeReadLabel}>가장 빠르게</Text>
            </View>
            <Text style={styles.extremeReadTitle} numberOfLines={2}>
              {readingSpeedData.fastestRead.title}
            </Text>
            <Text style={styles.extremeReadAuthor}>{readingSpeedData.fastestRead.author}</Text>
            <Text style={styles.extremeReadSpeed}>
              {readingSpeedData.fastestRead.pagesPerHour} 페이지/시간
            </Text>
          </View>

          <View style={styles.extremeReadCard}>
            <View style={styles.extremeReadHeader}>
              <BookOpen size={16} color='#F59E0B' />
              <Text style={styles.extremeReadLabel}>가장 천천히</Text>
            </View>
            <Text style={styles.extremeReadTitle} numberOfLines={2}>
              {readingSpeedData.slowestRead.title}
            </Text>
            <Text style={styles.extremeReadAuthor}>{readingSpeedData.slowestRead.author}</Text>
            <Text style={styles.extremeReadSpeed}>
              {readingSpeedData.slowestRead.pagesPerHour} 페이지/시간
            </Text>
          </View>
        </View>
      </View>

      {/* 독서 스트릭 섹션 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Target size={20} color='#EF4444' />
          <Text style={styles.sectionTitle}>독서 스트릭</Text>
        </View>

        {/* 최장 연속 독서 */}
        <View style={styles.streakCard}>
          <Text style={styles.streakLabel}>최장 연속 독서</Text>
          <Text style={styles.streakValue}>{readingSpeedData.longestReadingStreak}일</Text>
        </View>

        {/* 현재 스트릭과 올해 독서일 */}
        <View style={styles.currentStatsGrid}>
          <View style={styles.currentStatCard}>
            <Text style={styles.currentStatLabel}>현재 연속 독서</Text>
            <View style={styles.currentStreakContainer}>
              <Text style={styles.currentStatValue}>{readingSpeedData.currentReadingStreak}일</Text>
              {readingSpeedData.currentReadingStreak >= 3 && (
                <View style={styles.achievementBadge}>
                  <Text style={styles.achievementText}>달성 중!</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.currentStatCard}>
            <Text style={styles.currentStatLabel}>올해 독서한 날</Text>
            <Text style={styles.currentStatValue}>{readingSpeedData.totalReadingDays}일</Text>
            <Text style={styles.currentStatDescription}>
              전체 일수의 {Math.round((readingSpeedData.totalReadingDays / 365) * 100)}%
            </Text>
          </View>
        </View>
      </View>
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
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ChartColors.text,
    marginLeft: 8,
  },
  avgSpeedCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  avgSpeedLabel: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 4,
  },
  avgSpeedValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E40AF',
  },
  extremeReads: {
    flexDirection: 'row',
    gap: 12,
  },
  extremeReadCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  extremeReadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  extremeReadLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  extremeReadTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
    minHeight: 32,
  },
  extremeReadAuthor: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  extremeReadSpeed: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  streakCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  streakLabel: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
  },
  currentStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  currentStatCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  currentStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  currentStreakContainer: {
    alignItems: 'flex-start',
  },
  currentStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  currentStatDescription: {
    fontSize: 10,
    color: '#6B7280',
  },
  achievementBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  achievementText: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '500',
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
});
