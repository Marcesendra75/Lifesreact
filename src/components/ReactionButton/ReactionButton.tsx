// ============================================
// LIFE'S — Botón de reacción estilo Facebook, con estética propia
// Clic rápido = reacciona con la actual (o la de por defecto)
// Mantener presionado = abre el selector de las 4 reacciones
// Tocar el resumen = ver quién reaccionó con qué, con pestañas por tipo
// ============================================
import { useState, useRef } from 'react';
import emocionanteIcon from '../../assets/reactions/emocionante.svg';
import inspiradorIcon from '../../assets/reactions/inspirador.svg';
import recordareIcon from '../../assets/reactions/recordare.svg';
import conmueveIcon from '../../assets/reactions/conmueve.svg';
import './ReactionButton.scss';

// Si no convencen los íconos propios, poné esto en false y listo: vuelve a los emoji nativos
const USAR_ICONOS_PROPIOS = true;

export const REACCIONES = [
  { type: 'emocionante', emoji: '💖', icon: emocionanteIcon, label: 'Emocionante' },
  { type: 'inspirador', emoji: '🍃', icon: inspiradorIcon, label: 'Inspirador' },
  { type: 'recordare', emoji: '📖', icon: recordareIcon, label: 'Lo recordaré' },
  { type: 'conmueve', emoji: '😢', icon: conmueveIcon, label: 'Me conmueve' },
];

const REACCION_DEFAULT = 'emocionante';

// Renderiza el ícono propio o el emoji nativo según el switch de arriba
export const IconoReaccion = ({ r, className }: { r: typeof REACCIONES[number]; className?: string }) =>
  USAR_ICONOS_PROPIOS
    ? <img src={r.icon} alt={r.label} className={className} draggable={false} />
    : <span className={className}>{r.emoji}</span>;

interface ReactionButtonProps {
  reactionCounts: Record<string, number>;
  miReaccion: string | null;
  onReact: (type: string) => void;
}

export default function ReactionButton({ reactionCounts, miReaccion, onReact }: ReactionButtonProps) {
  const [pickerAbierto, setPickerAbierto] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fueLongPress = useRef(false);

  const actual = REACCIONES.find(r => r.type === miReaccion);
  const total = Object.values(reactionCounts || {}).reduce((a, b) => a + b, 0);

  const empezarPresion = () => {
    fueLongPress.current = false;
    timerRef.current = setTimeout(() => {
      fueLongPress.current = true;
      setPickerAbierto(true);
    }, 400);
  };

  const soltarPresion = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!fueLongPress.current) {
      onReact(miReaccion || REACCION_DEFAULT);
    }
  };

  const cancelarPresion = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const elegir = (type: string) => {
    onReact(type);
    setPickerAbierto(false);
  };

  return (
    <div className="reaction-wrap">
      <div className="reaction-pill-wrap">
        <button
          className={`reaction-pill ${miReaccion ? 'active' : ''}`}
          onMouseDown={(e) => { e.stopPropagation(); empezarPresion(); }}
          onMouseUp={(e) => { e.stopPropagation(); soltarPresion(); }}
          onMouseLeave={cancelarPresion}
          onTouchStart={(e) => { e.stopPropagation(); empezarPresion(); }}
          onTouchEnd={(e) => { e.stopPropagation(); soltarPresion(); }}
        >
          {actual
            ? <IconoReaccion r={actual} className="reaction-pill__emoji" />
            : <span className="reaction-pill__emoji">🤍</span>}
          {total > 0 && <span className="reaction-pill__total">{total}</span>}
        </button>

        {pickerAbierto && (
          <>
            <div className="reaction-panel__backdrop" onClick={(e) => { e.stopPropagation(); setPickerAbierto(false); }} />
            <div className="reaction-panel reaction-panel--iconos" onClick={(e) => e.stopPropagation()}>
              {REACCIONES.map(r => (
                <button
                  key={r.type}
                  className={`reaction-panel__icono ${miReaccion === r.type ? 'active' : ''}`}
                  title={r.label}
                  onClick={() => elegir(r.type)}
                >
                  <IconoReaccion r={r} className="reaction-panel__icono-img" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}