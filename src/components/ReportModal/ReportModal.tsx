// ============================================
// LIFE'S — Modal de reporte, reusable para posts, comentarios y perfiles.
// Flujo en dos pasos: elegir motivo, después confirmar (con detalle
// opcional u obligatorio según el motivo).
// ============================================
import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, AlertTriangle, EyeOff, UserX } from 'lucide-react';
import { reportService, interactionService, blockService } from '../../services/api';
import './ReportModal.scss';

type EntityType = 'memory' | 'comment' | 'user';

interface Motivo {
  reason: string;
  label: string;
  descripcion: string;
}

const MOTIVOS: Motivo[] = [
  { reason: 'spam', label: 'Spam', descripcion: 'Publicidad no deseada, enlaces engañosos o contenido repetitivo' },
  { reason: 'contenido_inapropiado', label: 'Contenido inapropiado', descripcion: 'No respeta las normas de la comunidad' },
  { reason: 'acoso', label: 'Bullying, acoso o abuso', descripcion: 'Dirigido a vos o a otra persona' },
  { reason: 'discurso_odio', label: 'Discurso de odio', descripcion: 'Ataques por raza, religión, género u otra característica' },
  { reason: 'violencia', label: 'Contenido violento', descripcion: 'Que incita o muestra violencia' },
  { reason: 'desnudez_sexual', label: 'Desnudez o contenido sexual', descripcion: '' },
  { reason: 'informacion_falsa', label: 'Información falsa', descripcion: 'Noticias o datos engañosos' },
  { reason: 'suplantacion', label: 'Suplantación de identidad', descripcion: 'Se hace pasar por otra persona' },
  { reason: 'otro', label: 'Otro motivo', descripcion: 'Contanos qué pasa' },
];

const TITULOS: Record<EntityType, string> = {
  memory: 'Reportar publicación',
  comment: 'Reportar comentario',
  user: 'Reportar perfil',
};

interface ReportModalProps {
  entityType: EntityType;
  entityId: string;
  onClose: () => void;
  // opcionales — habilitan los botones extra del paso final ("ocultar"/"bloquear").
  // memoryId siempre tiene que ser el id del recuerdo (aunque estés reportando
  // un comentario adentro de ese recuerdo), y authorId el dueño del contenido.
  memoryId?: string;
  authorId?: string;
  authorName?: string;
  onHidden?: () => void; // avisa al padre que se ocultó, para sacarlo de la lista en pantalla
}

export default function ReportModal({
  entityType, entityId, onClose, memoryId, authorId, authorName, onHidden,
}: ReportModalProps) {
  const [paso, setPaso] = useState<'motivo' | 'confirmar' | 'enviado'>('motivo');
  const [motivoElegido, setMotivoElegido] = useState<Motivo | null>(null);
  const [detalle, setDetalle] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [ocultando, setOcultando] = useState(false);
  const [bloqueando, setBloqueando] = useState(false);
  const [yaOculto, setYaOculto] = useState(false);

  const elegirMotivo = (m: Motivo) => {
    setMotivoElegido(m);
    setPaso('confirmar');
    setError('');
  };

  const enviar = async () => {
    if (!motivoElegido) return;
    if (motivoElegido.reason === 'otro' && !detalle.trim()) {
      setError('Contanos brevemente qué está pasando');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await reportService.create(entityType, entityId, motivoElegido.reason, detalle.trim() || undefined);
      setPaso('enviado');
    } catch (err: any) {
      setError(err.message || 'No se pudo enviar el reporte');
    } finally {
      setEnviando(false);
    }
  };

  const ocultarPublicacion = async () => {
    if (!memoryId) return;
    setOcultando(true);
    try {
      await interactionService.hide(memoryId);
      setYaOculto(true);
      onHidden?.();
    } catch (err: any) {
      alert(err.message || 'No se pudo ocultar');
    } finally {
      setOcultando(false);
    }
  };

  const bloquearAutor = async () => {
    if (!authorId) return;
    if (!window.confirm(`¿Bloquear a ${authorName || 'esta persona'}? Ya no van a poder verse los perfiles ni conectarse.`)) return;
    setBloqueando(true);
    try {
      await blockService.block(authorId);
      onClose();
    } catch (err: any) {
      alert(err.message || 'No se pudo bloquear');
      setBloqueando(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal__header">
          {paso === 'confirmar' && (
            <button className="report-modal__back" onClick={() => setPaso('motivo')}>
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
          )}
          <h3>{paso === 'enviado' ? 'Reporte enviado' : TITULOS[entityType]}</h3>
          <button className="report-modal__cerrar" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {paso === 'motivo' && (
          <div className="report-modal__body">
            <div className="report-modal__aviso">
              <AlertTriangle size={15} strokeWidth={2} />
              <span>
                Los reportes falsos o hechos de mala fe pueden tener consecuencias para tu cuenta.
                Reportá solo si de verdad creés que esto no respeta las normas de la comunidad.
              </span>
            </div>
            <p className="report-modal__pregunta">¿Por qué querés reportar esto?</p>
            <div className="report-modal__lista">
              {MOTIVOS.map((m) => (
                <button key={m.reason} className="report-modal__motivo" onClick={() => elegirMotivo(m)}>
                  <span>
                    <strong>{m.label}</strong>
                    {m.descripcion && <small>{m.descripcion}</small>}
                  </span>
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 'confirmar' && motivoElegido && (
          <div className="report-modal__body">
            <p className="report-modal__motivo-elegido">
              Motivo: <strong>{motivoElegido.label}</strong>
            </p>
            <label className="report-modal__label">
              {motivoElegido.reason === 'otro' ? 'Contanos qué pasa' : 'Detalle (opcional)'}
            </label>
            <textarea
              className="report-modal__textarea"
              rows={4}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Agregá contexto si te parece útil..."
              maxLength={500}
            />
            {error && <p className="report-modal__error">{error}</p>}
            <button className="report-modal__enviar" disabled={enviando} onClick={enviar}>
              {enviando ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </div>
        )}

        {paso === 'enviado' && (
          <div className="report-modal__body report-modal__body--enviado">
            <p>Gracias por avisarnos. Vamos a revisarlo.</p>

            {(memoryId || authorId) && (
              <div className="report-modal__acciones-extra">
                {memoryId && (
                  <button className="report-modal__extra-btn" disabled={ocultando || yaOculto} onClick={ocultarPublicacion}>
                    <EyeOff size={15} strokeWidth={1.8} />
                    {yaOculto ? 'Publicación ocultada' : ocultando ? 'Ocultando...' : 'Ocultar esta publicación'}
                  </button>
                )}
                {authorId && (
                  <button className="report-modal__extra-btn report-modal__extra-btn--peligroso" disabled={bloqueando} onClick={bloquearAutor}>
                    <UserX size={15} strokeWidth={1.8} />
                    {bloqueando ? 'Bloqueando...' : `Bloquear a ${authorName || 'esta persona'}`}
                  </button>
                )}
              </div>
            )}

            <button className="report-modal__enviar" onClick={onClose}>Listo</button>
          </div>
        )}
      </div>
    </div>
  );
}