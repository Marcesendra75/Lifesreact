// ============================================================
// LIFE'S — Vinculos.tsx
// Gestión de vínculos reales: tus conexiones aceptadas, con su
// tipo de relación (amigo por defecto, o el que se haya confirmado),
// más las propuestas de tipo pendientes (recibidas y enviadas).
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Users, Search, Heart, Briefcase, TreePine,
  Check, X, ChevronRight, UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { connectionService, userService } from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import MutualsModal from '../../components/MutualsModal/MutualsModal';
import PersonHoverCard from '../../components/PersonHoverCard/PersonHoverCard';
import './Vinculos.scss';

// ── Tipos ────────────────────────────────────────────────────
type RelationType =
  | 'pareja' | 'padre' | 'madre' | 'hijo' | 'hermano' | 'abuelo'
  | 'primo' | 'familiar' | 'amigo' | 'conocido' | 'companero' | 'colega';

type Categoria = 'todos' | 'familiar' | 'social' | 'trabajo';
type Tab = 'vinculos' | 'propuestas';

interface Persona {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

interface ConnectionItem {
  id: string;
  requesterId: string;
  addresseeId: string;
  requester: Persona;
  addressee: Persona;
  relationType: RelationType;
  relationTypePendiente: RelationType | null;
  relationTypePropuestoPor: string | null;
}

interface Sugerido {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  city?: string | null;
  mutuos: number;
}

// ── Config de tipos, alineada con el enum del backend ───────
const RELATION_CONFIG: Record<RelationType, { emoji: string; label: string; categoria: Categoria }> = {
  pareja:     { emoji: '💑', label: 'Pareja',      categoria: 'familiar' },
  padre:      { emoji: '👨', label: 'Padre',       categoria: 'familiar' },
  madre:      { emoji: '👩', label: 'Madre',       categoria: 'familiar' },
  hijo:       { emoji: '👶', label: 'Hijo/a',      categoria: 'familiar' },
  hermano:    { emoji: '🧑‍🤝‍🧑', label: 'Hermano/a',  categoria: 'familiar' },
  abuelo:     { emoji: '👴', label: 'Abuelo/a',    categoria: 'familiar' },
  primo:      { emoji: '🫂', label: 'Primo/a',     categoria: 'familiar' },
  familiar:   { emoji: '👨‍👩‍👧‍👦', label: 'Familiar',   categoria: 'familiar' },
  amigo:      { emoji: '💛', label: 'Amigo/a',     categoria: 'social'   },
  conocido:   { emoji: '🤝', label: 'Conocido/a',  categoria: 'social'   },
  companero:  { emoji: '🙌', label: 'Compañero/a', categoria: 'social'   },
  colega:     { emoji: '💼', label: 'Colega',      categoria: 'trabajo'  },
};

const TIPOS_PROPONIBLES: RelationType[] = [
  'pareja', 'padre', 'madre', 'hijo', 'hermano', 'abuelo', 'primo',
  'familiar', 'amigo', 'conocido', 'companero', 'colega',
];

export default function Vinculos() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(searchParams.get('tab') === 'propuestas' ? 'propuestas' : 'vinculos');
  const [categoria, setCategoria] = useState<Categoria>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState('');
  const [enviando, setEnviando] = useState<string | null>(null);

  const [proponiendoPara, setProponiendoPara] = useState<ConnectionItem | null>(null);
  const [eliminando, setEliminando] = useState<ConnectionItem | null>(null);

