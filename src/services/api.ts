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
    cache: 'no-store', // los datos cambian todo el tiempo (reacciones, comentarios, etc.) — nunca server desde la caché del navegador
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
  verifyResetCode: (email: string, code: string) =>
    request('/auth/verify-reset-code', 'POST', { email, code }, false),
  resetPassword: (email: string, code: string, newPassword: string) =>
    request('/auth/reset-password', 'POST', { email, code, newPassword }, false),
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
  getFeed: (page = 1, pageSize = 20) =>
    request(`/memories/feed?page=${page}&pageSize=${pageSize}`),
  getSaved: (page = 1, pageSize = 20) =>
    request(`/memories/saved?page=${page}&pageSize=${pageSize}`),
  getById: (id: string) =>
    request(`/memories/${id}`),
  getByUser: (userId: string, page = 1, pageSize = 20) =>
    request(`/memories/user/${userId}?page=${page}&pageSize=${pageSize}`),
  create: (caption: string | undefined, file?: File, chapterId?: string) => {
    const fd = new FormData();
    if (caption) fd.append('caption', caption);
    if (chapterId) fd.append('chapterId', chapterId);
    if (file) fd.append('file', file);
    return requestFormData('/memories', 'POST', fd);
  },
  update: (id: string, caption: string) =>
    request(`/memories/${id}`, 'PATCH', { caption }),
  delete: (id: string) =>
    request(`/memories/${id}`, 'DELETE'),
  setReaction: (id: string, type: string) =>
    request(`/memories/${id}/reaction`, 'POST', { type }),
  share: (id: string) =>
    request(`/memories/${id}/share`, 'POST'),
  listReactions: (id: string) =>
    request(`/memories/${id}/reactions`),
  listComments: (id: string, page = 1, pageSize = 20) =>
    request(`/memories/${id}/comments?page=${page}&pageSize=${pageSize}`),
  addComment: (id: string, content: string, parentId?: string) =>
    request(`/memories/${id}/comments`, 'POST', { content, parentId }),
  deleteComment: (id: string, commentId: string) =>
    request(`/memories/${id}/comments/${commentId}`, 'DELETE'),
  listReplies: (commentId: string) =>
    request(`/memories/comments/${commentId}/replies`),
  setCommentReaction: (commentId: string, type: string) =>
    request(`/memories/comments/${commentId}/reaction`, 'POST', { type }),
  listCommentReactions: (commentId: string) =>
    request(`/memories/comments/${commentId}/reactions`),
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
  updatePosition: (id: string, posX: number, posY: number) =>
    request(`/family/members/${id}/position`, 'PATCH', { posX, posY }),
  getMyPlacements: () => request('/family/my-placements'),
  getPendingLinks: () => request('/family/pending-links'),
  deleteTree: () => request('/family/tree', 'DELETE'),
  proposeLink: (id: string, userId: string) =>
    request(`/family/members/${id}/link`, 'PATCH', { userId }),
  acceptLink: (id: string) =>
    request(`/family/members/${id}/accept-link`, 'PATCH'),
  rejectLink: (id: string) =>
    request(`/family/members/${id}/reject-link`, 'PATCH'),
  cancelLink: (id: string) =>
    request(`/family/members/${id}/cancel-link`, 'PATCH'),
  unlinkMember: (id: string) =>
    request(`/family/members/${id}/link`, 'DELETE'),
  previewCopyTree: (id: string) =>
    request(`/family/members/${id}/copy-preview`),
  copyTree: (id: string, fusiones: { sourceId: string; existingId: string }[] = []) =>
    request(`/family/members/${id}/copy`, 'POST', { fusiones }),
};

// --- Conexiones (invitar / aceptar / rechazar) ---
export const blockService = {
  block: (userId: string) => request('/blocks', 'POST', { userId }),
  unblock: (id: string) => request(`/blocks/${id}`, 'DELETE'),
  list: () => request('/blocks'),
};

