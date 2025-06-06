import axios from '../axios';
import { BookSearchResponse, HomeDiscoverBooksResponse, BookDetails } from './types';

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

/**
 * ID로 도서 조회
 */
export const getBookById = async (id: number): Promise<BookDetails> => {
  console.log('[API REQUEST] getBookById:', { id });

  const response = await axios.get<BookDetails>(`/book/${id}`);

  console.log('[API RESPONSE] getBookById:', response.data);
  return response.data;
};

/**
 * ISBN 또는 ID로 도서 조회
 * 입력값이 숫자만으로 이루어져 있고 길이가 짧다면 ID로 간주하고,
 * 그 외의 경우에는 ISBN으로 간주함
 */
export const getBookByIsbn = async (value: string): Promise<BookDetails> => {
  console.log('[API REQUEST] getBookByIsbn:', { value });

  // 숫자만으로 이루어져 있고 길이가 짧은 경우(10자 미만) ID로 간주
  if (/^\d+$/.test(value) && value.length < 10) {
    return getBookById(parseInt(value));
  }

  // 그 외의 경우 ISBN으로 간주
  const response = await axios.get<BookDetails>(`/book/isbn/${value}`);

  console.log('[API RESPONSE] getBookByIsbn:', response.data);
  return response.data;
};
