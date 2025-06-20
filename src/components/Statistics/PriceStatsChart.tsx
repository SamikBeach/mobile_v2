import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Globe, DollarSign, TrendingUp, TrendingDown } from 'lucide-react-native';
import { ChartColors } from '../../constants/colors';

interface PriceStatsChartProps {
  userId: number;
}

export const PriceStatsChart: React.FC<PriceStatsChartProps> = ({ userId: _userId }) => {
  const [isPublic, setIsPublic] = useState(true);

  // 가상 가격 통계 데이터 (실제로는 API에서 가져올 데이터)
  const priceStatsData = {
    totalSpent: 2876000,
    avgPrice: 18400,
    mostExpensive: { title: '서양철학사', price: 45000 },
    cheapest: { title: '소나기', price: 8000 },
    savedByUsed: 512000,
    percentUsedBooks: 28,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>가격 통계</Text>
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

      {/* 총 지출액 */}
      <View style={styles.totalSpentCard}>
        <View style={styles.totalSpentHeader}>
          <View style={styles.iconContainer}>
            <DollarSign size={24} color='#059669' />
          </View>
          <View style={styles.totalSpentInfo}>
            <Text style={styles.totalSpentLabel}>총 지출액</Text>
            <Text style={styles.totalSpentValue}>
              {priceStatsData.totalSpent.toLocaleString()}원
            </Text>
          </View>
        </View>
      </View>

      {/* 가격 통계 상세 */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>평균 도서 가격</Text>
          <Text style={styles.statValue}>{priceStatsData.avgPrice.toLocaleString()}원</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>중고책 절약액</Text>
          <Text style={styles.statValue}>{priceStatsData.savedByUsed.toLocaleString()}원</Text>
        </View>
      </View>

      {/* 가장 비싼 책 / 가장 저렴한 책 */}
      <View style={styles.extremeBooks}>
        <View style={styles.extremeBookCard}>
          <View style={styles.extremeBookHeader}>
            <TrendingUp size={16} color='#EF4444' />
            <Text style={styles.extremeBookLabel}>가장 비싼 책</Text>
          </View>
          <Text style={styles.extremeBookTitle} numberOfLines={2}>
            {priceStatsData.mostExpensive.title}
          </Text>
          <Text style={styles.extremeBookPrice}>
            {priceStatsData.mostExpensive.price.toLocaleString()}원
          </Text>
        </View>

        <View style={styles.extremeBookCard}>
          <View style={styles.extremeBookHeader}>
            <TrendingDown size={16} color='#10B981' />
            <Text style={styles.extremeBookLabel}>가장 저렴한 책</Text>
          </View>
          <Text style={styles.extremeBookTitle} numberOfLines={2}>
            {priceStatsData.cheapest.title}
          </Text>
          <Text style={styles.extremeBookPrice}>
            {priceStatsData.cheapest.price.toLocaleString()}원
          </Text>
        </View>
      </View>

      {/* 중고책 비율 */}
      <View style={styles.usedBooksSection}>
        <Text style={styles.usedBooksTitle}>중고책 구매 비율</Text>
        <View style={styles.usedBooksProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${priceStatsData.percentUsedBooks}%` }]} />
          </View>
          <Text style={styles.usedBooksPercentage}>{priceStatsData.percentUsedBooks}%</Text>
        </View>
        <Text style={styles.usedBooksDescription}>
          중고책 구매로 총 {priceStatsData.savedByUsed.toLocaleString()}원을 절약했습니다
        </Text>
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
  totalSpentCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  totalSpentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  totalSpentInfo: {
    flex: 1,
  },
  totalSpentLabel: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 4,
  },
  totalSpentValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#047857',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  extremeBooks: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  extremeBookCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  extremeBookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  extremeBookLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  extremeBookTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
    minHeight: 32,
  },
  extremeBookPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  usedBooksSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  usedBooksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ChartColors.text,
    marginBottom: 8,
  },
  usedBooksProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  usedBooksPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    minWidth: 40,
  },
  usedBooksDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
