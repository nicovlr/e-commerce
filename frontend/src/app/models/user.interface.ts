export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
} 