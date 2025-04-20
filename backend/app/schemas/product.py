from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: int
    brand: str
    gender: str
    material: Optional[str] = None
    colors: Optional[List[str]] = None
    is_on_sale: Optional[bool] = False
    sale_price: Optional[float] = None
    is_new: Optional[bool] = False
    stock: Optional[int] = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    image_url: Optional[str] = None
    is_active: bool = True
    category: Optional[Category] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 