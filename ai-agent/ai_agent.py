import os
import json
import requests
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import openai
import google.generativeai as genai

from datetime import datetime
import asyncio

# Initialize FastAPI app
app = FastAPI(title="AI Task Management Agent", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for HF Spaces
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Google AI client
google_client = None
if os.getenv("OPENAI_API_KEY"):
    try:
        genai.configure(api_key=os.getenv("OPENAI_API_KEY"))
        google_client = genai.GenerativeModel('gemini-pro')
    except Exception as e:
        print(f"Error initializing Google AI client: {e}")
        print("AI agent will work with limited functionality without Google AI integration")
        google_client = None

# Model Context Protocol (MCP) interface
class MCPInterface:
    def __init__(self):
        self.tools = {
            "create_task": self.create_task,
            "list_tasks": self.list_tasks,
            "update_task": self.update_task,
            "delete_task": self.delete_task,
        }

    async def create_task(self, task_title: str, user_id: str = None, auth_token: str = None, **kwargs):
        """MCP tool to create a task with additional parameters"""
        try:
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}" if auth_token else ""
            }

            # Build task data with all provided parameters
            task_data = {
                "title": task_title,
                "status": "pending",  # Default status
                "priority": kwargs.get("priority", "medium")  # Default priority
            }
            
            # Add optional fields if provided
            if kwargs.get("description"):
                task_data["description"] = kwargs["description"]
            
            if kwargs.get("due_date"):
                task_data["due_date"] = kwargs["due_date"]
            
            if kwargs.get("category"):
                task_data["category"] = kwargs["category"]

            response = requests.post(f"{backend_url}/api/tasks/", json=task_data, headers=headers)

            if response.status_code == 200:
                return {"status": "success", "task": response.json()}
            else:
                return {"status": "error", "message": response.text}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def list_tasks(self, user_id: str = None, auth_token: str = None):
        """MCP tool to list tasks"""
        try:
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            headers = {
                "Authorization": f"Bearer {auth_token}" if auth_token else ""
            }

            response = requests.get(f"{backend_url}/api/tasks/", headers=headers)

            if response.status_code == 200:
                return {"status": "success", "tasks": response.json()}
            else:
                return {"status": "error", "message": response.text}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def update_task(self, task_id: int, user_id: str = None, auth_token: str = None, **updates):
        """MCP tool to update a task"""
        try:
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {auth_token}" if auth_token else ""
            }

            response = requests.put(f"{backend_url}/api/tasks/{task_id}",
                                   json=updates,
                                   headers=headers)

            if response.status_code == 200:
                return {"status": "success", "task": response.json()}
            else:
                return {"status": "error", "message": response.text}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def delete_task(self, task_id: int, user_id: str = None, auth_token: str = None):
        """MCP tool to delete a task"""
        try:
            backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
            headers = {
                "Authorization": f"Bearer {auth_token}" if auth_token else ""
            }

            response = requests.delete(f"{backend_url}/api/tasks/{task_id}", headers=headers)

            if response.status_code == 200:
                return {"status": "success", "message": "Task deleted successfully"}
            else:
                return {"status": "error", "message": response.text}
        except Exception as e:
            return {"status": "error", "message": str(e)}

