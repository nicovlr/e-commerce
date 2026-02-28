import api from './api';
import { Product, Category } from '../types';

interface PaginatedResponse {
  data: Product[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const productService = {
  async getAll(params?: { page?: number; limit?: number; search?: string; categoryId?: number }): Promise<PaginatedResponse> {
    const response = await api.get<PaginatedResponse>('/products', { params });
    return response.data;
  },

  async getById(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await api.post<Product>('/products', product);
    return response.data;
  },

  async update(id: number, product: Partial<Product>): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, product);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  async getCategoryById(id: number): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await api.post<Category>('/categories', category);
    return response.data;
  },

  async updateCategory(id: number, category: Partial<Category>): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, category);
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
