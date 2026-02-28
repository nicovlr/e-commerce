# ShopSmart MCP Server

Model Context Protocol (MCP) server that exposes the ShopSmart e-commerce product catalog to AI agents such as Claude Desktop, ChatGPT, and other MCP-compatible clients.

## What it does

The server connects directly to the ShopSmart PostgreSQL database and provides read-only access to the product catalog through a set of tools and resources. AI agents can search products, browse categories, check stock levels, and get product recommendations.

## Configuration

The server reads the same environment variables as the main backend:

| Variable      | Default     | Description              |
|---------------|-------------|--------------------------|
| `DB_HOST`     | `localhost` | PostgreSQL host          |
| `DB_PORT`     | `5432`      | PostgreSQL port          |
| `DB_USERNAME` | `postgres`  | Database username        |
| `DB_PASSWORD` | `postgres`  | Database password        |
| `DB_NAME`     | `ecommerce` | Database name            |

## Running

```bash
# From the mcp-server directory
npm install
npm run dev      # development (ts-node)
npm run build    # compile TypeScript
npm start        # production (compiled JS)

# From the project root
npm run mcp:start
```

## Connecting from Claude Desktop

Add the following to your Claude Desktop configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "shopsmart": {
      "command": "node",
      "args": ["/Users/valerino/e-commerce/mcp-server/dist/index.js"],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "5432",
        "DB_USERNAME": "postgres",
        "DB_PASSWORD": "postgres",
        "DB_NAME": "ecommerce"
      }
    }
  }
}
```

Build the project first with `cd mcp-server && npm run build` so that `dist/index.js` exists.

## Available tools

### search_products

Search and filter products in the catalog.

| Parameter    | Type    | Required | Description                           |
|-------------|---------|----------|---------------------------------------|
| `query`      | string  | no       | Text search on name and description   |
| `categoryId` | number  | no       | Filter by category ID                 |
| `minPrice`   | number  | no       | Minimum price                         |
| `maxPrice`   | number  | no       | Maximum price                         |
| `inStock`    | boolean | no       | Only return products with stock > 0   |
| `limit`      | number  | no       | Max results, 1-100 (default 20)       |

### get_product

Get full details for a single product by ID.

| Parameter   | Type   | Required | Description     |
|------------|--------|----------|-----------------|
| `productId` | number | yes      | The product ID  |

### list_categories

List all product categories with product counts. No parameters.

### get_stock_status

Get stock status for products. Useful for inventory monitoring.

| Parameter      | Type    | Required | Description                                  |
|---------------|---------|----------|----------------------------------------------|
| `lowStockOnly` | boolean | no       | Only show low-stock and out-of-stock items   |
| `limit`        | number  | no       | Max results, 1-200 (default 50)              |

### get_product_recommendations

Get products similar to a given product (same category, similar price).

| Parameter   | Type   | Required | Description                        |
|------------|--------|----------|------------------------------------|
| `productId` | number | yes      | Product ID to base recommendations on |
| `limit`     | number | no       | Max results, 1-20 (default 5)     |

## Available resources

### catalog://summary

Returns a JSON overview of the entire catalog:

- Total products and categories
- Number of products in stock, low stock, and out of stock
- Price range (min, max, average)
