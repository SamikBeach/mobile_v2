import React, { Suspense } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
import { HomeBookPreview } from '@/apis/book';
import { HomeReviewPreview } from '@/apis/review';
import { LibraryListItem } from '@/apis/library';

interface HomeScreenProps {
  onBookPress?: (book: HomeBookPreview) => void;
  onReviewPress?: (review: HomeReviewPreview) => void;
  onLibraryPress?: (library: LibraryListItem) => void;
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
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <Suspense fallback={<PopularBooksSkeleton />}>
        <PopularBooksSection onBookPress={onBookPress} onMorePress={onPopularBooksMorePress} />
      </Suspense>

      <Suspense fallback={<DiscoverBooksSkeleton />}>
        <DiscoverBooksSection onBookPress={onBookPress} onMorePress={onDiscoverBooksMorePress} />
      </Suspense>

      <Suspense fallback={<PopularReviewsSkeleton />}>
        <PopularReviewsSection onReviewPress={onReviewPress} onMorePress={onReviewsMorePress} />
      </Suspense>

      <Suspense fallback={<PopularLibrariesSkeleton />}>
        <PopularLibrariesSection
          onLibraryPress={onLibraryPress}
          onMorePress={onLibrariesMorePress}
        />
      </Suspense>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 2,
  },
});
