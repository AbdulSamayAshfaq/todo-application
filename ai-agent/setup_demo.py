"""
Setup Demo for Enhanced AI Chatbot Integration

This script demonstrates the complete setup of the enhanced AI chatbot
with MCP server integration for the TODO application.
"""

import os
import subprocess
import sys
from pathlib import Path


def check_dependencies():
    """Check if required dependencies are installed"""
    print("Checking dependencies...")

    required_packages = [
        "fastapi",
        "uvicorn",
        "requests",
        "agents",
        "openai",
        "python-jose[cryptography]"
    ]

    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace("[cryptography]", "").replace("-", "_").split("[")[0])
        except ImportError:
            missing_packages.append(package)

    if missing_packages:
        print(f"Missing packages: {missing_packages}")
        print("Install with: pip install -r requirements-enhanced.txt")
        return False

    print("All dependencies satisfied!")
    return True


def setup_environment():
    """Set up environment variables for the demo"""
    print("\nSetting up environment variables...")

    # Set default backend URL if not already set
    if not os.getenv("TODO_BACKEND_URL"):
        # Only set default if not already set
        if not os.getenv("TODO_BACKEND_URL"):
            os.environ["TODO_BACKEND_URL"] = "http://localhost:8000"
            print("Set TODO_BACKEND_URL=http://localhost:8000 (default)")
        else:
            print(f"Using existing TODO_BACKEND_URL={os.getenv('TODO_BACKEND_URL')}")

    # Show current environment
    backend_url = os.getenv("TODO_BACKEND_URL")
    print(f"Using backend URL: {backend_url}")

    # Check for API keys
    has_gemini_key = bool(os.getenv("GOOGLE_API_KEY"))
    has_openai_key = bool(os.getenv("OPENAI_API_KEY"))

    if not has_gemini_key and not has_openai_key:
        print("\n⚠️  Warning: No API keys found!")
        print("Please set either:")
        print("  - GOOGLE_API_KEY for Google Gemini")
        print("  - OPENAI_API_KEY for OpenAI")
        print("Without an API key, the AI agent won't function properly.")
    else:
        if has_gemini_key:
            print("✅ Found GOOGLE_API_KEY")
        if has_openai_key:
            print("✅ Found OPENAI_API_KEY")


def demonstrate_mcp_server():
    """Demonstrate MCP server functionality"""
    print("\n" + "="*60)
    print("MCP SERVER FUNCTIONALITY DEMONSTRATION")
    print("="*60)

    print("""
The MCP (Model Context Protocol) server provides secure tools for the AI agent:

🔧 Available Tools:
├── create_task() - Create new tasks with title, description, priority, etc.
├── create_task_with_details() - Create tasks with all possible attributes
├── list_tasks() - Retrieve all user tasks
├── get_task(task_id) - Get specific task details
├── update_task(task_id, ...) - Update task properties
├── update_task_priority(task_id, priority) - Change task priority
├── mark_task_completed(task_id) - Mark tasks as completed
├── search_tasks_by_category(category) - Find tasks by category
└── delete_task(task_id) - Remove tasks permanently

🔒 Security Features:
├── All operations require valid authentication tokens
├── Input validation and sanitization
├── Rate limiting to prevent abuse
└── Audit logging for compliance
    """)


def demonstrate_agent_integration():
    """Demonstrate agent integration"""
    print("\n" + "="*60)
    print("AGENT INTEGRATION DEMONSTRATION")
    print("="*60)

    print("""
The AI agent integrates seamlessly with the TODO application:

🤖 Agent Capabilities:
├── Natural language task creation
├── Smart task categorization
├── Priority management
├── Due date handling
├── Task completion tracking
└── Context-aware conversations

💬 Example Interactions:
├── "Create a high priority task to buy groceries"
├── "Show me my work tasks"
├── "Mark task #5 as completed"
├── "Update the meeting task to tomorrow"
└── "What are my urgent tasks?"

🔄 Integration Flow:
   User Input → NLP Processing → Tool Selection → MCP Server → Backend → Response
    """)


def show_project_structure():
    """Display the enhanced project structure"""
    print("\n" + "="*60)
    print("PROJECT STRUCTURE")
    print("="*60)

    structure = """
ai-agent/
├── ai_agent.py                 # Enhanced main AI agent with expanded tools
├── mcp_server.py              # MCP server connecting to TODO backend
├── openai_agent_integration.py # OpenAI Agent SDK integration
├── agent_config/              # Agent configuration modules
│   ├── __init__.py
│   └── factory.py             # Model factory for different providers
├── agent_integration_template.py # Template for new agent integrations
├── mcp_template.py            # MCP server template
├── requirements-enhanced.txt  # Enhanced dependencies
├── README-enhanced.md         # Enhanced documentation
└── setup_demo.py              # This setup demonstration
    """

    print(structure)


def run_tests():
    """Run basic functionality tests"""
    print("\n" + "="*60)
    print("RUNNING BASIC TESTS")
    print("="*60)

    try:
        # Test importing the main components
        print("✓ Testing MCP server import...")
        from mcp_server import app as mcp_app
        print(f"  MCP server ready: {mcp_app.name}")

        print("✓ Testing agent configuration...")
        from agent_config import create_model
        print("  Agent config module loaded")

        print("✓ Testing agent integration...")
        from openai_agent_integration import TodoAgent
        print("  Agent integration module loaded")

        print("\n🎉 All basic tests passed!")
        return True

    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        return False


def main():
    """Main demo function"""
    print("🚀 Enhanced AI Chatbot Integration Setup")
    print("   Connecting AI Agent to TODO Application via MCP Server")

    # Run setup checks
    deps_ok = check_dependencies()
    setup_environment()

    if deps_ok:
        # Run demonstrations
        demonstrate_mcp_server()
        demonstrate_agent_integration()
        show_project_structure()

        # Run tests
        tests_passed = run_tests()

        print("\n" + "="*60)
        print("SETUP COMPLETE")
        print("="*60)

        if tests_passed:
            print("✅ Enhanced AI Chatbot integration is ready!")
            print("\nNext steps:")
            print("1. Ensure your TODO backend is running on:", os.getenv("TODO_BACKEND_URL"))
            print("2. Set your preferred API key (GOOGLE_API_KEY or OPENAI_API_KEY)")
            print("3. Start the MCP server: python mcp_server.py")
            print("4. Run the AI agent integration")
        else:
            print("❌ Some tests failed. Please check the setup.")
    else:
        print("\n❌ Missing dependencies. Please install required packages first.")

    print("\nFor detailed documentation, see: README-enhanced.md")


if __name__ == "__main__":
    main()