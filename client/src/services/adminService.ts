import api from './api';
import { User, Order } from '../types';

export const adminService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  async updateUserRole(userId: number, role: 'customer' | 'manager' | 'admin'): Promise<User> {
    const response = await api.patch<User>(`/users/${userId}/role`, { role });
    return response.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const response = await api.get<{ data: Order[]; meta: { total: number } }>('/orders?limit=100');
    return response.data.data;
  },

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};
