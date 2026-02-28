import { Product } from '../models/Product';
import { ProductRepository } from '../repositories/ProductRepository';
import { ProductFilter } from '../types';

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getAllProducts(filters?: ProductFilter): Promise<Product[]> {
    if (filters && Object.keys(filters).length > 0) {
      return this.productRepository.findWithFilters(filters);
    }
    return this.productRepository.findAll();
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.productRepository.create(data);
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    return this.productRepository.update(id, data);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const product = await this.productRepository.findById(id);
    if (!product) return false;
    await this.productRepository.update(id, { isActive: false });
    return true;
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return this.productRepository.findLowStock(threshold);
  }

  async updateStock(productId: number, quantityChange: number): Promise<Product | null> {
    return this.productRepository.updateStock(productId, quantityChange);
  }
}
