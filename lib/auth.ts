'use client';

/**
 * Mock authentication helpers (client-side only)
 * TODO: Replace with real auth (Supabase/backend) later
 */
const AUTH_KEY = 'kc_auth';

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(AUTH_KEY) === '1';
}

export function login(email: string): void {
  sessionStorage.setItem(AUTH_KEY, '1');
  sessionStorage.setItem('kc_user', JSON.stringify({ email, ts: Date.now() }));
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem('kc_user');
}

export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('kc_user');
    return raw ? (JSON.parse(raw) as { email: string }).email : null;
  } catch {
    return null;
  }
}
