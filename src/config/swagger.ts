import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopSmart E-Commerce API',
      version: '1.0.0',
      description:
        'AI-powered e-commerce platform API with demand prediction and stock management',
    },
    servers: [{ url: '/api', description: 'API server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Wireless Mouse' },
            description: { type: 'string', nullable: true, example: 'Ergonomic wireless mouse' },
            price: { type: 'number', format: 'double', example: 29.99 },
            stock: { type: 'integer', example: 150 },
            imageUrl: { type: 'string', nullable: true, example: 'https://example.com/mouse.jpg' },
            isActive: { type: 'boolean', example: true },
            categoryId: { type: 'integer', example: 1 },
            category: { $ref: '#/components/schemas/Category' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['name', 'price', 'stock', 'categoryId'],
          properties: {
            name: { type: 'string', example: 'Wireless Mouse' },
            description: { type: 'string', example: 'Ergonomic wireless mouse' },
            price: { type: 'number', format: 'double', example: 29.99 },
            stock: { type: 'integer', example: 150 },
            imageUrl: { type: 'string', example: 'https://example.com/mouse.jpg' },
            categoryId: { type: 'integer', example: 1 },
          },
        },
        UpdateProductRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Wireless Mouse Pro' },
            description: { type: 'string', example: 'Updated ergonomic wireless mouse' },
            price: { type: 'number', format: 'double', example: 34.99 },
            stock: { type: 'integer', example: 200 },
            imageUrl: { type: 'string', example: 'https://example.com/mouse-pro.jpg' },
            isActive: { type: 'boolean', example: true },
            categoryId: { type: 'integer', example: 1 },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Electronics' },
            description: { type: 'string', nullable: true, example: 'Electronic devices and accessories' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CategoryWithProducts: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Electronics' },
            description: { type: 'string', nullable: true, example: 'Electronic devices and accessories' },
            products: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Electronics' },
            description: { type: 'string', example: 'Electronic devices and accessories' },
          },
        },
        UpdateCategoryRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Electronics & Gadgets' },
            description: { type: 'string', example: 'Updated description' },
          },
        },
        User: {
          type: 'object',
          description: 'User object (password excluded)',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 6, example: 'securePassword123' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'securePassword123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              example: 'pending',
            },
            totalAmount: { type: 'number', format: 'double', example: 59.98 },
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/OrderItem' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            orderId: { type: 'integer', example: 1 },
            productId: { type: 'integer', example: 1 },
            product: { $ref: '#/components/schemas/Product' },
            quantity: { type: 'integer', example: 2 },
            unitPrice: { type: 'number', format: 'double', example: 29.99 },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'integer', minimum: 1, example: 1 },
                  quantity: { type: 'integer', minimum: 1, example: 2 },
                },
              },
            },
          },
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              example: 'processing',
            },
          },
        },
        DemandPrediction: {
          type: 'object',
          properties: {
            productId: { type: 'integer', example: 1 },
            productName: { type: 'string', example: 'Wireless Mouse' },
            currentStock: { type: 'integer', example: 150 },
            predictedDemand7d: { type: 'integer', example: 25 },
            predictedDemand14d: { type: 'integer', example: 48 },
            predictedDemand30d: { type: 'integer', example: 95 },
            restockRecommended: { type: 'boolean', example: false },
          },
        },
        StockAlert: {
          type: 'object',
          properties: {
            productId: { type: 'integer', example: 5 },
            productName: { type: 'string', example: 'USB-C Cable' },
            currentStock: { type: 'integer', example: 3 },
            predictedDemand: { type: 'integer', example: 20 },
            daysUntilStockout: { type: 'integer', example: 2 },
            severity: {
              type: 'string',
              enum: ['critical', 'warning', 'info'],
              example: 'critical',
            },
          },
        },
        PredictRequest: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: { type: 'integer', example: 1 },
          },
        },
        AIHealthResponse: {
          type: 'object',
          properties: {
            aiService: {
              type: 'string',
              enum: ['healthy', 'unavailable'],
              example: 'healthy',
            },
          },
        },
        AnalyticsSummary: {
          type: 'object',
          properties: {
            revenue: {
              type: 'array',
              items: { $ref: '#/components/schemas/RevenueDataPoint' },
            },
            topProducts: {
              type: 'array',
              items: { $ref: '#/components/schemas/TopProduct' },
            },
            orderMetrics: { $ref: '#/components/schemas/OrderMetrics' },
            customerInsights: { $ref: '#/components/schemas/CustomerInsights' },
            stockPerformance: { $ref: '#/components/schemas/StockPerformance' },
          },
        },
        RevenueDataPoint: {
          type: 'object',
          properties: {
            date: { type: 'string', example: '2026-01-15' },
            revenue: { type: 'number', format: 'double', example: 1250.5 },
            orderCount: { type: 'integer', example: 12 },
          },
        },
        TopProduct: {
          type: 'object',
          properties: {
            productId: { type: 'integer', example: 1 },
            productName: { type: 'string', example: 'Wireless Mouse' },
            totalQuantity: { type: 'integer', example: 320 },
            totalRevenue: { type: 'number', format: 'double', example: 9596.8 },
          },
        },
        OrderMetrics: {
          type: 'object',
          properties: {
            totalOrders: { type: 'integer', example: 156 },
            averageOrderValue: { type: 'number', format: 'double', example: 85.42 },
            statusBreakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'delivered' },
                  count: { type: 'integer', example: 98 },
                },
              },
            },
          },
        },
        CustomerInsights: {
          type: 'object',
          properties: {
            totalCustomers: { type: 'integer', example: 250 },
            newCustomers: { type: 'integer', example: 35 },
            returningCustomers: { type: 'integer', example: 215 },
            topCustomers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  userId: { type: 'integer', example: 42 },
                  email: { type: 'string', format: 'email', example: 'top.buyer@example.com' },
                  orderCount: { type: 'integer', example: 15 },
                  totalSpent: { type: 'number', format: 'double', example: 1523.45 },
                },
              },
            },
          },
        },
        StockPerformance: {
          type: 'object',
          properties: {
            totalProducts: { type: 'integer', example: 85 },
            lowStockProducts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'integer', example: 5 },
                  productName: { type: 'string', example: 'USB-C Cable' },
                  currentStock: { type: 'integer', example: 3 },
                  categoryName: { type: 'string', example: 'Accessories' },
                },
              },
            },
            turnoverRate: { type: 'number', format: 'double', example: 4.2 },
          },
        },
        PaginatedProducts: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' },
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 85 },
                totalPages: { type: 'integer', example: 9 },
              },
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'field' },
                  msg: { type: 'string', example: 'Product name is required' },
                  path: { type: 'string', example: 'name' },
                  location: { type: 'string', example: 'body' },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'An error occurred' },
          },
        },
        ServiceUnavailableError: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'AI service unavailable' },
            message: { type: 'string', example: 'The demand prediction service is currently offline' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
