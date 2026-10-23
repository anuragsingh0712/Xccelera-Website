import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff } from 'lucide-react';
import { login } from '../auth/auth';
import { validateEmail, validatePassword } from '../validation';

export function Login() {
  // MOCK: prefilled with the demo admin login — remove before wiring a real backend.
  const [email, setEmail] = useState('admin@gymapp.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const emailError = submitted ? validateEmail(email) : '';
  const passwordError = submitted ? validatePassword(password) : '';
  const isValid = !validateEmail(email) && !validatePassword(password);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setAuthError('');

    if (!isValid) return;

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (!success) {
        setAuthError('Invalid email or password. Please try again.');
        return;
      }
      // Route based on role after login
      const raw = localStorage.getItem('auth_token');
      if (raw) {
        const token = JSON.parse(raw) as { role: string };
        if (token.role === 'member') {
          navigate('/portal/member');
        } else if (token.role === 'trainer') {
          navigate('/portal/trainer');
        } else {
          navigate('/dashboard');
        }
      }
    } catch {
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-card">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-h1 font-bold text-ink">GymPro</h1>
          <p className="text-ink-secondary text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-card shadow-card p-8">
          {authError && (
            <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/20 rounded-btn">
              <p className="text-sm text-danger">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={[
                  'w-full px-3 py-2.5 rounded-btn border text-sm text-ink bg-surface',
                  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                  'placeholder-ink-muted transition-colors',
                  emailError ? 'border-danger' : 'border-border',
                ].join(' ')}
                autoComplete="email"
              />
              {emailError && <p className="text-xs text-danger">{emailError}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wide">
                Password <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={[
                    'w-full px-3 py-2.5 pr-10 rounded-btn border text-sm text-ink bg-surface',
                    'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
                    'placeholder-ink-muted transition-colors',
                    passwordError ? 'border-danger' : 'border-border',
                  ].join(' ')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-danger">{passwordError}</p>}
              <p className="text-xs text-ink-muted">At least 6 characters</p>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:text-primary-dark font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full py-3 rounded-btn bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 bg-canvas rounded-btn border border-border">
            <p className="text-xs font-semibold text-ink-secondary mb-1">Demo credentials</p>
            <p className="text-xs text-ink-muted">Admin: admin@gymapp.com / password123</p>
            <p className="text-xs text-ink-muted">Trainer: trainer@gymapp.com / password123</p>
            <p className="text-xs text-ink-muted">Member: member@gymapp.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
