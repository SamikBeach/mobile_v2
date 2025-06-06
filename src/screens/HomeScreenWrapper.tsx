import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { HomeBookPreview, HomeReviewPreview, HomeLibraryPreview } from '../apis';
import { RootStackParamList } from '../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export const HomeScreenWrapper: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleBookPress = (book: HomeBookPreview) => {
    navigation.navigate('BookDetail', { isbn: book.isbn, title: book.title });
  };

  const handleReviewPress = (review: HomeReviewPreview) => {
    // TODO: 리뷰 상세 화면으로 네비게이션
    console.log('Review pressed:', review);
  };

  const handleLibraryPress = (library: HomeLibraryPreview) => {
    // TODO: 서재 상세 화면으로 네비게이션
    console.log('Library pressed:', library);
  };

  const handlePopularBooksMorePress = () => {
    // TODO: 인기 책 전체 목록 화면으로 네비게이션
    console.log('Popular books more pressed');
  };

  const handleDiscoverBooksMorePress = () => {
    // TODO: 발견 책 전체 목록 화면으로 네비게이션
    console.log('Discover books more pressed');
  };

  const handleReviewsMorePress = () => {
    // TODO: 리뷰 전체 목록 화면으로 네비게이션
    console.log('Reviews more pressed');
  };

  const handleLibrariesMorePress = () => {
    // TODO: 서재 전체 목록 화면으로 네비게이션
    console.log('Libraries more pressed');
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
