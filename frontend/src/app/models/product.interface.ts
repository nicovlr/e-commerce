export interface Size {
  name: string;  // XS, S, M, L, XL, etc.
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category?: string | { id: number; name: string; description?: string };
  brand: string;
  gender: string;
  material?: string;
  colors?: string[];
  sizes?: Size[];
  imageUrl?: string;
  image_url?: string;
  isOnSale?: boolean;
  is_on_sale?: boolean;
  salePrice?: number;
  sale_price?: number;
  isNew?: boolean;
  is_new?: boolean;
  stock?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
} 