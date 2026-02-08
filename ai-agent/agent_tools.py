"""
Task Management Tools for AI Agent

This module provides tools that the AI agent can use to interact with the TODO backend.
"""

import os
import requests
from typing import Any, Dict
from agents import Tool, function_tool


def _make_authenticated_request(
    method: str,
    endpoint: str,
    auth_token: str,
    json_data: Dict = None
) -> requests.Response:
    """Helper method to make authenticated requests to the backend"""
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
        return response
    except requests.exceptions.RequestException as e:
        raise Exception(f"Backend connection error: {str(e)}")


# Use function_tool decorator for Agents SDK

@function_tool
def create_task(
    title: str,
    description: str,
    priority: str,
    due_date: str,
    category: str,
    auth_token: str
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
        Success message with created task details
    """
    if not auth_token:
        return "Error: Authentication token is required. Please log in first."
    
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
        
        response = _make_authenticated_request("POST", "/api/tasks/", auth_token, task_data)
        
        if response.status_code == 200:
            task = response.json()
            return f"✅ Task created successfully!\n📝 Title: {task['title']}\n🏷️ Priority: {task['priority']}\n📌 Status: {task['status']}\n🆔 Task ID: {task['id']}"
        else:
            return f"❌ Failed to create task: {response.text}"
    except Exception as e:
        return f"Error creating task: {str(e)}"


@function_tool
def list_tasks(auth_token: str) -> str:
    """
    List all tasks for the authenticated user.
    
    Args:
        auth_token: User's authentication token (required)
    
    Returns:
        Formatted list of user's tasks
    """
    if not auth_token:
        return "Error: Authentication token is required. Please log in first."
    
    try:
        response = _make_authenticated_request("GET", "/api/tasks/", auth_token)
        
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
                    due = f" (Due: {task.get('due_date', '')})" if task.get('due_date') else ""
                    result.append(f"  {i}. {priority_icon} {task['title']} - {task['priority']}{due}")
            
            if completed_tasks:
                result.append("\n✅ Completed Tasks:")
                for i, task in enumerate(completed_tasks, 1):
                    result.append(f"  {i}. ✓ {task['title']}")
            
            return "\n".join(result)
        else:
            return f"❌ Failed to list tasks: {response.text}"
    except Exception as e:
        return f"Error listing tasks: {str(e)}"


@function_tool
def get_task(task_id: int, auth_token: str) -> str:
    """
    Get details of a specific task by ID.
    
    Args:
        task_id: ID of the task to retrieve
        auth_token: User's authentication token (required)
    
    Returns:
        Detailed information about the specified task
    """
    if not auth_token:
        return "Error: Authentication token is required. Please log in first."
    
    try:
        response = _make_authenticated_request("GET", f"/api/tasks/{task_id}", auth_token)
        
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
                f"📅 Created: {task['created_at']}",
            ]
            
            if task.get('due_date'):
                details.append(f"⏰ Due Date: {task['due_date']}")
            if task.get('completed_at'):
                details.append(f"✅ Completed: {task['completed_at']}")
            
            return "\n".join(details)
        else:
            return f"❌ Failed to get task: {response.text}"
    except Exception as e:
        return f"Error getting task: {str(e)}"


@function_tool
def update_task(
    task_id: int,
    title: str,
    description: str,
    status: str,
    priority: str,
    due_date: str,
    category: str,
    auth_token: str
) -> str:
    """
    Update an existing task with provided details.
    
    Args:
        task_id: ID of the task to update
        title: New title
        description: New description
        status: New status (pending, completed)
        priority: New priority (low, medium, high)
        due_date: New due date
        category: New category
        auth_token: User's authentication token (required)
    
    Returns:
        Success message with updated task details
    """
    if not auth_token:
        return "Error: Authentication token is required. Please log in first."
    
    try:
        update_data = {}
        if title:
            update_data['title'] = title
        if description:
            update_data['description'] = description
        if status:
            update_data['status'] = status
        if priority:
            update_data['priority'] = priority
        if due_date:
            update_data['due_date'] = due_date
        if category:
            update_data['category'] = category
        
        response = _make_authenticated_request("PUT", f"/api/tasks/{task_id}", auth_token, update_data)
        
        if response.status_code == 200:
            task = response.json()
            return f"✅ Task updated successfully!\n📝 Title: {task['title']}\n📌 Status: {task['status']}\n🏷️ Priority: {task['priority']}"
        else:
            return f"❌ Failed to update task: {response.text}"
    except Exception as e:
        return f"Error updating task: {str(e)}"


@function_tool
def mark_task_completed(task_id: int, auth_token: str) -> str:
    """
    Mark a task as completed.
    
    Args:
        task_id: ID of the task to mark as completed
        auth_token: User's authentication token (required)
    
    Returns:
        Success message confirming completion
    """
    if not auth_token:
        return "Error: Authentication token is required. Please log in first."
    
    try:
        update_data = {"status": "completed"}
        response = _make_authenticated_request("PUT", f"/api/tasks/{task_id}", auth_token, update_data)
        
        if response.status_code == 200:
            return "✅ Task marked as completed successfully! Great job!"
        else:
            return f"❌ Failed to mark task as completed: {response.text}"
    except Exception as e:
        return f"Error marking task as completed: {str(e)}"


@function_tool
def delete_task(task_id: int, auth_token: str) -> str:
    """
    Delete a task permanently.
    
    Args:
        task_id: ID of the task to delete
        auth_token: User's authentication token (required)
    
    Returns:
        Success message confirming deletion
    """
    if not auth_token:
        return "Error: Authentication token is required. Please log in first."
    
    try:
        response = _make_authenticated_request("DELETE", f"/api/tasks/{task_id}", auth_token)
        
        if response.status_code == 200:
            return "✅ Task deleted successfully!"
        else:
            return f"❌ Failed to delete task: {response.text}"
    except Exception as e:
        return f"Error deleting task: {str(e)}"


@function_tool
def search_tasks(category: str, auth_token: str) -> str:
    """
    Search tasks by category.
    
    Args:
        category: Category to search for
        auth_token: User's authentication token (required)
    
    Returns:
        Formatted list of tasks matching the category
    """
    if not auth_token:
        return "Error: Authentication token is required. Please log in first."
    
    try:
        response = _make_authenticated_request("GET", "/api/tasks/", auth_token)
        
        if response.status_code == 200:
            all_tasks = response.json()
            filtered_tasks = [task for task in all_tasks if task.get('category', '').lower() == category.lower()]
            
            if not filtered_tasks:
                return f"📋 No tasks found in category '{category}'."
            
            result = [f"📋 Tasks in category '{category}':"]
            for i, task in enumerate(filtered_tasks, 1):
                status_icon = "✅" if task.get('status') == 'completed' else "⏳"
                priority_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(task.get('priority', 'medium'), "⚪")
                result.append(f"  {i}. {status_icon} {priority_icon} {task['title']} - {task['priority']}")
            
            return "\n".join(result)
        else:
            return f"❌ Failed to search tasks: {response.text}"
    except Exception as e:
        return f"Error searching tasks: {str(e)}"


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
