import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app import models, utils

DATABASE_URL = os.getenv('DATABASE_URL')
print(f'DATABASE_URL: {DATABASE_URL[:60]}...')

engine = create_engine(DATABASE_URL)
db = Session(engine)

admin = db.query(models.User).filter(models.User.username == 'admin').first()
if admin:
    print(f'User found: {admin.username}')
    print(f'Hash: {admin.hashed_password[:60]}...')
    
    # Test password
    result = utils.verify_password('admin', admin.hashed_password)
    print(f'Password "admin" matches: {result}')
    
    # Test with a new hash
    new_hash = utils.get_password_hash('admin')
    print(f'New hash: {new_hash[:60]}...')
    result2 = utils.verify_password('admin', new_hash)
    print(f'New hash matches: {result2}')
else:
    print('Admin user not found!')

db.close()
