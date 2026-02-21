import { Request, Response } from 'express';

import { CategoryService } from '../services/CategoryService';

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = await this.categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await this.categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = await this.categoryService.updateCategory(Number(req.params.id), req.body);
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json(category);
    } catch (error) {
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
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  };
}
