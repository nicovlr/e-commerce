import { Injectable } from '@angular/core';
import { Product } from '../models/product.interface';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private products: Product[] = [
    {
      id: 1,
      name: 'T-shirt Premium Coton Bio',
      description: 'T-shirt en coton bio de haute qualité, coupe regular fit. Parfait pour un style décontracté et éco-responsable.',
      price: 29.99,
      imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820',
      category: 'T-shirts',
      brand: 'EcoStyle',
      gender: 'unisexe',
      category_id: 1,
      material: '100% coton bio',
      colors: ['Blanc', 'Noir', 'Gris chiné'],
      sizes: [
        { name: 'S', stock: 15 },
        { name: 'M', stock: 20 },
        { name: 'L', stock: 18 },
        { name: 'XL', stock: 12 }
      ],
      isNew: false,
      isOnSale: false,
      createdAt: '2023-01-15',
      updatedAt: '2023-01-15'
    },
    {
      id: 2,
      name: 'Veste Jean Vintage',
      description: 'Veste en jean au style vintage, légèrement délavée. Coupe classique et confortable.',
      price: 89.99,
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5',
      category: 'Vestes',
      brand: 'DenimCo',
      gender: 'unisexe',
      category_id: 4,
      material: '98% coton, 2% élasthanne',
      colors: ['Bleu délavé', 'Bleu foncé'],
      sizes: [
        { name: 'S', stock: 8 },
        { name: 'M', stock: 12 },
        { name: 'L', stock: 10 },
        { name: 'XL', stock: 6 }
      ],
      isNew: false,
      isOnSale: true,
      salePrice: 69.99,
      createdAt: '2022-09-10',
      updatedAt: '2022-09-10'
    },
    {
      id: 3,
      name: 'Robe d\'Été Fleurie',
      description: 'Robe légère aux motifs floraux, parfaite pour l\'été. Tissu fluide et agréable.',
      price: 59.99,
      imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
      category: 'Robes',
      brand: 'FloralChic',
      gender: 'femme',
      category_id: 3,
      material: '100% viscose',
      colors: ['Bleu ciel/Floral', 'Rose/Floral'],
      sizes: [
        { name: 'XS', stock: 10 },
        { name: 'S', stock: 15 },
        { name: 'M', stock: 18 },
        { name: 'L', stock: 12 }
      ],
      isNew: true,
      isOnSale: false,
      createdAt: '2023-02-01',
      updatedAt: '2023-02-01'
    },
    {
      id: 4,
      name: 'Pantalon Chino Slim',
      description: 'Pantalon chino coupe slim, style élégant et moderne. Parfait pour un look casual chic.',
      price: 69.99,
      imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
      category: 'Pantalons',
      brand: 'ModernFit',
      gender: 'homme',
      category_id: 2,
      material: '98% coton, 2% élasthanne',
      colors: ['Beige', 'Marine', 'Kaki'],
      sizes: [
        { name: '38', stock: 8 },
        { name: '40', stock: 15 },
        { name: '42', stock: 12 },
        { name: '44', stock: 10 }
      ],
      isNew: true,
      isOnSale: false,
      createdAt: '2022-11-20',
      updatedAt: '2023-01-10'
    },
    {
      id: 5,
      name: 'Pull en Cachemire',
      description: 'Pull doux en cachemire premium, parfait pour les journées fraîches. Élégant et confortable.',
      price: 129.99,
      imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
      category: 'Pulls',
      brand: 'LuxuryKnit',
      gender: 'unisexe',
      category_id: 5,
      material: '100% cachemire',
      colors: ['Gris', 'Bleu marine', 'Bordeaux'],
      sizes: [
        { name: 'S', stock: 6 },
        { name: 'M', stock: 8 },
        { name: 'L', stock: 10 },
        { name: 'XL', stock: 5 }
      ],
      isNew: false,
      isOnSale: true,
      salePrice: 99.99,
      createdAt: '2022-10-15',
      updatedAt: '2022-10-15'
    },
    {
      id: 6,
      name: 'Chemise Oxford',
      description: 'Chemise Oxford classique, parfaite pour un look professionnel ou casual. Coupe ajustée.',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10',
      category: 'Chemises',
      brand: 'ClassicWear',
      gender: 'homme',
      category_id: 6,
      material: '100% coton',
      colors: ['Blanc', 'Bleu ciel', 'Rose pâle'],
      sizes: [
        { name: 'S', stock: 12 },
        { name: 'M', stock: 15 },
        { name: 'L', stock: 10 },
        { name: 'XL', stock: 8 }
      ],
      isNew: true,
      isOnSale: false,
      createdAt: '2023-03-05',
      updatedAt: '2023-03-05'
    }
  ];

  public getProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  public getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => product.category === category);
  }

  public getProductsByGender(gender: 'homme' | 'femme' | 'unisexe'): Product[] {
    return this.products.filter(product => product.gender === gender);
  }

  public getNewProducts(): Product[] {
    return this.products.filter(product => product.isNew);
  }

  public getSaleProducts(): Product[] {
    return this.products.filter(product => product.isOnSale);
  }

  public searchProducts(query: string): Product[] {
    const searchTerm = query.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm)
    );
  }
} 