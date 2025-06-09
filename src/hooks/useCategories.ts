import { useQuery } from '@tanstack/react-query';
import { Category, getAllCategories } from '../apis/category';

export function useCategories() {
  const { data, isLoading, error } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
    staleTime: 1000 * 60 * 15, // 15분간 fresh 상태 유지
  });

  // 'all' 카테고리를 추가하여 반환
  const categoriesWithAll: Category[] = [
    {
      id: 0,
      name: '전체',
      subCategories: [],
    },
    ...(data || []),
  ];

  return {
    categories: categoriesWithAll,
    isLoading,
    error,
  };
}
