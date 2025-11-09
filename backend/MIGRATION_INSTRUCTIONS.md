# Migration Instructions

## Problem: Doctors/Queue endpoints returning errors

If you're getting errors like "Failed to fetch doctors" or "Failed to fetch queue items", it's likely because the database migrations haven't been run yet.

## Solution: Run Migrations

### Option 1: Using Docker Compose (Recommended)

```bash
cd backend
docker-compose exec app php artisan migrate
```

### Option 2: Using Make (if available)

```bash
cd backend
make migrate
```

### Option 3: Manual Docker Command

```bash
docker-compose exec app php artisan migrate --force
```

## Verify Migrations

To check if migrations have run:

```bash
docker-compose exec app php artisan migrate:status
```

You should see all migrations listed, including:
- `2024_01_01_000001_create_patients_table`
- `2024_01_01_000002_create_sessions_table`
- `2024_01_01_000003_create_doctors_table` ⬅️ **This one is needed for doctors endpoint**
- `2024_01_01_000004_create_queue_items_table` ⬅️ **This one is needed for queue endpoint**
- `2024_01_01_000005_add_id_number_and_photo_to_patients_table`

## Check Database Tables

To verify tables exist:

```bash
docker-compose exec postgres psql -U postgres -d eclinic -c "\dt"
```

You should see:
- `patients`
- `doctors`
- `queue_items`
- `sessions`

## Troubleshooting

### If migrations fail:

1. Check database connection:
   ```bash
   docker-compose exec app php artisan db:show
   ```

2. Check logs:
   ```bash
   docker-compose logs app
   ```

3. Clear cache and retry:
   ```bash
   docker-compose exec app php artisan config:clear
   docker-compose exec app php artisan cache:clear
   docker-compose exec app php artisan migrate
   ```

### If table already exists error:

If you get "table already exists" errors, you can:

1. Rollback and re-run:
   ```bash
   docker-compose exec app php artisan migrate:rollback
   docker-compose exec app php artisan migrate
   ```

2. Or fresh migration (⚠️ **WARNING: This will delete all data**):
   ```bash
   docker-compose exec app php artisan migrate:fresh
   ```

## After Running Migrations

Once migrations are complete, test the endpoints:

```bash
# Test doctors endpoint
curl http://localhost:8000/api/v1/doctors

# Test queue endpoint
curl http://localhost:8000/api/v1/queue

# Test search endpoint
curl "http://localhost:8000/api/v1/search?q=john"
```

You should now get successful responses instead of error messages.

