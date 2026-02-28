import { Product } from '../models/Product';
import { ProductRepository } from '../repositories/ProductRepository';
import { PaginatedResult, PaginationQuery, ProductFilter } from '../types';

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getAllProducts(
    filters?: ProductFilter,
    pagination?: PaginationQuery,
  ): Promise<PaginatedResult<Product>> {
    return this.productRepository.findWithFilters(filters || {}, pagination);
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
    return this.productRepository.delete(id);
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return this.productRepository.findLowStock(threshold);
  }

  async updateStock(productId: number, quantityChange: number): Promise<Product | null> {
    return this.productRepository.updateStock(productId, quantityChange);
  }
}
