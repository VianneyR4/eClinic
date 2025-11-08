# eClinic - Healthcare Management System

A modern, offline-first healthcare management system with real-time synchronization capabilities.

## 🌟 Features

- ✅ **Offline-First**: Works without internet connection
- ✅ **Auto-Sync**: Automatic data synchronization when online
- ✅ **Multi-Device**: Seamless sync across devices
- ✅ **Modern Stack**: Next.js, Laravel, PostgreSQL
- ✅ **One-Command Setup**: Docker handles everything
- ✅ **Conflict Resolution**: Intelligent merging of conflicting changes

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Docker Network                         │
│              (eclinic-network)                           │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   Frontend   │    │  Backend     │                   │
│  │  (Next.js)   │───▶│  (Laravel)   │                   │
│  │  Port 3000   │    │  Port 8000   │                   │
│  └──────────────┘    └──────────────┘                   │
│         │                    │                           │
│         │                    ▼                           │
│         │            ┌──────────────┐                    │
│         │            │   Apache     │                    │
│         │            │  (Web        │                    │
│         │            │   Server)    │                    │
│         │            └──────────────┘                    │
│         │                    │                           │
│         ▼                    ▼                           │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │   CouchDB    │    │  PostgreSQL  │                   │
│  │  Port 5984   │    │  Port 5432   │                   │
│  └──────────────┘    └──────────────┘                   │
│         │                    │                           │
│         └────────────────────┘                           │
│                    │                                     │
│                    ▼                                     │
│            ┌──────────────┐                             │
│            │    Redis     │                              │
│            │  Port 6379   │                              │
│            └──────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Browser
    ↓ (HTTP Request)
Frontend Container (Port 3000)
    ↓ (API Call)
Backend Apache (Port 8000)
    ↓ (Process PHP)
Backend Laravel Application
    ↓ (Database Query)
PostgreSQL Container
    ↓ (Response)
Backend Laravel
    ↓ (JSON Response)
Frontend Container
    ↓ (Render UI)
User Browser
```

### Tech Stack

**Frontend:**
- Next.js 14 (App Router) with TypeScript
- Tailwind CSS for styling
- RxDB (IndexedDB) for local offline storage
- CouchDB sync for multi-device synchronization

**Backend:**
- Laravel 11 (PHP 8.2+)
- PostgreSQL 16 (primary database)
- Redis 7 (caching & sessions)
- RESTful API architecture

**Infrastructure:**
- Docker & Docker Compose
- Apache (web server with mod_php)
- CouchDB (document database for sync)

## 🚀 Quick Start (2 Minutes) - Fully Automated!

### Prerequisites

**Required Software:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop) v20.10+ (includes Docker Compose)
- [Git](https://git-scm.com/downloads)

**Verify Installation:**
```bash
docker --version
docker-compose --version
git --version
```

### Installation Steps

**Step 1: Clone Repository**
```bash
git clone <repository-url>
cd eFiche
```

**Step 2: Start All Services (One Command!)**
```bash
docker-compose up -d --build
```

**That's it!** 🎉 Everything is configured automatically.

### What Happens Automatically

When you run `docker-compose up -d --build`, the system:

1. **Builds Docker Images**
   - Custom images: Frontend (Next.js), Backend (Laravel + Apache)
   - Base images: PostgreSQL, Redis, CouchDB

2. **Starts PostgreSQL** 
   - Waits for database to be healthy and ready

3. **Backend Auto-Configuration** (via entrypoint script)
   - ✅ Creates `.env` file from `.env.example`
   - 📦 Installs PHP/Composer dependencies
   - 🔑 Generates Laravel application key
   - 🗄️ Runs database migrations
   - 🔒 Sets proper file permissions
   - ⚡ Optimizes Laravel configuration

4. **Starts All Services**
   - Frontend, Backend (Apache), Redis, CouchDB
   - Creates Docker network and volumes
   - All containers connected and ready

**First run takes 2-3 minutes.** Subsequent starts are much faster.
```bash
 #Final output when everythings works well...
 ✔ backend-app                     Built                                                                                  0.0s 
 ✔ frontend                        Built                                                                                  0.0s 
 ✔ Network efiche_eclinic-network  Created                                                                                0.2s 
 ✔ Volume "efiche_redis_data"      Created                                                                                0.0s 
 ✔ Volume "efiche_couchdb_data"    Created                                                                                0.0s 
 ✔ Volume "efiche_postgres_data"   Created                                                                                0.0s 
 ✔ Container eclinic-postgres      Healthy                                                                              136.9s 
 ✔ Container eclinic-couchdb       Started                                                                               91.3s 
 ✔ Container eclinic-redis         Started                                                                               90.9s 
 ✔ Container eclinic-backend-app   Started                                                                              146.8s 
 ✔ Container eclinic-frontend      Started 
