import asyncio
import json
import requests
from datetime import datetime

def test_ai_agent():
    """Test the AI agent functionality"""
    print("Testing AI Agent Service...")

    # Test endpoint
    url = "http://localhost:8001/chat"

    # Sample JWT token (this would need to be a real token in practice)
    # For testing purposes, we'll use a mock token
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer mock_token_for_testing"
    }

    # Test messages
    test_messages = [
        "Create a task to buy groceries",
        "List my tasks",
        "Update task 1 to mark as complete",
        "Delete task 1"
    ]

    for i, message in enumerate(test_messages):
        print(f"\nTest {i+1}: {message}")

        payload = {
            "message": message,
            "user_id": "test_user_123",
            "session_id": f"test_session_{datetime.now().timestamp()}"
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            print(f"Status Code: {response.status_code}")

            if response.status_code == 200:
                result = response.json()
                print(f"Response: {result['response']}")
                print(f"Intent: {result['intent']}")
                if result['action']:
                    print(f"Action: {result['action']}")
            else:
                print(f"Error: {response.text}")

        except Exception as e:
            print(f"Exception: {str(e)}")

if __name__ == "__main__":
    test_ai_agent()