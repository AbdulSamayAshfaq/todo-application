"""
Main FastAPI Application for ChatKit Backend

This file sets up the FastAPI application with the ChatKit endpoints
following the recommended pattern.
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from chatkit.router import handle_event, initialize_agent

# Global event loop reference for agent initialization
_loop = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    global _loop
    _loop = asyncio.get_event_loop()
    
    # Startup: Initialize the agent
    print("Starting up AI Agent...")
    await initialize_agent()
    print("AI Agent startup complete.")
    
    yield
    
    # Shutdown: Cleanup if needed
    print("Shutting down...")


app = FastAPI(title="ChatKit API for Todo Assistant", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - returns API info."""
    return {
        "name": "AI Todo ChatKit API",
        "version": "1.0.0",
        "endpoints": {
            "chatkit": "/chatkit/api",
            "health": "/health"
        }
    }


@app.post("/chatkit/api")
async def chatkit_api(request: Request):
    """
    Main ChatKit API endpoint that handles incoming events.

    This endpoint receives events from the ChatKit frontend and routes
    them to the appropriate handlers.
    """
    # You can plug in your own auth here (JWT/session/etc.)
    event = await request.json()
    return await handle_event(event)


@app.post("/chatkit/api/upload")
async def chatkit_upload():
    """
    ChatKit API endpoint for handling file uploads.

    Currently not implemented for this basic todo assistant.
    """
    return {"error": "File uploads are not supported in this assistant"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
