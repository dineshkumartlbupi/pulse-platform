#!/bin/bash

echo "🚀 Setting up Pulse Platform..."

echo "📦 Installing Client dependencies..."
cd client && npm install
cd ..

echo "📦 Installing Server dependencies..."
cd server && npm install
cd ..

echo "✅ Setup complete! You can now run the project."
