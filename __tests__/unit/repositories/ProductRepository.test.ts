import { Repository } from 'typeorm';

import { ProductRepository } from '../../../src/repositories/ProductRepository';
import { Product } from '../../../src/models/Product';

const mockTypeOrmRepo = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
} as unknown as jest.Mocked<Repository<Product>>;

describe('ProductRepository', () => {
  let productRepository: ProductRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    productRepository = new ProductRepository(mockTypeOrmRepo);
  });

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 29.99,
    stock: 100,
    isActive: true,
  } as Product;

  describe('findAll', () => {
    it('should return all products', async () => {
      mockTypeOrmRepo.find.mockResolvedValue([mockProduct]);

      const result = await productRepository.findAll();

      expect(mockTypeOrmRepo.find).toHaveBeenCalled();
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findById', () => {
    it('should find product by id', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(mockProduct);

      const result = await productRepository.findById(1);

      expect(result).toEqual(mockProduct);
    });

    it('should return null for non-existent id', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(null);

      const result = await productRepository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a product', async () => {
      const newData = { name: 'New', price: 10, stock: 5, categoryId: 1 };
      mockTypeOrmRepo.create.mockReturnValue({ ...newData, id: 2 } as Product);
      mockTypeOrmRepo.save.mockResolvedValue({ ...newData, id: 2 } as Product);

      const result = await productRepository.create(newData);

      expect(mockTypeOrmRepo.create).toHaveBeenCalledWith(newData);
      expect(mockTypeOrmRepo.save).toHaveBeenCalled();
      expect(result.id).toBe(2);
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue({ ...mockProduct, stock: 100 } as Product);
      mockTypeOrmRepo.save.mockResolvedValue({ ...mockProduct, stock: 90 } as Product);

      const result = await productRepository.updateStock(1, -10);

      expect(result).toBeDefined();
      expect(mockTypeOrmRepo.save).toHaveBeenCalled();
    });

    it('should return null for non-existent product', async () => {
      mockTypeOrmRepo.findOneBy.mockResolvedValue(null);

      const result = await productRepository.updateStock(999, -10);

      expect(result).toBeNull();
    });
  });
});
