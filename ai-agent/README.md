# AI Agent Service for TODO Application

This service provides AI-powered task management capabilities for the Todo application. It offers two integration approaches:

1. **ChatKit Backend**: Full ChatKit integration for frontend UI
2. **MCP (Model Context Protocol)**: Direct AI agent tool integration

## Features

- Natural language processing for task creation and management
- Support for multiple AI providers (OpenAI, Google Gemini, Groq, OpenRouter)
- Secure authentication with backend integration
- Flexible deployment options

## Architecture

### ChatKit Backend Approach
- `main.py` - FastAPI application with ChatKit endpoints
- `chatkit/router.py` - Event routing and handling
- `ai_agent.py` - Core AI agent implementation
- `agent_config/factory.py` - LLM provider factory

### MCP (Model Context Protocol) Approach  
- `mcp_server.py` - MCP server exposing backend tools to AI agents
- `ai_agent.py` - AI agent connected to MCP server for tool access

## Setup

### Environment Variables

```bash
# Choose your provider
export LLM_PROVIDER=openai      # or "gemini"
export OPENAI_API_KEY="your-openai-key"      # for OpenAI
export GOOGLE_API_KEY="your-google-key"      # for Gemini
export TODO_BACKEND_URL="http://localhost:8000"  # URL to the TODO application backend
```

### Installation

```bash
pip install -r requirements.txt
```

### Running the Services

#### ChatKit Backend:
```bash
python -m uvicorn main:app --reload --port 8001
```

#### MCP Server (for direct AI agent integration):
```bash
python mcp_server.py
```

## Configuration

- `LLM_PROVIDER` - AI provider to use (openai, gemini, default: openai)
- `OPENAI_API_KEY` - OpenAI API key for OpenAI provider
- `GOOGLE_API_KEY` or `GEMINI_API_KEY` - API key for Google Gemini
- `TODO_BACKEND_URL` - URL of the TODO application backend
- `OPENAI_DEFAULT_MODEL` - Default model for OpenAI (default: gpt-4o)
- `GEMINI_DEFAULT_MODEL` - Default model for Gemini (default: gemini-2.5-flash)

## Docker

Build and run with Docker:

```bash
docker build -t ai-agent .
docker run -p 8001:8001 -e OPENAI_API_KEY="your-key" ai-agent
```