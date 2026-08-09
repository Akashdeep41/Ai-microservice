# DocuCast

DocuCast is a local-first document processing workspace composed of a Spring Boot API gateway, a React/Vite frontend, and supporting services for authentication, PostgreSQL with pgvector, and local object storage/message queue emulation.

## Project structure

- `api-gateway/` — Spring Boot backend that exposes document upload and AI-related endpoints.
- `frontend/` — React frontend built with Vite and Tailwind CSS.
- `docker-compose.yml` — Runs PostgreSQL, Keycloak, LocalStack, the API gateway, and the frontend together.
- `keycloak-realm.json` — Realm configuration for local authentication.

## Prerequisites

- Docker Desktop
- Java 17+
- Node.js 18+ and npm
- Optional: Maven (the wrapper is included)

## Quick start with Docker Compose

From the repository root, run:

```powershell
docker compose up --build
```

This starts:

- API gateway on http://localhost:8081
- Frontend on http://localhost:5173
- Keycloak on http://localhost:8080
- PostgreSQL on localhost:5432
- LocalStack on localhost:4566

## Run the backend locally

```powershell
cd api-gateway
./mvnw.cmd -Dspring-boot.run.profiles=dev -DskipTests spring-boot:run
```

The `dev` profile enables a more permissive local security setup for development.

## Run the frontend locally

```powershell
cd frontend
npm install
npm run dev
```

If you want to bypass Keycloak during local UI development, set:

```env
VITE_USE_KEYCLOAK=false
```

## Environment notes

The compose file uses these defaults:

- `OPENAI_API_KEY` — optional OpenAI API key for model access
- `OPENAI_MODEL` — defaults to `gpt-4o-mini`
- `SPRING_PROFILES_ACTIVE=dev` for the API gateway container

## Development tips

- Use Docker Compose when you want the full stack running together.
- Use the local backend/frontend commands when you are iterating on one side of the app.
- If you change the Docker configuration, rebuild with `docker compose up --build`.

