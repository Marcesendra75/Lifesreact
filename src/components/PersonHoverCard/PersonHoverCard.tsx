// ============================================
// LIFE'S — Mini tarjeta de persona al pasar el mouse sobre su nombre
// Se renderiza en un portal (fuera de cualquier contenedor con scroll)
// y calcula su propia posición en pantalla, abriendo hacia arriba si
// no hay lugar abajo — así nunca queda recortada por un overflow.
// ============================================
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { userService, connectionService } from '../../services/api';
import './PersonHoverCard.scss';

interface Datos {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  membershipLevel: string;
  esUnoMismo: boolean;
  estaConectado: boolean;
  estadoConexion: 'ninguna' | 'pendiente_enviada' | 'pendiente_recibida' | 'conectado' | 'rechazada';
  solicitudRecibidaId?: string | null;
}

const NIVEL_LABEL: Record<string, string> = { bronze: 'Bronce', silver: 'Plata', gold: 'Oro', diamond: 'Diamante' };
const NIVEL_COLOR: Record<string, string> = { bronze: '#855324', silver: '#6b7280', gold: '#C9932A', diamond: '#3a5a8a' };
const CARD_WIDTH = 240;
const CARD_ALTO_ESTIMADO = 250;

export default function PersonHoverCard({ userId, children }: { userId: string; children: React.ReactNode }) {
  const [abierta, setAbierta] = useState(false);
  const [datos, setDatos] = useState<Datos | null>(null);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [error, setError] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const wrapRef = useRef<HTMLSpanElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calcularPosicion = () => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const abajoDisponible = window.innerHeight - rect.bottom;
    const top = abajoDisponible < CARD_ALTO_ESTIMADO
      ? Math.max(8, rect.top - CARD_ALTO_ESTIMADO - 10)
      : rect.bottom + 10;
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - CARD_WIDTH - 8);
    setPos({ top, left });
  };

  const empezarHover = () => {
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
    if (abierta) return;

    openTimerRef.current = setTimeout(async () => {
      calcularPosicion();
      setAbierta(true);
      setError('');
      if (!datos) {
        setCargando(true);
        try {
          const res: any = await userService.getById(userId);
          setDatos(res.data);
        } catch {
          setDatos(null);
        } finally {
          setCargando(false);
        }
      }
    }, 450);
  };

  const cancelarHover = () => {
    if (openTimerRef.current) { clearTimeout(openTimerRef.current); openTimerRef.current = null; }
    closeTimerRef.current = setTimeout(() => setAbierta(false), 250);
  };

  const conectar = async () => {
    setEnviando(true);
    setError('');
    try {
      await connectionService.sendRequestById(userId);
      setSolicitudEnviada(true);
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  const aceptar = async () => {
    if (!datos?.solicitudRecibidaId) return;
    setEnviando(true);
    setError('');
    try {
      await connectionService.accept(datos.solicitudRecibidaId);
      setDatos({ ...datos, estaConectado: true, estadoConexion: 'conectado' });
    } catch (err: any) {
      setError(err.message || 'No se pudo aceptar');
    } finally {
      setEnviando(false);
    }
  };

  const rechazar = async () => {
    if (!datos?.solicitudRecibidaId) return;
    setEnviando(true);
    setError('');
    try {
      await connectionService.reject(datos.solicitudRecibidaId);
      setDatos({ ...datos, estadoConexion: 'ninguna', solicitudRecibidaId: null });
    } catch (err: any) {
      setError(err.message || 'No se pudo rechazar');
    } finally {
      setEnviando(false);
    }
  };

  const nivelColor = datos ? (NIVEL_COLOR[datos.membershipLevel] || NIVEL_COLOR.bronze) : NIVEL_COLOR.bronze;

  return (
    <span className="person-hover-wrap" ref={wrapRef} onMouseEnter={empezarHover} onMouseLeave={cancelarHover}>
      {children}
      {abierta && createPortal(
        <div
          className="person-hover-card"
          style={{ '--nivel-color': nivelColor, top: pos.top, left: pos.left } as React.CSSProperties}
          onMouseEnter={empezarHover}
          onMouseLeave={cancelarHover}
          onClick={(e) => e.stopPropagation()}
        >
          {cargando && <p className="person-hover-card__vacio">Cargando...</p>}
          {!cargando && datos && (
            <>
              <div className="person-hover-card__header">
                {datos.avatarUrl
                  ? <img src={datos.avatarUrl} alt={datos.firstName} className="person-hover-card__avatar" />
                  : <div className="person-hover-card__avatar person-hover-card__avatar--vacio">{datos.firstName[0]}</div>
                }
                <div className="person-hover-card__header-info">
                  <Link to={`/perfil/${userId}`} className="person-hover-card__nombre">
                    {datos.firstName} {datos.lastName}
                  </Link>
                  <span className="person-hover-card__nivel">{NIVEL_LABEL[datos.membershipLevel] || 'Bronce'}</span>
                </div>
              </div>

              {datos.bio && <p className="person-hover-card__bio">"{datos.bio}"</p>}
              {(datos.city || datos.country) && (
                <span className="person-hover-card__ubicacion">
                  📍 {[datos.city, datos.country].filter(Boolean).join(', ')}
                </span>
              )}

              {!datos.esUnoMismo && (
                <div className="person-hover-card__accion">
                  {datos.estaConectado ? (
                    <span className="person-hover-card__conectado">✓ Conectados</span>
                  ) : datos.estadoConexion === 'pendiente_recibida' ? (
                    <div className="person-hover-card__par-btns">
                      <button className="person-hover-card__conectar" disabled={enviando} onClick={aceptar}>Aceptar</button>
                      <button className="person-hover-card__rechazar" disabled={enviando} onClick={rechazar}>Rechazar</button>
                    </div>
                  ) : solicitudEnviada || datos.estadoConexion === 'pendiente_enviada' ? (
                    <span className="person-hover-card__pendiente">Solicitud enviada</span>
                  ) : (
                    <button className="person-hover-card__conectar" disabled={enviando} onClick={conectar}>
                      {enviando ? 'Enviando...' : '+ Conectar'}
                    </button>
                  )}
                  {error && <p className="person-hover-card__error">{error}</p>}
                </div>
              )}
            </>
          )}
        </div>,
        document.body
      )}
    </span>
  );
}