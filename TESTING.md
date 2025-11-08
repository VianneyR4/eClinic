# Testing Guide

This document explains how to run tests for both Frontend and Backend.

## Backend Tests (Laravel)

### Running Tests

```bash
cd backend

# Run all tests
docker-compose exec backend-app php artisan test

# Or locally (if PHP is installed)
php artisan test

# Run specific test suite
php artisan test --testsuite=Unit
php artisan test --testsuite=Feature

# Run specific test file
php artisan test tests/Feature/PatientApiTest.php

# Run with coverage
php artisan test --coverage
```

### Test Structure

- **Unit Tests**: `tests/Unit/` - Test individual classes and methods
- **Feature Tests**: `tests/Feature/` - Test API endpoints and integration

### Available Tests

- `PatientApiTest` - API endpoint tests (CRUD operations)
- `PatientServiceTest` - Service layer unit tests
- `HealthCheckTest` - Health check endpoint test

### Test Database

- **Local**: Uses SQLite in-memory database (configured in `phpunit.xml`)
- **CI**: Uses PostgreSQL (configured via environment variables)

## Frontend Tests (Next.js + Jest)

### Running Tests

```bash
cd Frontend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test PatientList.test.tsx
```

### Test Structure

- **Component Tests**: `src/components/__tests__/` - Test React components
- **Service Tests**: `src/services/__tests__/` - Test API services

### Available Tests

- `PatientList.test.tsx` - Component rendering test
- `api.test.ts` - API service test

### Test Configuration

- **Jest**: Configured in `jest.config.js`
- **React Testing Library**: For component testing
- **jsdom**: Browser environment simulation

## CI/CD Testing

Tests run automatically on:
- Pull Requests to `main` or `develop`
- Pushes to `main` branch

See `.github/workflows/ci-cd.yml` for CI configuration.

## Writing New Tests

### Backend Test Example

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;

class MyFeatureTest extends TestCase
{
    public function test_something(): void
    {
        $response = $this->getJson('/api/v1/endpoint');
        $response->assertStatus(200);
    }
}
```

### Frontend Test Example

```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Best Practices

1. **Write tests first** (TDD) when possible
2. **Test edge cases** and error scenarios
3. **Keep tests isolated** - each test should be independent
4. **Use descriptive test names** - `test_can_create_patient_with_valid_data`
5. **Mock external dependencies** - API calls, database, etc.
6. **Maintain good coverage** - Aim for >80% code coverage