```

### Verify Installation

**Check Setup Logs:**
```bash
# Check setup logs:
docker-compose logs backend-app
```

**You should see:**
```
✅ Database is ready!
✅ .env file created.
📦 Installing PHP dependencies...
🔑 Generating application key...
🗄️ Running database migrations...
✅ Backend setup complete!
```

**Test Services:**
```bash
# Check all services are running
docker-compose ps

# Test API health
curl http://localhost:8000/api/v1/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00Z"}
```

**Access Applications:**
- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1
- **CouchDB Admin**: http://localhost:5984/_utils (admin/admin)

### Optional: Seed Sample Data

```bash
docker-compose exec backend-app php artisan db:seed
```

🎉 **Setup Complete!** Your application is running.

## 📁 Project Structure

```
eFiche/
├── Frontend/                    # Next.js Application
│   ├── src/
│   │   ├── app/                # Pages & routing (App Router)
│   │   │   ├── page.tsx        # Home page
│   │   │   ├── patients/       # Patient management pages
│   │   │   └── layout.tsx      # Root layout
│   │   ├── components/         # Reusable React components
│   │   │   ├── PatientList.tsx
│   │   │   ├── PatientForm.tsx
│   │   │   └── SyncStatus.tsx
│   │   ├── db/                 # RxDB Configuration
│   │   │   ├── database.ts     # Database setup
│   │   │   ├── schemas/        # RxDB schemas
│   │   │   └── collections/    # Collection definitions
│   │   ├── services/           # API Service Layer
│   │   │   ├── api.ts          # API client
│   │   │   └── patients.ts     # Patient API calls
│   │   ├── sync/               # Synchronization Logic
│   │   │   ├── syncManager.ts  # Sync orchestration
│   │   │   └── conflictResolver.ts
│   │   └── lib/                # Utilities
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── backend/                     # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # API Controllers
│   │   │   │   ├── PatientController.php
│   │   │   │   └── HealthController.php
│   │   │   ├── Middleware/     # Auth, CORS, etc.
│   │   │   └── Requests/       # Form validation
│   │   ├── Models/             # Eloquent Models
│   │   │   ├── Patient.php
│   │   │   └── User.php
│   │   ├── Services/           # Business Logic
│   │   │   └── PatientService.php
│   │   ├── Repositories/       # Data Access Layer
│   │   │   └── PatientRepository.php
│   │   └── Utils/              # Utilities
│   │       └── ConflictResolver.php
│   ├── database/
│   │   ├── migrations/         # Database schema
│   │   ├── seeders/            # Sample data
│   │   └── factories/          # Test data factories
│   ├── routes/
│   │   └── api.php             # API route definitions
│   ├── tests/                  # PHPUnit tests
│   │   ├── Unit/
│   │   └── Feature/
│   ├── config/                 # Configuration files
│   ├── docker/                 # Docker configs
│   │   └── entrypoint.sh       # Auto-setup script
│   ├── .env.example
│   ├── composer.json
│   └── Dockerfile
│
├── docs/                        # Documentation
│   ├── architecture-diagram.png
│   ├── setup-guide.md
│   └── sync-flow.md
│
├── docker-compose.yml          # Root orchestration
└── README.md                   # This file
```

## 🐳 Docker Services

### Services Overview

| Service | Technology | Port | Purpose | Container Name |
|---------|-----------|------|---------|----------------|
| **frontend** | Next.js 14 (Node 18) | 3000 | User interface & RxDB | eclinic-frontend |
| **backend** | Laravel/PHP 8.2 + Apache | 8000 | API server & business logic | eclinic-backend |
| **postgres** | PostgreSQL 16 Alpine | 5432 | Primary relational database | eclinic-postgres |
| **redis** | Redis 7 Alpine | 6379 | Cache & session storage | eclinic-redis |
| **couchdb** | CouchDB 3.3 | 5984 | Document DB for offline sync | eclinic-couchdb |

### Service Details

**Frontend (Next.js)**
- Serves React/Next.js application
- Handles UI rendering and user interactions
- Manages local storage via RxDB (IndexedDB)
- Connects to Backend API and CouchDB
- Hot reload enabled for development

**Backend App (Laravel + Apache)**
- Apache web server with mod_php
- Processes API requests directly
- Executes business logic
- Manages data validation
- Handles authentication & authorization
- Connects to PostgreSQL and Redis
- Serves static files

**PostgreSQL**
- Stores structured application data
- Handles complex queries and transactions
- Provides ACID compliance
- Data persisted to Docker volume

**Redis**
- Caches frequently accessed data
- Stores user sessions
- Manages job queues
- Improves application performance

**CouchDB**
- Enables offline-first functionality
- Handles multi-device synchronization
- Provides conflict resolution
- Supports bidirectional replication

## 💻 Daily Development

### Service Management

```bash
# Start all services (detached mode)
docker-compose up -d

