#!/usr/bin/env python3
"""Script to create or reset the admin user"""
import os
import sys

# Add the app directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal, engine, Base
from app import models, utils

# Create tables
Base.metadata.create_all(bind=engine)

# Create or update admin user
db = SessionLocal()
try:
    # Check if admin exists
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    
    if admin:
        print(f"Admin user exists with ID: {admin.id}")
        print(f"Email: {admin.email}")
        print(f"Current password hash: {admin.hashed_password}")
        print("\nResetting admin password...")
        
        # Reset password with proper bcrypt hash
        admin.hashed_password = utils.get_password_hash("admin123")
        db.commit()
        db.refresh(admin)
        print("✓ Password reset successfully!")
        print(f"New password hash: {admin.hashed_password}")
    else:
        print("Creating new admin user...")
        hashed_password = utils.get_password_hash("admin123")
        admin = models.User(
            username="admin",
            email="admin@example.com",
            hashed_password=hashed_password,
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Admin user created successfully!")
        
    print("\n" + "="*50)
    print("LOGIN CREDENTIALS:")
    print("="*50)
    print("Username: admin")
    print("Password: admin123")
    print("="*50)
finally:
    db.close()
