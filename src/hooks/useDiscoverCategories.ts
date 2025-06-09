import { useQuery } from '@tanstack/react-query';
import { getAllDiscoverCategories } from '../apis/discover-category';
import { DiscoverCategory } from '../apis/discover-category/types';

interface UseDiscoverCategoriesOptions {
  includeInactive?: boolean;
}

export function useDiscoverCategories(options: UseDiscoverCategoriesOptions = {}) {
  const { includeInactive = false } = options;

  const {
    data: categories = [],
    error,
    isLoading,
  } = useQuery<DiscoverCategory[]>({
    queryKey: ['discover-categories', includeInactive],
    queryFn: getAllDiscoverCategories,
    staleTime: 1000 * 60 * 5, // 5분 동안 캐시
  });

  // 필터링된 카테고리 반환 (isActive가 true인 것만)
  const filteredCategories = includeInactive
    ? categories
    : categories.filter(category => category.isActive);

  // PopularScreen의 useCategories()와 동일하게 "전체" 카테고리를 추가하여 반환
  const categoriesWithAll: DiscoverCategory[] = [
    {
      id: 0,
      name: '전체',
      subCategories: [],
      isActive: true,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    ...filteredCategories,
  ];

  return {
    categories: categoriesWithAll,
    error,
    isLoading,
  };
}
