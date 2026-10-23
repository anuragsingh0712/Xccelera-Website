# management System — Routes & Navigation

## How to run
```
cd /workspace/frontend_runs/dc3f4b25-40ee-4af6-92c6-7884cba94213/project
npm install --legacy-peer-deps && npm run dev
```
Then open http://localhost:40817

## Routes

| Route | Page file | Description |
|-------|-----------|-------------|
| `/` | redirects | Redirects to /dashboard |
| `/login` | `src/pages/Login.tsx` | Authentication with role-based redirect (admin→/dashboard, trainer→/portal/trainer, member→/portal/member) |
| `/forgot-password` | `src/pages/ForgotPassword.tsx` | Password reset request (simulated) |
| `/dashboard` | `src/pages/Dashboard.tsx` | Admin dashboard with stats, revenue/attendance charts, recent member/payment lists |
| `/members` | `src/pages/MembersList.tsx` | Admin — searchable/filterable member list with CRUD actions |
| `/members/new` | `src/pages/MemberDetail.tsx` | Admin — create new member form |
| `/members/:id` | `src/pages/MemberDetail.tsx` | Admin — view/edit member profile, membership, attendance history, payment history |
| `/trainers` | `src/pages/TrainersList.tsx` | Admin — searchable/filterable trainer list with CRUD actions |
| `/trainers/new` | `src/pages/TrainerDetail.tsx` | Admin — create new trainer form |
| `/trainers/:id` | `src/pages/TrainerDetail.tsx` | Admin — view/edit trainer profile, assigned workout plans |
| `/memberships` | `src/pages/MembershipsList.tsx` | Admin — membership tier pricing cards and table |
| `/memberships/new` | `src/pages/MembershipDetail.tsx` | Admin — create new membership plan |
| `/memberships/:id` | `src/pages/MembershipDetail.tsx` | Admin — edit membership plan details and benefits |
| `/workout-plans` | `src/pages/WorkoutPlansList.tsx` | Admin/Trainer — workout plans list with trainer filter |
| `/workout-plans/new` | `src/pages/WorkoutPlanDetail.tsx` | Admin/Trainer — create new workout plan |
| `/workout-plans/:id` | `src/pages/WorkoutPlanDetail.tsx` | Admin/Trainer — view/edit plan, manage exercises, assign to members |
| `/attendance` | `src/pages/AttendanceTracking.tsx` | Admin — check-in/check-out tracking with date filter |
| `/payments` | `src/pages/PaymentsList.tsx` | Admin — payments list with status/method filters |
| `/payments/new` | `src/pages/PaymentDetail.tsx` | Admin — record new payment |
| `/payments/:id` | `src/pages/PaymentDetail.tsx` | Admin — view payment details, update status, invoice preview |
| `/reports` | `src/pages/Reports.tsx` | Admin — analytics with overview/attendance/revenue/membership tabs and charts |
| `/portal/member` | `src/pages/MemberPortal.tsx` | Member — personal profile, membership status, workout plans, attendance, payments |
| `/portal/trainer` | `src/pages/TrainerPortal.tsx` | Trainer — workout plan management, assigned members, attendance overview |
| `/settings` | `src/pages/Settings.tsx` | All roles — profile update, password change, logout |
| `*` | `src/pages/NotFound.tsx` | 404 not found with Go Home button |

