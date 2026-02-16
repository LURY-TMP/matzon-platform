'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { authApi, usersApi } from '@/lib/api';

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
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'matzon_access_token';
const REFRESH_KEY = 'matzon_refresh_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_KEY, refreshToken);
    }
  }, []);

  const clearTokens = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  }, []);

  const fetchUser = useCallback(async (token: string) => {
    try {
      const user = await usersApi.me(token) as User;
      setState({
        user,
        accessToken: token,
        refreshToken: localStorage.getItem(REFRESH_KEY),
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      clearTokens();
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, [clearTokens]);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchUser(token);
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password }) as any;
    setTokens(res.accessToken, res.refreshToken);
    setState({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      isLoading: false,
      isAuthenticated: true,
    });
  }, [setTokens]);

  const register = useCallback(async (username: string, email: string, password: string) => {
    const res = await authApi.register({ username, email, password }) as any;
    setTokens(res.accessToken, res.refreshToken);
    setState({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      isLoading: false,
      isAuthenticated: true,
    });
  }, [setTokens]);

  const logout = useCallback(async () => {
    try {
      if (state.accessToken) {
        await authApi.logout(state.accessToken);
      }
    } catch {
      // Silent fail
    }
    clearTokens();
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, [state.accessToken, clearTokens]);

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
