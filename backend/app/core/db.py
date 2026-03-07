from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Connect using the local or remote PostgreSQL connection string
# The URL should be formatted as: postgresql+psycopg2://user:password@host:port/dbname
engine = create_engine(
    settings.DATABASE_URL, 
    pool_pre_ping=True, 
    pool_size=settings.DATABASE_POOL_SIZE, 
    max_overflow=settings.DATABASE_MAX_OVERFLOW
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
