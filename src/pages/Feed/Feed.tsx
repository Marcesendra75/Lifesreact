// ============================================
// LIFE'S — Feed Principal
// Sin sidebar — columna única centrada
// ============================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, History, ArrowRight,
  LayoutList, Grid, GitBranch, Camera, Video, Mic,
  Heart, Leaf, BookOpen, Frown, MoreHorizontal,
  MessageCircle, Share2, Bookmark,
  Activity, Shield, Clock, Zap, ChevronRight, Edit2,
} from 'lucide-react';
import './Feed.scss';

type Vista = 'feed' | 'galeria' | 'cronologia';
type Epoca = 'todas' | 'infancia' | 'juventud' | 'familia' | 'logros' | 'hoy';

const REACCIONES = [
  { icon: <Heart    size={18} strokeWidth={1.8} />, label: 'Emocionante',  color: '#e74c3c', key: 'favorite'      },
  { icon: <Leaf     size={18} strokeWidth={1.8} />, label: 'Inspirador',   color: '#27ae60', key: 'eco'           },
  { icon: <BookOpen size={18} strokeWidth={1.8} />, label: 'Lo recordaré', color: '#855324', key: 'menu_book'     },
  { icon: <Frown    size={18} strokeWidth={1.8} />, label: 'Me conmueve',  color: '#735c00', key: 'sentiment_sad' },
];

const EPOCAS = [
  { id: 'todas',    label: 'Todas'       },
  { id: 'infancia', label: '👶 Infancia' },
  { id: 'juventud', label: '🎓 Juventud' },
  { id: 'familia',  label: '❤️ Familia'  },
  { id: 'logros',   label: '🏆 Logros'   },
  { id: 'hoy',      label: '🌿 Hoy'      },
];

const MOCK_POSTS = [
  {
    id: 1, autor: 'Julian Valenzuela', userId: '1',
    avatar: 'https://i.pravatar.cc/40?img=11', tiempo: 'hace 4 horas',
    tipo: 'Recuerdo Destacado', epoca: 'familia',
    titulo: 'La vieja casa de campo en Segovia',
    texto: 'Recuerdo perfectamente el olor a pino y tierra mojada. Fue el último verano que pasamos todos juntos antes de que la ciudad nos absorbiera.',
    imagen: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    reacciones: { favorite: 12, eco: 5, menu_book: 8, sentiment_sad: 3 },
    comentarios: 4, pesoEmocional: 85,
  },
  {
    id: 2, autor: 'Julian Valenzuela', userId: '1',
    avatar: 'https://i.pravatar.cc/40?img=11', tiempo: 'ayer a las 18:30',
    tipo: 'Reflexión', epoca: 'logros', titulo: null,
    texto: '"La sabiduría no es un destino, es el hilo con el que tejemos el manto de nuestra familia."',
    imagen: null,
    reacciones: { favorite: 24, eco: 18, menu_book: 31, sentiment_sad: 7 },
    comentarios: 9, pesoEmocional: 95, esCita: true,
  },
  {
    id: 3, autor: 'María Valenzuela', userId: '2',
    avatar: 'https://i.pravatar.cc/40?img=5', tiempo: 'hace 2 días',
    tipo: 'Recuerdo Familiar', epoca: 'infancia',
    titulo: 'El primer día de escuela',
    texto: 'Nunca olvidaré cuando papá me llevó de la mano hasta el aula. Tenía tanto miedo y él me dijo: "El conocimiento es el único legado que nadie te puede quitar."',
    imagen: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    reacciones: { favorite: 45, eco: 12, menu_book: 19, sentiment_sad: 28 },
    comentarios: 15, pesoEmocional: 92,
  },
  {
    id: 4, autor: 'Julian Valenzuela', userId: '1',
    avatar: 'https://i.pravatar.cc/40?img=11', tiempo: 'hace 5 días',
    tipo: 'Hito de Vida', epoca: 'juventud',
    titulo: 'Graduación — Universidad de Salamanca, 1987',
    texto: 'Treinta y siete años después, aún puedo sentir el peso de ese diploma en mis manos.',
    imagen: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    reacciones: { favorite: 67, eco: 34, menu_book: 52, sentiment_sad: 11 },
    comentarios: 22, pesoEmocional: 78,
  },
  {
    id: 5, autor: 'Marcelo García', userId: '3',
    avatar: 'https://i.pravatar.cc/40?img=68', tiempo: 'hace 1 semana',
    tipo: 'Recuerdo Familiar', epoca: 'familia',
    titulo: 'El día que nació Sofía',
    texto: 'No hay palabras para describir lo que sentí al sostenerla por primera vez. Ese instante cambió para siempre la forma en la que entiendo el amor.',
    imagen: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',
    reacciones: { favorite: 89, eco: 22, menu_book: 15, sentiment_sad: 4 },
    comentarios: 31, pesoEmocional: 97,
  },
];

const HOY_HACE = {
  años: 15,
  titulo: 'Primer viaje a Patagonia',
  imagen: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
};

