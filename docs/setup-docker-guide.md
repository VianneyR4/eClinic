# eClinic Docker Setup Guide

Quick reference guide for Docker setup and operations in the eClinic project.

## What is Docker?

Docker packages applications and dependencies into lightweight, portable containers that run consistently across any machine. Think of it as a shipping container for software.

**Benefits:**
- ✅ One command setup: `docker-compose up`
- ✅ Same environment everywhere
- ✅ No manual installations
- ✅ Isolated from your system

## Project Architecture

```
User → Frontend (Next.js:3000) → Backend (Laravel:8000) 
          ↓                           ↓
      CouchDB:5984          PostgreSQL:5432 + Redis:6379
```

## Services Overview

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| **frontend** | Next.js (Node 18) | 3000 | User interface & RxDB |
| **backend-app** | Laravel (PHP 8.2 + Apache) | 8000 | API & web server |
| **postgres** | PostgreSQL 16 | 5432 | Primary database |
| **redis** | Redis 7 | 6379 | Cache & sessions |
| **couchdb** | CouchDB 3.3 | 5984 | Offline sync |

## Quick Setup

### 1. Initial Setup

```bash
# Clone and start
git clone <repository-url>
cd eFiche
docker-compose up -d --build

# Verify services
docker-compose ps
```

### 2. Backend Configuration

```bash
cd backend

# Run setup script
./setup.sh

# Or manually:
cp .env.example .env
docker-compose exec app composer install
docker-compose exec app php artisan key:generate
docker-compose exec app php artisan migrate
docker-compose exec app php artisan db:seed  # Optional
```

### 3. Verify Installation

```bash
# Check API health
curl http://localhost:8000/api/v1/health

# Access frontend
open http://localhost:3000

# Access CouchDB UI
open http://localhost:5984/_utils
```

## Essential Commands

### Service Management

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend-app

# View logs (follow)
docker-compose logs -f frontend

# Rebuild after changes
docker-compose up -d --build
```

### Database Operations

```bash
# Run migrations
docker-compose exec app php artisan migrate

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d eclinic

# Access Redis CLI
docker-compose exec redis redis-cli

# Backup database
docker-compose exec postgres pg_dump -U postgres eclinic > backup.sql
```

### Container Access

```bash
# Execute commands in container
docker-compose exec backend-app php artisan migrate

# Access container shell
docker-compose exec backend-app bash

# View container status
docker-compose ps
```

## Key Concepts

### Volumes (Data Persistence)
- **Named volumes**: Database data survives container deletion
- **Bind mounts**: Code changes reflect immediately

### Networks
- All containers on `eclinic-network`
- Communicate using service names (e.g., `DB_HOST=postgres`)

### Port Mapping
Format: `HOST_PORT:CONTAINER_PORT`
- `3000:3000` - Frontend
- `8000:80` - Backend API
- `5432:5432` - PostgreSQL

## Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml
ports:
  - "3001:3000"
```

### Database Connection Failed
```bash
# Check postgres status
docker-compose logs postgres

# Test connection
docker-compose exec backend-app ping postgres
```

### Code Changes Not Reflecting
```bash
# Restart service
docker-compose restart <service-name>

# Rebuild if needed
docker-compose build <service-name>
docker-compose up -d
```

### Disk Space Issues
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Clean everything
docker system prune -a --volumes
```

### Permission Issues
```bash
# Backend permissions
docker-compose exec backend-app chown -R www-data:www-data storage bootstrap/cache
```

## Connection Details

**PostgreSQL:**
- Host: `localhost` (host) / `postgres` (Docker)
- Port: 5432
- Database: `eclinic`
- User: `postgres`
- Password: `postgres`

**CouchDB:**
- URL: http://localhost:5984
- Username: `admin`
- Password: `admin`

## Resources

- [Docker Docs](https://docs.docker.com/)
- [Laravel Docs](https://laravel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [RxDB Docs](https://rxdb.info/)