# Social Coordination Platform

A full-stack application for creating and managing local social groups with safe, map-driven location selection.

## What this project does

This platform enables users to create, search, and join groups tied to real locations. It supports both:
- traditional group creation using an existing saved place, and
- dynamic place creation from map selections using external place IDs.

The feature is implemented with full backward compatibility, so existing clients continue to work unchanged while new clients can leverage map-based place creation.

## Key highlights

- ✅ **Dynamic place creation from map selection**
- ✅ **Smart duplicate prevention** using `externalPlaceId + source`
- ✅ **Zero breaking changes** for existing group creation flows
- ✅ **No database migration required**
- ✅ **Production-ready design** with full test coverage

## Why this matters

The project improves user experience by allowing users to choose any location from a map instead of only using pre-stored places. It also keeps the database clean by reusing existing place records when the same external location is selected multiple times.

## Core features

- Create groups using either:
  - an existing place ID (`placeId`), or
  - a new map-based place payload (`mapPlace`)
- Automatically create or reuse place records for map-selected locations
- Support for Google-like external place IDs and location metadata
- Preserve all legacy behavior for existing saved places
- Group management, user authentication, chat, and safety features across backend and frontend

## Technology stack

- Backend: Java + Spring Boot
- Persistence: MongoDB
- Frontend: React + Vite
- Auth: JWT-based security
- API design: REST endpoints
- Project structure:
  - `backend/`
  - `frontend/`
  - `Readmis/` for documentation and project reports

## Repository structure

- `backend/` — Spring Boot backend source code
- `frontend/` — React/Vite frontend app
- `Readmis/` — project documentation, architecture, summaries, and reports

## Important files

- `Readmis/EXECUTIVE_SUMMARY.md` — high-level completion and business impact
- `Readmis/ARCHITECTURE.md` — system design and component architecture
- `Readmis/IMPLEMENTATION_SUMMARY.md` — implementation details and rationale
- `Readmis/QUICK_REFERENCE.md` — usage examples, API references, and tests
- `Readmis/CHANGES.md` — changelog and file impact summary

## Run the project locally

### Backend

```bash
cd backend
./mvnw clean package
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Run tests

```bash
cd backend
./mvnw test
```

## What users should know

- This project is built for a real-world social coordination use case.
- The feature work is architected to avoid regressions and preserve existing behavior.
- Documentation is complete and organized for technical and non-technical audiences.
- The repository includes both backend and frontend implementations, showing full-stack capability.

## Documentation and review path

For a quick review, start with:
1. `Readmis/EXECUTIVE_SUMMARY.md`
2. `Readmis/ARCHITECTURE.md`
3. `Readmis/QUICK_REFERENCE.md`
4. `Readmis/CHANGES.md`

> This single README is intended to present the project clearly to recruiters and new reviewers, while the `Readmis/` folder contains the full technical documentation.
