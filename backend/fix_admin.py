import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app import models, utils

DATABASE_URL = os.getenv('DATABASE_URL')
print(f'Connecting to database...')

engine = create_engine(DATABASE_URL)
db = Session(engine)

# Find admin user
admin = db.query(models.User).filter(models.User.username == 'admin').first()
if admin:
    print(f'Found admin user: {admin.username}')
    print(f'Current hash (corrupted): {admin.hashed_password}')
    print(f'Hash length: {len(admin.hashed_password)}')

    # Generate new proper bcrypt hash
    new_hash = utils.get_password_hash('admin')
    print(f'New hash: {new_hash}')
    print(f'New hash length: {len(new_hash)}')

    # Update admin password
    admin.hashed_password = new_hash
    db.commit()
    print('Password updated successfully!')

    # Verify
    result = utils.verify_password('admin', new_hash)
    print(f'Verification: {result}')
else:
    print('Admin user not found!')

db.close()
print('\nNow login with: admin / admin')
