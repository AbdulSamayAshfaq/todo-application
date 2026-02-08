# Todo App Backend - Hugging Face Spaces

A simple FastAPI backend for the Todo application, deployed on Hugging Face Spaces.

## Features

- ✅ RESTful API with FastAPI
- ✅ SQLite database (no external setup required)
- ✅ JWT authentication
- ✅ Tasks management (CRUD)
- ✅ Notes management (CROD)
- ✅ CORS enabled for frontend integration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task by ID
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Notes
- `GET /api/notes` - List all notes
- `POST /api/notes` - Create note
- `GET /api/notes/{id}` - Get note by ID
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

## Development

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run locally
cd backend
uvicorn app.main:app --reload
```

## Deployment

See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.
