@echo off
echo.
echo ========================================
echo 🚀 SalaryPredictorPro Setup (Windows)
echo ========================================
echo.
echo Starting automated setup process...
echo.

:: Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=1 delims=v" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detected: %NODE_VERSION%

:: Install dependencies
echo.
echo [2/5] Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    echo Please check your internet connection and try again.
    echo.
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully
echo.

:: Check if port 5000 is available
echo [3/5] Checking port availability...
netstat -an | find "5000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo ⚠️ Port 5000 is already in use!
    echo.
    echo To fix this:
    echo 1. Open Task Manager (Ctrl+Shift+Esc)
    echo 2. Find and end any Node.js processes
    echo 3. Or run: netstat -ano ^| findstr :5000
    echo 4. Then: taskkill /PID ^<PID_NUMBER^> /F
    echo.
    pause
    exit /b 1
)

echo ✅ Port 5000 is available
echo.

:: Check for training data
echo [4/5] Checking training datasets...
if exist "server\*.csv" (
    echo ✅ Training datasets found - ML models will be trained automatically
) else (
    echo ⚠️ No CSV training files found in server directory
    echo The app will work but with limited prediction capabilities
)
echo.

:: Start the application
echo [5/5] Starting SalaryPredictorPro...
echo.
echo ========================================
echo 🎉 Setup Complete!
echo ========================================
echo.
echo 📍 Application URL: http://localhost:5000
echo 🤖 ML models will train automatically on startup
echo 📊 Dashboard will load with real-time analytics
echo.
echo Starting development server...
echo Press Ctrl+C to stop the server
echo.

call npm run dev

echo.
echo Server stopped. Press any key to exit...
pause >nul