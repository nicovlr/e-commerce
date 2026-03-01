import { ProductService } from '../../../src/services/ProductService';
import { ProductRepository } from '../../../src/repositories/ProductRepository';
import { Product } from '../../../src/models/Product';
import { PaginatedResult } from '../../../src/types';

// Mock ProductRepository
const mockProductRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findWithFilters: jest.fn(),
  findLowStock: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updateStock: jest.fn(),
} as unknown as jest.Mocked<ProductRepository>;

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    jest.clearAllMocks();
    productService = new ProductService(mockProductRepository);
  });

  const mockProduct: Partial<Product> = {
    id: 1,
    name: 'Test Product',
    description: 'A test product',
    price: 29.99,
    stock: 100,
    categoryId: 1,
    isActive: true,
  };

  const mockPaginatedResult: PaginatedResult<Product> = {
    data: [mockProduct as Product],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };

  describe('getAllProducts', () => {
    it('should return all products when no filters are provided', async () => {
      mockProductRepository.findWithFilters.mockResolvedValue(mockPaginatedResult);

      const result = await productService.getAllProducts();

      expect(mockProductRepository.findWithFilters).toHaveBeenCalledTimes(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Test Product');
    });

    it('should apply filters when provided', async () => {
      const filters = { categoryId: 1, minPrice: 10 };
      mockProductRepository.findWithFilters.mockResolvedValue(mockPaginatedResult);

      const result = await productService.getAllProducts(filters);

      expect(mockProductRepository.findWithFilters).toHaveBeenCalledWith(filters, undefined);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getProductById', () => {
    it('should return a product when found', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as Product);

      const result = await productService.getProductById(1);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Product');
    });

    it('should return null when product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      const result = await productService.getProductById(999);

      expect(result).toBeNull();
    });
  });

  describe('createProduct', () => {
    it('should create and return a new product', async () => {
      const newProductData = { name: 'New Product', price: 49.99, stock: 50, categoryId: 1 };
      mockProductRepository.create.mockResolvedValue({ id: 2, ...newProductData } as Product);

      const result = await productService.createProduct(newProductData);

      expect(mockProductRepository.create).toHaveBeenCalledWith(newProductData);
      expect(result.name).toBe('New Product');
      expect(result.id).toBe(2);
    });
  });

  describe('deleteProduct', () => {
    it('should return true when product is deleted', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct as Product);
      mockProductRepository.update.mockResolvedValue({ ...mockProduct, isActive: false } as Product);

      const result = await productService.deleteProduct(1);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductRepository.update).toHaveBeenCalledWith(1, { isActive: false });
      expect(result).toBe(true);
    });

    it('should return false when product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      const result = await productService.deleteProduct(999);

      expect(result).toBe(false);
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products below stock threshold', async () => {
      const lowStockProduct = { ...mockProduct, stock: 5 } as Product;
      mockProductRepository.findLowStock.mockResolvedValue([lowStockProduct]);

      const result = await productService.getLowStockProducts(10);

      expect(mockProductRepository.findLowStock).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
      expect(result[0].stock).toBe(5);
    });
  });
});
