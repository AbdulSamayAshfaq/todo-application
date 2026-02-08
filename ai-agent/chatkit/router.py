"""
ChatKit Router for TODO Application

This module handles routing of ChatKit events to appropriate handlers
using the Agents SDK with direct tool integration.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the ai-agent directory to the path and load .env
AI_AGENT_DIR = Path(__file__).parent.parent  # ai-agent
PROJECT_DIR = AI_AGENT_DIR.parent  # hackathon 2.0
ENV_FILE = AI_AGENT_DIR / '.env'

# CRITICAL: Add project directory to path first before any imports
PROJECT_DIR_STR = str(PROJECT_DIR)
if PROJECT_DIR_STR not in sys.path:
    sys.path.insert(0, PROJECT_DIR_STR)

print(f"Loading .env from: {ENV_FILE}")
print(f"Env file exists: {ENV_FILE.exists()}")

# Load environment variables from .env file
load_dotenv(str(ENV_FILE))

# Debug: Print env vars (masked)
google_key = os.getenv("GOOGLE_API_KEY")
print(f"GOOGLE_API_KEY loaded: {google_key[:10] if google_key else 'None'}..." if google_key else "GOOGLE_API_KEY: None")
llm_provider = os.getenv("LLM_PROVIDER")
print(f"LLM_PROVIDER: {llm_provider}")

from agents import Runner

# Import the TodoAgent directly from ai_agent.py
from ai_agent import TodoAgent, AGENT_INSTRUCTIONS

# Global variable for the agent
todo_agent = None


async def initialize_agent():
    """
    Initialize the agent. This should be called during app startup.
    """
    global todo_agent

    # Re-check API key at runtime (in case env changed)
    runtime_api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("OPENROUTER_API_KEY")
    print(f"Runtime API key check: {'Found' if runtime_api_key else 'Not found'}")

    # Create the agent with direct tool integration
    if runtime_api_key:
        try:
            # Wait for the MCP server connection if it's a scheduled task
            todo_agent = TodoAgent()
            
            # If the agent has a scheduled connection task, await it
            if hasattr(todo_agent, '_connect_task'):
                await todo_agent._connect_task
            
            print("AI Agent created successfully!")
        except Exception as e:
            print(f"Error creating agent: {e}")
            import traceback
            traceback.print_exc()
            todo_agent = None
    else:
        print("No API key found. Running in demo mode.")


async def handle_event(event: dict) -> dict:
    """
    Route incoming ChatKit events to appropriate handlers.
    """
    event_type = event.get("type")

    if event_type == "user_message":
        return await handle_user_message(event)

    if event_type == "action_invoked":
        return await handle_action(event)

    return {
        "type": "message",
        "content": "Unsupported event type.",
        "done": True,
    }


async def handle_user_message(event: dict) -> dict:
    """
    Handle user messages sent through ChatKit.
    """
    message = event.get("message", {})
    text = message.get("content", "")
    auth_token = event.get("auth_token", "")

    if todo_agent is None:
        return {
            "type": "message",
            "content": f"🤖 Demo Mode: Received '{text}'. Set GOOGLE_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY in ai-agent/.env to enable AI.",
            "done": True,
        }

    # Prepare context with auth_token for tool calls
    context = {"auth_token": auth_token}

    # Use async run with input context
    agent_instance = todo_agent.get_agent()
    result = await Runner.run(starting_agent=agent_instance, input=text, context=context)

    return {
        "type": "message",
        "content": result.final_output,
        "done": True,
    }


async def handle_action(event: dict) -> dict:
    """
    Handle actions invoked from ChatKit UI.
    """
    action_name = event.get("action", {}).get("name", "unknown")
    return {
        "type": "message",
        "content": f"Received action: {action_name}. No handler implemented yet.",
        "done": True,
    }
