// ============================================================
// LIFE'S — DigitalEcho.tsx | Ecos del Pasado + IA
// API Anthropic | Grabación de voz | Videos por época
// Lucide React | SCSS | with-navbar
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, MicOff, Play, Pause, Square,
  Video, Upload, Send, Bot, User, Sparkles,
  Clock, Lock, ChevronRight, Plus, Trash2,
  Volume2, Film, BookOpen, Heart, Star, Zap,
  CheckCircle, AlertCircle, Crown,
} from 'lucide-react';
import './DigitalEcho.scss';

// ── Tipos ──────────────────────────────────────────────────
type Epoca = 'infancia' | 'juventud' | 'familia' | 'logros' | 'hoy';
type PlanTipo = 'free' | 'premium';

interface Grabacion {
  id: string;
  titulo: string;
  duracion: number; // segundos
  fecha: string;
  epoca: Epoca;
  tipo: 'voz' | 'video';
  url?: string;
}

interface MensajeChat {
  id: string;
  rol: 'usuario' | 'eco';
  texto: string;
  tiempo: string;
}

// ── Datos mock ─────────────────────────────────────────────
const EPOCAS_CONFIG: Record<Epoca, { emoji: string; label: string; color: string }> = {
  infancia: { emoji: '👶', label: 'Infancia',  color: '#7EC8E3' },
  juventud: { emoji: '🎓', label: 'Juventud',  color: '#A8D8A8' },
  familia:  { emoji: '❤️', label: 'Familia',   color: '#E8847A' },
  logros:   { emoji: '🏆', label: 'Logros',    color: '#C9932A' },
  hoy:      { emoji: '🌿', label: 'Hoy',       color: '#9B8EC4' },
};

const GRABACIONES_MOCK: Grabacion[] = [
  { id: '1', titulo: 'Mis primeros recuerdos de la infancia', duracion: 142, fecha: '12 Mar 2024', epoca: 'infancia', tipo: 'voz' },
  { id: '2', titulo: 'El día que conocí a Elena',            duracion: 89,  fecha: '15 Abr 2024', epoca: 'familia',  tipo: 'voz' },
  { id: '3', titulo: 'Consejos para mis hijos',              duracion: 210, fecha: '20 May 2024', epoca: 'logros',   tipo: 'voz' },
  { id: '4', titulo: 'Video — Viaje a Patagonia',            duracion: 58,  fecha: '3 Jun 2024',  epoca: 'logros',   tipo: 'video' },
];

const MENSAJES_INICIALES: MensajeChat[] = [
  {
    id: '1', rol: 'eco',
    texto: 'Hola. Soy el Eco de Marcelo. Fui entrenado con sus recuerdos, reflexiones y grabaciones. ¿Qué querés saber?',
    tiempo: '10:30',
  },
];

const PROMPTS_SUGERIDOS = [
  '¿Qué consejo me darías para momentos difíciles?',
  '¿Cuál fue el momento más feliz de tu vida?',
  '¿Qué querés que recuerde de vos?',
  '¿Qué aprendiste sobre el amor?',
];