# Basic agent framework with MCP support
class TaskManagementAgent:
    def __init__(self):
        self.name = "TaskManagementAgent"
        self.description = "An AI agent specialized in managing tasks"
        self.mcp = MCPInterface()
        # Session state to track multi-step conversations
        self.sessions = {}

    async def process_request(self, message: str, user_id: str):
        """Process a request using the agent framework"""
        # Check if this is part of an ongoing task creation conversation
        session_key = f"{user_id}_task_creation"
        
        if session_key in self.sessions:
            # Continue the task creation conversation
            return await self.continue_task_creation(message, user_id, session_key)
        
        # Detect intent and handle accordingly
        intent = detect_intent(message)
        return await process_intent(intent, message, user_id, self)

    async def continue_task_creation(self, message: str, user_id: str, session_key: str):
        """Handle multi-step task creation conversation"""
        session = self.sessions[session_key]
        
        # Check what information we still need
        if 'title' not in session:
            # Ask for task title
            if any(word in message.lower() for word in ["cancel", "nevermind", "stop"]):
                del self.sessions[session_key]
                return "Task creation cancelled. Let me know if you need help with anything else!", None
            
            session['title'] = message.strip()
            return "Great! Now, could you please provide a description for this task? (You can say 'none' if you don't want to add a description)", None
        
        elif 'description' not in session:
            # Ask for description
            if message.lower() in ['none', 'no description', 'skip']:
                session['description'] = None
            else:
                session['description'] = message.strip()
            
            return "Perfect! Now, what priority level should this task have? Please choose: low, medium, or high", None
        
        elif 'priority' not in session:
            # Validate and set priority
            priority = message.lower().strip()
            if priority in ['low', 'medium', 'high']:
                session['priority'] = priority
                # Create the task
                result = await self.mcp.create_task(
                    session['title'],
                    user_id,
                    None,  # auth_token will be passed from the main handler
                    description=session.get('description'),
                    priority=session['priority']
                )
                
                # Clean up session
                del self.sessions[session_key]
                
                if result["status"] == "success":
                    task = result["task"]
                    return f"Excellent! I've successfully created your task:\n\n**Title:** {task['title']}\n**Description:** {task.get('description', 'None')}\n**Priority:** {task['priority']}\n\nYour task has been saved to the database! Is there anything else I can help you with?", {"type": "create_task", "task": task}
                else:
                    return f"Sorry, I couldn't create the task: {result['message']}", None
            else:
                return "Please choose a valid priority level: low, medium, or high", None

    def start_task_creation(self, user_id: str):
        """Start a new task creation session"""
        session_key = f"{user_id}_task_creation"
        self.sessions[session_key] = {}
        return "I'd be happy to help you create a task! Let's start:\n\nWhat would you like to call this task?"

# Create a global instance of the agent
task_agent = TaskManagementAgent()

# Models
class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    action: Optional[Dict[str, Any]] = None
    session_id: str

import re
from enum import Enum

class IntentType(str, Enum):
    CREATE_TASK = "create_task"
    LIST_TASKS = "list_tasks"
    UPDATE_TASK = "update_task"
    DELETE_TASK = "delete_task"
    UNKNOWN = "unknown"

# Enhanced intent recognition with patterns and confidence scoring
INTENT_PATTERNS = {
    IntentType.CREATE_TASK: [
        r"(create|add|make|build|new)\s+(a\s+|a\s+new\s+|an\s+|)\s*(task|todo|item|thing|work|job)",
        r"(i\s+want|i\s+need)\s+to\s+(create|add|make|build|new)\s+(a\s+|a\s+new\s+|an\s+|)\s*(task|todo|item|thing|work|job)",
        r"add\s+(a\s+|a\s+new\s+|an\s+|)\s*(task|todo|item|thing|work|job)\s+",
        r"create\s+(a\s+|a\s+new\s+|an\s+|)\s*(task|todo|item|thing|work|job)\s+"
    ],
    IntentType.LIST_TASKS: [
        r"(list|show|view|display|see|get|fetch)\s+(my\s+|all\s+|the\s+|)\s*(tasks|todos|items|list)",
        r"what\s+(tasks|todos|items)\s+do\s+i\s+have",
        r"what\s+(tasks|todos|items)\s+are\s+(there|on\s+my\s+list)",
        r"show\s+(me\s+|my\s+|the\s+|)\s*(tasks|todos|items|list)"
    ],
    IntentType.UPDATE_TASK: [
        r"(update|edit|change|modify|complete|finish|mark\s+as\s+done)\s+(a\s+|the\s+|my\s+|)\s*(task|todo|item)",
        r"mark\s+(task|todo|item)\s+#?\d+\s+(as\s+)?(complete|done|finished)",
        r"complete\s+(task|todo|item)\s+#?\d+",
        r"update\s+(task|todo|item)\s+#?\d+"
    ],
    IntentType.DELETE_TASK: [
        r"(delete|remove|cancel|eliminate|get\s+rid\s+of)\s+(a\s+|the\s+|my\s+|)\s*(task|todo|item)",
        r"remove\s+(task|todo|item)\s+#?\d+",
        r"delete\s+(task|todo|item)\s+#?\d+",
        r"cancel\s+(task|todo|item)\s+#?\d+"
    ]
}

