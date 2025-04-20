from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Base de données
    DATABASE_URL: str = "sqlite:///./ecommerce.db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here"  # À changer en production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Uploads
    UPLOAD_DIR: str = "app/static/uploads"
    
    class Config:
        env_file = ".env"

settings = Settings() 