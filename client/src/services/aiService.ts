import api from './api';
import { DemandPrediction, StockAlert } from '../types';

export const aiService = {
  async predict(productId: number): Promise<DemandPrediction> {
    const response = await api.post<DemandPrediction>('/ai/predict', {
      product_id: productId,
    });
    return response.data;
  },

  async getAlerts(): Promise<StockAlert[]> {
    const response = await api.get<StockAlert[]>('/ai/alerts');
    return response.data;
  },

  async getHealth(): Promise<{ status: string }> {
    const response = await api.get<{ status: string }>('/ai/health');
    return response.data;
  },
};
