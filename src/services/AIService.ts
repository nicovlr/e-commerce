import axios from 'axios';

import { config } from '../config';
import { DemandPrediction, StockAlert } from '../types';

export class AIService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = config.aiService.url;
  }

  async getPrediction(productId: number): Promise<DemandPrediction> {
    const response = await axios.post<DemandPrediction>(`${this.baseUrl}/predict`, {
      product_id: productId,
    });
    return response.data;
  }

  async getStockAlerts(): Promise<StockAlert[]> {
    const response = await axios.get<StockAlert[]>(`${this.baseUrl}/alerts`);
    return response.data;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
