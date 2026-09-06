// ============================================
// LIFE'S — API Service base
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  return localStorage.getItem('lifes_token');
}

function jsonHeaders(withAuth = true): HeadersInit {
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

function authHeaderOnly(): HeadersInit {
  const h: HeadersInit = {};
  const token = getToken();
  if (token) (h as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  return h;
}

// Para endpoints con body JSON (todo lo que no sube un archivo)
async function request<T>(
  endpoint: string,
  method: string = 'GET',
  body?: unknown,
  withAuth = true
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: jsonHeaders(withAuth),
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

// Para endpoints que suben un archivo (avatar, portada, recuerdos, familiares con foto).
// OJO: nunca le pongas Content-Type manual acá — el navegador tiene que generar
// el boundary del multipart solo, igual que vimos en Postman.
async function requestFormData<T>(
  endpoint: string,
  method: string,
  formData: FormData
): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: authHeaderOnly(),
    body: formData,
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
  resetPassword: (token: string, newPassword: string) =>
    request('/auth/reset-password', 'POST', { token, newPassword }, false),
  verifyEmail: (token: string) =>
    request('/auth/verify-email', 'POST', { token }, false),
  resendVerification: (email: string) =>
    request('/auth/resend-verification', 'POST', { email }, false),
};

// --- Memorias ---
// NOTA: getByUser (ver recuerdos de otra persona) todavía no existe en el backend,
// hoy /memories siempre devuelve los del usuario logueado. Lo sumamos cuando
// decidamos cómo se comparten recuerdos entre conectados.
export const memoryService = {
  getAll: (page = 1, pageSize = 20) =>
    request(`/memories?page=${page}&pageSize=${pageSize}`),
  getById: (id: string) =>
    request(`/memories/${id}`),
  create: (caption: string | undefined, file?: File) => {
    const fd = new FormData();
    if (caption) fd.append('caption', caption);
    if (file) fd.append('file', file);
    return requestFormData('/memories', 'POST', fd);
  },
  update: (id: string, caption: string) =>
    request(`/memories/${id}`, 'PATCH', { caption }),
  delete: (id: string) =>
    request(`/memories/${id}`, 'DELETE'),
};

// --- Árbol genealógico ---
export const familyService = {
  getTree: () => request('/family/tree'),
  listMembers: () => request('/family/members'),
  getMember: (id: string) => request(`/family/members/${id}`),
  createMember: (fields: Record<string, string>, file?: File) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([key, value]) => fd.append(key, value));
    if (file) fd.append('file', file);
    return requestFormData('/family/members', 'POST', fd);
  },
  updateMember: (id: string, fields: Record<string, string>, file?: File) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([key, value]) => fd.append(key, value));
    if (file) fd.append('file', file);
    return requestFormData(`/family/members/${id}`, 'PATCH', fd);
  },
  deleteMember: (id: string) =>
    request(`/family/members/${id}`, 'DELETE'),
  addPartner: (memberAId: string, memberBId: string) =>
    request('/family/partners', 'POST', { memberAId, memberBId }),
  removePartner: (id: string) =>
    request(`/family/partners/${id}`, 'DELETE'),
  getMyPlacements: () => request('/family/my-placements'),
  linkMember: (id: string, userId: string) =>
    request(`/family/members/${id}/link`, 'PATCH', { userId }),
  unlinkMember: (id: string) =>
    request(`/family/members/${id}/link`, 'DELETE'),
};

// --- Conexiones (invitar / aceptar / rechazar) ---
export const connectionService = {
  sendRequest: (addresseeEmail: string) =>
    request('/connections', 'POST', { addresseeEmail }),
  list: (status?: 'pending' | 'accepted' | 'rejected') =>
    request(`/connections${status ? `?status=${status}` : ''}`),
  accept: (id: string) =>
    request(`/connections/${id}/accept`, 'PATCH'),
  reject: (id: string) =>
    request(`/connections/${id}/reject`, 'PATCH'),
  remove: (id: string) =>
    request(`/connections/${id}`, 'DELETE'),
};

// --- Usuario ---
// NOTA: ver el perfil de OTRA persona y buscar usuarios por nombre todavía no
// existen en el backend — hoy solo hay endpoints para "mi" perfil.
export const userService = {
  getMyProfile: () => request('/auth/me'),
  updateProfile: (data: { bio?: string; country?: string; city?: string; birthDate?: string }) =>
    request('/users/me', 'PATCH', data),
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return requestFormData('/users/me/avatar', 'POST', fd);
  },
  uploadCover: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return requestFormData('/users/me/cover', 'POST', fd);
  },
};

// --- Cápsulas del tiempo, Último tributo, Ecos, Postales, Ahorro ---
// Estos módulos son de Fase 3 (Bóveda) — el backend todavía no existe.
// Las pantallas (TimeCapsule, FarewellVideo, DigitalEcho, Postal, Savings)
// siguen ahí pero van a fallar si intentan pegarle a la API hasta que
// construyamos esos módulos más adelante.
export const capsuleService = {
  getAll: () => request('/capsules'),
  create: (data: unknown) => request('/capsules', 'POST', data),
  delete: (id: string) => request(`/capsules/${id}`, 'DELETE'),
};

export const farewellService = {
  getAll: () => request('/farewells'),
  create: (data: unknown) => request('/farewells', 'POST', data),
  delete: (id: string) => request(`/farewells/${id}`, 'DELETE'),
};

export const echoService = {
  ask: (userId: string, question: string) =>
    request('/echo/ask', 'POST', { userId, question }),
  getHistory: (userId: string) => request(`/echo/history/${userId}`),
};

export const postalService = {
  getAll: () => request('/postals'),
  create: (data: unknown) => request('/postals', 'POST', data),
  getStatus: (id: string) => request(`/postals/${id}/status`),
};

export const savingsService = {
  get: () => request('/savings'),
  create: (data: unknown) => request('/savings', 'POST', data),
  getHistory: () => request('/savings/history'),
};