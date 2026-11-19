/**
 * Ocho Authentication Service (Frontend)
 * Manages bearer tokens, login, register, and current user profile in localStorage.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username?: string | null;
  phone?: string | null;
  role: string;
  isVerified: boolean;
  verificationMethod?: string | null;
  campus?: {
    id: string;
    name: string;
    code: string;
  } | null;
  stats?: {
    itemsCount: number;
    boughtOrdersCount: number;
    soldOrdersCount: number;
    reviewsCount: number;
  };
}

export interface AuthResponse {
  message: string;
  data: {
    user: AuthUser;
    token: string;
  };
}

const TOKEN_KEY = 'ocho_auth_token';
const USER_KEY = 'ocho_auth_user';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: AuthUser): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to store auth session:', err);
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Failed to clear auth session:', err);
  }
}

const AUTH_API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function registerStudent(payload: {
  email: string;
  password: string;
  name: string;
  username?: string;
  phone?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Pendaftaran gagal');
  }

  setAuthSession(json.data.token, json.data.user);
  return json;
}

export async function updateUsername(username: string): Promise<AuthUser> {
  const token = getStoredToken();
  if (!token) throw new Error('Sesi login tidak ditemukan');

  const res = await fetch('/api/auth/username', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Gagal mengubah username');
  }

  const currentUser = getStoredUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, username: json.data.username };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }

  return json.data;
}

export async function loginStudent(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Login gagal');
  }

  setAuthSession(json.data.token, json.data.user);
  return json;
}

export async function fetchCurrentProfile(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthSession();
        return null;
      }
      throw new Error('Gagal memuat profil');
    }

    const json = await res.json();
    const user: AuthUser = json.data;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}
