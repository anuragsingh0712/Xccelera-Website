import { Bell, Search } from 'lucide-react';
import { currentUser } from '../auth/auth';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const user = currentUser();

  // MOCK: Notification count is hardcoded; replace with real notification API.
  const notificationCount = 3;

  return (
    <header className="fixed top-0 left-sidebar right-0 h-topbar bg-surface border-b border-border z-30 flex items-center px-6 gap-4 shadow-sm">
      <div className="flex-1">
        <h1 className="text-h3 font-semibold text-ink">{title}</h1>
      </div>

      {/* Search bar */}
      <div className="hidden md:flex items-center gap-2 bg-canvas rounded-lg px-3 py-2 border border-border w-56">
        <Search size={16} className="text-ink-muted flex-shrink-0" />
        <input
          type="text"
          placeholder="Search…"
          className="bg-transparent text-sm text-ink placeholder-ink-muted outline-none w-full"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg hover:bg-canvas transition-colors">
        <Bell size={20} className="text-ink-secondary" />
        {notificationCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>

      {/* User avatar */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm select-none">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-ink leading-tight">{user?.name ?? 'User'}</p>
          <p className="text-xs text-ink-secondary capitalize">{user?.role ?? ''}</p>
        </div>
      </div>
    </header>
  );
}
