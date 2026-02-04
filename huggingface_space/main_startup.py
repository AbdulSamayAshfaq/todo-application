# Simple startup script that doesn't block on database initialization
import uvicorn
import os

# Set environment variables
os.environ["DATABASE_URL"] = "sqlite:///./todos.db"

if __name__ == "__main__":
    uvicorn.run(
        "backend.app.main:app", 
        host="0.0.0.0", 
        port=8000,
        log_level="warning"
    )
