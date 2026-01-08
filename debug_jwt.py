#!/usr/bin/env python3
"""
Debug JWT token compatibility between backend and AI agent
"""

import requests
import jwt
import json

def debug_jwt():
    print("Debugging JWT token compatibility...")

    # Get a fresh token from backend
    print("\n1. Getting token from backend...")
    auth_response = requests.post(
        "http://localhost:8000/api/auth/token",
        data={"username": "admin", "password": "admin"}
    )

    if auth_response.status_code != 200:
        print("Could not get token from backend")
        return

    token = auth_response.json().get("access_token")
    print(f"Got token: {token}")

    # Decode the token to see its contents
    print("\n2. Decoding token...")
    try:
        # Backend uses "your-secret-key-change-in-production" and "HS256"
        decoded = jwt.decode(token, "your-secret-key-change-in-production", algorithms=["HS256"])
        print(f"Token decoded successfully by backend key: {decoded}")
    except Exception as e:
        print(f"Could not decode with backend key: {e}")

    try:
        # AI agent now uses the same key: "your-secret-key-change-in-production"
        decoded = jwt.decode(token, "your-secret-key-change-in-production", algorithms=["HS256"])
        print(f"Token also decodes with AI agent key: {decoded}")
    except Exception as e:
        print(f"Could not decode with AI agent key: {e}")

    # Test if AI agent can validate this token
    print("\n3. Testing AI agent validation...")
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {"message": "Hello", "user_id": "admin"}

    try:
        response = requests.post("http://localhost:8001/chat", json=payload, headers=headers)
        print(f"AI agent response: {response.status_code}")
        if response.status_code != 200:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_jwt()