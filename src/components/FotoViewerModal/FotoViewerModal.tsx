// ============================================
// LIFE'S — Visor de foto (perfil/portada) con like y comentarios
// Reusa el mismo Memory que se creó al subir la foto
// ============================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Flag, MoreHorizontal, Bookmark, EyeOff, VolumeX, UserX, Trash2, Share2, Edit2 } from 'lucide-react';
import { memoryService, interactionService, blockService } from '../../services/api';
import { formatConteo } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import ReactionButton from '../ReactionButton/ReactionButton';
import ReactionResumen from '../ReactionButton/ReactionResumen';
import ReportModal from '../ReportModal/ReportModal';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import PersonHoverCard from '../PersonHoverCard/PersonHoverCard';
import './FotoViewerModal.scss';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  parentId?: string | null;
  replyToUserId?: string | null;
  reactionCounts: Record<string, number>;
  miReaccion: string | null;
  repliesCount: number;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

interface RespondiendoA {
  targetId: string;   // el comentario puntual al que le contestás (raíz o respuesta)
  targetName: string;
  rootId: string;     // bajo qué hilo raíz se muestra en pantalla
}

interface FotoViewerModalProps {
  memoryId: string | null;
  imageUrl: string;
  titulo: string;
  authorId?: string;   // dueño de la publicación — habilita "Ocultar"/"Bloquear" al reportar
  authorName?: string;
  onClose: (actualizado?: { commentsCount: number; reactionCounts: Record<string, number>; miReaccion: string | null; oculta?: boolean }) => void;
}

