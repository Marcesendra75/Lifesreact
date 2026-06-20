// ============================================
// LIFE'S — Feed Principal
// ============================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feed.scss';


// ── Tipos ──
type Vista = 'feed' | 'galeria' | 'cronologia';
type Epoca = 'todas' | 'infancia' | 'juventud' | 'familia' | 'logros' | 'hoy';

// ── Reacciones de legado ──
const REACCIONES = [
  { icon: 'favorite',       label: 'Emocionante',  color: '#e74c3c' },
  { icon: 'eco',            label: 'Inspirador',   color: '#27ae60' },
  { icon: 'menu_book',      label: 'Lo recordaré', color: '#855324' },
  { icon: 'sentiment_sad',  label: 'Me conmueve',  color: '#735c00' },
];

// ── Épocas ──
const EPOCAS = [
  { id: 'todas',    icon: 'all_inclusive', label: 'Todas' },
  { id: 'infancia', icon: 'child_care',    label: '👶 Infancia' },
  { id: 'juventud', icon: 'school',        label: '🎓 Juventud' },
  { id: 'familia',  icon: 'family_restroom',label: '❤️ Familia' },
  { id: 'logros',   icon: 'emoji_events',  label: '🏆 Logros' },
  { id: 'hoy',      icon: 'today',         label: '🌿 Hoy' },
];

// ── Navegación sidebar ──
const NAV_ITEMS = [
  { icon: 'timeline',       label: 'Línea de Vida',    path: '/linea-de-vida',    vault: false },
  { icon: 'account_tree',   label: 'Árbol Genealógico',path: '/arbol-genealogico',vault: false },
  { icon: 'inventory_2',    label: 'Caja Fuerte',      path: '/caja-fuerte',      vault: true  },
  { icon: 'savings',        label: 'Caja de Valores',  path: '/caja-de-valores',  vault: true  },
  { icon: 'movie',          label: 'Último Tributo',   path: '/ultimo-tributo',   vault: true  },
  { icon: 'psychology',     label: 'Ecos IA',          path: '/ecos/1',           vault: false },
  { icon: 'credit_card',    label: 'Mi Tarjeta',       path: '/tarjeta-legado',   vault: false },
  { icon: 'hourglass_top',  label: 'Cápsula del Tiempo',path:'/capsula-del-tiempo',vault: false },
  { icon: 'local_post_office',label:'Postal Digital',  path: '/postal',           vault: false },
];

// ── Mock Posts ──
const MOCK_POSTS = [
  {
    id: 1,
    autor: 'Julian Valenzuela',
    avatar: 'https://i.pravatar.cc/40?img=11',
    tiempo: 'hace 4 horas',
    tipo: 'Recuerdo Destacado',
    epoca: 'familia',
    titulo: 'La vieja casa de campo en Segovia',
    texto: 'Recuerdo perfectamente el olor a pino y tierra mojada. Fue el último verano que pasamos todos juntos antes de que la ciudad nos absorbiera. Estas paredes guardan risas que aún puedo escuchar si cierro los ojos con suficiente fuerza.',
    imagen: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
    reacciones: { favorite: 12, eco: 5, menu_book: 8, sentiment_sad: 3 },
    comentarios: 4,
    pesoEmocional: 85,
  },
  {
    id: 2,
    autor: 'Julian Valenzuela',
    avatar: 'https://i.pravatar.cc/40?img=11',
    tiempo: 'ayer a las 18:30',
    tipo: 'Reflexión',
    epoca: 'logros',
    titulo: null,
    texto: '"La sabiduría no es un destino, es el hilo con el que tejemos el manto de nuestra familia."',
    imagen: null,
    reacciones: { favorite: 24, eco: 18, menu_book: 31, sentiment_sad: 7 },
    comentarios: 9,
    pesoEmocional: 95,
    esCita: true,
  },
  {
    id: 3,
    autor: 'María Valenzuela',
    avatar: 'https://i.pravatar.cc/40?img=5',
    tiempo: 'hace 2 días',
    tipo: 'Recuerdo Familiar',
    epoca: 'infancia',
    titulo: 'El primer día de escuela',
    texto: 'Nunca olvidaré cuando papá me llevó de la mano hasta el aula. Tenía tanto miedo y él me dijo: "El conocimiento es el único legado que nadie te puede quitar."',
    imagen: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
    reacciones: { favorite: 45, eco: 12, menu_book: 19, sentiment_sad: 28 },
    comentarios: 15,
    pesoEmocional: 92,
  },
  {
    id: 4,
    autor: 'Julian Valenzuela',
    avatar: 'https://i.pravatar.cc/40?img=11',
    tiempo: 'hace 5 días',
    tipo: 'Hito de Vida',
    epoca: 'juventud',
    titulo: 'Graduación — Universidad de Salamanca, 1987',
    texto: 'Treinta y siete años después, aún puedo sentir el peso de ese diploma en mis manos. Lo que más recuerdo no fue el acto, sino la mirada de mi madre desde la tercera fila.',
    imagen: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    reacciones: { favorite: 67, eco: 34, menu_book: 52, sentiment_sad: 11 },
    comentarios: 22,
    pesoEmocional: 78,
  },
];

