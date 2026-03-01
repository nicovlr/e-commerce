import axios, { AxiosInstance } from 'axios';

import { config } from '../config';
import { DemandPrediction, StockAlert } from '../types';

export class AIService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.aiService.url,
      timeout: 5000,
    });
  }

  async getPrediction(productId: number): Promise<DemandPrediction> {
    const response = await this.client.post<DemandPrediction>('/predict', {
      product_id: productId,
    });
    return response.data;
  }

  async getStockAlerts(): Promise<StockAlert[]> {
    const response = await this.client.get<StockAlert[]>('/alerts');
    return response.data;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
