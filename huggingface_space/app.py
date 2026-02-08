#!/usr/bin/env python3
"""
Hugging Face Spaces - Todo App Backend (SIMPLE VERSION)
Only runs the backend API for Hugging Face Spaces deployment.
"""

import subprocess
import sys
import os


def install_requirements():
    """Install Python dependencies."""
    print("Installing dependencies...")
    
    req_file = "backend/requirements.txt"
    if os.path.exists(req_file):
        print("Installing backend dependencies...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", req_file
        ])
    
    print("Dependencies installed successfully!")


def run_backend():
    """Run the backend FastAPI server on port 8000."""
    print("Starting backend server on port 8000...")
    os.chdir("backend")
    subprocess.run([
        sys.executable, "-m", "uvicorn", "app.main:app", 
        "--host", "0.0.0.0", "--port", "8000"
    ])


def main():
    print("\n" + "="*50)
    print("🚀 Starting Todo App Backend")
    print("="*50 + "\n")
    
    # Install dependencies
    install_requirements()
    
    # Run backend
    run_backend()


if __name__ == "__main__":
    main()
