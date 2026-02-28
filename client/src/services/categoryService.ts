import api from './api';
import { Category } from '../types';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    const response = await api.post<Category>('/categories', category);
    return response.data;
  },

  async update(id: number, category: Partial<Category>): Promise<Category> {
    const response = await api.put<Category>(`/categories/${id}`, category);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