def detect_intent(message: str) -> str:
    """Enhanced intent detection with pattern matching and confidence scoring"""
    message_lower = message.lower().strip()

    # Check pattern-based detection first (higher confidence)
    for intent_type, patterns in INTENT_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, message_lower):
                return intent_type.value

    # Fallback to keyword-based detection
    keyword_intents = {
        IntentType.CREATE_TASK: ["create", "add", "new", "make", "build", "start"],
        IntentType.LIST_TASKS: ["list", "show", "view", "see", "display", "all", "what"],
        IntentType.UPDATE_TASK: ["update", "edit", "change", "modify", "complete", "done", "finish", "mark"],
        IntentType.DELETE_TASK: ["delete", "remove", "cancel", "eliminate", "get rid of"]
    }

    for intent_type, keywords in keyword_intents.items():
        if any(keyword in message_lower for keyword in keywords):
            return intent_type.value

    return IntentType.UNKNOWN.value

from jose import JWTError, jwt
from datetime import datetime, timedelta

# Get secret key from environment or config - must match backend
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

def authenticate_user(authorization: str = Header(None)):
    """Validate user authentication with JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # Check if it's a Bearer token
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    # Extract the token
    token = authorization.split(" ")[1]

    try:
        # Decode the JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")

        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@app.get("/")
async def root():
    return {"message": "AI Task Management Agent is running"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_request: ChatRequest, authorization: str = Header(None)):
    """Main chat endpoint that processes user requests"""
    user_id = authenticate_user(authorization)

    # Detect intent from user message
    intent = detect_intent(chat_request.message)

    # Process the request based on detected intent
    # Pass the authorization token for backend API calls
    auth_token = authorization.split(" ")[1] if authorization and authorization.startswith("Bearer ") else None
    response_text, action = await process_intent(intent, chat_request.message, user_id, auth_token, task_agent)

    return ChatResponse(
        response=response_text,
        intent=intent,
        action=action,
        session_id=chat_request.session_id or f"session_{datetime.now().timestamp()}"
    )

async def process_intent(intent: str, message: str, user_id: str, auth_token: str = None, agent: TaskManagementAgent = None):
    """Process the detected intent and return appropriate response"""
    if intent == IntentType.CREATE_TASK.value:
        if agent:
            # Start a new task creation session
            response = agent.start_task_creation(user_id)
            return response, None
        else:
            return await handle_create_task(message, user_id, auth_token)
    elif intent == IntentType.LIST_TASKS.value:
        return await handle_list_tasks(user_id, auth_token)
    elif intent == IntentType.UPDATE_TASK.value:
        return await handle_update_task(message, user_id, auth_token)
    elif intent == IntentType.DELETE_TASK.value:
        return await handle_delete_task(message, user_id, auth_token)
    else:
        # Use AI to generate a response for unknown intents
        if google_client:
            try:
                # Enhanced prompt for better task creation conversation
                prompt = f"""You are a helpful AI assistant for a task management application.
                Help users create, manage, and organize their tasks.
                
                Current user message: "{message}"
                
                If the user wants to create a task, ask them for:
                1. Task name/title
                2. Description (optional)
                3. Priority (low, medium, high)
                4. Due date (optional)
                
                Respond naturally and conversationally. If they provide all details, confirm the task creation.
                If they want to list, update, or delete tasks, help them with that.
                
                Keep responses concise and helpful."""
                
                response = google_client.generate_content(prompt)
                return response.text, None
            except Exception as e:
                print(f"Error generating response with Google AI: {e}")
                return "I'm not sure how to help with that. You can ask me to create, list, update, or delete tasks.", None
        else:
            return "I'm not sure how to help with that. You can ask me to create, list, update, or delete tasks.", None

# Intent-to-action mapping for better organization
INTENT_ACTION_MAPPING = {
    IntentType.CREATE_TASK.value: "create_task_action",
    IntentType.LIST_TASKS.value: "list_tasks_action",
    IntentType.UPDATE_TASK.value: "update_task_action",
    IntentType.DELETE_TASK.value: "delete_task_action"
}

async def handle_create_task(message: str, user_id: str, auth_token: str = None):
    """Handle task creation intent with interactive conversation"""
    # Check if this is a simple task creation or needs more details
    message_lower = message.lower()
    
    # If user provides a simple task name, create it directly
    if any(word in message_lower for word in ["create", "add", "make"]):
        task_desc = extract_task_description(message, IntentType.CREATE_TASK)
        
        if task_desc and len(task_desc) > 3:  # Simple task name provided
            # Use MCP interface to create task, passing user context and auth token
            result = await task_agent.mcp.create_task(task_desc, user_id, auth_token)
            
            if result["status"] == "success":
                return f"Great! I've created the task: '{task_desc}'. Is there anything else you'd like to add to this task?", {"type": "create_task", "task": result["task"]}
            else:
                return f"Sorry, I couldn't create the task: {result['message']}", None
        else:
            # Ask for more details
            return "I'd be happy to help you create a task! Could you please tell me:\n1. What would you like to call this task?\n2. Any description or details about it?\n3. What priority level (low, medium, high)?", None
    else:
        # For more complex requests, let the AI handle the conversation
        return "I'd be happy to help you create a task! Could you please tell me:\n1. What would you like to call this task?\n2. Any description or details about it?\n3. What priority level (low, medium, high)?", None

async def handle_list_tasks(user_id: str, auth_token: str = None):
    """Handle task listing intent"""
    # Use MCP interface to list tasks, passing user context and auth token
    result = await task_agent.mcp.list_tasks(user_id, auth_token)

    if result["status"] == "success":
        tasks = result["tasks"]
        if tasks:
            task_list = "\n".join([f"- {task['title']}" for task in tasks])
            return f"Here are your tasks:\n{task_list}", {"type": "list_tasks", "tasks": tasks}
        else:
            return "You don't have any tasks yet.", {"type": "list_tasks", "tasks": []}
    else:
        return f"Sorry, I couldn't retrieve your tasks: {result['message']}", None

async def handle_update_task(message: str, user_id: str, auth_token: str = None):
    """Handle task update intent"""
    # Extract task ID and updates from message
    task_id, updates = extract_task_update_info(message)

    if not task_id:
        return "I couldn't identify which task to update. Please specify the task number or title.", None

    # Use MCP interface to update task, passing user context and auth token
    result = await task_agent.mcp.update_task(task_id, user_id, auth_token, **updates)

    if result["status"] == "success":
        return f"I've updated the task with ID {task_id}.", {"type": "update_task", "task": result["task"]}
    else:
        return f"Sorry, I couldn't update the task: {result['message']}", None

async def handle_delete_task(message: str, user_id: str, auth_token: str = None):
    """Handle task deletion intent"""
    # Extract task ID from message
    task_id = extract_task_id(message)

    if not task_id:
        return "I couldn't identify which task to delete. Please specify the task number or title.", None

    # Use MCP interface to delete task, passing user context and auth token
    result = await task_agent.mcp.delete_task(task_id, user_id, auth_token)

    if result["status"] == "success":
        return f"I've deleted the task with ID {task_id}.", {"type": "delete_task", "task_id": task_id}
    else:
        return f"Sorry, I couldn't delete the task: {result['message']}", None

def extract_task_description(message: str, intent_type: IntentType) -> str:
    """Extract task description from user message based on intent"""
    message_lower = message.lower()

    # Remove intent-related words to get the task description
    if intent_type == IntentType.CREATE_TASK:
        # Remove common create phrases
        for phrase in ["create", "add", "make", "new", "task", "a task", "an", "a", "to", "please"]:
            message_lower = message_lower.replace(phrase, "")

    # Clean up the message to get the core task description
    # Remove extra whitespace and return the description
    task_desc = ' '.join(message_lower.split())
    return task_desc.strip() if task_desc.strip() else message

def extract_task_id(message: str) -> Optional[int]:
    """Extract task ID from user message using regex"""
    # Look for numbers in the message that might represent task IDs
    id_match = re.search(r'#?(\d+)', message)
    if id_match:
        try:
            return int(id_match.group(1))
        except ValueError:
            pass

    # If no number found, we might need to look up by task name
    # For now, return None to indicate that we can't identify the task
    return None

def extract_task_update_info(message: str) -> tuple[Optional[int], Dict[str, Any]]:
    """Extract task ID and update information from user message"""
    task_id = extract_task_id(message)

    # Determine what update is requested
    updates = {}
    message_lower = message.lower()

    if any(word in message_lower for word in ["complete", "done", "finished", "mark as done", "mark as complete"]):
        updates["completed"] = True
    elif any(word in message_lower for word in ["incomplete", "not done", "not finished"]):
        updates["completed"] = False

    # For now, just return the ID and basic completion status
    # In a real implementation, we'd have more sophisticated parsing
    return task_id, updates

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)