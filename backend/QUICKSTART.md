# Quick Start Guide

## Prerequisites

- Docker & Docker Compose installed
- Git (optional)

## Setup Steps

### Option 1: Automated Setup (Recommended)

```bash
cd backend
./setup.sh
```

This script will:
- Create `.env` file from `.env.example`
- Build and start Docker containers
- Install PHP dependencies
- Generate application key
- Run database migrations

### Option 2: Manual Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Build and start containers:**
   ```bash
   docker-compose up -d --build
   ```

3. **Install dependencies:**
   ```bash
   docker-compose exec app composer install
   ```

4. **Generate application key:**
   ```bash
   docker-compose exec app php artisan key:generate
   ```

5. **Run migrations:**
   ```bash
   docker-compose exec app php artisan migrate
   ```

## Verify Installation

1. **Check API health:**
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

2. **Test patient endpoint:**
   ```bash
   curl http://localhost:8000/api/v1/patients
   ```

## Common Commands

Using Makefile (recommended):
```bash
make help          # Show all commands
make test          # Run tests
make logs          # View logs
make shell         # Access container
make migrate       # Run migrations
```

Or using Docker Compose directly:
```bash
docker-compose exec app php artisan [command]
docker-compose logs -f app
docker-compose exec app bash
```

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

- `GET /patients` - List patients
- `POST /patients` - Create patient
- `GET /patients/{id}` - Get patient
- `PUT /patients/{id}` - Update patient
- `DELETE /patients/{id}` - Delete patient
- `GET /health` - Health check

## Testing

```bash
# All tests
make test

# Unit tests only
make test-unit

# Feature tests only
make test-feature
```

## Troubleshooting

### Port already in use
If port 8000 is in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "8001:80"  # Change 8000 to 8001
```

### Database connection issues
1. Check if PostgreSQL container is running: `docker-compose ps`
2. Verify `.env` database credentials
3. Check logs: `docker-compose logs postgres`

### Permission issues
```bash
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
```

