from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import shutil
import os
from typing import List

from app.core.config import settings
from app.core.dependencies import get_db, get_current_admin_user
from app.models.product import Product, Category
from app.models.user import User
from app.schemas.product import ProductCreate, Product as ProductSchema, CategoryCreate, Category as CategorySchema

router = APIRouter()

# Routes pour les catégories
@router.post("/categories/", response_model=CategorySchema)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/categories/", response_model=List[CategorySchema])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = db.query(Category).offset(skip).limit(limit).all()
    return categories

# Routes pour les produits
@router.post("/products/", response_model=ProductSchema)
def create_product(
    product: ProductCreate,
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    if image:
        # Sauvegarder l'image
        file_path = os.path.join(settings.UPLOAD_DIR, image.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/static/uploads/{image.filename}"
    else:
        image_url = None

    db_product = Product(
        **product.dict(),
        image_url=image_url
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products/", response_model=List[ProductSchema])
def read_products(
    skip: int = 0,
    limit: int = 100,
    category_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    products = query.offset(skip).limit(limit).all()
    return products

@router.get("/products/{product_id}", response_model=ProductSchema)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/products/{product_id}", response_model=ProductSchema)
def update_product(
    product_id: int,
    product: ProductCreate,
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if image:
        # Sauvegarder la nouvelle image
        file_path = os.path.join(settings.UPLOAD_DIR, image.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/static/uploads/{image.filename}"
    else:
        image_url = db_product.image_url

    for key, value in product.dict().items():
        setattr(db_product, key, value)
    db_product.image_url = image_url
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"} 