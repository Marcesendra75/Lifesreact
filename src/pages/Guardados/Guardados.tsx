// ============================================
// LIFE'S — Guardados
// Lista de recuerdos que el usuario guardó desde el Feed.
// Reusa la grilla visual de la vista "Galería" del Feed.
// ============================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark, BookmarkX } from 'lucide-react';
import { memoryService, interactionService } from '../../services/api';
import { formatConteo } from '../../utils/format';
import '../Feed/Feed.scss';
import './Guardados.scss';

interface GuardadoItem {
  id: string;
  caption?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  reactionCounts: Record<string, number>;
  commentsCount: number;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

export default function Guardados() {
  const navigate = useNavigate();

  const [items, setItems] = useState<GuardadoItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [toast, setToast] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const cargarGuardados = async (pagina: number) => {
    pagina === 1 ? setCargando(true) : setCargandoMas(true);
    try {
      const res: any = await memoryService.getSaved(pagina, 15);
      setItems(prev => pagina === 1 ? res.data.items : [...prev, ...res.data.items]);
      setTotalPages(res.data.totalPages);
      setPage(pagina);
    } catch {
      showToast('⚠️ No se pudieron cargar tus guardados');
    } finally {
      setCargando(false);
      setCargandoMas(false);
    }
  };

  useEffect(() => { cargarGuardados(1); }, []);

  // scroll infinito, igual que en el Feed
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !cargandoMas && page < totalPages) {
        cargarGuardados(page + 1);
      }
    }, { threshold: 0.5 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [page, totalPages, cargandoMas]);

  const quitarGuardado = async (memoryId: string) => {
    setItems(prev => prev.filter(i => i.id !== memoryId));
    try {
      await interactionService.unsave(memoryId);
    } catch {
      showToast('⚠️ No se pudo quitar de guardados');
      cargarGuardados(1);
    }
  };

  return (
    <div className="feed-root guardados-root with-navbar">
      <main className="feed-main">
        <h1 className="guardados-titulo"><Bookmark size={20} strokeWidth={1.8} /> Publicaciones guardadas</h1>

        {cargando && <p className="feed-vacio">Cargando tus guardados...</p>}

        {!cargando && items.length === 0 && (
          <div className="feed-vacio-wrap">
            <p className="feed-vacio">Todavía no guardaste ninguna publicación. Tocá el "..." de un recuerdo en el Feed y elegí "Guardar publicación".</p>
          </div>
        )}

        {!cargando && items.length > 0 && (
          <div className="feed-galeria">
            {items.map(post => (
              <div key={post.id} className="feed-galeria__item guardados-item">
                <img
                  src={post.mediaUrl || undefined}
                  alt={post.caption || 'Recuerdo guardado'}
                  onClick={() => navigate(`/feed/${post.id}`)}
                  style={!post.mediaUrl ? { background: '#e8e2d5' } : undefined}
                />
                <div className="feed-galeria__overlay" onClick={() => navigate(`/feed/${post.id}`)}>
                  <Link to={`/perfil/${post.user.id}`} className="feed-galeria__autor" onClick={(e) => e.stopPropagation()}>
                    {post.user.avatarUrl
                      ? <img src={post.user.avatarUrl} alt={post.user.firstName} />
                      : <div className="feed-galeria__avatar-vacio">{post.user.firstName?.[0]}</div>
                    }
                    {post.user.firstName} {post.user.lastName}
                  </Link>
                  {post.caption && <p className="feed-galeria__titulo">{post.caption.slice(0, 40)}{post.caption.length > 40 ? '...' : ''}</p>}
                  <div className="feed-galeria__stats">
                    <span><Heart size={12} strokeWidth={1.8} />{formatConteo(Object.values(post.reactionCounts || {}).reduce((a, b) => a + b, 0))}</span>
                    <span><MessageCircle size={12} strokeWidth={1.8} />{formatConteo(post.commentsCount)}</span>
                  </div>
                </div>
                <button
                  className="guardados-item__quitar"
                  title="Quitar de guardados"
                  onClick={(e) => { e.stopPropagation(); quitarGuardado(post.id); }}
                >
                  <BookmarkX size={16} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}

        {page < totalPages && <div ref={sentinelRef} className="feed-scroll-sentinel" />}
        {cargandoMas && <p className="feed-cargar-mas-texto">Cargando más...</p>}
      </main>

      {toast && <div className="feed-toast">{toast}</div>}
    </div>
  );
}