import express, { Application, Request, Response } from 'express';
import request from 'supertest';

/**
 * Integration tests using a lightweight Express app that mirrors
 * the real API structure but uses in-memory data instead of a database.
 */

// In-memory data store
let products = [
  { id: 1, name: 'Laptop', price: 999.99, stock: 50, categoryId: 1, isActive: true, description: 'A laptop' },
  { id: 2, name: 'Mouse', price: 29.99, stock: 200, categoryId: 1, isActive: true, description: 'A mouse' },
  { id: 3, name: 'Keyboard', price: 79.99, stock: 5, categoryId: 1, isActive: true, description: 'A keyboard' },
];

let categories = [
  { id: 1, name: 'Electronics', description: 'Electronic devices' },
];

let nextProductId = 4;

function createTestApp(): Application {
  const app = express();
  app.use(express.json());

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Products
  app.get('/api/products', (_req: Request, res: Response) => {
    res.json(products);
  });

  app.get('/api/products/:id', (req: Request, res: Response) => {
    const product = products.find(p => p.id === Number(req.params.id));
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  });

  app.post('/api/products', (req: Request, res: Response) => {
    const { name, price, stock, categoryId, description } = req.body;
    if (!name || price === undefined) {
      res.status(400).json({ errors: [{ msg: 'Product name and price are required' }] });
      return;
    }
    const product = { id: nextProductId++, name, price, stock: stock || 0, categoryId, isActive: true, description: description || '' };
    products.push(product);
    res.status(201).json(product);
  });

  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const index = products.findIndex(p => p.id === Number(req.params.id));
    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    products.splice(index, 1);
    res.status(204).send();
  });

  // Categories
  app.get('/api/categories', (_req: Request, res: Response) => {
    res.json(categories);
  });

  // AI endpoints
  app.get('/api/ai/health', (_req: Request, res: Response) => {
    res.json({ aiService: 'unavailable' });
  });

  return app;
}

describe('API Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    // Reset data
    products = [
      { id: 1, name: 'Laptop', price: 999.99, stock: 50, categoryId: 1, isActive: true, description: 'A laptop' },
      { id: 2, name: 'Mouse', price: 29.99, stock: 200, categoryId: 1, isActive: true, description: 'A mouse' },
      { id: 3, name: 'Keyboard', price: 79.99, stock: 5, categoryId: 1, isActive: true, description: 'A keyboard' },
    ];
    nextProductId = 4;
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('price');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by id', async () => {
      const response = await request(app).get('/api/products/1');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Laptop');
      expect(response.body.price).toBe(999.99);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'Monitor',
        price: 399.99,
        stock: 30,
        categoryId: 1,
        description: 'A monitor',
      };

      const response = await request(app).post('/api/products').send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Monitor');
      expect(response.body.price).toBe(399.99);
      expect(response.body.id).toBe(4);
    });

    it('should return 400 for invalid product data', async () => {
      const response = await request(app).post('/api/products').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const response = await request(app).delete('/api/products/1');

      expect(response.status).toBe(204);

      const getResponse = await request(app).get('/api/products/1');
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent product', async () => {
      const response = await request(app).delete('/api/products/999');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app).get('/api/categories');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Electronics');
    });
  });

  describe('GET /api/ai/health', () => {
    it('should return AI service health status', async () => {
      const response = await request(app).get('/api/ai/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('aiService');
    });
  });
});
