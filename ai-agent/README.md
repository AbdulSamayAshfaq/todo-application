# AI Task Management Agent

This service provides AI-powered task management capabilities for the Todo application. It integrates with OpenAI to process natural language requests and maps them to task management operations.

## Features

- Natural language processing for task management
- Integration with OpenAI ChatKit
- Support for creating, listing, updating, and deleting tasks
- Authentication using JWT tokens
- Model Context Protocol (MCP) for AI communication

## Requirements

- Python 3.11+
- OpenAI API key
- Running backend service

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export OPENAI_API_KEY="your-openai-api-key"
export BACKEND_URL="http://localhost:8000"
export JWT_SECRET_KEY="your-jwt-secret-key"
```

3. Run the service:
```bash
python ai_agent.py
```

## API Endpoints

- `GET /` - Service status
- `POST /chat` - Chat endpoint for AI interactions
- `GET /health` - Health check

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key for AI processing
- `BACKEND_URL` - URL of the backend service
- `JWT_SECRET_KEY` - Secret key for JWT token validation

## Docker

To run with Docker:

```bash
docker build -t ai-agent .
docker run -p 8001:8001 -e OPENAI_API_KEY="your-key" ai-agent
```

Or with docker-compose:

```bash
docker-compose up ai-agent
```