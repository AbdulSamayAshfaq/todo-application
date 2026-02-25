"""
Task Management Tools for AI Agent

This module provides tools that the AI agent can use to interact with the TODO backend.
Uses the OpenAI Agents SDK function_tool decorator for proper tool registration.
"""

import os
import logging
import requests
from typing import Any, Dict, Optional
from agents import function_tool

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _make_authenticated_request(
    method: str,
    endpoint: str,
    auth_token: str,
    json_data: Optional[Dict] = None
) -> requests.Response:
    """Helper method to make authenticated requests to the backend"""
    
    # Get backend URL from environment variables
    backend_url = os.getenv('TODO_BACKEND_URL') or os.getenv('BACKEND_URL') or 'http://localhost:8000'
    
    # Ensure URL doesn't have trailing slash
    backend_url = backend_url.rstrip('/')
    
    # Build full URL with /api prefix
    url = f"{backend_url}/api{endpoint}"
    
    headers = {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }
    
    logger.info(f"[Agent Tools] Making {method} request to: {url}")
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == "POST":
            response = requests.post(url, headers=headers, json=json_data, timeout=30)
        elif method.upper() == "PUT":
            response = requests.put(url, headers=headers, json=json_data, timeout=30)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        logger.info(f"[Agent Tools] Response status: {response.status_code}")
        return response
    except requests.exceptions.Timeout:
        logger.error("[Agent Tools] Request timeout")
        raise Exception("Backend request timed out. Please try again.")
    except requests.exceptions.ConnectionError as e:
        logger.error(f"[Agent Tools] Connection error: {e}")
        raise Exception(f"Cannot connect to backend server at {backend_url}")
    except requests.exceptions.RequestException as e:
        logger.error(f"[Agent Tools] Request error: {e}")
        raise Exception(f"Backend connection error: {str(e)}")


