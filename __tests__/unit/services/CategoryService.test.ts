import { CategoryService } from '../../../src/services/CategoryService';
import { CategoryRepository } from '../../../src/repositories/CategoryRepository';
import { Category } from '../../../src/models/Category';

const mockCategoryRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findWithProducts: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as unknown as jest.Mocked<CategoryRepository>;

describe('CategoryService', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    jest.clearAllMocks();
    categoryService = new CategoryService(mockCategoryRepository);
  });

  const mockCategory: Partial<Category> = {
    id: 1,
    name: 'Electronics',
    description: 'Electronic devices',
  };

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      mockCategoryRepository.findAll.mockResolvedValue([mockCategory as Category]);

      const result = await categoryService.getAllCategories();

      expect(mockCategoryRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Electronics');
    });
  });

  describe('createCategory', () => {
    it('should create and return a new category', async () => {
      const newCategory = { name: 'Clothing', description: 'Apparel' };
      mockCategoryRepository.create.mockResolvedValue({ id: 2, ...newCategory } as Category);

      const result = await categoryService.createCategory(newCategory);

      expect(mockCategoryRepository.create).toHaveBeenCalledWith(newCategory);
      expect(result.name).toBe('Clothing');
    });
  });
});
