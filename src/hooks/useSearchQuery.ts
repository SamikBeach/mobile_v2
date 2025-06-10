import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { searchBooks, logBookSelection } from '../apis/search';

/**
 * 도서 검색을 위한 React Query 훅 (무한 스크롤 지원)
 * @param query 검색어 (이미 debounce가 적용된 쿼리)
 * @param limit 한 페이지에 표시할 검색 결과 수
 */
export function useSearchQuery(query: string, limit: number = 5) {
  return useInfiniteQuery({
    queryKey: ['books', 'search', query, limit],
    queryFn: ({ pageParam = 1 }) => searchBooks(query, pageParam, limit),
    initialPageParam: 1,

    getNextPageParam: lastPage => {
      // 다음 페이지 번호 계산
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined; // 더 이상 페이지가 없음을 나타냄
    },
    enabled: query !== undefined && query.trim() !== '', // 검색어가 정의되어 있으면 API 호출
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터 유지
    refetchOnWindowFocus: false, // 창 포커스 시 다시 불러오지 않음
  });
}

/**
 * 책 선택 로그 저장 훅
 */
export function useLogBookSelection() {
  return useMutation({
    mutationFn: (params: {
      term: string;
      bookId: number;
      title: string;
      author: string;
      coverImage?: string;
      publisher?: string;
      description?: string;
      isbn?: string;
      isbn13?: string;
    }) => logBookSelection(params),
  });
}
