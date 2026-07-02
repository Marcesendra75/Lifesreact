// ============================================================
// LIFE'S — Settings.tsx
// Centro de control de identidad y legado
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Bell, Globe, CreditCard, Moon, Users,
  AlertTriangle, ChevronRight, LogOut, Check, X,
  Shield, Fingerprint, Smartphone, Eye, EyeOff,
  Download, Trash2, PauseCircle, BookOpen, GitBranch,
  Heart, Camera, Mail, Phone, MapPin, Edit2,
} from 'lucide-react';
import './Settings.scss';

// ── Tipos ──────────────────────────────────────────────────
type Seccion =
  | 'identidad' | 'seguridad' | 'notificaciones'
  | 'privacidad' | 'plan' | 'apariencia'
  | 'vinculos' | 'peligro' | null;

interface ToggleItem {
  id: string;
  label: string;
  sub: string;
  value: boolean;
}

// ── Datos del perfil mock ──────────────────────────────────
const PERFIL = {
  nombre:   'Marcelo García',
  email:    'marcelo@tusegurosalud.com.ar',
  telefono: '+54 261 555-0142',
  ciudad:   'Mendoza, Argentina',
  avatar:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  nivel:    'Oro',
  nivelColor: '#C9932A',
};

// ── Items de completitud del legado ───────────────────────
const COMPLETITUD_ITEMS = [
  { label: 'Perfil completo',        hecho: true,  pts: 15, ruta: '/perfil' },
  { label: 'Foto de portada',        hecho: true,  pts: 5,  ruta: '/perfil' },
  { label: 'Barra de vida',          hecho: true,  pts: 10, ruta: '/perfil' },
  { label: 'Línea de vida (3+ rec.)',hecho: true,  pts: 20, ruta: '/linea-de-vida' },
  { label: 'Árbol genealógico',      hecho: false, pts: 15, ruta: '/arbol-genealogico' },
  { label: 'Frase de legado',        hecho: true,  pts: 5,  ruta: '/perfil' },
  { label: 'Herederos definidos',    hecho: false, pts: 15, ruta: '/herederos' },
  { label: 'Testamento digital',     hecho: false, pts: 10, ruta: '/testamento' },
  { label: 'Cápsula del tiempo',     hecho: false, pts: 5,  ruta: '/capsula-del-tiempo' },
];

const PTS_TOTAL  = COMPLETITUD_ITEMS.reduce((a, i) => a + i.pts, 0);
const PTS_HECHOS = COMPLETITUD_ITEMS.filter(i => i.hecho).reduce((a, i) => a + i.pts, 0);
const PCT        = Math.round((PTS_HECHOS / PTS_TOTAL) * 100);

// ── Secciones del menú ────────────────────────────────────
const MENU_ITEMS = [
  { id: 'identidad',      label: 'Mi Identidad',        sub: 'Datos personales y foto',             icono: User,         color: '#3a5a8a' },
  { id: 'seguridad',      label: 'Seguridad y Acceso',  sub: 'Contraseña, PIN, biometría',          icono: Lock,         color: '#735c00' },
  { id: 'notificaciones', label: 'Notificaciones',       sub: 'Qué recibir y cuándo',               icono: Bell,         color: '#855324' },
  { id: 'privacidad',     label: 'Privacidad',           sub: 'Quién ve qué, control de datos',     icono: Globe,        color: '#4a7a4e' },
  { id: 'plan',           label: 'Mi Plan',              sub: 'Nivel Oro · beneficios y upgrades',  icono: CreditCard,   color: '#C9932A' },
  { id: 'apariencia',     label: 'Apariencia',           sub: 'Tema, fuente, modo oscuro',          icono: Moon,         color: '#5a3a7a' },
  { id: 'vinculos',       label: 'Vínculos y Familia',   sub: 'Relaciones, herederos',              icono: Users,        color: '#2a7a6a' },
  { id: 'peligro',        label: 'Zona de Peligro',      sub: 'Pausar cuenta, eliminar datos',      icono: AlertTriangle, color: '#ba1a1a' },
] as const;

