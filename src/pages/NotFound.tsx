import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-danger" />
        </div>
        <h1 className="text-6xl font-bold text-ink mb-3">404</h1>
        <h2 className="text-h3 font-semibold text-ink mb-2">Page not found</h2>
        <p className="text-sm text-ink-secondary mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-btn bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <Home size={16} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
