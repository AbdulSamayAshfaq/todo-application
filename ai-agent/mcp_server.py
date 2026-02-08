"""
MCP Server for TODO Application

This module provides an MCP (Model Context Protocol) server that exposes
task management tools to AI agents.

Usage:
    Run with: python -m ai-agent.mcp_server
    Or via MCP client connection
"""

import os
import sys
from pathlib import Path
from typing import Any, Dict
from dotenv import load_dotenv

# Load .env file from ai-agent directory first
PROJECT_DIR = Path(__file__).parent  # mcp_server's parent = ai-agent
ENV_FILE = PROJECT_DIR / '.env'
if ENV_FILE.exists():
    load_dotenv(str(ENV_FILE))
    print(f"Loaded .env from: {ENV_FILE}")
else:
    print(".env file not found")

# Try to import MCP first, before any path manipulation
try:
    from mcp.server import FastMCP
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False
    print("Error: MCP not installed. Install with: pip install mcp")
    # Don't exit here - let the main function handle the error


def _make_authenticated_request(
    method: str,
    endpoint: str,
    auth_token: str,
    json_data: Dict = None
) -> Dict:
    """Helper function to make authenticated requests to the backend"""
    import requests

    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    url = f"{os.getenv('TODO_BACKEND_URL', os.getenv('BACKEND_URL', 'http://localhost:8000'))}{endpoint}"

    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=json_data)
        elif method.upper() == "PUT":
            response = requests.put(url, headers=headers, json=json_data)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")

        if response.status_code in [200, 201]:
            return response.json()
        else:
            raise Exception(f"Backend error: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Backend connection error: {str(e)}")


def ensure_project_path():
    """Ensure the project path is in sys.path for imports"""
    PROJECT_DIR = Path(__file__).parent  # mcp_server's parent = ai-agent
    PROJECT_DIR_STR = str(PROJECT_DIR.parent)  # hackathon 2.0
    if PROJECT_DIR_STR not in sys.path:
        sys.path.insert(0, PROJECT_DIR_STR)


