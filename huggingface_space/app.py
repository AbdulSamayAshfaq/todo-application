"""
Hugging Face Spaces - AI-Powered Todo API
This is the main entry point for the FastAPI application on Hugging Face Spaces.
"""
import os
import sys

# Add the backend directory to the Python path
# CRITICAL: Handle both direct deployment and Docker deployment paths
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Also add the current directory for imports
current_dir = os.path.dirname(__file__)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import from backend - handle both import paths
try:
    from backend import auth, tasks, notes, models, utils
    from backend.database import engine, Base, SessionLocal
except ImportError:
    from app import auth, tasks, notes, models, utils
    from database import engine, Base, SessionLocal

# Create database tables
Base.metadata.create_all(bind=engine)

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

# Initialize FastAPI app
app = FastAPI(
    title="AI-Powered Todo API",
    description="API for the AI-Powered Todo Application",
    version="1.0.0",
    redirect_slashes=False
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])

@app.get("/")
def read_root():
    return {"message": "AI-Powered Todo API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
