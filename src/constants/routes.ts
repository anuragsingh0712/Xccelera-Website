// App-wide route path constants.
// Import from here instead of hardcoding strings throughout components.

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MEMBERS: '/members',
  MEMBER_DETAIL: '/members/:id',
  MEMBER_NEW: '/members/new',
  TRAINERS: '/trainers',
  TRAINER_DETAIL: '/trainers/:id',
  TRAINER_NEW: '/trainers/new',
  MEMBERSHIPS: '/memberships',
  MEMBERSHIP_DETAIL: '/memberships/:id',
  MEMBERSHIP_NEW: '/memberships/new',
  WORKOUT_PLANS: '/workout-plans',
  WORKOUT_PLAN_DETAIL: '/workout-plans/:id',
  WORKOUT_PLAN_NEW: '/workout-plans/new',
  ATTENDANCE: '/attendance',
  PAYMENTS: '/payments',
  PAYMENT_DETAIL: '/payments/:id',
  PAYMENT_NEW: '/payments/new',
  MEMBER_PORTAL: '/portal/member',
  TRAINER_PORTAL: '/portal/trainer',
  SETTINGS: '/settings',
  REPORTS: '/reports',
  FORGOT_PASSWORD: '/forgot-password',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
