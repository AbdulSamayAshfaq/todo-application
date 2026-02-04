---
title: Todo App Backend
emoji: 📝
colorFrom: blue
colorTo: purple
sdk: docker
sdk_version: 3.9
app_file: backend/app/main.py
pinned: false
tags:
- todo
- task-management
- fastapi
- api
---

# Todo App Backend API

FastAPI-based REST API for the AI-Powered Todo Application.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Task Management**: Create, list, update, and delete tasks
- **SQLite Database**: Built-in database for data storage

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/tasks/` | List all tasks |
| POST | `/api/tasks/` | Create new task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |

## Default User

- Username: `admin`
- Password: `admin`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET_KEY` | Secret key for JWT tokens | auto-generated |
| `DATABASE_URL` | Database connection | sqlite:///./todos.db |

## Usage

```bash
# Health check
curl https://abdulsamay-todo-bk.hf.space/health

# Register
curl -X POST https://abdulsamay-todo-bk.hf.space/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user","email":"user@test.com","password":"pass"}'

# Login
curl -X POST https://abdulsamay-todo-bk.hf.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# List tasks (with token)
curl https://abdulsamay-todo-bk.hf.space/api/tasks/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```
