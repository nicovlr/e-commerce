from app.db.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.product import Product, Category
from app.core.security import get_password_hash

# Créer les tables
print("Création des tables...")
Base.metadata.create_all(bind=engine)

# Créer une session
db = SessionLocal()

# Vérifier si des utilisateurs existent déjà
if db.query(User).count() == 0:
    print("Création des utilisateurs...")
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("admin"),
        is_admin=True
    )
    
    user = User(
        username="user",
        email="user@example.com",
        hashed_password=get_password_hash("user"),
        is_admin=False
    )
    
    db.add(admin)
    db.add(user)
    db.commit()
    print("Utilisateurs créés avec succès")

# Vérifier si des catégories existent déjà
if db.query(Category).count() == 0:
    print("Création des catégories...")
    categories = [
        Category(name="T-shirts", description="T-shirts et hauts"),
        Category(name="Pantalons", description="Pantalons et jeans"),
        Category(name="Robes", description="Robes pour femme"),
        Category(name="Vestes", description="Vestes et manteaux")
    ]
    
    db.add_all(categories)
    db.commit()
    print("Catégories créées avec succès")

# Vérifier si des produits existent déjà
if db.query(Product).count() == 0:
    print("Création des produits...")
    
    # Récupérer les catégories
    t_shirts = db.query(Category).filter(Category.name == "T-shirts").first()
    pantalons = db.query(Category).filter(Category.name == "Pantalons").first()
    robes = db.query(Category).filter(Category.name == "Robes").first()
    vestes = db.query(Category).filter(Category.name == "Vestes").first()
    
    products = [
        Product(
            name="T-shirt Premium",
            description="T-shirt en coton bio de haute qualité",
            price=29.99,
            category_id=t_shirts.id if t_shirts else 1,
            brand="EcoFashion",
            gender="unisexe",
            material="Coton bio",
            colors=["Noir", "Blanc", "Bleu"],
            is_on_sale=False,
            is_new=True,
            image_url="https://images.unsplash.com/photo-1581655353564-df123a1eb820"
        ),
        Product(
            name="Jean Slim",
            description="Jean slim confortable et élégant",
            price=59.99,
            category_id=pantalons.id if pantalons else 2,
            brand="DenimCo",
            gender="homme",
            material="Denim",
            colors=["Bleu foncé", "Noir"],
            is_on_sale=True,
            sale_price=39.99,
            is_new=False,
            image_url="https://images.unsplash.com/photo-1542272604-787c3835535d"
        ),
        Product(
            name="Robe d'été",
            description="Robe légère parfaite pour l'été",
            price=49.99,
            category_id=robes.id if robes else 3,
            brand="Summery",
            gender="femme",
            material="Viscose",
            colors=["Rouge", "Bleu ciel", "Floral"],
            is_on_sale=True,
            sale_price=29.99,
            is_new=True,
            image_url="https://images.unsplash.com/photo-1595777457583-95e059d581b8"
        ),
        Product(
            name="Veste en cuir",
            description="Veste en cuir véritable, parfaite pour l'automne",
            price=199.99,
            category_id=vestes.id if vestes else 4,
            brand="LeatherCraft",
            gender="unisexe",
            material="Cuir",
            colors=["Noir", "Marron"],
            is_on_sale=False,
            is_new=False,
            image_url="https://images.unsplash.com/photo-1551028719-00167b16eac5"
        )
    ]
    
    db.add_all(products)
    db.commit()
    print("Produits créés avec succès")

# Fermer la session
db.close()
print("Initialisation de la base de données terminée") 