export default function Feed() {
  const navigate = useNavigate();
  const [vista,  setVista]  = useState<Vista>('feed');
  const [epoca,  setEpoca]  = useState<Epoca>('todas');
  const [reaccionesAbiertas, setReaccionesAbiertas] = useState<number | null>(null);

  const postsFiltrados = epoca === 'todas'
    ? MOCK_POSTS
    : MOCK_POSTS.filter(p => p.epoca === epoca);

  const irAPerfil = (userId: string) => navigate(`/perfil/${userId}`);
  const irALinea  = (userId: string) => navigate(`/linea-de-vida/${userId}`);
  const irAArbol  = (userId: string) => navigate(`/arbol-genealogico/${userId}`);

  return (
    <div className="feed-root with-navbar">

      <main className="feed-main">

        {/* Hoy hace X años */}
        <div className="feed-hoy-hace" onClick={() => navigate('/linea-de-vida')}>
          <div className="feed-hoy-hace__img">
            <img src={HOY_HACE.imagen} alt="Hoy hace años"/>
            <div className="feed-hoy-hace__overlay"/>
          </div>
          <div className="feed-hoy-hace__text">
            <div className="feed-hoy-hace__badge">
              <History size={14} strokeWidth={1.8}/> Hoy hace {HOY_HACE.años} años
            </div>
            <p className="feed-hoy-hace__titulo">{HOY_HACE.titulo}</p>
          </div>
          <ArrowRight size={18} strokeWidth={1.8} className="feed-hoy-hace__arrow"/>
        </div>

        {/* Filtros época */}
        <div className="feed-epocas">
          {EPOCAS.map(e => (
            <button key={e.id}
              className={`feed-epoca-btn ${epoca === e.id ? 'active' : ''}`}
              onClick={() => setEpoca(e.id as Epoca)}
            >{e.label}</button>
          ))}
        </div>

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
          <button onClick={() => irAPerfil('1')}>
            <img src="https://i.pravatar.cc/48?img=11" alt="Yo" className="feed-create__avatar"/>
          </button>
          <button className="feed-create__input" onClick={() => navigate('/linea-de-vida')}>
            ¿Qué momento deseas preservar hoy?
          </button>
          <div className="feed-create__actions">
            <button className="feed-create__action" onClick={() => navigate('/linea-de-vida')}><Camera size={18} strokeWidth={1.8}/></button>
            <button className="feed-create__action" onClick={() => navigate('/linea-de-vida')}><Video  size={18} strokeWidth={1.8}/></button>
            <button className="feed-create__action" onClick={() => navigate('/linea-de-vida')}><Mic    size={18} strokeWidth={1.8}/></button>
          </div>
        </div>

        {/* ══ VISTA FEED ══ */}
        {vista === 'feed' && (
          <div className="feed-posts">
            {postsFiltrados.map(post => (
              <article key={post.id} className="feed-post"
                style={{ '--peso': `${post.pesoEmocional}%` } as React.CSSProperties}>
                <div className="feed-post__peso" style={{ width: `${post.pesoEmocional}%` }}/>
                <div className="feed-post__header">
                  <button className="feed-post__avatar-btn" onClick={() => irAPerfil(post.userId)}>
                    <img src={post.avatar} alt={post.autor} className="feed-post__avatar"/>
                  </button>
                  <div className="feed-post__meta">
                    <button className="feed-post__autor-btn" onClick={() => irAPerfil(post.userId)}>
                      {post.autor}
                    </button>
                    <span className="feed-post__tiempo">{post.tiempo} · {post.tipo}</span>
                  </div>
                  <div className="feed-post__nav-perfil">
                    <button className="feed-post__nav-btn" onClick={() => irALinea(post.userId)} title="Línea de vida"><Activity  size={14} strokeWidth={1.8}/></button>
                    <button className="feed-post__nav-btn" onClick={() => irAArbol(post.userId)}  title="Árbol"><GitBranch size={14} strokeWidth={1.8}/></button>
                    <button className="feed-post__more"><MoreHorizontal size={18} strokeWidth={1.8}/></button>
                  </div>
                </div>
                <div className="feed-post__body">
                  {post.titulo && <h4 className="feed-post__titulo">{post.titulo}</h4>}
                  {(post as any).esCita
                    ? <blockquote className="feed-post__cita">{post.texto}</blockquote>
                    : <p className="feed-post__texto">{post.texto}</p>
                  }
                </div>
                {post.imagen && (
                  <div className="feed-post__img-wrap" onClick={() => irALinea(post.userId)} style={{cursor:'pointer'}}>
                    <img src={post.imagen} alt={post.titulo || 'Recuerdo'}/>
                    <div className="feed-post__img-overlay">
                      <span className="feed-post__epoca-badge">
                        {EPOCAS.find(e => e.id === post.epoca)?.label}
                      </span>
                    </div>
                  </div>
                )}
                <div className="feed-post__footer">
                  <div className="feed-post__reacciones">
                    <div className="feed-post__reacciones-wrap">
                      <button className="feed-post__react-btn"
                        onClick={() => setReaccionesAbiertas(reaccionesAbiertas === post.id ? null : post.id)}>
                        <Heart size={16} strokeWidth={1.8}/> <span>Reaccionar</span>
                      </button>
                      {reaccionesAbiertas === post.id && (
                        <div className="feed-reacciones-panel">
                          {REACCIONES.map(r => (
                            <button key={r.key} className="feed-reacciones-panel__item"
                              onClick={() => setReaccionesAbiertas(null)} style={{color: r.color}}>
                              {r.icon}<span>{r.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="feed-post__react-counts">
                      {REACCIONES.map(r => (
                        <span key={r.key} className="feed-post__react-count" style={{color: r.color}}>
                          {r.icon}{(post.reacciones as any)[r.key]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="feed-post__acciones">
                    <button className="feed-post__accion"><MessageCircle size={16} strokeWidth={1.8}/>{post.comentarios}</button>
                    <button className="feed-post__accion"><Share2   size={16} strokeWidth={1.8}/></button>
                    <button className="feed-post__accion" onClick={() => navigate('/postal')}><Bookmark size={16} strokeWidth={1.8}/></button>
                  </div>
                </div>
                <button className="feed-post__ver-perfil" onClick={() => irAPerfil(post.userId)}>
                  Ver perfil completo de {post.autor.split(' ')[0]} <ChevronRight size={13} strokeWidth={1.8}/>
                </button>
              </article>
            ))}
          </div>
        )}

        {/* ══ VISTA GALERÍA ══ */}
        {vista === 'galeria' && (
          <div className="feed-galeria">
            {postsFiltrados.filter(p => p.imagen).map(post => (
              <div key={post.id} className="feed-galeria__item" onClick={() => irALinea(post.userId)}>
                <img src={post.imagen!} alt={post.titulo || 'Recuerdo'}/>
                <div className="feed-galeria__overlay">
                  <button className="feed-galeria__autor"
                    onClick={e => { e.stopPropagation(); irAPerfil(post.userId); }}>
                    <img src={post.avatar} alt={post.autor}/>{post.autor.split(' ')[0]}
                  </button>
                  <p className="feed-galeria__titulo">{post.titulo || post.texto.slice(0,40)+'...'}</p>
                  <div className="feed-galeria__stats">
                    <span><Heart size={12} strokeWidth={1.8}/>{post.reacciones.favorite}</span>
                    <span><MessageCircle size={12} strokeWidth={1.8}/>{post.comentarios}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ VISTA CRONOLOGÍA ══ */}
        {vista === 'cronologia' && (
          <div className="feed-cronologia">
            {postsFiltrados.map((post, i) => (
              <div key={post.id} className="feed-crono-item">
                <div className="feed-crono-item__dot" onClick={() => irAPerfil(post.userId)}>
                  {(post as any).esCita ? <BookOpen size={16} strokeWidth={1.8}/> : post.imagen ? <Camera size={16} strokeWidth={1.8}/> : <Edit2 size={16} strokeWidth={1.8}/>}
                </div>
                {i < postsFiltrados.length - 1 && <div className="feed-crono-item__line"/>}
                <div className="feed-crono-item__content">
                  <div className="feed-crono-item__header">
                    <button className="feed-crono-item__autor" onClick={() => irAPerfil(post.userId)}>
                      <img src={post.avatar} alt={post.autor}/>{post.autor.split(' ')[0]}
                    </button>
                    <span className="feed-crono-item__tiempo">{post.tiempo}</span>
                  </div>
                  <h4 className="feed-crono-item__titulo" onClick={() => irALinea(post.userId)} style={{cursor:'pointer'}}>
                    {post.titulo || post.texto.slice(0,60)+'...'}
                  </h4>
                  {post.imagen && <img src={post.imagen} alt="" className="feed-crono-item__img" onClick={() => irALinea(post.userId)} style={{cursor:'pointer'}}/>}
                </div>
              </div>
            ))}
            <button className="feed-crono-more" onClick={() => navigate('/linea-de-vida')}>
              <Activity size={16} strokeWidth={1.8}/> Ver línea de vida completa
            </button>
          </div>
        )}

      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="feed-bottom-nav">
        {[
          { icono: <Activity  size={22} strokeWidth={1.6}/>, label: 'Línea',  path: '/linea-de-vida',     active: false },
          { icono: <GitBranch size={22} strokeWidth={1.6}/>, label: 'Árbol',  path: '/arbol-genealogico', active: false },
          { icono: <Clock     size={22} strokeWidth={1.6}/>, label: 'Feed',   path: '/feed',              active: true  },
          { icono: <Shield    size={22} strokeWidth={1.6}/>, label: 'Bóveda', path: '/caja-fuerte',       active: false },
          { icono: <Zap       size={22} strokeWidth={1.6}/>, label: 'Ecos',   path: '/ecos/1',            active: false },
        ].map(n => (
          <button key={n.path}
            className={`feed-bottom-nav__item ${n.active ? 'active' : ''}`}
            onClick={() => navigate(n.path)}
          >{n.icono}{n.label}</button>
        ))}
      </nav>

      {/* ── FAB ── */}
      <button className="feed-fab" onClick={() => navigate('/linea-de-vida')} title="Nuevo recuerdo">
        <Plus size={24} strokeWidth={2}/>
      </button>

    </div>
  );
}
