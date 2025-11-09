#!/bin/bash

set -e

echo "🚀 Starting eClinic Backend Setup..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h "${DB_HOST:-postgres}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME:-postgres}" > /dev/null 2>&1; do
    echo "   Database is unavailable - sleeping..."
    sleep 2
done
echo "✅ Database is ready!"

# Check if .env exists, if not create from .env.example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created."
    else
        echo "⚠️  .env.example not found, creating basic .env..."
        cat > .env << EOF
APP_NAME=eClinic
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE:-eclinic}
DB_USERNAME=${DB_USERNAME:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}
EOF
    fi
else
    echo "✅ .env file already exists."
fi

# Update .env with Docker environment variables if they exist
if [ ! -z "$DB_HOST" ]; then
    sed -i "s/DB_HOST=.*/DB_HOST=${DB_HOST}/" .env 2>/dev/null || true
fi
if [ ! -z "$DB_DATABASE" ]; then
    sed -i "s/DB_DATABASE=.*/DB_DATABASE=${DB_DATABASE}/" .env 2>/dev/null || true
fi
if [ ! -z "$DB_USERNAME" ]; then
    sed -i "s/DB_USERNAME=.*/DB_USERNAME=${DB_USERNAME}/" .env 2>/dev/null || true
fi
if [ ! -z "$DB_PASSWORD" ]; then
    sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env 2>/dev/null || true
fi

# Configure drivers: use database cache (for JWT blacklist), file sessions, sync queue
if grep -q "^CACHE_DRIVER=" .env 2>/dev/null; then
    sed -i "s/^CACHE_DRIVER=.*/CACHE_DRIVER=database/" .env 2>/dev/null || true
else
    echo "CACHE_DRIVER=database" >> .env
fi

if grep -q "^CACHE_STORE=" .env 2>/dev/null; then
    sed -i "s/^CACHE_STORE=.*/CACHE_STORE=database/" .env 2>/dev/null || true
else
    echo "CACHE_STORE=database" >> .env
fi

if grep -q "^SESSION_DRIVER=" .env 2>/dev/null; then
    sed -i "s/^SESSION_DRIVER=.*/SESSION_DRIVER=file/" .env 2>/dev/null || true
else
    echo "SESSION_DRIVER=file" >> .env
fi

if grep -q "^QUEUE_CONNECTION=" .env 2>/dev/null; then
    sed -i "s/^QUEUE_CONNECTION=.*/QUEUE_CONNECTION=sync/" .env 2>/dev/null || true
else
    echo "QUEUE_CONNECTION=sync" >> .env
fi

# Create necessary directories and set proper permissions
echo "🔐 Setting up directories and permissions..."
mkdir -p /var/www/html/storage/framework/{sessions,views,cache}
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

# Set proper permissions (if running as root)
if [ "$(id -u)" = "0" ]; then
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
else
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
fi

# Install Composer dependencies if vendor doesn't exist
if [ ! -d "vendor" ]; then
    echo "📦 Installing PHP dependencies (this may take a few minutes)..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
else
    echo "✅ Composer dependencies already installed."
fi

# Generate application key if not set
if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
else
    echo "✅ Application key already set."
fi

# Ensure database cache table migration exists before migrations
if [ ! -f database/migrations/*_create_cache_table.php ] && [ -z "$(ls database/migrations/*_create_cache_table.php 2>/dev/null)" ]; then
    echo "🧱 Publishing cache table migration..."
    php artisan cache:table --no-interaction || true
fi

# Run migrations
echo "🗄️  Running database migrations..."
php artisan migrate --force

# Run seeders (create admin user)
echo "🌱 Running database seeders..."
php artisan db:seed --force || true

# Clear and cache config
echo "🧹 Optimizing application..."
php artisan config:clear || true
php artisan cache:clear --quiet || true

# Ensure JWT is configured
if [ ! -f config/jwt.php ]; then
    echo "🔧 Publishing JWT config..."
    php artisan vendor:publish --provider="PHPOpenSourceSaver\\JWTAuth\\Providers\\LaravelServiceProvider" --force || true
fi

if ! grep -q "^JWT_SECRET=" .env 2>/dev/null || [ -z "$(grep -E "^JWT_SECRET=" .env | cut -d'=' -f2)" ]; then
    echo "🔑 Generating JWT secret..."
    php artisan jwt:secret --force || true
fi

echo ""
echo "✅ Backend setup complete!"
echo ""

# Execute the main command (apache2-foreground)
exec "$@"

