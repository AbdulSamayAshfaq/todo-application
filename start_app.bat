@echo off
echo Starting AI-Powered Todo Application...

REM Start backend server in a new window
echo Starting backend server on port 8001...
start "Backend Server" cmd /k "cd /d backend/app && python -m uvicorn main:app --host 127.0.0.1 --port 8001"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server in a new window
echo Starting frontend server on port 3000...
start "Frontend Server" cmd /k "cd /d frontend && npm run dev"

echo Servers started!
echo Backend: http://127.0.0.1:8001
echo Frontend: http://127.0.0.1:3000
echo Frontend Login: http://127.0.0.1:3000/login
echo.
echo The application will open in your browser shortly.
echo Login page: http://127.0.0.1:3000/login