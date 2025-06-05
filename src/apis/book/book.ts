import axios from '../axios';
import { BookSearchResponse, HomeDiscoverBooksResponse } from './types';

/**
 * 홈화면용 인기 도서 조회
 */
export const getPopularBooksForHome = async (limit: number = 4): Promise<BookSearchResponse> => {
  console.log('[API REQUEST] getPopularBooksForHome:', { limit });

  const response = await axios.get<BookSearchResponse>('/book/popular/home', {
    params: { limit },
  });

  console.log('[API RESPONSE] getPopularBooksForHome:', response.data);
  return response.data;
};

/**
 * 홈화면용 오늘의 발견 도서 조회
 */
export const getDiscoverBooksForHome = async (
  limit: number = 4
): Promise<HomeDiscoverBooksResponse> => {
  console.log('[API REQUEST] getDiscoverBooksForHome:', { limit });

  const response = await axios.get<HomeDiscoverBooksResponse>('/book/discover/home', {
    params: { limit },
  });

  console.log('[API RESPONSE] getDiscoverBooksForHome:', response.data);
  return response.data;
};
