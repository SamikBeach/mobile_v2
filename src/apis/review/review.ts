import axios from '../axios';
import { HomePopularReviewsResponse } from './types';

/**
 * 홈화면용 인기 리뷰 조회
 */
export const getPopularReviewsForHome = async (
  limit: number = 4
): Promise<HomePopularReviewsResponse> => {
  const response = await axios.get<HomePopularReviewsResponse>('/review/popular/home', {
    params: { limit },
  });
  return response.data;
};
