# Complete Setup Guide

## Prerequisites

- Docker Desktop 20.10+
- Git

## Quick Setup

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd eFiche
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file (if not exists)
cp .env.example .env

# Add email configuration to .env
cat >> .env << EOF

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=vianneyrwicha2017@gmail.com
MAIL_PASSWORD=tgeqhuwujwlqdwaz
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=vianneyrwicha2017@gmail.com
MAIL_FROM_NAME="eClinic"
EOF

# Start Docker containers
docker-compose up -d --build

# Wait for services to start
sleep 10

# Run migrations and seeders
docker-compose exec app php artisan migrate --force
docker-compose exec app php artisan db:seed --force
```

### 3. Frontend Setup

```bash
cd ../Frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start development server
npm run dev
```

## Verify Installation

### 1. Check Backend API

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Check Frontend

Open browser: http://localhost:3000

### 3. Login

- Email: `admin@gmail.com`
- Password: `admin123456`

## Default Admin User

- **Email**: admin@gmail.com
- **Password**: admin123456
- **Status**: Email verified (can login directly)

## API Endpoints

### Authentication

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123456"}'

# Response includes token - save it for authenticated requests
```

### Protected Endpoints

```bash
# Get patients (requires token)
curl -X GET http://localhost:8000/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create patient
curl -X POST http://localhost:8000/api/v1/patients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890"
  }'
```

## Troubleshooting

### Backend Issues

1. **Database connection failed**
   ```bash
   # Check PostgreSQL is running
   docker-compose ps postgres
   
   # Check logs
   docker-compose logs postgres
   ```

2. **Migrations failed**
   ```bash
   # Reset database
   docker-compose exec app php artisan migrate:fresh --seed
   ```

3. **Email not sending**
   - Check Gmail app password is correct
   - Verify 2-Step Verification is enabled
   - Check logs: `docker-compose logs app`

### Frontend Issues

1. **API connection failed**
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Verify backend is running on port 8000
   - Check browser console for errors

2. **Authentication errors**
   - Clear localStorage: `localStorage.clear()`
   - Check token is being sent in requests
   - Verify backend authentication is working

## Running Tests

### Backend Tests

```bash
cd backend
docker-compose exec app php artisan test
```

### Frontend Tests

```bash
cd Frontend
npm test
```

## Production Deployment

1. Update environment variables
2. Set `APP_DEBUG=false`
3. Generate application key: `php artisan key:generate`
4. Run migrations: `php artisan migrate --force`
5. Run seeders: `php artisan db:seed --force`
6. Optimize: `php artisan config:cache && php artisan route:cache`

## Support

For issues, check:
1. Logs: `backend/storage/logs/laravel.log`
2. Docker logs: `docker-compose logs`
3. Browser console for frontend errors
4. Network tab for API errors

