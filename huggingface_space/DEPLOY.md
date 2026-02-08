# Hugging Face Spaces Deployment Guide (SIMPLE)

## Deployment Steps

### 1. Install Hugging Face CLI

**Windows (PowerShell - Run as Administrator):**
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://hf.co/cli/install.ps1 | iex"
```

**Linux/macOS:**
```bash
curl -sSL https://hf.co/cli/install.sh | bash
```

### 2. Login to Hugging Face
```bash
hf login
```

### 3. Clone Your Space
```bash
git clone https://huggingface.co/spaces/Abdulsamay/todo-bk
cd todo-bk
```

### 4. Copy Files to Your Space

Copy these files/folders to your cloned space:
- `backend/` folder
- `huggingface_space/app.py`
- `huggingface_space/Dockerfile`
- `huggingface_space/README.md`

### 5. Deploy to Hugging Face
```bash
git add .
git commit -m "Update for Hugging Face"
git push
```

## What This Deployment Includes

✅ **Backend API** - FastAPI server running on port 8000
✅ **SQLite Database** - Auto-created local database file
✅ **Authentication** - JWT-based user login/register
✅ **Tasks CRUD** - Create, read, update, delete tasks
✅ **Notes CRUD** - Create, read, update, delete notes

❌ **AI Chatbot** - Not included (requires Redis and more resources)

## Access Your App

After deployment, your API will be available at:
- **API URL**: https://abdulsamay-todo-bk.hf.space
- **Health Check**: https://abdulsamay-todo-bk.hf.space/health

## Test the API

```bash
# Check health
curl https://abdulsamay-todo-bk.hf.space/health

# Register a user
curl -X POST https://abdulsamay-todo-bk.hf.space/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123"}'

# Login
curl -X POST https://abdulsamay-todo-bk.hf.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

## Important Notes

1. **SQLite Database** - Data is stored in a local file (`todo_app.db`). Note: Hugging Face Spaces have ephemeral storage, so data may be lost when the Space restarts.

2. **No AI Chatbot** - The AI chatbot is not included in this deployment because it requires Redis which isn't available on free-tier Spaces.

3. **JWT Secret** - Optionally set `JWT_SECRET_KEY` in Space secrets for better security.
