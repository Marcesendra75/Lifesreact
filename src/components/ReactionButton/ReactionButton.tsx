// ============================================
// LIFE'S — Botón de reacción estilo Facebook, con estética propia
// Clic rápido = reacciona con la actual (o la de por defecto)
// Mantener presionado = abre el selector de las 4 reacciones
// Tocar el resumen = ver quién reaccionó con qué, con pestañas por tipo
// ============================================
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import emocionanteIcon from '../../assets/reactions/emocionante.svg';
import inspiradorIcon from '../../assets/reactions/inspirador.svg';
import recordareIcon from '../../assets/reactions/recordare.svg';
import conmueveIcon from '../../assets/reactions/conmueve.svg';
import divierteIcon from '../../assets/reactions/divierte.svg';
import { formatConteo } from '../../utils/format';
import './ReactionButton.scss';

// Si no convencen los íconos propios, poné esto en false y listo: vuelve a los emoji nativos
const USAR_ICONOS_PROPIOS = true;

export const REACCIONES = [
  { type: 'emocionante', emoji: '💖', icon: emocionanteIcon, label: 'Emocionante' },
  { type: 'inspirador', emoji: '🍃', icon: inspiradorIcon, label: 'Inspirador' },
  { type: 'recordare', emoji: '📖', icon: recordareIcon, label: 'Lo recordaré' },
  { type: 'conmueve', emoji: '😢', icon: conmueveIcon, label: 'Me conmueve' },
  { type: 'divierte', emoji: '😄', icon: divierteIcon, label: 'Me divierte' },
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
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, abreHaciaAbajo: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fueLongPress = useRef(false);
  const pillRef = useRef<HTMLDivElement>(null);

  const actual = REACCIONES.find(r => r.type === miReaccion);
  const total = Object.values(reactionCounts || {}).reduce((a, b) => a + b, 0);

  // el panel se dibuja en un portal (fuera del post/comentario) para que
  // ningún "overflow: hidden" de una tarjeta se lo termine comiendo —
  // por eso necesitamos calcular su posición en pantalla a mano. Si no
  // hay espacio arriba (comentarios cerca del borde superior de la
  // lista), se abre hacia abajo en su lugar — si no, quedaba renderizado
  // fuera de la pantalla y parecía que "no aparecía" ningún selector
  const ALTO_ESTIMADO_PANEL = 50;
  const calcularPosicionPanel = () => {
    const rect = pillRef.current?.getBoundingClientRect();
    if (!rect) return;
    const hayEspacioArriba = rect.top - ALTO_ESTIMADO_PANEL - 8 > 0;
    setPanelPos({
      top: hayEspacioArriba ? rect.top - 8 : rect.bottom + 8,
      left: rect.left,
      abreHaciaAbajo: !hayEspacioArriba,
    });
  };

  const empezarPresion = () => {
    fueLongPress.current = false;
    timerRef.current = setTimeout(() => {
      fueLongPress.current = true;
      calcularPosicionPanel();
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
      <div className="reaction-pill-wrap" ref={pillRef}>
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
          {total > 0 && <span className="reaction-pill__total">{formatConteo(total)}</span>}
        </button>
      </div>

      {pickerAbierto && createPortal(
        <>
          <div className="reaction-panel__backdrop" onClick={(e) => { e.stopPropagation(); setPickerAbierto(false); }} />
          <div
            className={`reaction-panel reaction-panel--iconos reaction-panel--portal${panelPos.abreHaciaAbajo ? ' reaction-panel--portal-abajo' : ''}`}
            style={{ top: panelPos.top, left: panelPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {REACCIONES.map(r => (
              <button
                key={r.type}
                className={`reaction-panel__icono ${miReaccion === r.type ? 'active' : ''}`}
                title={r.label}
                onClick={() => elegir(r.type)}
              >
                <IconoReaccion r={r} className={`reaction-panel__icono-img reaction-panel__icono-img--${r.type}`} />
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}