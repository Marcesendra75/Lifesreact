// ============================================================
// LIFE'S — Vinculos.tsx
// Sistema completo de vínculos: activos por categoría,
// solicitudes recibidas/enviadas, explorar perfiles
// Ruta: /vinculos
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Bell, Send, Check, X, Search,
  UserPlus, Heart, Briefcase, TreePine,
  Clock, ChevronRight, Filter,
} from 'lucide-react';
import './Vinculos.scss';

// ── Tipos ────────────────────────────────────────────────────
type TipoVinculo =
  | 'pareja' | 'padre' | 'madre' | 'hijo/a'
  | 'hermano/a' | 'abuelo/a' | 'amigo/a' | 'compañero/a'
  | 'familiar' | 'colega' | 'conocido/a' | 'primo/a';

type EstadoSolicitud = 'pendiente' | 'aceptada' | 'rechazada';
type Categoria = 'todos' | 'familiar' | 'social' | 'trabajo';
type VistaTab = 'vinculos' | 'recibidas' | 'enviadas';

interface Vinculo {
  id: string;
  nombre: string;
  tipo: TipoVinculo;
  avatar: string;
  userId?: string;
  ciudad?: string;
  trabajo?: string;
}

interface SolicitudVinculo {
  id: string;
  deUserId: string;
  deNombre: string;
  deAvatar: string;
  paraUserId: string;
  tipo: TipoVinculo;
  mensaje: string;
  fecha: string;
  estado: EstadoSolicitud;
}

// ── Config de tipos ─────────────────────────────────────────
const VINCULO_CONFIG: Record<TipoVinculo, { emoji: string; label: string; categoria: Categoria }> = {
  'pareja':     { emoji: '💑', label: 'Pareja',      categoria: 'familiar' },
  'padre':      { emoji: '👨‍👧', label: 'Padre',       categoria: 'familiar' },
  'madre':      { emoji: '👩‍👧', label: 'Madre',       categoria: 'familiar' },
  'hijo/a':     { emoji: '👶', label: 'Hijo/a',      categoria: 'familiar' },
  'hermano/a':  { emoji: '🧑‍🤝‍🧑', label: 'Hermano/a',  categoria: 'familiar' },
  'abuelo/a':   { emoji: '👴', label: 'Abuelo/a',    categoria: 'familiar' },
  'primo/a':    { emoji: '🫂', label: 'Primo/a',     categoria: 'familiar' },
  'familiar':   { emoji: '👨‍👩‍👧‍👦', label: 'Familiar',   categoria: 'familiar' },
  'amigo/a':    { emoji: '💛', label: 'Amigo/a',     categoria: 'social'   },
  'conocido/a': { emoji: '🤝', label: 'Conocido/a',  categoria: 'social'   },
  'compañero/a':{ emoji: '🙌', label: 'Compañero/a', categoria: 'social'   },
  'colega':     { emoji: '💼', label: 'Colega',      categoria: 'trabajo'  },
};

// ── Vínculos iniciales de prueba ────────────────────────────
const VINCULOS_INICIALES: Vinculo[] = [
  { id: '1', nombre: 'María Valenzuela', tipo: 'hermano/a', avatar: 'https://i.pravatar.cc/100?img=5',   userId: '2', ciudad: 'Mendoza', trabajo: 'Docente' },
  { id: '2', nombre: 'Marcelo García',   tipo: 'amigo/a',   avatar: 'https://i.pravatar.cc/100?img=68',  userId: '3', ciudad: 'Mendoza', trabajo: 'Broker de Seguros' },
  { id: '3', nombre: 'Abuelo Pedro',     tipo: 'abuelo/a',  avatar: 'https://i.pravatar.cc/100?img=70',  ciudad: 'Córdoba' },
  { id: '4', nombre: 'Papá Carlos',      tipo: 'padre',     avatar: 'https://i.pravatar.cc/100?img=60',  ciudad: 'Mendoza' },
  { id: '5', nombre: 'Laura Sánchez',    tipo: 'amigo/a',   avatar: 'https://i.pravatar.cc/100?img=47',  ciudad: 'Buenos Aires', trabajo: 'Diseñadora' },
  { id: '6', nombre: 'Diego Ramos',      tipo: 'colega',    avatar: 'https://i.pravatar.cc/100?img=52',  ciudad: 'Mendoza', trabajo: 'Contador' },
  { id: '7', nombre: 'Ana García',       tipo: 'primo/a',   avatar: 'https://i.pravatar.cc/100?img=44',  ciudad: 'San Juan' },
];

