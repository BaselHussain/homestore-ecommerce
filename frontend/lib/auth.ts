export interface StoredUser {
  id: string;
  email: string;
  name: string;
}

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'auth_user';
const STORAGE_TYPE_KEY = 'auth_storage'; // 'local' | 'session'

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  const type = localStorage.getItem(STORAGE_TYPE_KEY);
  return type === 'session' ? sessionStorage : localStorage;
};

export const setAuthData = (token: string, user: StoredUser, rememberMe: boolean): void => {
  if (typeof window === 'undefined') return;
  const storage = rememberMe ? localStorage : sessionStorage;
  localStorage.setItem(STORAGE_TYPE_KEY, rememberMe ? 'local' : 'session');
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return getStorage()?.getItem(TOKEN_KEY) ?? null;
};

export const getStoredUser = (): StoredUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = getStorage()?.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(STORAGE_TYPE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

export interface JwtPayload {
  sub: string;
  email: string;
  exp?: number;
  iat?: number;
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1]!;
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp < Math.floor(Date.now() / 1000);
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token ? !isTokenExpired(token) : false;
};
