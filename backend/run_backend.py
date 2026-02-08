#!/usr/bin/env python3
"""
Script to run the backend server properly
"""
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Now run the application
if __name__ == "__main__":
    import uvicorn

    # Run the app with the correct module path
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir / "app")]
    )