@function_tool
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
        priority: Task priority (low, medium, high) - defaults to medium
        due_date: Optional due date in ISO format (YYYY-MM-DD)
        category: Optional category for the task
        auth_token: User's authentication token (required)

    Returns:
        Success message with created task details or error message
    """
    if not auth_token:
        return "❌ Error: Authentication token is required. Please log in first."
    
    if not title or not title.strip():
        return "❌ Error: Task title is required."

    try:
        task_data = {
            "title": title.strip(),
            "description": description.strip() if description else "",
            "status": "pending",
            "priority": priority.lower() if priority else "medium",
            "due_date": due_date if due_date else None,
            "category": category.strip() if category else None,
            "is_recurring": False
        }

        logger.info(f"[Create Task] Creating task: {task_data['title']}")
        
        response = _make_authenticated_request("POST", "/tasks/", auth_token, task_data)

        if response.status_code == 200:
            task = response.json()
            return (
                f"✅ Task created successfully!\n"
                f"📝 Title: {task['title']}\n"
                f"🏷️ Priority: {task['priority']}\n"
                f"📌 Status: {task['status']}\n"
                f"🆔 Task ID: {task['id']}"
            )
        else:
            error_data = response.json() if response.headers.get('content-type', '').includes('application/json') else {}
            error_msg = error_data.get('detail', response.text)
            logger.error(f"[Create Task] Failed: {error_msg}")
            return f"❌ Failed to create task: {error_msg}"
            
    except Exception as e:
        logger.error(f"[Create Task] Error: {str(e)}")
        return f"❌ Error creating task: {str(e)}"


@function_tool
def list_tasks(auth_token: str = "") -> str:
    """
    List all tasks for the authenticated user.

    Args:
        auth_token: User's authentication token (required)

    Returns:
        Formatted list of user's tasks or error message
    """
    if not auth_token:
        return "❌ Error: Authentication token is required. Please log in first."

    try:
        logger.info("[List Tasks] Fetching tasks...")
        response = _make_authenticated_request("GET", "/tasks/", auth_token)

        if response.status_code == 200:
            tasks = response.json()

            if not tasks:
                return "📋 You don't have any tasks yet. Create your first task!"

            # Format tasks for display
            pending_tasks = [t for t in tasks if t.get('status') == 'pending']
            completed_tasks = [t for t in tasks if t.get('status') == 'completed']

            result = []
            result.append(f"📊 Task Summary: {len(pending_tasks)} pending, {len(completed_tasks)} completed\n")

            if pending_tasks:
                result.append("⏳ Pending Tasks:")
                for i, task in enumerate(pending_tasks, 1):
                    priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(task.get('priority', 'medium'), "⚪")
                    due = f" (Due: {task.get('due_date', '')[:10]})" if task.get('due_date') else ""
                    category = f" [{task.get('category', '')}]" if task.get('category') else ""
                    result.append(f"  {i}. {priority_icon} {task['title']}{category} - {task['priority']}{due}")

            if completed_tasks:
                result.append("\n✅ Completed Tasks:")
                for i, task in enumerate(completed_tasks, 1):
                    result.append(f"  {i}. ✓ {task['title']}")

            return "\n".join(result)
        else:
            error_data = response.json() if response.headers.get('content-type', '').includes('application/json') else {}
            error_msg = error_data.get('detail', response.text)
            logger.error(f"[List Tasks] Failed: {error_msg}")
            return f"❌ Failed to list tasks: {error_msg}"
            
    except Exception as e:
        logger.error(f"[List Tasks] Error: {str(e)}")
        return f"❌ Error listing tasks: {str(e)}"


@function_tool
def get_task(task_id: int, auth_token: str = "") -> str:
    """
    Get details of a specific task by ID.

    Args:
        task_id: ID of the task to retrieve
        auth_token: User's authentication token (required)

    Returns:
        Detailed information about the specified task or error message
    """
    if not auth_token:
        return "❌ Error: Authentication token is required. Please log in first."

    try:
        logger.info(f"[Get Task] Fetching task {task_id}...")
        response = _make_authenticated_request("GET", f"/tasks/{task_id}", auth_token)

        if response.status_code == 200:
            task = response.json()

            status_icon = "✅" if task.get('status') == 'completed' else "⏳"
            priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(task.get('priority', 'medium'), "⚪")

            details = [
                f"📌 Task Details:",
                f"🆔 ID: {task['id']}",
                f"📝 Title: {task['title']}",
                f"📖 Description: {task.get('description', 'No description')}",
                f"{status_icon} Status: {task['status']}",
                f"{priority_icon} Priority: {task['priority']}",
                f"🏷️ Category: {task.get('category', 'Not set')}",
                f"📅 Created: {task['created_at'][:10] if task.get('created_at') else 'N/A'}",
            ]

            if task.get('due_date'):
                details.append(f"⏰ Due Date: {task['due_date'][:10]}")
            if task.get('completed_at'):
                details.append(f"✅ Completed: {task['completed_at'][:10]}")

            return "\n".join(details)
        else:
            error_data = response.json() if response.headers.get('content-type', '').includes('application/json') else {}
            error_msg = error_data.get('detail', response.text)
            logger.error(f"[Get Task] Failed: {error_msg}")
            return f"❌ Failed to get task: {error_msg}"
            
    except Exception as e:
        logger.error(f"[Get Task] Error: {str(e)}")
        return f"❌ Error getting task: {str(e)}"


@function_tool
def update_task(
    task_id: int,
    title: str = "",
    description: str = "",
    status: str = "",
    priority: str = "",
    due_date: str = "",
    category: str = "",
    auth_token: str = ""
) -> str:
    """
    Update an existing task with provided details.

    Args:
        task_id: ID of the task to update
        title: New title (optional)
        description: New description (optional)
        status: New status (pending, completed) (optional)
        priority: New priority (low, medium, high) (optional)
        due_date: New due date (optional)
        category: New category (optional)
        auth_token: User's authentication token (required)

    Returns:
        Success message with updated task details or error message
    """
    if not auth_token:
        return "❌ Error: Authentication token is required. Please log in first."

    try:
        update_data = {}
        if title and title.strip():
            update_data['title'] = title.strip()
        if description:
            update_data['description'] = description.strip()
        if status and status.strip():
            update_data['status'] = status.lower().strip()
        if priority and priority.strip():
            update_data['priority'] = priority.lower().strip()
        if due_date and due_date.strip():
            update_data['due_date'] = due_date.strip()
        if category and category.strip():
            update_data['category'] = category.strip()

        if not update_data:
            return "❌ Error: No update data provided."

        logger.info(f"[Update Task] Updating task {task_id} with: {update_data}")
        
        response = _make_authenticated_request("PUT", f"/tasks/{task_id}", auth_token, update_data)

        if response.status_code == 200:
            task = response.json()
            return (
                f"✅ Task updated successfully!\n"
                f"📝 Title: {task['title']}\n"
                f"📌 Status: {task['status']}\n"
                f"🏷️ Priority: {task['priority']}"
            )
        else:
            error_data = response.json() if response.headers.get('content-type', '').includes('application/json') else {}
            error_msg = error_data.get('detail', response.text)
            logger.error(f"[Update Task] Failed: {error_msg}")
            return f"❌ Failed to update task: {error_msg}"
            
    except Exception as e:
        logger.error(f"[Update Task] Error: {str(e)}")
        return f"❌ Error updating task: {str(e)}"


@function_tool
def mark_task_completed(task_id: int, auth_token: str = "") -> str:
    """
    Mark a task as completed.

    Args:
        task_id: ID of the task to mark as completed
        auth_token: User's authentication token (required)

    Returns:
        Success message confirming completion or error message
    """
    if not auth_token:
        return "❌ Error: Authentication token is required. Please log in first."

    try:
        logger.info(f"[Mark Completed] Marking task {task_id} as completed...")
        update_data = {"status": "completed"}
        response = _make_authenticated_request("PUT", f"/tasks/{task_id}", auth_token, update_data)

        if response.status_code == 200:
            return "✅ Task marked as completed successfully! Great job! 🎉"
        else:
            error_data = response.json() if response.headers.get('content-type', '').includes('application/json') else {}
            error_msg = error_data.get('detail', response.text)
            logger.error(f"[Mark Completed] Failed: {error_msg}")
            return f"❌ Failed to mark task as completed: {error_msg}"
            
    except Exception as e:
        logger.error(f"[Mark Completed] Error: {str(e)}")
        return f"❌ Error marking task as completed: {str(e)}"


@function_tool
def delete_task(task_id: int, auth_token: str = "") -> str:
    """
    Delete a task permanently.

    Args:
        task_id: ID of the task to delete
        auth_token: User's authentication token (required)

    Returns:
        Success message confirming deletion or error message
    """
    if not auth_token:
        return "❌ Error: Authentication token is required. Please log in first."

    try:
        logger.info(f"[Delete Task] Deleting task {task_id}...")
        response = _make_authenticated_request("DELETE", f"/tasks/{task_id}", auth_token)

        if response.status_code == 200:
            return "✅ Task deleted successfully!"
        else:
            error_data = response.json() if response.headers.get('content-type', '').includes('application/json') else {}
            error_msg = error_data.get('detail', response.text)
            logger.error(f"[Delete Task] Failed: {error_msg}")
            return f"❌ Failed to delete task: {error_msg}"
            
    except Exception as e:
        logger.error(f"[Delete Task] Error: {str(e)}")
        return f"❌ Error deleting task: {str(e)}"


@function_tool
def search_tasks(category: str = "", auth_token: str = "") -> str:
    """
    Search tasks by category.

    Args:
        category: Category to search for
        auth_token: User's authentication token (required)

    Returns:
        Formatted list of tasks matching the category or error message
    """
    if not auth_token:
        return "❌ Error: Authentication token is required. Please log in first."

    try:
        logger.info(f"[Search Tasks] Searching for category: {category}")
        response = _make_authenticated_request("GET", "/tasks/", auth_token)

        if response.status_code == 200:
            all_tasks = response.json()
            
            if not category:
                # If no category specified, return all tasks
                return list_tasks(auth_token)
            
            filtered_tasks = [task for task in all_tasks if category.lower() in task.get('category', '').lower()]

            if not filtered_tasks:
                return f"📋 No tasks found in category '{category}'."

            result = [f"📋 Tasks in category '{category}':"]
            for i, task in enumerate(filtered_tasks, 1):
                status_icon = "✅" if task.get('status') == 'completed' else "⏳"
                priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(task.get('priority', 'medium'), "⚪")
                due = f" (Due: {task.get('due_date', '')[:10]})" if task.get('due_date') else ""
                result.append(f"  {i}. {status_icon} {priority_icon} {task['title']} - {task['priority']}{due}")

            return "\n".join(result)
        else:
            error_data = response.json() if response.headers.get('content-type', '').includes('application/json') else {}
            error_msg = error_data.get('detail', response.text)
            logger.error(f"[Search Tasks] Failed: {error_msg}")
            return f"❌ Failed to search tasks: {error_msg}"
            
    except Exception as e:
        logger.error(f"[Search Tasks] Error: {str(e)}")
        return f"❌ Error searching tasks: {str(e)}"


# Export all functions as tools
task_tools = [
    create_task,
    list_tasks,
    get_task,
    update_task,
    mark_task_completed,
    delete_task,
    search_tasks,
]