// ── Hoy hace X años (mock) ──
const HOY_HACE = {
  años: 15,
  titulo: 'Primer viaje a Patagonia',
  imagen: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
};

export default function Feed() {
  const navigate  = useNavigate();
  const [vista, setVista]         = useState<Vista>('feed');
  const [epoca, setEpoca]         = useState<Epoca>('todas');
  const [reaccionesAbiertas, setReaccionesAbiertas] = useState<number | null>(null);

  const postsFiltrados = epoca === 'todas'
    ? MOCK_POSTS
    : MOCK_POSTS.filter(p => p.epoca === epoca);

  const handleNavVault = (path: string, vault: boolean) => {
    if (vault) {
      navigate(`/acceso-seguro?acceso=${encodeURIComponent(path)}&redirect=${encodeURIComponent(path)}`);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="feed-root">

      {/* ── HEADER ── */}
      <header className="feed-header">
        <div className="feed-header__inner">
          <div className="feed-header__left">
            <div className="feed-header__avatar">
              <img src="https://i.pravatar.cc/40?img=11" alt="Mi perfil" />
            </div>
            <h1 className="feed-header__title">El Legado</h1>
          </div>
          <div className="feed-header__actions">
            <button className="feed-header__btn" onClick={() => navigate('/configuracion')}>
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button className="feed-header__btn" onClick={() => navigate('/perfil')}>
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </div>
      </header>

      <main className="feed-main">

        {/* ── COVER + PERFIL ── */}
        <section className="feed-profile">
          <div className="feed-profile__cover">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
              alt="Portada"
            />
            <div className="feed-profile__cover-overlay" />
          </div>
          <div className="feed-profile__info">
            <div className="feed-profile__avatar-wrap">
              <img src="https://i.pravatar.cc/160?img=11" alt="Perfil" />
              <div className="feed-profile__nivel-badge">
                <span className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24", color: '#C9A84C' }}>
                  workspace_premium
                </span>
              </div>
            </div>
            <div className="feed-profile__text">
              <h2 className="feed-profile__name">Julian Valenzuela</h2>
              <p className="feed-profile__rol">Archivista de Recuerdos Familiares</p>
            </div>
            <button className="feed-profile__btn" onClick={() => navigate('/linea-de-vida')}>
              <span className="material-symbols-outlined">add</span>
              Añadir Recuerdo
            </button>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="feed-stats">
          {[
            { valor: '124',  label: 'Seguidores',    path: '/perfil' },
            { valor: '482',  label: 'Recuerdos',     path: '/muro-biografico' },
            { valor: '3',    label: 'Generaciones',  path: '/arbol-genealogico' },
          ].map(s => (
            <button key={s.label} className="feed-stats__item" onClick={() => navigate(s.path)}>
              <span className="feed-stats__val">{s.valor}</span>
              <span className="feed-stats__label">{s.label}</span>
            </button>
          ))}
        </div>

        {/* ── GRID PRINCIPAL ── */}
        <div className="feed-grid">

          {/* ── SIDEBAR ── */}
          <aside className="feed-sidebar">

            {/* Navegación */}
            <div className="feed-sidebar__card">
              <h3 className="feed-sidebar__title">Navegación</h3>
              {NAV_ITEMS.map(n => (
                <button
                  key={n.path}
                  className="feed-sidebar__link"
                  onClick={() => handleNavVault(n.path, n.vault)}
                >
                  <span className="material-symbols-outlined feed-sidebar__link-icon">{n.icon}</span>
                  <span className="feed-sidebar__link-label">{n.label}</span>
                  {n.vault && (
                    <span className="feed-sidebar__vault-badge">
                      <span className="material-symbols-outlined">lock</span>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bio */}
            <div className="feed-sidebar__card">
              <h3 className="feed-sidebar__title">Sobre mí</h3>
              <p className="feed-sidebar__bio">
                Preservando los momentos que definen nuestra historia. Un legado no es lo que
                dejamos atrás, sino lo que vive en los demás.
              </p>
              <button className="feed-sidebar__edit" onClick={() => navigate('/perfil')}>
                <span className="material-symbols-outlined">edit</span>
                Editar perfil
              </button>
            </div>

            {/* Mini árbol */}
            <div className="feed-sidebar__card feed-sidebar__card--dark">
              <h3 className="feed-sidebar__title feed-sidebar__title--light">
                <span className="material-symbols-outlined">account_tree</span>
                Tu árbol vivo
              </h3>
              <div className="feed-mini-tree">
                {[
                  { nombre: 'Abuelo Pedro',  avatar: 'https://i.pravatar.cc/32?img=70', nivel: 0 },
                  { nombre: 'Papá Carlos',   avatar: 'https://i.pravatar.cc/32?img=60', nivel: 1 },
                  { nombre: 'Tú',            avatar: 'https://i.pravatar.cc/32?img=11', nivel: 2, activo: true },
                  { nombre: 'Hija Sofía',    avatar: 'https://i.pravatar.cc/32?img=20', nivel: 3 },
                ].map((m, i) => (
                  <div key={i} className={`feed-mini-tree__item ${m.activo ? 'activo' : ''}`}
                    style={{ marginLeft: `${m.nivel * 16}px` }}>
                    <img src={m.avatar} alt={m.nombre} />
                    <span>{m.nombre}</span>
                    {m.activo && <span className="feed-mini-tree__you">Tú</span>}
                  </div>
                ))}
              </div>
              <button className="feed-sidebar__link-btn" onClick={() => navigate('/arbol-genealogico')}>
                Ver árbol completo
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

          </aside>

          {/* ── COLUMNA FEED ── */}
          <div className="feed-content">

            {/* ── HOY HACE X AÑOS ── */}
            <div className="feed-hoy-hace" onClick={() => navigate('/linea-de-vida')}>
              <div className="feed-hoy-hace__img">
                <img src={HOY_HACE.imagen} alt="Hoy hace años" />
                <div className="feed-hoy-hace__overlay" />
              </div>
              <div className="feed-hoy-hace__text">
                <div className="feed-hoy-hace__badge">
                  <span className="material-symbols-outlined">history</span>
                  Hoy hace {HOY_HACE.años} años
                </div>
                <p className="feed-hoy-hace__titulo">{HOY_HACE.titulo}</p>
              </div>
              <span className="material-symbols-outlined feed-hoy-hace__arrow">arrow_forward</span>
            </div>

            {/* ── FILTROS ÉPOCA ── */}
            <div className="feed-epocas">
              {EPOCAS.map(e => (
                <button
                  key={e.id}
                  className={`feed-epoca-btn ${epoca === e.id ? 'active' : ''}`}
                  onClick={() => setEpoca(e.id as Epoca)}
                >
                  {e.label}
                </button>
              ))}
            </div>

            {/* ── SELECTOR DE VISTA ── */}
            <div className="feed-vista-selector">
              {([
                { id: 'feed',       icon: 'view_agenda'  },
                { id: 'galeria',    icon: 'grid_view'    },
                { id: 'cronologia', icon: 'timeline'     },
              ] as { id: Vista; icon: string }[]).map(v => (
                <button
                  key={v.id}
                  className={`feed-vista-btn ${vista === v.id ? 'active' : ''}`}
                  onClick={() => setVista(v.id)}
                >
                  <span className="material-symbols-outlined">{v.icon}</span>
                </button>
              ))}
              <span className="feed-vista-label">
                {vista === 'feed' ? 'Lista' : vista === 'galeria' ? 'Galería' : 'Cronología'}
              </span>
            </div>

            {/* ── QUICK CREATE ── */}
            <div className="feed-create">
              <img src="https://i.pravatar.cc/48?img=11" alt="Yo" className="feed-create__avatar" />
              <button
                className="feed-create__input"
                onClick={() => navigate('/linea-de-vida')}
              >
                ¿Qué momento deseas preservar hoy?
              </button>
              <div className="feed-create__actions">
                <button className="feed-create__action" onClick={() => navigate('/linea-de-vida')}>
                  <span className="material-symbols-outlined">photo_camera</span>
                </button>
                <button className="feed-create__action" onClick={() => navigate('/linea-de-vida')}>
                  <span className="material-symbols-outlined">videocam</span>
                </button>
                <button className="feed-create__action" onClick={() => navigate('/linea-de-vida')}>
                  <span className="material-symbols-outlined">mic</span>
                </button>
              </div>
            </div>

            {/* ══ VISTA FEED ══ */}
            {vista === 'feed' && (
              <div className="feed-posts">
                {postsFiltrados.map(post => (
                  <article
                    key={post.id}
                    className="feed-post"
                    style={{ '--peso': `${post.pesoEmocional}%` } as React.CSSProperties}
                  >
                    {/* Barra de peso emocional */}
                    <div className="feed-post__peso" style={{ width: `${post.pesoEmocional}%` }} />

                    {/* Header del post */}
                    <div className="feed-post__header">
                      <img src={post.avatar} alt={post.autor} className="feed-post__avatar" />
                      <div className="feed-post__meta">
                        <span className="feed-post__autor">{post.autor}</span>
                        <span className="feed-post__tiempo">
                          {post.tiempo} · {post.tipo}
                        </span>
                      </div>
                      <button className="feed-post__more">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </div>

                    {/* Contenido */}
                    <div className="feed-post__body">
                      {post.titulo && (
                        <h4 className="feed-post__titulo">{post.titulo}</h4>
                      )}
                      {post.esCita ? (
                        <blockquote className="feed-post__cita">{post.texto}</blockquote>
                      ) : (
                        <p className="feed-post__texto">{post.texto}</p>
                      )}
                    </div>

                    {/* Imagen */}
                    {post.imagen && (
                      <div className="feed-post__img-wrap">
                        <img src={post.imagen} alt={post.titulo || 'Recuerdo'} />
                        <div className="feed-post__img-overlay">
                          <span className="feed-post__epoca-badge">
                            {EPOCAS.find(e => e.id === post.epoca)?.label}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Reacciones */}
                    <div className="feed-post__footer">
                      <div className="feed-post__reacciones">
                        <div className="feed-post__reacciones-wrap">
                          <button
                            className="feed-post__react-btn"
                            onClick={() => setReaccionesAbiertas(
                              reaccionesAbiertas === post.id ? null : post.id
                            )}
                          >
                            <span className="material-symbols-outlined">add_reaction</span>
                            <span>Reaccionar</span>
                          </button>

                          {/* Panel de reacciones */}
                          {reaccionesAbiertas === post.id && (
                            <div className="feed-reacciones-panel">
                              {REACCIONES.map(r => (
                                <button key={r.icon} className="feed-reacciones-panel__item"
                                  onClick={() => setReaccionesAbiertas(null)}>
                                  <span className="material-symbols-outlined"
                                    style={{ color: r.color,
                                      fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                                    {r.icon}
                                  </span>
                                  <span>{r.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Conteo de reacciones */}
                        <div className="feed-post__react-counts">
                          {Object.entries(post.reacciones).map(([icon, count]) => {
                            const r = REACCIONES.find(x => x.icon === icon);
                            return (
                              <span key={icon} className="feed-post__react-count">
                                <span className="material-symbols-outlined"
                                  style={{ color: r?.color, fontSize: '14px',
                                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                                  {icon}
                                </span>
                                {count}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="feed-post__acciones">
                        <button className="feed-post__accion">
                          <span className="material-symbols-outlined">chat_bubble</span>
                          {post.comentarios}
                        </button>
                        <button className="feed-post__accion">
                          <span className="material-symbols-outlined">share</span>
                        </button>
                        <button className="feed-post__accion" onClick={() => navigate('/tarjeta-legado')}>
                          <span className="material-symbols-outlined">bookmark</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* ══ VISTA GALERÍA ══ */}
            {vista === 'galeria' && (
              <div className="feed-galeria">
                {postsFiltrados.filter(p => p.imagen).map(post => (
                  <div key={post.id} className="feed-galeria__item">
                    <img src={post.imagen!} alt={post.titulo || 'Recuerdo'} />
                    <div className="feed-galeria__overlay">
                      <p className="feed-galeria__titulo">{post.titulo || post.texto.slice(0, 40) + '...'}</p>
                      <div className="feed-galeria__stats">
                        <span>
                          <span className="material-symbols-outlined">favorite</span>
                          {post.reacciones.favorite}
                        </span>
                        <span>
                          <span className="material-symbols-outlined">chat_bubble</span>
                          {post.comentarios}
                        </span>
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
                    <div className="feed-crono-item__dot">
                      <span className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                        {post.esCita ? 'format_quote' : post.imagen ? 'photo_camera' : 'edit_note'}
                      </span>
                    </div>
                    {i < postsFiltrados.length - 1 && <div className="feed-crono-item__line" />}
                    <div className="feed-crono-item__content">
                      <span className="feed-crono-item__tiempo">{post.tiempo}</span>
                      <h4 className="feed-crono-item__titulo">
                        {post.titulo || post.texto.slice(0, 60) + '...'}
                      </h4>
                      {post.imagen && (
                        <img src={post.imagen} alt="" className="feed-crono-item__img" />
                      )}
                    </div>
                  </div>
                ))}
                <button className="feed-crono-more" onClick={() => navigate('/linea-de-vida')}>
                  <span className="material-symbols-outlined">timeline</span>
                  Ver línea de vida completa
                </button>
              </div>
            )}

          </div>{/* /feed-content */}
        </div>{/* /feed-grid */}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="feed-bottom-nav">
        {[
          { icon: 'timeline',    label: 'Línea',   path: '/linea-de-vida',    vault: false, active: false },
          { icon: 'account_tree',label: 'Árbol',   path: '/arbol-genealogico',vault: false, active: false },
          { icon: 'person',      label: 'Perfil',  path: '/feed',             vault: false, active: true  },
          { icon: 'inventory_2', label: 'Bóveda',  path: '/caja-fuerte',      vault: true,  active: false },
          { icon: 'psychology',  label: 'Ecos IA', path: '/ecos/1',           vault: false, active: false },
        ].map(n => (
          <button
            key={n.path}
            className={`feed-bottom-nav__item ${n.active ? 'active' : ''}`}
            onClick={() => handleNavVault(n.path, n.vault)}
          >
            <span className="material-symbols-outlined"
              style={n.active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}>
              {n.icon}
            </span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
