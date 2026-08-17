// ============================================================
// LIFE'S — Navbar.tsx | Componente compartido de navegación
// Desktop: sidebar rail izquierda (íconos → expande al hover)
// Mobile:  barra inferior fija con 5 ítems
// Íconos: Lucide React
// ============================================================
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Activity, GitBranch, User, Lock,
} from 'lucide-react';
import './Navbar.scss';

const NAV_ITEMS = [
  { ruta: '/feed',              label: 'Feed',          icono: <Home      size={22} strokeWidth={1.8} /> },
  { ruta: '/linea-de-vida',     label: 'Línea de Vida', icono: <Activity  size={22} strokeWidth={1.8} /> },
  { ruta: '/arbol-genealogico', label: 'Árbol',         icono: <GitBranch size={22} strokeWidth={1.8} /> },
  { ruta: '/perfil',            label: 'Perfil',        icono: <User      size={22} strokeWidth={1.8} /> },
];

const RUTAS_OCULTAS = [
  '/', '/login', '/crear-cuenta', '/acceso-seguro',
  '/recuperar', '/tarjeta-legado', '/tarjeta-pendiente',
  '/empresas', '/empresas/planes', '/404',
];

export default function Navbar() {
  const location = useLocation();
  if (RUTAS_OCULTAS.includes(location.pathname)) return null;
  if (
    location.pathname.startsWith('/empresas/perfil') ||
    location.pathname.startsWith('/empresas/linea-de-vida') ||
    location.pathname.startsWith('/empresas/arbol') ||
    location.pathname.startsWith('/empresas/admin') ||
    location.pathname.startsWith('/empresas/login-admin') ||
    location.pathname.startsWith('/lifes-admin')
  ) return null;

  return (
    <>
      {/* ── DESKTOP: sidebar rail ── */}
      <nav className="navbar-rail" aria-label="Navegación principal">
        <div className="navbar-rail__logo">
          <span className="navbar-rail__logo-icon">L</span>
          <span className="navbar-rail__logo-text">Life's</span>
        </div>
        <ul className="navbar-rail__items">
          {NAV_ITEMS.map(item => (
            <li key={item.ruta}>
              <NavLink
                to={item.ruta}
                className={({ isActive }) => `navbar-rail__link${isActive ? ' active' : ''}`}
              >
                <span className="navbar-rail__icon">{item.icono}</span>
                <span className="navbar-rail__label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="navbar-rail__boveda">
          <NavLink to="/caja-fuerte" className="navbar-rail__boveda-btn" title="Bóveda">
            <Lock size={18} strokeWidth={1.8} />
            <span>Bóveda</span>
          </NavLink>
        </div>
      </nav>

      {/* ── MOBILE: bottom bar ── */}
      <nav className="navbar-bottom" aria-label="Navegación móvil">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            className={({ isActive }) => `navbar-bottom__item${isActive ? ' active' : ''}`}
          >
            <span className="navbar-bottom__icon">{item.icono}</span>
            <span className="navbar-bottom__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
