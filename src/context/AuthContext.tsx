// ============================================
// LIFE'S — AuthContext con soporte de bóveda
// ============================================
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthState, LoginCredentials, RegisterData } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<{ message: string }>;
  verifyEmail: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  // Bóveda
  openVaultSession: () => void;   // llamar tras triple verificación exitosa
  closeVaultSession: () => void;  // cerrar sesión de bóveda manualmente
  isVaultSessionActive: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const VAULT_SESSION_DURATION = 15 * 60 * 1000; // 15 minutos en ms

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('lifes_token'),
    isAuthenticated: false,
    isLoading: true,
    vaultSession: false,
    vaultSessionExpiry: null,
  });

  // Verificar token al cargar
  useEffect(() => {
    const token = localStorage.getItem('lifes_token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Auto-cerrar sesión de bóveda al expirar
  useEffect(() => {
    if (!state.vaultSession || !state.vaultSessionExpiry) return;
    const remaining = state.vaultSessionExpiry - Date.now();
    if (remaining <= 0) { closeVaultSession(); return; }
    const timeout = setTimeout(closeVaultSession, remaining);
    return () => clearTimeout(timeout);
  }, [state.vaultSession, state.vaultSessionExpiry]);

  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setState(prev => ({
          ...prev,
          user: data.data,
          token,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  const login = async (credentials: LoginCredentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
    localStorage.setItem('lifes_token', data.data.token);
    setState(prev => ({
      ...prev,
      user: data.data.user,
      token: data.data.token,
      isAuthenticated: true,
      isLoading: false,
    }));
  };

  const register = async (formData: RegisterData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al registrarse');
    // OJO: ya no logueamos automáticamente acá — la cuenta queda pendiente
    // hasta que confirme el email, así que no hay token todavía.
    return { message: data.message as string };
  };

  const verifyEmail = async (token: string) => {
    const res = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al verificar el email');
    localStorage.setItem('lifes_token', data.data.token);
    setState(prev => ({
      ...prev,
      user: data.data.user,
      token: data.data.token,
      isAuthenticated: true,
      isLoading: false,
    }));
  };

  const refreshUser = async () => {
    const token = state.token || localStorage.getItem('lifes_token');
    if (!token) return;
    await fetchCurrentUser(token);
  };

  const logout = () => {
    localStorage.removeItem('lifes_token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      vaultSession: false,
      vaultSessionExpiry: null,
    });
  };

  // ── Bóveda ──
  const openVaultSession = () => {
    setState(prev => ({
      ...prev,
      vaultSession: true,
      vaultSessionExpiry: Date.now() + VAULT_SESSION_DURATION,
    }));
  };

  const closeVaultSession = () => {
    setState(prev => ({
      ...prev,
      vaultSession: false,
      vaultSessionExpiry: null,
    }));
  };

  const isVaultSessionActive = (): boolean => {
    if (!state.vaultSession || !state.vaultSessionExpiry) return false;
    return Date.now() < state.vaultSessionExpiry;
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      verifyEmail,
      logout,
      refreshUser,
      openVaultSession,
      closeVaultSession,
      isVaultSessionActive,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}