// ── Solicitudes de prueba ───────────────────────────────────
const SOLICITUDES_DEMO: SolicitudVinculo[] = [
  {
    id: 'demo-1',
    deUserId: '99',
    deNombre: 'Valentina Cruz',
    deAvatar: 'https://i.pravatar.cc/100?img=32',
    paraUserId: '1',
    tipo: 'conocido/a',
    mensaje: 'Hola! Nos conocimos en el evento de fotografía el mes pasado.',
    fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estado: 'pendiente',
  },
  {
    id: 'demo-2',
    deUserId: '98',
    deNombre: 'Roberto Fernández',
    deAvatar: 'https://i.pravatar.cc/100?img=57',
    paraUserId: '1',
    tipo: 'familiar',
    mensaje: 'Soy primo de tu mamá, me contó que tenés perfil acá.',
    fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    estado: 'pendiente',
  },
];

// ── Perfiles sugeridos ──────────────────────────────────────
const SUGERIDOS = [
  { userId: '2', nombre: 'María Valenzuela', avatar: 'https://i.pravatar.cc/100?img=5',  ciudad: 'Mendoza', mutuos: 3 },
  { userId: '3', nombre: 'Marcelo García',   avatar: 'https://i.pravatar.cc/100?img=68', ciudad: 'Mendoza', mutuos: 5 },
  { userId: '4', nombre: 'Elena Morales',    avatar: 'https://i.pravatar.cc/100?img=25', ciudad: 'Córdoba', mutuos: 1 },
  { userId: '5', nombre: 'Luis Herrera',     avatar: 'https://i.pravatar.cc/100?img=51', ciudad: 'Rosario', mutuos: 2 },
];

const STORAGE_KEY_SOL   = 'lifes_vinculos_solicitudes';
const STORAGE_KEY_VINS  = 'lifes_vinculos_activos';

