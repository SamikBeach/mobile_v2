import React, { Suspense } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  PopularBooksSection,
  PopularBooksSkeleton,
  DiscoverBooksSection,
  DiscoverBooksSkeleton,
  PopularReviewsSection,
  PopularReviewsSkeleton,
  PopularLibrariesSection,
  PopularLibrariesSkeleton,
} from './home/components';
import { HomeBookPreview, HomeReviewPreview, HomeLibraryPreview } from '../apis';
import { Header } from '../components/Header/Header';
import { useHeaderTabBarVisibility } from '../hooks/useTabBarVisibility';

interface HomeScreenProps {
  onBookPress?: (book: HomeBookPreview) => void;
  onReviewPress?: (review: HomeReviewPreview) => void;
  onLibraryPress?: (library: HomeLibraryPreview) => void;
  onPopularBooksMorePress?: () => void;
  onDiscoverBooksMorePress?: () => void;
  onReviewsMorePress?: () => void;
  onLibrariesMorePress?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onBookPress,
  onReviewPress,
  onLibraryPress,
  onPopularBooksMorePress,
  onDiscoverBooksMorePress,
  onReviewsMorePress,
  onLibrariesMorePress,
}) => {
  const { handleScroll, headerStyle, headerHeight } = useHeaderTabBarVisibility();

  const handleSearchPress = () => {
    console.log('Search pressed');
  };

  const handleSendPress = () => {
    console.log('Send pressed');
  };

  const handleNotificationPress = () => {
    console.log('Notification pressed');
  };

  const handleSettingsPress = () => {
    console.log('Settings pressed');
  };

  return (
    <View style={styles.container}>
      {/* Absolute Positioned Header */}
      <View style={[styles.headerContainer, headerStyle]}>
        <Header
          onSearchPress={handleSearchPress}
          onSendPress={handleSendPress}
          onNotificationPress={handleNotificationPress}
          onSettingsPress={handleSettingsPress}
        />
      </View>

      {/* Scrollable Content with fixed padding */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={[styles.scrollView, { paddingTop: headerHeight }]} // 고정된 paddingTop
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate='normal'
        bouncesZoom={false}
      >
        {/* Content */}
        <View style={styles.content}>
          {/* 인기 있는 책 섹션 */}
          <Suspense fallback={<PopularBooksSkeleton />}>
            <PopularBooksSection onBookPress={onBookPress} onMorePress={onPopularBooksMorePress} />
          </Suspense>

          {/* 오늘의 발견 섹션 */}
          <Suspense fallback={<DiscoverBooksSkeleton />}>
            <DiscoverBooksSection
              onBookPress={onBookPress}
              onMorePress={onDiscoverBooksMorePress}
            />
          </Suspense>

          {/* 커뮤니티 인기글 */}
          <Suspense fallback={<PopularReviewsSkeleton />}>
            <PopularReviewsSection onReviewPress={onReviewPress} onMorePress={onReviewsMorePress} />
          </Suspense>

          {/* 인기 서재 */}
          <Suspense fallback={<PopularLibrariesSkeleton />}>
            <PopularLibrariesSection
              onLibraryPress={onLibraryPress}
              onMorePress={onLibrariesMorePress}
            />
          </Suspense>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    gap: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
