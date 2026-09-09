// ============================================
// LIFE'S — Resumen de reacciones (stack de hasta 3 íconos + total)
// Va aparte del botón de reaccionar, del lado derecho del footer.
// Al tocarlo, abre el desglose: lista plana de personas + su reacción,
// con pestañas de filtro por tipo. Nombre lleva al perfil.
// ============================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { memoryService } from '../../services/api';
import { REACCIONES, IconoReaccion } from './ReactionButton';
import './ReactionButton.scss';

interface Reactor {
  type: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null; esUnoMismo: boolean; estaConectado: boolean };
}

interface ReactionResumenProps {
  memoryId: string;
  reactionCounts: Record<string, number>;
}

export default function ReactionResumen({ memoryId, reactionCounts }: ReactionResumenProps) {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [filtro, setFiltro] = useState<string | null>(null);
  const [reactores, setReactores] = useState<Reactor[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const total = Object.values(reactionCounts || {}).reduce((a, b) => a + b, 0);
  const tiposConCount = REACCIONES
    .filter(r => (reactionCounts?.[r.type] || 0) > 0)
    .sort((a, b) => (reactionCounts[b.type] || 0) - (reactionCounts[a.type] || 0));
  const topReacciones = tiposConCount.slice(0, 3);

  // Cerrar con Escape o con clic/touch fuera del panel
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false); };
    const onClickFuera = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickFuera);
    document.addEventListener('touchstart', onClickFuera);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickFuera);
      document.removeEventListener('touchstart', onClickFuera);
    };
  }, [abierto]);

  if (total === 0) return <div className="reaction-resumen-wrap reaction-resumen-wrap--vacio" />;

  const abrir = async () => {
    const nuevoEstado = !abierto;
    setAbierto(nuevoEstado);
    if (nuevoEstado) {
      setFiltro(null);
      if (!reactores) {
        setCargando(true);
        try {
          const res: any = await memoryService.listReactions(memoryId);
          setReactores(res.data);
        } catch {
          setReactores([]);
        } finally {
          setCargando(false);
        }
      }
    }
  };

  const irAlPerfil = (userId: string) => {
    setAbierto(false);
    navigate(`/perfil/${userId}`);
  };

  const personasAMostrar = (reactores || []).filter(r => !filtro || r.type === filtro);

  return (
    <div className="reaction-resumen-wrap">
      <button className="reaction-resumen" onClick={(e) => { e.stopPropagation(); abrir(); }}>
        <span className="reaction-resumen__stack">
          {topReacciones.map(r => (
            <IconoReaccion key={r.type} r={r} className="reaction-resumen__icon" />
          ))}
        </span>
      </button>

      {abierto && (
        <div ref={panelRef} className="reaction-desglose reaction-desglose--resumen" onClick={(e) => e.stopPropagation()}>
            <button className="reaction-desglose__cerrar" onClick={() => setAbierto(false)}>
              <X size={16} strokeWidth={2} />
            </button>
            <div className="reaction-desglose__tabs">
              <button
                className={`reaction-desglose__tab ${filtro === null ? 'active' : ''}`}
                onClick={() => setFiltro(null)}
              >
                Todas <b>{total}</b>
              </button>
              {tiposConCount.map(r => (
                <button
                  key={r.type}
                  className={`reaction-desglose__tab ${filtro === r.type ? 'active' : ''}`}
                  onClick={() => setFiltro(r.type)}
                  title={r.label}
                >
                  <IconoReaccion r={r} className="reaction-desglose__tab-icon" />
                  <b>{reactionCounts[r.type]}</b>
                </button>
              ))}
            </div>

            {cargando && <p className="reaction-desglose__vacio">Cargando...</p>}
            {!cargando && personasAMostrar.length === 0 && (
              <p className="reaction-desglose__vacio">Nadie reaccionó todavía.</p>
            )}
            {!cargando && personasAMostrar.map((r, i) => {
              const tipoInfo = REACCIONES.find(t => t.type === r.type)!;
              return (
                <button key={r.user.id + i} className="reaction-desglose__persona" onClick={() => irAlPerfil(r.user.id)}>
                  {r.user.avatarUrl
                    ? <img src={r.user.avatarUrl} alt={r.user.firstName} />
                    : <div className="reaction-desglose__persona-vacio">{r.user.firstName[0]}</div>
                  }
                  <div className="reaction-desglose__persona-info">
                    <span className="reaction-desglose__persona-nombre">{r.user.firstName} {r.user.lastName}</span>
                    {!r.user.esUnoMismo && (
                      <span className={`reaction-desglose__persona-estado ${r.user.estaConectado ? 'conectado' : ''}`}>
                        {r.user.estaConectado ? 'Conectados' : 'No conectados'}
                      </span>
                    )}
                  </div>
                  <IconoReaccion r={tipoInfo} className="reaction-desglose__persona-reaccion" />
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}