// ============================================
// LIFE'S — Feed Principal
// Conectado al backend real: tus recuerdos + los de tus conexiones aceptadas
// ============================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  LayoutList, Grid, Activity, Camera,
  Heart, MessageCircle, Edit2, MoreHorizontal, Trash2, Share2,
} from 'lucide-react';
import { memoryService, chapterService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CrearRecuerdoModal from '../../components/CrearRecuerdoModal/CrearRecuerdoModal';
import FotoViewerModal from '../../components/FotoViewerModal/FotoViewerModal';
import ReactionButton from '../../components/ReactionButton/ReactionButton';
import ReactionResumen from '../../components/ReactionButton/ReactionResumen';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import './Feed.scss';

type Vista = 'feed' | 'galeria' | 'cronologia';

interface Chapter {
  id: string;
  nombre: string;
  emoji: string;
}

interface FeedItem {
  id: string;
  userId: string;
  caption?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  chapterId?: string | null;
  reactionCounts: Record<string, number>;
  miReaccion: string | null;
  commentsCount: number;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

function tiempoRelativo(iso: string): string {
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
}

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { memoryId: memoryIdDeLink } = useParams();

  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [vista, setVista] = useState<Vista>('feed');
  const [misCapitulos, setMisCapitulos] = useState<Chapter[]>([]);
  const [capituloFiltro, setCapituloFiltro] = useState('');

  const [crearAbierto, setCrearAbierto] = useState(false);
  const [viendoPost, setViendoPost] = useState<FeedItem | null>(null);

  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    cargarFeed(1);
    chapterService.list().then((res: any) => setMisCapitulos(res.data)).catch(() => {});
  }, []);

  // si entraste por un link directo a un recuerdo puntual, lo abrimos solo
  useEffect(() => {
    if (!memoryIdDeLink) return;
    memoryService.getById(memoryIdDeLink).then((res: any) => {
      setViendoPost({
        id: res.data.id,
        userId: res.data.userId,
        caption: res.data.caption,
        mediaUrl: res.data.mediaUrl,
        mediaType: res.data.mediaType,
        chapterId: res.data.chapterId,
        reactionCounts: res.data.reactionCounts,
        miReaccion: res.data.miReaccion,
        commentsCount: res.data.commentsCount,
        createdAt: res.data.createdAt,
        user: { id: res.data.userId, firstName: '', lastName: '', avatarUrl: null },
      });
    }).catch(() => showToast('⚠️ Ese recuerdo no existe o no tenés permiso para verlo'));
  }, [memoryIdDeLink]);

  useEffect(() => {
    const onNavRefresh = (e: Event) => {
      if ((e as CustomEvent).detail !== '/feed') return;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      cargarFeed(1);
    };
    window.addEventListener('lifes:nav-refresh', onNavRefresh);
    return () => window.removeEventListener('lifes:nav-refresh', onNavRefresh);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (eliminandoId) { setEliminandoId(null); return; }
      if (editandoId) { setEditandoId(null); return; }
      if (menuAbiertoId) { setMenuAbiertoId(null); return; }
      if (crearAbierto) { setCrearAbierto(false); return; }
      if (viendoPost) { setViendoPost(null); return; }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [eliminandoId, editandoId, menuAbiertoId, crearAbierto, viendoPost]);

  async function cargarFeed(pagina: number) {
    if (pagina === 1) setCargando(true); else setCargandoMas(true);
    try {
      const res: any = await memoryService.getFeed(pagina, 15);
      setItems(pagina === 1 ? res.data.items : [...items, ...res.data.items]);
      setTotalPages(res.data.totalPages);
      setPage(pagina);
    } catch (err) {
      console.error('Error al cargar el feed:', err);
    } finally {
      setCargando(false);
      setCargandoMas(false);
    }
  }

  const itemsFiltrados = capituloFiltro
    ? items.filter(i => i.chapterId === capituloFiltro)
    : items;
  
    // Scroll infinito: cuando el "centinela" invisible del final de la lista
  // entra en pantalla, pedimos la página siguiente sola, sin botón.
  const cargarMasRef = useRef(() => {});
  cargarMasRef.current = () => {
    if (!cargando && !cargandoMas && page < totalPages) {
      cargarFeed(page + 1);
    }
  };

  useEffect(() => {
    const nodo = sentinelRef.current;
    if (!nodo) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) cargarMasRef.current();
      },
      { rootMargin: '400px' } // dispara un poco antes de que se vea, para que no espere al usuario
    );

    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  const compartir = async (id: string) => {
    const link = `${window.location.origin}/feed/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      showToast('✓ Link copiado — funcionará una vez que Life\'s esté en un dominio real');
    } catch {
      showToast('⚠️ No se pudo copiar el link');
    }
  };

  const reaccionar = async (id: string, type: string) => {
    try {
      const res: any = await memoryService.setReaction(id, type);
      setItems(items.map(i => i.id === id ? { ...i, miReaccion: res.data.miReaccion, reactionCounts: res.data.reactionCounts } : i));
    } catch {
      // si falla la reacción, no rompemos la pantalla
    }
  };

  const irAPerfil = (userId: string) => {
    if (user && userId === user.id) navigate('/perfil');
    else navigate(`/perfil/${userId}`);
  };

  const iniciarEdicion = (post: FeedItem) => {
    setEditandoId(post.id);
    setEditCaption(post.caption || '');
    setMenuAbiertoId(null);
  };

  const guardarEdicion = async () => {
    if (!editandoId) return;
    try {
      await memoryService.update(editandoId, editCaption.trim());
      setItems(items.map(i => i.id === editandoId ? { ...i, caption: editCaption.trim() } : i));
      setEditandoId(null);
    } catch (err: any) {
      alert(err.message || 'Error al guardar los cambios');
    }
  };

  const confirmarEliminar = async () => {
    if (!eliminandoId) return;
    try {
      await memoryService.delete(eliminandoId);
      setItems(items.filter(i => i.id !== eliminandoId));
      setEliminandoId(null);
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="feed-root with-navbar">

      <main className="feed-main">

        {/* Filtros por capítulo (reemplaza las "épocas" fijas de antes) */}
        {misCapitulos.length > 0 && (
          <div className="feed-epocas">
            <button
              className={`feed-epoca-btn ${capituloFiltro === '' ? 'active' : ''}`}
              onClick={() => setCapituloFiltro('')}
            >
              Todas
            </button>
            {misCapitulos.map(c => (
              <button
                key={c.id}
                className={`feed-epoca-btn ${capituloFiltro === c.id ? 'active' : ''}`}
                onClick={() => setCapituloFiltro(capituloFiltro === c.id ? '' : c.id)}
              >
                {c.emoji} {c.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Selector vista */}
        <div className="feed-vista-selector">
          {([
            { id: 'feed',       icono: <LayoutList size={18} strokeWidth={1.8}/> },
            { id: 'galeria',    icono: <Grid       size={18} strokeWidth={1.8}/> },
            { id: 'cronologia', icono: <Activity   size={18} strokeWidth={1.8}/> },
          ] as { id: Vista; icono: React.ReactNode }[]).map(v => (
            <button key={v.id}
              className={`feed-vista-btn ${vista === v.id ? 'active' : ''}`}
              onClick={() => setVista(v.id)}
            >{v.icono}</button>
          ))}
          <span className="feed-vista-label">
            {vista === 'feed' ? 'Lista' : vista === 'galeria' ? 'Galería' : 'Cronología'}
          </span>
        </div>

        {/* Quick create */}
        <div className="feed-create">
          <button onClick={() => navigate('/perfil')}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="Yo" className="feed-create__avatar"/>
              : <div className="feed-create__avatar feed-create__avatar--vacio">{user?.firstName?.[0]}</div>
            }
          </button>
          <button className="feed-create__input" onClick={() => setCrearAbierto(true)}>
            ¿Qué momento deseas preservar hoy?
          </button>
          <button className="feed-create__action" onClick={() => setCrearAbierto(true)}>
            <Camera size={18} strokeWidth={1.8}/>
          </button>
        </div>

        {cargando && <p className="feed-vacio">Cargando tu feed...</p>}

        {!cargando && itemsFiltrados.length === 0 && (
          <div className="feed-vacio-wrap">
            <p className="feed-vacio">Todavía no hay recuerdos acá. ¡Publicá el primero!</p>
          </div>
        )}

        {/* ══ VISTA FEED ══ */}
        {!cargando && vista === 'feed' && (
          <div className="feed-posts">
            {itemsFiltrados.map(post => (
              <article key={post.id} className="feed-post">
                <div className="feed-post__header">
                  <button className="feed-post__avatar-btn" onClick={() => irAPerfil(post.userId)}>
                    {post.user.avatarUrl
                      ? <img src={post.user.avatarUrl} alt={post.user.firstName} className="feed-post__avatar"/>
                      : <div className="feed-post__avatar feed-post__avatar--vacio">{post.user.firstName[0]}</div>
                    }
                  </button>
                  <div className="feed-post__meta">
                    <button className="feed-post__autor-btn" onClick={() => irAPerfil(post.userId)}>
                      {post.user.firstName} {post.user.lastName}
                    </button>
                    <span className="feed-post__tiempo">{tiempoRelativo(post.createdAt)}</span>
                  </div>
                  {user && post.userId === user.id && (
                    <div className="feed-post__menu-wrap">
                      <button className="feed-post__more" onClick={() => setMenuAbiertoId(menuAbiertoId === post.id ? null : post.id)}>
                        <MoreHorizontal size={18} strokeWidth={1.8}/>
                      </button>
                      {menuAbiertoId === post.id && (
                        <>
                          <div className="feed-post__menu-backdrop" onClick={() => setMenuAbiertoId(null)} />
                          <div className="feed-post__menu">
                            <button onClick={() => iniciarEdicion(post)}><Edit2 size={14} strokeWidth={1.8}/> Editar</button>
                            <button className="feed-post__menu-eliminar" onClick={() => { setEliminandoId(post.id); setMenuAbiertoId(null); }}>
                              <Trash2 size={14} strokeWidth={1.8}/> Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <div className="feed-post__body">
                  {editandoId === post.id ? (
                    <div className="feed-post__edit">
                      <textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} rows={3} autoFocus/>
                      <div className="feed-post__edit-btns">
                        <button onClick={() => setEditandoId(null)}>Cancelar</button>
                        <button className="feed-post__edit-guardar" onClick={guardarEdicion}>Guardar</button>
                      </div>
                    </div>
                  ) : (
                    post.caption && <p className="feed-post__texto">{post.caption}</p>
                  )}
                </div>
                {post.mediaUrl && (
                  <div className="feed-post__img-wrap" onClick={() => setViendoPost(post)} style={{cursor:'pointer'}}>
                    {post.mediaType === 'video'
                      ? <video src={post.mediaUrl} controls />
                      : <img src={post.mediaUrl} alt={post.caption || 'Recuerdo'}/>
                    }
                  </div>
                )}
                <div className="feed-post__footer">
                  <ReactionButton
                    reactionCounts={post.reactionCounts}
                    miReaccion={post.miReaccion}
                    onReact={(type) => reaccionar(post.id, type)}
                  />
                  <button className="feed-post__accion" onClick={() => setViendoPost(post)}>
                    <MessageCircle size={16} strokeWidth={1.8}/> {post.commentsCount}
                  </button>
                  <button className="feed-post__accion" onClick={() => compartir(post.id)}>
                    <Share2 size={16} strokeWidth={1.8}/>
                  </button>
                  <ReactionResumen memoryId={post.id} reactionCounts={post.reactionCounts} />
                </div>
              </article>
            ))}

            {page < totalPages && (
              <div ref={sentinelRef} className="feed-scroll-sentinel">
                {cargandoMas && <span className="feed-cargar-mas-texto">Cargando más recuerdos...</span>}
              </div>
            )}
          </div>
        )}

        {/* ══ VISTA GALERÍA ══ */}
        {!cargando && vista === 'galeria' && (
          <div className="feed-galeria">
            {itemsFiltrados.filter(p => p.mediaUrl).map(post => (
              <div key={post.id} className="feed-galeria__item" onClick={() => setViendoPost(post)}>
                {post.mediaType === 'video'
                  ? <video src={post.mediaUrl!} muted />
                  : <img src={post.mediaUrl!} alt={post.caption || 'Recuerdo'}/>
                }
                <div className="feed-galeria__overlay">
                  <span className="feed-galeria__autor">
                    {post.user.avatarUrl
                      ? <img src={post.user.avatarUrl} alt={post.user.firstName}/>
                      : <div className="feed-galeria__avatar-vacio">{post.user.firstName[0]}</div>
                    }
                    {post.user.firstName}
                  </span>
                  {post.caption && <p className="feed-galeria__titulo">{post.caption.slice(0, 40)}{post.caption.length > 40 ? '...' : ''}</p>}
                  <div className="feed-galeria__stats">
                    <span><Heart size={12} strokeWidth={1.8}/>{Object.values(post.reactionCounts || {}).reduce((a, b) => a + b, 0)}</span>
                    <span><MessageCircle size={12} strokeWidth={1.8}/>{post.commentsCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ VISTA CRONOLOGÍA ══ */}
        {!cargando && vista === 'cronologia' && (
          <div className="feed-cronologia">
            {itemsFiltrados.map((post, i) => (
              <div key={post.id} className="feed-crono-item">
                <div className="feed-crono-item__dot" onClick={() => irAPerfil(post.userId)}>
                  {post.mediaUrl ? <Camera size={16} strokeWidth={1.8}/> : <Edit2 size={16} strokeWidth={1.8}/>}
                </div>
                {i < itemsFiltrados.length - 1 && <div className="feed-crono-item__line"/>}
                <div className="feed-crono-item__content">
                  <div className="feed-crono-item__header">
                    <button className="feed-crono-item__autor" onClick={() => irAPerfil(post.userId)}>
                      {post.user.avatarUrl
                        ? <img src={post.user.avatarUrl} alt={post.user.firstName}/>
                        : <div className="feed-galeria__avatar-vacio">{post.user.firstName[0]}</div>
                      }
                      {post.user.firstName}
                    </button>
                    <span className="feed-crono-item__tiempo">{tiempoRelativo(post.createdAt)}</span>
                  </div>
                  <h4 className="feed-crono-item__titulo" onClick={() => setViendoPost(post)} style={{cursor:'pointer'}}>
                    {post.caption ? (post.caption.slice(0, 60) + (post.caption.length > 60 ? '...' : '')) : 'Recuerdo'}
                  </h4>
                  {post.mediaUrl && post.mediaType !== 'video' && (
                    <img src={post.mediaUrl} alt="" className="feed-crono-item__img" onClick={() => setViendoPost(post)} style={{cursor:'pointer'}}/>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ── FAB ── */}
      <button className="feed-fab" onClick={() => setCrearAbierto(true)} title="Nuevo recuerdo">
        <Plus size={24} strokeWidth={2}/>
      </button>

      {crearAbierto && (
        <CrearRecuerdoModal
          onClose={() => setCrearAbierto(false)}
          onCreado={() => cargarFeed(1)}
        />
      )}

      {viendoPost && (
        <FotoViewerModal
          memoryId={viendoPost.id}
          imageUrl={viendoPost.mediaUrl || ''}
          titulo={viendoPost.caption || `Recuerdo de ${viendoPost.user.firstName}`}
          onClose={(actualizado) => {
            if (actualizado) {
              setItems(items.map(i => i.id === viendoPost.id ? { ...i, ...actualizado } : i));
            }
            setViendoPost(null);
            if (memoryIdDeLink) navigate('/feed', { replace: true });
          }}
        />
      )}

      {eliminandoId && (
        <ConfirmModal
          titulo="Eliminar publicación"
          mensaje="¿Eliminar esta publicación? Esta acción no se puede deshacer."
          textoConfirmar="Sí, eliminar"
          peligroso
          onConfirm={confirmarEliminar}
          onCancel={() => setEliminandoId(null)}
        />
      )}

      {toast && <div className="feed-toast">{toast}</div>}

    </div>
  );
}