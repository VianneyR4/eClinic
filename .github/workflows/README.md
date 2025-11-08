# GitHub Actions CI/CD

This directory contains the CI/CD workflow for the eClinic project.

## Workflow: CI/CD Pipeline

### Triggers
- **Pull Requests** to `main` or `develop` branches
- **Pushes** to `main` branch

### Jobs

#### 1. Build & Test
Runs on every PR and push to main:
- **Frontend:**
  - Installs Node.js 18
  - Installs dependencies
  - Runs linter
  - Runs tests with coverage
  - Builds the application

- **Backend:**
  - Sets up PHP 8.2 with required extensions
  - Installs Composer dependencies
  - Creates test database
  - Runs migrations
  - Runs PHPUnit tests

#### 2. Docker Deploy
Runs only on pushes to `main` branch:
- Builds Docker images for Frontend and Backend
- Pushes images to Docker Hub
- Tags images with `latest` and commit SHA

## Required Secrets

Add these secrets to your GitHub repository:

1. `DOCKER_USERNAME` - Your Docker Hub username
2. `DOCKER_PASSWORD` - Your Docker Hub password or access token

## Setup Instructions

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add the required secrets
4. The workflow will run automatically on PRs and pushes