if MCP_AVAILABLE:
    # Create MCP server instance
    mcp = FastMCP("todo-mcp-server")

    @mcp.tool()
    def create_task(
        title: str,
        description: str = "",
        priority: str = "medium",
        due_date: str = "",
        category: str = "",
        auth_token: str = ""
    ) -> str:
        """
        Create a new task in the TODO application.
        
        Args:
            title: Task title (required)
            description: Optional task description
            priority: Task priority (low, medium, high)
            due_date: Optional due date in ISO format
            category: Optional category
            auth_token: User's authentication token (required)
        
        Returns:
            Success or error message
        """
        if not auth_token:
            return "Error: Authentication token is required"
        
        try:
            task_data = {
                "title": title,
                "description": description or "",
                "status": "pending",
                "priority": priority or "medium",
                "due_date": due_date or None,
                "category": category or None,
                "is_recurring": False
            }
            
            result = _make_authenticated_request("POST", "/api/tasks/", auth_token, task_data)
            return f"✅ Task created successfully!\n📝 Title: {result.get('title', title)}\n🏷️ Priority: {result.get('priority', priority)}\n📌 Status: {result.get('status', 'pending')}\n🆔 Task ID: {result.get('id')}"
        except Exception as e:
            return f"❌ Error creating task: {str(e)}"

    @mcp.tool()
    def list_tasks(auth_token: str = "") -> str:
        """
        List all tasks for the authenticated user.
        
        Args:
            auth_token: User's authentication token (required)
        
        Returns:
            List of tasks or error message
        """
        if not auth_token:
            return "Error: Authentication token is required"
        
        try:
            result = _make_authenticated_request("GET", "/api/tasks/", auth_token)
            
            if not result:
                return "No tasks found."
            
            tasks = result if isinstance(result, list) else [result]
            
            if not tasks:
                return "You have no tasks yet."
            
            task_list = "📋 Your Tasks:\n\n"
            for task in tasks:
                status_icon = "✅" if task.get('status') == 'completed' else "⏳"
                priority = task.get('priority', 'medium')
                priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(priority, "⚪")
                
                task_list += f"{status_icon} {priority_icon} **{task.get('title', 'Untitled')}**\n"
                task_list += f"   📝 {task.get('description', 'No description') or 'No description'}\n"
                if task.get('due_date'):
                    task_list += f"   📅 Due: {task.get('due_date')}\n"
                if task.get('category'):
                    task_list += f"   🏷️ Category: {task.get('category')}\n"
                task_list += f"   🆔 ID: {task.get('id')}\n\n"
            
            return task_list
        except Exception as e:
            return f"❌ Error fetching tasks: {str(e)}"

    @mcp.tool()
    def get_task(task_id: int, auth_token: str = "") -> str:
        """
        Get details of a specific task.
        
        Args:
            task_id: The ID of the task to retrieve
            auth_token: User's authentication token (required)
        
        Returns:
            Task details or error message
        """
        if not auth_token:
            return "Error: Authentication token is required"
        
        try:
            result = _make_authenticated_request("GET", f"/api/tasks/{task_id}", auth_token)
            
            task = result
            status_icon = "✅" if task.get('status') == 'completed' else "⏳"
            priority = task.get('priority', 'medium')
            priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(priority, "⚪")
            
            return (
                f"📋 Task Details:\n\n"
                f"{status_icon} 🏷️ **{task.get('title', 'Untitled')}**\n"
                f"   📝 Description: {task.get('description', 'No description') or 'No description'}\n"
                f"   📌 Status: {task.get('status', 'pending')}\n"
                f"   {priority_icon} Priority: {priority}\n"
                f"   🆔 ID: {task.get('id')}\n"
            )
        except Exception as e:
            return f"❌ Error fetching task: {str(e)}"

    @mcp.tool()
    def update_task(
        task_id: int,
        title: str = "",
        description: str = "",
        priority: str = "",
        status: str = "",
        auth_token: str = ""
    ) -> str:
        """
        Update an existing task.
        
        Args:
            task_id: The ID of the task to update
            title: New title (optional)
            description: New description (optional)
            priority: New priority (optional)
            status: New status (pending/completed)
            auth_token: User's authentication token (required)
        
        Returns:
            Success or error message
        """
        if not auth_token:
            return "Error: Authentication token is required"
        
        try:
            update_data = {}
            if title:
                update_data["title"] = title
            if description:
                update_data["description"] = description
            if priority:
                update_data["priority"] = priority
            if status:
                update_data["status"] = status
            
            result = _make_authenticated_request("PUT", f"/api/tasks/{task_id}", auth_token, update_data)
            return f"✅ Task updated successfully!\n📝 Title: {result.get('title')}\n📌 Status: {result.get('status')}"
        except Exception as e:
            return f"❌ Error updating task: {str(e)}"

    @mcp.tool()
    def delete_task(task_id: int, auth_token: str = "") -> str:
        """
        Delete a task.
        
        Args:
            task_id: The ID of the task to delete
            auth_token: User's authentication token (required)
        
        Returns:
            Success or error message
        """
        if not auth_token:
            return "Error: Authentication token is required"
        
        try:
            _make_authenticated_request("DELETE", f"/api/tasks/{task_id}", auth_token)
            return f"✅ Task {task_id} deleted successfully!"
        except Exception as e:
            return f"❌ Error deleting task: {str(e)}"

    @mcp.tool()
    def mark_task_complete(task_id: int, auth_token: str = "") -> str:
        """
        Mark a task as completed.
        
        Args:
            task_id: The ID of the task to mark as complete
            auth_token: User's authentication token (required)
        
        Returns:
            Success or error message
        """
        if not auth_token:
            return "Error: Authentication token is required"
        
        try:
            result = _make_authenticated_request("PUT", f"/api/tasks/{task_id}", auth_token, {"status": "completed"})
            return f"✅ Task marked as completed!\n📝 Title: {result.get('title')}\n📌 Status: {result.get('status')}"
        except Exception as e:
            return f"❌ Error completing task: {str(e)}"

    @mcp.tool()
    def search_tasks(query: str = "", auth_token: str = "") -> str:
        """
        Search tasks by title or description.
        
        Args:
            query: Search query
            auth_token: User's authentication token (required)
        
        Returns:
            Matching tasks or error message
        """
        if not auth_token:
            return "Error: Authentication token is required"
        
        try:
            result = _make_authenticated_request("GET", f"/api/tasks/?search={query}", auth_token)
            
            if not result:
                return "No tasks found matching your query."
            
            tasks = result if isinstance(result, list) else [result]
            task_list = f"🔍 Search Results for '{query}':\n\n"
            
            for task in tasks:
                status_icon = "✅" if task.get('status') == 'completed' else "⏳"
                task_list += f"{status_icon} **{task.get('title', 'Untitled')}** (ID: {task.get('id')})\n"
                task_list += f"   📝 {task.get('description', 'No description')}\n\n"
            
            return task_list
        except Exception as e:
            return f"❌ Error searching tasks: {str(e)}"


def main():
    """Main entry point for running the MCP server"""
    if not MCP_AVAILABLE:
        print("Error: MCP package not installed. Install with: pip install mcp")
        sys.exit(1)

    # Run the MCP server with stdio transport
    mcp.run()


if __name__ == "__main__":
    main()
