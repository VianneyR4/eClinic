# Architecture Diagram

> **Note**: This file should be replaced with an actual PNG image file named `architecture-diagram.png`

## Diagram Requirements

The architecture diagram should visually represent:

### 1. Frontend Layer
- **Next.js Application** (Browser)
  - React Components
  - RxDB (IndexedDB) - Local Storage
  - Sync Components

### 2. Sync Layer
- **CouchDB Replication**
  - Bidirectional sync arrows
  - Conflict resolution process

### 3. Backend Layer
- **Laravel API**
  - RESTful endpoints
  - Business logic
- **PostgreSQL Database**
  - Authoritative data store
- **Redis Cache**
  - Session storage
  - Caching layer

### 4. Data Flow
- User interactions → Frontend
- Frontend ↔ CouchDB (sync)
- CouchDB ↔ Backend API
- Backend API ↔ PostgreSQL

### 5. Network Boundaries
- Docker containers
- Service communication
- External access points

## Recommended Tools

- [Draw.io](https://app.diagrams.net/) - Free, web-based
- [Lucidchart](https://www.lucidchart.com/) - Professional diagrams
- [Miro](https://miro.com/) - Collaborative whiteboard
- [Excalidraw](https://excalidraw.com/) - Hand-drawn style

## Example Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (User)                        │
│  ┌───────────────────────────────────────────────────┐   │
│  │         Next.js Frontend (Port 3000)              │   │
│  │  ┌─────────────────────────────────────────────┐ │   │
│  │  │  RxDB (IndexedDB) - Local Storage          │ │   │
│  │  └─────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                    CouchDB (Port 5984)                   │
│  • Multi-device sync hub                                 │
│  • Conflict resolution                                    │
└─────────────────────────────────────────────────────────┘
                          ↕ REST API
┌─────────────────────────────────────────────────────────┐
│              Laravel Backend (Port 8000)                 │
│  ┌───────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Port 5432) - Authoritative DB        │   │
│  └───────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────┐   │
│  │  Redis (Port 6379) - Cache                        │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Export Instructions

1. Create the diagram using your preferred tool
2. Export as PNG format
3. Save as `architecture-diagram.png` in the `docs/` folder
4. Recommended size: 1200x800px or larger
5. Use clear, readable fonts and colors

