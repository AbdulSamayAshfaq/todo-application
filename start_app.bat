@echo off
echo Starting AI-Powered Todo Application...

REM Start AI agent server with ChatKit API in a new window
echo Starting AI agent server with ChatKit API on port 8001...
start "AI Agent Server" cmd /k "cd /d ai-agent && python -m uvicorn chatkit_api:app --host 127.0.0.1 --port 8001"

REM Wait a moment for AI agent to start
timeout /t 3 /nobreak >nul

REM Start backend server in a new window
echo Starting backend server on port 8000...
start "Backend Server" cmd /k "cd /d backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server in a new window
echo Starting frontend server on port 3000...
start "Frontend Server" cmd /k "cd /d frontend && npm run dev"

echo Servers started!
echo AI Agent/ChatKit: http://127.0.0.1:8001
echo Backend: http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:3000
echo Frontend Login: http://127.0.0.1:3000/login
echo.
echo The application will open in your browser shortly.
echo Login page: http://127.0.0.1:3000/login