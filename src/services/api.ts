// ============================================
// LIFE'S — API Service base
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  return localStorage.getItem('lifes_token');
}

function headers(withAuth = true): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

async function request<T>(
  endpoint: string,
  method: string = 'GET',
  body?: unknown,
  withAuth = true
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: headers(withAuth),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

// --- Auth ---
export const authService = {
  login: (email: string, password: string) =>
    request('/auth/login', 'POST', { email, password }, false),
  register: (data: unknown) =>
    request('/auth/register', 'POST', data, false),
  me: () => request('/auth/me'),
  forgotPassword: (email: string) =>
    request('/auth/forgot-password', 'POST', { email }, false),
};

// --- Memorias ---
export const memoryService = {
  getAll: (page = 1, limit = 12) =>
    request(`/memories?page=${page}&limit=${limit}`),
  getById: (id: number) =>
    request(`/memories/${id}`),
  getByUser: (userId: number, page = 1) =>
    request(`/memories/user/${userId}?page=${page}`),
  create: (data: unknown) =>
    request('/memories', 'POST', data),
  update: (id: number, data: unknown) =>
    request(`/memories/${id}`, 'PUT', data),
  delete: (id: number) =>
    request(`/memories/${id}`, 'DELETE'),
};

// --- Árbol genealógico ---
export const familyService = {
  getTree: (userId?: number) =>
    request(`/family${userId ? `?userId=${userId}` : ''}`),
  addMember: (data: unknown) =>
    request('/family', 'POST', data),
  updateMember: (id: number, data: unknown) =>
    request(`/family/${id}`, 'PUT', data),
  deleteMember: (id: number) =>
    request(`/family/${id}`, 'DELETE'),
};

// --- Cápsulas del tiempo ---
export const capsuleService = {
  getAll: () => request('/capsules'),
  create: (data: unknown) => request('/capsules', 'POST', data),
  delete: (id: number) => request(`/capsules/${id}`, 'DELETE'),
};

// --- Último tributo ---
export const farewellService = {
  getAll: () => request('/farewells'),
  create: (data: unknown) => request('/farewells', 'POST', data),
  delete: (id: number) => request(`/farewells/${id}`, 'DELETE'),
};

// --- Ecos del pasado ---
export const echoService = {
  ask: (userId: number, question: string) =>
    request('/echo/ask', 'POST', { userId, question }),
  getHistory: (userId: number) =>
    request(`/echo/history/${userId}`),
};

// --- Postales ---
export const postalService = {
  getAll: () => request('/postals'),
  create: (data: unknown) => request('/postals', 'POST', data),
  getStatus: (id: number) => request(`/postals/${id}/status`),
};

// --- Ahorro forzoso ---
export const savingsService = {
  get: () => request('/savings'),
  create: (data: unknown) => request('/savings', 'POST', data),
  getHistory: () => request('/savings/history'),
};

// --- Usuario ---
export const userService = {
  getProfile: (userId?: number) =>
    request(`/users${userId ? `/${userId}` : '/me'}`),
  updateProfile: (data: unknown) =>
    request('/users/me', 'PUT', data),
  updateAvatar: (data: unknown) =>
    request('/users/me/avatar', 'PUT', data),
  search: (query: string) =>
    request(`/users/search?q=${encodeURIComponent(query)}`),
};
