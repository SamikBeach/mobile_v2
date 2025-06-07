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
  const response = await axios.get<DiscoverCategory[]>('/discover-category');
  return response.data;
};

/**
 * 특정 발견하기 카테고리 조회
 */
export const getDiscoverCategoryById = async (id: number): Promise<DiscoverCategory> => {
  const response = await axios.get<DiscoverCategory>(`/discover-category/${id}`);
  return response.data;
};

/**
 * 발견하기 카테고리 생성
 */
export const createDiscoverCategory = async (
  data: CreateDiscoverCategoryDto
): Promise<DiscoverCategory> => {
  const response = await axios.post<DiscoverCategory>('/discover-category', data);
  return response.data;
};

/**
 * 발견하기 카테고리 수정
 */
export const updateDiscoverCategory = async (
  id: number,
  data: UpdateDiscoverCategoryDto
): Promise<DiscoverCategory> => {
  const response = await axios.patch<DiscoverCategory>(`/discover-category/${id}`, data);
  return response.data;
};

/**
 * 발견하기 카테고리 삭제
 */
export const deleteDiscoverCategory = async (id: number): Promise<void> => {
  await axios.delete(`/discover-category/${id}`);
};

/**
 * 특정 발견하기 카테고리의 서브카테고리 조회
 */
export const getDiscoverSubCategoriesByCategoryId = async (
  categoryId: number
): Promise<DiscoverSubCategory[]> => {
  const response = await axios.get<DiscoverSubCategory[]>(
    `/discover-category/${categoryId}/subcategories`
  );
  return response.data;
};

/**
 * 발견하기 서브카테고리 생성
 */
export const createDiscoverSubCategory = async (
  data: CreateDiscoverSubCategoryDto
): Promise<DiscoverSubCategory> => {
  const response = await axios.post<DiscoverSubCategory>('/discover-subcategory', data);
  return response.data;
};

/**
 * 발견하기 서브카테고리 수정
 */
export const updateDiscoverSubCategory = async (
  id: number,
  data: UpdateDiscoverSubCategoryDto
): Promise<DiscoverSubCategory> => {
  const response = await axios.patch<DiscoverSubCategory>(`/discover-subcategory/${id}`, data);
  return response.data;
};

/**
 * 발견하기 서브카테고리 삭제
 */
export const deleteDiscoverSubCategory = async (id: number): Promise<void> => {
  await axios.delete(`/discover-subcategory/${id}`);
};
