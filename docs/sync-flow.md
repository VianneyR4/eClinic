# Sync Flow Documentation

This document explains how the offline-first synchronization works in eClinic.

## Overview

eClinic uses a **local-first architecture** with multi-layer synchronization:

1. **Local Storage (RxDB)**: Primary data store in the browser
2. **Backend API (Laravel)**: Authoritative server-side database
3. **CouchDB**: Multi-device synchronization layer

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                    │
│  ┌───────────────────────────────────────────────────┐   │
│  │         RxDB (IndexedDB) - Local Storage          │   │
│  │  • Primary data store                             │   │
│  │  • Works offline                                  │   │
│  │  • Fast read/write                                │   │
│  └───────────────────────────────────────────────────┘   │
│                          ↕                               │
│  ┌───────────────────────────────────────────────────┐   │
│  │         CouchDB Replication                       │   │
│  │  • Bidirectional sync                             │   │
│  │  • Conflict resolution                            │   │
│  │  • Multi-device support                           │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    CouchDB Server                       │
│  • Central sync hub                                     │
│  • Conflict resolution                                  │
│  • Multi-device coordination                            │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│              Backend API (Laravel)                       │
│  ┌───────────────────────────────────────────────────┐   │
│  │         PostgreSQL - Authoritative DB             │   │
│  │  • Server-side truth                              │   │
│  │  • Business logic                                 │   │
│  │  • Data validation                                │   │
│  └───────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Creates/Updates Data (Online)

```
User Action
    ↓
Frontend (RxDB)
    ↓ (immediate local write)
RxDB Local Storage
    ↓ (background sync)
CouchDB Replication
    ↓
CouchDB Server
    ↓ (API sync)
Backend API (Laravel)
    ↓
PostgreSQL Database
```

**Benefits:**
- Instant UI feedback (data saved locally)
- Background sync doesn't block user
- Works even if API is temporarily unavailable

### 2. User Creates/Updates Data (Offline)

```
User Action
    ↓
Frontend (RxDB)
    ↓ (immediate local write)
RxDB Local Storage
    ↓ (queued for sync)
Sync Queue
    ↓ (when online)
CouchDB Replication
    ↓
CouchDB Server
    ↓ (API sync)
Backend API (Laravel)
    ↓
PostgreSQL Database
```

**Benefits:**
- Full functionality offline
- Automatic sync when connection restored
- No data loss

### 3. Data Sync from Server

```
PostgreSQL Database
    ↓
Backend API (Laravel)
    ↓ (API endpoint)
CouchDB Server
    ↓ (replication)
CouchDB Replication
    ↓
RxDB Local Storage
    ↓
Frontend UI Update
```

## Conflict Resolution

When the same record is modified in multiple places, conflicts are resolved using the `ConflictResolver` utility.

### Resolution Strategies

#### 1. Last-Write-Wins (Default)

The most recent update wins:

```php
// Backend: app/Utils/ConflictResolver.php
ConflictResolver::resolveLastWriteWins($localData, $remoteData);
```

**Use Case:** Simple scenarios where latest change is most relevant.

#### 2. Intelligent Merge

Merges changes intelligently, preserving both local and remote updates:

```php
ConflictResolver::resolveMerge($localData, $remoteData);
```

**Use Case:** When both changes should be preserved (e.g., different fields updated).

#### 3. Conflict Detection

Detects conflicts without resolving:

```php
$conflicts = ConflictResolver::detectConflicts($localData, $remoteData);
```

**Use Case:** When manual resolution is needed.

### Conflict Resolution Flow

```
Conflict Detected
    ↓
ConflictResolver::detectConflicts()
    ↓
Strategy Selection
    ├─ Last-Write-Wins
    ├─ Intelligent Merge
    └─ Manual Resolution
    ↓
Resolved Data
    ↓
Update Local Storage
    ↓
Sync to Server
```

## Sync States

The application tracks sync status:

### 1. Online
- **Status**: `synced`
- **Behavior**: Real-time bidirectional sync
- **Indicator**: Green sync icon

### 2. Offline
- **Status**: `pending`
- **Behavior**: Local writes queued
- **Indicator**: Yellow sync icon

### 3. Syncing
- **Status**: `syncing`
- **Behavior**: Actively syncing changes
- **Indicator**: Spinning sync icon

### 4. Error
- **Status**: `error`
- **Behavior**: Sync failed, retrying
- **Indicator**: Red sync icon

## Implementation Details

### Frontend Sync

**Location**: `Frontend/src/sync/replication.ts`

```typescript
// Setup replication
const replicationState = await setupReplication('patients', {
  url: process.env.NEXT_PUBLIC_COUCHDB_URL,
  database: process.env.NEXT_PUBLIC_COUCHDB_DB_NAME,
  auth: {
    username: 'admin',
    password: 'admin'
  }
});

// Monitor sync status
replicationState.active$.subscribe(active => {
  if (active) {
    console.log('Syncing...');
  }
});
```

### Backend Sync

**Location**: `backend/app/Http/Controllers/Api/PatientController.php`

The backend API provides RESTful endpoints that CouchDB can sync with:

- `GET /api/v1/patients` - Fetch all patients
- `POST /api/v1/patients` - Create patient
- `PUT /api/v1/patients/{id}` - Update patient
- `DELETE /api/v1/patients/{id}` - Delete patient

### Conflict Resolution

**Location**: `backend/app/Utils/ConflictResolver.php`

Used when syncing data from CouchDB to PostgreSQL:

```php
$resolved = ConflictResolver::resolveLastWriteWins(
    $couchdbData,
    $postgresData
);
```

## Best Practices

### 1. Optimistic Updates

Always update local storage immediately:

```typescript
// Good: Update UI immediately
await db.patients.insert(patientData);
// Then sync in background
```

### 2. Error Handling

Handle sync errors gracefully:

```typescript
try {
  await replicationState.run();
} catch (error) {
  // Queue for retry
  queueForRetry(data);
}
```

### 3. Conflict Prevention

Use timestamps and version numbers:

```typescript
{
  id: 'patient-123',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 5
}
```

### 4. Batch Operations

Batch multiple changes for efficiency:

```typescript
// Batch multiple updates
await db.patients.bulkUpsert(patients);
```

## Monitoring

### Sync Status Component

**Location**: `Frontend/src/components/SyncIndicator.tsx`

Displays current sync status to users.

### Logging

Sync events are logged for debugging:

```typescript
console.log('Sync started:', replicationState);
console.log('Sync completed:', stats);
console.log('Sync error:', error);
```

## Troubleshooting

### Sync Not Working

1. **Check CouchDB connection:**
   ```bash
   curl http://localhost:5984
   ```

2. **Verify credentials:**
   - Check `.env.local` in Frontend
   - Verify CouchDB admin credentials

3. **Check replication status:**
   ```typescript
   replicationState.active$.subscribe(console.log);
   ```

### Conflicts Not Resolving

1. **Check ConflictResolver:**
   ```php
   // Backend
   $conflicts = ConflictResolver::detectConflicts($local, $remote);
   ```

2. **Verify timestamps:**
   - Ensure `updated_at` fields are set correctly
   - Check timezone settings

### Data Loss

1. **Check local storage:**
   ```typescript
   const patients = await db.patients.find().exec();
   ```

2. **Verify sync queue:**
   - Check if changes are queued
   - Verify queue is processing

## Future Enhancements

- [ ] Real-time sync notifications
- [ ] Manual conflict resolution UI
- [ ] Sync analytics dashboard
- [ ] Selective sync (sync only specific collections)
- [ ] Compression for large datasets

