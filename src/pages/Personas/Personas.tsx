// ============================================
// LIFE'S — Personas: buscar gente y gestionar solicitudes de conexión
// ============================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, UserPlus, Check, X, Lock, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService, connectionService } from '../../services/api';
import MutualsModal from '../../components/MutualsModal/MutualsModal';
import './Personas.scss';

type Tab = 'buscar' | 'solicitudes';

interface PersonaResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isPrivate: boolean;
  estadoConexion: 'ninguna' | 'pendiente_enviada' | 'conectado' | 'rechazada';
  diasRestantes: number | null;
}

interface Solicitud {
  id: string;
  requester: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  createdAt: string;
}

interface Sugerido {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  city?: string | null;
  mutuos: number;
}

export default function Personas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(searchParams.get('tab') === 'solicitudes' ? 'solicitudes' : 'buscar');

  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<PersonaResult[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [yaSeBusco, setYaSeBusco] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [toast, setToast] = useState('');

  const [sugeridos, setSugeridos] = useState<Sugerido[]>([]);
  const [cargandoSugeridos, setCargandoSugeridos] = useState(true);
  const [enviadosSugeridos, setEnviadosSugeridos] = useState<Set<string>>(new Set());
  const [verMutuosDe, setVerMutuosDe] = useState<Sugerido | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    cargarSolicitudes();
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

  const cargarSolicitudes = async () => {
    setCargandoSolicitudes(true);
    try {
      const res: any = await connectionService.list('pending');
      // solo las que ME llegaron a mí (yo soy el addressee), no las que yo mandé
      setSolicitudes(res.data.filter((c: any) => c.addressee.id === user?.id));
    } catch {
      // si falla, dejamos la lista vacía
    } finally {
      setCargandoSolicitudes(false);
    }
  };

  const buscar = async (texto: string, pagina = 1) => {
    if (texto.trim().length < 2) {
      setResultados([]);
      setYaSeBusco(false);
      return;
    }
    setBuscando(true);
    setYaSeBusco(true);
    try {
      const res: any = await userService.search(texto, pagina, 15);
      setResultados(pagina === 1 ? res.data.items : [...resultados, ...res.data.items]);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  const handleQueryChange = (texto: string) => {
    setQuery(texto);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(texto), 400);
  };

  const conectar = async (persona: PersonaResult) => {
    try {
      await connectionService.sendRequestById(persona.id);
      setResultados(resultados.map(p => p.id === persona.id ? { ...p, estadoConexion: 'pendiente_enviada' } : p));
      showToast(`Solicitud enviada a ${persona.firstName}`);
    } catch (err: any) {
      showToast(err.message || 'No se pudo enviar la solicitud');
    }
  };

  const aceptar = async (id: string) => {
    try {
      await connectionService.accept(id);
      setSolicitudes(solicitudes.filter(s => s.id !== id));
      window.dispatchEvent(new CustomEvent('lifes:solicitudes-actualizadas'));
      showToast('Conexión aceptada');
    } catch (err: any) {
      showToast(err.message || 'Error al aceptar');
    }
  };

  const rechazar = async (id: string) => {
    try {
      await connectionService.reject(id);
      setSolicitudes(solicitudes.filter(s => s.id !== id));
      window.dispatchEvent(new CustomEvent('lifes:solicitudes-actualizadas'));
    } catch (err: any) {
      showToast(err.message || 'Error al rechazar');
    }
  };

  return (
    <div className="personas-root">
      <main className="personas-main">
        <h1 className="personas-titulo">Personas</h1>

        <div className="personas-tabs">
          <button
            className={`personas-tab ${tab === 'buscar' ? 'active' : ''}`}
            onClick={() => setTab('buscar')}
          >
            Buscar
          </button>
          <button
            className={`personas-tab ${tab === 'solicitudes' ? 'active' : ''}`}
            onClick={() => setTab('solicitudes')}
          >
            Solicitudes
            {solicitudes.length > 0 && <span className="personas-tab__badge">{solicitudes.length}</span>}
          </button>
        </div>

        {tab === 'buscar' && (
          <div className="personas-buscar">
            <div className="personas-search-box">
              <Search size={18} strokeWidth={1.8} />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o email..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
            </div>

            {buscando && <p className="personas-vacio">Buscando...</p>}

            {!buscando && yaSeBusco && resultados.length === 0 && (
              <p className="personas-vacio">No encontramos a nadie con ese nombre.</p>
            )}

            {!buscando && resultados.map(p => (
              <div key={p.id} className="personas-card">
                <button className="personas-card__avatar-btn" onClick={() => navigate(`/perfil/${p.id}`)}>
                  {p.avatarUrl
                    ? <img src={p.avatarUrl} alt={p.firstName} className="personas-card__avatar" />
                    : <div className="personas-card__avatar personas-card__avatar--vacio">{p.firstName[0]}</div>
                  }
                </button>
                <button className="personas-card__info personas-card__info--link" onClick={() => navigate(`/perfil/${p.id}`)}>
                  <span className="personas-card__nombre">{p.firstName} {p.lastName}</span>
                  {p.isPrivate && (
                    <span className="personas-card__privado"><Lock size={11} strokeWidth={2} /> Perfil privado</span>
                  )}
                </button>
                {p.estadoConexion === 'conectado' ? (
                  <span className="personas-card__btn enviado"><Check size={14} strokeWidth={2} /> Conectados</span>
                ) : p.estadoConexion === 'pendiente_enviada' ? (
                  <span className="personas-card__btn enviado"><Check size={14} strokeWidth={2} /> Pendiente</span>
                ) : p.estadoConexion === 'rechazada' ? (
                  <span className="personas-card__btn rechazada" title={`Esta persona rechazó tu solicitud. Podés volver a intentarlo en ${p.diasRestantes} día${p.diasRestantes === 1 ? '' : 's'}`}>
                    Rechazada
                  </span>
                ) : (
                  <button className="personas-card__btn" onClick={() => conectar(p)}>
                    <UserPlus size={14} strokeWidth={2} /> Conectar
                  </button>
                )}
              </div>
            ))}

            {!yaSeBusco && (
              <div className="personas-sugerencias">
                <h2 className="personas-sugerencias__titulo">
                  <Users size={16} strokeWidth={1.8} /> Personas que quizás conocés
                </h2>

                {cargandoSugeridos && <p className="personas-vacio">Cargando...</p>}
                {!cargandoSugeridos && sugeridos.length === 0 && (
                  <p className="personas-vacio">Todavía no tenemos sugerencias para vos.</p>
                )}
                {!cargandoSugeridos && sugeridos.map(s => (
                  <div key={s.id} className="personas-card">
                    <button className="personas-card__avatar-btn" onClick={() => navigate(`/perfil/${s.id}`)}>
                      {s.avatarUrl
                        ? <img src={s.avatarUrl} alt={s.firstName} className="personas-card__avatar" />
                        : <div className="personas-card__avatar personas-card__avatar--vacio">{s.firstName[0]}</div>
                      }
                    </button>
                    <button className="personas-card__info personas-card__info--link" onClick={() => navigate(`/perfil/${s.id}`)}>
                      <span className="personas-card__nombre">{s.firstName} {s.lastName}</span>
                      {s.mutuos > 0 ? (
                        <span
                          className="personas-card__quiere personas-card__quiere--link"
                          onClick={(e) => { e.stopPropagation(); setVerMutuosDe(s); }}
                        >
                          {s.mutuos} {s.mutuos === 1 ? 'vínculo mutuo' : 'vínculos mutuos'}
                        </span>
                      ) : (
                        <span className="personas-card__quiere">{s.city || 'Sugerido para vos'}</span>
                      )}
                    </button>
                    <button
                      className={`personas-card__btn ${enviadosSugeridos.has(s.id) ? 'enviado' : ''}`}
                      onClick={() => conectarSugerido(s)}
                      disabled={enviadosSugeridos.has(s.id)}
                    >
                      {enviadosSugeridos.has(s.id)
                        ? <><Check size={14} strokeWidth={2} /> Enviada</>
                        : <><UserPlus size={14} strokeWidth={2} /> Conectar</>
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'solicitudes' && (
          <div className="personas-solicitudes">
            {cargandoSolicitudes && <p className="personas-vacio">Cargando...</p>}
            {!cargandoSolicitudes && solicitudes.length === 0 && (
              <p className="personas-vacio">No tenés solicitudes pendientes.</p>
            )}
            {!cargandoSolicitudes && solicitudes.map(s => (
              <div key={s.id} className="personas-card">
                <button className="personas-card__avatar-btn" onClick={() => navigate(`/perfil/${s.requester.id}`)}>
                  {s.requester.avatarUrl
                    ? <img src={s.requester.avatarUrl} alt={s.requester.firstName} className="personas-card__avatar" />
                    : <div className="personas-card__avatar personas-card__avatar--vacio">{s.requester.firstName[0]}</div>
                  }
                </button>
                <button className="personas-card__info personas-card__info--link" onClick={() => navigate(`/perfil/${s.requester.id}`)}>
                  <span className="personas-card__nombre">{s.requester.firstName} {s.requester.lastName}</span>
                  <span className="personas-card__quiere">quiere conectar con vos</span>
                </button>
                <div className="personas-card__acciones">
                  <button className="personas-card__icon-btn personas-card__icon-btn--ok" onClick={() => aceptar(s.id)}>
                    <Check size={16} strokeWidth={2.2} />
                  </button>
                  <button className="personas-card__icon-btn personas-card__icon-btn--no" onClick={() => rechazar(s.id)}>
                    <X size={16} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {toast && <div className="personas-toast">{toast}</div>}

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