from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.sql.sqltypes import DateTime
from app.db.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    sale_price = Column(Float, nullable=True)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    is_on_sale = Column(Boolean, default=False)
    is_new = Column(Boolean, default=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="products")
    
    # Champs additionnels
    brand = Column(String)
    gender = Column(String)
    material = Column(String, nullable=True)
    colors = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    stock = Column(Integer, default=0)
    discount = Column(Float, default=0.0)  # Pourcentage de réduction 