// ── Helpers ────────────────────────────────────────────────
function formatDuracion(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Componente ─────────────────────────────────────────────
export default function DigitalEcho() {
  const navigate = useNavigate();

  const [tabActiva, setTabActiva]           = useState<'grabaciones' | 'videos' | 'eco'>('grabaciones');
  const [plan]                              = useState<PlanTipo>('free');
  const [grabaciones, setGrabaciones]       = useState<Grabacion[]>(GRABACIONES_MOCK);
  const [epochaFiltro, setEpochaFiltro]     = useState<Epoca | 'todas'>('todas');
  const [grabando, setGrabando]             = useState(false);
  const [tiempoGrab, setTiempoGrab]         = useState(0);
  const [reproduciendo, setReproduciendo]   = useState<string | null>(null);
  const [mensajes, setMensajes]             = useState<MensajeChat[]>(MENSAJES_INICIALES);
  const [inputChat, setInputChat]           = useState('');
  const [cargandoEco, setCargandoEco]       = useState(false);
  const [modalGrab, setModalGrab]           = useState(false);
  const [tituloNuevo, setTituloNuevo]       = useState('');
  const [epocaNueva, setEpocaNueva]         = useState<Epoca>('hoy');
  const [toast, setToast]                   = useState('');
  const [videosMes, setVideosMes]           = useState(0); // videos creados este mes (free = max 1)

  const timerRef   = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── Grabación de voz ──
  const iniciarGrabacion = () => {
    setGrabando(true);
    setTiempoGrab(0);
    timerRef.current = setInterval(() => {
      setTiempoGrab(prev => prev + 1);
    }, 1000);
  };

  const detenerGrabacion = () => {
    setGrabando(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setModalGrab(true);
  };

  const guardarGrabacion = () => {
    if (!tituloNuevo.trim()) { showToast('⚠️ Escribí un título'); return; }
    const nueva: Grabacion = {
      id:       Date.now().toString(),
      titulo:   tituloNuevo.trim(),
      duracion: tiempoGrab,
      fecha:    new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }),
      epoca:    epocaNueva,
      tipo:     'voz',
    };
    setGrabaciones(prev => [nueva, ...prev]);
    setModalGrab(false);
    setTituloNuevo('');
    setTiempoGrab(0);
    showToast('✓ Grabación guardada en tu Eco');
  };

  const eliminarGrabacion = (id: string) => {
    setGrabaciones(prev => prev.filter(g => g.id !== id));
    showToast('✓ Grabación eliminada');
  };

  // ── Eco IA con API Anthropic ──
  const enviarMensaje = async (texto?: string) => {
    const msg = texto || inputChat.trim();
    if (!msg) return;

    const nuevoMsg: MensajeChat = {
      id:     Date.now().toString(),
      rol:    'usuario',
      texto:  msg,
      tiempo: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMensajes(prev => [...prev, nuevoMsg]);
    setInputChat('');
    setCargandoEco(true);

    try {
      // Construir el contexto del "eco" con las grabaciones y datos del usuario
      const contextoEco = `Sos el Eco Digital de Marcelo García, un hombre de 50 años de Mendoza, Argentina.
Fuiste entrenado con sus recuerdos, reflexiones y grabaciones de voz.
Sus características: padre amoroso, emprendedor, broker de seguros, apasionado por preservar memorias.
Sus valores: familia, honestidad, trabajo duro, amor por Argentina.
Sus grabaciones incluyen: recuerdos de infancia, el día que conoció a su pareja Elena, consejos para sus hijos, viajes por Patagonia.
Respondé SIEMPRE en primera persona como si fueras Marcelo. Sé cálido, sabio y emotivo.
Usá un tono argentino natural. Máximo 3 párrafos cortos por respuesta.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: contextoEco,
          messages: [
            ...mensajes.filter(m => m.rol !== 'eco' || m.id !== '1').map(m => ({
              role: m.rol === 'usuario' ? 'user' : 'assistant',
              content: m.texto,
            })),
            { role: 'user', content: msg },
          ],
        }),
      });

      const data = await response.json();
      const respuesta = data.content?.[0]?.text || 'No pude procesar tu mensaje en este momento.';

      const ecoMsg: MensajeChat = {
        id:     (Date.now() + 1).toString(),
        rol:    'eco',
        texto:  respuesta,
        tiempo: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMensajes(prev => [...prev, ecoMsg]);

    } catch (err) {
      const ecoMsg: MensajeChat = {
        id:     (Date.now() + 1).toString(),
        rol:    'eco',
        texto:  'Tuve un problema para conectarme en este momento. Intentá de nuevo.',
        tiempo: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMensajes(prev => [...prev, ecoMsg]);
    } finally {
      setCargandoEco(false);
    }
  };

  const grabsFiltradas = epochaFiltro === 'todas'
    ? grabaciones
    : grabaciones.filter(g => g.epoca === epochaFiltro);

  const totalGrabaciones = grabaciones.length;
  const totalMinutos = Math.floor(grabaciones.reduce((acc, g) => acc + g.duracion, 0) / 60);

  return (
    <div className="de-page with-navbar">

      {/* ── HEADER ── */}
      <header className="de-header">
        <div className="de-header__left">
          <button className="de-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="de-header__title">Ecos IA</h1>
            <p className="de-header__sub">Tu legado en voz y video</p>
          </div>
        </div>
        <div className="de-header__plan">
          {plan === 'free'
            ? <span className="de-plan-badge de-plan-badge--free">Free</span>
            : <span className="de-plan-badge de-plan-badge--premium"><Crown size={11} strokeWidth={2} /> Premium</span>
          }
        </div>
      </header>

      {/* ── HERO STATS ── */}
      <div className="de-hero fade-up">
        <div className="de-hero__bg" />
        <div className="de-hero__inner">
          <div className="de-hero__avatar-wrap">
            <img src="https://i.pravatar.cc/80?img=11" alt="Marcelo" className="de-hero__avatar" />
            <div className="de-hero__eco-ring" />
            <div className="de-hero__eco-badge">
              <Zap size={12} strokeWidth={2} />
              Eco activo
            </div>
          </div>
          <div className="de-hero__info">
            <h2 className="de-hero__nombre">Eco de Marcelo</h2>
            <p className="de-hero__desc">
              Tu voz, tus recuerdos y tu sabiduría preservados para siempre.
            </p>
            <div className="de-hero__stats">
              <div className="de-hero__stat">
                <span className="de-hero__stat-val">{totalGrabaciones}</span>
                <span className="de-hero__stat-label">grabaciones</span>
              </div>
              <div className="de-hero__stat">
                <span className="de-hero__stat-val">{totalMinutos}</span>
                <span className="de-hero__stat-label">minutos</span>
              </div>
              <div className="de-hero__stat">
                <span className="de-hero__stat-val">{Object.keys(EPOCAS_CONFIG).length}</span>
                <span className="de-hero__stat-label">épocas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="de-tabs fade-up" style={{ animationDelay: '0.05s' }}>
        {[
          { id: 'grabaciones', icono: <Mic     size={16} strokeWidth={1.8} />, label: 'Grabaciones' },
          { id: 'videos',      icono: <Film    size={16} strokeWidth={1.8} />, label: 'Videos'      },
          { id: 'eco',         icono: <Bot     size={16} strokeWidth={1.8} />, label: 'Eco IA'      },
        ].map(t => (
          <button
            key={t.id}
            className={`de-tab${tabActiva === t.id ? ' active' : ''}`}
            onClick={() => setTabActiva(t.id as any)}
          >
            {t.icono}
            {t.label}
          </button>
        ))}
      </div>

      <div className="de-content fade-up" style={{ animationDelay: '0.1s' }}>

        {/* ════ TAB: GRABACIONES ════ */}
        {tabActiva === 'grabaciones' && (
          <div className="de-grabaciones">

            {/* Grabador */}
            <div className="de-grabador">
              <div className="de-grabador__inner">
                {grabando ? (
                  <>
                    <div className="de-grabador__pulso" />
                    <div className="de-grabador__tiempo">{formatDuracion(tiempoGrab)}</div>
                    <p className="de-grabador__hint">Grabando... hablá con naturalidad</p>
                    <button className="de-grabador__btn de-grabador__btn--stop" onClick={detenerGrabacion}>
                      <Square size={20} strokeWidth={2} />
                      Detener grabación
                    </button>
                  </>
                ) : (
                  <>
                    <div className="de-grabador__icono">
                      <Mic size={32} strokeWidth={1.4} />
                    </div>
                    <h3 className="de-grabador__titulo">Nueva grabación</h3>
                    <p className="de-grabador__hint">
                      Grabá tu voz desde el micrófono. Contá tus recuerdos, reflexiones o consejos.
                    </p>
                    <button className="de-grabador__btn de-grabador__btn--start" onClick={iniciarGrabacion}>
                      <Mic size={18} strokeWidth={2} />
                      Iniciar grabación
                    </button>
                    <button className="de-grabador__upload" onClick={() => showToast('📂 Seleccionando archivo...')}>
                      <Upload size={15} strokeWidth={1.8} />
                      Subir audio existente
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Filtro por época */}
            <div className="de-epocas-filtro">
              <button
                className={`de-epoca-btn${epochaFiltro === 'todas' ? ' active' : ''}`}
                onClick={() => setEpochaFiltro('todas')}
              >
                Todas
              </button>
              {(Object.keys(EPOCAS_CONFIG) as Epoca[]).map(e => (
                <button
                  key={e}
                  className={`de-epoca-btn${epochaFiltro === e ? ' active' : ''}`}
                  style={epochaFiltro === e ? { background: EPOCAS_CONFIG[e].color, color: 'white', borderColor: EPOCAS_CONFIG[e].color } : {}}
                  onClick={() => setEpochaFiltro(e)}
                >
                  {EPOCAS_CONFIG[e].emoji} {EPOCAS_CONFIG[e].label}
                </button>
              ))}
            </div>

            {/* Lista de grabaciones */}
            <div className="de-grabaciones-lista">
              {grabsFiltradas.length === 0 ? (
                <div className="de-empty">
                  <Mic size={36} strokeWidth={1.2} />
                  <p>No hay grabaciones en esta época</p>
                </div>
              ) : (
                grabsFiltradas.map(g => (
                  <div key={g.id} className="de-grab-item">
                    <div
                      className="de-grab-item__epoca"
                      style={{ background: EPOCAS_CONFIG[g.epoca].color }}
                    >
                      {EPOCAS_CONFIG[g.epoca].emoji}
                    </div>
                    <div className="de-grab-item__info">
                      <h4 className="de-grab-item__titulo">{g.titulo}</h4>
                      <div className="de-grab-item__meta">
                        <span>{g.tipo === 'video' ? '🎥' : '🎙️'} {formatDuracion(g.duracion)}</span>
                        <span>·</span>
                        <span>{g.fecha}</span>
                      </div>
                    </div>
                    <div className="de-grab-item__acciones">
                      <button
                        className="de-grab-item__play"
                        onClick={() => setReproduciendo(reproduciendo === g.id ? null : g.id)}
                      >
                        {reproduciendo === g.id
                          ? <Pause size={16} strokeWidth={2} />
                          : <Play  size={16} strokeWidth={2} />
                        }
                      </button>
                      <button
                        className="de-grab-item__del"
                        onClick={() => eliminarGrabacion(g.id)}
                      >
                        <Trash2 size={14} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ════ TAB: VIDEOS ════ */}
        {tabActiva === 'videos' && (
          <div className="de-videos">

            {/* Free vs Premium */}
            <div className="de-plan-card">
              <div className="de-plan-card__free">
                <CheckCircle size={18} strokeWidth={2} />
                <div>
                  <h4>Plan Free</h4>
                  <p>1 video por mes · hasta 1 minuto · compilación automática con fotos de tu línea de vida</p>
                </div>
                <span className="de-plan-card__badge">
                  {videosMes}/1 este mes
                </span>
              </div>
              <div className="de-plan-card__premium">
                <Crown size={18} strokeWidth={1.8} />
                <div>
                  <h4>Plan Premium</h4>
                  <p>Videos ilimitados · IA que anima fotos · editor con títulos · voz sintetizada · compilaciones por épocas</p>
                </div>
                <button
                  className="de-plan-card__upgrade"
                  onClick={() => navigate('/configuracion')}
                >
                  Activar
                </button>
              </div>
            </div>

            {/* Crear video */}
            <div className="de-video-crear">
              <h3 className="de-video-crear__titulo">
                <Film size={18} strokeWidth={1.8} />
                Crear video de legado
              </h3>
              <p className="de-video-crear__desc">
                Seleccioná una época y compilamos automáticamente tus fotos y recuerdos de la línea de vida en un video emotivo.
              </p>

              <div className="de-video-epocas">
                {(Object.keys(EPOCAS_CONFIG) as Epoca[]).map(e => (
                  <button
                    key={e}
                    className="de-video-epoca-card"
                    onClick={() => {
                      if (plan === 'free' && videosMes >= 1) {
                        showToast('⚠️ Alcanzaste el límite free. Activá Premium para más videos.');
                        return;
                      }
                      setVideosMes(prev => prev + 1);
                      showToast(`✓ Compilando video de ${EPOCAS_CONFIG[e].label}...`);
                    }}
                  >
                    <div
                      className="de-video-epoca-card__emoji"
                      style={{ background: `${EPOCAS_CONFIG[e].color}20`, color: EPOCAS_CONFIG[e].color }}
                    >
                      {EPOCAS_CONFIG[e].emoji}
                    </div>
                    <span className="de-video-epoca-card__label">{EPOCAS_CONFIG[e].label}</span>
                    <span className="de-video-epoca-card__info">
                      {grabaciones.filter(g => g.tipo === 'video' && g.epoca === e).length + 2} clips
                    </span>
                    {plan === 'free' && videosMes >= 1 && (
                      <Lock size={12} strokeWidth={2} className="de-video-epoca-card__lock" />
                    )}
                  </button>
                ))}
              </div>

              {/* Editor básico placeholder */}
              <div className="de-editor-placeholder">
                <Film size={28} strokeWidth={1.2} />
                <p>Editor de video con títulos</p>
                <span>Disponible en Premium · Agregá títulos, música y transiciones a tus compilaciones</span>
                <button
                  className="de-editor-placeholder__btn"
                  onClick={() => navigate('/configuracion')}
                >
                  <Crown size={14} strokeWidth={1.8} />
                  Activar Premium
                </button>
              </div>
            </div>

            {/* Videos creados */}
            <div className="de-videos-lista">
              <h4 className="de-videos-lista__titulo">Videos creados</h4>
              {grabaciones.filter(g => g.tipo === 'video').map(v => (
                <div key={v.id} className="de-grab-item">
                  <div className="de-grab-item__epoca" style={{ background: EPOCAS_CONFIG[v.epoca].color }}>
                    🎥
                  </div>
                  <div className="de-grab-item__info">
                    <h4 className="de-grab-item__titulo">{v.titulo}</h4>
                    <div className="de-grab-item__meta">
                      <span>{formatDuracion(v.duracion)}</span>
                      <span>·</span>
                      <span>{v.fecha}</span>
                    </div>
                  </div>
                  <button className="de-grab-item__play" onClick={() => showToast('▶️ Reproduciendo...')}>
                    <Play size={16} strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ TAB: ECO IA ════ */}
        {tabActiva === 'eco' && (
          <div className="de-eco">

            {/* Info del eco */}
            <div className="de-eco-info">
              <div className="de-eco-info__left">
                <Sparkles size={16} strokeWidth={1.8} />
                <div>
                  <h4>Eco IA activo</h4>
                  <p>Entrenado con {totalGrabaciones} grabaciones · {totalMinutos} min de voz</p>
                </div>
              </div>
              <div className="de-eco-info__badge">
                <div className="de-eco-dot" />
                En línea
              </div>
            </div>

            {/* Prompts sugeridos */}
            <div className="de-prompts">
              {PROMPTS_SUGERIDOS.map(p => (
                <button
                  key={p}
                  className="de-prompt-btn"
                  onClick={() => enviarMensaje(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Chat */}
            <div className="de-chat">
              {mensajes.map(m => (
                <div
                  key={m.id}
                  className={`de-mensaje${m.rol === 'eco' ? ' de-mensaje--eco' : ' de-mensaje--usuario'}`}
                >
                  <div className="de-mensaje__avatar">
                    {m.rol === 'eco'
                      ? <Bot  size={16} strokeWidth={1.8} />
                      : <User size={16} strokeWidth={1.8} />
                    }
                  </div>
                  <div className="de-mensaje__bubble">
                    <p>{m.texto}</p>
                    <span className="de-mensaje__tiempo">{m.tiempo}</span>
                  </div>
                </div>
              ))}

              {cargandoEco && (
                <div className="de-mensaje de-mensaje--eco">
                  <div className="de-mensaje__avatar">
                    <Bot size={16} strokeWidth={1.8} />
                  </div>
                  <div className="de-mensaje__bubble de-mensaje__bubble--loading">
                    <div className="de-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="de-chat-input">
              <input
                type="text"
                placeholder="Preguntale algo a tu Eco..."
                value={inputChat}
                onChange={e => setInputChat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
              />
              <button
                className="de-chat-send"
                onClick={() => enviarMensaje()}
                disabled={!inputChat.trim() || cargandoEco}
              >
                <Send size={18} strokeWidth={1.8} />
              </button>
            </div>

            {/* Aviso premium */}
            {plan === 'free' && mensajes.length > 6 && (
              <div className="de-eco-limit">
                <AlertCircle size={16} strokeWidth={1.8} />
                <p>En el plan Premium tu Eco puede interactuar con más profundidad, usar tu voz real y responder con mayor contexto.</p>
                <button onClick={() => navigate('/configuracion')}>
                  <Crown size={13} strokeWidth={1.8} />
                  Activar Premium
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ════ MODAL — Guardar grabación ════ */}
      {modalGrab && (
        <div className="de-overlay" onClick={() => setModalGrab(false)}>
          <div className="de-modal" onClick={e => e.stopPropagation()}>
            <div className="de-modal__handle"><div className="de-modal__bar" /></div>
            <div className="de-modal__header">
              <h3>Guardá tu grabación</h3>
              <p>{formatDuracion(tiempoGrab)} grabados</p>
            </div>
            <div className="de-modal__body">
              <div className="de-modal__grupo">
                <label>Título de la grabación</label>
                <input
                  autoFocus
                  value={tituloNuevo}
                  onChange={e => setTituloNuevo(e.target.value)}
                  placeholder="Ej: Mis recuerdos de la infancia..."
                />
              </div>
              <div className="de-modal__grupo">
                <label>Época de vida</label>
                <div className="de-modal__epocas">
                  {(Object.keys(EPOCAS_CONFIG) as Epoca[]).map(e => (
                    <button
                      key={e}
                      className={`de-modal__epoca-btn${epocaNueva === e ? ' active' : ''}`}
                      style={epocaNueva === e ? { background: EPOCAS_CONFIG[e].color, color: 'white' } : {}}
                      onClick={() => setEpocaNueva(e)}
                    >
                      {EPOCAS_CONFIG[e].emoji} {EPOCAS_CONFIG[e].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="de-modal__footer">
              <button className="de-modal__cancelar" onClick={() => setModalGrab(false)}>Descartar</button>
              <button className="de-modal__guardar" onClick={guardarGrabacion}>
                <CheckCircle size={15} strokeWidth={2} />
                Guardar grabación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="de-toast">
          <CheckCircle size={13} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
