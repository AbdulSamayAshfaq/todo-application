from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import auth, tasks, notes, models, utils
from .database import engine, Base, SessionLocal

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
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
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