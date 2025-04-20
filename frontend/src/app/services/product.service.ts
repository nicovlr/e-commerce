import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product } from '../models/product.interface';

// Données de démonstration pour le mode démo
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'T-shirt Premium',
    description: 'T-shirt en coton bio de haute qualité',
    price: 29.99,
    category_id: 1,
    category: 'T-shirts',
    brand: 'EcoFashion',
    gender: 'unisexe',
    material: 'Coton bio',
    colors: ['Noir', 'Blanc', 'Bleu'],
    sizes: [
      { name: 'S', stock: 10 },
      { name: 'M', stock: 15 },
      { name: 'L', stock: 8 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820',
    isOnSale: false,
    isNew: true,
    createdAt: '2023-01-15',
    updatedAt: '2023-01-15'
  },
  {
    id: 2,
    name: 'Jean Slim',
    description: 'Jean slim confortable et élégant',
    price: 59.99,
    category_id: 2,
    category: 'Pantalons',
    brand: 'DenimCo',
    gender: 'homme',
    material: 'Denim',
    colors: ['Bleu foncé', 'Noir'],
    sizes: [
      { name: '38', stock: 5 },
      { name: '40', stock: 7 },
      { name: '42', stock: 3 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
    isOnSale: true,
    salePrice: 39.99,
    isNew: false,
    createdAt: '2022-11-20',
    updatedAt: '2023-01-10'
  },
  {
    id: 3,
    name: 'Robe d\'été',
    description: 'Robe légère parfaite pour l\'été',
    price: 49.99,
    category_id: 3,
    category: 'Robes',
    brand: 'Summery',
    gender: 'femme',
    material: 'Viscose',
    colors: ['Rouge', 'Bleu ciel', 'Floral'],
    sizes: [
      { name: 'XS', stock: 3 },
      { name: 'S', stock: 8 },
      { name: 'M', stock: 10 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
    isOnSale: true,
    salePrice: 29.99,
    isNew: true,
    createdAt: '2023-02-01',
    updatedAt: '2023-02-01'
  },
  {
    id: 4,
    name: 'Veste en cuir',
    description: 'Veste en cuir véritable, parfaite pour l\'automne',
    price: 199.99,
    category_id: 4,
    category: 'Vestes',
    brand: 'LeatherCraft',
    gender: 'unisexe',
    material: 'Cuir',
    colors: ['Noir', 'Marron'],
    sizes: [
      { name: 'M', stock: 5 },
      { name: 'L', stock: 7 },
      { name: 'XL', stock: 4 }
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5',
    isOnSale: false,
    isNew: false,
    createdAt: '2022-09-10',
    updatedAt: '2022-09-10'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Mode démo pour utiliser des données simulées
  private useDemoMode = false;

  constructor(private http: HttpClient) {
    // Vérifier s'il y a une préférence stockée pour le mode démo
    const savedMode = localStorage.getItem('useDemoMode');
    if (savedMode !== null) {
      this.useDemoMode = savedMode === 'true';
    }
  }

  // Méthode pour basculer entre le mode démo et l'API réelle
  toggleDemoMode(useDemo: boolean): void {
    this.useDemoMode = useDemo;
    localStorage.setItem('useDemoMode', String(useDemo));
    console.log(`Mode démo ${useDemo ? 'activé' : 'désactivé'}`);
  }

  // Vérifier si le mode démo est activé
  isDemoMode(): boolean {
    return this.useDemoMode;
  }

  // Méthode pour normaliser les données de l'API
  private normalizeProduct(product: any): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id,
      category: typeof product.category === 'object' 
        ? product.category.name 
        : (product.category || ''),
      brand: product.brand,
      gender: product.gender,
      material: product.material,
      colors: product.colors || [],
      sizes: product.sizes || [{ name: 'Unique', stock: product.stock || 0 }],
      imageUrl: product.image_url || product.imageUrl,
      isOnSale: product.is_on_sale || product.isOnSale || false,
      salePrice: product.sale_price || product.salePrice,
      isNew: product.is_new || product.isNew || false,
      stock: product.stock || 0,
      createdAt: product.created_at || product.createdAt,
      updatedAt: product.updated_at || product.updatedAt,
    };
  }

  // Récupérer tous les produits
  getProducts(params?: { 
    category?: string, 
    gender?: string, 
    sale?: boolean, 
    new?: boolean 
  }): Observable<Product[]> {
    if (this.useDemoMode) {
      let filteredProducts = [...MOCK_PRODUCTS];

      if (params) {
        if (params.category) {
          filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === params.category?.toLowerCase());
        }
        if (params.gender) {
          filteredProducts = filteredProducts.filter(p => p.gender === params.gender);
        }
        if (params.sale) {
          filteredProducts = filteredProducts.filter(p => p.isOnSale);
        }
        if (params.new) {
          filteredProducts = filteredProducts.filter(p => p.isNew);
        }
      }
      
      return of(filteredProducts);
    }

    return this.http.get<Product[]>(`${environment.apiUrl}/products`, { params: params as any })
      .pipe(
        map(products => products.map(product => this.normalizeProduct(product))),
        catchError(error => {
          console.error('Error fetching products:', error);
          return of([...MOCK_PRODUCTS]); // Fallback to mock data
        })
      );
  }

  // Récupérer un produit par son ID
  getProductById(id: number): Observable<Product> {
    if (this.useDemoMode) {
      const product = MOCK_PRODUCTS.find(p => p.id === id);
      if (product) {
        return of(product);
      }
      // Retourner le premier produit si l'ID n'est pas trouvé (pour démo)
      return of(MOCK_PRODUCTS[0]);
    }

    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`)
      .pipe(
        map(product => this.normalizeProduct(product)),
        catchError(error => {
          console.error(`Error fetching product with id ${id}:`, error);
          // Fallback to mock data
          const mockProduct = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
          return of(mockProduct);
        })
      );
  }

  // Récupérer les produits par genre (méthode requise par l'application)
  getProductsByGender(gender: 'homme' | 'femme' | 'unisexe'): Observable<Product[]> {
    if (this.useDemoMode) {
      return of(MOCK_PRODUCTS.filter(p => p.gender === gender));
    }

    return this.getProducts({ gender }).pipe(
      catchError(error => {
        console.error(`Error fetching products by gender ${gender}:`, error);
        return of(MOCK_PRODUCTS.filter(p => p.gender === gender));
      })
    );
  }

  // Récupérer les produits par catégorie (méthode requise par l'application)
  getProductsByCategory(category: string): Observable<Product[]> {
    if (this.useDemoMode) {
      return of(MOCK_PRODUCTS.filter(p => {
        const productCategory = typeof p.category === 'string' 
          ? p.category 
          : p.category?.name || '';
        return productCategory.toLowerCase() === category.toLowerCase();
      }));
    }

    // Utiliser la catégorie comme paramètre de recherche pour l'API
    return this.http.get<Product[]>(`${environment.apiUrl}/products`, { params: { category } as any })
      .pipe(
        map(products => products.map(product => this.normalizeProduct(product))),
        catchError(error => {
          console.error(`Error fetching products by category ${category}:`, error);
          return of(MOCK_PRODUCTS.filter(p => {
            const productCategory = typeof p.category === 'string' 
              ? p.category 
              : p.category?.name || '';
            return productCategory.toLowerCase() === category.toLowerCase();
          }));
        })
      );
  }

  // Rechercher des produits par mot-clé (méthode requise par l'application)
  searchProducts(query: string): Observable<Product[]> {
    if (this.useDemoMode) {
      const lowercasedQuery = query.toLowerCase();
      return of(MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(lowercasedQuery) || 
        p.description.toLowerCase().includes(lowercasedQuery) || 
        p.brand.toLowerCase().includes(lowercasedQuery) ||
        (typeof p.category === 'string' 
          ? p.category.toLowerCase() 
          : (p.category?.name || '').toLowerCase()).includes(lowercasedQuery)
      ));
    }

    // À adapter selon le backend réel
    return this.http.get<Product[]>(`${environment.apiUrl}/products/search?q=${encodeURIComponent(query)}`)
      .pipe(
        map(products => products.map(product => this.normalizeProduct(product))),
        catchError(error => {
          console.error(`Error searching products with query ${query}:`, error);
          // Fallback to mock data
          const lowercasedQuery = query.toLowerCase();
          const filteredProducts = MOCK_PRODUCTS.filter(p => 
            p.name.toLowerCase().includes(lowercasedQuery) || 
            p.description.toLowerCase().includes(lowercasedQuery) || 
            p.brand.toLowerCase().includes(lowercasedQuery) ||
            (typeof p.category === 'string' 
              ? p.category.toLowerCase() 
              : (p.category?.name || '').toLowerCase()).includes(lowercasedQuery)
          );
          return of(filteredProducts);
        })
      );
  }

  // Récupérer les nouveaux produits
  getNewProducts(limit: number = 4): Observable<Product[]> {
    if (this.useDemoMode) {
      return of(MOCK_PRODUCTS.filter(p => p.isNew).slice(0, limit));
    }

    return this.getProducts({ new: true }).pipe(
      map(products => products.slice(0, limit))
    );
  }

  // Récupérer les produits en solde
  getSaleProducts(limit: number = 4): Observable<Product[]> {
    if (this.useDemoMode) {
      return of(MOCK_PRODUCTS.filter(p => p.isOnSale).slice(0, limit));
    }

    return this.getProducts({ sale: true }).pipe(
      map(products => products.slice(0, limit))
    );
  }

  // Ajouter un nouveau produit (admin)
  addProduct(product: Partial<Product>, image?: File): Observable<Product> {
    if (this.useDemoMode) {
      // Simuler une réponse réussie
      const newProduct: Product = {
        id: MOCK_PRODUCTS.length + 1,
        name: product.name || 'Nouveau produit',
        description: product.description || 'Description du produit',
        price: product.price || 0,
        category_id: product.category_id || 1,
        category: product.category || 'Non catégorisé',
        brand: product.brand || 'Marque',
        gender: product.gender || 'unisexe',
        material: product.material || 'Divers',
        colors: product.colors || ['Noir'],
        sizes: product.sizes || [{ name: 'M', stock: 10 }],
        imageUrl: product.imageUrl || 'https://via.placeholder.com/300',
        isOnSale: product.isOnSale || false,
        salePrice: product.salePrice,
        isNew: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return of(newProduct);
    }

    const formData = new FormData();
    
    // Ajout des données du produit
    Object.keys(product).forEach(key => {
      formData.append(key, (product as any)[key]);
    });
    
    // Ajout de l'image si fournie
    if (image) {
      formData.append('image', image);
    }
    
    return this.http.post<Product>(`${environment.apiUrl}/products`, formData);
  }

  // Mettre à jour un produit (admin)
  updateProduct(id: number, product: Partial<Product>, image?: File): Observable<Product> {
    if (this.useDemoMode) {
      // Simuler une mise à jour réussie
      const existingProduct = MOCK_PRODUCTS.find(p => p.id === id);
      if (!existingProduct) {
        return of(MOCK_PRODUCTS[0]); // Fallback pour la démo
      }
      
      const updatedProduct: Product = {
        ...existingProduct,
        ...product,
        updatedAt: new Date().toISOString()
      };
      
      return of(updatedProduct);
    }

    const formData = new FormData();
    
    // Ajout des données du produit
    Object.keys(product).forEach(key => {
      formData.append(key, (product as any)[key]);
    });
    
    // Ajout de l'image si fournie
    if (image) {
      formData.append('image', image);
    }
    
    return this.http.put<Product>(`${environment.apiUrl}/products/${id}`, formData);
  }

  // Supprimer un produit (admin)
  deleteProduct(id: number): Observable<any> {
    if (this.useDemoMode) {
      // Simuler une suppression réussie
      return of({ success: true, message: 'Produit supprimé avec succès' });
    }

    return this.http.delete(`${environment.apiUrl}/products/${id}`);
  }
}
