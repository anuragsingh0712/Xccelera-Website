# management System

A full-featured Gym Management System React frontend that lets admins manage members, trainers, memberships, workout plans, attendance, and payments — with role-based dashboards for admins, trainers, and members.

## Tech stack
React + TypeScript, Vite, Tailwind CSS, React Router, axios, recharts, react-hot-toast.

## Getting started
```
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
```
Then open http://localhost:40817

### Demo login credentials
| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | admin@gymapp.com       | password123  |
| Trainer | trainer@gymapp.com     | password123  |
| Member  | member@gymapp.com      | password123  |

## Environment variables
See .env.example. `VITE_API_URL` is optional — every entity runs on local mock data (`USE_MOCK = true` in `src/data/store.ts`) until it is set and each entity's flag is flipped to `false`.

## Project structure
| Folder | Contents |
|--------|----------|
| `src/pages` | One component per screen (Login, Dashboard, Members, Trainers, Memberships, WorkoutPlans, Attendance, Payments, Portals, Reports, Settings, NotFound) |
| `src/components` | Shared UI components (Sidebar, TopBar, Badge, StatsCard, ConfirmModal, FormField, LoadingSpinner, PageHeader, RequireAuth) |
| `src/data` | `mockData.ts` — typed seed records; `store.ts` — localStorage-backed CRUD with USE_MOCK gates |
| `src/auth` | `auth.ts` — client-side auth (login/signup/logout/currentUser/currentRole) with USE_MOCK gate |
| `src/api` | `client.ts` — shared axios instance with request/response interceptors and toast.error on failures |
| `src/types` | TypeScript interfaces for all entities |
| `src/routes` | `index.tsx` — createBrowserRouter configuration |
| `src/constants` | `routes.ts` — route path constants |
| `src/validation` | `index.ts` — reusable field validation functions |
| `src/utils` | `format.ts` — currency, date, time, duration formatting helpers |
