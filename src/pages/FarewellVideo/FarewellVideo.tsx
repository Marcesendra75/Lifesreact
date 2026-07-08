// ============================================================
// LIFE'S — FarewellVideo.tsx | Último Tributo
// Lucide React | SCSS | with-navbar
// ============================================================
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, Upload, Plus, Heart,
  MessageSquare, Clock, Check, X, ChevronRight,
  Users, User, Handshake, Sparkles, Film,
  Lock, Edit2, Trash2, Send, Star,
} from 'lucide-react';
import './FarewellVideo.scss';

// ── Tipos ──────────────────────────────────────────────────
type EstadoVideo = 'grabado' | 'pendiente';
type TipoCapitulo = 'general' | 'persona' | 'especial';
type TipoEntrega  = 'fallecimiento' | 'inmediato' | 'años';

interface Capitulo {
  id: string;
  tipo: TipoCapitulo;
  titulo: string;
  destinatario?: string;
  relacion?: string;
  avatar?: string;
  estado: EstadoVideo;
  duracion?: string;
  descripcion: string;
  especial?: 'pelea' | 'amor' | 'perdon';
  entrega?: TipoEntrega;
}

interface Recuerdo {
  id: string;
  autor: string;
  relacion: string;
  avatar: string;
  texto: string;
  fecha: string;
  likes: number;
}

// ── Datos mock ─────────────────────────────────────────────
const CAPITULOS_MOCK: Capitulo[] = [
  {
    id: '1', tipo: 'general',
    titulo: 'Mi mensaje para todos',
    estado: 'grabado', duracion: '4:32',
    descripcion: 'El mensaje general que quiero que reciban todas las personas que amé.',
  },
  {
    id: '2', tipo: 'persona',
    titulo: 'Para Elena',
    destinatario: 'Elena García', relacion: 'Esposa',
    avatar: 'https://i.pravatar.cc/80?img=25',
    estado: 'grabado', duracion: '8:15',
    descripcion: 'Todo lo que quiero que sepa sobre lo que significó para mí.',
  },
  {
    id: '3', tipo: 'persona',
    titulo: 'Para Sofía',
    destinatario: 'Sofía García', relacion: 'Hija',
    avatar: 'https://i.pravatar.cc/80?img=20',
    estado: 'grabado', duracion: '6:48',
    descripcion: 'Mis consejos, mis sueños para ella y todo mi amor de padre.',
  },
  {
    id: '4', tipo: 'persona',
    titulo: 'Para Lucas',
    destinatario: 'Lucas García', relacion: 'Hijo',
    avatar: 'https://i.pravatar.cc/80?img=33',
    estado: 'pendiente', duracion: undefined,
    descripcion: 'Pendiente de grabar — lo tengo en el corazón, falta encontrar las palabras.',
  },
  {
    id: '5', tipo: 'especial',
    titulo: 'Para quien estamos peleados',
    estado: 'pendiente', duracion: undefined,
    descripcion: 'Un video de reconciliación. Las peleas no deberían ser lo último.',
    especial: 'pelea',
  },
  {
    id: '6', tipo: 'especial',
    titulo: 'Mi pedido de perdón',
    estado: 'pendiente', duracion: undefined,
    descripcion: 'Hay cosas que hice y nunca pedí perdón. Quiero hacerlo ahora.',
    especial: 'perdon',
  },
  {
    id: '7', tipo: 'especial',
    titulo: 'Lo que nunca pude decir',
    estado: 'grabado', duracion: '3:20',
    descripcion: 'Para quienes amé en silencio y nunca me animé a decírselo.',
    especial: 'amor',
  },
];

const RECUERDOS_MOCK: Recuerdo[] = [
  {
    id: '1', autor: 'Elena García', relacion: 'Esposa',
    avatar: 'https://i.pravatar.cc/80?img=25',
    texto: '"Papá siempre decía que cada persona que conocemos es un libro sin leer. Pasó su vida asegurándose de que esos libros nunca fueran olvidados. Extrañaremos su sabiduría más que nada."',
    fecha: '14 de octubre de 2024', likes: 124,
  },
  {
    id: '2', autor: 'Sofía García', relacion: 'Hija',
    avatar: 'https://i.pravatar.cc/80?img=20',
    texto: '"La tarde del jardín, los domingos con café y el sonido de su risa son cosas que nunca voy a poder explicarle a mis hijos con palabras. Pero Life\'s me va a ayudar a mostrárselos."',
    fecha: '16 de octubre de 2024', likes: 89,
  },
  {
    id: '3', autor: 'Carlos Ruiz', relacion: 'Amigo de toda la vida',
    avatar: 'https://i.pravatar.cc/80?img=60',
    texto: '"Cuarenta años de amistad y todavía me sorprendía. Ese fue su regalo: nunca dejó de crecer. Voy a extrañar nuestras discusiones sobre todo y nada."',
    fecha: '18 de octubre de 2024', likes: 67,
  },
];

