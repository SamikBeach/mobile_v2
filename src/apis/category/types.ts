export interface Category {
  id: number;
  name: string;
  description?: string;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  description?: string;
  category: Category;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
}

export interface CreateSubCategoryDto {
  name: string;
  description?: string;
}
