# Complete Project Analysis

## Project Structure

```
hackathon 2.0/
├── frontend/                    # Next.js Frontend
│   ├── app/
│   │   ├── components/
│   │   │   ├── ChatKitPanel.tsx    # Chat UI with form
│   │   │   └── Chatbot.tsx
│   │   ├── page.tsx
│   │   └── dashboard/
│   ├── components/
│   │   ├── ai/                     # AI Components
│   │   │   ├── AiAssistantDrawer.tsx
│   │   │   ├── InteractionManager.tsx
│   │   │   └── ...
│   │   └── layout/
│   ├── lib/
│   │   └── api.ts                  # API functions
│   └── .env.local                   # Frontend config
│
├── ai-agent/                   # AI Agent Service
│   ├── main.py                 # FastAPI entry point
│   ├── chatkit/
│   │   └── router.py           # ChatKit API handler
│   ├── agent_tools.py          # Task tools for agent
│   ├── ai_agent.py             # AI Agent configuration
│   ├── agent_config/
│   │   └── factory.py          # LLM provider factory
│   ├── mcp_server.py           # MCP Server for tools
│   └── .env                    # AI Agent config
│
├── backend/                    # FastAPI Backend
│   └── app/
│       ├── main.py             # Backend entry
│       ├── auth.py             # Authentication
│       ├── models.py           # Database models
│       ├── tasks.py            # Task CRUD API
│       ├── notes.py            # Notes CRUD API
│       └── database.py         # Database connection
│
└── docker/                     # Docker configs
```

---

## Connection Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Frontend (Next.js)                        ││
│  │  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐ ││
│  │  │  Chat UI     │───▶│  API Layer   │───▶│  Auth Token  │ ││
│  │  │  (React)     │    │ (api.ts)     │    │ (localStorage)│ ││
│  │  └──────────────┘    └──────────────┘    └───────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                    │
│                              ▼                                    │
│              ┌────────────────────────────────┐                   │
│              │   AI Agent (Port 8001)         │                   │
│              │  ┌─────────────────────────┐   │                   │
│              │  │  OpenAI Agents SDK     │   │                   │
│              │  │  + Task Tools          │   │                   │
│              │  │  (agent_tools.py)      │   │                   │
│              │  └─────────────────────────┘   │                   │
│              └────────────────────────────────┘                   │
│                              │                                    │
│              ┌────────────────│────────────────┐               │
│              │                ▼                │               │
│              │  ┌─────────────────────────┐   │               │
│              │  │   MCP Server (Optional)  │   │               │
│              │  │   (mcp_server.py)       │   │               │
│              │  └─────────────────────────┘   │               │
│              │                                 │               │
│              └─────────────┬───────────────────┘               │
│                            │                                   │
│                            ▼                                   │
│              ┌────────────────────────────────┐               │
│              │    Backend API (Port 8000)      │               │
│              │  ┌─────────────────────────┐   │               │
│              │  │  Task CRUD Operations  │   │               │
│              │  │  (tasks.py)            │   │               │
│              │  │  Notes CRUD            │   │               │
│              │  │  Auth System          │   │               │
│              │  └─────────────────────────┘   │               │
│              └────────────────────────────────┘               │
│                            │                                   │
│                            ▼                                   │
│              ┌────────────────────────────────┐               │
│              │    Database (SQLite/Neon)       │               │
│              │    (todo_app.db)                │               │
│              └────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Frontend → AI Agent
```
POST ${CHATKIT_API_URL:-http://localhost:8001}/chatkit/api
{
  "type": "user_message",
  "message": { "content": "Show my tasks" },
  "auth_token": "..."
}
```

### AI Agent → Backend
```
GET    ${BACKEND_URL:-http://localhost:8000}/api/tasks/
POST   ${BACKEND_URL:-http://localhost:8000}/api/tasks/
PUT    ${BACKEND_URL:-http://localhost:8000}/api/tasks/{id}
DELETE ${BACKEND_URL:-http://localhost:8000}/api/tasks/{id}
```

---

## Environment Variables

### ai-agent/.env
```
OPENROUTER_API_KEY=sk-or-v1-...
LLM_PROVIDER=openrouter
OPENROUTER_DEFAULT_MODEL=z-ai/glm-4.5-air:free
BACKEND_URL=${BACKEND_URL:-http://localhost:8000}
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=${BACKEND_URL:-http://localhost:8000}/api
NEXT_PUBLIC_AI_AGENT_URL=${CHATKIT_API_URL:-http://localhost:8001}
```

---

## Data Flow for Task Creation

1. **User clicks "Create Task"** in Chat UI
2. **Form opens** with fields: Title, Description, Priority, Due Date, Category
3. **User fills form** and clicks "Create Task"
4. **Frontend sends** POST to AI Agent `/chatkit/api`
5. **AI Agent** processes the request
6. **AI Agent calls** Backend API `/api/tasks/`
7. **Backend** saves to database
8. **Response flows back** to user

---

## Running the Project

```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: AI Agent
cd ai-agent
python -m uvicorn main:app --reload --port 8001

# Terminal 3: Frontend
cd frontend
npm run dev
```

---

## Key Files

| File | Purpose |
|------|---------|
| `frontend/app/components/ChatKitPanel.tsx` | Chat UI with task form |
| `frontend/lib/api.ts` | API functions |
| `ai-agent/main.py` | FastAPI server |
| `ai-agent/chatkit/router.py` | ChatKit event handler |
| `ai-agent/agent_tools.py` | Task management tools |
| `ai-agent/mcp_server.py` | MCP server for tools |
| `backend/app/tasks.py` | Task CRUD API |

---

## Task Management Tools (MCP Server)

```
create_task(title, description, priority, due_date, category, auth_token)
list_tasks(auth_token)
get_task(task_id, auth_token)
update_task(task_id, title, description, status, priority, due_date, category, auth_token)
mark_task_completed(task_id, auth_token)
delete_task(task_id, auth_token)
search_tasks_by_category(category, auth_token)
```
