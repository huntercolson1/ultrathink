#!/bin/bash

# Local development server starter script
# This script helps you run your Jekyll site locally

set -e

echo "🚀 Starting Jekyll Local Server..."
echo ""

# Check if Docker is available and running
if command -v docker &> /dev/null; then
    if docker ps &> /dev/null; then
        echo "✅ Docker is running!"
        echo "📦 Starting Jekyll with Docker..."
        echo ""
        docker run -it --rm \
          -v "$PWD":/srv/jekyll \
          -p 4000:4000 \
          jekyll/jekyll:latest \
          jekyll serve --host 0.0.0.0 --force_polling
        exit 0
    else
        echo "⚠️  Docker is installed but not running."
        echo ""
        echo "Please start Docker Desktop, then run this script again."
        echo "Or run: open -a Docker"
        echo ""
        exit 1
    fi
else
    echo "❌ Docker not found."
    echo ""
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    echo ""
    exit 1
fi

