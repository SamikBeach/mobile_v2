import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRecentSearchTerms, deleteAllRecentSearches, deleteRecentSearch } from '../apis/search';

/**
 * 최근 검색어 조회 훅
 */
export function useRecentSearches(limit: number = 5) {
  return useQuery({
    queryKey: ['search', 'recent', limit],
    queryFn: () => getRecentSearchTerms(limit),
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false,
  });
}

/**
 * 최근 검색어 전체 삭제 훅
 */
export function useDeleteAllRecentSearches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAllRecentSearches,
    onSuccess: () => {
      // 최근 검색어 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['search', 'recent'] });
    },
  });
}

/**
 * 최근 검색어 개별 삭제 훅
 */
export function useDeleteRecentSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRecentSearch(id),
    onSuccess: () => {
      // 최근 검색어 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['search', 'recent'] });
    },
  });
}
