'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, usersApi } from '@/lib/api';
import { authStorage } from '@/lib/auth-storage';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  avatarUrl?: string;
  level: number;
  xp: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const setAuthenticated = useCallback((user: User) => {
    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  const setUnauthenticated = useCallback(() => {
    authStorage.clear();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const user = await usersApi.me() as User;
      setAuthenticated(user);
    } catch {
      setUnauthenticated();
    }
  }, [setAuthenticated, setUnauthenticated]);

  useEffect(() => {
    if (authStorage.hasTokens()) {
      fetchUser();
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [fetchUser]);

  useEffect(() => {
    const handleExpired = () => setUnauthenticated();
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [setUnauthenticated]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    authStorage.setTokens(res.accessToken, res.refreshToken);
    setAuthenticated(res.user);
  }, [setAuthenticated]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await authApi.register({ username, email, password });
    authStorage.setTokens(res.accessToken, res.refreshToken);
    setAuthenticated(res.user);
  }, [setAuthenticated]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Silent fail
    }
    setUnauthenticated();
  }, [setUnauthenticated]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