## Navigation map
- Login → Dashboard (admin login success)
- Login → TrainerPortal (trainer login success)
- Login → MemberPortal (member login success)
- Login → ForgotPassword (forgot password link)
- ForgotPassword → Login (back button)
- Dashboard → MembersList (sidebar link / quick action)
- Dashboard → TrainersList (sidebar link)
- Dashboard → MembershipsList (sidebar link)
- Dashboard → WorkoutPlansList (sidebar link)
- Dashboard → AttendanceTracking (sidebar link / quick action)
- Dashboard → PaymentsList (sidebar link / quick action)
- Dashboard → Reports (sidebar link)
- Dashboard → Settings (sidebar link)
- Dashboard → MemberDetail (click member row in recent table)
- Dashboard → PaymentDetail (click payment row in recent table)
- Dashboard → MemberDetail/new (Add Member quick action)
- Dashboard → TrainerDetail/new (Add Trainer quick action)
- Dashboard → PaymentDetail/new (Record Payment quick action)
- MembersList → MemberDetail/:id (click row or edit button)
- MembersList → MemberDetail/new (Add Member button)
- MemberDetail → MembersList (Cancel / Back button)
- MemberDetail → PaymentDetail/:id (click payment row)
- TrainersList → TrainerDetail/:id (click row or edit button)
- TrainersList → TrainerDetail/new (Add Trainer button)
- TrainerDetail → TrainersList (Cancel / Back button)
- TrainerDetail → WorkoutPlanDetail/:id (click plan in list)
- TrainerDetail → WorkoutPlanDetail/new (Create a plan link)
- MembershipsList → MembershipDetail/:id (click row or edit)
- MembershipsList → MembershipDetail/new (Add Plan button)
- MembershipDetail → MembershipsList (Cancel / Back button)
- WorkoutPlansList → WorkoutPlanDetail/:id (click row)
- WorkoutPlansList → WorkoutPlanDetail/new (Create Plan button)
- WorkoutPlanDetail → WorkoutPlansList (Cancel / Back button)
- PaymentsList → PaymentDetail/:id (click row)
- PaymentsList → PaymentDetail/new (Record Payment button)
- PaymentDetail → PaymentsList (Cancel / Back button)
- MemberPortal → WorkoutPlanDetail/:id (click plan card)
- TrainerPortal → WorkoutPlanDetail/:id (click plan card)
- TrainerPortal → WorkoutPlanDetail/new (New Plan button)
- TrainerPortal → WorkoutPlansList (View all plans link)
- Settings → Login (logout confirmation)
- Any page → NotFound (unknown URL)
- Any page → Login (unauthenticated redirect via RequireAuth)

## Shared components

| File | Description |
|------|-------------|
| `src/components/Sidebar.tsx` | Fixed left sidebar with NavLink nav items filtered by role (RBAC), logout button |
| `src/components/TopBar.tsx` | Fixed top bar with page title, search input (UI), notification badge, user avatar |
| `src/components/Badge.tsx` | Color-coded status pill (success/warning/danger/info/neutral/purple) |
| `src/components/StatsCard.tsx` | KPI card with icon, value, subtitle, and optional trend |
| `src/components/ConfirmModal.tsx` | Reusable confirm/cancel modal for destructive actions |
| `src/components/FormField.tsx` | Polymorphic form field (input/select/textarea) with label, error, and helper text |
| `src/components/LoadingSpinner.tsx` | Centered spinner, SkeletonRow, and SkeletonTable for loading states |
| `src/components/PageHeader.tsx` | Page title + optional subtitle + action buttons row |
| `src/components/RequireAuth.tsx` | Route guard — redirects to /login when not authenticated |

## Design tokens

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#0066CC` | Primary actions, active nav, links |
| `primary-dark` | `#004499` | Hover state for primary |
| `primary-light` | `#3388DD` | Light primary variants |
| `success` | `#00AA44` | Success states, active badges |
| `warning` | `#FF9900` | Warning states, pending badges |
| `danger` | `#CC0000` | Error states, delete actions |
| `surface` | `#FFFFFF` | Card backgrounds |
| `canvas` | `#F5F5F5` | Page background, table row hovers |
| `border` | `#EEEEEE` | Dividers and input borders |
| `muted` | `#CCCCCC` | Disabled/placeholder elements |
| `ink` | `#1A1A1A` | Primary text |
| `ink-secondary` | `#666666` | Secondary text |
| `ink-muted` | `#999999` | Placeholder/tertiary text |
| `sidebar` | `#1E2A3B` | Sidebar background |
| `sidebar-hover` | `#273548` | Sidebar nav item hover |
| `sidebar-active` | `#0066CC` | Sidebar nav item active |
| `accent` | `#5856D6` | Accent/purple highlights |
| `teal` | `#00C7BE` | Teal highlights |
