from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import auth, tasks, models, utils
from .database import engine, Base

# Create database tables (fast, non-blocking)
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AI-Powered Todo API",
    description="API for the AI-Powered Todo Application",
    version="1.0.0"
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

@app.get("/")
def read_root():
    return {"message": "AI-Powered Todo API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Create default admin user ONCE using FastAPI startup event
@app.on_event("startup")
def create_default_user():
    try:
        from .database import SessionLocal
        db = SessionLocal()
        user = db.query(models.User).filter(models.User.username == "admin").first()
        if not user:
            hashed_password = utils.get_password_hash("admin")
            default_user = models.User(
                username="admin",
                email="admin@example.com",
                hashed_password=hashed_password
            )
            db.add(default_user)
            db.commit()
            print("Default user 'admin' created with password 'admin'")
        else:
            print("Default user 'admin' already exists")
        db.close()
    except Exception as e:
        print(f"Error creating default user: {e}")
