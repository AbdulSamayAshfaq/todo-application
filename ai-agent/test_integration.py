"""
Test script to verify the enhanced AI agent integration
"""
import os
import sys

def test_imports():
    """Test that all required modules can be imported"""
    print("Testing module imports...")

    try:
        import openai
        print("[OK] OpenAI imported successfully")
    except ImportError as e:
        print(f"[ERROR] Failed to import Openai: {e}")

    try:
        import agents
        print("[OK] Agents imported successfully")
    except ImportError as e:
        print(f"[ERROR] Failed to import Agents: {e}")

    try:
        from agents.mcp import MCPServerStdio
        print("[OK] MCP Server Stdio imported successfully")
    except ImportError as e:
        print(f"[ERROR] Failed to import MCPServerStdio: {e}")

    try:
        from agent_config import create_model
        print("[OK] Agent config factory imported successfully")
    except ImportError as e:
        print(f"[ERROR] Failed to import agent config: {e}")

    try:
        from mcp_server import app
        print("[OK] MCP Server app imported successfully")
    except ImportError as e:
        print(f"[ERROR] Failed to import MCP Server app: {e}")

    try:
        from openai_agent_integration import TodoAgent
        print("[OK] OpenAI Agent integration imported successfully")
    except ImportError as e:
        print(f"[ERROR] Failed to import OpenAI Agent integration: {e}")

def test_environment():
    """Test that required environment variables are set"""
    print("\nTesting environment variables...")

    backend_url = os.getenv("TODO_BACKEND_URL", os.getenv("BACKEND_URL", "http://localhost:8000"))
    print(f"[OK] TODO_BACKEND_URL: {backend_url}")

    has_openai_key = bool(os.getenv("OPENAI_API_KEY"))
    has_google_key = bool(os.getenv("GOOGLE_API_KEY"))

    if has_openai_key:
        print("[OK] OPENAI_API_KEY is set")
    else:
        print("[WARN] OPENAI_API_KEY not set")

    if has_google_key:
        print("[OK] GOOGLE_API_KEY is set")
    else:
        print("[WARN] GOOGLE_API_KEY not set")

    if not (has_openai_key or has_google_key):
        print("[WARN] No API key is set - agent will not function properly")

def test_agent_creation():
    """Test creating the agent"""
    print("\nTesting agent creation...")

    try:
        from openai_agent_integration import create_todo_agent

        # Try creating with different providers
        if os.getenv("GOOGLE_API_KEY"):
            agent_instance = create_todo_agent(provider="gemini")
            print("[OK] Gemini agent created successfully")
        elif os.getenv("OPENAI_API_KEY"):
            agent_instance = create_todo_agent(provider="openai")
            print("[OK] OpenAI agent created successfully")
        else:
            print("[WARN] No API key available, skipping agent creation test")
            return

        agent = agent_instance.get_agent()
        print(f"[OK] Agent name: {agent.name}")
        print("[OK] Agent creation test passed")

    except Exception as e:
        print(f"[ERROR] Agent creation failed: {e}")

if __name__ == "__main__":
    print("Testing Enhanced AI Agent Integration")
    print("="*50)

    test_imports()
    test_environment()
    test_agent_creation()

    print("\n" + "="*50)
    print("Testing complete!")