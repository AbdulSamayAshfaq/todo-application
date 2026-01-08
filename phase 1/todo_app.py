
#!/usr/bin/env python3
"""
Console Todo Application - Phase I Implementation
A simple CLI-based todo application with file-based storage.
"""

import json
import os
import sys
from datetime import datetime
from typing import List, Dict, Optional


class Task:
    """Represents a single task in the todo application."""

    def __init__(self, task_id: int, title: str, description: str = "", status: str = "pending"):
        self.id = task_id
        self.title = title
        self.description = description
        self.status = status  # "pending" or "completed"
        self.created_at = datetime.now().isoformat()

    def to_dict(self) -> Dict:
        """Convert task to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Task':
        """Create a Task instance from a dictionary."""
        task = cls(data["id"], data["title"], data["description"], data["status"])
        task.created_at = data.get("created_at", datetime.now().isoformat())
        return task


class TodoManager:
    """Manages the collection of tasks with file-based persistence."""

    def __init__(self, storage_file: str = "tasks.json"):
        self.storage_file = storage_file
        self.tasks: List[Task] = []
        self.next_id = 1
        self.load_tasks()

    def load_tasks(self):
        """Load tasks from the storage file."""
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.tasks = [Task.from_dict(task_data) for task_data in data.get("tasks", [])]
                    self.next_id = data.get("next_id", 1)
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Error loading tasks from {self.storage_file}: {e}")
                print("Starting with an empty task list.")
                self.tasks = []
                self.next_id = 1
        else:
            self.tasks = []
            self.next_id = 1

    def save_tasks(self):
        """Save tasks to the storage file."""
        try:
            data = {
                "tasks": [task.to_dict() for task in self.tasks],
                "next_id": self.next_id
            }
            with open(self.storage_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
        except IOError as e:
            print(f"Error saving tasks to {self.storage_file}: {e}")

    def add_task(self, title: str, description: str = "") -> Task:
        """Add a new task to the collection."""
        if not title.strip():
            raise ValueError("Task title cannot be empty")

        task = Task(self.next_id, title.strip(), description.strip())
        self.tasks.append(task)
        self.next_id += 1
        self.save_tasks()
        return task

    def update_task(self, task_id: int, title: Optional[str] = None,
                   description: Optional[str] = None, status: Optional[str] = None) -> bool:
        """Update an existing task."""
        task = self.get_task_by_id(task_id)
        if not task:
            return False

        if title is not None:
            task.title = title.strip() if title.strip() else task.title
        if description is not None:
            task.description = description.strip()
        if status is not None:
            if status in ["pending", "completed"]:
                task.status = status
            else:
                raise ValueError("Status must be 'pending' or 'completed'")

        self.save_tasks()
        return True

    def delete_task(self, task_id: int) -> bool:
        """Delete a task by its ID."""
        task = self.get_task_by_id(task_id)
        if not task:
            return False

        self.tasks = [t for t in self.tasks if t.id != task_id]
        self.save_tasks()
        return True

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """Get a task by its ID."""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def list_tasks(self, status_filter: Optional[str] = None) -> List[Task]:
        """List all tasks, optionally filtered by status."""
        if status_filter:
            return [task for task in self.tasks if task.status == status_filter]
        return self.tasks


class TodoCLI:
    """Command-line interface for the Todo application."""

    def __init__(self):
        self.manager = TodoManager()

    def display_menu(self):
        """Display the main menu."""
        print("\n" + "="*50)
        print("           CONSOLE TODO APPLICATION")
        print("="*50)
        print("1. Add Task")
        print("2. List Tasks")
        print("3. Update Task")
        print("4. Delete Task")
        print("5. Mark Task as Completed")
        print("6. Mark Task as Pending")
        print("7. Exit")
        print("-"*50)

    def get_user_input(self, prompt: str) -> str:
        """Get input from the user with basic error handling."""
        try:
            return input(prompt).strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nGoodbye!")
            sys.exit(0)

    def add_task_cli(self):
        """Handle adding a new task via CLI."""
        print("\n--- Add New Task ---")
        title = self.get_user_input("Enter task title: ")
        if not title:
            print("Task title cannot be empty!")
            return

        description = self.get_user_input("Enter task description (optional, press Enter to skip): ")

        try:
            task = self.manager.add_task(title, description)
            print(f"✓ Task added successfully! (ID: {task.id})")
        except ValueError as e:
            print(f"✗ Error: {e}")

    def list_tasks_cli(self):
        """Handle listing tasks via CLI."""
        print("\n--- Task List ---")
        tasks = self.manager.list_tasks()

        if not tasks:
            print("No tasks found.")
            return

        for task in tasks:
            status_symbol = "✓" if task.status == "completed" else "○"
            print(f"{status_symbol} [{task.id}] {task.title}")
            if task.description:
                print(f"    Description: {task.description}")
            print(f"    Status: {task.status.capitalize()}")
            print()

    def update_task_cli(self):
        """Handle updating a task via CLI."""
        print("\n--- Update Task ---")
        try:
            task_id = int(self.get_user_input("Enter task ID to update: "))
        except ValueError:
            print("Invalid task ID. Please enter a number.")
            return

        task = self.manager.get_task_by_id(task_id)
        if not task:
            print(f"No task found with ID {task_id}")
            return

        print(f"Current task: {task.title}")
        print(f"Current description: {task.description}")
        print(f"Current status: {task.status}")

        new_title = self.get_user_input(f"Enter new title (or press Enter to keep '{task.title}'): ")
        new_description = self.get_user_input(f"Enter new description (or press Enter to keep current): ")
        new_status = self.get_user_input(f"Enter new status (pending/completed or press Enter to keep '{task.status}'): ")

        # Use None to indicate no change if user pressed Enter
        title_update = new_title if new_title else None
        description_update = new_description if new_description != task.description else None
        status_update = new_status if new_status in ["pending", "completed"] else None

        try:
            if self.manager.update_task(task_id, title_update, description_update, status_update):
                print("✓ Task updated successfully!")
            else:
                print("✗ Failed to update task.")
        except ValueError as e:
            print(f"✗ Error: {e}")

    def delete_task_cli(self):
        """Handle deleting a task via CLI."""
        print("\n--- Delete Task ---")
        try:
            task_id = int(self.get_user_input("Enter task ID to delete: "))
        except ValueError:
            print("Invalid task ID. Please enter a number.")
            return

        if self.manager.delete_task(task_id):
            print(f"✓ Task with ID {task_id} deleted successfully!")
        else:
            print(f"✗ No task found with ID {task_id}")

    def mark_task_completed_cli(self):
        """Handle marking a task as completed."""
        print("\n--- Mark Task as Completed ---")
        try:
            task_id = int(self.get_user_input("Enter task ID to mark as completed: "))
        except ValueError:
            print("Invalid task ID. Please enter a number.")
            return

        if self.manager.update_task(task_id, status="completed"):
            print(f"✓ Task with ID {task_id} marked as completed!")
        else:
            print(f"✗ No task found with ID {task_id}")

    def mark_task_pending_cli(self):
        """Handle marking a task as pending."""
        print("\n--- Mark Task as Pending ---")
        try:
            task_id = int(self.get_user_input("Enter task ID to mark as pending: "))
        except ValueError:
            print("Invalid task ID. Please enter a number.")
            return

        if self.manager.update_task(task_id, status="pending"):
            print(f"✓ Task with ID {task_id} marked as pending!")
        else:
            print(f"✗ No task found with ID {task_id}")

    def run(self):
        """Run the CLI application."""
        print("Welcome to the Console Todo Application!")
        print("Type '7' or 'Ctrl+C' to exit the application.")

        while True:
            self.display_menu()
            choice = self.get_user_input("Choose an option (1-7): ")

            if choice == "1":
                self.add_task_cli()
            elif choice == "2":
                self.list_tasks_cli()
            elif choice == "3":
                self.update_task_cli()
            elif choice == "4":
                self.delete_task_cli()
            elif choice == "5":
                self.mark_task_completed_cli()
            elif choice == "6":
                self.mark_task_pending_cli()
            elif choice == "7":
                print("\nThank you for using the Console Todo Application!")
                break
            else:
                print("Invalid choice. Please select a number between 1-7.")

            # Pause to let user see the result before showing menu again
            input("\nPress Enter to continue...")


def main():
    """Main entry point for the application."""
    try:
        cli = TodoCLI()
        cli.run()
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()