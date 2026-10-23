import { mockUsers } from '../data/mockData';
import type { AuthToken, User, UserRole } from '../types';
import apiClient from '../api/client';

const AUTH_TOKEN_KEY = 'auth_token';
const APP_USERS_KEY = 'app_users';

// ---------------------------------------------------------------------------
// Local helpers (MOCK implementations — see localLogin / localSignup below)
// ---------------------------------------------------------------------------

function getUsers(): User[] {
  const raw = localStorage.getItem(APP_USERS_KEY);
  const signedUp: User[] = raw ? (JSON.parse(raw) as User[]) : [];
  return [...mockUsers, ...signedUp];
}

// MOCK: Validates email + password against the seeded mockUsers list and any
//       signed-up users stored in localStorage. Returns true on match.
function localLogin(email: string, password: string): boolean {
  const users = getUsers();
  const match = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (!match) return false;

  const token: AuthToken = {
    userId: match.id,
    email: match.email,
    role: match.role,
    name: match.name,
  };
  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token));
  return true;
}

// MOCK: Creates a new user in localStorage (role 'member' by default).
//       Rejects duplicate email.
function localSignup(name: string, email: string, password: string): User {
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    password,
    role: 'member' as UserRole,
    name,
    createdAt: new Date().toISOString(),
  };

  const raw = localStorage.getItem(APP_USERS_KEY);
  const signedUp: User[] = raw ? (JSON.parse(raw) as User[]) : [];
  signedUp.push(newUser);
  localStorage.setItem(APP_USERS_KEY, JSON.stringify(signedUp));

  const token: AuthToken = {
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  };
  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token));

  return newUser;
}

function localLogout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Public API — gated behind USE_MOCK per auth operation
// ---------------------------------------------------------------------------

// TODO(USE_MOCK): verify path + response shape against the real backend's
// OpenAPI schema before flipping this to false.
export const USE_MOCK = true;

export async function login(email: string, password: string): Promise<boolean> {
  if (USE_MOCK) return localLogin(email, password);
  const res = await apiClient.post('/api/v1/auth/login', { email, password });
  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(res.data));
  return true;
}

export async function signup(name: string, email: string, password: string): Promise<User> {
  if (USE_MOCK) return localSignup(name, email, password);
  const res = await apiClient.post('/api/v1/auth/signup', { name, email, password });
  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(res.data));
  return res.data as User;
}

export async function logout(): Promise<void> {
  if (USE_MOCK) {
    localLogout();
    return;
  }
  await apiClient.post('/api/v1/auth/logout');
  localLogout();
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
}

export function currentUser(): AuthToken | null {
  const raw = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthToken;
  } catch {
    return null;
  }
}

export function currentRole(): UserRole | null {
  return currentUser()?.role ?? null;
}
