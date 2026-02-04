from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
import logging
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas
import os
from dotenv import load_dotenv

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    try:
        # Check if hashed_password is already bytes, if not encode it
        if isinstance(hashed_password, str):
            hashed_password_bytes = hashed_password.encode('utf-8')
        else:
            hashed_password_bytes = hashed_password

        # Check if it's a valid bcrypt hash (starts with $2b$)
        if not hashed_password.startswith('$2b$') and not hashed_password.startswith('$2a$'):
            logger.warning("Hashed password is not a valid bcrypt format")
            return False

        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password_bytes)
    except ValueError as e:
        logger.error(f"Invalid salt in password hash: {e}")
        return False
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """Hash a plain password"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    """Authenticate a user by username and password"""
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        logger.warning(f"User not found: {username}")
        return None
    
    try:
        if not verify_password(password, user.hashed_password):
            logger.warning(f"Password verification failed for user: {username}")
            return None
    except Exception as e:
        logger.error(f"Error verifying password for user {username}: {e}")
        return None
    
    logger.info(f"User authenticated successfully: {username}")
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user():
    """Dependency to get current user from token (placeholder)"""
    # This would be implemented with proper token validation
    pass


def validate_task_data(task_data: schemas.TaskCreate) -> bool:
    """Validate task data before creation"""
    if task_data.is_recurring and not task_data.recurrence_pattern:
        return False
    if task_data.status not in ["pending", "completed"]:
        return False
    if task_data.priority not in ["low", "medium", "high"]:
        return False
    return True


def reset_user_password(db: Session, username: str, new_password: str) -> bool:
    """Reset a user's password with proper hashing"""
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return False
    
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    logger.info(f"Password reset for user: {username}")
    return True
