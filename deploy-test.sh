#!/bin/bash

# Deployment Test Script
echo "🚀 Testing Expense Tracker Pro Deployment"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found"
    exit 1
fi

echo "✅ dist directory exists"

# Check if index.html exists
if [ ! -f "dist/index.html" ]; then
    echo "❌ index.html not found in dist"
    exit 1
fi

echo "✅ index.html exists in dist"

# Display build statistics
echo "📊 Build Statistics:"
echo "===================="
echo "Total files in dist: $(find dist -type f | wc -l)"
echo "CSS files: $(find dist -name "*.css" | wc -l)"
echo "JS files: $(find dist -name "*.js" | wc -l)"
echo "Build size: $(du -sh dist | cut -f1)"

echo ""
echo "🎉 Deployment test completed successfully!"
echo "Your app is ready to deploy to Vercel!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect GitHub to Vercel"
echo "3. Deploy with one click!"
echo ""
echo "Or use Vercel CLI:"
echo "  npm i -g vercel"
echo "  vercel login"
echo "  vercel"
