export interface DiscoverCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  subCategories?: DiscoverSubCategory[];
}

export interface DiscoverSubCategory {
  id: number;
  name: string;
  description?: string;
  discoverCategoryId: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscoverCategoryDto {
  name: string;
  description?: string;
  order?: number;
}

export interface UpdateDiscoverCategoryDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export interface CreateDiscoverSubCategoryDto {
  name: string;
  description?: string;
  discoverCategoryId: number;
  order?: number;
}

export interface UpdateDiscoverSubCategoryDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}
