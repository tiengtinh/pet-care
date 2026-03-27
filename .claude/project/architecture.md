# Architecture

## Project Overview

PetCare — a pet care management app for tracking pets, food inventory (with remaining days forecast), and health schedules (vaccines, deworming, water changes).

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 (custom tokens: `warm`, `nature`) |
| Routing | React Router DOM v7 (SPA) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| HTTP client | Axios (configured in `frontend/src/lib/api.ts`) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js + TypeScript + Express 5 |
| ORM | Prisma v5 + PostgreSQL |
| Validation | Zod (backend) |
| Container | Docker + Docker Compose |

## Repository Structure

```
vibe/
├── frontend/                    # React SPA (Vite)
│   └── src/
│       ├── components/          # Shared UI components
│       ├── pages/               # Page-level components (one per route)
│       ├── lib/
│       │   ├── api.ts           # All Axios API calls
│       │   ├── types.ts         # Shared TypeScript interfaces
│       │   └── formatting.ts    # Date/number formatting utilities
│       └── App.tsx              # Router + layout (sidebar + main)
├── backend/                     # Express API
│   ├── prisma/schema.prisma     # DB schema
│   └── src/
│       ├── server.ts            # App entry, PrismaClient export, route registration
│       └── modules/
│           ├── pet/             # Pet CRUD
│           ├── inventory/       # Food inventory with remaining days calculation
│           └── schedule/        # Health schedules
├── docker-compose.yml           # Postgres + backend + frontend
└── docs/test_plan/              # Test documentation
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/pets` | List all pets |
| POST | `/api/pets` | Create pet |
| GET | `/api/pets/:id` | Get pet with inventory + schedules |
| GET | `/api/inventory/pet/:petId` | Get inventory with remaining days forecast |
| POST | `/api/inventory` | Create inventory entry |
| PUT | `/api/inventory/:id` | Update inventory |
| GET | `/api/schedules/pet/:petId` | Get schedules for pet |
| GET | `/api/schedules/upcoming` | Upcoming health events |
| POST | `/api/schedules` | Create schedule |
| GET | `/api/health` | Health check |

## Environment Variables

**Backend** (`backend/.env`):
- `DATABASE_URL` — PostgreSQL connection string
- `PORT` — Server port (default: 3000)

**Frontend** (`.env`):
- `VITE_API_BASE_URL` — Backend URL (default: `http://localhost:3000/api`)
