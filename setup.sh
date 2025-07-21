#!/bin/bash

echo ""
echo "========================================"
echo "🚀 SalaryPredictorPro Setup (Unix/Linux)"
echo "========================================"
echo ""
echo "Starting automated setup process..."
echo ""

# Check if Node.js is installed
echo "[1/5] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    echo ""
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    echo "Please update Node.js from https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "[2/5] Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    echo "Please check your internet connection and try again."
    echo ""
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if port 5000 is available
echo "[3/5] Checking port availability..."
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5000 is already in use!"
    echo ""
    echo "To fix this:"
    echo "1. Find the process: lsof -i :5000"
    echo "2. Kill the process: lsof -ti:5000 | xargs kill -9"
    echo "3. Or use a different port"
    echo ""
    exit 1
fi

echo "✅ Port 5000 is available"
echo ""

# Check for training data
echo "[4/5] Checking training datasets..."
if ls server/*.csv 1> /dev/null 2>&1; then
    echo "✅ Training datasets found - ML models will be trained automatically"
else
    echo "⚠️  No CSV training files found in server directory"
    echo "The app will work but with limited prediction capabilities"
fi
echo ""

# Start the application
echo "[5/5] Starting SalaryPredictorPro..."
echo ""
echo "========================================"
echo "🎉 Setup Complete!"
echo "========================================"
echo ""
echo "📍 Application URL: http://localhost:5000"
echo "🤖 ML models will train automatically on startup"
echo "📊 Dashboard will load with real-time analytics"
echo ""
echo "Starting development server..."
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

echo ""
echo "Server stopped."