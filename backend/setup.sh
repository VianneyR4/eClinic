#!/bin/bash

set -e

echo "🚀 Setting up eClinic Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install dependencies
echo "📦 Installing PHP dependencies..."
docker-compose exec -T app composer install --no-interaction

# Generate application key if not set
if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    echo "🔑 Generating application key..."
    docker-compose exec -T app php artisan key:generate
fi

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T app php artisan migrate --force

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Update .env file with your configuration"
echo "  2. Access the API at: http://localhost:8000"
echo "  3. Run tests with: make test"
echo "  4. View logs with: make logs"
echo ""
echo "📚 Useful commands:"
echo "  make help       - Show all available commands"
echo "  make test       - Run tests"
echo "  make shell      - Access container shell"
echo "  make logs       - View application logs"
echo ""

