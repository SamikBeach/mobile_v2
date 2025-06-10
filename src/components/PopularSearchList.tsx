import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { PopularSearch } from '../apis/search/types';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

interface PopularSearchListProps {
  popularSearches?: PopularSearch[];
  onSearchPress: (term: string) => void;
}

export function PopularSearchList({ popularSearches, onSearchPress }: PopularSearchListProps) {
  // 데이터가 없거나 로딩 중일 때
  if (!popularSearches || popularSearches.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>인기 검색어</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>인기 검색어가 없습니다.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: 8 }]}>
        <View style={styles.headerContent}>
          <TrendingUp size={16} color='#6B7280' />
          <Text style={styles.headerText}>실시간 인기 검색어</Text>
        </View>
      </View>
      <View
        style={[
          styles.grid,
          {
            paddingHorizontal: 12,
            paddingTop: 4,
          },
        ]}
      >
        {popularSearches.map((trending, index) => (
          <TouchableOpacity
            key={trending.term}
            style={[
              styles.gridItem,
              {
                width: isTablet ? '48%' : '100%',
              },
            ]}
            onPress={() => onSearchPress(trending.term)}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              <View
                style={[
                  styles.indexBadge,
                  {
                    backgroundColor: index < 3 ? '#059669' : '#E5E7EB',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.indexText,
                    {
                      color: index < 3 ? 'white' : '#374151',
                    },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text style={styles.termText} numberOfLines={1}>
                {trending.term}
              </Text>
            </View>
            <View style={styles.countContainer}>
              <Text style={styles.countText}>{trending.count.toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  indexBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 12,
    fontWeight: '500',
  },
  termText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
