# eClinic Backend API

Laravel RESTful API backend for the eClinic healthcare management system.

## Architecture

This backend follows a clean architecture pattern with:

- **Models**: Eloquent models representing database entities
- **Repositories**: Data access layer with interfaces for testability
- **Services**: Business logic layer
- **Controllers**: HTTP request/response handling
- **Middleware**: Authentication, validation, etc.

## Tech Stack

- Laravel 11
- PHP 8.2+
- PostgreSQL (default) / MySQL
- Docker & Docker Compose
- PHPUnit for testing

## Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── PatientController.php
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php
│   │   │   └── EnsureEmailIsVerified.php
│   │   └── Requests/
│   ├── Models/
│   │   └── Patient.php
│   ├── Repositories/
│   │   ├── Contracts/
│   │   │   └── PatientRepositoryInterface.php
│   │   └── PatientRepository.php
│   ├── Services/
│   │   └── PatientService.php
│   └── Providers/
│       └── AppServiceProvider.php
├── config/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── routes/
│   ├── api.php
│   └── web.php
├── tests/
│   ├── Feature/
│   │   └── PatientApiTest.php
│   └── Unit/
│       └── PatientServiceTest.php
├── docker/
│   ├── apache/
│   └── php/
├── Dockerfile
├── docker-compose.yml
└── composer.json
```

## Setup

### Prerequisites

- Docker & Docker Compose
- Composer (for local development)

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Build and start Docker containers:**
   ```bash
   docker-compose up -d --build
   ```

4. **Install PHP dependencies:**
   ```bash
   docker-compose exec app composer install
   ```

5. **Generate application key:**
   ```bash
   docker-compose exec app php artisan key:generate
   ```

6. **Run migrations:**
   ```bash
   docker-compose exec app php artisan migrate
   ```

7. **Run seeders (optional):**
   ```bash
   docker-compose exec app php artisan db:seed
   ```

## Running the Application

The API will be available at: `http://localhost:8000`

### API Endpoints

#### Patients

- `GET /api/v1/patients` - List all patients (paginated)
- `POST /api/v1/patients` - Create a new patient
- `GET /api/v1/patients/{id}` - Get a specific patient
- `PUT /api/v1/patients/{id}` - Update a patient
- `DELETE /api/v1/patients/{id}` - Delete a patient

#### Health Check

- `GET /api/v1/health` - API health check

### Example API Request

```bash
# Create a patient
curl -X POST http://localhost:8000/api/v1/patients \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "date_of_birth": "1990-01-01",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001"
    }
  }'
```

## Testing

### Run all tests:
```bash
docker-compose exec app php artisan test
```

### Run specific test suite:
```bash
# Unit tests
docker-compose exec app php artisan test --testsuite=Unit

# Feature tests
docker-compose exec app php artisan test --testsuite=Feature
```

### Run with coverage:
```bash
docker-compose exec app php artisan test --coverage
```

## Database

### Using PostgreSQL (default)

The `docker-compose.yml` is configured to use PostgreSQL by default. Connection details:

- Host: `postgres` (in Docker) or `localhost` (from host)
- Port: `5432`
- Database: `eclinic`
- Username: `postgres`
- Password: `postgres`

### Using MySQL

To switch to MySQL:

1. Update `docker-compose.yml` to use MySQL service
2. Update `.env` file:
   ```
   DB_CONNECTION=mysql
   DB_HOST=mysql
   DB_PORT=3306
   DB_DATABASE=eclinic
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   ```

## Development

### Accessing the container:
```bash
docker-compose exec app bash
```

### Running Artisan commands:
```bash
docker-compose exec app php artisan [command]
```

### Viewing logs:
```bash
docker-compose logs -f app
```

## Code Style

This project uses Laravel Pint for code formatting:

```bash
docker-compose exec app ./vendor/bin/pint
```

## License

MIT

