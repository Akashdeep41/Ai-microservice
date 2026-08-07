# DocuCast — Local development

Quick steps to run the frontend and backend locally for development.

Backend (API gateway) — permissive dev profile:

PowerShell:
```powershell
cd api-gateway
.\mvnw.cmd -Dspring-boot.run.profiles=dev -DskipTests spring-boot:run
```

This starts the gateway with the `dev` profile which keeps security permissive for local testing.

Frontend:

1. Copy `frontend/.env.example` to `frontend/.env` and edit if needed.
2. Start the Vite dev server:

```powershell
cd frontend
npm install
npm run dev
```

Environment flags:
- `VITE_USE_KEYCLOAK=false` (default in `.env.example`) uses a local mock Keycloak client so the UI won't block waiting for Keycloak during development.
