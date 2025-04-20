from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import auth, products
from app.db.database import Base, engine

# Créer les tables de la base de données
Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-Commerce API", version="1.0.0")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À modifier en production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montage du dossier statique pour les uploads
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Inclure les routeurs
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/api", tags=["products"])

@app.get("/")
async def root():
    return {"message": "Welcome to E-Commerce API"} 