'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthData, getToken, getStoredUser, clearAuthData, isAuthenticated as checkAuth, StoredUser } from '@/lib/auth';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: StoredUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<StoredUser>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from storage on mount
  useEffect(() => {
    const token = getToken();
    if (token && checkAuth()) {
      const storedUser = getStoredUser();
      if (storedUser) setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const data = await authApi.login({ email, password, rememberMe });
    const userData: StoredUser = { id: data.user.id, email: data.user.email, name: data.user.name };
    setAuthData(data.token, userData, rememberMe);
    setUser(userData);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    await authApi.signup({ email, password, name });
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    if (token) {
      authApi.logout().catch(() => {});
    }
    clearAuthData();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<StoredUser>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
