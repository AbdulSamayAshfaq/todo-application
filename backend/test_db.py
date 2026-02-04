import os
from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv('DATABASE_URL')
print(f'DATABASE_URL: {DATABASE_URL[:60]}...')

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
    with engine.connect() as conn:
        result = conn.execute(text('SELECT 1'))
        print('Connection successful!')

        # Check users
        users = conn.execute(text('SELECT id, username, email FROM users')).fetchall()
        print(f'Users found: {len(users)}')
        for u in users:
            print(f'  - ID: {u[0]}, User: {u[1]}, Email: {u[2]}')
except Exception as e:
    print(f'Error: {e}')