// ── Componente principal ───────────────────────────────────
export default function Settings() {
  const navigate   = useNavigate();
  const [seccion, setSeccion]   = useState<Seccion>(null);
  const [toast, setToast]       = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Notificaciones
  const [notifs, setNotifs] = useState<ToggleItem[]>([
    { id: 'recuerdos',   label: 'Nuevos recuerdos',      sub: 'Cuando alguien sube un recuerdo que te incluye', value: true  },
    { id: 'vinculos',    label: 'Solicitudes de vínculo', sub: 'Cuando alguien quiere conectar contigo',         value: true  },
    { id: 'capsula',     label: 'Cápsulas del tiempo',    sub: 'Cuando una cápsula está lista para abrirse',     value: true  },
    { id: 'postal',      label: 'Postales enviadas',       sub: 'Estado de tus envíos físicos',                  value: false },
    { id: 'marketing',   label: 'Novedades de Life\'s',   sub: 'Nuevas funciones y actualizaciones',             value: false },
  ]);

  // Privacidad
  const [privacidad, setPrivacidad] = useState<ToggleItem[]>([
    { id: 'perfil_pub',  label: 'Perfil público',         sub: 'Cualquier persona puede ver tu perfil',          value: true  },
    { id: 'linea_pub',   label: 'Línea de vida pública',  sub: 'Visible para tus seguidores',                    value: true  },
    { id: 'busqueda',    label: 'Aparecer en búsquedas',  sub: 'Tu perfil aparece en resultados de búsqueda',    value: false },
    { id: 'arbol_pub',   label: 'Árbol genealógico público', sub: 'Tus familiares pueden ver el árbol',          value: true  },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleNotif = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, value: !n.value } : n));
  };

  const togglePriv = (id: string) => {
    setPrivacidad(prev => prev.map(p => p.id === id ? { ...p, value: !p.value } : p));
  };

  // ── Render panel de detalle ──
  const renderDetalle = () => {
    switch (seccion) {

      // ── IDENTIDAD ──
      case 'identidad':
        return (
          <div className="settings-detalle__body">
            <div className="settings-avatar-edit">
              <img src={PERFIL.avatar} alt={PERFIL.nombre} />
              <button className="settings-avatar-edit__btn" onClick={() => showToast('📷 Abriendo galería...')}>
                <Camera size={14} strokeWidth={2} />
              </button>
            </div>

            {[
              { label: 'Nombre completo', valor: PERFIL.nombre,   icono: <User size={15} /> },
              { label: 'Email',           valor: PERFIL.email,    icono: <Mail size={15} /> },
              { label: 'Teléfono',        valor: PERFIL.telefono, icono: <Phone size={15} /> },
              { label: 'Ciudad',          valor: PERFIL.ciudad,   icono: <MapPin size={15} /> },
            ].map(f => (
              <div key={f.label} className="settings-field">
                <label>{f.label}</label>
                <div className="settings-field__row">
                  <span className="settings-field__icono">{f.icono}</span>
                  <span className="settings-field__valor">{f.valor}</span>
                  <button className="settings-field__edit" onClick={() => showToast('✏️ Editando...')}>
                    <Edit2 size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}

            <button className="settings-btn-primary" onClick={() => { showToast('✓ Cambios guardados'); setSeccion(null); }}>
              <Check size={15} strokeWidth={2} />
              Guardar cambios
            </button>
          </div>
        );

      // ── SEGURIDAD ──
      case 'seguridad':
        return (
          <div className="settings-detalle__body">
            {[
              { icono: <Lock size={20} strokeWidth={1.8} />,        label: 'Cambiar contraseña',      sub: 'Última vez: hace 3 meses',          color: '#3a5a8a', accion: () => showToast('🔑 Abriendo cambio de contraseña...') },
              { icono: <Shield size={20} strokeWidth={1.8} />,      label: 'PIN de Bóveda',           sub: 'Requerido para acceder a tu bóveda', color: '#735c00', accion: () => showToast('🔒 Configurando PIN...') },
              { icono: <Fingerprint size={20} strokeWidth={1.8} />, label: 'Biometría',               sub: 'Huella dactilar o Face ID',          color: '#4a7a4e', accion: () => showToast('👆 Configurando biometría...') },
              { icono: <Smartphone size={20} strokeWidth={1.8} />,  label: 'Sesiones activas',        sub: '2 dispositivos conectados',          color: '#855324', accion: () => showToast('📱 Ver sesiones...') },
            ].map(item => (
              <button key={item.label} className="settings-item-row" onClick={item.accion}>
                <div className="settings-item-row__icono" style={{ background: `${item.color}18`, color: item.color }}>
                  {item.icono}
                </div>
                <div className="settings-item-row__info">
                  <span className="settings-item-row__label">{item.label}</span>
                  <span className="settings-item-row__sub">{item.sub}</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.8} className="settings-item-row__arrow" />
              </button>
            ))}
          </div>
        );

      // ── NOTIFICACIONES ──
      case 'notificaciones':
        return (
          <div className="settings-detalle__body">
            <p className="settings-hint">Controlá qué notificaciones querés recibir de Life's.</p>
            {notifs.map(n => (
              <div key={n.id} className="settings-toggle-row">
                <div className="settings-toggle-row__info">
                  <span className="settings-toggle-row__label">{n.label}</span>
                  <span className="settings-toggle-row__sub">{n.sub}</span>
                </div>
                <div className={`settings-toggle ${n.value ? 'on' : ''}`} onClick={() => toggleNotif(n.id)}>
                  <div className="settings-toggle__thumb" />
                </div>
              </div>
            ))}
          </div>
        );

      // ── PRIVACIDAD ──
      case 'privacidad':
        return (
          <div className="settings-detalle__body">
            <p className="settings-hint">Controlá quién puede ver tu legado y cómo aparecés en Life's.</p>
            {privacidad.map(p => (
              <div key={p.id} className="settings-toggle-row">
                <div className="settings-toggle-row__info">
                  <span className="settings-toggle-row__label">{p.label}</span>
                  <span className="settings-toggle-row__sub">{p.sub}</span>
                </div>
                <div className={`settings-toggle ${p.value ? 'on' : ''}`} onClick={() => togglePriv(p.id)}>
                  <div className="settings-toggle__thumb" />
                </div>
              </div>
            ))}

            <div className="settings-divider" />

            <button className="settings-item-row" onClick={() => showToast('📦 Preparando tu legado para exportar...')}>
              <div className="settings-item-row__icono" style={{ background: '#3a5a8a18', color: '#3a5a8a' }}>
                <Download size={20} strokeWidth={1.8} />
              </div>
              <div className="settings-item-row__info">
                <span className="settings-item-row__label">Exportar mi legado</span>
                <span className="settings-item-row__sub">Descargá todos tus datos en un archivo</span>
              </div>
              <ChevronRight size={16} strokeWidth={1.8} className="settings-item-row__arrow" />
            </button>

            <button className="settings-item-row" onClick={() => showToast('👁️ Abriendo vista pública...')}>
              <div className="settings-item-row__icono" style={{ background: '#4a7a4e18', color: '#4a7a4e' }}>
                <Eye size={20} strokeWidth={1.8} />
              </div>
              <div className="settings-item-row__info">
                <span className="settings-item-row__label">Ver mi perfil público</span>
                <span className="settings-item-row__sub">Así te ven los demás</span>
              </div>
              <ChevronRight size={16} strokeWidth={1.8} className="settings-item-row__arrow" />
            </button>
          </div>
        );

      // ── PLAN ──
      case 'plan':
        return (
          <div className="settings-detalle__body">
            {/* Plan actual */}
            <div className="settings-plan-actual">
              <div className="settings-plan-actual__badge">
                <CreditCard size={20} strokeWidth={1.8} />
                Plan {PERFIL.nivel}
              </div>
              <p className="settings-plan-actual__desc">
                Acceso a Línea de Vida, Árbol Genealógico, Muro Biográfico y Bóveda básica.
              </p>
              <div className="settings-plan-actual__features">
                {['Hasta 500 recuerdos', '5GB de almacenamiento', 'Árbol hasta 3 generaciones', 'Bóveda básica'].map(f => (
                  <div key={f} className="settings-plan-actual__feature">
                    <Check size={13} strokeWidth={2.5} />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <p className="settings-hint" style={{ textAlign: 'center', marginTop: '8px' }}>Actualizá tu plan para desbloquear más</p>

            {/* Planes disponibles */}
            {[
              { nombre: 'Diamante', precio: '$2.499', color: '#7EC8E3', features: ['Recuerdos ilimitados', '50GB', 'Árbol ilimitado', 'Ecos IA', 'Postal física 2x/mes'] },
              { nombre: 'Platino',  precio: '$4.999', color: '#9B8EC4', features: ['Todo Diamante', 'Marco digital WiFi', 'Postal física ilimitada', 'Soporte prioritario'] },
            ].map(p => (
              <div key={p.nombre} className="settings-plan-card" style={{ '--plan-color': p.color } as React.CSSProperties}>
                <div className="settings-plan-card__header">
                  <span className="settings-plan-card__nombre" style={{ color: p.color }}>{p.nombre}</span>
                  <span className="settings-plan-card__precio">{p.precio}<small>/mes</small></span>
                </div>
                <div className="settings-plan-card__features">
                  {p.features.map(f => (
                    <div key={f} className="settings-plan-card__feature">
                      <Check size={12} strokeWidth={2.5} style={{ color: p.color }} />
                      {f}
                    </div>
                  ))}
                </div>
                <button className="settings-plan-card__btn" style={{ background: p.color }}
                  onClick={() => showToast(`🚀 Actualizando a ${p.nombre}...`)}>
                  Actualizar a {p.nombre}
                </button>
              </div>
            ))}
          </div>
        );

      // ── APARIENCIA ──
      case 'apariencia':
        return (
          <div className="settings-detalle__body">
            {/* Dark mode placeholder */}
            <div className="settings-toggle-row settings-toggle-row--highlight">
              <div className="settings-toggle-row__info">
                <span className="settings-toggle-row__label">
                  <Moon size={15} strokeWidth={1.8} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Modo oscuro
                </span>
                <span className="settings-toggle-row__sub">Próximamente · en desarrollo</span>
              </div>
              <div className={`settings-toggle ${darkMode ? 'on' : ''}`} onClick={() => { setDarkMode(!darkMode); showToast('🌙 Modo oscuro próximamente'); }}>
                <div className="settings-toggle__thumb" />
              </div>
            </div>

            <div className="settings-divider" />

            {/* Tamaño de fuente */}
            <div className="settings-grupo">
              <label className="settings-grupo__label">Tamaño de texto</label>
              <div className="settings-font-options">
                {['Pequeño', 'Normal', 'Grande'].map((t, i) => (
                  <button key={t} className={`settings-font-btn${i === 1 ? ' active' : ''}`}
                    onClick={() => showToast(`🔤 Tamaño ${t}`)}>
                    <span style={{ fontSize: `${0.75 + i * 0.15}rem` }}>Aa</span>
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Idioma */}
            <div className="settings-grupo">
              <label className="settings-grupo__label">Idioma</label>
              <div className="settings-item-row" style={{ borderRadius: 12, background: 'white' }}>
                <div className="settings-item-row__icono" style={{ background: '#3a5a8a18', color: '#3a5a8a' }}>
                  <Globe size={18} strokeWidth={1.8} />
                </div>
                <div className="settings-item-row__info">
                  <span className="settings-item-row__label">Español (Argentina)</span>
                  <span className="settings-item-row__sub">Idioma de la interfaz</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.8} className="settings-item-row__arrow" />
              </div>
            </div>
          </div>
        );

      // ── VÍNCULOS ──
      case 'vinculos':
        return (
          <div className="settings-detalle__body">
            {[
              { icono: <Heart size={20} strokeWidth={1.8} />,      label: 'Mis vínculos',          sub: '6 personas vinculadas',             color: '#ba1a1a', ruta: '/perfil'    },
              { icono: <GitBranch size={20} strokeWidth={1.8} />,  label: 'Árbol genealógico',     sub: 'Administrá tu árbol familiar',      color: '#855324', ruta: '/arbol-genealogico' },
              { icono: <Users size={20} strokeWidth={1.8} />,      label: 'Herederos',             sub: 'Quién accede a tu bóveda',          color: '#4a7a4e', ruta: '/herederos' },
              { icono: <BookOpen size={20} strokeWidth={1.8} />,   label: 'Solicitudes pendientes',sub: '2 solicitudes de vínculo',          color: '#3a5a8a', ruta: '/feed'      },
            ].map(item => (
              <button key={item.label} className="settings-item-row" onClick={() => navigate(item.ruta)}>
                <div className="settings-item-row__icono" style={{ background: `${item.color}18`, color: item.color }}>
                  {item.icono}
                </div>
                <div className="settings-item-row__info">
                  <span className="settings-item-row__label">{item.label}</span>
                  <span className="settings-item-row__sub">{item.sub}</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.8} className="settings-item-row__arrow" />
              </button>
            ))}
          </div>
        );

      // ── ZONA DE PELIGRO ──
      case 'peligro':
        return (
          <div className="settings-detalle__body">
            <div className="settings-peligro-aviso">
              <AlertTriangle size={20} strokeWidth={1.8} />
              <p>Las acciones de esta sección son <strong>irreversibles o difíciles de deshacer</strong>. Procedé con cuidado.</p>
            </div>

            <button className="settings-peligro-btn settings-peligro-btn--suave"
              onClick={() => showToast('⏸️ Tu cuenta fue pausada temporalmente')}>
              <PauseCircle size={18} strokeWidth={1.8} />
              <div>
                <span>Pausar mi cuenta</span>
                <small>Tu perfil queda oculto temporalmente. Podés reactivarla cuando quieras.</small>
              </div>
            </button>

            <button className="settings-peligro-btn settings-peligro-btn--medio"
              onClick={() => showToast('📦 Exportando datos...')}>
              <Download size={18} strokeWidth={1.8} />
              <div>
                <span>Exportar y descargar mis datos</span>
                <small>Recibís un archivo con todo tu legado en 24hs.</small>
              </div>
            </button>

            <button className="settings-peligro-btn settings-peligro-btn--extremo"
              onClick={() => showToast('⚠️ Acción requiere confirmación por email')}>
              <Trash2 size={18} strokeWidth={1.8} />
              <div>
                <span>Eliminar mi legado</span>
                <small>Borra permanentemente todos tus datos. Esta acción no se puede deshacer.</small>
              </div>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const seccionActiva = MENU_ITEMS.find(m => m.id === seccion);

  return (
    <div className="settings-page with-navbar">

      {/* ── HEADER ── */}
      <header className="settings-header">
        {seccion ? (
          <>
            <button className="settings-header__back" onClick={() => setSeccion(null)}>
              <ChevronRight size={20} strokeWidth={2} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <h1 className="settings-header__titulo">{seccionActiva?.label}</h1>
          </>
        ) : (
          <h1 className="settings-header__titulo">Configuración</h1>
        )}
      </header>

      {/* ════ VISTA PRINCIPAL (sin sección abierta) ════ */}
      {!seccion && (
        <div className="settings-main">

          {/* ① Hero personal */}
          <div className="settings-hero">
            <img src={PERFIL.avatar} alt={PERFIL.nombre} className="settings-hero__avatar" />
            <div className="settings-hero__info">
              <h2 className="settings-hero__nombre">{PERFIL.nombre}</h2>
              <span className="settings-hero__plan" style={{ color: PERFIL.nivelColor }}>
                Plan {PERFIL.nivel}
              </span>
              <span className="settings-hero__email">{PERFIL.email}</span>
            </div>
          </div>

          {/* ② Completitud del Legado ⭐ */}
          <div className="settings-completitud">
            <div className="settings-completitud__header">
              <div>
                <span className="settings-completitud__eyebrow">Tu legado</span>
                <h3 className="settings-completitud__titulo">
                  {PCT}% completo
                </h3>
              </div>
              <div className="settings-completitud__pct-ring">
                <svg viewBox="0 0 44 44" width="52" height="52">
                  <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(201,147,42,0.15)" strokeWidth="4" />
                  <circle cx="22" cy="22" r="18" fill="none" stroke="#C9932A" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 18 * PCT / 100} ${2 * Math.PI * 18}`}
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                  <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill="#C9932A">{PCT}%</text>
                </svg>
              </div>
            </div>

            <div className="settings-completitud__barra-wrap">
              <div className="settings-completitud__barra">
                <div className="settings-completitud__barra-fill" style={{ width: `${PCT}%` }} />
              </div>
            </div>

            <div className="settings-completitud__items">
              {COMPLETITUD_ITEMS.map(item => (
                <button
                  key={item.label}
                  className={`settings-completitud__item${item.hecho ? ' hecho' : ''}`}
                  onClick={() => !item.hecho && navigate(item.ruta)}
                >
                  <span className="settings-completitud__item-check">
                    {item.hecho
                      ? <Check size={11} strokeWidth={3} />
                      : <span className="settings-completitud__item-pts">+{item.pts}</span>
                    }
                  </span>
                  <span className="settings-completitud__item-label">{item.label}</span>
                  {!item.hecho && <ChevronRight size={12} strokeWidth={2} />}
                </button>
              ))}
            </div>

            {PCT < 100 && (
              <p className="settings-completitud__motivacion">
                ✨ Completá tu árbol genealógico y definí tus herederos para proteger tu legado
              </p>
            )}
          </div>

          {/* ③ Menú de secciones */}
          <div className="settings-menu">
            {MENU_ITEMS.map(item => {
              const Icono = item.icono;
              return (
                <button
                  key={item.id}
                  className={`settings-menu-item${item.id === 'peligro' ? ' settings-menu-item--peligro' : ''}`}
                  onClick={() => setSeccion(item.id as Seccion)}
                >
                  <div className="settings-menu-item__icono"
                    style={{ background: `${item.color}15`, color: item.color }}>
                    <Icono size={20} strokeWidth={1.8} />
                  </div>
                  <div className="settings-menu-item__info">
                    <span className="settings-menu-item__label">{item.label}</span>
                    <span className="settings-menu-item__sub">{item.sub}</span>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.8} className="settings-menu-item__arrow" />
                </button>
              );
            })}
          </div>

          {/* ④ Logout */}
          <button className="settings-logout" onClick={() => { showToast('👋 Cerrando sesión...'); setTimeout(() => navigate('/'), 1200); }}>
            <LogOut size={16} strokeWidth={1.8} />
            Cerrar sesión
          </button>

          <p className="settings-version">Life's · v1.0.0 · Hecho con ❤️ en Mendoza</p>

        </div>
      )}

      {/* ════ PANEL DE DETALLE ════ */}
      {seccion && (
        <div className="settings-detalle">
          {renderDetalle()}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="settings-toast">
          <Check size={14} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
