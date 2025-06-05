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
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      <View style={styles.content}>
        {/* 인기 있는 책 섹션 */}
        <Suspense fallback={<PopularBooksSkeleton />}>
          <PopularBooksSection onBookPress={onBookPress} onMorePress={onPopularBooksMorePress} />
        </Suspense>

        {/* 오늘의 발견 섹션 */}
        <Suspense fallback={<DiscoverBooksSkeleton />}>
          <DiscoverBooksSection onBookPress={onBookPress} onMorePress={onDiscoverBooksMorePress} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    gap: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
