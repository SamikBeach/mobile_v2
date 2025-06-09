import api from '../axios';
import {
  Category,
  CreateCategoryDto,
  CreateSubCategoryDto,
  SubCategory,
  UpdateCategoryDto,
} from './types';

/**
 * 모든 카테고리 조회
 */
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categories');
  return response.data;
};

/**
 * 카테고리 ID로 조회
 */
export const getCategoryById = async (id: number): Promise<Category> => {
  const response = await api.get<Category>(`/categories/${id}`);
  return response.data;
};

/**
 * 카테고리에 속한 서브카테고리 조회
 */
export const getSubcategoriesByCategoryId = async (categoryId: number): Promise<SubCategory[]> => {
  const response = await api.get<SubCategory[]>(`/categories/${categoryId}/subcategories`);
  return response.data;
};

/**
 * 카테고리 생성
 */
export const createCategory = async (categoryData: CreateCategoryDto): Promise<Category> => {
  const response = await api.post<Category>('/categories', categoryData);
  return response.data;
};

/**
 * 서브카테고리 생성
 */
export const createSubCategory = async (
  categoryId: number,
  subCategoryData: CreateSubCategoryDto
): Promise<SubCategory> => {
  const response = await api.post<SubCategory>('/categories/subcategory', {
    categoryId,
    ...subCategoryData,
  });
  return response.data;
};

/**
 * 카테고리 업데이트
 */
export const updateCategory = async (
  id: number,
  categoryData: UpdateCategoryDto
): Promise<Category> => {
  const response = await api.patch<Category>(`/categories/${id}`, categoryData);
  return response.data;
};

/**
 * 카테고리 삭제
 */
export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/categories/${id}`);
};
