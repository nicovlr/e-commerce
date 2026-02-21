import { Category } from '../models/Category';
import { CategoryRepository } from '../repositories/CategoryRepository';

export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async getCategoryById(id: number): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  async getCategoryWithProducts(id: number): Promise<Category | null> {
    return this.categoryRepository.findWithProducts(id);
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.categoryRepository.create(data);
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category | null> {
    return this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categoryRepository.delete(id);
  }
}
