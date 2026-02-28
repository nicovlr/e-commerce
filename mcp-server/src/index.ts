import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Pool, PoolClient } from "pg";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "ecommerce",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Execute a parameterised query and return the rows.
 * Automatically acquires and releases a client from the pool.
 */
async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  let client: PoolClient | undefined;
  try {
    client = await pool.connect();
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client?.release();
  }
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "shopsmart-catalog",
  version: "1.0.0",
});

// ---------------------------------------------------------------------------
// Tool: search_products
// ---------------------------------------------------------------------------

server.tool(
  "search_products",
  "Search and filter products in the ShopSmart catalog. Supports full-text search on name/description, filtering by category, price range, and stock availability.",
  {
    query: z.string().optional().describe("Text to search in product name and description"),
    categoryId: z.number().optional().describe("Filter by category ID"),
    minPrice: z.number().optional().describe("Minimum price filter"),
    maxPrice: z.number().optional().describe("Maximum price filter"),
    inStock: z.boolean().optional().describe("If true, only return products with stock > 0"),
    limit: z.number().min(1).max(100).default(20).describe("Maximum number of results to return (1-100, default 20)"),
  },
  async (params) => {
    try {
      const conditions: string[] = ['p."isActive" = true'];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (params.query) {
        conditions.push(
          `(LOWER(p.name) LIKE $${paramIndex} OR LOWER(p.description) LIKE $${paramIndex})`
        );
        values.push(`%${params.query.toLowerCase()}%`);
        paramIndex++;
      }

      if (params.categoryId !== undefined) {
        conditions.push(`p."categoryId" = $${paramIndex}`);
        values.push(params.categoryId);
        paramIndex++;
      }

      if (params.minPrice !== undefined) {
        conditions.push(`p.price >= $${paramIndex}`);
        values.push(params.minPrice);
        paramIndex++;
      }

      if (params.maxPrice !== undefined) {
        conditions.push(`p.price <= $${paramIndex}`);
        values.push(params.maxPrice);
        paramIndex++;
      }

      if (params.inStock === true) {
        conditions.push(`p.stock > 0`);
      }

      const limit = params.limit ?? 20;
      values.push(limit);

      const sql = `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price::float AS price,
          p.stock,
          p."imageUrl" AS "imageUrl",
          c.name AS "categoryName"
        FROM products p
        LEFT JOIN categories c ON c.id = p."categoryId"
        WHERE ${conditions.join(" AND ")}
        ORDER BY p.name ASC
        LIMIT $${paramIndex}
      `;

      const rows = await query(sql, values);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { count: rows.length, products: rows },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text" as const, text: `Error searching products: ${message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: get_product
// ---------------------------------------------------------------------------

server.tool(
  "get_product",
  "Get full details for a specific product by its ID, including category information.",
  {
    productId: z.number().describe("The product ID to look up"),
  },
  async (params) => {
    try {
      const sql = `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price::float AS price,
          p.stock,
          p."imageUrl" AS "imageUrl",
          p."isActive" AS "isActive",
          p."createdAt" AS "createdAt",
          p."updatedAt" AS "updatedAt",
          c.id   AS "categoryId",
          c.name AS "categoryName",
          c.description AS "categoryDescription"
        FROM products p
        LEFT JOIN categories c ON c.id = p."categoryId"
        WHERE p.id = $1
      `;

      const rows = await query(sql, [params.productId]);

      if (rows.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No product found with ID ${params.productId}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(rows[0], null, 2) },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text" as const, text: `Error fetching product: ${message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: list_categories
// ---------------------------------------------------------------------------

server.tool(
  "list_categories",
  "List all product categories with their descriptions and the number of active products in each category.",
  {},
  async () => {
    try {
      const sql = `
        SELECT
          c.id,
          c.name,
          c.description,
          COUNT(p.id)::int AS "productCount"
        FROM categories c
        LEFT JOIN products p ON p."categoryId" = c.id AND p."isActive" = true
        GROUP BY c.id, c.name, c.description
        ORDER BY c.name ASC
      `;

      const rows = await query(sql);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { count: rows.length, categories: rows },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text" as const, text: `Error listing categories: ${message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: get_stock_status
// ---------------------------------------------------------------------------

server.tool(
  "get_stock_status",
  "Get stock status for products. Can filter to show only low-stock or out-of-stock items. Low stock threshold is 10 units.",
  {
    lowStockOnly: z
      .boolean()
      .default(false)
      .describe("If true, only return low-stock (<=10) and out-of-stock items"),
    limit: z
      .number()
      .min(1)
      .max(200)
      .default(50)
      .describe("Maximum number of results (1-200, default 50)"),
  },
  async (params) => {
    try {
      const lowStockOnly = params.lowStockOnly ?? false;
      const limit = params.limit ?? 50;

      const conditions: string[] = ['p."isActive" = true'];
      if (lowStockOnly) {
        conditions.push(`p.stock <= 10`);
      }

      const sql = `
        SELECT
          p.id,
          p.name,
          p.stock,
          c.name AS "categoryName",
          CASE
            WHEN p.stock = 0 THEN 'out_of_stock'
            WHEN p.stock <= 10 THEN 'low_stock'
            ELSE 'in_stock'
          END AS status
        FROM products p
        LEFT JOIN categories c ON c.id = p."categoryId"
        WHERE ${conditions.join(" AND ")}
        ORDER BY p.stock ASC
        LIMIT $1
      `;

      const rows = await query(sql, [limit]);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { count: rows.length, products: rows },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text" as const, text: `Error fetching stock status: ${message}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: get_product_recommendations
// ---------------------------------------------------------------------------

server.tool(
  "get_product_recommendations",
  "Get product recommendations similar to a given product. Finds products in the same category with a similar price point (within 50% of the original product's price).",
  {
    productId: z.number().describe("The product ID to base recommendations on"),
    limit: z
      .number()
      .min(1)
      .max(20)
      .default(5)
      .describe("Maximum number of recommendations (1-20, default 5)"),
  },
  async (params) => {
    try {
      const limit = params.limit ?? 5;

      // First, fetch the source product to get its category and price.
      const sourceRows = await query<{
        id: number;
        categoryId: number;
        price: number;
      }>(
        `SELECT id, "categoryId" AS "categoryId", price::float AS price FROM products WHERE id = $1`,
        [params.productId]
      );

      if (sourceRows.length === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No product found with ID ${params.productId}`,
            },
          ],
          isError: true,
        };
      }

      const source = sourceRows[0];
      const minPrice = source.price * 0.5;
      const maxPrice = source.price * 1.5;

      const sql = `
        SELECT
          p.id,
          p.name,
          p.description,
          p.price::float AS price,
          p.stock,
          p."imageUrl" AS "imageUrl",
          c.name AS "categoryName",
          ABS(p.price - $2) AS "priceDiff"
        FROM products p
        LEFT JOIN categories c ON c.id = p."categoryId"
        WHERE p."categoryId" = $1
          AND p.id != $3
          AND p."isActive" = true
          AND p.price BETWEEN $4 AND $5
        ORDER BY "priceDiff" ASC, p.name ASC
        LIMIT $6
      `;

      const rows = await query(sql, [
        source.categoryId,
        source.price,
        params.productId,
        minPrice,
        maxPrice,
        limit,
      ]);

      // Strip the helper column before returning.
      const cleaned = rows.map((row: Record<string, unknown>) => {
        const { priceDiff, ...rest } = row;
        return rest;
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                sourceProductId: params.productId,
                count: cleaned.length,
                recommendations: cleaned,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text" as const,
            text: `Error fetching recommendations: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Resource: catalog://summary
// ---------------------------------------------------------------------------

server.resource(
  "catalog-summary",
  "catalog://summary",
  {
    description:
      "Quick overview of the ShopSmart product catalog including total products, categories, stock status, and price range.",
  },
  async () => {
    try {
      const sql = `
        SELECT
          (SELECT COUNT(*)::int FROM products WHERE "isActive" = true)           AS "totalProducts",
          (SELECT COUNT(*)::int FROM categories)                                  AS "totalCategories",
          (SELECT COUNT(*)::int FROM products WHERE "isActive" = true AND stock > 0)  AS "inStock",
          (SELECT COUNT(*)::int FROM products WHERE "isActive" = true AND stock <= 10 AND stock > 0) AS "lowStock",
          (SELECT COUNT(*)::int FROM products WHERE "isActive" = true AND stock = 0)  AS "outOfStock",
          (SELECT MIN(price)::float FROM products WHERE "isActive" = true)        AS "minPrice",
          (SELECT MAX(price)::float FROM products WHERE "isActive" = true)        AS "maxPrice",
          (SELECT ROUND(AVG(price), 2)::float FROM products WHERE "isActive" = true) AS "avgPrice"
      `;

      const rows = await query(sql);
      const summary = rows[0] ?? {};

      return {
        contents: [
          {
            uri: "catalog://summary",
            mimeType: "application/json",
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        contents: [
          {
            uri: "catalog://summary",
            mimeType: "text/plain",
            text: `Error generating catalog summary: ${message}`,
          },
        ],
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr so it doesn't interfere with the stdio MCP transport.
  console.error("ShopSmart MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting MCP server:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});
