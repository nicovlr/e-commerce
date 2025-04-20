export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
} 