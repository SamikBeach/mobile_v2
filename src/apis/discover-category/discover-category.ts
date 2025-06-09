import axios from '../axios';
import {
  DiscoverCategory,
  DiscoverSubCategory,
  CreateDiscoverCategoryDto,
  UpdateDiscoverCategoryDto,
  CreateDiscoverSubCategoryDto,
  UpdateDiscoverSubCategoryDto,
} from './types';

/**
 * 모든 발견하기 카테고리 조회
 */
export const getAllDiscoverCategories = async (): Promise<DiscoverCategory[]> => {
  const response = await axios.get<DiscoverCategory[]>('/discover-categories');
  return response.data;
};

/**
 * 특정 발견하기 카테고리 조회
 */
export const getDiscoverCategoryById = async (id: number): Promise<DiscoverCategory> => {
  const response = await axios.get<DiscoverCategory>(`/discover-categories/${id}`);
  return response.data;
};

/**
 * 발견하기 카테고리 생성
 */
export const createDiscoverCategory = async (
  data: CreateDiscoverCategoryDto
): Promise<DiscoverCategory> => {
  const response = await axios.post<DiscoverCategory>('/discover-categories', data);
  return response.data;
};

/**
 * 발견하기 카테고리 수정
 */
export const updateDiscoverCategory = async (
  id: number,
  data: UpdateDiscoverCategoryDto
): Promise<DiscoverCategory> => {
  const response = await axios.patch<DiscoverCategory>(`/discover-categories/${id}`, data);
  return response.data;
};

/**
 * 발견하기 카테고리 삭제
 */
export const deleteDiscoverCategory = async (id: number): Promise<void> => {
  await axios.delete(`/discover-categories/${id}`);
};

/**
 * 특정 발견하기 카테고리의 서브카테고리 조회
 */
export const getDiscoverSubCategoriesByCategoryId = async (
  categoryId: number
): Promise<DiscoverSubCategory[]> => {
  const response = await axios.get<DiscoverSubCategory[]>(
    `/discover-categories/${categoryId}/subcategories`
  );
  return response.data;
};

/**
 * 발견하기 서브카테고리 생성
 */
export const createDiscoverSubCategory = async (
  data: CreateDiscoverSubCategoryDto
): Promise<DiscoverSubCategory> => {
  const response = await axios.post<DiscoverSubCategory>(
    '/discover-categories/subcategories',
    data
  );
  return response.data;
};

/**
 * 발견하기 서브카테고리 수정
 */
export const updateDiscoverSubCategory = async (
  id: number,
  data: UpdateDiscoverSubCategoryDto
): Promise<DiscoverSubCategory> => {
  const response = await axios.patch<DiscoverSubCategory>(
    `/discover-categories/subcategories/${id}`,
    data
  );
  return response.data;
};

/**
 * 발견하기 서브카테고리 삭제
 */
export const deleteDiscoverSubCategory = async (id: number): Promise<void> => {
  await axios.delete(`/discover-categories/subcategories/${id}`);
};
