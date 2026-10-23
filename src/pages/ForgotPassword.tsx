import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import { validateEmail } from '../validation';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  const emailError = submitted ? validateEmail(email) : '';
  const isValid = !validateEmail(email);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    // MOCK: Password reset is simulated — no real email is sent.
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-card">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-h2 font-bold text-ink">Reset password</h1>
          <p className="text-ink-secondary text-sm mt-1">
            We'll send a reset link to your email.
          </p>
        </div>

        <div className="bg-surface rounded-card shadow-card p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle size={24} className="text-success" />
              </div>
              <div>
                <p className="font-semibold text-ink">Check your inbox</p>
                <p className="text-sm text-ink-secondary mt-1">
                  If an account exists for <strong>{email}</strong>, you'll receive a reset link
                  shortly.
                </p>
              </div>
              <Link
                to="/login"
                className="mt-2 text-sm text-primary hover:text-primary-dark font-medium"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
                />
                {emailError && <p className="text-xs text-danger">{emailError}</p>}
              </div>

              <button
                type="submit"
                disabled={!isValid}
                className="w-full py-3 rounded-btn bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send reset link
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-ink-secondary hover:text-ink"
              >
                <ArrowLeft size={14} />
                Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
