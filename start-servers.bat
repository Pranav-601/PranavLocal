@echo off
echo Starting PranavSend Servers...
echo.

REM Start backend in a new window
echo Starting Backend Server (Flask)...
start "PranavSend Backend" cmd /k "cd /d C:\Users\Pranav\pranavlocal\backend && python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
echo Starting Frontend Server (Vite)...
start "PranavSend Frontend" cmd /k "cd /d C:\Users\Pranav\pranavlocal\frontend && node C:\Users\Pranav\Downloads\node-v22.17.1-win-x64\node-v22.17.1-win-x64\node_modules\npm\bin\npm-cli.js run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8080
echo Network Frontend: http://192.168.29.150:8080
echo.
echo Press any key to exit...
pause >nul
