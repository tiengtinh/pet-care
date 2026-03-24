# PetCare

PetCare is built for pet owners and currently supports dogs, cats, and fish. It helps manage pet profiles, food inventory, and upcoming care schedules in one place.

> PetCare dành cho chủ thú cưng, hiện hỗ trợ chó, mèo và cá. Ứng dụng giúp quản lý thú cưng, thức ăn và các lịch chăm sóc sắp tới.
> Trong phạm vi MVP, 4 tính năng cốt lõi: quản lý danh sách thú cưng, quản lý kho thức ăn theo từng thú cưng, quản lý lịch chăm sóc/sự kiện sắp tới, và dashboard tổng quan để theo dõi nhanh tình trạng chăm sóc.
> Làm sao để hệ thống hoạt động hiệu quả cho cả cá, mèo và chó, vì mỗi loại thú cưng có đặc điểm và nhu cầu chăm sóc khác nhau. Điều này đòi hỏi phải thiết kế dữ liệu và logic đủ linh hoạt để xử lý tính đa hình ngay từ giai đoạn MVP.

The current UI copy is primarily in Vietnamese, while the codebase and supporting docs are a mix of English and Vietnamese.

It combines:

- A React + Vite frontend for the dashboard and CRUD flows
- An Express + Prisma backend for the API
- PostgreSQL for persistence
- Docker Compose for local orchestration

The current product flow is simple:

1. Create pets
2. Add food inventory records per pet
3. Add care schedules per pet
4. Review upcoming work and low-stock inventory from the dashboard

## What The App Does

### Pets

- Create pet profiles with name, type, breed, weight, date of birth, and optional image URL
- List pets ordered by newest first
- Reuse pets as the source of truth for inventory and schedules

### Inventory

- Create food inventory records per pet
- Track total food weight and daily portion size
- Forecast remaining food weight and remaining days based on `lastUpdatedDate`
- Update inventory and reset the forecast reference point

### Schedules

- Create care events such as vaccines, deworming, and water changes
- View schedules per pet
- Query upcoming schedules due within the next 7 days

### Dashboard

- Summarizes total pets, inventory items, and upcoming schedules
- Highlights low-stock inventory
- Surfaces the next due care task
- Pulls live data from the backend API

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend

- Node.js
- Express 5
- TypeScript
- Prisma
- PostgreSQL
- Zod

### Tooling

- Docker
- Docker Compose

## Architecture

```text
frontend (React/Vite)
  -> calls backend API at /api

backend (Express/Prisma)
  -> reads/writes PostgreSQL

postgres
  -> stores pets, inventory, and health schedules
```

Backend modules are separated by domain:

- `pet`
- `inventory`
- `schedule`

Frontend routes map directly to the main user workflows:

- `/` dashboard
- `/pets`
- `/inventory`
- `/schedules`

## Repository Layout

```text
.
├── backend/              Express + Prisma API
├── frontend/             React + Vite UI
├── docs/                 Test plans and reports
├── mockup/               Static design assets
└── docker-compose.yml    Local multi-service setup
```

## Prerequisites

Choose one of these approaches:

- Docker + Docker Compose
- Node.js 21+ and a local PostgreSQL instance

## Quick Start With Docker

This is the fastest way to run the full stack.

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/api/health`
- PostgreSQL: `localhost:5432`

The compose file already sets:

- `POSTGRES_USER=user`
- `POSTGRES_PASSWORD=password`
- `POSTGRES_DB=pet_crm`
- `DATABASE_URL=postgresql://user:password@db:5432/pet_crm?schema=public`

To stop the stack:

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

## Local Development Without Docker

### 1. Start PostgreSQL

Create a database and make sure you have a working connection string.

Example:

```bash
postgresql://user:password@localhost:5432/pet_crm?schema=public
```

### 2. Run the backend

Create `backend/.env`:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/pet_crm?schema=public
```

Install dependencies and start the dev server:

```bash
cd backend
npm install
npm run dev
```

Notes:

- `npm run dev` runs `prisma db push`, `prisma generate`, and then starts `ts-node-dev`
- The backend defaults to port `3000`

### 3. Run the frontend

Optionally create `frontend/.env` if you want to override the API base URL:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Install dependencies and start Vite:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Build Commands

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## API Overview

Base URL:

```text
http://localhost:3000/api
```

### Health

- `GET /health`

### Pets

- `POST /pets`
- `GET /pets`
- `GET /pets/:id`

### Inventory

- `POST /inventory`
- `GET /inventory/pet/:petId`
- `PUT /inventory/:id`

### Schedules

- `POST /schedules`
- `GET /schedules/upcoming`
- `GET /schedules/pet/:petId`

## Data Model

Main entities in Prisma:

- `Pet`
- `Inventory`
- `HealthSchedule`

Key relationships:

- A `Pet` has many inventory records
- A `Pet` has many health schedules
- Inventory forecasting is computed dynamically from:
  `totalWeightGrams`, `dailyPortionGrams`, and `lastUpdatedDate`

## Testing And Docs

Project test planning lives under [`docs/test_plan`](./docs/test_plan/README.md).

Available docs include:

- API test plan
- UI test plan
- E2E test plan
- Infrastructure test plan
- Edge case coverage
- E2E test report

At the moment, the repository does not expose a root automated test command. Most validation appears to be manual or documented in the test plan files.

## Current Gaps

Based on the current codebase, these are the main missing pieces:

- No authentication or authorization
- No delete flows for pets, inventory, or schedules
- Limited request validation in the API layer
- No frontend 404 route
- Sidebar layout is not fully mobile-friendly
- No seeded demo data

## Suggested Development Flow

If you are trying the app for the first time:

1. Create one or more pets
2. Add food inventory records
3. Add upcoming care schedules
4. Return to the dashboard and confirm low-stock and due-soon cards update as expected

## License

No license file is currently included in this repository.
# pet-care
