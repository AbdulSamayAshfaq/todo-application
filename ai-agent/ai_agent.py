"""
ChatKit Agent for TODO Application

This file sets up an AI agent that connects to the TODO application backend
using the ChatKit backend pattern with proper Agents SDK integration.
"""

import os
import sys
from pathlib import Path
from agents import Agent ,  enable_verbose_stdout_logging , set_tracing_disabled


# Define the AI agent directory
AI_AGENT_DIR = Path(__file__).parent

# CRITICAL: Add the project directory to the path FIRST before any imports
PROJECT_DIR = AI_AGENT_DIR.parent  # ai-agent's parent = hackathon 2.0
PROJECT_DIR_STR = str(PROJECT_DIR)
if PROJECT_DIR_STR not in sys.path:
    sys.path.insert(0, PROJECT_DIR_STR)

# Now import after path is set
from agent_config.factory import create_model
from agents.mcp import MCPServerStdio
from agents.model_settings import ModelSettings

# Note: Tools are provided via MCP server, not imported directly
# The MCP server exposes these tools to the agent through the MCP protocol
# We don't need to define them here as they will be discovered from the MCP server
task_tools = []
enable_verbose_stdout_logging()
set_tracing_disabled(True)

# Enhanced agent instructions for TODO application
AGENT_INSTRUCTIONS = """
You are an intelligent task management assistant for the TODO app.

## Your Role

You help users manage their tasks through conversation. Task creation is handled via a simple form - just guide users to click the "Create task" button.

## Conversation Guidelines

### When user wants to CREATE a task:
Simply respond: "Please click the 'Create task' button to add a new task. It opens a simple form where you can enter all the details!"

### When user wants to LIST tasks:
Use the list_tasks tool to show their current tasks.

### When user wants to UPDATE a task:
Ask for the task ID and what they want to change, then use update_task tool.

### When user wants to DELETE a task:
Confirm with the user, then use delete_task tool.

### When user wants to SEARCH tasks:
Use search_tasks tool with the category.

### When user wants to MARK task as complete:
Ask for task ID, then use mark_task_completed tool.

## Your Tools

- **list_tasks**: Show all tasks
- **get_task**: Get details of a specific task
- **update_task**: Modify task fields
- **delete_task**: Remove a task
- **search_tasks**: Find tasks by category
- **mark_task_completed**: Mark task as done

## Response Style

- Be friendly and helpful
- Use emojis for visual appeal
- Keep responses concise
- Always guide users to use the "Create task" button for new tasks

## Important Notes

- DO NOT try to create tasks through conversation - always direct to the "Create task" button
- For all database operations, you need auth_token (automatically handled)

## Examples

User: "Create a task"
Bot: "Please click the 'Create task' button! It opens a simple form where you can enter the title, description, priority, due date, and category. Much easier than typing it all out! 🎉"

User: "Show me my tasks"
Bot: (calls list_tasks tool)

User: "Mark task 5 as complete"
Bot: "Got it! Marking task 5 as completed... ✅"
"""


class TodoAgent:
    """
    AI agent for TODO application task management.

    Uses the ChatKit backend pattern with proper Agents SDK integration.
    Supports multiple LLM providers including OpenAI and Google Gemini.
    """

    def __init__(self):
        """
        Initialize agent with model from factory and task tools.
        """
        import asyncio

        # Create model from factory
        self.model = create_model()

        # Get the path to the mcp_server script
        mcp_script_path = AI_AGENT_DIR / "mcp_server.py"

        # Create MCP server connection
        self.mcp_server = MCPServerStdio(
            name="todo-mcp-server",
            params={
                "command": "python",
                "args": [str(mcp_script_path)],
                "env": os.environ.copy(),
            },
            client_session_timeout_seconds=30.0,
        )

        # Connect to MCP server - handle both sync and async contexts
        try:
            # Check if there's already a running event loop
            loop = asyncio.get_running_loop()
            # If we're in an async context, schedule the connection
            self._connect_task = loop.create_task(self.mcp_server.connect())
        except RuntimeError:
            # No running loop, we can use run_until_complete
            asyncio.get_event_loop().run_until_complete(self.mcp_server.connect())

        # Create the agent with our specific configuration
        # Tools will be discovered from the connected MCP server
        self.agent = Agent(
            name="TodoAssistant",
            model=self.model,
            instructions=AGENT_INSTRUCTIONS,
            mcp_servers=[self.mcp_server],
            model_settings=ModelSettings(
                parallel_tool_calls=False,
            ),
        )

    def get_agent(self) -> Agent:
        """
        Get the configured TODO agent instance.

        Returns:
            Agent: Configured agent ready for task management conversations
        """
        return self.agent


def create_todo_agent():
    """
    Create and return a TODO management agent instance.
    """
    return TodoAgent()


# Example usage and testing
if __name__ == "__main__":
    # Create agent instance
    print("Creating TODO agent...")

    # Check for required environment variables
    if not os.getenv("GOOGLE_API_KEY") and not os.getenv("OPENAI_API_KEY") and not os.getenv("OPENROUTER_API_KEY"):
        print("Warning: No API key found. Please set GOOGLE_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY.")
        print("For OpenRouter: export OPENROUTER_API_KEY='your-api-key'")
        print("For Gemini: export GOOGLE_API_KEY='your-api-key'")
        print("For OpenAI: export OPENAI_API_KEY='your-api-key'")

    todo_agent_instance = create_todo_agent()
    agent = todo_agent_instance.get_agent()

    print("TODO agent created successfully!")
    print(f"Agent name: {agent.name}")
    print(f"Available tools: {[t.name for t in agent.tools]}")
    print("Ready to assist with task management!")
