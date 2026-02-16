import { authStorage } from './auth-storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

interface RequestOptions {
  method?: string;
  body?: any;
  token?: string;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      authStorage.clear();
      return null;
    }

    const data = await response.json();
    authStorage.setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    authStorage.clear();
    return null;
  }
}

export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers = {}, skipAuth = false } = options;
  const authToken = token || (!skipAuth ? authStorage.getAccessToken() : null);

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  };

  if (body) config.body = JSON.stringify(body);

  let response = await fetch(`${API_URL}${endpoint}`, config);

  if (response.status === 401 && !skipAuth && !endpoint.includes('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken();
    }

    const newToken = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (newToken) {
      const retryConfig: RequestInit = {
        ...config,
        headers: { ...config.headers as Record<string, string>, Authorization: `Bearer ${newToken}` },
      };
      response = await fetch(`${API_URL}${endpoint}`, retryConfig);
    } else {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:expired'));
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api<{ user: any; accessToken: string; refreshToken: string; expiresIn: number }>(
      '/auth/login', { method: 'POST', body: data, skipAuth: true }),

  register: (data: { username: string; email: string; password: string }) =>
    api<{ user: any; accessToken: string; refreshToken: string; expiresIn: number }>(
      '/auth/register', { method: 'POST', body: data, skipAuth: true }),

  refresh: (refreshToken: string) =>
    api<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      '/auth/refresh', { method: 'POST', body: { refreshToken }, skipAuth: true }),

  logout: () => api('/auth/logout', { method: 'POST' }),
};

export const usersApi = {
  me: () => api<any>('/users/me'),
  update: (data: any) => api('/users/me', { method: 'PATCH', body: data }),
  leaderboard: (page = 1, limit = 20) => api(`/users/leaderboard?page=${page}&limit=${limit}`, { skipAuth: true }),
  getByUsername: (username: string) => api(`/users/${username}`, { skipAuth: true }),
};

export const socialApi = {
  follow: (userId: string) => api(`/users/${userId}/follow`, { method: 'POST' }),
  unfollow: (userId: string) => api(`/users/${userId}/follow`, { method: 'DELETE' }),
  getFollowers: (userId: string, cursor?: string) =>
    api<any>(`/users/${userId}/followers${cursor ? `?cursor=${cursor}` : ''}`),
  getFollowing: (userId: string, cursor?: string) =>
    api<any>(`/users/${userId}/following${cursor ? `?cursor=${cursor}` : ''}`),
  getRelationship: (userId: string) =>
    api<{ isFollowing: boolean; isFollowedBy: boolean; isMutual: boolean }>(`/users/${userId}/relationship`),
};

export const notificationsApi = {
  list: (cursor?: string, limit = 20) =>
    api<any>(`/notifications?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`),
  unreadCount: () => api<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) => api(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => api('/notifications/read-all', { method: 'PATCH' }),
};

export const tournamentsApi = {
  list: (params?: { game?: string; status?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.game) query.set('game', params.game);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    return api(`/tournaments?${query}`, { skipAuth: true });
  },
  getById: (id: string) => api(`/tournaments/${id}`, { skipAuth: true }),
  create: (data: any) => api('/tournaments', { method: 'POST', body: data }),
  join: (id: string) => api(`/tournaments/${id}/join`, { method: 'POST' }),
  leave: (id: string) => api(`/tournaments/${id}/leave`, { method: 'POST' }),
};

export const matchesApi = {
  list: (params?: { tournamentId?: string; status?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.tournamentId) query.set('tournamentId', params.tournamentId);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    return api(`/matches?${query}`, { skipAuth: true });
  },
  getById: (id: string) => api(`/matches/${id}`, { skipAuth: true }),
};

export const feedApi = {
  personal: (cursor?: string, limit = 20) =>
    api<any>(`/feed?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`),
  global: (cursor?: string, limit = 20) =>
    api<any>(`/feed/global?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`, { skipAuth: true }),
  userEvents: (userId: string, cursor?: string) =>
    api<any>(`/feed/user/${userId}${cursor ? `?cursor=${cursor}` : ''}`, { skipAuth: true }),
};

export const reputationApi = {
  me: () => api<any>('/reputation/me'),
  getUser: (userId: string) => api<any>(`/reputation/user/${userId}`, { skipAuth: true }),
  followLimit: () => api<{ allowed: boolean; limit: number; current: number }>('/reputation/me/follow-limit'),
};
