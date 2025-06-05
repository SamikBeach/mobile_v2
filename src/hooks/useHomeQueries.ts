import { useSuspenseQuery } from '@tanstack/react-query';
import {
  getPopularBooksForHome,
  getDiscoverBooksForHome,
  getPopularLibrariesForHome,
  getPopularReviewsForHome,
  BookSearchResponse,
  HomeDiscoverBooksResponse,
  HomePopularLibrariesResponse,
  HomePopularReviewsResponse,
} from '../apis';

/**
 * 홈 화면에 표시할 인기 도서 데이터를 가져오는 훅
 */
export function useHomePopularBooksQuery(limit: number = 4) {
  const { data, error } = useSuspenseQuery<BookSearchResponse>({
    queryKey: ['home', 'popularBooks', limit],
    queryFn: () => getPopularBooksForHome(limit),
    staleTime: 1000 * 60 * 5, // 5분 동안 캐시
  });

  return {
    books: data.books,
    error,
    totalBooks: data.total,
  };
}

/**
 * 홈 화면에 표시할 오늘의 발견 도서 데이터를 가져오는 훅
 */
export function useHomeDiscoverBooksQuery(limit: number = 4) {
  const { data, error } = useSuspenseQuery<HomeDiscoverBooksResponse>({
    queryKey: ['home', 'discoverBooks', limit],
    queryFn: () => getDiscoverBooksForHome(limit),
    staleTime: 1000 * 60 * 5,
  });

  return {
    discoverBooks: data,
    error,
  };
}

/**
 * 홈 화면에 표시할 인기 서재 데이터를 가져오는 훅
 */
export function useHomePopularLibrariesQuery(limit: number = 2) {
  const { data, error } = useSuspenseQuery<HomePopularLibrariesResponse>({
    queryKey: ['home', 'popularLibraries', limit],
    queryFn: () => getPopularLibrariesForHome(limit),
    staleTime: 1000 * 60 * 5,
  });

  return {
    libraries: data.data,
    error,
    total: data.meta.total,
  };
}

/**
 * 홈 화면에 표시할 인기 리뷰 데이터를 가져오는 훅
 */
export function useHomePopularReviewsQuery(limit: number = 2) {
  const { data, error } = useSuspenseQuery<HomePopularReviewsResponse>({
    queryKey: ['home', 'popularReviews', limit],
    queryFn: () => getPopularReviewsForHome(limit),
    staleTime: 1000 * 60 * 5,
  });

  return {
    reviews: data.reviews,
    error,
  };
}
