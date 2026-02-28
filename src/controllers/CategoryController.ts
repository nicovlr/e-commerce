import { Request, Response } from 'express';

import { logger } from '../config/logger';
import { Category } from '../models/Category';
import { CategoryService } from '../services/CategoryService';

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.json(categories);
    } catch (err) {
      logger.error({ err }, 'Failed to fetch categories');
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await this.categoryService.getCategoryWithProducts(Number(req.params.id));
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json(category);
    } catch (err) {
      logger.error({ err, categoryId: req.params.id }, 'Failed to fetch category');
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  };

  create = async (
    req: Request<unknown, unknown, Partial<Category>>,
    res: Response,
  ): Promise<void> => {
    try {
      const category = await this.categoryService.createCategory(req.body);
      logger.info({ categoryId: category.id }, 'Category created');
      res.status(201).json(category);
    } catch (err) {
      logger.error({ err }, 'Failed to create category');
      res.status(500).json({ error: 'Failed to create category' });
    }
  };

  update = async (
    req: Request<{ id: string }, unknown, Partial<Category>>,
    res: Response,
  ): Promise<void> => {
    try {
      const category = await this.categoryService.updateCategory(Number(req.params.id), req.body);
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      logger.info({ categoryId: req.params.id }, 'Category updated');
      res.json(category);
    } catch (err) {
      logger.error({ err, categoryId: req.params.id }, 'Failed to update category');
      res.status(500).json({ error: 'Failed to update category' });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await this.categoryService.deleteCategory(Number(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      logger.info({ categoryId: req.params.id }, 'Category deleted');
      res.status(204).send();
    } catch (err) {
      logger.error({ err, categoryId: req.params.id }, 'Failed to delete category');
      res.status(500).json({ error: 'Failed to delete category' });
    }
  };
}
