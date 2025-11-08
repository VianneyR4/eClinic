# eClinic - Healthcare Management System

A modern Next.js dashboard application for healthcare management with offline support using RxDB and CouchDB replication.

## Project Structure

```
eFiche/
├── public/
│   └── index.html
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # React Components
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── PatientList.tsx
│   │   ├── PatientForm.tsx
│   │   └── SyncIndicator.tsx
│   ├── db/                     # RxDB Database
│   │   ├── rxdb.ts            # RxDB initialization (IndexedDB)
│   │   └── schemas/
│   │       └── patient.schema.ts
│   ├── services/               # API Services
│   │   └── api.ts             # Axios API client
│   ├── sync/                   # Sync Logic
│   │   ├── replication.ts     # RxDB ↔ CouchDB sync
│   │   └── syncStatus.ts      # Sync status monitoring
│   ├── hooks/                  # Custom React Hooks
│   │   └── useOnlineStatus.ts # Online/offline detection
│   ├── utils/                  # Utility Functions
│   │   └── helpers.ts
│   └── styles/                 # Global Styles
│       └── main.css
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Features

- **Login System** with email verification (dev mode shows verification codes)
- **Collapsible Sidebar** with clinic logo and navigation menu
- **Topbar** with search, AI Assistant, notifications, and profile dropdown
- **Offline Support** with RxDB (IndexedDB) for local data storage
- **CouchDB Replication** for data synchronization
- **Online/Offline Detection** with sync status indicators
- **Patient Management** with local-first architecture
- **Modern UI** with Tailwind CSS and iconsax-react icons

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- iconsax-react
- RxDB (IndexedDB)
- CouchDB (for replication)
- Axios

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_COUCHDB_URL=http://localhost:5984
NEXT_PUBLIC_COUCHDB_DB_NAME=eclinic
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Color Scheme

- Background: #F5F6F8
- Primary: #2E37A4
- White: #FFFFFF

## Database Setup

The application uses RxDB for local storage (IndexedDB) and can sync with CouchDB for multi-device synchronization.

### Initialize RxDB

```typescript
import { initRxDB } from '@/db/rxdb';

// Initialize database
const db = await initRxDB();
```

### Setup Replication

```typescript
import { setupReplication } from '@/sync/replication';

// Setup CouchDB replication
const replicationState = await setupReplication('patients', {
  url: 'http://localhost:5984',
  database: 'eclinic',
  auth: {
    username: 'admin',
    password: 'password'
  }
});
```

## Available Commands

- `npm run dev` - Start development server (hot reload)
- `npm run build` - Build for production
- `npm run start` - Start production server (after build)
- `npm run lint` - Run ESLint

## Project Structure Details

### Database (RxDB)
- **rxdb.ts**: Initializes RxDB with IndexedDB storage
- **schemas/**: Database schemas for collections (patients, etc.)

### Services
- **api.ts**: Axios-based API client for backend communication

### Sync
- **replication.ts**: Handles RxDB ↔ CouchDB bidirectional sync
- **syncStatus.ts**: Monitors sync status and online/offline state

### Components
- **PatientList.tsx**: Displays list of patients from local DB
- **PatientForm.tsx**: Form for creating/editing patients
- **SyncIndicator.tsx**: Shows sync status in UI

### Hooks
- **useOnlineStatus.ts**: Custom hook for detecting online/offline status

### Utils
- **helpers.ts**: Utility functions (date formatting, validation, etc.)
