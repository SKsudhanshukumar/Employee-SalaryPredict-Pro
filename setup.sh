#!/bin/bash

echo "🚀 Setting up SalaryPredict Pro..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    echo "Please update Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if port 5000 is available
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null; then
    echo "⚠️  Port 5000 is already in use. Please stop the process or use a different port."
    echo "To kill the process: lsof -ti:5000 | xargs kill -9"
    exit 1
fi

echo "✅ Port 5000 is available"

# Start the application
echo "🎉 Setup complete! Starting the application..."
echo "📍 The app will be available at: http://localhost:5000"
echo ""
echo "Starting development server..."

npm run dev