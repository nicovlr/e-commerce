import api from './api';
import { Order } from '../types';

interface PaginatedOrdersResponse {
  data: Order[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const orderService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedOrdersResponse> {
    const response = await api.get<PaginatedOrdersResponse>('/orders', { params });
    return response.data;
  },

  async getById(id: number): Promise<Order> {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  async updateStatus(id: number, status: string): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
};
