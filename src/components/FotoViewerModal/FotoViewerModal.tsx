// ============================================
// LIFE'S — Visor de foto (perfil/portada) con like y comentarios
// Reusa el mismo Memory que se creó al subir la foto
// ============================================
import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { memoryService } from '../../services/api';
import ReactionButton from '../ReactionButton/ReactionButton';
import ReactionResumen from '../ReactionButton/ReactionResumen';
import './FotoViewerModal.scss';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string; avatarUrl?: string | null };
}

interface FotoViewerModalProps {
  memoryId: string | null;
  imageUrl: string;
  titulo: string;
  onClose: (actualizado?: { commentsCount: number; reactionCounts: Record<string, number>; miReaccion: string | null }) => void;
}

export default function FotoViewerModal({ memoryId, imageUrl, titulo, onClose }: FotoViewerModalProps) {
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [miReaccion, setMiReaccion] = useState<string | null>(null);
  const [commentsCount, setCommentsCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [cargando, setCargando] = useState(!!memoryId);
  const [pagina, setPagina] = useState(1);
  const [hayMasComentarios, setHayMasComentarios] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);

  const COMENTARIOS_POR_PAGINA = 15;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!memoryId) return;
    (async () => {
      try {
        const [memRes, commentsRes]: any[] = await Promise.all([
          memoryService.getById(memoryId),
          memoryService.listComments(memoryId, 1, COMENTARIOS_POR_PAGINA),
        ]);
        setReactionCounts(memRes.data.reactionCounts || {});
        setMiReaccion(memRes.data.miReaccion || null);
        setCommentsCount(memRes.data.commentsCount);
        setComments(commentsRes.data.items);
        setHayMasComentarios(commentsRes.data.page < commentsRes.data.totalPages);
      } catch {
        // si falla, el visor igual muestra la imagen sin like/comentarios
      } finally {
        setCargando(false);
      }
    })();
  }, [memoryId]);

  const cargarMasComentarios = async () => {
    if (!memoryId) return;
    setCargandoMas(true);
    try {
      const siguiente = pagina + 1;
      const res: any = await memoryService.listComments(memoryId, siguiente, COMENTARIOS_POR_PAGINA);
      setComments([...comments, ...res.data.items]);
      setPagina(siguiente);
      setHayMasComentarios(siguiente < res.data.totalPages);
    } catch {
      // si falla cargar más, dejamos lo que ya se ve
    } finally {
      setCargandoMas(false);
    }
  };

  const reaccionar = async (type: string) => {
    if (!memoryId) return;
    try {
      const res: any = await memoryService.setReaction(memoryId, type);
      setMiReaccion(res.data.miReaccion);
      setReactionCounts(res.data.reactionCounts);
    } catch {
      // sin drama si falla, no rompemos el visor
    }
  };

  const enviarComentario = async () => {
    if (!memoryId || !nuevoComentario.trim()) return;
    try {
      const res: any = await memoryService.addComment(memoryId, nuevoComentario.trim());
      setComments([...comments, res.data]);
      setCommentsCount(commentsCount + 1);
      setNuevoComentario('');
    } catch (err: any) {
      alert(err.message || 'Error al comentar');
    }
  };

  return (
    <div className="foto-viewer-overlay" onClick={() => onClose()}>
      <div className="foto-viewer" onClick={(e) => e.stopPropagation()}>
        <button
          className="foto-viewer__cerrar"
          onClick={() => onClose({ commentsCount, reactionCounts, miReaccion })}
        >
          <X size={18} />
        </button>

        <div className="foto-viewer__imagen">
          <img src={imageUrl} alt={titulo} />
        </div>

        <div className="foto-viewer__panel">
          <h3>{titulo}</h3>

          {memoryId ? (
            <>
              <div className="foto-viewer__acciones">
                <ReactionButton reactionCounts={reactionCounts} miReaccion={miReaccion} onReact={reaccionar} />
                <span><MessageCircle size={16} /> {commentsCount}</span>
                <ReactionResumen memoryId={memoryId} reactionCounts={reactionCounts} />
              </div>

              <div className="foto-viewer__comentarios">
                {cargando && <p className="foto-viewer__vacio">Cargando...</p>}
                {!cargando && comments.length === 0 && (
                  <p className="foto-viewer__vacio">Sin comentarios todavía.</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="foto-viewer__comentario">
                    <strong>{c.user.firstName} {c.user.lastName}</strong>
                    <span>{c.content}</span>
                  </div>
                ))}
                {hayMasComentarios && (
                  <button className="foto-viewer__ver-mas" onClick={cargarMasComentarios} disabled={cargandoMas}>
                    {cargandoMas ? 'Cargando...' : 'Ver más comentarios'}
                  </button>
                )}
              </div>

              <div className="foto-viewer__nuevo-comentario">
                <input
                  type="text"
                  placeholder="Escribí un comentario..."
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && enviarComentario()}
                />
                <button onClick={enviarComentario}>Enviar</button>
              </div>
            </>
          ) : (
            <p className="foto-viewer__vacio">
              Esta foto es de antes de que sumáramos likes y comentarios — subí una nueva para poder interactuar con ella.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
