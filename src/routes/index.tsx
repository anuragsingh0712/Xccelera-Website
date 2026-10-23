import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from '../App';
import { RequireAuth } from '../components/RequireAuth';
import { Login } from '../pages/Login';
import { ForgotPassword } from '../pages/ForgotPassword';
import { Dashboard } from '../pages/Dashboard';
import { MembersList } from '../pages/MembersList';
import { MemberDetail } from '../pages/MemberDetail';
import { TrainersList } from '../pages/TrainersList';
import { TrainerDetail } from '../pages/TrainerDetail';
import { MembershipsList } from '../pages/MembershipsList';
import { MembershipDetail } from '../pages/MembershipDetail';
import { WorkoutPlansList } from '../pages/WorkoutPlansList';
import { WorkoutPlanDetail } from '../pages/WorkoutPlanDetail';
import { AttendanceTracking } from '../pages/AttendanceTracking';
import { PaymentsList } from '../pages/PaymentsList';
import { PaymentDetail } from '../pages/PaymentDetail';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';
import { MemberPortal } from '../pages/MemberPortal';
import { TrainerPortal } from '../pages/TrainerPortal';
import { NotFound } from '../pages/NotFound';

export const router = createBrowserRouter([
  // Public routes (no auth required)
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },

  // Protected routes — wrapped in RequireAuth + App layout
  {
    path: '/',
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      // Default redirect
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      // Admin screens
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'members',
        element: <MembersList />,
      },
      {
        path: 'members/new',
        element: <MemberDetail />,
      },
      {
        path: 'members/:id',
        element: <MemberDetail />,
      },
      {
        path: 'trainers',
        element: <TrainersList />,
      },
      {
        path: 'trainers/new',
        element: <TrainerDetail />,
      },
      {
        path: 'trainers/:id',
        element: <TrainerDetail />,
      },
      {
        path: 'memberships',
        element: <MembershipsList />,
      },
      {
        path: 'memberships/new',
        element: <MembershipDetail />,
      },
      {
        path: 'memberships/:id',
        element: <MembershipDetail />,
      },
      {
        path: 'workout-plans',
        element: <WorkoutPlansList />,
      },
      {
        path: 'workout-plans/new',
        element: <WorkoutPlanDetail />,
      },
      {
        path: 'workout-plans/:id',
        element: <WorkoutPlanDetail />,
      },
      {
        path: 'attendance',
        element: <AttendanceTracking />,
      },
      {
        path: 'payments',
        element: <PaymentsList />,
      },
      {
        path: 'payments/new',
        element: <PaymentDetail />,
      },
      {
        path: 'payments/:id',
        element: <PaymentDetail />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      // Portals
      {
        path: 'portal/member',
        element: <MemberPortal />,
      },
      {
        path: 'portal/trainer',
        element: <TrainerPortal />,
      },
      // Settings — all roles
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFound />,
  },
]);
