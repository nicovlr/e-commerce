import api from './api';
import { Delivery } from '../types';

interface PaginatedDeliveriesResponse {
  data: Delivery[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface TrackingInfo {
  trackingNumber: string | null;
  status: string;
  carrier: string | null;
  estimatedDeliveryDate: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export const deliveryService = {
  async getAll(params?: { page?: number; limit?: number }): Promise<PaginatedDeliveriesResponse> {
    const response = await api.get<PaginatedDeliveriesResponse>('/deliveries', { params });
    return response.data;
  },

  async getMyDeliveries(params?: { page?: number; limit?: number }): Promise<PaginatedDeliveriesResponse> {
    const response = await api.get<PaginatedDeliveriesResponse>('/deliveries/my-deliveries', { params });
    return response.data;
  },

  async getByOrderId(orderId: number): Promise<Delivery> {
    const response = await api.get<Delivery>(`/deliveries/order/${orderId}`);
    return response.data;
  },

  async track(trackingNumber: string): Promise<TrackingInfo> {
    const response = await api.get<TrackingInfo>(`/deliveries/track/${trackingNumber}`);
    return response.data;
  },

  async create(data: { orderId: number; carrier?: string; estimatedDeliveryDate?: string; notes?: string }): Promise<Delivery> {
    const response = await api.post<Delivery>('/deliveries', data);
    return response.data;
  },

  async updateStatus(id: number, status: string, trackingNumber?: string): Promise<Delivery> {
    const response = await api.patch<Delivery>(`/deliveries/${id}/status`, { status, trackingNumber });
    return response.data;
  },

  async update(id: number, data: Partial<Delivery>): Promise<Delivery> {
    const response = await api.patch<Delivery>(`/deliveries/${id}`, data);
    return response.data;
  },
};
