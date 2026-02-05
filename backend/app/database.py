import logging
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import os
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database URL - using environment variable or default to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_sqAom1cgfG5N@ep-dry-dream-adssn82d-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")

# Validate that DATABASE_URL is not None or empty
if not DATABASE_URL:
    DATABASE_URL = "postgresql://neondb_owner:npg_sqAom1cgfG5N@ep-dry-dream-adssn82d-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    logger.warning("DATABASE_URL is not set, defaulting to PostgreSQL Neon")

logger.info(f"Database URL configured: {'PostgreSQL/Neon' if 'postgresql' in DATABASE_URL.lower() or 'postgres' in DATABASE_URL.lower() else 'SQLite'}")

# Create engine with proper Neon PostgreSQL configuration
if "postgresql" in DATABASE_URL.lower() or "postgres" in DATABASE_URL.lower():
    logger.info("Configuring PostgreSQL engine for Neon")
    engine = create_engine(
        DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=3600,
        connect_args={
            "sslmode": "require",
            "connect_timeout": 10
        }
    )
    logger.info("Neon PostgreSQL engine created with pool_pre_ping=True and SSL")
else:
    logger.info("Configuring SQLite engine")
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency to get database session.
    Ensures session closes after every request.
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
        logger.debug("Database session closed")


def verify_db_connection():
    """
    Verify database connection is working.
    """
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            logger.info("Database connection verified successfully")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
