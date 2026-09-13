// ============================================================
// LIFE'S — Settings.tsx
// Centro de control de identidad y legado
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User, Lock, Bell, Globe, CreditCard, Moon, Users,
  AlertTriangle, ChevronRight, LogOut, Check,
  Shield, Fingerprint, Smartphone,
  Download, Trash2, PauseCircle, BookOpen, GitBranch,
  Heart, Camera, Mail, MapPin, Edit2, UserX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService, blockService } from '../../services/api';
import './Settings.scss';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

// ── Tipos ──────────────────────────────────────────────────
type Seccion =
  | 'identidad' | 'seguridad' | 'notificaciones'
  | 'privacidad' | 'plan' | 'apariencia'
  | 'vinculos' | 'bloqueados' | 'peligro' | null;

interface BloqueadoItem {
  id: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

interface ToggleItem {
  id: string;
  label: string;
  sub: string;
  value: boolean;
}

// El nivel y color de badge siguen siendo datos visuales fijos por ahora
const NIVEL_COLOR: Record<string, string> = {
  bronze: '#855324', silver: '#6b7280', gold: '#C9932A', diamond: '#3a5a8a',
};
const NIVEL_LABEL: Record<string, string> = {
  bronze: 'Bronce', silver: 'Plata', gold: 'Oro', diamond: 'Diamante',
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
  { id: 'bloqueados',     label: 'Personas Bloqueadas',  sub: 'Gestioná quién no puede contactarte',icono: UserX,        color: '#ba1a1a' },
  { id: 'plan',           label: 'Mi Plan',              sub: 'Nivel Oro · beneficios y upgrades',  icono: CreditCard,   color: '#C9932A' },
  { id: 'apariencia',     label: 'Apariencia',           sub: 'Tema, fuente, modo oscuro',          icono: Moon,         color: '#5a3a7a' },
  { id: 'vinculos',       label: 'Vínculos y Familia',   sub: 'Relaciones, herederos',              icono: Users,        color: '#2a7a6a' },
  { id: 'peligro',        label: 'Zona de Peligro',      sub: 'Pausar cuenta, eliminar datos',      icono: AlertTriangle, color: '#ba1a1a' },
] as const;

// ── Componente principal ───────────────────────────────────
export default function Settings() {
  const { t } = useTranslation();
  const navigate   = useNavigate();
  const { user, refreshUser } = useAuth();
  const [seccion, setSeccion]   = useState<Seccion>(null);
  const [toast, setToast]       = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const PERFIL = {
    nombre: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    email: user?.email || '',
    ciudad: [user?.city, user?.country].filter(Boolean).join(', '),
    avatar: user?.avatarUrl || '',
    nivel: NIVEL_LABEL[user?.membershipLevel || 'bronze'],
    nivelColor: NIVEL_COLOR[user?.membershipLevel || 'bronze'],
  };
  const [perfilPrivado, setPerfilPrivado] = useState(user?.isPrivate || false);
  const [comentarios, setComentarios] = useState<'everyone' | 'connections' | 'nobody'>(
    (user as any)?.commentPrivacy || 'everyone'
  );
  const [guardandoPriv, setGuardandoPriv] = useState(false);
  const [mostrarVisto, setMostrarVisto] = useState((user as any)?.showReadReceipts ?? true);
  const [mostrarUltimaVez, setMostrarUltimaVez] = useState((user as any)?.showLastSeen ?? true);

  const [bloqueados, setBloqueados] = useState<BloqueadoItem[]>([]);
  const [cargandoBloqueados, setCargandoBloqueados] = useState(false);

  useEffect(() => {
    if (seccion === 'bloqueados') cargarBloqueados();
  }, [seccion]);

  const cargarBloqueados = async () => {
    setCargandoBloqueados(true);
    try {
      const res: any = await blockService.list();
      setBloqueados(res.data);
    } catch {
      // si falla, dejamos la lista vacía
    } finally {
      setCargandoBloqueados(false);
    }
  };

  const [desbloqueando, setDesbloqueando] = useState<BloqueadoItem | null>(null);

  const confirmarDesbloqueo = async () => {
    if (!desbloqueando) return;
    const item = desbloqueando;
    setDesbloqueando(null);
    try {
      await blockService.unblock(item.user.id);
      setBloqueados(bloqueados.filter(b => b.id !== item.id));
      showToast('✓ ' + item.user.firstName);
    } catch (err: any) {
      showToast(err.message || 'Error');
    }
  };

  const togglePerfilPrivado = async () => {
    const nuevoValor = !perfilPrivado;
    setPerfilPrivado(nuevoValor);
    setGuardandoPriv(true);
    try {
      await userService.updatePrivacy(nuevoValor);
      refreshUser?.();
    } catch (err: any) {
      setPerfilPrivado(!nuevoValor); // revertimos si falló
      showToast(err.message || 'Error al guardar');
    } finally {
      setGuardandoPriv(false);
    }
  };

  const toggleMostrarVisto = async () => {
    const nuevoValor = !mostrarVisto;
    setMostrarVisto(nuevoValor);
    try {
      await userService.updateChatPrivacy('showReadReceipts', nuevoValor);
      refreshUser?.();
    } catch (err: any) {
      setMostrarVisto(!nuevoValor);
      showToast(err.message || 'Error al guardar');
    }
  };

  const toggleMostrarUltimaVez = async () => {
    const nuevoValor = !mostrarUltimaVez;
    setMostrarUltimaVez(nuevoValor);
    try {
      await userService.updateChatPrivacy('showLastSeen', nuevoValor);
      refreshUser?.();
    } catch (err: any) {
      setMostrarUltimaVez(!nuevoValor);
      showToast(err.message || 'Error al guardar');
    }
  };

  const cambiarComentarios = async (valor: 'everyone' | 'connections' | 'nobody') => {
    const anterior = comentarios;
    setComentarios(valor);
    try {
      await userService.updateCommentPrivacy(valor);
      refreshUser?.();
    } catch (err: any) {
      setComentarios(anterior);
      showToast(err.message || 'Error al guardar');
    }
  };

  // Notificaciones
  const [notifs, setNotifs] = useState<ToggleItem[]>([
    { id: 'recuerdos',   label: 'Nuevos recuerdos',      sub: 'Cuando alguien sube un recuerdo que te incluye', value: true  },
    { id: 'vinculos',    label: 'Solicitudes de vínculo', sub: 'Cuando alguien quiere conectar contigo',         value: true  },
    { id: 'capsula',     label: 'Cápsulas del tiempo',    sub: 'Cuando una cápsula está lista para abrirse',     value: true  },
    { id: 'postal',      label: 'Postales enviadas',       sub: 'Estado de tus envíos físicos',                  value: false },
    { id: 'marketing',   label: 'Novedades de Life\'s',   sub: 'Nuevas funciones y actualizaciones',             value: false },
  ]);



  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleNotif = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, value: !n.value } : n));
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
              { label: 'Nombre completo', valor: PERFIL.nombre, icono: <User size={15} /> },
              { label: 'Email',           valor: PERFIL.email,  icono: <Mail size={15} /> },
              { label: 'Ciudad',          valor: PERFIL.ciudad, icono: <MapPin size={15} /> },
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
            <p className="settings-hint">{t('settings.privacy.profileHint')}</p>

            <div className="settings-toggle-row">
              <div className="settings-toggle-row__info">
                <span className="settings-toggle-row__label">{t('settings.privacy.profileLabel')}</span>
              </div>
              <div className={`settings-toggle ${perfilPrivado ? 'on' : ''} ${guardandoPriv ? 'disabled' : ''}`} onClick={togglePerfilPrivado}>
                <div className="settings-toggle__thumb" />
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-toggle-row">
              <div className="settings-toggle-row__info">
                <span className="settings-toggle-row__label">Mostrar cuando leíste un mensaje</span>
                <span className="settings-toggle-row__sub">Si lo apagás, tampoco vas a ver cuándo te leyeron a vos</span>
              </div>
              <div className={`settings-toggle ${mostrarVisto ? 'on' : ''}`} onClick={toggleMostrarVisto}>
                <div className="settings-toggle__thumb" />
              </div>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-row__info">
                <span className="settings-toggle-row__label">Mostrar mi última conexión</span>
                <span className="settings-toggle-row__sub">Si lo apagás, tampoco vas a ver la última vez de nadie más</span>
              </div>
              <div className={`settings-toggle ${mostrarUltimaVez ? 'on' : ''}`} onClick={toggleMostrarUltimaVez}>
                <div className="settings-toggle__thumb" />
              </div>
            </div>

            <div className="settings-divider" />

            <div className="settings-grupo">
              <label className="settings-grupo__label">{t('settings.privacy.commentsLabel')}</label>
              {([
                { valor: 'everyone', label: t('settings.privacy.commentsEveryone') },
                { valor: 'connections', label: t('settings.privacy.commentsConnections') },
                { valor: 'nobody', label: t('settings.privacy.commentsNobody') },
              ] as const).map(op => (
                <button
                  key={op.valor}
                  className={`settings-item-row ${comentarios === op.valor ? 'settings-item-row--seleccionado' : ''}`}
                  onClick={() => cambiarComentarios(op.valor)}
                >
                  <div className="settings-item-row__info">
                    <span className="settings-item-row__label">{op.label}</span>
                  </div>
                  {comentarios === op.valor && <Check size={16} strokeWidth={2.5} style={{ color: '#4a7a4e' }} />}
                </button>
              ))}
            </div>

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
          </div>
        );

      // ── BLOQUEADOS ──
      case 'bloqueados':
        return (
          <div className="settings-detalle__body">
            {cargandoBloqueados && <p className="settings-hint">{t('common.loading')}</p>}
            {!cargandoBloqueados && bloqueados.length === 0 && (
              <p className="settings-hint">{t('settings.blocked.empty')}</p>
            )}
            {!cargandoBloqueados && bloqueados.map(b => (
              <div key={b.id} className="settings-item-row" style={{ cursor: 'default' }}>
                {b.user.avatarUrl
                  ? <img src={b.user.avatarUrl} alt={b.user.firstName} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div className="settings-item-row__icono" style={{ background: '#ba1a1a18', color: '#ba1a1a' }}>{b.user.firstName[0]}</div>
                }
                <div className="settings-item-row__info">
                  <span className="settings-item-row__label">{b.user.firstName} {b.user.lastName}</span>
                </div>
                <button
                  onClick={() => setDesbloqueando(b)}
                  style={{ background: 'none', border: '1.5px solid rgba(3,25,46,0.15)', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#03192e', cursor: 'pointer' }}
                >
                  {t('settings.blocked.unblock')}
                </button>
              </div>
            ))}
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

      {desbloqueando && (
        <ConfirmModal
          titulo="Desbloquear"
          mensaje={t('settings.blocked.confirmUnblock', { name: desbloqueando.user.firstName })}
          textoConfirmar="Sí, desbloquear"
          onConfirm={confirmarDesbloqueo}
          onCancel={() => setDesbloqueando(null)}
        />
      )}

    </div>
  );
}