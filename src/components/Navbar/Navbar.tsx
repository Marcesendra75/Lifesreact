// ============================================================
// LIFE'S — Navbar.tsx | Componente compartido de navegación
// Desktop: sidebar rail izquierda (íconos → expande al hacer clic)
// Mobile:  barra inferior fija con 5 ítems
// Íconos: Lucide React
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Home, Activity, GitBranch, User, Lock, Menu, Users,
  Search, Bell, ChevronDown, Settings as SettingsIcon, LogOut,
  MessageCircle, TreePine, UserPlus,
} from 'lucide-react';
import emocionanteIcon from '../../assets/reactions/emocionante.svg';
import inspiradorIcon from '../../assets/reactions/inspirador.svg';
import recordareIcon from '../../assets/reactions/recordare.svg';
import conmueveIcon from '../../assets/reactions/conmueve.svg';
import divierteIcon from '../../assets/reactions/divierte.svg';
import { connectionService, userService, notificationService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { connectSocket, disconnectSocket } from '../../services/socket';
import logo from '../../assets/logo.webp';
import './Navbar.scss';

const NAV_ITEMS = [
  { ruta: '/feed', label: 'Feed', icono: <Home size={22} strokeWidth={1.8} /> },
  { ruta: '/linea-de-vida', label: 'Línea de Vida', icono: <Activity size={22} strokeWidth={1.8} /> },
  { ruta: '/arbol-genealogico', label: 'Árbol', icono: <GitBranch size={22} strokeWidth={1.8} /> },
  { ruta: '/personas', label: 'Personas', icono: <Users size={22} strokeWidth={1.8} /> },
  { ruta: '/perfil', label: 'Perfil', icono: <User size={22} strokeWidth={1.8} /> },
];

const RUTAS_OCULTAS = [
  '/', '/login', '/crear-cuenta', '/acceso-seguro',
  '/recuperar', '/tarjeta-legado', '/tarjeta-pendiente',
  '/empresas', '/empresas/planes', '/404',
  '/terminos', '/privacidad', '/verificar-email',
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandido, setExpandido] = useState(false);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState(0);

  // ── Buscador rápido de la barra superior ──
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [resultadosAbiertos, setResultadosAbiertos] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const handleQueryChange = (texto: string) => {
    setQuery(texto);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (texto.trim().length < 2) {
      setResultados([]);
      setResultadosAbiertos(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      setResultadosAbiertos(true);
      try {
        const res: any = await userService.search(texto, 1, 6);
        setResultados(res.data.items);
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 400);
  };


  // cerrar el desplegable de resultados con click afuera
  useEffect(() => {
    if (!resultadosAbiertos) return;
    const onClickFuera = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setResultadosAbiertos(false);
      }
    };
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, [resultadosAbiertos]);

  // ── Menú rápido del avatar ──
  const [menuAvatarAbierto, setMenuAvatarAbierto] = useState(false);

  // ── Notificaciones ──
  const [notifAbiertas, setNotifAbiertas] = useState(false);
  const [notifItems, setNotifItems] = useState<any[]>([]);
  const [cargandoNotifs, setCargandoNotifs] = useState(false);
  const [cargandoMasNotifs, setCargandoMasNotifs] = useState(false);
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotalPages, setNotifTotalPages] = useState(1);
  const [noLeidas, setNoLeidas] = useState(0);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const notifWrapRef = useRef<HTMLDivElement>(null);

  const cargarNoLeidas = () => {
    notificationService.unreadCount()
      .then((res: any) => setNoLeidas(res.data.count))
      .catch(() => { });
  };

  const abrirNotificaciones = async () => {
    const nuevoEstado = !notifAbiertas;
    setNotifAbiertas(nuevoEstado);
    if (nuevoEstado) {
      setCargandoNotifs(true);
      try {
        const res: any = await notificationService.list(1, 15);
        setNotifItems(res.data.items);
        setNotifPage(1);
        setNotifTotalPages(res.data.totalPages);

        // al abrir la campanita ya las damos por vistas — no hace falta
        // entrar notificación por notificación para que baje el número
        if (res.data.unreadCount > 0) {
          setNoLeidas(0);
          setNotifItems((prev) => prev.map((n: any) => ({ ...n, isRead: true })));
          notificationService.markAllRead().catch(() => { });
        }
      } catch {
        setNotifItems([]);
      } finally {
        setCargandoNotifs(false);
      }
    }
  };

  const cargarMasNotificaciones = async () => {
    if (cargandoMasNotifs || notifPage >= notifTotalPages) return;
    setCargandoMasNotifs(true);
    try {
      const siguiente = notifPage + 1;
      const res: any = await notificationService.list(siguiente, 15);
      setNotifItems((prev) => [...prev, ...res.data.items]);
      setNotifPage(siguiente);
      setNotifTotalPages(res.data.totalPages);
    } catch {
      // si falla, simplemente no se agrega nada; el usuario puede reintentar scrolleando de nuevo
    } finally {
      setCargandoMasNotifs(false);
    }
  };

  // scroll infinito dentro del panel: al acercarse al final, pedimos la página siguiente
  useEffect(() => {
    const panel = notifPanelRef.current;
    if (!panel || !notifAbiertas) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = panel;
      if (scrollHeight - scrollTop - clientHeight < 80) {
        cargarMasNotificaciones();
      }
    };

    panel.addEventListener('scroll', onScroll);
    return () => panel.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifAbiertas, notifPage, notifTotalPages, cargandoMasNotifs]);

  // cerrar el panel de notificaciones con clic afuera — mismo patrón que
  // ya usamos para el desplegable del buscador
  useEffect(() => {
    if (!notifAbiertas) return;
    const onClickFuera = (e: MouseEvent) => {
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target as Node)) {
        setNotifAbiertas(false);
      }
    };
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, [notifAbiertas]);

  const tocarNotificacion = async (n: any) => {
    setNotifAbiertas(false);
    if (!n.isRead) {
      try {
        await notificationService.markRead(n.id);
        setNoLeidas((prev) => Math.max(0, prev - 1));
      } catch { }
    }

    // reacción/comentario/respuesta van directo al recuerdo puntual, no al feed general
    if ((n.type === 'reaction' || n.type === 'comment' || n.type === 'comment_reply') && n.entityId) {
      navigate(`/feed/${n.entityId}`);
      return;
    }

    // las de conexión pendiente van directo a la pestaña donde se resuelven
    if (n.type === 'connection_request') {
      navigate('/personas?tab=solicitudes');
      return;
    }
    if (n.type === 'relation_type_proposed') {
      navigate('/vinculos?tab=propuestas');
      return;
    }

    if (n.type === 'family_link_proposed') {
      navigate(`/arbol-genealogico?propuesta=${n.entityId}`);
      return;
    }

    const destinos: Record<string, string> = {
      connection_accepted: '/vinculos',
      connection_rejected: '/personas',
      relation_type_accepted: '/vinculos',
      relation_type_rejected: '/vinculos',
      relation_type_cancelled: '/vinculos',
      family_link_accepted: '/arbol-genealogico',
      family_link_rejected: '/arbol-genealogico',
    };
    navigate(destinos[n.type] || '/feed');
  };

  const formatFechaNotif = (iso: string): string => {
    const fecha = new Date(iso);
    const diffMs = Date.now() - fecha.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return 'recién';
    if (min < 60) return `hace ${min} min`;
    const horas = Math.floor(min / 60);
    if (horas < 24) return `hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'ayer';
    if (dias < 7) return `hace ${dias} días`;
    return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  const REACCION_ICONO: Record<string, string> = {
    emocionante: emocionanteIcon,
    inspirador: inspiradorIcon,
    recordare: recordareIcon,
    conmueve: conmueveIcon,
    divierte: divierteIcon,
  };

  // qué ícono chico va superpuesto en la esquina del avatar, según el tipo
  const badgeDeNotificacion = (n: any) => {
    if (n.type === 'reaction' && n.reactionType && REACCION_ICONO[n.reactionType]) {
      return (
        <span className="navbar-top__notif-item-badge navbar-top__notif-item-badge--emoji">
          <img src={REACCION_ICONO[n.reactionType]} alt={n.reactionType} />
        </span>
      );
    }
    if (n.type === 'comment' || n.type === 'comment_reply') {
      return <span className="navbar-top__notif-item-badge navbar-top__notif-item-badge--comentario"><MessageCircle size={11} strokeWidth={2.2} fill="currentColor" /></span>;
    }
    if (n.type.startsWith('family_link')) {
      return <span className="navbar-top__notif-item-badge navbar-top__notif-item-badge--arbol"><TreePine size={11} strokeWidth={2.2} /></span>;
    }
    if (n.type.startsWith('connection') || n.type.startsWith('relation_type')) {
      return <span className="navbar-top__notif-item-badge navbar-top__notif-item-badge--conexion"><UserPlus size={11} strokeWidth={2.4} /></span>;
    }
    return null;
  };

  const nombreCompleto = (n: any) => n.actor ? `${n.actor.firstName} ${n.actor.lastName || ''}`.trim() : 'Alguien';

  const NOTIF_TEXTO: Record<string, (n: any) => string> = {
    connection_request: (n) => `${nombreCompleto(n)} te envió una solicitud de conexión`,
    connection_accepted: (n) => `${nombreCompleto(n)} aceptó tu solicitud de conexión`,
    connection_rejected: (n) => `${nombreCompleto(n)} rechazó tu solicitud de conexión`,
    relation_type_proposed: (n) => `${nombreCompleto(n)} te propuso un tipo de vínculo`,
    relation_type_accepted: (n) => `${nombreCompleto(n)} aceptó tu propuesta de vínculo`,
    relation_type_rejected: (n) => `${nombreCompleto(n)} rechazó tu propuesta de vínculo`,
    relation_type_cancelled: (n) => `${nombreCompleto(n)} canceló su propuesta de vínculo`,
    reaction: (n) => n.actorsCount > 1
      ? `${nombreCompleto(n)} y ${n.actorsCount - 1} persona${n.actorsCount - 1 === 1 ? '' : 's'} más reaccionaron a tu recuerdo`
      : `${nombreCompleto(n)} reaccionó a tu recuerdo`,
    comment: (n) => n.actorsCount > 1
      ? `${nombreCompleto(n)} y ${n.actorsCount - 1} persona${n.actorsCount - 1 === 1 ? '' : 's'} más comentaron tu recuerdo`
      : `${nombreCompleto(n)} comentó tu recuerdo`,
    comment_reply: (n) => `${nombreCompleto(n)} respondió tu comentario`,
    family_link_proposed: (n) => `${nombreCompleto(n)} te etiquetó en su árbol genealógico`,
    family_link_accepted: (n) => `${nombreCompleto(n)} aceptó tu etiqueta en su árbol`,
    family_link_rejected: (n) => `${nombreCompleto(n)} rechazó tu etiqueta en su árbol`,
  };

  const cargarPendientes = () => {
    connectionService.list('pending')
      .then((res: any) => {
        // solo las que ME llegaron a mí, no las que yo mandé
        const recibidas = res.data.filter((c: any) => c.addressee.id === user?.id);
        setSolicitudesPendientes(recibidas.length);
      })
      .catch(() => { });
  };

  useEffect(() => {
    cargarPendientes();
    cargarNoLeidas();
    // se actualiza solo al volver de /personas (por si aceptaste/rechazaste algo ahí)
  }, [location.pathname]);

  useEffect(() => {
    const onActualizado = () => cargarPendientes();
    window.addEventListener('lifes:solicitudes-actualizadas', onActualizado);
    return () => window.removeEventListener('lifes:solicitudes-actualizadas', onActualizado);
  }, []);

  // ── Notificaciones en vivo ──
  // apenas hay sesión, nos conectamos; el servidor nos avisa por este
  // socket cada vez que llega algo nuevo, sin que haga falta refrescar
  // ni esperar a la próxima navegación
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('lifes_token');
    if (!token) return;

    const socket = connectSocket(token);
    const onNuevaNotif = () => {
      cargarNoLeidas();
      // si el panel ya está abierto, lo repoblamos para que se vea al toque
      if (notifAbiertas) {
        notificationService.list(1, 15)
          .then((res: any) => { setNotifItems(res.data.items); setNotifPage(1); setNotifTotalPages(res.data.totalPages); })
          .catch(() => {});
      }
    };
    socket.on('notification:new', onNuevaNotif);

    return () => {
      socket.off('notification:new', onNuevaNotif);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, notifAbiertas]);

  useEffect(() => {
    if (!user) disconnectSocket();
  }, [user]);

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
      {/* ── BARRA SUPERIOR FIJA: buscador + notificaciones + avatar ── */}
      <header className={`navbar-top${expandido ? ' navbar-top--expandido' : ''}`}>
        <NavLink
          to="/feed"
          className="navbar-top__brand"
          onClick={() => {
            if (location.pathname === '/feed') {
              window.dispatchEvent(new CustomEvent('lifes:nav-refresh', { detail: '/feed' }));
            }
          }}
        >
          <img src={logo} alt="Life's" className="navbar-top__brand-logo" />
          <span className="navbar-top__brand-text">Life's</span>
        </NavLink>

        <div className="navbar-top__search" ref={searchWrapRef}>
          <Search size={16} strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Buscar personas..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setResultadosAbiertos(true)}
          />
          {resultadosAbiertos && (
            <div className="navbar-top__resultados">
              {buscando && <p className="navbar-top__resultados-vacio">Buscando...</p>}
              {!buscando && resultados.length === 0 && (
                <p className="navbar-top__resultados-vacio">No encontramos a nadie con ese nombre.</p>
              )}
              {!buscando && resultados.map((p) => (
                <Link key={p.id} to={`/perfil/${p.id}`} className="navbar-top__resultado" onClick={() => { setResultadosAbiertos(false); setQuery(''); }}>
                  {p.avatarUrl
                    ? <img src={p.avatarUrl} alt={p.firstName} />
                    : <div className="navbar-top__resultado-vacio">{p.firstName[0]}</div>
                  }
                  <div className="navbar-top__resultado-info">
                    <span className="navbar-top__resultado-nombre">{p.firstName} {p.lastName}</span>
                    <span className={`navbar-top__resultado-estado${p.estadoConexion === 'conectado' ? ' navbar-top__resultado-estado--conectado' : p.estadoConexion !== 'pendiente_enviada' && p.mutuos > 0 ? ' navbar-top__resultado-estado--mutuos' : ''}`}>
                      {p.estadoConexion === 'conectado'
                        ? 'Conectados'
                        : p.estadoConexion === 'pendiente_enviada'
                        ? 'Solicitud enviada'
                        : p.mutuos > 0
                        ? `${p.mutuos} conexi${p.mutuos === 1 ? 'ón' : 'ones'} en común`
                        : null}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="navbar-top__acciones">
          <div className="navbar-top__notif-wrap" ref={notifWrapRef}>
            <button className="navbar-top__icon-btn" aria-label="Notificaciones" onClick={abrirNotificaciones}>
              <Bell size={19} strokeWidth={1.8} />
              {noLeidas > 0 && <span className="navbar-top__notif-badge">{noLeidas > 9 ? '9+' : noLeidas}</span>}
            </button>
            {notifAbiertas && (
              <>
                <div className="navbar-top__menu-backdrop" onClick={() => setNotifAbiertas(false)} />
                <div className="navbar-top__notif-panel" ref={notifPanelRef}>
                  <div className="navbar-top__notif-header">Notificaciones</div>
                  {cargandoNotifs && <p className="navbar-top__notif-vacio">Cargando...</p>}
                  {!cargandoNotifs && notifItems.length === 0 && (
                    <p className="navbar-top__notif-vacio">No tenés notificaciones todavía.</p>
                  )}
                  {!cargandoNotifs && notifItems.map((n) => {
                    const texto = NOTIF_TEXTO[n.type]?.(n) || 'Nueva notificación';
                    const nombre = nombreCompleto(n);
                    const restoDelTexto = texto.startsWith(nombre) ? texto.slice(nombre.length) : ` ${texto}`;
                    return (
                      <button
                        key={n.id}
                        className={`navbar-top__notif-item${n.isRead ? '' : ' sin-leer'}`}
                        onClick={() => tocarNotificacion(n)}
                      >
                        <div className="navbar-top__notif-item-avatar-wrap">
                          {n.actor?.avatarUrl
                            ? <img src={n.actor.avatarUrl} alt={n.actor.firstName} />
                            : <div className="navbar-top__notif-item-vacio">{n.actor?.firstName?.[0] || '?'}</div>
                          }
                          {badgeDeNotificacion(n)}
                        </div>
                        <div className="navbar-top__notif-item-texto">
                          <span><strong>{nombre}</strong>{restoDelTexto}</span>
                          <span className="navbar-top__notif-item-fecha">{formatFechaNotif(n.updatedAt || n.createdAt)}</span>
                        </div>
                      </button>
                    );
                  })}
                  {cargandoMasNotifs && <p className="navbar-top__notif-vacio">Cargando más...</p>}
                </div>
              </>
            )}
          </div>

          <div className="navbar-top__avatar-wrap">
            <button className="navbar-top__avatar-btn" onClick={() => setMenuAvatarAbierto(v => !v)}>
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user.firstName} className="navbar-top__avatar" />
                : <div className="navbar-top__avatar navbar-top__avatar--vacio">{user?.firstName?.[0]}</div>
              }
              <ChevronDown size={14} strokeWidth={2} />
            </button>
            {menuAvatarAbierto && (
              <>
                <div className="navbar-top__menu-backdrop" onClick={() => setMenuAvatarAbierto(false)} />
                <div className="navbar-top__menu">
                  <button onClick={() => { setMenuAvatarAbierto(false); navigate('/perfil'); }}>
                    <User size={15} strokeWidth={1.8} /> Mi perfil
                  </button>
                  <button onClick={() => { setMenuAvatarAbierto(false); navigate('/configuracion'); }}>
                    <SettingsIcon size={15} strokeWidth={1.8} /> Configuración
                  </button>
                  <button onClick={() => { setMenuAvatarAbierto(false); logout(); }}>
                    <LogOut size={15} strokeWidth={1.8} /> Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      {/* ── DESKTOP: sidebar rail ── */}
      <nav className={`navbar-rail${expandido ? ' expandido' : ''}`} aria-label="Navegación principal">
        <div className="navbar-rail__logo">
          <button
            className="navbar-rail__toggle"
            onClick={() => setExpandido(!expandido)}
            aria-label={expandido ? 'Colapsar menú' : 'Expandir menú'}
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>
          <img src={logo} alt="Life's" className="navbar-rail__logo-icon" />
          <span className="navbar-rail__logo-text">Life's</span>
        </div>
        <ul className="navbar-rail__items" onClick={() => setExpandido(false)}>
          {NAV_ITEMS.map(item => (
            <li key={item.ruta}>
              <NavLink
                to={item.ruta}
                title={item.label}
                className={({ isActive }) => `navbar-rail__link${isActive ? ' active' : ''}`}
                onClick={() => {
                  if (location.pathname === item.ruta) {
                    window.dispatchEvent(new CustomEvent('lifes:nav-refresh', { detail: item.ruta }));
                  }
                }}
              >
                <span className="navbar-rail__icon">
                  {item.icono}
                  {item.ruta === '/personas' && solicitudesPendientes > 0 && (
                    <span className="navbar-rail__badge">{solicitudesPendientes}</span>
                  )}
                </span>
                <span className="navbar-rail__label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="navbar-rail__boveda">
          <NavLink to="/caja-fuerte" className="navbar-rail__boveda-btn" title="Bóveda" onClick={() => setExpandido(false)}>
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
            onClick={() => {
              if (location.pathname === item.ruta) {
                window.dispatchEvent(new CustomEvent('lifes:nav-refresh', { detail: item.ruta }));
              }
            }}
          >
            <span className="navbar-bottom__icon">
              {item.icono}
              {item.ruta === '/personas' && solicitudesPendientes > 0 && (
                <span className="navbar-bottom__badge">{solicitudesPendientes}</span>
              )}
            </span>
            <span className="navbar-bottom__label">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/caja-fuerte"
          className={({ isActive }) => `navbar-bottom__item navbar-bottom__item--boveda${isActive ? ' active' : ''}`}
        >
          <span className="navbar-bottom__icon"><Lock size={22} strokeWidth={1.8} /></span>
          <span className="navbar-bottom__label">Bóveda</span>
        </NavLink>
      </nav>
    </>
  );
}