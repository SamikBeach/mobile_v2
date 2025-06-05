import axios from '../axios';
import { HomePopularLibrariesResponse } from './types';

/**
 * 홈화면용 인기 서재 조회
 */
export const getPopularLibrariesForHome = async (
  limit: number = 3
): Promise<HomePopularLibrariesResponse> => {
  console.log('[API REQUEST] getPopularLibrariesForHome:', { limit });

  const response = await axios.get<HomePopularLibrariesResponse>('/library/popular/home', {
    params: { limit },
  });

  console.log('[API RESPONSE] getPopularLibrariesForHome:', response.data);
  return response.data;
};