  const [sugeridos, setSugeridos] = useState<Sugerido[]>([]);
  const [cargandoSugeridos, setCargandoSugeridos] = useState(true);
  const [enviadosSugeridos, setEnviadosSugeridos] = useState<Set<string>>(new Set());
  const [verMutuosDe, setVerMutuosDe] = useState<Sugerido | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    cargarConexiones();
    cargarSugeridos();
  }, []);

  const cargarSugeridos = async () => {
    setCargandoSugeridos(true);
    try {
      const res: any = await userService.getSuggestions();
      setSugeridos(res.data);
    } catch {
      setSugeridos([]);
    } finally {
      setCargandoSugeridos(false);
    }
  };

  const conectarSugerido = async (persona: Sugerido) => {
    try {
      await connectionService.sendRequestById(persona.id);
      setEnviadosSugeridos(prev => new Set(prev).add(persona.id));
      showToast(`Solicitud enviada a ${persona.firstName}`);
    } catch (err: any) {
      showToast(err.message || 'No se pudo enviar la solicitud');
    }
  };

  const cargarConexiones = async () => {
    setCargando(true);
    try {
      const res: any = await connectionService.list('accepted');
      setConnections(res.data);
    } catch {
      setConnections([]);
    } finally {
      setCargando(false);
    }
  };

  const otroDe = (c: ConnectionItem): Persona =>
    c.requesterId === user?.id ? c.addressee : c.requester;

  const vinculosFiltrados = connections.filter(c => {
    const otro = otroDe(c);
    const cat = RELATION_CONFIG[c.relationType]?.categoria;
    const matchCat = categoria === 'todos' || cat === categoria;
    const nombreCompleto = `${otro.firstName} ${otro.lastName}`.toLowerCase();
    const matchBus = nombreCompleto.includes(busqueda.toLowerCase());
    return matchCat && matchBus;
  });

  const recibidas = connections.filter(c => c.relationTypePendiente && c.relationTypePropuestoPor !== user?.id);
  const enviadas  = connections.filter(c => c.relationTypePendiente && c.relationTypePropuestoPor === user?.id);

  const countFamiliar = connections.filter(c => RELATION_CONFIG[c.relationType]?.categoria === 'familiar').length;
  const countSocial   = connections.filter(c => RELATION_CONFIG[c.relationType]?.categoria === 'social').length;
  const countTrabajo  = connections.filter(c => RELATION_CONFIG[c.relationType]?.categoria === 'trabajo').length;

  const proponer = async (tipo: RelationType) => {
    if (!proponiendoPara) return;
    setEnviando(proponiendoPara.id);
    try {
      await connectionService.proposeType(proponiendoPara.id, tipo);
      showToast(`Le propusiste "${RELATION_CONFIG[tipo].label}" a ${otroDe(proponiendoPara).firstName}`);
      setProponiendoPara(null);
      cargarConexiones();
    } catch (err: any) {
      showToast(err.message || 'No se pudo enviar la propuesta');
    } finally {
      setEnviando(null);
    }
  };

  const aceptarTipo = async (c: ConnectionItem) => {
    setEnviando(c.id);
    try {
      await connectionService.acceptType(c.id);
      showToast(`Ahora ${otroDe(c).firstName} figura como ${RELATION_CONFIG[c.relationTypePendiente!].label}`);
      cargarConexiones();
    } catch (err: any) {
      showToast(err.message || 'No se pudo aceptar');
    } finally {
      setEnviando(null);
    }
  };

  const cancelarPropuesta = async (c: ConnectionItem) => {
    setEnviando(c.id);
    try {
      await connectionService.cancelType(c.id);
      showToast('Propuesta cancelada');
      cargarConexiones();
    } catch (err: any) {
      showToast(err.message || 'No se pudo cancelar');
    } finally {
      setEnviando(null);
    }
  };

  const rechazarTipo = async (c: ConnectionItem) => {
    setEnviando(c.id);
    try {
      await connectionService.rejectType(c.id);
      showToast('Propuesta rechazada');
      cargarConexiones();
    } catch (err: any) {
      showToast(err.message || 'No se pudo rechazar');
    } finally {
      setEnviando(null);
    }
  };

  const confirmarEliminar = async () => {
    if (!eliminando) return;
    const c = eliminando;
    setEliminando(null);
    try {
      await connectionService.remove(c.id);
      setConnections(connections.filter(x => x.id !== c.id));
    } catch (err: any) {
      showToast(err.message || 'No se pudo eliminar el vínculo');
    }
  };

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
          <button className="vk-header__buscar-btn" onClick={() => navigate('/personas')}>
            <UserPlus size={16} strokeWidth={2} />
            Buscar personas
          </button>
        </div>

        <div className="vk-stats">
          <div className="vk-stat">
            <span className="vk-stat__n">{connections.length}</span>
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
            <span className="vk-stat__l">Propuestas</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="vk-tabs">
        <button className={`vk-tab${tab === 'vinculos' ? ' active' : ''}`} onClick={() => setTab('vinculos')}>
          <Users size={15} strokeWidth={2} />
          Mis vínculos
          <span className="vk-tab__count">{connections.length}</span>
        </button>
        <button className={`vk-tab${tab === 'propuestas' ? ' active' : ''}`} onClick={() => setTab('propuestas')}>
          Propuestas
          {recibidas.length > 0 && <span className="vk-tab__count vk-tab__count--alerta">{recibidas.length}</span>}
        </button>
      </div>

      <div className="vk-content">

        {/* ══ TAB: MIS VÍNCULOS ══ */}
        {tab === 'vinculos' && (
          <div className="vk-vinculos">
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
                  { key: 'todos',    label: 'Todos',   icono: <Users size={13} /> },
                  { key: 'familiar', label: 'Familia', icono: <TreePine size={13} /> },
                  { key: 'social',   label: 'Social',  icono: <Heart size={13} /> },
                  { key: 'trabajo',  label: 'Trabajo', icono: <Briefcase size={13} /> },
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

            {cargando && <p className="vk-empty__sub">Cargando...</p>}

            {!cargando && vinculosFiltrados.length === 0 && (
              <div className="vk-empty">
                <p>{connections.length === 0 ? 'Todavía no tenés vínculos.' : 'No encontramos vínculos con ese filtro'}</p>
                {connections.length === 0 && (
                  <span className="vk-empty__sub">Buscá personas para empezar a conectar</span>
                )}
              </div>
            )}

            {!cargando && vinculosFiltrados.length > 0 && (
              <div className="vk-grid">
                {vinculosFiltrados.map(c => {
                  const otro = otroDe(c);
                  const cfg = RELATION_CONFIG[c.relationType];
                  const tienePendiente = !!c.relationTypePendiente;
                  const yoLaPropuse = c.relationTypePropuestoPor === user?.id;
                  return (
                    <div key={c.id} className="vk-card">
                      <div
                        className="vk-card__avatar-wrap"
                        onClick={() => navigate(`/perfil/${otro.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {otro.avatarUrl
                          ? <img src={otro.avatarUrl} alt={otro.firstName} className="vk-card__avatar" />
                          : <div className="vk-card__avatar vk-card__avatar--vacio">{otro.firstName[0]}</div>
                        }
                        <span className="vk-card__tipo-emoji">{cfg?.emoji}</span>
                      </div>
                      <div className="vk-card__info">
                        <PersonHoverCard userId={otro.id}>
                          <Link to={`/perfil/${otro.id}`} className="vk-card__nombre vk-card__nombre--link">
                            {otro.firstName} {otro.lastName}
                          </Link>
                        </PersonHoverCard>
                        <span className="vk-card__tipo">{cfg?.label}</span>
                        {tienePendiente && (
                          <span className="vk-card__pendiente">
                            {yoLaPropuse ? 'Propuesta enviada' : 'Te propuso un vínculo nuevo'}
                          </span>
                        )}
                      </div>
                      <div className="vk-card__acciones">
                        {!tienePendiente && (
                          <button
                            className="vk-card__btn vk-card__btn--perfil"
                            onClick={() => setProponiendoPara(c)}
                            title="Establecer vínculo"
                          >
                            <ChevronRight size={15} strokeWidth={2} />
                          </button>
                        )}
                        <button
                          className="vk-card__btn vk-card__btn--eliminar"
                          onClick={() => setEliminando(c)}
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

            <div className="vk-sugerencias">
              <h2 className="vk-sugerencias__titulo">
                <UserPlus size={16} strokeWidth={2} />
                Personas que quizás conocés
              </h2>

              {cargandoSugeridos && <p className="vk-empty__sub">Cargando...</p>}
              {!cargandoSugeridos && sugeridos.length === 0 && (
                <p className="vk-empty__sub">Todavía no tenemos sugerencias para vos.</p>
              )}
              {!cargandoSugeridos && sugeridos.length > 0 && (
                <div className="vk-grid">
                  {sugeridos.map(s => (
                    <div key={s.id} className="vk-card">
                      <div className="vk-card__avatar-wrap" onClick={() => navigate(`/perfil/${s.id}`)} style={{ cursor: 'pointer' }}>
                        {s.avatarUrl
                          ? <img src={s.avatarUrl} alt={s.firstName} className="vk-card__avatar" />
                          : <div className="vk-card__avatar vk-card__avatar--vacio">{s.firstName[0]}</div>
                        }
                      </div>
                      <div className="vk-card__info">
                        <PersonHoverCard userId={s.id}>
                          <Link to={`/perfil/${s.id}`} className="vk-card__nombre vk-card__nombre--link">
                            {s.firstName} {s.lastName}
                          </Link>
                        </PersonHoverCard>
                        {s.mutuos > 0 ? (
                          <span
                            className="vk-card__tipo vk-card__tipo--link"
                            onClick={(e) => { e.stopPropagation(); setVerMutuosDe(s); }}
                          >
                            {s.mutuos} {s.mutuos === 1 ? 'vínculo mutuo' : 'vínculos mutuos'}
                          </span>
                        ) : (
                          <span className="vk-card__tipo">{s.city || 'Sugerido para vos'}</span>
                        )}
                      </div>
                      <div className="vk-card__acciones">
                        <button
                          className="vk-card__btn vk-card__btn--perfil"
                          disabled={enviadosSugeridos.has(s.id)}
                          onClick={() => conectarSugerido(s)}
                          title="Conectar"
                        >
                          {enviadosSugeridos.has(s.id) ? <Check size={15} strokeWidth={2} /> : <UserPlus size={15} strokeWidth={2} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB: PROPUESTAS ══ */}
        {tab === 'propuestas' && (
          <div className="vk-solicitudes">
            <h3 className="vk-historial__titulo">Te llegaron</h3>
            {recibidas.length === 0 ? (
              <div className="vk-empty">
                <p>No tenés propuestas pendientes</p>
                <span className="vk-empty__sub">Cuando alguien te proponga un vínculo, aparecerá acá</span>
              </div>
            ) : (
              <div className="vk-solicitudes__lista">
                {recibidas.map(c => {
                  const otro = otroDe(c);
                  const cfg = RELATION_CONFIG[c.relationTypePendiente!];
                  return (
                    <div key={c.id} className="vk-solicitud-card">
                      {otro.avatarUrl
                        ? <img src={otro.avatarUrl} alt={otro.firstName} className="vk-solicitud-card__avatar" />
                        : <div className="vk-solicitud-card__avatar vk-solicitud-card__avatar--vacio">{otro.firstName[0]}</div>
                      }
                      <div className="vk-solicitud-card__body">
                        <span className="vk-solicitud-card__nombre">{otro.firstName} {otro.lastName}</span>
                        <span className="vk-solicitud-card__tipo">
                          {cfg?.emoji} Dice que sos su <strong>{cfg?.label}</strong>
                        </span>
                        <div className="vk-solicitud-card__acciones">
                          <button className="vk-btn-aceptar" disabled={enviando === c.id} onClick={() => aceptarTipo(c)}>
                            <Check size={14} strokeWidth={2.5} /> Aceptar
                          </button>
                          <button className="vk-btn-rechazar" disabled={enviando === c.id} onClick={() => rechazarTipo(c)}>
                            <X size={14} strokeWidth={2.5} /> Rechazar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <h3 className="vk-historial__titulo" style={{ marginTop: 24 }}>Enviadas por vos</h3>
            {enviadas.length === 0 ? (
              <div className="vk-empty">
                <p>No enviaste propuestas de vínculo</p>
              </div>
            ) : (
              <div className="vk-solicitudes__lista">
                {enviadas.map(c => {
                  const otro = otroDe(c);
                  const cfg = RELATION_CONFIG[c.relationTypePendiente!];
                  return (
                    <div key={c.id} className="vk-solicitud-card vk-solicitud-card--enviada">
                      <div className="vk-solicitud-card__estado-dot" />
                      <div className="vk-solicitud-card__body">
                        <span className="vk-solicitud-card__nombre">Para: <strong>{otro.firstName} {otro.lastName}</strong></span>
                        <span className="vk-solicitud-card__tipo">{cfg?.emoji} Como <strong>{cfg?.label}</strong></span>
                        <span className="vk-solicitud-card__badge">Esperando respuesta</span>
                        <button className="vk-btn-rechazar" style={{ marginTop: 6, width: 'fit-content' }} onClick={() => cancelarPropuesta(c)}>
                          <X size={14} strokeWidth={2.5} /> Cancelar propuesta
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Modal: proponer tipo de vínculo ── */}
      {proponiendoPara && (
        <div className="vk-modal-overlay" onClick={() => setProponiendoPara(null)}>
          <div className="vk-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="vk-modal__titulo">
              ¿Qué es {otroDe(proponiendoPara).firstName} tuyo?
            </h3>
            <p className="vk-modal__sub">
              {otroDe(proponiendoPara).firstName} va a tener que confirmarlo para que se establezca.
            </p>
            <div className="vk-modal__grid">
              {TIPOS_PROPONIBLES.map(tipo => (
                <button
                  key={tipo}
                  className="vk-modal__tipo-btn"
                  disabled={!!enviando}
                  onClick={() => proponer(tipo)}
                >
                  <span className="vk-modal__tipo-emoji">{RELATION_CONFIG[tipo].emoji}</span>
                  <span className="vk-modal__tipo-label">{RELATION_CONFIG[tipo].label}</span>
                </button>
              ))}
            </div>
            <button className="vk-modal__cerrar" onClick={() => setProponiendoPara(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {eliminando && (
        <ConfirmModal
          titulo="Eliminar vínculo"
          mensaje={`¿Eliminar a ${otroDe(eliminando).firstName} de tus vínculos? Van a dejar de estar conectados.`}
          textoConfirmar="Sí, eliminar"
          peligroso
          onConfirm={confirmarEliminar}
          onCancel={() => setEliminando(null)}
        />
      )}

      {toast && <div className="vk-toast">{toast}</div>}

      {verMutuosDe && (
        <MutualsModal
          userId={verMutuosDe.id}
          nombre={verMutuosDe.firstName}
          onClose={() => setVerMutuosDe(null)}
        />
      )}
    </div>
  );
}