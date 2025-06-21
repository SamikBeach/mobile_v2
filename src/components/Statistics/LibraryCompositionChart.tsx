import React, { Suspense } from 'react';
import { View, Text, StyleSheet, Dimensions, Switch } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Globe, BookOpen, Tag } from 'lucide-react-native';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getLibraryComposition } from '../../apis/user';
import { LibraryCompositionResponse } from '../../apis/user/types';
import { useCurrentUser, useStatisticsSettings } from '../../hooks';
import { LoadingSpinner } from '../LoadingSpinner';

interface LibraryCompositionChartProps {
  userId: number;
}

const LibraryCompositionChart: React.FC<LibraryCompositionChartProps> = ({ userId }) => {
  const currentUser = useCurrentUser();
  const isMyProfile = currentUser?.id === userId;

  // 항상 useStatisticsSettings를 호출하되 isMyProfile이 아닐 때는 결과를 무시
  const statisticsHook = useStatisticsSettings(userId);
  const { settings, handleUpdateSetting } = isMyProfile
    ? statisticsHook
    : { settings: null, handleUpdateSetting: () => {} };

  const { data } = useSuspenseQuery<LibraryCompositionResponse>({
    queryKey: ['user-statistics', userId, 'library-composition'],
    queryFn: () => getLibraryComposition(userId),
  });

  // 데이터가 비공개인 경우
  if (!data.isPublic && !isMyProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>서재 구성</Text>
        </View>
        <View style={styles.privateContainer}>
          <Text style={styles.privateText}>이 통계는 비공개 설정되어 있습니다.</Text>
        </View>
      </View>
    );
  }

  // 데이터가 없는 경우
  if (data.totalLibraries === 0 || data.booksPerLibrary.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>서재 구성</Text>
            <Text style={styles.subtitle}>아직 서재가 없습니다</Text>
          </View>
          {isMyProfile && (
            <View style={styles.switchContainer}>
              <View style={styles.switchWrapper}>
                <Globe size={16} color='#64748B' />
                <Switch
                  value={settings?.isLibraryCompositionPublic || false}
                  onValueChange={value => handleUpdateSetting('isLibraryCompositionPublic', value)}
                  trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                  thumbColor={settings?.isLibraryCompositionPublic ? '#FFFFFF' : '#F8FAFC'}
                  ios_backgroundColor='#F1F5F9'
                  style={styles.switch}
                />
              </View>
            </View>
          )}
        </View>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>서재 데이터가 없습니다</Text>
        </View>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64;

  // 상위 5개 서재만 표시
  const topLibraries = data.booksPerLibrary.slice(0, 5);
  const totalBooks = topLibraries.reduce((sum, lib) => sum + lib.count, 0);
  const averageBooksPerLibrary = Math.round(totalBooks / topLibraries.length);

  // 파스텔톤 색상 팔레트
  const pastelColors = [
    '#A7F3D0', // 연한 초록
    '#BFDBFE', // 연한 파랑
    '#FBBF24', // 연한 노랑
    '#DDD6FE', // 연한 보라
    '#FECACA', // 연한 빨강
    '#FED7AA', // 연한 주황
    '#C7D2FE', // 연한 인디고
    '#A5F3FC', // 연한 시안
  ];

  // 파스텔톤 파이차트 데이터 가공
  const pieChartData = topLibraries.map((library, index) => ({
    name: library.name.length > 10 ? `${library.name.substring(0, 10)}...` : library.name,
    population: library.count,
    color: pastelColors[index % pastelColors.length],
    legendFontColor: '#374151',
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>서재 구성</Text>
          <Text style={styles.subtitle}>
            총 {data.totalLibraries}개 서재 | 평균 {averageBooksPerLibrary}권
          </Text>
        </View>
        {isMyProfile && (
          <View style={styles.switchContainer}>
            <View style={styles.switchWrapper}>
              <Globe size={16} color='#64748B' />
              <Switch
                value={settings?.isLibraryCompositionPublic || false}
                onValueChange={value => handleUpdateSetting('isLibraryCompositionPublic', value)}
                trackColor={{ false: '#F1F5F9', true: '#3B82F6' }}
                thumbColor={settings?.isLibraryCompositionPublic ? '#FFFFFF' : '#F8FAFC'}
                ios_backgroundColor='#F1F5F9'
                style={styles.switch}
              />
            </View>
          </View>
        )}
      </View>

      {/* 요약 카드 */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <BookOpen size={20} color='#3B82F6' />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>총 도서 수</Text>
            <Text style={styles.summaryValue}>{totalBooks}권</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Tag size={20} color='#10B981' />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryLabel}>활성 태그</Text>
            <Text style={styles.summaryValue}>
              {data.tagsDistribution.reduce((sum, lib) => sum + lib.tags.length, 0)}개
            </Text>
          </View>
        </View>
      </View>

      {/* 서재별 도서 수 차트 */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>서재별 도서 분포</Text>

        {topLibraries.length > 0 && (
          <View style={styles.chartContainer}>
            <PieChart
              data={pieChartData}
              width={chartWidth}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                strokeWidth: 2,
                useShadowColorFromDataset: false,
              }}
              accessor='population'
              backgroundColor='transparent'
              paddingLeft='15'
              hasLegend
              style={styles.chart}
            />
          </View>
        )}

        {/* 서재 리스트 */}
        <View style={styles.libraryList}>
          {topLibraries.map((library, index) => (
            <View key={index} style={styles.libraryItem}>
              <View
                style={[
                  styles.libraryColorIndicator,
                  { backgroundColor: pastelColors[index % pastelColors.length] },
                ]}
              />
              <Text style={styles.libraryName} numberOfLines={1}>
                {library.name}
              </Text>
              <Text style={styles.libraryCount}>{library.count}권</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 인기 태그 섹션 */}
      {data.tagsDistribution.length > 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>인기 태그</Text>

          <View style={styles.tagsList}>
            {data.tagsDistribution.slice(0, 3).map((libraryTags, index) => (
              <View key={index} style={styles.libraryTagsContainer}>
                <Text style={styles.libraryTagsTitle} numberOfLines={1}>
                  {libraryTags.library}
                </Text>
                <View style={styles.tagsGrid}>
                  {libraryTags.tags.slice(0, 3).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tagItem}>
                      <Text style={styles.tagText}>{tag.tag}</Text>
                      <Text style={styles.tagCount}>{tag.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const LibraryCompositionChartWrapper: React.FC<LibraryCompositionChartProps> = props => (
  <Suspense fallback={<LoadingSpinner />}>
    <LibraryCompositionChart {...props} />
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
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
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  chartSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chart: {
    borderRadius: 16,
  },
  libraryList: {
    gap: 8,
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  libraryColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  libraryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  libraryCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tagsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tagsList: {
    gap: 16,
  },
  libraryTagsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  libraryTagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  tagCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
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
    height: 160,
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LibraryCompositionChartWrapper;