# Start with logs visible
docker-compose up

# Stop all services (containers remain)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (CAUTION: deletes data)
docker-compose down -v

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Rebuild after Dockerfile changes
docker-compose up -d --build

# View running services
docker-compose ps

# View service logs (follow mode)
docker-compose logs -f frontend
docker-compose logs -f backend

# View last 100 log lines
docker-compose logs --tail=100 backend
```

### Backend Operations

```bash
# Access backend container shell
docker-compose exec backend bash

# Run Laravel commands
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan migrate:fresh
docker-compose exec backend php artisan migrate:rollback
docker-compose exec backend php artisan db:seed

# Clear caches
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:clear

# Run tests
docker-compose exec backend php artisan test
docker-compose exec backend php artisan test --filter=PatientTest

# Install/update dependencies
docker-compose exec backend composer install
docker-compose exec backend composer update

# Note: Initial setup (composer install, migrations, etc.) 
# runs automatically via entrypoint.sh when container starts
```

### Database Operations

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d eclinic

# Common SQL commands (once in psql):
\dt                    # List tables
\d patients           # Describe patients table
SELECT * FROM patients LIMIT 10;
\q                    # Quit

# Backup database
docker-compose exec postgres pg_dump -U postgres eclinic > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres eclinic < backup.sql

# Access Redis CLI
docker-compose exec redis redis-cli

# Common Redis commands (once in redis-cli):
KEYS *                # List all keys
GET key_name          # Get value
FLUSHALL             # Clear all data
exit                  # Quit
```

### Frontend Operations

```bash
# Access frontend container shell
docker-compose exec frontend sh

# Install new package
docker-compose exec frontend npm install <package-name>

# Run build
docker-compose exec frontend npm run build

# View frontend logs
docker-compose logs -f frontend
```

## 🚦 CI/CD & Project Management

This repo ships with GitHub Actions automations:
- Auto-create an Issue when a PR opens and link it to the PR
- Run tests on every PR (Frontend + Backend)
- Auto-deploy on merge to main via SSH + docker-compose
- Update your GitHub Project item Status to "Deployed" after successful deploy

Quick setup (GitHub → Settings → Secrets and variables → Actions):
- DOCKER_USERNAME, DOCKER_PASSWORD, REGISTRY
- DEPLOY_SERVER, DEPLOY_USER, DEPLOY_SSH_KEY, DEPLOY_PATH
- PROJECT_ID, STATUS_FIELD_ID, DEPLOYED_OPTION_ID (Projects V2)
- Optional: PAT_FOR_API (if GITHUB_TOKEN lacks GraphQL perms)

Workflows live in `.github/workflows/`:
- `pr-create-issue.yml`, `ci.yml`, `deploy.yml`, `issue-labeled-to-pr.yml`

See the detailed guide: [docs/ci-cd.md](docs/ci-cd.md)

### Code Changes Workflow

**Frontend Changes:**
- Edit files in `Frontend/src/`
- Changes auto-reload (hot module replacement)
- No restart needed

**Backend Changes:**
- Edit files in `backend/app/`
- Most changes require restart:
  ```bash
  docker-compose restart backend
  ```
- Config changes may need cache clear:
  ```bash
  docker-compose exec backend php artisan config:clear
  ```

## 📡 API Documentation

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### Health Check
```bash
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Patients

**List Patients**
```bash
GET /patients?page=1&per_page=20

