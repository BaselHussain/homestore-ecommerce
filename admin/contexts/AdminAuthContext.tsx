'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      const userData = res.data.user || res.data;
      if (userData.role === 'admin') {
        setUser(userData);
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
      }
    } catch {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    if (userData.role !== 'admin') {
      throw new Error('Access denied. Admin account required.');
    }
    localStorage.setItem('admin_token', token);
    setUser(userData);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AdminAuthContext.Provider value={{ user, isLoading, isAdmin: user?.role === 'admin', login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
