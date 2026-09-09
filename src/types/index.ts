// ============================================
// LIFE'S — Tipos TypeScript globales
// ============================================

// --- Niveles de membresía ---
// NOTA: el backend hoy solo soporta bronze | silver | gold | diamond.
// gold2 y triple_diamond son ideas a futuro, todavía no existen en la base.
export type MembershipLevel =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'gold2'
  | 'diamond'
  | 'triple_diamond';

// --- Niveles de seguridad ---
export type SecurityLevel = 'standard' | 'triple';
export type VaultStatus   = 'no_card' | 'requested' | 'shipped' | 'active';

// --- Roles de privacidad ---
export type PrivacyRole =
  | 'public'
  | 'family'
  | 'friend'
  | 'acquaintance'
  | 'partner'
  | 'follower'
  | 'private';

// --- Usuario ---
export interface User {
  id: string;
  username?: string; // el backend todavía no tiene username, queda opcional
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  membershipLevel: MembershipLevel;
  isVerified: boolean;
  isPrivate: boolean;
  commentPrivacy: 'everyone' | 'connections' | 'nobody';
  // Seguridad (Fase 3, Bóveda — el backend todavía no devuelve estos campos)
  securityLevel?: SecurityLevel;
  vaultStatus?: VaultStatus;
  createdAt: string;
  updatedAt: string;
}

// --- Auth ---
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  vaultSession: boolean;
  vaultSessionExpiry: number | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate?: string;
  companyName?: string;
  cuit?: string;
  acceptedTerms: boolean;
}

// --- Tarjeta física (bóveda) — Fase 3, no implementado en backend ---
export interface VaultCard {
  id: string;
  userId: string;
  legalName: string;
  dni: string;
  address: string;
  phone: string;
  country: string;
  status: 'requested' | 'shipped' | 'active';
  qrCode?: string;
  requestedAt: string;
  activatedAt?: string;
}

// --- Rutas protegidas ---
export const VAULT_ROUTES = [
  '/caja-fuerte',
  '/caja-de-valores',
  '/testamento',
  '/herederos',
  '/ahorro',
  '/ultimo-tributo',
] as const;

export const OPTIONAL_VAULT_ROUTES = [
  '/capsula-del-tiempo',
  '/postal',
] as const;

// --- Memoria / Posts ---
// NOTA: el backend hoy solo guarda caption + un archivo (mediaKey/mediaType/mediaUrl).
// Campos como likes, comentarios, tags, privacy, title, location todavía NO existen
// en la base — son la decisión de producto que hablamos (recortar vs. ampliar).
export type MemoryType =
  | 'photo'
  | 'video'
  | 'text'
  | 'audio'
  | 'milestone';

export interface Memory {
  id: string;
  userId: string;
  type: MemoryType;
  title: string;
  description?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  date: string;
  location?: string;
  privacy: PrivacyRole;
  tags?: string[];
  likes: number;
  comments: number;
  createdAt: string;
}

// --- Árbol genealógico ---
// NOTA: el backend usa motherId/fatherId + una tabla de parejas aparte,
// no un solo parentId ni arrays de spouseIds/childIds. Esto se reconcilia
// cuando reescribamos FamilyTree.tsx para usar datos reales.
export interface FamilyMember {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  avatarUrl?: string;
  relation: string;
  parentIds?: string[];
  childIds?: string[];
  spouseIds?: string[];
  country?: string;
  city?: string;
  bio?: string;
}

// --- Cápsula del tiempo (Fase 3) ---
export interface TimeCapsule {
  id: string;
  userId: string;
  title: string;
  message?: string;
  videoUrl?: string;
  recipientEmail: string;
  recipientName: string;
  scheduledDate: string;
  isSent: boolean;
  createdAt: string;
}

// --- Último tributo (Fase 3) ---
export interface FarewellVideo {
  id: string;
  userId: string;
  title: string;
  videoUrl: string;
  recipientName: string;
  recipientEmail?: string;
  message?: string;
  isPrivate: boolean;
  createdAt: string;
}

// --- Ahorro forzoso (Fase 3) ---
export interface SavingsPlan {
  id: string;
  userId: string;
  monthlyAmount: number;
  currency: string;
  startDate: string;
  unlockDate: string;
  currentBalance: number;
  interestRate: number;
  isActive: boolean;
}

// --- Postales (Fase 3) ---
export interface DigitalPostal {
  id: string;
  userId: string;
  memoryId: string;
  recipientName: string;
  recipientAddress: string;
  recipientCountry: string;
  calligraphyFont: string;
  message: string;
  status: 'pending' | 'paid' | 'printing' | 'shipped' | 'delivered';
  trackingCode?: string;
  createdAt: string;
}

// --- Ecos del Pasado (Fase 3) ---
export interface DigitalEcho {
  id: string;
  userId: string;
  question: string;
  answer: string;
  createdAt: string;
}

// --- Herederos (Fase 3) ---
export interface Heir {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  relation: string;
  percentage: number;
  isVerified: boolean;
  createdAt: string;
}

// --- Testamento (Fase 3) ---
export interface Testament {
  id: string;
  userId: string;
  content: string;
  videoUrl?: string;
  isLocked: boolean;
  lastModified: string;
  createdAt: string;
}

// --- API Response genérica ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Coincide con la forma real que devuelve nuestro backend para listas paginadas
// (ej: GET /memories) — los items van adentro de "data", no "data" como array directo.
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
