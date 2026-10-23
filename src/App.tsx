import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';

// Map route paths to human-readable page titles for the TopBar.
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/members/new': 'New Member',
  '/trainers': 'Trainers',
  '/trainers/new': 'New Trainer',
  '/memberships': 'Membership Plans',
  '/memberships/new': 'New Membership Plan',
  '/workout-plans': 'Workout Plans',
  '/workout-plans/new': 'New Workout Plan',
  '/attendance': 'Attendance Tracking',
  '/payments': 'Payments',
  '/payments/new': 'Record Payment',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/portal/member': 'My Portal',
  '/portal/trainer': 'Trainer Portal',
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Segment-based match for detail routes (/members/:id, etc.)
  if (pathname.startsWith('/members/')) return 'Member Detail';
  if (pathname.startsWith('/trainers/')) return 'Trainer Detail';
  if (pathname.startsWith('/memberships/')) return 'Membership Detail';
  if (pathname.startsWith('/workout-plans/')) return 'Workout Plan';
  if (pathname.startsWith('/payments/')) return 'Payment Detail';

  return 'GymPro';
}

export function App() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 ml-sidebar flex flex-col min-h-screen">
        <TopBar title={title} />

        {/* Page content */}
        <main className="flex-1 mt-topbar p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global toast notifications — mounted once here, never in individual pages */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1A1A1A',
            border: '1px solid #EEEEEE',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#00AA44',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#CC0000',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}
