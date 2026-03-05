import React, { createContext, useCallback, useContext, useState } from 'react';
import { api } from '@/api/api';

function getAdminNames(): string[] {
  const raw = import.meta.env.VITE_ADMIN_NAMES ?? '';
  return raw.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);
}

interface AuthUser {
  userId: string;
  name: string;
  teamName: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, teamName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (u: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'hagmaxlama_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthUser;
      const adminNames = getAdminNames();
      parsed.isAdmin = adminNames.includes((parsed.name ?? '').trim().toLowerCase());
      return parsed;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(async (name: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.loginUser({ name, password });
      if (res.success && res.data) {
        const adminNames = getAdminNames();
        const isAdmin = adminNames.includes((res.data.Name ?? '').trim().toLowerCase());
        setUser({ userId: res.data.UserID, name: res.data.Name, teamName: res.data.TeamName, isAdmin });
        return { success: true };
      }
      return { success: false, error: res.error ?? 'Login failed' };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const register = useCallback(async (name: string, teamName: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.registerUser({ name, teamName, password });
      if (res.success && res.data) {
        const adminNames = getAdminNames();
        const isAdmin = adminNames.includes((name ?? '').trim().toLowerCase());
        setUser({ userId: res.data.UserID, name, teamName, isAdmin });
        return { success: true };
      }
      return { success: false, error: res.error ?? 'Registration failed' };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(() => setUser(null), [setUser]);

  const value: AuthContextValue = { user, loading, login, register, logout, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
