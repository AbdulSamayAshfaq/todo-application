# AI-Powered Todo Application

A full-stack todo application with AI integration, built with modern web technologies.

## Project Structure

```
hackathon-2.0/
├── backend/          # FastAPI backend
├── frontend/         # Next.js frontend
├── docker/           # Docker configurations
├── k8s/              # Kubernetes manifests
└── todo_app.py       # Phase I console application
```

## Features

- **Phase I**: Console-based todo application (Python)
- **Phase II**: Web application with authentication (Next.js + FastAPI)
- **Phase III**: AI chatbot integration
- **Phase IV**: Containerized deployment (Docker + Kubernetes)
- **Phase V**: Cloud deployment with advanced features

## Running the Application

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Docker (for containerized deployment)

### Frontend (Web Application)

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Backend (API Server)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
cd app
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000` (configurable via BACKEND_URL environment variable)

### Phase I Console Application

To run the Phase I console application:
```bash
python todo_app.py
```

### Docker Deployment

To run the application using Docker:

1. Build the containers:
```bash
# From the project root
docker-compose up --build
```

## Development

### Frontend Development

The frontend is built with Next.js and includes:

- Modern, responsive UI with Tailwind CSS
- Task management functionality
- AI chatbot integration
- Authentication flows

Key components are located in `frontend/app/components/`

### Backend Development

The backend is built with FastAPI and includes:

- User authentication and authorization
- Task management APIs
- Database models and schemas
- API endpoints for all functionality

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/auth/token` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/tasks` - Get all tasks for user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/{id}` - Update a task
- `DELETE /api/tasks/{id}` - Delete a task

## Environment Variables

For the frontend, create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=${BACKEND_URL:-http://localhost:8000}/api
```

For the backend, you can set environment variables for database configuration and security.

## Architecture

- **Frontend**: Next.js 14 with App Router, Tailwind CSS
- **Backend**: FastAPI with SQLAlchemy and PostgreSQL
- **Database**: PostgreSQL (with SQLite fallback)
- **Authentication**: JWT tokens
- **Deployment**: Docker containers with Kubernetes manifests
- **AI Integration**: OpenAI ChatKit and Agents SDK (Phase III+)

## Next Steps

1. Complete Phase III (AI Chatbot Integration)
2. Set up Phase IV (Local Kubernetes Deployment)
3. Deploy to cloud for Phase V (Advanced Features)

## Contributing

This project follows spec-driven development principles. All code is AI-generated following the specifications in the project documentation.