.PHONY: help install build up down restart logs test migrate seed shell

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies and setup the project
	docker-compose exec app composer install
	docker-compose exec app php artisan key:generate
	docker-compose exec app php artisan migrate

build: ## Build Docker containers
	docker-compose build

up: ## Start Docker containers
	docker-compose up -d

down: ## Stop Docker containers
	docker-compose down

restart: ## Restart Docker containers
	docker-compose restart

logs: ## View application logs
	docker-compose logs -f app

test: ## Run tests
	docker-compose exec app php artisan test

test-unit: ## Run unit tests
	docker-compose exec app php artisan test --testsuite=Unit

test-feature: ## Run feature tests
	docker-compose exec app php artisan test --testsuite=Feature

migrate: ## Run database migrations
	docker-compose exec app php artisan migrate

migrate-fresh: ## Fresh migration with seeding
	docker-compose exec app php artisan migrate:fresh --seed

seed: ## Run database seeders
	docker-compose exec app php artisan db:seed

shell: ## Access application container shell
	docker-compose exec app bash

psql: ## Access PostgreSQL database
	docker-compose exec postgres psql -U postgres -d eclinic

clear-cache: ## Clear application cache
	docker-compose exec app php artisan cache:clear
	docker-compose exec app php artisan config:clear
	docker-compose exec app php artisan route:clear
	docker-compose exec app php artisan view:clear