Response:
{
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+250788123456",
      "date_of_birth": "1990-01-01",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

**Get Patient**
```bash
GET /patients/{id}

Response:
{
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    ...
  }
}
```

**Create Patient**
```bash
POST /patients
Content-Type: application/json

Body:
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+250788123456",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "address": "Kigali, Rwanda"
}

Response: 201 Created
{
  "data": {
    "id": 1,
    "first_name": "John",
    ...
  }
}
```

**Update Patient**
```bash
PUT /patients/{id}
Content-Type: application/json

Body:
{
  "first_name": "Jane",
  "email": "jane@example.com"
}

Response: 200 OK
```

**Delete Patient**
```bash
DELETE /patients/{id}

Response: 204 No Content
```

### API Examples (cURL)

```bash
# Health check
curl http://localhost:8000/api/v1/health

# List patients
curl http://localhost:8000/api/v1/patients

# Get specific patient
curl http://localhost:8000/api/v1/patients/1

# Create patient
curl -X POST http://localhost:8000/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+250788123456",
    "date_of_birth": "1990-01-01",
    "gender": "male"
  }'

# Update patient
curl -X PUT http://localhost:8000/api/v1/patients/1 \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Jane"}'

# Delete patient
curl -X DELETE http://localhost:8000/api/v1/patients/1
```

## 🔧 Configuration

### Connection Details

**PostgreSQL Database:**
- Host: `localhost` (from host machine) / `postgres` (from Docker containers)
- Port: `5432`
- Database: `eclinic`
- Username: `postgres`
- Password: `postgres`
- Connection String: `postgresql://postgres:postgres@localhost:5432/eclinic`

**Redis Cache:**
- Host: `localhost` (from host) / `redis` (from Docker)
- Port: `6379`
- No password (development only)

**CouchDB Sync:**
- URL: http://localhost:5984
- Admin URL: http://localhost:5984/_utils
- Username: `admin`
- Password: `admin`
- Database: `eclinic`

### Environment Variables

**Frontend** (`Frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_COUCHDB_URL=http://localhost:5984
NEXT_PUBLIC_COUCHDB_DB_NAME=eclinic
NEXT_PUBLIC_COUCHDB_USER=admin
NEXT_PUBLIC_COUCHDB_PASSWORD=admin
```

**Backend** (`backend/.env`):
```env
APP_NAME=eClinic
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=eclinic
DB_USERNAME=postgres
DB_PASSWORD=postgres

REDIS_HOST=redis
REDIS_PORT=6379

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

## 🔄 Offline-First Architecture

### How It Works

**1. Local Storage (RxDB)**
- All data stored in browser's IndexedDB
- Provides instant access to data
- Works completely offline
- Automatic reactive updates

**2. Online Detection**
- Application monitors internet connectivity
- Automatically switches between online/offline modes
- Queues changes made while offline

**3. Synchronization**
- When online, local changes push to server
- Server changes pull to local database
- Bidirectional sync via CouchDB replication
- Background sync continues while using app

**4. Conflict Resolution**
- Detects conflicting changes from multiple devices
- Uses "Last Write Wins" strategy with timestamps
- Preserves data integrity
- Logs conflicts for review

**5. Multi-Device Support**
- CouchDB handles data replication
- Changes sync across all devices
- Each device maintains local copy
- Works independently when offline

### Sync Flow

```
Device A (Offline)
    ↓ Makes changes
Local RxDB (IndexedDB)
    ↓ Detects online
Sync Manager
    ↓ Push changes
Backend API (Laravel)
    ↓ Save to DB
PostgreSQL + CouchDB
    ↓ Replicate
Other Devices
    ↓ Pull changes
Local RxDB
    ↓ Update UI
Device B (Online)
```

## 🐛 Troubleshooting

### Port Already in Use

**Problem**: `Error: bind: address already in use`

**Solution**:
```bash
# Find process using port (macOS/Linux)
lsof -i :3000
lsof -i :8000

# Find process using port (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill process (if safe)
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# OR change port in docker-compose.yml:
ports:
  - "3001:3000"  # Use different host port
  - "8001:80"    # Use different backend port
```

### Services Won't Start

**Problem**: Containers exit immediately or show errors

**Solution**:
```bash
# Check status
docker-compose ps

# View logs (especially backend for setup logs)
docker-compose logs backend
docker-compose logs postgres

# Backend logs show automatic setup progress:
# ✅ Database is ready!
# ✅ .env file created.
# 📦 Installing PHP dependencies...
# 🔑 Generating application key...
# 🗄️ Running database migrations...

# Check for errors
docker-compose logs --tail=50 backend

# Try rebuilding
docker-compose down
docker-compose up -d --build
```

### Database Connection Failed

**Problem**: Backend can't connect to PostgreSQL

**Solution**:
```bash
# Verify PostgreSQL is running and healthy
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Backend waits for PostgreSQL health check before starting
# Check if health check is passing
docker inspect eclinic-postgres | grep -A 5 Health

# Verify network connectivity
docker-compose exec backend ping postgres

# Check credentials in .env (auto-created by entrypoint.sh)
docker-compose exec backend cat .env | grep DB_

# Restart services (backend will auto-configure on restart)
docker-compose restart postgres
docker-compose restart backend
```

### Code Changes Not Reflecting

**Problem**: Changes in code don't appear in application

**Solution**:
```bash
# For frontend (should auto-reload)
docker-compose restart frontend

# For backend
docker-compose restart backend

# If still not working, rebuild
docker-compose build backend
docker-compose up -d

# Clear Laravel caches
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan view:clear
```

### Disk Space Issues

**Problem**: Docker using too much disk space

**Solution**:
```bash
# Check Docker disk usage
docker system df

# Remove unused images
docker image prune -a

# Remove unused volumes (CAUTION: deletes data)
docker volume prune

# Remove everything unused (CAUTION)
docker system prune -a --volumes

# Remove specific old images
docker images
docker rmi <image-id>
```

### Permission Issues

**Problem**: Permission denied errors in containers

**Solution**:
```bash
# Backend storage permissions
docker-compose exec backend chown -R www-data:www-data storage
docker-compose exec backend chown -R www-data:www-data bootstrap/cache
docker-compose exec backend chmod -R 775 storage bootstrap/cache

# Frontend permissions
docker-compose exec frontend chown -R node:node /app
```

### CouchDB Sync Not Working

**Problem**: Data not syncing between devices

**Solution**:
```bash
# Check CouchDB is running
docker-compose ps couchdb

# Access CouchDB admin UI
open http://localhost:5984/_utils

# Verify database exists
curl http://admin:admin@localhost:5984/eclinic

# Create database if missing
curl -X PUT http://admin:admin@localhost:5984/eclinic

# Check replication status in CouchDB UI
# Go to: Active Tasks section
```

### Clean Restart (Nuclear Option)

**When all else fails:**
```bash
# Stop everything
docker-compose down -v

# Remove all Docker artifacts
docker system prune -a --volumes

# Rebuild from scratch (auto-setup runs automatically)
docker-compose up -d --build

# Verify setup completed successfully
docker-compose logs backend

# You should see:
# ✅ Database is ready!
# ✅ .env file created.
# 📦 Installing PHP dependencies...
# 🔑 Generating application key...
# 🗄️ Running database migrations...
# ✅ Backend setup complete!
```

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
docker-compose exec backend php artisan test

# Run specific test file
docker-compose exec backend php artisan test tests/Feature/PatientTest.php

# Run with coverage
docker-compose exec backend php artisan test --coverage

# Run specific test method
docker-compose exec backend php artisan test --filter=testCanCreatePatient
```

### Frontend Tests

```bash
# Run tests
cd Frontend
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## 📚 Additional Resources

### Documentation
- [Docker Official Docs](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Laravel 11 Documentation](https://laravel.com/docs/11.x)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [RxDB Documentation](https://rxdb.info/)
- [CouchDB Documentation](https://docs.couchdb.org/)

### Learning Resources
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Laravel API Development](https://laravel.com/docs/11.x/eloquent-resources)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Offline-First Architecture](https://offlinefirst.org/)

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Development Guidelines
- Write tests for new features
- Follow PSR-12 coding standards (PHP)
- Use ESLint and Prettier (TypeScript/React)
- Update documentation
- Keep commits atomic and descriptive

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Need Help?

**Having issues?**
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review logs: `docker-compose logs -f`
3. Search existing [GitHub Issues](https://github.com/your-repo/issues)
4. Open a new issue with:
   - What you tried
   - Error messages
   - System info (OS, Docker version)

**For questions:**
- Open a GitHub Discussion
- Check documentation in `docs/` folder
- Review inline code comments

---

**Built with ❤️ for better healthcare management**

**Version**: 1.0.0  
**Last Updated**: November 2025