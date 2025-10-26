#!/bin/bash

# Bridge Setup Script for CalHacks
echo "🌉 Bridge Setup Script"
echo "====================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
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

# Create environment file
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your Supabase credentials"
else
    echo "✅ Environment file already exists"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p temp
mkdir -p public/images

echo "✅ Directories created"

# Run build check
echo "🔨 Testing build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

echo "✅ Build successful"

echo ""
echo "🎉 Bridge setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run the database schema: supabase-schema.sql"
echo "3. Start the development server: npm run dev"
echo "4. Open http://localhost:3000"
echo ""
echo "Demo script: node demo-script.js"
echo "Pitch deck: PITCH_DECK.md"
echo ""
echo "Good luck at CalHacks! 🚀"
