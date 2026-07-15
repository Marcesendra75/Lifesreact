// ============================================================
// LIFE'S — NavbarEmpresa.tsx
// Navbar lateral para el módulo empresarial
// Desktop: sidebar rail izquierda
// Mobile:  barra inferior fija
// Lucide React | Diferenciada de la Navbar personal
// ============================================================
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2, Activity, GitBranch, Package,
  LayoutDashboard, ChevronRight,
  LogOut, Settings, BadgeCheck,
} from 'lucide-react';
import './NavbarEmpresa.scss';

// ── Ítems de navegación empresarial ───────────────────────
const NAV_ITEMS = [
  {
    ruta:  '/empresas/perfil',
    label: 'Perfil',
    icono: <LayoutDashboard size={20} strokeWidth={1.8} />,
  },
  {
    ruta:  '/empresas/linea-de-vida',
    label: 'Historia',
    icono: <Activity size={20} strokeWidth={1.8} />,
  },
  {
    ruta:  '/empresas/arbol',
    label: 'Árbol',
    icono: <GitBranch size={20} strokeWidth={1.8} />,
  },
  {
    ruta:  '/empresas/planes',
    label: 'Planes',
    icono: <Package size={20} strokeWidth={1.8} />,
  },
];

// ── Rutas donde NO se muestra la navbar empresarial ────────
const RUTAS_OCULTAS = [
  '/', '/login', '/crear-cuenta', '/acceso-seguro',
  '/recuperar', '/tarjeta-legado', '/tarjeta-pendiente',
  '/empresas', '/404',
];

const RUTAS_EMPRESA = [
  '/empresas/perfil',
  '/empresas/linea-de-vida',
  '/empresas/arbol',
  '/empresas/planes',
];

// ── Componente ─────────────────────────────────────────────
export default function NavbarEmpresa() {
  const location = useLocation();
  const navigate  = useNavigate();

  // Solo mostrar en rutas empresariales
  const esRutaEmpresa = RUTAS_EMPRESA.some(r => location.pathname.startsWith(r));
  if (!esRutaEmpresa) return null;
  if (RUTAS_OCULTAS.includes(location.pathname)) return null;

  return (
    <>
      {/* ── DESKTOP: sidebar rail ── */}
      <nav className="nbe-rail" aria-label="Navegación empresarial">

        {/* Logo empresarial */}
        <div className="nbe-rail__logo">
          <div className="nbe-rail__logo-icon">
            <Building2 size={16} strokeWidth={2} />
          </div>
          <div className="nbe-rail__logo-textos">
            <span className="nbe-rail__logo-lifes">Life's</span>
            <span className="nbe-rail__logo-badge">Empresas</span>
          </div>
        </div>

        {/* Empresa activa */}
        <div className="nbe-rail__empresa-activa">
          <div className="nbe-rail__empresa-avatar">
            <img src="https://i.pravatar.cc/32?img=70" alt="Empresa" />
          </div>
          <div className="nbe-rail__empresa-info">
            <span className="nbe-rail__empresa-nombre">Banco Nación</span>
            <span className="nbe-rail__empresa-estado">
              <BadgeCheck size={10} strokeWidth={2} />
              Verificado
            </span>
          </div>
          <ChevronRight size={14} strokeWidth={1.8} className="nbe-rail__empresa-arrow" />
        </div>

        {/* Ítems */}
        <ul className="nbe-rail__items">
          {NAV_ITEMS.map(item => (
            <li key={item.ruta}>
              <NavLink
                to={item.ruta}
                className={({ isActive }) =>
                  `nbe-rail__link${isActive ? ' active' : ''}`
                }
              >
                <span className="nbe-rail__icon">{item.icono}</span>
                <span className="nbe-rail__label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="nbe-rail__footer">
          <button
            className="nbe-rail__footer-btn"
            onClick={() => navigate('/empresas')}
            title="Configuración"
          >
            <Settings size={17} strokeWidth={1.8} />
            <span>Configuración</span>
          </button>
          <button
            className="nbe-rail__footer-btn nbe-rail__footer-btn--salir"
            onClick={() => navigate('/')}
            title="Salir al modo personal"
          >
            <LogOut size={17} strokeWidth={1.8} />
            <span>Salir</span>
          </button>
        </div>
      </nav>

      {/* ── MOBILE: bottom bar ── */}
      <nav className="nbe-bottom" aria-label="Navegación empresarial móvil">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            className={({ isActive }) =>
              `nbe-bottom__item${isActive ? ' active' : ''}`
            }
          >
            <span className="nbe-bottom__icon">{item.icono}</span>
            <span className="nbe-bottom__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
