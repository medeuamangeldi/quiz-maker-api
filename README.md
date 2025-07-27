---

# QuizMaker Backend API

This repository contains the backend API for the QuizMaker application — a platform to create, manage, and take interactive quizzes with various question types.

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Architecture and Design](#architecture-and-design)
- [Known Issues and Limitations](#known-issues-and-limitations)
- [Future Improvements](#future-improvements)

---

## Project Description

The QuizMaker backend provides RESTful endpoints for quiz creation, retrieval, user management, and answer submission. It supports multiple question formats such as single choice, multiple choice, and text answers. Users authenticate via JWT and can submit quiz answers to receive evaluation results.

---

## Features

- User registration and login with JWT authentication.
- Create, update, and retrieve quizzes with complex questions.
- Submit quiz answers and receive detailed results and scoring.
- Secure endpoints protected by JWT authentication.
- Comprehensive Swagger API documentation for easy exploration.

---

## Technology Stack

- **NestJS** — Node.js framework for building scalable server-side applications.
- **TypeScript** — Typed JavaScript for improved maintainability.
- **Prisma ORM** — Type-safe database access.
- **PostgreSQL** — Relational database.
- **JWT** — Authentication tokens.
- **Swagger (OpenAPI)** — API documentation and exploration.

---

## Installation

1. Clone the repository:

```bash
git clone git@github.com:medeuamangeldi/quiz-maker-api.git
cd quiz-maker-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables:

Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/quizmaker
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. Run database migrations and generate Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

---

Here's an improved and complete **README snippet** for your Docker setup and usage, based on the Dockerfile and docker-compose.yaml you provided:

---

## Docker Setup and Usage

### Dockerfile

- Based on Node.js 24.4 Alpine image for a lightweight environment.
- Installs dependencies and Prisma CLI.
- Copies source and Prisma schema.
- Generates Prisma client.
- Builds the NestJS application.
- Starts the app with migration in production mode (adjust command as needed).

### docker-compose.yml

- **db** service uses PostgreSQL 15 with persistent volume.
- **app** service builds the NestJS app container.
- Environment variables for database connection and JWT secret are configured.
- Ports exposed: `3000` for app, `5432` for Postgres.
- `app` depends on `db` service.
- Runs with `start:dev` by default, change to `start:prod` for production.

---

### Usage commands (run from project root)

```bash
# Build and start app + database containers in detached mode
just start

# Stop and remove all containers, networks, volumes
just stop

# Start only the database container
just start-db

# Run database migrations during development
just migrate-dev
```

---

### Notes

- Make sure Docker and Docker Compose are installed on your system.
- Adjust environment variables in `docker-compose.yml` as needed (e.g., `JWT_SECRET`, database credentials).
- Use `start:prod` script in your Dockerfile and compose for production-ready builds.
- Data for Postgres is persisted in the Docker volume `postgres_data`.

---

## API Overview

### Auth Endpoints

- **POST /auth/login** — Login with username/email and password. Returns JWT token.

### User Endpoints

- **POST /users** — Create a new user.
- **GET /users/email/\:email** — Get user by email (JWT required).
- **GET /users/username/\:username** — Get user by username (JWT required).

### Test Endpoints

- **POST /tests** — Create a new test (JWT required).
- **GET /tests** — Get all tests.
- **GET /tests/\:id** — Get test by ID.
- **POST /tests/submit** — Submit answers for a test and receive scoring and detailed results (JWT required).

---

## Authentication

- Uses JWT-based authentication.
- Protected routes require a valid JWT token in the `Authorization` header: `Bearer <token>`.
- Tokens are issued on successful login.

---

## Architecture and Design

- RESTful API design with clear separation of concerns between controllers and services.
- Controllers handle routing and input validation.
- Services contain business logic and interact with Prisma ORM for database operations.
- DTOs (Data Transfer Objects) define expected input shapes and include Swagger decorators for documentation.
- Guards protect sensitive endpoints using JWT authentication.
- Swagger UI provides interactive API documentation and testing.

---

## Known Issues and Limitations

- No support yet for updating or deleting tests and users.
- No rate limiting or advanced security features implemented.
- Basic error handling; could be improved with more granular exceptions.
- User roles and permissions are not yet implemented.

---

## Future Improvements

- Add user roles and permissions (admin, user, etc.).
- Implement test update and delete functionality.
- Add pagination and filtering for test listing.
- Improve error handling and validation.
- Integrate real-time features for competitions or timed quizzes.
- Implement analytics and user progress tracking.

---

Feel free to contribute or open issues for bugs or feature requests!

---
