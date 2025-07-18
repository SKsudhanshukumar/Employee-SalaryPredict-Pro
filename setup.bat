@echo off
echo 🚀 Setting up SalaryPredict Pro...

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

:: Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

:: Check if port 5000 is available
netstat -an | find "5000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 5000 is already in use. Please stop the process or use a different port.
    echo To kill processes on port 5000, open Task Manager and end Node.js processes.
    pause
    exit /b 1
)

echo ✅ Port 5000 is available

:: Start the application
echo 🎉 Setup complete! Starting the application...
echo 📍 The app will be available at: http://localhost:5000
echo.
echo Starting development server...

call npm run dev

pause