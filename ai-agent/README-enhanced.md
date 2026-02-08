# Enhanced AI Chatbot for TODO Application

This enhanced AI agent integrates with the TODO application backend through an MCP (Model Context Protocol) server to provide natural language task management capabilities. It also supports ChatKit integration for frontend applications.

## Architecture

The system provides two integration approaches:

### ChatKit Backend Approach
1. **Frontend** - ChatKit UI in the web application
2. **Backend** - FastAPI server with ChatKit endpoints
3. **AI Agent** - Processes requests using Agents SDK
4. **TODO Backend** - The existing task management system

### MCP (Model Context Protocol) Approach
1. **AI Agent** - The main intelligence that processes user requests
2. **MCP Server** - A secure interface that exposes backend functionality to the AI agent
3. **TODO Backend** - The existing task management system

## Components

### ChatKit Backend (`main.py`, `chatkit/router.py`)
- FastAPI application with ChatKit-compatible endpoints
- Event routing and processing
- Agents SDK integration for AI processing
- Support for multiple LLM providers

### MCP Server (`mcp_server.py`)
- Provides secure tools for the AI agent to interact with the TODO backend
- Handles authentication and authorization
- Implements various task management operations:
  - `create_task` - Create new tasks
  - `create_task_with_details` - Create tasks with all possible details
  - `list_tasks` - List all user tasks
  - `get_task` - Get specific task details
  - `update_task` - Update task properties
  - `update_task_priority` - Update task priority
  - `mark_task_completed` - Mark tasks as completed
  - `search_tasks_by_category` - Search tasks by category
  - `delete_task` - Delete tasks

### AI Agent Integration (`ai_agent.py`)
- Implements the OpenAI Agent SDK integration
- Supports multiple providers (Google Gemini, OpenAI, etc.)
- Manages both MCP server connections and direct ChatKit integration
- Handles conversation state and context

### Configuration (`agent_config/factory.py`)
- Handles model initialization for different providers
- Manages API key configuration
- Supports various LLM providers (OpenAI, Gemini, Groq, OpenRouter)

## Setup

### Environment Variables

Set up the required environment variables:

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

### Running the System

#### For ChatKit Integration:
1. Ensure the TODO backend is running:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

2. Start the ChatKit backend:
```bash
cd ai-agent
python -m uvicorn main:app --reload --port 8001
```

#### For MCP Integration:
1. Ensure the TODO backend is running:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

2. Start the MCP server:
```bash
cd ai-agent
python mcp_server.py
```

## Usage Examples

The AI agent understands natural language commands like:

- "Create a task to buy groceries with high priority"
- "Show me my tasks"
- "Mark task #1 as completed"
- "Update the grocery task to be due tomorrow"
- "What are my high priority tasks?"

## Security Features

- All operations are authenticated through the existing TODO app auth system
- MCP server validates all requests before forwarding to backend
- Rate limiting and enhanced security checks
- Audit logging for all operations
- API keys kept server-side, never exposed to frontend

## Development

To extend functionality:
1. Add new tools to `mcp_server.py` for MCP approach
2. Add new handlers to `chatkit/router.py` for ChatKit approach
3. Update agent instructions in `ai_agent.py`
4. Test the integration thoroughly

The system is designed to maintain strict separation between the AI layer and business logic backend while enabling rich natural language interactions.