const ESPECIAL_CONFIG = {
  pelea:  { emoji: '🕊️', color: '#3a5a8a', bg: 'rgba(58,90,138,0.08)',  label: 'Reconciliación' },
  perdon: { emoji: '🙏', color: '#735c00', bg: 'rgba(115,92,0,0.08)',   label: 'Perdón'          },
  amor:   { emoji: '💌', color: '#E8847A', bg: 'rgba(232,132,122,0.08)',label: 'Amor no dicho'   },
};

// ── Componente ─────────────────────────────────────────────
export default function FarewellVideo() {
  const navigate = useNavigate();

  const [reproduciendo,   setReproduciendo]   = useState<string | null>(null);
  const [modalSubir,      setModalSubir]       = useState<Capitulo | null>(null);
  const [modalNuevo,      setModalNuevo]       = useState(false);
  const [modalRecuerdo,   setModalRecuerdo]    = useState(false);
  const [tipoEntrega,     setTipoEntrega]      = useState<TipoEntrega>('fallecimiento');
  const [nuevoTexto,      setNuevoTexto]       = useState('');
  const [capitulos,       setCapitulos]        = useState<Capitulo[]>(CAPITULOS_MOCK);
  const [recuerdos,       setRecuerdos]        = useState<Recuerdo[]>(RECUERDOS_MOCK);
  const [toast,           setToast]            = useState('');
  const [nuevoNombre,     setNuevoNombre]      = useState('');
  const [nuevoRelacion,   setNuevoRelacion]    = useState('');
  const [nuevaDescripcion,setNuevaDescripcion] = useState('');

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [entregasCapitulo, setEntregasCapitulo] = useState<Record<string, TipoEntrega>>({});

  const triggerUpload = (capId: string) => {
    if (fileInputRefs.current[capId]) {
      fileInputRefs.current[capId]!.click();
    }
  };

  const handleFileChange = (capId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) {
      showToast('⚠️ El archivo supera los 500MB');
      return;
    }
    simularSubida(capId);
    showToast(`✓ "${file.name}" subido correctamente`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const grabados  = capitulos.filter(c => c.estado === 'grabado').length;
  const pendientes = capitulos.filter(c => c.estado === 'pendiente').length;
  const pct = Math.round((grabados / capitulos.length) * 100);

  const agregarCapitulo = () => {
    if (!nuevoNombre.trim()) { showToast('⚠️ El nombre es obligatorio'); return; }
    const nuevo: Capitulo = {
      id: Date.now().toString(), tipo: 'persona',
      titulo: `Para ${nuevoNombre.trim()}`,
      destinatario: nuevoNombre.trim(),
      relacion: nuevoRelacion.trim() || 'Persona especial',
      avatar: `https://i.pravatar.cc/80?img=${Math.floor(Math.random()*60)+1}`,
      estado: 'pendiente',
      descripcion: nuevaDescripcion.trim() || 'Pendiente de grabar.',
    };
    setCapitulos(prev => [...prev, nuevo]);
    setModalNuevo(false);
    setNuevoNombre(''); setNuevoRelacion(''); setNuevaDescripcion('');
    showToast(`✓ Capítulo para ${nuevoNombre} agregado`);
  };

  const agregarRecuerdo = () => {
    if (!nuevoTexto.trim()) return;
    const nuevo: Recuerdo = {
      id: Date.now().toString(),
      autor: 'Vos', relacion: 'Autor',
      avatar: 'https://i.pravatar.cc/80?img=11',
      texto: nuevoTexto.trim(),
      fecha: new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }),
      likes: 0,
    };
    setRecuerdos(prev => [nuevo, ...prev]);
    setModalRecuerdo(false);
    setNuevoTexto('');
    showToast('✓ Tu recuerdo fue agregado');
  };

  const simularSubida = (capId: string) => {
    setCapitulos(prev => prev.map(c =>
      c.id === capId ? { ...c, estado: 'grabado', duracion: '3:45' } : c
    ));
    setModalSubir(null);
    showToast('✓ Video subido correctamente');
  };

  return (
    <div className="fw-page with-navbar">

      {/* ── HEADER ── */}
      <header className="fw-header">
        <div className="fw-header__left">
          <button className="fw-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="fw-header__title">Último Tributo</h1>
            <p className="fw-header__sub">Tu mensaje de amor para siempre</p>
          </div>
        </div>
        <button className="fw-header__nuevo" onClick={() => setModalNuevo(true)}>
          <Plus size={18} strokeWidth={2} />
          Nuevo capítulo
        </button>
      </header>

      <main className="fw-main">

        {/* ══ HERO CINEMATOGRÁFICO ══ */}
        <div className="fw-hero fade-up">
          <div className="fw-hero__portada">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80" alt="Portada" />
            <div className="fw-hero__portada-overlay" />
          </div>
          <div className="fw-hero__inner">
            <span className="fw-hero__eyebrow">En memoria · Life's</span>
            <h2 className="fw-hero__titulo">Tu último mensaje<br />de amor</h2>
            <p className="fw-hero__desc">
              Para las personas que más querés. Para las que no pudiste despedirte.<br />
              Para reconciliarte. Para decir lo que nunca dijiste.
            </p>
            <div className="fw-hero__stats">
              <div className="fw-hero__stat">
                <span className="fw-hero__stat-val">{grabados}</span>
                <span className="fw-hero__stat-label">grabados</span>
              </div>
              <div className="fw-hero__stat">
                <span className="fw-hero__stat-val">{pendientes}</span>
                <span className="fw-hero__stat-label">pendientes</span>
              </div>
              <div className="fw-hero__stat">
                <span className="fw-hero__stat-val">{pct}%</span>
                <span className="fw-hero__stat-label">completo</span>
              </div>
            </div>
            <div className="fw-hero__prog-track">
              <div className="fw-hero__prog-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* ══ VIDEO PRINCIPAL ══ */}
        <div className="fw-video-principal fade-up" style={{ animationDelay: '0.06s' }}>
          <div className="fw-video-principal__player">
            <img
              src="https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=800&q=80"
              alt="Video principal"
            />
            <div className="fw-video-principal__overlay" />
            <button
              className="fw-video-principal__play"
              onClick={() => setReproduciendo(reproduciendo === 'main' ? null : 'main')}
            >
              {reproduciendo === 'main'
                ? <Pause size={32} strokeWidth={1.8} />
                : <Play  size={32} strokeWidth={1.8} />
              }
            </button>
            <div className="fw-video-principal__caption">
              <span className="fw-video-principal__dur">4:32</span>
              <h3>"Un mensaje desde el corazón"</h3>
              <p>Mi mensaje general para todos los que amé</p>
            </div>
          </div>
        </div>

        {/* ══ CONFIGURACIÓN DE ENTREGA ══ */}
        <div className="fw-entrega fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="fw-entrega__header">
            <Lock size={18} strokeWidth={1.8} />
            <div>
              <h3>Configuración de entrega</h3>
              <p>¿Cuándo se entregan estos videos a tus herederos?</p>
            </div>
          </div>
          <div className="fw-entrega__opciones">
            {([
              { id: 'fallecimiento', icono: <Clock  size={15} strokeWidth={1.8} />, label: 'Tras mi fallecimiento', desc: 'Activado por tu ejecutor testamentario' },
              { id: 'inmediato',     icono: <Send   size={15} strokeWidth={1.8} />, label: 'De inmediato',          desc: 'Tus herederos pueden verlos ahora' },
              { id: 'años',          icono: <Star   size={15} strokeWidth={1.8} />, label: 'En una fecha futura',   desc: 'Configurá la fecha exacta' },
            ] as const).map(o => (
              <button
                key={o.id}
                className={`fw-entrega__opcion${tipoEntrega === o.id ? ' active' : ''}`}
                onClick={() => setTipoEntrega(o.id)}
              >
                <span className="fw-entrega__opcion-icono">{o.icono}</span>
                <div>
                  <span className="fw-entrega__opcion-label">{o.label}</span>
                  <span className="fw-entrega__opcion-desc">{o.desc}</span>
                </div>
                {tipoEntrega === o.id && <Check size={14} strokeWidth={2.5} className="fw-entrega__check" />}
              </button>
            ))}
          </div>
        </div>

        {/* ══ CAPÍTULOS ══ */}
        <div className="fw-capitulos fade-up" style={{ animationDelay: '0.14s' }}>
          <div className="fw-section-header">
            <div>
              <span className="fw-section-eyebrow">Mensajes personales</span>
              <h3 className="fw-section-titulo">Capítulos del legado</h3>
            </div>
            <button className="fw-section-btn" onClick={() => setModalNuevo(true)}>
              <Plus size={15} strokeWidth={2} />
              Agregar
            </button>
          </div>

          {/* Capítulos generales y por persona */}
          <div className="fw-caps-grid">
            {capitulos.filter(c => c.tipo !== 'especial').map(cap => (
              <div key={cap.id} className={`fw-cap-card${cap.estado === 'pendiente' ? ' fw-cap-card--pendiente' : ''}`}>
                <div className="fw-cap-card__header">
                  {cap.avatar
                    ? <img src={cap.avatar} alt={cap.destinatario} className="fw-cap-card__avatar" />
                    : (
                      <div className="fw-cap-card__avatar-icon">
                        {cap.tipo === 'general' ? <Users size={20} strokeWidth={1.6} /> : <User size={20} strokeWidth={1.6} />}
                      </div>
                    )
                  }
                  <div className="fw-cap-card__info">
                    <h4 className="fw-cap-card__titulo">{cap.titulo}</h4>
                    {cap.relacion && <span className="fw-cap-card__relacion">{cap.relacion}</span>}
                  </div>
                  {cap.estado === 'grabado' && cap.duracion && (
                    <span className="fw-cap-card__dur">{cap.duracion}</span>
                  )}
                </div>
                <p className="fw-cap-card__desc">{cap.descripcion}</p>
                <div className="fw-cap-card__footer">
                  {cap.estado === 'grabado' ? (
                    <button
                      className="fw-cap-card__play-btn"
                      onClick={() => setReproduciendo(reproduciendo === cap.id ? null : cap.id)}
                    >
                      {reproduciendo === cap.id
                        ? <><Pause size={14} strokeWidth={2} /> Pausar</>
                        : <><Play  size={14} strokeWidth={2} /> Reproducir</>
                      }
                    </button>
                  ) : (
                    <>
                      <button
                        className="fw-cap-card__upload-btn"
                        onClick={() => triggerUpload(cap.id)}
                      >
                        <Upload size={14} strokeWidth={2} />
                        Subir video
                      </button>
                      <input
                        type="file" accept="video/*"
                        style={{ display: 'none' }}
                        ref={el => { fileInputRefs.current[cap.id] = el; }}
                        onChange={e => handleFileChange(cap.id, e)}
                      />
                    </>
                  )}
                  <div className="fw-cap-card__acciones">
                    <button onClick={() => showToast('✏️ Editando...')}>
                      <Edit2 size={13} strokeWidth={1.8} />
                    </button>
                    <button onClick={() => {
                      setCapitulos(prev => prev.filter(c => c.id !== cap.id));
                      showToast('✓ Capítulo eliminado');
                    }}>
                      <Trash2 size={13} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Capítulos especiales */}
          <div className="fw-especiales">
            <div className="fw-especiales__header">
              <Sparkles size={16} strokeWidth={1.8} />
              <h4>Capítulos especiales · Lo que solo Life's tiene</h4>
            </div>
            <div className="fw-especiales-grid">
              {capitulos.filter(c => c.tipo === 'especial').map(cap => {
                const cfg = ESPECIAL_CONFIG[cap.especial!];
                return (
                  <div
                    key={cap.id}
                    className="fw-especial-card"
                    style={{ background: cfg.bg, borderColor: `${cfg.color}25` }}
                  >
                    <div className="fw-especial-card__emoji">{cfg.emoji}</div>
                    <div className="fw-especial-card__info">
                      <div className="fw-especial-card__badge" style={{ color: cfg.color, background: `${cfg.color}10` }}>
                        {cfg.label}
                      </div>
                      <h4 className="fw-especial-card__titulo">{cap.titulo}</h4>
                      <p className="fw-especial-card__desc">{cap.descripcion}</p>
                    </div>
                    {cap.estado === 'grabado' ? (
                      <button
                        className="fw-especial-card__play"
                        style={{ background: cfg.color }}
                        onClick={() => setReproduciendo(reproduciendo === cap.id ? null : cap.id)}
                      >
                        {reproduciendo === cap.id ? <Pause size={16} strokeWidth={2} /> : <Play size={16} strokeWidth={2} />}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <button
                        className="fw-especial-card__upload"
                        onClick={() => triggerUpload(cap.id)}
                      >
                        <Upload size={15} strokeWidth={2} />
                        Subir
                      </button>
                      <input
                        type="file" accept="video/*"
                        style={{ display: 'none' }}
                        ref={el => { fileInputRefs.current[cap.id] = el; }}
                        onChange={e => handleFileChange(cap.id, e)}
                      />
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══ RECUERDOS DE LA COMUNIDAD ══ */}
        <div className="fw-recuerdos fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="fw-section-header">
            <div>
              <span className="fw-section-eyebrow">Comentarios y recuerdos</span>
              <h3 className="fw-section-titulo">Lo que dicen de vos</h3>
            </div>
            <button className="fw-section-btn" onClick={() => setModalRecuerdo(true)}>
              <Plus size={15} strokeWidth={2} />
              Compartir
            </button>
          </div>

          <div className="fw-recuerdos-grid">
            {/* Card grande — primer recuerdo */}
            <div className="fw-recuerdo-grande">
              <div className="fw-recuerdo-grande__autor">
                <img src={recuerdos[0].avatar} alt={recuerdos[0].autor} />
                <div>
                  <span className="fw-recuerdo-grande__nombre">{recuerdos[0].autor}</span>
                  <span className="fw-recuerdo-grande__relacion">{recuerdos[0].relacion}</span>
                </div>
              </div>
              <blockquote className="fw-recuerdo-grande__texto">{recuerdos[0].texto}</blockquote>
              <div className="fw-recuerdo-grande__footer">
                <span>{recuerdos[0].fecha}</span>
                <span className="fw-recuerdo-grande__likes">
                  <Heart size={13} strokeWidth={1.8} />
                  {recuerdos[0].likes}
                </span>
              </div>
            </div>

            {/* Cards pequeñas */}
            {recuerdos.slice(1).map(r => (
              <div key={r.id} className="fw-recuerdo-card">
                <div className="fw-recuerdo-card__quote">❝</div>
                <p className="fw-recuerdo-card__texto">{r.texto}</p>
                <div className="fw-recuerdo-card__autor">
                  <img src={r.avatar} alt={r.autor} />
                  <div>
                    <span className="fw-recuerdo-card__nombre">{r.autor}</span>
                    <span className="fw-recuerdo-card__relacion">{r.relacion}</span>
                  </div>
                  <span className="fw-recuerdo-card__likes">
                    <Heart size={11} strokeWidth={1.8} />
                    {r.likes}
                  </span>
                </div>
              </div>
            ))}

            {/* Card agregar */}
            <button className="fw-recuerdo-nueva" onClick={() => setModalRecuerdo(true)}>
              <MessageSquare size={28} strokeWidth={1.2} />
              <span>Compartir un recuerdo</span>
            </button>
          </div>
        </div>

        {/* ══ FOOTER LEGADO ══ */}
        <div className="fw-footer-legado fade-up" style={{ animationDelay: '0.25s' }}>
          <Film size={20} strokeWidth={1.4} />
          <p className="fw-footer-legado__titulo">El legado continúa</p>
          <p className="fw-footer-legado__sub">
            Gestionado con amor por Life's · Preservado para siempre
          </p>
        </div>

      </main>

      {/* ════ MODAL — Subir video ════ */}
      {modalSubir && (
        <div className="fw-overlay" onClick={() => setModalSubir(null)}>
          <div className="fw-modal" onClick={e => e.stopPropagation()}>
            <div className="fw-modal__handle"><div className="fw-modal__bar" /></div>
            <div className="fw-modal__header">
              <h3>Subir video · {modalSubir.titulo}</h3>
              <button onClick={() => setModalSubir(null)}>
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>
            <div className="fw-modal__body">
              <div
                className="fw-upload-zone"
                onClick={() => fileRef.current?.click()}
              >
                <Upload size={36} strokeWidth={1.2} />
                <span>Seleccioná tu video</span>
                <small>MP4, MOV, AVI · Máximo 500MB</small>
                <button className="fw-upload-zone__btn">Seleccionar archivo</button>
                <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }}
                  onChange={() => simularSubida(modalSubir.id)} />
              </div>
              <div className="fw-modal__tips">
                <h4>💡 Consejos para tu video</h4>
                <ul>
                  <li>Elegí un lugar con buena luz natural</li>
                  <li>Hablá con naturalidad, no hace falta guion</li>
                  <li>Duraciones de 3 a 10 minutos son ideales</li>
                  <li>Si te equivocás, podés reemplazarlo cuando quieras</li>
                </ul>
              </div>
            </div>
            <div className="fw-modal__footer">
              <button className="fw-modal__cancelar" onClick={() => setModalSubir(null)}>Cancelar</button>
              <button className="fw-modal__guardar" onClick={() => simularSubida(modalSubir.id)}>
                <Check size={15} strokeWidth={2} />
                Confirmar subida
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL — Nuevo capítulo ════ */}
      {modalNuevo && (
        <div className="fw-overlay" onClick={() => setModalNuevo(false)}>
          <div className="fw-modal" onClick={e => e.stopPropagation()}>
            <div className="fw-modal__handle"><div className="fw-modal__bar" /></div>
            <div className="fw-modal__header">
              <h3>Nuevo capítulo del legado</h3>
              <button onClick={() => setModalNuevo(false)}>
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>
            <div className="fw-modal__body">
              <div className="fw-modal__grupo">
                <label>¿Para quién es este video? *</label>
                <input className="fw-modal__input" placeholder="Nombre completo"
                  value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} />
              </div>
              <div className="fw-modal__grupo">
                <label>Relación</label>
                <select className="fw-modal__input" value={nuevoRelacion}
                  onChange={e => setNuevoRelacion(e.target.value)}>
                  <option value="">Seleccioná</option>
                  {['Hijo/a','Pareja','Hermano/a','Padre/Madre','Amigo/a','Otro'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="fw-modal__grupo">
                <label>¿Qué querés decirle? (descripción interna)</label>
                <textarea className="fw-modal__textarea" rows={3}
                  placeholder="No es el video en sí, solo una nota para recordarte de qué querés hablarle..."
                  value={nuevaDescripcion} onChange={e => setNuevaDescripcion(e.target.value)} />
              </div>
            </div>
            <div className="fw-modal__footer">
              <button className="fw-modal__cancelar" onClick={() => setModalNuevo(false)}>Cancelar</button>
              <button className="fw-modal__guardar" onClick={agregarCapitulo}>
                <Plus size={15} strokeWidth={2} />
                Crear capítulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL — Compartir recuerdo ════ */}
      {modalRecuerdo && (
        <div className="fw-overlay" onClick={() => setModalRecuerdo(false)}>
          <div className="fw-modal" onClick={e => e.stopPropagation()}>
            <div className="fw-modal__handle"><div className="fw-modal__bar" /></div>
            <div className="fw-modal__header">
              <h3>Compartir un recuerdo</h3>
              <button onClick={() => setModalRecuerdo(false)}>
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>
            <div className="fw-modal__body">
              <div className="fw-modal__grupo">
                <label>Tu mensaje de recuerdo</label>
                <textarea className="fw-modal__textarea fw-modal__textarea--serif" rows={5}
                  placeholder="Contá un recuerdo, algo que te marcó, lo que más vas a extrañar..."
                  value={nuevoTexto} onChange={e => setNuevoTexto(e.target.value)} />
                <span className="fw-modal__contador">{nuevoTexto.length} caracteres</span>
              </div>
            </div>
            <div className="fw-modal__footer">
              <button className="fw-modal__cancelar" onClick={() => setModalRecuerdo(false)}>Cancelar</button>
              <button className="fw-modal__guardar" onClick={agregarRecuerdo}>
                <Send size={15} strokeWidth={2} />
                Publicar recuerdo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fw-toast">
          <Check size={13} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
