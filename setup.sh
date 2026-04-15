#!/bin/bash

# Resume Parser - Quick Start Script
# This script sets up and runs the application

set -e  # Exit on error

echo "================================================"
echo "Resume Parser - Quick Start"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14 or higher."
    exit 1
fi

echo "✅ Node.js check passed ($(node -v))"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm check passed ($(npm -v))"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create database directory if it doesn't exist
echo "📁 Creating database directory..."
mkdir -p database

echo ""
echo "================================================"
echo "✅ Setup complete!"
echo "================================================"
echo ""
echo "Start the server with:"
echo "  npm start"
echo ""
echo "For development (auto-reload):"
echo "  npm run dev"
echo ""
echo "Run tests:"
echo "  npm test"
echo ""
echo "Run demo:"
echo "  node demo.js"
echo ""
echo "Access the API:"
echo "  http://localhost:3000"
echo ""