export default function FotoViewerModal({ memoryId, imageUrl, titulo, authorId, authorName, onClose }: FotoViewerModalProps) {
  const { user } = useAuth();
  const [autor, setAutor] = useState<{ id: string; firstName: string; lastName: string; avatarUrl?: string | null } | null>(null);
  const [creadoEn, setCreadoEn] = useState<string | null>(null);
  const [tooltipFechaAbierto, setTooltipFechaAbierto] = useState(false);
  const [tooltipComentarioId, setTooltipComentarioId] = useState<string | null>(null);
  const [sharesCount, setSharesCount] = useState(0);
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [reportandoPost, setReportandoPost] = useState(false);
  const [reportandoComentarioId, setReportandoComentarioId] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [menuComentarioAbierto, setMenuComentarioAbierto] = useState<string | null>(null);
  const [eliminandoComentarioId, setEliminandoComentarioId] = useState<string | null>(null);
  const [editandoComentarioId, setEditandoComentarioId] = useState<string | null>(null);
  const [textoEdicion, setTextoEdicion] = useState('');
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [confirmandoBloqueo, setConfirmandoBloqueo] = useState(false);
  const [comentariosOcultos, setComentariosOcultos] = useState<Comment[]>([]);
  const [verOcultos, setVerOcultos] = useState(false);
  const [posMenuComentario, setPosMenuComentario] = useState({ top: 0, left: 0 });
  const [repliesByRoot, setRepliesByRoot] = useState<Record<string, Comment[]>>({});
  // respuestas que ACABÁS de publicar en esta sesión — se muestran de
  // inmediato debajo de la raíz aunque el hilo esté colapsado, sin
  // necesidad de tocar "Ver respuestas"
  const [respuestasPropiasByRoot, setRespuestasPropiasByRoot] = useState<Record<string, Comment[]>>({});
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set());
  const [cargandoReplies, setCargandoReplies] = useState<Set<string>>(new Set());
  const [respondiendoA, setRespondiendoA] = useState<RespondiendoA | null>(null);

  const abrirMenuComentario = (e: React.MouseEvent, commentId: string) => {
    if (menuComentarioAbierto === commentId) {
      setMenuComentarioAbierto(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPosMenuComentario({ top: rect.bottom + 4, left: rect.left });
    setMenuComentarioAbierto(commentId);
  };

  const ocultarComentario = async (commentId: string) => {
    setMenuComentarioAbierto(null);
    const comentario = comments.find(c => c.id === commentId);
    try {
      await interactionService.hideComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      if (comentario) setComentariosOcultos([...comentariosOcultos, comentario]);
      setCommentsCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      alert(err.message || 'Error al ocultar el comentario');
    }
  };

  const mostrarComentarioDeNuevo = async (commentId: string) => {
    const comentario = comentariosOcultos.find(c => c.id === commentId);
    try {
      await interactionService.unhideComment(commentId);
      setComentariosOcultos(comentariosOcultos.filter(c => c.id !== commentId));
      if (comentario) setComments([...comments, comentario].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      setCommentsCount(prev => prev + 1);
    } catch (err: any) {
      alert(err.message || 'Error al mostrar el comentario');
    }
  };

  const VENTANA_EDICION_MS = 60 * 60 * 1000; // 1 hora, igual que el backend
  const puedeEditar = (c: Comment) => user?.id === c.user.id && (Date.now() - new Date(c.createdAt).getTime()) < VENTANA_EDICION_MS;

  const iniciarEdicion = (c: Comment) => {
    setEditandoComentarioId(c.id);
    setTextoEdicion(c.content);
    setMenuComentarioAbierto(null);
  };

  const cancelarEdicion = () => {
    setEditandoComentarioId(null);
    setTextoEdicion('');
  };

  const guardarEdicionComentario = async (commentId: string, rootId?: string) => {
    if (!textoEdicion.trim()) return;
    setGuardandoEdicion(true);
    try {
      const res: any = await memoryService.editComment(commentId, textoEdicion.trim());
      if (!rootId) {
        setComments(comments.map(c => c.id === commentId ? { ...c, content: res.data.content, editedAt: res.data.editedAt } : c));
      } else {
        setRepliesByRoot(prev => ({
          ...prev,
          [rootId]: (prev[rootId] || []).map(r => r.id === commentId ? { ...r, content: res.data.content, editedAt: res.data.editedAt } : r),
        }));
      }
      cancelarEdicion();
    } catch (err: any) {
      alert(err.message || 'No se pudo editar el comentario');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const confirmarEliminarComentario = async () => {
    if (!memoryId || !eliminandoComentarioId) return;
    const commentId = eliminandoComentarioId;
    setEliminandoComentarioId(null);
    try {
      await memoryService.deleteComment(memoryId, commentId);
      const esRaiz = comments.find(c => c.id === commentId);
      if (esRaiz) {
        // al ser raíz, el backend borra en cascada sus respuestas también
        setComments(comments.filter(c => c.id !== commentId));
        setCommentsCount(prev => Math.max(0, prev - 1 - esRaiz.repliesCount));
      } else {
        const rootId = Object.keys(repliesByRoot).find(rid => repliesByRoot[rid].some(r => r.id === commentId));
        if (rootId) {
          setRepliesByRoot(prev => ({ ...prev, [rootId]: prev[rootId].filter(r => r.id !== commentId) }));
          setComments(comments.map(c => c.id === rootId ? { ...c, repliesCount: Math.max(0, c.repliesCount - 1) } : c));
        }
        setCommentsCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el comentario');
    }
  };

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
        setAutor(memRes.data.user || null);
        setCreadoEn(memRes.data.createdAt || null);
        setSharesCount(memRes.data.sharesCount || 0);

        interactionService.listSavedIds()
          .then((res: any) => setGuardado(res.data.includes(memoryId)))
          .catch(() => { });
        setComments(commentsRes.data.items);
        setComentariosOcultos(commentsRes.data.ocultos || []);
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

  const compartir = async () => {
    if (!memoryId) return;
    const link = `${window.location.origin}/feed/${memoryId}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast('✓ Link copiado — funcionará una vez que Life\'s esté en un dominio real');
    } catch {
      showToast('⚠️ No se pudo copiar el link');
    }
    try {
      const res: any = await memoryService.share(memoryId);
      setSharesCount(res.data.sharesCount);
    } catch {
      // si falla el conteo, no le arruinamos la experiencia de compartir por esto
    }
  };

  const reaccionarComentario = async (commentId: string, type: string, rootId?: string) => {
    try {
      const res: any = await memoryService.setCommentReaction(commentId, type);
      if (!rootId) {
        setComments(comments.map(c => c.id === commentId ? { ...c, miReaccion: res.data.miReaccion, reactionCounts: res.data.reactionCounts } : c));
      } else {
        setRepliesByRoot(prev => ({
          ...prev,
          [rootId]: (prev[rootId] || []).map(r => r.id === commentId ? { ...r, miReaccion: res.data.miReaccion, reactionCounts: res.data.reactionCounts } : r),
        }));
      }
    } catch {
      // sin drama si falla, no rompemos el visor
    }
  };

  const toggleRespuestas = async (rootId: string) => {
    if (expandedRoots.has(rootId)) {
      setExpandedRoots(prev => { const s = new Set(prev); s.delete(rootId); return s; });
      return;
    }
    setExpandedRoots(prev => new Set(prev).add(rootId));
    if (repliesByRoot[rootId]) return;
    setCargandoReplies(prev => new Set(prev).add(rootId));
    try {
      const res: any = await memoryService.listReplies(rootId);
      setRepliesByRoot(prev => ({ ...prev, [rootId]: res.data }));
    } catch {
      setRepliesByRoot(prev => ({ ...prev, [rootId]: [] }));
    } finally {
      setCargandoReplies(prev => { const s = new Set(prev); s.delete(rootId); return s; });
    }
  };

  const iniciarRespuesta = (comment: Comment) => {
    const rootId = comment.parentId || comment.id;
    setRespondiendoA({ targetId: comment.id, targetName: comment.user.firstName, rootId });
    setNuevoComentario(`@${comment.user.firstName} `);
  };

  const cancelarRespuesta = () => {
    setRespondiendoA(null);
    setNuevoComentario('');
  };

  // el "@Nombre" queda como parte del texto del comentario — así identifica
  // para siempre a quién le respondió, aunque el hilo se muestre a un solo nivel
  const renderConTag = (content: string, replyToUserId?: string | null) => {
    const match = content.match(/^(@\S+)(\s.*)?$/s);
    if (!match) return content;
    if (replyToUserId) {
      return <><Link to={`/perfil/${replyToUserId}`} className="foto-viewer__tag" onClick={sincronizarAntesDeIrAlPerfil}>{match[1]}</Link>{match[2] || ''}</>;
    }
    return <><strong className="foto-viewer__tag">{match[1]}</strong>{match[2] || ''}</>;
  };

  const toggleGuardar = async () => {
    if (!memoryId) return;
    setMenuAbierto(false);
    try {
      if (guardado) {
        await interactionService.unsave(memoryId);
        setGuardado(false);
      } else {
        await interactionService.save(memoryId);
        setGuardado(true);
      }
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  };

  const ocultarDesdeMenu = async () => {
    if (!memoryId) return;
    setMenuAbierto(false);
    try {
      await interactionService.hide(memoryId);
      onClose({ commentsCount, reactionCounts, miReaccion, oculta: true });
    } catch (err: any) {
      alert(err.message || 'Error al ocultar');
    }
  };

  const silenciarDesdeMenu = async () => {
    if (!authorId) return;
    setMenuAbierto(false);
    if (!window.confirm(`¿Silenciar a ${authorName || 'esta persona'}? No vas a ver más sus publicaciones, y no se le avisa.`)) return;
    try {
      await interactionService.mute(authorId);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al silenciar');
    }
  };

  const bloquearDesdeMenu = () => {
    if (!authorId) return;
    setMenuAbierto(false);
    setConfirmandoBloqueo(true);
  };

  const confirmarBloqueoDesdeMenu = async () => {
    if (!authorId) return;
    setConfirmandoBloqueo(false);
    try {
      await blockService.block(authorId);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al bloquear');
    }
  };

  const enviarComentario = async () => {
    if (!memoryId || !nuevoComentario.trim()) return;
    try {
      const res: any = await memoryService.addComment(memoryId, nuevoComentario.trim(), respondiendoA?.targetId);
      if (respondiendoA) {
        const { rootId } = respondiendoA;
        // tu respuesta se ve de inmediato debajo de la raíz, sin desplegar
        // el hilo entero — las respuestas anteriores (de otros o tuyas)
        // siguen colapsadas hasta que se toque "Ver respuestas"
        setRespuestasPropiasByRoot(prev => ({ ...prev, [rootId]: [...(prev[rootId] || []), res.data] }));
        // si el hilo ya estaba desplegado, la sumamos también a la lista
        // completa para que no se pierda al volver a colapsar/expandir
        setRepliesByRoot(prev => prev[rootId] ? { ...prev, [rootId]: [...prev[rootId], res.data] } : prev);
        setComments(comments.map(c => c.id === rootId ? { ...c, repliesCount: c.repliesCount + 1 } : c));
        setRespondiendoA(null);
      } else {
        setComments([...comments, res.data]);
      }
      setCommentsCount(commentsCount + 1);
      setNuevoComentario('');
    } catch (err: any) {
      alert(err.message || 'Error al comentar');
    }
  };

  const sincronizarAntesDeIrAlPerfil = () => {
    onClose({ commentsCount, reactionCounts, miReaccion });
  };

  const formatFechaHora = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const tiempoRelativo = (iso: string): string => {
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
    return fecha.toLocaleDateString('es-AR');
  };

  const inputRespuestaJSX = respondiendoA && (
    <div className="foto-viewer__respuesta-input">
      <div className="foto-viewer__respondiendo-chip">
        Respondiendo a <strong>{respondiendoA.targetName}</strong>
        <button onClick={cancelarRespuesta}>✕</button>
      </div>
      <div className="foto-viewer__nuevo-comentario">
        <input
          type="text"
          placeholder="Escribí una respuesta..."
          value={nuevoComentario}
          onChange={(e) => setNuevoComentario(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviarComentario()}
          autoFocus
        />
        <button onClick={enviarComentario}>Enviar</button>
      </div>
    </div>
  );

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
          <div className="foto-viewer__panel-header">
            <div className="foto-viewer__autor-row">
              <div className="foto-viewer__autor-info">
                {autor && (
                  <PersonHoverCard userId={autor.id}>
                    <Link to={`/perfil/${autor.id}`} className="foto-viewer__autor-btn" onClick={sincronizarAntesDeIrAlPerfil}>
                      {autor.avatarUrl
                        ? <img src={autor.avatarUrl} alt={autor.firstName} className="foto-viewer__autor-avatar" />
                        : <div className="foto-viewer__autor-avatar foto-viewer__autor-avatar--vacio">{autor.firstName[0]}</div>
                      }
                      <span>{autor.firstName} {autor.lastName}</span>
                    </Link>
                  </PersonHoverCard>
                )}
                {creadoEn && (
                  <div className="foto-viewer__fecha-wrap">
                    <button
                      className="foto-viewer__fecha"
                      onClick={() => setTooltipFechaAbierto(v => !v)}
                      onMouseEnter={() => setTooltipFechaAbierto(true)}
                      onMouseLeave={() => setTooltipFechaAbierto(false)}
                    >
                      {tiempoRelativo(creadoEn)}
                    </button>
                    {tooltipFechaAbierto && (
                      <div className="foto-viewer__fecha-tooltip">{formatFechaHora(creadoEn)}</div>
                    )}
                  </div>
                )}
              </div>
              {memoryId && (
                <div className="foto-viewer__menu-wrap">
                  <button className="foto-viewer__more" onClick={() => setMenuAbierto(v => !v)}>
                    <MoreHorizontal size={18} strokeWidth={1.8} />
                  </button>
                  {menuAbierto && (
                    <>
                      <div className="foto-viewer__menu-backdrop" onClick={() => setMenuAbierto(false)} />
                      <div className="foto-viewer__menu">
                        <button onClick={toggleGuardar}>
                          <Bookmark size={14} strokeWidth={1.8} color={guardado ? '#855324' : 'currentColor'} fill={guardado ? '#855324' : 'none'} />
                          {guardado ? 'Quitar de guardados' : 'Guardar publicación'}
                        </button>
                        {authorId && (
                          <>
                            <button onClick={ocultarDesdeMenu}>
                              <EyeOff size={14} strokeWidth={1.8} /> Ocultar esta publicación
                            </button>
                            <button onClick={silenciarDesdeMenu}>
                              <VolumeX size={14} strokeWidth={1.8} /> Silenciar a {authorName || 'esta persona'}
                            </button>
                            <button onClick={bloquearDesdeMenu}>
                              <UserX size={14} strokeWidth={1.8} /> Bloquear a {authorName || 'esta persona'}
                            </button>
                          </>
                        )}
                        <button onClick={() => { setMenuAbierto(false); setReportandoPost(true); }}>
                          <Flag size={14} strokeWidth={1.8} /> Reportar publicación
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <h3>{titulo}</h3>
          </div>

          {memoryId ? (
            <>
              <div className="foto-viewer__acciones">
                <ReactionButton reactionCounts={reactionCounts} miReaccion={miReaccion} onReact={reaccionar} />
                <span><MessageCircle size={16} /> {commentsCount > 0 && formatConteo(commentsCount)}</span>
                <button onClick={compartir} className="foto-viewer__compartir">
                  <Share2 size={16} /> {sharesCount > 0 && formatConteo(sharesCount)}
                </button>
                <ReactionResumen memoryId={memoryId} reactionCounts={reactionCounts} />
              </div>

              <div className="foto-viewer__comentarios">
                {cargando && <p className="foto-viewer__vacio">Cargando...</p>}
                {!cargando && comments.length === 0 && (
                  <p className="foto-viewer__vacio">Sin comentarios todavía.</p>
                )}
                {comments.map((c) => {
                  const esMiComentario = user && c.user.id === user.id;
                  const soyDuenoDelPost = user && authorId === user.id;
                  const puedeEliminar = esMiComentario || soyDuenoDelPost;
                  const desplegado = expandedRoots.has(c.id);
                  const misRespuestas = respuestasPropiasByRoot[c.id] || [];
                  const respuestasAMostrar = desplegado ? (repliesByRoot[c.id] || []) : misRespuestas;
                  const faltantes = c.repliesCount - respuestasAMostrar.length;

                  return (
                    <div key={c.id} className={`foto-viewer__comentario${respondiendoA?.targetId === c.id ? ' foto-viewer__comentario--respondiendo' : ''}`}>
                      <div className="foto-viewer__comentario-header">
                        <PersonHoverCard userId={c.user.id}>
                          <Link to={`/perfil/${c.user.id}`} className="foto-viewer__comentario-autor" onClick={sincronizarAntesDeIrAlPerfil}>
                            {c.user.firstName} {c.user.lastName}
                          </Link>
                        </PersonHoverCard>
                        <div className="foto-viewer__comentario-fecha-wrap">
                          <button
                            className="foto-viewer__comentario-fecha"
                            onClick={() => setTooltipComentarioId(prev => prev === c.id ? null : c.id)}
                            onMouseEnter={() => setTooltipComentarioId(c.id)}
                            onMouseLeave={() => setTooltipComentarioId(prev => prev === c.id ? null : prev)}
                          >
                            {tiempoRelativo(c.createdAt)}
                          </button>
                          {tooltipComentarioId === c.id && (
                            <div className="foto-viewer__fecha-tooltip">{formatFechaHora(c.createdAt)}</div>
                          )}
                        </div>
                        {user && (
                          <div className="foto-viewer__comentario-menu-wrap">
                            <button
                              className="foto-viewer__comentario-more"
                              onClick={(e) => abrirMenuComentario(e, c.id)}
                            >
                              <MoreHorizontal size={14} strokeWidth={1.8} />
                            </button>
                            {menuComentarioAbierto === c.id && (
                              <>
                                <div className="foto-viewer__menu-backdrop" onClick={() => setMenuComentarioAbierto(null)} />
                                <div
                                  className="foto-viewer__menu foto-viewer__menu--comentario"
                                  style={{ top: posMenuComentario.top, left: posMenuComentario.left }}
                                >
                                  {esMiComentario && puedeEditar(c) && (
                                    <button onClick={() => iniciarEdicion(c)}>
                                      <Edit2 size={13} strokeWidth={1.8} /> Editar comentario
                                    </button>
                                  )}
                                  {!esMiComentario && (
                                    <button onClick={() => ocultarComentario(c.id)}>
                                      <EyeOff size={13} strokeWidth={1.8} /> Ocultar comentario
                                    </button>
                                  )}
                                  {puedeEliminar && (
                                    <button className="foto-viewer__menu-eliminar" onClick={() => { setMenuComentarioAbierto(null); setEliminandoComentarioId(c.id); }}>
                                      <Trash2 size={13} strokeWidth={1.8} /> Eliminar comentario
                                    </button>
                                  )}
                                  {!esMiComentario && (
                                    <button onClick={() => { setMenuComentarioAbierto(null); setReportandoComentarioId(c.id); }}>
                                      <Flag size={13} strokeWidth={1.8} /> Reportar comentario
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {editandoComentarioId === c.id ? (
                        <div className="foto-viewer__edicion-comentario">
                          <input
                            type="text"
                            value={textoEdicion}
                            onChange={e => setTextoEdicion(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && guardarEdicionComentario(c.id)}
                            autoFocus
                          />
                          <button disabled={guardandoEdicion} onClick={() => guardarEdicionComentario(c.id)}>Guardar</button>
                          <button className="foto-viewer__edicion-cancelar" onClick={cancelarEdicion}>Cancelar</button>
                        </div>
                      ) : (
                        <span>
                          {renderConTag(c.content, c.replyToUserId)}
                          {c.editedAt && <span className="foto-viewer__editado"> (editado)</span>}
                        </span>
                      )}
                      <div className="foto-viewer__comentario-acciones">
                        <ReactionButton
                          reactionCounts={c.reactionCounts}
                          miReaccion={c.miReaccion}
                          onReact={(type) => reaccionarComentario(c.id, type)}
                        />
                        {user && (
                          <button className="foto-viewer__comentario-responder" onClick={() => iniciarRespuesta(c)}>
                            Responder
                          </button>
                        )}
                        <ReactionResumen commentId={c.id} reactionCounts={c.reactionCounts} />
                      </div>

                      {respondiendoA?.targetId === c.id && inputRespuestaJSX}

                      {(desplegado || faltantes > 0) && (
                        <button className="foto-viewer__ver-respuestas" onClick={() => toggleRespuestas(c.id)}>
                          {desplegado ? 'Ocultar respuestas' : `Ver ${faltantes} respuesta${faltantes === 1 ? '' : 's'}`}
                        </button>
                      )}

                      {(desplegado || misRespuestas.length > 0) && (
                        <div className="foto-viewer__respuestas">
                          {cargandoReplies.has(c.id) && <p className="foto-viewer__vacio">Cargando respuestas...</p>}
                          {respuestasAMostrar.map((r) => {
                            const esMiRespuesta = user && r.user.id === user.id;
                            const puedeEliminarRespuesta = esMiRespuesta || soyDuenoDelPost;
                            return (
                              <div key={r.id} className={`foto-viewer__comentario foto-viewer__comentario--respuesta${respondiendoA?.targetId === r.id ? ' foto-viewer__comentario--respondiendo' : ''}`}>
                                <div className="foto-viewer__comentario-header">
                                  <PersonHoverCard userId={r.user.id}>
                                    <Link to={`/perfil/${r.user.id}`} className="foto-viewer__comentario-autor" onClick={sincronizarAntesDeIrAlPerfil}>
                                      {r.user.firstName} {r.user.lastName}
                                    </Link>
                                  </PersonHoverCard>
                                  <div className="foto-viewer__comentario-fecha-wrap">
                                    <button
                                      className="foto-viewer__comentario-fecha"
                                      onClick={() => setTooltipComentarioId(prev => prev === r.id ? null : r.id)}
                                      onMouseEnter={() => setTooltipComentarioId(r.id)}
                                      onMouseLeave={() => setTooltipComentarioId(prev => prev === r.id ? null : prev)}
                                    >
                                      {tiempoRelativo(r.createdAt)}
                                    </button>
                                    {tooltipComentarioId === r.id && (
                                      <div className="foto-viewer__fecha-tooltip">{formatFechaHora(r.createdAt)}</div>
                                    )}
                                  </div>
                                  {user && (
                                    <div className="foto-viewer__comentario-menu-wrap">
                                      <button
                                        className="foto-viewer__comentario-more"
                                        onClick={(e) => abrirMenuComentario(e, r.id)}
                                      >
                                        <MoreHorizontal size={14} strokeWidth={1.8} />
                                      </button>
                                      {menuComentarioAbierto === r.id && (
                                        <>
                                          <div className="foto-viewer__menu-backdrop" onClick={() => setMenuComentarioAbierto(null)} />
                                          <div
                                            className="foto-viewer__menu foto-viewer__menu--comentario"
                                            style={{ top: posMenuComentario.top, left: posMenuComentario.left }}
                                          >
                                            {esMiRespuesta && puedeEditar(r) && (
                                              <button onClick={() => iniciarEdicion(r)}>
                                                <Edit2 size={13} strokeWidth={1.8} /> Editar respuesta
                                              </button>
                                            )}
                                            {puedeEliminarRespuesta && (
                                              <button className="foto-viewer__menu-eliminar" onClick={() => { setMenuComentarioAbierto(null); setEliminandoComentarioId(r.id); }}>
                                                <Trash2 size={13} strokeWidth={1.8} /> Eliminar respuesta
                                              </button>
                                            )}
                                            {!esMiRespuesta && (
                                              <button onClick={() => { setMenuComentarioAbierto(null); setReportandoComentarioId(r.id); }}>
                                                <Flag size={13} strokeWidth={1.8} /> Reportar respuesta
                                              </button>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {editandoComentarioId === r.id ? (
                                  <div className="foto-viewer__edicion-comentario">
                                    <input
                                      type="text"
                                      value={textoEdicion}
                                      onChange={e => setTextoEdicion(e.target.value)}
                                      onKeyDown={e => e.key === 'Enter' && guardarEdicionComentario(r.id, c.id)}
                                      autoFocus
                                    />
                                    <button disabled={guardandoEdicion} onClick={() => guardarEdicionComentario(r.id, c.id)}>Guardar</button>
                                    <button className="foto-viewer__edicion-cancelar" onClick={cancelarEdicion}>Cancelar</button>
                                  </div>
                                ) : (
                                  <span>
                                    {renderConTag(r.content, r.replyToUserId)}
                                    {r.editedAt && <span className="foto-viewer__editado"> (editado)</span>}
                                  </span>
                                )}
                                <div className="foto-viewer__comentario-acciones">
                                  <ReactionButton
                                    reactionCounts={r.reactionCounts}
                                    miReaccion={r.miReaccion}
                                    onReact={(type) => reaccionarComentario(r.id, type, c.id)}
                                  />
                                  {user && (
                                    <button className="foto-viewer__comentario-responder" onClick={() => iniciarRespuesta(r)}>
                                      Responder
                                    </button>
                                  )}
                                  <ReactionResumen commentId={r.id} reactionCounts={r.reactionCounts} />
                                </div>
                                {respondiendoA?.targetId === r.id && inputRespuestaJSX}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {hayMasComentarios && (
                  <button className="foto-viewer__ver-mas" onClick={cargarMasComentarios} disabled={cargandoMas}>
                    {cargandoMas ? 'Cargando...' : 'Ver más comentarios'}
                  </button>
                )}

                {comentariosOcultos.length > 0 && (
                  <div className="foto-viewer__ocultos">
                    <button className="foto-viewer__ocultos-toggle" onClick={() => setVerOcultos(v => !v)}>
                      {verOcultos ? 'Ocultar' : `Ver comentarios ocultados (${comentariosOcultos.length})`}
                    </button>
                    {verOcultos && comentariosOcultos.map((c) => (
                      <div key={c.id} className="foto-viewer__comentario foto-viewer__comentario--oculto">
                        <div className="foto-viewer__comentario-header">
                          <Link to={`/perfil/${c.user.id}`} className="foto-viewer__comentario-autor" onClick={sincronizarAntesDeIrAlPerfil}>
                            {c.user.firstName} {c.user.lastName}
                          </Link>
                          <button className="foto-viewer__mostrar-btn" onClick={() => mostrarComentarioDeNuevo(c.id)}>
                            Mostrar de nuevo
                          </button>
                        </div>
                        <span>{renderConTag(c.content, c.replyToUserId)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!respondiendoA && (
                <div className="foto-viewer__nuevo-comentario-wrap">
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
                </div>
              )}
            </>
          ) : (
            <p className="foto-viewer__vacio">
              Esta foto es de antes de que sumáramos likes y comentarios — subí una nueva para poder interactuar con ella.
            </p>
          )}
        </div>
      </div>

      {reportandoPost && memoryId && (
        <ReportModal
          entityType="memory"
          entityId={memoryId}
          memoryId={memoryId}
          authorId={authorId}
          authorName={authorName}
          onClose={() => setReportandoPost(false)}
          onHidden={() => onClose()}
        />
      )}

      {reportandoComentarioId && (() => {
        const comentario =
          comments.find(c => c.id === reportandoComentarioId) ||
          Object.values(repliesByRoot).flat().find(r => r.id === reportandoComentarioId);
        return (
          <ReportModal
            entityType="comment"
            entityId={reportandoComentarioId}
            authorId={comentario?.user.id}
            authorName={comentario?.user.firstName}
            onClose={() => setReportandoComentarioId(null)}
          />
        );
      })()}

      {eliminandoComentarioId && (
        <ConfirmModal
          titulo="Eliminar comentario"
          mensaje="¿Eliminar este comentario? No se puede deshacer."
          textoConfirmar="Sí, eliminar"
          peligroso
          onConfirm={confirmarEliminarComentario}
          onCancel={() => setEliminandoComentarioId(null)}
        />
      )}

      {confirmandoBloqueo && (
        <ConfirmModal
          titulo="Bloquear a esta persona"
          mensaje={`¿Bloquear a ${authorName || 'esta persona'}? Ya no van a poder ver sus perfiles ni conectarse.`}
          textoConfirmar="Sí, bloquear"
          peligroso
          onConfirm={confirmarBloqueoDesdeMenu}
          onCancel={() => setConfirmandoBloqueo(false)}
        />
      )}

      {toast && <div className="foto-viewer__toast">{toast}</div>}

    </div>
  );
}