function formatFecha(iso: string) {
  const d = new Date(iso);
  const ahora = new Date();
  const diff  = (ahora.getTime() - d.getTime()) / 1000;
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

// ── Componente ───────────────────────────────────────────────
export default function Vinculos() {
  const navigate = useNavigate();

  const [tab,       setTab]       = useState<VistaTab>('vinculos');
  const [categoria, setCategoria] = useState<Categoria>('todos');
  const [busqueda,  setBusqueda]  = useState('');

  // Vínculos activos
  const [vinculos, setVinculos] = useState<Vinculo[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_VINS);
      return raw ? JSON.parse(raw) : VINCULOS_INICIALES;
    } catch { return VINCULOS_INICIALES; }
  });

  // Solicitudes
  const [solicitudes, setSolicitudes] = useState<SolicitudVinculo[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SOL);
      const guardadas: SolicitudVinculo[] = raw ? JSON.parse(raw) : [];
      // Mezclar demos que no estén ya guardados
      const ids = guardadas.map(s => s.id);
      const demos = SOLICITUDES_DEMO.filter(d => !ids.includes(d.id));
      return [...demos, ...guardadas];
    } catch { return SOLICITUDES_DEMO; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_VINS, JSON.stringify(vinculos)); } catch {}
  }, [vinculos]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_SOL, JSON.stringify(solicitudes)); } catch {}
  }, [solicitudes]);

  const recibidas = solicitudes.filter(s => s.paraUserId === '1' && s.estado === 'pendiente');
  const enviadas  = solicitudes.filter(s => s.deUserId === '1');

  // Filtrar vínculos
  const vinculosFiltrados = vinculos.filter(v => {
    const cat = VINCULO_CONFIG[v.tipo]?.categoria;
    const matchCat = categoria === 'todos' || cat === categoria;
    const matchBus = v.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBus;
  });

  // Responder solicitud
  const responder = (id: string, accion: 'aceptada' | 'rechazada') => {
    const actualizadas = solicitudes.map(s =>
      s.id === id ? { ...s, estado: accion } : s
    );
    setSolicitudes(actualizadas);

    if (accion === 'aceptada') {
      const sol = solicitudes.find(s => s.id === id);
      if (sol) {
        const nuevo: Vinculo = {
          id:     Date.now().toString(),
          nombre: sol.deNombre,
          tipo:   sol.tipo,
          avatar: sol.deAvatar,
          userId: sol.deUserId,
        };
        setVinculos(prev => [...prev, nuevo]);
      }
    }
  };

  // Eliminar vínculo
  const eliminarVinculo = (id: string) => {
    setVinculos(prev => prev.filter(v => v.id !== id));
  };

  // Contadores
  const countFamiliar = vinculos.filter(v => VINCULO_CONFIG[v.tipo]?.categoria === 'familiar').length;
  const countSocial   = vinculos.filter(v => VINCULO_CONFIG[v.tipo]?.categoria === 'social').length;
  const countTrabajo  = vinculos.filter(v => VINCULO_CONFIG[v.tipo]?.categoria === 'trabajo').length;

  return (
    <div className="vk-page with-navbar">

      {/* ── Header ── */}
      <div className="vk-header">
        <div className="vk-header__inner">
          <div>
            <span className="vk-eyebrow">Las personas que importan</span>
            <h1 className="vk-titulo">
              <Users size={22} strokeWidth={1.6} />
              Mis Vínculos
            </h1>
          </div>
          <button
            className="vk-header__buscar-btn"
            onClick={() => navigate('/perfil/2')}
          >
            <UserPlus size={16} strokeWidth={2} />
            Explorar perfiles
          </button>
        </div>

        {/* Stats rápidas */}
        <div className="vk-stats">
          <div className="vk-stat">
            <span className="vk-stat__n">{vinculos.length}</span>
            <span className="vk-stat__l">Total</span>
          </div>
          <div className="vk-stat">
            <span className="vk-stat__n">{countFamiliar}</span>
            <span className="vk-stat__l">Familia</span>
          </div>
          <div className="vk-stat">
            <span className="vk-stat__n">{countSocial}</span>
            <span className="vk-stat__l">Social</span>
          </div>
          <div className="vk-stat">
            <span className="vk-stat__n">{countTrabajo}</span>
            <span className="vk-stat__l">Trabajo</span>
          </div>
          <div className="vk-stat vk-stat--alerta">
            <span className="vk-stat__n">{recibidas.length}</span>
            <span className="vk-stat__l">Pendientes</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="vk-tabs">
        <button
          className={`vk-tab${tab === 'vinculos' ? ' active' : ''}`}
          onClick={() => setTab('vinculos')}
        >
          <Users size={15} strokeWidth={2} />
          Mis vínculos
          <span className="vk-tab__count">{vinculos.length}</span>
        </button>
        <button
          className={`vk-tab${tab === 'recibidas' ? ' active' : ''}`}
          onClick={() => setTab('recibidas')}
        >
          <Bell size={15} strokeWidth={2} />
          Recibidas
          {recibidas.length > 0 && (
            <span className="vk-tab__count vk-tab__count--alerta">{recibidas.length}</span>
          )}
        </button>
        <button
          className={`vk-tab${tab === 'enviadas' ? ' active' : ''}`}
          onClick={() => setTab('enviadas')}
        >
          <Send size={15} strokeWidth={2} />
          Enviadas
          <span className="vk-tab__count">{enviadas.length}</span>
        </button>
      </div>

      <div className="vk-content">

        {/* ══════════════════════════════════════
            TAB: MIS VÍNCULOS
        ══════════════════════════════════════ */}
        {tab === 'vinculos' && (
          <div className="vk-vinculos">

            {/* Barra de búsqueda + filtro */}
            <div className="vk-toolbar">
              <div className="vk-search">
                <Search size={15} className="vk-search__icon" />
                <input
                  type="text"
                  placeholder="Buscar vínculo..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="vk-search__input"
                />
              </div>
              <div className="vk-filtros">
                {([
                  { key: 'todos',    label: 'Todos',    icono: <Users size={13} /> },
                  { key: 'familiar', label: 'Familia',  icono: <TreePine size={13} /> },
                  { key: 'social',   label: 'Social',   icono: <Heart size={13} /> },
                  { key: 'trabajo',  label: 'Trabajo',  icono: <Briefcase size={13} /> },
                ] as const).map(f => (
                  <button
                    key={f.key}
                    className={`vk-filtro${categoria === f.key ? ' active' : ''}`}
                    onClick={() => setCategoria(f.key)}
                  >
                    {f.icono}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de vínculos */}
            {vinculosFiltrados.length === 0 ? (
              <div className="vk-empty">
                <span>🔍</span>
                <p>No encontramos vínculos con ese filtro</p>
              </div>
            ) : (
              <div className="vk-grid">
                {vinculosFiltrados.map(v => {
                  const cfg = VINCULO_CONFIG[v.tipo];
                  return (
                    <div key={v.id} className="vk-card">
                      <div
                        className="vk-card__avatar-wrap"
                        onClick={() => v.userId && navigate(`/perfil/${v.userId}`)}
                        style={{ cursor: v.userId ? 'pointer' : 'default' }}
                      >
                        <img src={v.avatar} alt={v.nombre} className="vk-card__avatar" />
                        <span className="vk-card__tipo-emoji">{cfg?.emoji}</span>
                      </div>
                      <div className="vk-card__info">
                        <span className="vk-card__nombre">{v.nombre}</span>
                        <span className="vk-card__tipo">{cfg?.label}</span>
                        {v.ciudad && <span className="vk-card__ciudad">📍 {v.ciudad}</span>}
                        {v.trabajo && <span className="vk-card__trabajo">💼 {v.trabajo}</span>}
                      </div>
                      <div className="vk-card__acciones">
                        {v.userId && (
                          <button
                            className="vk-card__btn vk-card__btn--perfil"
                            onClick={() => navigate(`/perfil/${v.userId}`)}
                            title="Ver perfil"
                          >
                            <ChevronRight size={15} strokeWidth={2} />
                          </button>
                        )}
                        <button
                          className="vk-card__btn vk-card__btn--eliminar"
                          onClick={() => eliminarVinculo(v.id)}
                          title="Eliminar vínculo"
                        >
                          <X size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sugerencias */}
            <div className="vk-sugerencias">
              <h2 className="vk-sugerencias__titulo">
                <UserPlus size={16} strokeWidth={2} />
                Personas que quizás conocés
              </h2>
              <div className="vk-sugerencias__lista">
                {SUGERIDOS.map(s => {
                  const yaConectado = vinculos.some(v => v.userId === s.userId);
                  if (yaConectado) return null;
                  return (
                    <div key={s.userId} className="vk-sugerido">
                      <img
                        src={s.avatar}
                        alt={s.nombre}
                        className="vk-sugerido__avatar"
                        onClick={() => navigate(`/perfil/${s.userId}`)}
                        style={{ cursor: 'pointer' }}
                      />
                      <div className="vk-sugerido__info">
                        <span className="vk-sugerido__nombre">{s.nombre}</span>
                        <span className="vk-sugerido__ciudad">📍 {s.ciudad}</span>
                        <span className="vk-sugerido__mutuos">
                          🤝 {s.mutuos} {s.mutuos === 1 ? 'vínculo mutuo' : 'vínculos mutuos'}
                        </span>
                      </div>
                      <button
                        className="vk-sugerido__btn"
                        onClick={() => navigate(`/perfil/${s.userId}`)}
                      >
                        <UserPlus size={13} strokeWidth={2} />
                        Conectar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB: SOLICITUDES RECIBIDAS
        ══════════════════════════════════════ */}
        {tab === 'recibidas' && (
          <div className="vk-solicitudes">
            {recibidas.length === 0 ? (
              <div className="vk-empty">
                <span>🎉</span>
                <p>No tenés solicitudes pendientes</p>
                <span className="vk-empty__sub">Cuando alguien quiera conectar, aparecerá acá</span>
              </div>
            ) : (
              <div className="vk-solicitudes__lista">
                {recibidas.map(sol => {
                  const cfg = VINCULO_CONFIG[sol.tipo];
                  return (
                    <div key={sol.id} className="vk-solicitud-card">
                      <img src={sol.deAvatar} alt={sol.deNombre} className="vk-solicitud-card__avatar" />
                      <div className="vk-solicitud-card__body">
                        <div className="vk-solicitud-card__top">
                          <span className="vk-solicitud-card__nombre">{sol.deNombre}</span>
                          <span className="vk-solicitud-card__tiempo">
                            <Clock size={11} /> {formatFecha(sol.fecha)}
                          </span>
                        </div>
                        <span className="vk-solicitud-card__tipo">
                          {cfg?.emoji} Quiere conectar como <strong>{cfg?.label}</strong>
                        </span>
                        {sol.mensaje && (
                          <p className="vk-solicitud-card__mensaje">"{sol.mensaje}"</p>
                        )}
                        <div className="vk-solicitud-card__acciones">
                          <button
                            className="vk-btn-aceptar"
                            onClick={() => responder(sol.id, 'aceptada')}
                          >
                            <Check size={14} strokeWidth={2.5} />
                            Aceptar
                          </button>
                          <button
                            className="vk-btn-rechazar"
                            onClick={() => responder(sol.id, 'rechazada')}
                          >
                            <X size={14} strokeWidth={2.5} />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Historial de respondidas */}
            {solicitudes.filter(s => s.paraUserId === '1' && s.estado !== 'pendiente').length > 0 && (
              <div className="vk-historial">
                <h3 className="vk-historial__titulo">Historial</h3>
                {solicitudes
                  .filter(s => s.paraUserId === '1' && s.estado !== 'pendiente')
                  .map(sol => (
                    <div key={sol.id} className="vk-historial-item">
                      <img src={sol.deAvatar} alt={sol.deNombre} className="vk-historial-item__avatar" />
                      <span className="vk-historial-item__nombre">{sol.deNombre}</span>
                      <span className={`vk-historial-item__estado vk-historial-item__estado--${sol.estado}`}>
                        {sol.estado === 'aceptada' ? '✅ Aceptada' : '❌ Rechazada'}
                      </span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB: SOLICITUDES ENVIADAS
        ══════════════════════════════════════ */}
        {tab === 'enviadas' && (
          <div className="vk-solicitudes">
            {enviadas.length === 0 ? (
              <div className="vk-empty">
                <span>📤</span>
                <p>No enviaste solicitudes aún</p>
                <span className="vk-empty__sub">Explorá perfiles y conectá con quien quieras</span>
                <button
                  className="vk-btn-explorar"
                  onClick={() => navigate('/perfil/2')}
                >
                  <UserPlus size={14} strokeWidth={2} />
                  Explorar perfiles
                </button>
              </div>
            ) : (
              <div className="vk-solicitudes__lista">
                {enviadas.map(sol => {
                  const cfg = VINCULO_CONFIG[sol.tipo];
                  return (
                    <div key={sol.id} className={`vk-solicitud-card vk-solicitud-card--enviada vk-solicitud-card--${sol.estado}`}>
                      <div className="vk-solicitud-card__estado-dot" />
                      <div className="vk-solicitud-card__body">
                        <div className="vk-solicitud-card__top">
                          <span className="vk-solicitud-card__nombre">
                            Para: <strong>{sol.paraUserId === '2' ? 'María Valenzuela' : sol.paraUserId === '3' ? 'Marcelo García' : `Usuario ${sol.paraUserId}`}</strong>
                          </span>
                          <span className="vk-solicitud-card__tiempo">
                            <Clock size={11} /> {formatFecha(sol.fecha)}
                          </span>
                        </div>
                        <span className="vk-solicitud-card__tipo">
                          {cfg?.emoji} Como <strong>{cfg?.label}</strong>
                        </span>
                        {sol.mensaje && (
                          <p className="vk-solicitud-card__mensaje">"{sol.mensaje}"</p>
                        )}
                        <span className={`vk-solicitud-card__badge vk-solicitud-card__badge--${sol.estado}`}>
                          {sol.estado === 'pendiente' && '⏳ Pendiente'}
                          {sol.estado === 'aceptada'  && '✅ Aceptada'}
                          {sol.estado === 'rechazada' && '❌ Rechazada'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
