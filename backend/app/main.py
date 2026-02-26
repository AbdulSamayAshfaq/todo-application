from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import auth, tasks, notes, models
from .database import engine, Base


# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="AI-Powered Todo API",
    description="API for the AI-Powered Todo Application",
    version="1.0.0",
    redirect_slashes=False  # Routes work exactly as defined
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
