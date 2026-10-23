import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  Dumbbell,
  CalendarCheck,
  DollarSign,
  BarChart2,
  Settings,
  LogOut,
  Zap,
  User,
} from 'lucide-react';
import { logout, currentRole } from '../auth/auth';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: Array<'admin' | 'trainer' | 'member'>;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard size={18} />,
    roles: ['admin'],
  },
  {
    label: 'Members',
    to: '/members',
    icon: <Users size={18} />,
    roles: ['admin'],
  },
  {
    label: 'Trainers',
    to: '/trainers',
    icon: <UserCheck size={18} />,
    roles: ['admin'],
  },
  {
    label: 'Memberships',
    to: '/memberships',
    icon: <CreditCard size={18} />,
    roles: ['admin'],
  },
  {
    label: 'Workout Plans',
    to: '/workout-plans',
    icon: <Dumbbell size={18} />,
    roles: ['admin', 'trainer'],
  },
  {
    label: 'Attendance',
    to: '/attendance',
    icon: <CalendarCheck size={18} />,
    roles: ['admin'],
  },
  {
    label: 'Payments',
    to: '/payments',
    icon: <DollarSign size={18} />,
    roles: ['admin'],
  },
  {
    label: 'Reports',
    to: '/reports',
    icon: <BarChart2 size={18} />,
    roles: ['admin'],
  },
  {
    label: 'My Portal',
    to: '/portal/member',
    icon: <User size={18} />,
    roles: ['member'],
  },
  {
    label: 'My Portal',
    to: '/portal/trainer',
    icon: <User size={18} />,
    roles: ['trainer'],
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: <Settings size={18} />,
    roles: ['admin', 'trainer', 'member'],
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const role = currentRole();

  const visibleItems = navItems.filter(
    (item) => role && item.roles.includes(role),
  );

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-sidebar bg-sidebar flex flex-col z-40 shadow-lg">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">GymPro</p>
          <p className="text-white/50 text-xs capitalize">{role ?? 'User'}</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <ul className="space-y-1 px-3">
          {visibleItems.map((item) => (
            <li key={item.to + item.label}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-white/70 hover:bg-sidebar-hover hover:text-white',
                  ].join(' ')
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-sidebar-hover hover:text-white transition-colors duration-150"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
