import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogOut, CheckCircle } from 'lucide-react';
import { currentUser, logout } from '../auth/auth';
import { ConfirmModal } from '../components/ConfirmModal';
import { PageHeader } from '../components/PageHeader';
import { FormField } from '../components/FormField';
import { validatePassword, validateName } from '../validation';
import toast from 'react-hot-toast';

export function Settings() {
  const navigate = useNavigate();
  const user = currentUser();

  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitted, setPasswordSubmitted] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const nameError = nameSubmitted ? validateName(displayName) : '';
  const isNameValid = !validateName(displayName);

  const passwordErrors = {
    currentPassword: passwordSubmitted ? validatePassword(currentPassword) : '',
    newPassword: passwordSubmitted ? validatePassword(newPassword) : '',
    confirmPassword:
      passwordSubmitted && newPassword !== confirmPassword ? 'Passwords do not match.' : '',
  };
  const isPasswordValid =
    !validatePassword(currentPassword) &&
    !validatePassword(newPassword) &&
    newPassword === confirmPassword;

  function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();
    setNameSubmitted(true);
    if (!isNameValid) return;
    // MOCK: Profile update is local-only — persisting to localStorage for demonstration.
    const raw = localStorage.getItem('auth_token');
    if (raw) {
      const token = JSON.parse(raw);
      token.name = displayName.trim();
      localStorage.setItem('auth_token', JSON.stringify(token));
    }
    toast.success('Profile updated!');
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 3000);
  }

  function handlePasswordChange(event: React.FormEvent) {
    event.preventDefault();
    setPasswordSubmitted(true);
    if (!isPasswordValid) return;
    // MOCK: Password change is simulated — no real hashing or persistence.
    toast.success('Password changed successfully! (MOCK — not persisted)');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSubmitted(false);
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="max-w-2xl space-y-6">
        {/* Profile section */}
        <div className="bg-surface rounded-card shadow-card p-6">
          <h3 className="text-base font-semibold text-ink mb-1 flex items-center gap-2">
            <User size={17} className="text-primary" />
            Profile
          </h3>
          <p className="text-xs text-ink-secondary mb-5">Update your display name and account details.</p>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="font-semibold text-ink">{user?.name}</p>
              <p className="text-sm text-ink-secondary">{user?.email}</p>
              <p className="text-xs text-ink-muted capitalize mt-0.5">{user?.role} account</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} noValidate className="space-y-4">
            <FormField
              label="Display Name"
              required
              value={displayName}
              onChange={(e) => setDisplayName((e.target as HTMLInputElement).value)}
              error={nameError}
              helper="At least 2 characters"
            />
            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={!isNameValid}
                className="px-4 py-2 rounded-btn text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Profile
              </button>
            </div>
            {nameSaved && (
              <div className="flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/20 rounded-btn">
                <CheckCircle size={16} className="text-success" />
                <p className="text-sm text-success">Profile saved!</p>
              </div>
            )}
          </form>
        </div>

        {/* Password section */}
        <div className="bg-surface rounded-card shadow-card p-6">
          <h3 className="text-base font-semibold text-ink mb-1 flex items-center gap-2">
            <Lock size={17} className="text-primary" />
            Change Password
          </h3>
          <p className="text-xs text-ink-secondary mb-5">Update your password to keep your account secure.</p>

          <form onSubmit={handlePasswordChange} noValidate className="space-y-4">
            <FormField
              label="Current Password"
              required
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword((e.target as HTMLInputElement).value)}
              error={passwordErrors.currentPassword}
              helper="At least 6 characters"
            />
            <FormField
              label="New Password"
              required
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword((e.target as HTMLInputElement).value)}
              error={passwordErrors.newPassword}
              helper="At least 6 characters"
            />
            <FormField
              label="Confirm New Password"
              required
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword((e.target as HTMLInputElement).value)}
              error={passwordErrors.confirmPassword}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isPasswordValid}
                className="px-4 py-2 rounded-btn text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Change Password
              </button>
            </div>
            {passwordSaved && (
              <div className="flex items-center gap-2 px-4 py-3 bg-success/10 border border-success/20 rounded-btn">
                <CheckCircle size={16} className="text-success" />
                <p className="text-sm text-success">Password updated!</p>
              </div>
            )}
          </form>
        </div>

        {/* Logout section */}
        <div className="bg-surface rounded-card shadow-card p-6">
          <h3 className="text-base font-semibold text-ink mb-1 flex items-center gap-2">
            <LogOut size={17} className="text-danger" />
            Logout
          </h3>
          <p className="text-xs text-ink-secondary mb-4">
            Sign out of your GymPro account on this device.
          </p>
          <button
            onClick={() => setLogoutConfirmOpen(true)}
            className="px-4 py-2 rounded-btn text-sm font-semibold text-white bg-danger hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={logoutConfirmOpen}
        title="Sign out"
        message="Are you sure you want to sign out of GymPro? You will need to log in again."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmOpen(false)}
        variant="warning"
      />
    </div>
  );
}
