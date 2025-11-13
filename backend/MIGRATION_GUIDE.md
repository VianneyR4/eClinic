# Migration Guide for Docker

This guide explains how to create and run Laravel migrations in your Docker environment.

## Prerequisites

Make sure your Docker containers are running:
```bash
docker compose up -d
```

## Creating a Migration

### 1. Create a New Migration File

**Option A: Using docker compose (Recommended)**
```bash
docker compose exec backend-app php artisan make:migration create_example_table
```

**Option B: Using container name**
```bash
docker compose exec eclinic-backend-app php artisan make:migration create_example_table
```

**Option C: Using Makefile (if available)**
```bash
cd backend
make shell
php artisan make:migration create_example_table
exit
```

### 2. Common Migration Types

**Create a new table:**
```bash
docker compose exec backend-app php artisan make:migration create_products_table
```

**Add columns to existing table:**
```bash
docker compose exec backend-app php artisan make:migration add_status_to_orders_table --table=orders
```

**Modify existing table:**
```bash
docker compose exec backend-app php artisan make:migration modify_users_table --table=users
```

**Create a pivot table:**
```bash
docker compose exec backend-app php artisan make:migration create_order_product_table
```

## Running Migrations

### 1. Run All Pending Migrations

**Option A: Using docker compose**
```bash
docker compose exec backend-app php artisan migrate
```

**Option B: Using Makefile**
```bash
cd backend
make migrate
```

### 2. Run Migrations with Force (for production)
```bash
docker compose exec backend-app php artisan migrate --force
```

### 3. Rollback Last Migration
```bash
docker compose exec backend-app php artisan migrate:rollback
```

### 4. Rollback All Migrations
```bash
docker compose exec backend-app php artisan migrate:reset
```

### 5. Rollback and Re-run All Migrations
```bash
docker compose exec backend-app php artisan migrate:refresh
```

### 6. Fresh Migration (Drops all tables and re-runs migrations)
```bash
docker compose exec backend-app php artisan migrate:fresh
```

### 7. Fresh Migration with Seeding
```bash
docker compose exec backend-app php artisan migrate:fresh --seed
```

**Or using Makefile:**
```bash
cd backend
make migrate-fresh
```

## Checking Migration Status

### View Migration Status
```bash
docker compose exec backend-app php artisan migrate:status
```

This shows which migrations have been run and which are pending.

## Common Workflow Examples

### Example 1: Create and Run a New Migration

```bash
# 1. Create the migration
docker compose exec backend-app php artisan make:migration create_notifications_table

# 2. Edit the migration file in: backend/database/migrations/YYYY_MM_DD_HHMMSS_create_notifications_table.php

# 3. Run the migration
docker compose exec backend-app php artisan migrate
```

### Example 2: Add a Column to Existing Table

```bash
# 1. Create migration to add column
docker compose exec backend-app php artisan make:migration add_phone_to_patients_table --table=patients

# 2. Edit the migration file and add your column

# 3. Run the migration
docker compose exec backend-app php artisan migrate
```

### Example 3: Modify Existing Column

```bash
# 1. Create migration
docker compose exec backend-app php artisan make:migration modify_email_in_users_table --table=users

# 2. Edit migration to change column type/size

# 3. Run migration
docker compose exec backend-app php artisan migrate
```

## Troubleshooting

### If you get "Container not found" error:
Make sure containers are running:
```bash
docker compose ps
```

If not running, start them:
```bash
docker compose up -d
```

### If you get database connection errors:
Check that the postgres container is healthy:
```bash
docker compose ps postgres
```

### Access the container shell for debugging:
```bash
docker compose exec backend-app bash
```

Then you can run artisan commands directly:
```bash
php artisan migrate:status
php artisan migrate
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `docker compose exec backend-app php artisan make:migration create_table_name` | Create new migration |
| `docker compose exec backend-app php artisan migrate` | Run pending migrations |
| `docker compose exec backend-app php artisan migrate:rollback` | Rollback last migration |
| `docker compose exec backend-app php artisan migrate:refresh` | Rollback and re-run all |
| `docker compose exec backend-app php artisan migrate:fresh` | Drop all tables and re-run |
| `docker compose exec backend-app php artisan migrate:status` | Check migration status |

## Notes

- Migration files are located in: `backend/database/migrations/`
- Always test migrations in development before running in production
- Use `migrate:fresh` carefully as it drops all tables
- The `--force` flag is required for migrations in production environment

