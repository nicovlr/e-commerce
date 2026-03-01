import { Router, Request, Response } from 'express';

import { config } from '../config';
import { ProductRepository } from '../repositories/ProductRepository';

export const createSitemapRoutes = (productRepository: ProductRepository): Router => {
  const router = Router();

  router.get('/sitemap.xml', async (_req: Request, res: Response) => {
    try {
      const products = await productRepository.findAll();
      const activeProducts = products.filter((p) => p.isActive);
      const now = new Date().toISOString().split('T')[0];
      const baseUrl = config.websiteUrl;

      const staticPages = [
        { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
        { loc: `${baseUrl}/products`, changefreq: 'daily', priority: '0.9' },
        { loc: `${baseUrl}/login`, changefreq: 'monthly', priority: '0.3' },
        { loc: `${baseUrl}/register`, changefreq: 'monthly', priority: '0.3' },
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (const page of staticPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${page.loc}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
      }

      for (const product of activeProducts) {
        const lastmod = product.updatedAt
          ? new Date(product.updatedAt).toISOString().split('T')[0]
          : now;
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/products/${product.id}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }

      xml += `</urlset>`;

      res.setHeader('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      res.status(500).setHeader('Content-Type', 'application/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<error>Failed to generate sitemap</error>`);
    }
  });

  return router;
};
