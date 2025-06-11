import { useQuery } from '@tanstack/react-query';
import { getPopularSearchTerms } from '../apis/search';

/**
 * 인기 검색어 조회 훅
 */
export function usePopularSearches(limit: number = 10) {
  return useQuery({
    queryKey: ['search', 'popular', limit],
    queryFn: () => getPopularSearchTerms(limit),
    staleTime: 1000 * 60 * 10, // 10분
    refetchOnWindowFocus: false,
  });
}
