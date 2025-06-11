import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { HomeScreen } from './HomeScreen';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { HomeBookPreview } from '@/apis/book';
import { HomeReviewPreview } from '@/apis/review';
import { LibraryListItem } from '@/apis/library';

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList, 'MainTabs'>,
  BottomTabNavigationProp<MainTabParamList>
>;

export const HomeScreenWrapper: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleBookPress = (book: HomeBookPreview) => {
    navigation.navigate('BookDetail', { isbn: book.isbn, title: book.title });
  };

  const handleReviewPress = (review: HomeReviewPreview) => {
    // TODO: 리뷰 상세 화면으로 네비게이션
    console.log('Review pressed:', review);
  };

  const handleLibraryPress = (library: LibraryListItem) => {
    navigation.navigate('LibraryDetail', { libraryId: library.id });
  };

  const handlePopularBooksMorePress = () => {
    navigation.navigate('Popular');
  };

  const handleDiscoverBooksMorePress = () => {
    navigation.navigate('Discover');
  };

  const handleReviewsMorePress = () => {
    navigation.navigate('Community');
  };

  const handleLibrariesMorePress = () => {
    navigation.navigate('Libraries');
  };

  return (
    <HomeScreen
      onBookPress={handleBookPress}
      onReviewPress={handleReviewPress}
      onLibraryPress={handleLibraryPress}
      onPopularBooksMorePress={handlePopularBooksMorePress}
      onDiscoverBooksMorePress={handleDiscoverBooksMorePress}
      onReviewsMorePress={handleReviewsMorePress}
      onLibrariesMorePress={handleLibrariesMorePress}
    />
  );
};
