#!/usr/bin/env python3
"""
Hugging Face Spaces - Todo App with AI Chatbot
Runs both backend API and chatbot service.
"""

import subprocess
import sys
import os
import threading
import time


def install_requirements():
    """Install Python dependencies from requirements files."""
    print("Installing dependencies...")
    
    # Install backend dependencies
    if os.path.exists("backend/requirements.txt"):
        print("Installing backend dependencies...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt", "-q"
        ])
    
    # Install AI agent dependencies
    if os.path.exists("ai-agent/requirements.txt"):
        print("Installing AI agent dependencies...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "ai-agent/requirements.txt", "-q"
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


def run_chatbot():
    """Run the AI chatbot server on port 8001."""
    print("Starting chatbot server on port 8001...")
    # Update environment variable for chatbot to point to backend
    os.environ["BACKEND_URL"] = "http://localhost:8000"
    
    os.chdir("ai-agent")
    subprocess.run([sys.executable, "ai_agent.py"])


def main():
    print("\n" + "="*50)
    print("🚀 Starting AI-Powered Todo App with Chatbot")
    print("="*50 + "\n")
    
    # Install dependencies
    install_requirements()
    
    print("\n" + "-"*50)
    print("📦 Starting Services:")
    print("-"*50)
    
    # Run backend in a separate thread
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Wait for backend to start
    print("Waiting for backend to start...")
    time.sleep(5)
    
    # Run chatbot
    run_chatbot()


if __name__ == "__main__":
    main()
