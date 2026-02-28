import { Product } from '../types';

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ShopSmart",
    url: "https://shopsmart.com",
    logo: "https://shopsmart.com/logo.png",
    description: "AI-powered e-commerce platform with intelligent inventory management and demand forecasting",
    sameAs: []
  };
}

export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ShopSmart",
    url: "https://shopsmart.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://shopsmart.com/products?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}

export function getProductSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.imageUrl || undefined,
    sku: `SS-${product.id}`,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      price: Number(product.price),
      priceCurrency: "USD",
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "ShopSmart"
      }
    }
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function getProductListSchema(products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://shopsmart.com/products/${p.id}`,
      name: p.name
    }))
  };
}