export const connectionService = {
  sendRequest: (addresseeEmail: string) =>
    request('/connections', 'POST', { addresseeEmail }),
  sendRequestById: (addresseeId: string) =>
    request('/connections/by-id', 'POST', { addresseeId }),
  list: (status?: 'pending' | 'accepted' | 'rejected') =>
    request(`/connections${status ? `?status=${status}` : ''}`),
  accept: (id: string) =>
    request(`/connections/${id}/accept`, 'PATCH'),
  reject: (id: string) =>
    request(`/connections/${id}/reject`, 'PATCH'),
  remove: (id: string) =>
    request(`/connections/${id}`, 'DELETE'),
  proposeType: (id: string, relationType: string) =>
    request(`/connections/${id}/propose-type`, 'PATCH', { relationType }),
  acceptType: (id: string) =>
    request(`/connections/${id}/accept-type`, 'PATCH'),
  rejectType: (id: string) =>
    request(`/connections/${id}/reject-type`, 'PATCH'),
  cancelType: (id: string) =>
    request(`/connections/${id}/cancel-type`, 'PATCH'),
};

// --- Usuario ---
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
  search: (q: string, page = 1, pageSize = 15) =>
    request(`/users/search?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`),
  updatePrivacy: (isPrivate: boolean) =>
    request('/users/me/privacy', 'PATCH', { isPrivate }),
  updateCommentPrivacy: (commentPrivacy: 'everyone' | 'connections' | 'nobody') =>
    request('/users/me/comment-privacy', 'PATCH', { commentPrivacy }),
  getById: (id: string) =>
    request(`/users/${id}`),
  getSuggestions: () =>
    request('/users/suggestions'),
  getMutuals: (id: string) =>
    request(`/users/${id}/mutuals`),
};

// --- Capítulos de vida ---
export const chapterService = {
  list: () => request('/chapters'),
  create: (data: { nombre: string; desde: number; hasta: number; color: string; emoji?: string }) =>
    request('/chapters', 'POST', data),
  update: (id: string, data: Partial<{ nombre: string; desde: number; hasta: number; color: string; emoji: string }>) =>
    request(`/chapters/${id}`, 'PATCH', data),
  delete: (id: string) =>
    request(`/chapters/${id}`, 'DELETE'),
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


export const notificationService = {
  list: (page = 1, pageSize = 20) =>
    request(`/notifications?page=${page}&pageSize=${pageSize}`),
  unreadCount: () =>
    request('/notifications/unread-count'),
  markRead: (id: string) =>
    request(`/notifications/${id}/read`, 'PATCH'),
  markAllRead: () =>
    request('/notifications/read-all', 'PATCH'),
};

export const reportService = {
  create: (entityType: 'memory' | 'comment' | 'user', entityId: string, reason: string, detalle?: string) =>
    request('/reports', 'POST', { entityType, entityId, reason, detalle }),
};

export const interactionService = {
  hide: (memoryId: string) => request(`/interactions/hide/${memoryId}`, 'POST'),
  unhide: (memoryId: string) => request(`/interactions/hide/${memoryId}`, 'DELETE'),
  mute: (userId: string, duracion: 'temporal' | 'permanente' = 'permanente') =>
    request('/interactions/mute', 'POST', { userId, duracion }),
  unmute: (userId: string) => request(`/interactions/mute/${userId}`, 'DELETE'),
  listMuted: () => request('/interactions/mute'),
  save: (memoryId: string) => request(`/interactions/save/${memoryId}`, 'POST'),
  unsave: (memoryId: string) => request(`/interactions/save/${memoryId}`, 'DELETE'),
  listSavedIds: () => request(`/interactions/save`),
  hideComment: (commentId: string) => request(`/interactions/hide-comment/${commentId}`, 'POST'),
  unhideComment: (commentId: string) => request(`/interactions/hide-comment/${commentId}`, 'DELETE'),
};