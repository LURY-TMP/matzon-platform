const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface RequestOptions {
  method?: string;
  body?: any;
  token?: string;
  headers?: Record<string, string>;
}

export async function api<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api('/auth/login', { method: 'POST', body: data }),

  register: (data: { username: string; email: string; password: string }) =>
    api('/auth/register', { method: 'POST', body: data }),

  refresh: (refreshToken: string) =>
    api('/auth/refresh', { method: 'POST', body: { refreshToken } }),

  logout: (token: string) =>
    api('/auth/logout', { method: 'POST', token }),
};

export const usersApi = {
  me: (token: string) =>
    api('/users/me', { token }),

  update: (token: string, data: any) =>
    api('/users/me', { method: 'PATCH', body: data, token }),

  leaderboard: (page = 1, limit = 20) =>
    api(`/users/leaderboard?page=${page}&limit=${limit}`),

  getByUsername: (username: string) =>
    api(`/users/${username}`),
};

export const tournamentsApi = {
  list: (params?: { game?: string; status?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.game) query.set('game', params.game);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    return api(`/tournaments?${query}`);
  },

  getById: (id: string) =>
    api(`/tournaments/${id}`),

  create: (token: string, data: any) =>
    api('/tournaments', { method: 'POST', body: data, token }),

  join: (token: string, id: string) =>
    api(`/tournaments/${id}/join`, { method: 'POST', token }),

  leave: (token: string, id: string) =>
    api(`/tournaments/${id}/leave`, { method: 'POST', token }),
};

export const matchesApi = {
  list: (params?: { tournamentId?: string; status?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.tournamentId) query.set('tournamentId', params.tournamentId);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    return api(`/matches?${query}`);
  },

  getById: (id: string) =>
    api(`/matches/${id}`),
};
