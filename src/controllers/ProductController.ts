import { Request, Response } from 'express';

import { ProductService } from '../services/ProductService';
import { ProductFilter } from '../types';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: ProductFilter = {
        categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        search: req.query.search as string | undefined,
        inStock: req.query.inStock === 'true',
      };

      const products = await this.productService.getAllProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.getProductById(Number(req.params.id));
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const product = await this.productService.updateProduct(Number(req.params.id), req.body);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await this.productService.deleteProduct(Number(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  };

  getLowStock = async (_req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.productService.getLowStockProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch low stock products' });
    }
  };
}
