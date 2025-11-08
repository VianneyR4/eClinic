# eClinic – Rural Healthcare Management System

**eClinic** is an offline-first healthcare platform designed for rural clinics.  
It improves patient flow, reduces nurse workload, and provides instant access to medical knowledge — even with poor connectivity.

---

## Overview

### Core Features
- Offline-first patient registration and consultation  
- Automatic background synchronization when online  
- Real-time queue management and triage dashboard  
- Consultation assistant with prefilled patient data  
- Integrated micro-learning and clinical guidelines (Knowledge Hub)  
- SMS notifications for patient queue updates  
- One-command Docker deployment  

---

## System Architecture

```
Frontend (Next.js / RxDB)  ⇄  Backend (Laravel / REST API)
       │                           │
       │                           ├── PostgreSQL (relational data)
       │                           ├── CouchDB (offline sync)
       │                           └── Redis (cache / sessions)
       └──────────── Docker Network ────────────────────────────────
```

**Frontend**
- Next.js 14 (App Router), TypeScript, Tailwind CSS  
- RxDB + IndexedDB for local storage  
- CouchDB replication for multi-device offline sync  

**Backend**
- Laravel 11 (API first, modular architecture)  
- PostgreSQL 16 for persistence  
- Redis 7 for caching and queue management  

**Infrastructure**
- Docker Compose orchestration  
- Apache + mod_php for Laravel runtime  
- GitHub Actions CI/CD pipeline  

---

## Quick Start

**Prerequisites**
- Docker Desktop 20.10+  
- Git  

**Setup**
```bash
git clone <repository-url>
cd eClinic
docker-compose up -d --build
```

When the setup completes, visit:
- Frontend: http://localhost:3000  
- Backend API: http://localhost:8000/api/v1  
- CouchDB Admin: http://localhost:5984/_utils (admin/admin)

**Run Tests**
```bash
docker-compose exec backend php artisan test
```

---

## Project Structure

```
eClinic/
├── frontend/          # Next.js app (UI, RxDB, sync)
├── backend/           # Laravel API (controllers, services, tests)
├── docs/              # Architecture & CI/CD docs
├── docker-compose.yml
└── README.md
```

---

## Key Workflows

### Offline Sync
1. Data stored locally in RxDB (IndexedDB).  
2. When internet returns, RxDB replicates with CouchDB.  
3. CouchDB syncs changes to the backend (PostgreSQL).  

### CI/CD
- GitHub Actions runs tests on pull requests.  
- Docker images built automatically.  
- Deployment triggered on merge to `main`.  
- Project management integration through GitHub Projects / Linear.  

---

## API Reference

**Base URL**  
`http://localhost:8000/api/v1`

| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/health` | GET | Health check |
| `/patients` | GET/POST | List / create patients |
| `/patients/{id}` | GET/PUT/DELETE | Retrieve, update, delete patient |

Example:
```bash
curl http://localhost:8000/api/v1/patients
```

---

## Configuration

**Frontend (.env.local)**  
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_COUCHDB_URL=http://localhost:5984
NEXT_PUBLIC_COUCHDB_DB_NAME=eclinic
```

**Backend (.env)**  
```
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_DATABASE=eclinic
DB_USERNAME=postgres
DB_PASSWORD=postgres
REDIS_HOST=redis
```

---

## Development Commands

```bash
# Start services
docker-compose up -d

# Stop
docker-compose down

# Backend shell
docker-compose exec backend bash

# Run Laravel migrations
docker-compose exec backend php artisan migrate

# Restart specific container
docker-compose restart frontend
```

---

## Testing & Quality

- Backend : PHPUnit feature + unit tests  
- Frontend : Jest / React Testing Library  
- Linting : ESLint + Prettier  
- Code style : PSR-12 (PHP)  

---

## License

MIT License – see `LICENSE` for details.

---

**eClinic**  
Simplifying healthcare for rural clinics — offline, reliable, and human-centered.
