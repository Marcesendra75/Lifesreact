// ============================================
// LIFE'S — Tipos TypeScript globales
// ============================================

// --- Niveles de membresía ---
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
  id: number;
  username: string;
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
  // Seguridad
  securityLevel: SecurityLevel;   // 'standard' | 'triple'
  vaultStatus: VaultStatus;       // estado de la tarjeta física
  createdAt: string;
  updatedAt: string;
}

// --- Auth ---
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Sesión de bóveda (dura 15 min tras triple verificación)
  vaultSession: boolean;
  vaultSessionExpiry: number | null; // timestamp ms
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
  // Empresa
  companyName?: string;
  cuit?: string;
}

// --- Tarjeta física (bóveda) ---
export interface VaultCard {
  id: number;
  userId: number;
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
// Páginas que requieren Triple Seguridad OBLIGATORIA
export const VAULT_ROUTES = [
  '/caja-fuerte',
  '/caja-de-valores',
  '/testamento',
  '/herederos',
  '/ahorro',
  '/ultimo-tributo',
] as const;

// Páginas que pueden tener Triple Seguridad OPCIONAL
export const OPTIONAL_VAULT_ROUTES = [
  '/capsula-del-tiempo',
  '/postal',
] as const;

// --- Memoria / Posts ---
export type MemoryType =
  | 'photo'
  | 'video'
  | 'text'
  | 'audio'
  | 'milestone';

export interface Memory {
  id: number;
  userId: number;
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
export interface FamilyMember {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  avatarUrl?: string;
  relation: string;
  parentIds?: number[];
  childIds?: number[];
  spouseIds?: number[];
  country?: string;
  city?: string;
  bio?: string;
}

// --- Cápsula del tiempo ---
export interface TimeCapsule {
  id: number;
  userId: number;
  title: string;
  message?: string;
  videoUrl?: string;
  recipientEmail: string;
  recipientName: string;
  scheduledDate: string;
  isSent: boolean;
  createdAt: string;
}

// --- Último tributo ---
export interface FarewellVideo {
  id: number;
  userId: number;
  title: string;
  videoUrl: string;
  recipientName: string;
  recipientEmail?: string;
  message?: string;
  isPrivate: boolean;
  createdAt: string;
}

// --- Ahorro forzoso ---
export interface SavingsPlan {
  id: number;
  userId: number;
  monthlyAmount: number;
  currency: string;
  startDate: string;
  unlockDate: string;
  currentBalance: number;
  interestRate: number;
  isActive: boolean;
}

// --- Postales ---
export interface DigitalPostal {
  id: number;
  userId: number;
  memoryId: number;
  recipientName: string;
  recipientAddress: string;
  recipientCountry: string;
  calligraphyFont: string;
  message: string;
  status: 'pending' | 'paid' | 'printing' | 'shipped' | 'delivered';
  trackingCode?: string;
  createdAt: string;
}

// --- Ecos del Pasado (IA) ---
export interface DigitalEcho {
  id: number;
  userId: number;
  question: string;
  answer: string;
  createdAt: string;
}

// --- Herederos ---
export interface Heir {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  relation: string;
  percentage: number; // % de herencia
  isVerified: boolean;
  createdAt: string;
}

// --- Testamento ---
export interface Testament {
  id: number;
  userId: number;
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

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
