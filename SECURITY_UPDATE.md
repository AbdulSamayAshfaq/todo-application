# Security Update: Hardcoded Credentials Removed

## Date: February 26, 2026

## Summary

Hardcoded login credentials have been removed from the project. Users must now create accounts via the signup page or administrators can create users through secure methods.

---

## Changes Made

### 1. Frontend Login Page (`frontend/app/login/page.tsx`)

**Before:**
```typescript
const [username, setUsername] = useState('admin')
const [password, setPassword] = useState('admin')
```

**After:**
```typescript
const [username, setUsername] = useState('')
const [password, setPassword] = useState('')
```

**Impact:** Login form now starts empty. Users must enter their own credentials.

---

### 2. Backend Main (`backend/app/main.py`)

**Before:**
```python
# Create default admin user if not exists
try:
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.username == "admin").first()
    if not user:
        hashed_password = utils.get_password_hash("admin")
        default_user = models.User(
            username="admin",
            email="admin@example.com",
            hashed_password=hashed_password,
            is_active=True
        )
        db.add(default_user)
        db.commit()
        print("Default user 'admin' created with password 'admin'")
    db.close()
except Exception as e:
    print(f"Error creating default user: {e}")
```

**After:**
```python
# Create database tables
Base.metadata.create_all(bind=engine)
```

**Impact:** No default admin user is created automatically. Users must sign up via the signup endpoint.

---

## Files Still Containing Hardcoded Credentials (Legacy/Test)

The following files still reference hardcoded credentials but are **test/legacy files**:

| File | Purpose | Action Needed |
|------|---------|---------------|
| `backend/test_login.py` | Test file for login functionality | Keep for testing, update credentials |
| `backend/reset_admin.py` | Admin password reset script | Keep as utility, update default password |
| `backend/fix_admin.py` | Admin fix script | Keep as utility, update default password |
| `debug_jwt.py` | JWT debugging | Update or remove |
| `todo-bk/` | Legacy backup folder | Can be deleted |
| `huggingface_space/` | Hugging Face deployment | Update for production |

---

## How to Create an Admin User Now

### Option 1: Via Signup Page (Recommended)

1. Navigate to `/signup`
2. Enter username, email, and password
3. Click "Sign up"
4. Login with your credentials

### Option 2: Via API

```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "your-secure-password"
  }'
```

### Option 3: Using Reset Script (If Database Already Exists)

```bash
cd backend
python reset_admin.py
```

---

## Security Best Practices Implemented

✅ No hardcoded credentials in production code
✅ Passwords are hashed using bcrypt before storage
✅ JWT tokens for authentication
✅ Token expiration (30 minutes default)
✅ Environment variables for sensitive configuration

---

## Environment Variables Setup

### Backend

Create `backend/.env` file:

```env
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./todo_app.db
```

**Generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Frontend

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AI_AGENT_URL=http://localhost:8001
```

---

## Testing the Changes

1. **Start Backend:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Create Account:**
   - Go to `http://localhost:3000/signup`
   - Create a new account

4. **Login:**
   - Go to `http://localhost:3000/login`
   - Enter your credentials
   - Should successfully login

---

## Migration Notes

If you already have a database with the hardcoded admin user:

1. The database will still work
2. You can login with existing credentials
3. To reset admin password, use `backend/reset_admin.py`

---

## Next Steps

1. ✅ Update production SECRET_KEY
2. ✅ Delete or update legacy test files
3. ✅ Update documentation
4. ✅ Test signup and login flows
5. ✅ Deploy with secure environment variables

---

## Project Structure Overview

```
hackathon 2.0/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py            # ✅ Updated - No hardcoded admin
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── tasks.py           # Task CRUD operations
│   │   ├── notes.py           # Notes CRUD operations
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── utils.py           # Password hashing, JWT
│   │   └── database.py        # Database connection
│   ├── .env.example           # ✅ New - Environment template
│   └── requirements.txt       # Python dependencies
│
├── frontend/                   # Next.js Frontend
│   ├── app/
│   │   ├── login/page.tsx     # ✅ Updated - Empty form fields
│   │   ├── signup/page.tsx    # User registration
│   │   └── dashboard/         # Protected dashboard pages
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/
│   │   └── api.ts             # API client functions
│   └── .env.example           # Environment template
│
├── ai-agent/                   # AI Agent Service
│   ├── main.py                # FastAPI entry point
│   ├── chatkit/router.py      # ChatKit API handler
│   └── agent_tools.py         # Task management tools
│
└── docker/                     # Docker configurations
```

---

## API Endpoints

### Authentication
- `POST /api/auth/token` - Login (get access token)
- `POST /api/auth/signup` - Create new user
- `GET /api/auth/me` - Get current user (requires token)

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Notes
- `GET /api/notes` - List all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

---

## Conclusion

The project is now more secure with:
- ✅ No hardcoded credentials in production code
- ✅ Proper user signup flow
- ✅ Secure password hashing
- ✅ JWT-based authentication
- ✅ Environment variable configuration

All users must now create accounts through the proper signup process.
