#!/usr/bin/env python3
"""Test script to verify the authentication and database fixes work correctly."""
import os
import sys
import hashlib
from dotenv import load_dotenv

# Add the app directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from app.database import SessionLocal, engine, Base
from app import models, utils

def test_password_functions():
    """Test the password hashing and verification functions."""
    print("Testing password functions...")

    # Test password hashing
    password = "test_password"
    hashed = utils.get_password_hash(password)
    print(f"Original password: {password}")
    print(f"Hashed password: {hashed[:30]}...")

    # Test verification
    is_valid = utils.verify_password(password, hashed)
    print(f"Verification result: {is_valid}")

    # Test with wrong password
    is_invalid = utils.verify_password("wrong_password", hashed)
    print(f"Wrong password verification: {is_invalid}")

    assert is_valid, "Password verification should work"
    assert not is_invalid, "Wrong password should not verify"
    print("✓ Password functions work correctly\n")

def test_database_connection():
    """Test database connection and table creation."""
    print("Testing database connection...")

    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        print("✓ Tables created successfully")

        # Test session
        db = SessionLocal()
        print("✓ Database session created successfully")

        # Check if admin user exists
        admin = db.query(models.User).filter(models.User.username == "admin").first()
        if admin:
            print(f"✓ Admin user found: {admin.username}")
        else:
            print("ℹ Admin user not found, will be created on first run")

        db.close()
        print("✓ Database connection test passed\n")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        raise

def test_jwt_functions():
    """Test JWT token creation and verification."""
    print("Testing JWT functions...")

    # Create a test token
    test_data = {"sub": "test_user", "role": "user"}
    token = utils.create_access_token(test_data)
    print(f"Generated token: {token[:50]}...")

    # Verify the token (this would normally be done in auth middleware)
    import jwt

    try:
        decoded = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        print(f"Decoded token: {decoded}")
        print("✓ JWT functions work correctly\n")
    except Exception as e:
        print(f"✗ JWT verification failed: {e}")
        raise

def main():
    """Run all tests."""
    print("Running backend fixes verification...\n")

    test_password_functions()
    test_database_connection()
    test_jwt_functions()

    print("🎉 All tests passed! The backend fixes are working correctly.")

if __name__ == "__main__":
    main()