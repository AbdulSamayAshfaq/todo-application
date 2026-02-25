import logging
from contextlib import asynccontextmanager
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

# Database URL - default to SQLite for Hugging Face Spaces
# Use SQLite as default, PostgreSQL only if explicitly set
DATABASE_URL = os.getenv("DATABASE_URL", "")

# If DATABASE_URL is empty or not set, use SQLite
if not DATABASE_URL or DATABASE_URL.strip() == "":
    DATABASE_URL = "sqlite:///./todo_app.db"
    logger.info("Using SQLite database (local file)")
else:
    logger.info(f"Using custom database URL: {DATABASE_URL[:50]}...")

# Check if using PostgreSQL
is_postgres = "postgresql" in DATABASE_URL.lower() or "postgres" in DATABASE_URL.lower()

logger.info(f"Database URL configured: {'PostgreSQL' if is_postgres else 'SQLite'}")

# Create engine
if is_postgres:
    logger.info("Configuring PostgreSQL engine")
    # Get SSL mode from environment, default to "require" for production safety
    ssl_mode = os.getenv("DATABASE_SSL_MODE", "require")

    # For local development, allow disabling SSL
    if ssl_mode.lower() == "disable" or ssl_mode.lower() == "false":
        logger.info("SSL disabled for database connection")
        engine = create_engine(
            DATABASE_URL,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=3600
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={
                "sslmode": ssl_mode,
                "connect_timeout": 10
            }
        )
    logger.info("PostgreSQL engine created with pool_pre_ping=True")
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


async def get_db():
    """
    Async dependency to get database session.
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
