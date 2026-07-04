// ============================================================
// LIFE'S — TimeCapsule.tsx | Cápsula Digital del Tiempo
// Lucide React | SCSS | with-navbar
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, X, Clock, MapPin, Repeat,
  Heart, Video, Mail, Calendar, ChevronRight,
  Lock, Unlock, Play, Upload, Check, AlertCircle,
  User, Users, Sparkles, Send, RefreshCw,
} from 'lucide-react';
import './TimeCapsule.scss';

// ── Tipos ──────────────────────────────────────────────────
type TipoDesbloqueo = 'fecha' | 'hito' | 'lugar' | 'recurrente';
type TipoContenido  = 'video' | 'carta' | 'ambos';
type EstadoCap      = 'sellada' | 'proxima' | 'abierta';

interface Capsula {
  id:           string;
  titulo:       string;
  destinatario: string;
  esParaMi:     boolean;
  avatar:       string;
  relacion:     string;
  tipo:         TipoDesbloqueo;
  tipoContenido:TipoContenido;
  fechaApertura:string;
  hito?:        string;
  lugar?:       string;
  recurrencia?: string;
  estado:       EstadoCap;
  openWhen?:    string;
  imagen?:      string;
  descripcion:  string;
}

// ── Datos mock ─────────────────────────────────────────────
const CAPSULAS_MOCK: Capsula[] = [
  {
    id: '1',
    titulo: 'El consejo que nunca te di',
    destinatario: 'Clara',
    esParaMi: false,
    avatar: 'https://i.pravatar.cc/80?img=20',
    relacion: 'Nieta',
    tipo: 'fecha',
    tipoContenido: 'video',
    fechaApertura: '2038-06-12',
    estado: 'sellada',
    imagen: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
    descripcion: 'Una reflexión sobre la resiliencia, para cuando entres a la adultez.',
  },
  {
    id: '2',
    titulo: 'A vos, dentro de 10 años',
    destinatario: 'Marcelo',
    esParaMi: true,
    avatar: 'https://i.pravatar.cc/80?img=11',
    relacion: 'Yo mismo',
    tipo: 'fecha',
    tipoContenido: 'video',
    fechaApertura: '2034-07-04',
    estado: 'sellada',
    descripcion: '¿Cuántos proyectos cumpliste? ¿Qué cambió? ¿Qué sigue igual?',
  },
  {
    id: '3',
    titulo: 'Los Ecos de Montgomery',
    destinatario: 'Familia',
    esParaMi: false,
    avatar: 'https://i.pravatar.cc/80?img=25',
    relacion: 'Familia',
    tipo: 'recurrente',
    tipoContenido: 'video',
    fechaApertura: '2025-12-31',
    recurrencia: 'Cada 31 de diciembre',
    estado: 'proxima',
    descripcion: 'Compilación de risas y recuerdos, para lanzarse cada Año Nuevo durante 10 años.',
  },
  {
    id: '4',
    titulo: 'Regalo para tu boda',
    destinatario: 'Lucas',
    esParaMi: false,
    avatar: 'https://i.pravatar.cc/80?img=33',
    relacion: 'Hijo',
    tipo: 'hito',
    tipoContenido: 'ambos',
    fechaApertura: '',
    hito: 'El día de tu casamiento',
    estado: 'sellada',
    descripcion: 'La historia de cómo se conocieron tus padres, para compartir el día de tu boda.',
  },
  {
    id: '5',
    titulo: 'Cuando vuelvas a Mendoza',
    destinatario: 'Sofía',
    esParaMi: false,
    avatar: 'https://i.pravatar.cc/80?img=44',
    relacion: 'Hija',
    tipo: 'lugar',
    tipoContenido: 'video',
    fechaApertura: '',
    lugar: 'Cerro Aconcagua, Mendoza',
    estado: 'sellada',
    descripcion: 'Este video se abre cuando llegues a la montaña donde creciste.',
  },
];

const OPEN_WHEN_SUGERENCIAS = [
  'cuando estés triste',
  'cuando tengas miedo',
  'cuando te sientas solo/a',
  'cuando logres algo importante',
  'cuando extrañes a alguien',
  'cuando necesites un consejo',
  'cuando dudes de vos mismo/a',
  'cuando quieras recordar quién sos',
];

const HITOS_SUGERIDOS = [
  'El día de tu casamiento',
  'Cuando tengas tu primer hijo/a',
  'Cuando te recibas',
  'Cuando cumplas 18 años',
  'Cuando cumplas 30 años',
  'Cuando logres tu primer trabajo',
  'Cuando viajes solo/a por primera vez',
];

// ── Helper countdown ───────────────────────────────────────
function calcCountdown(fechaStr: string): string {
  if (!fechaStr) return '';
  const diff = new Date(fechaStr).getTime() - Date.now();
  if (diff <= 0) return 'Disponible ahora';
  const dias  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const años  = Math.floor(dias / 365);
  const meses = Math.floor((dias % 365) / 30);
  if (años > 0)  return `${años} año${años !== 1 ? 's' : ''} y ${meses} mes${meses !== 1 ? 'es' : ''}`;
  if (meses > 0) return `${meses} mes${meses !== 1 ? 'es' : ''}`;
  return `${dias} día${dias !== 1 ? 's' : ''}`;
}

// ── Íconos por tipo de desbloqueo ──────────────────────────
const TIPO_ICONO: Record<TipoDesbloqueo, React.ReactNode> = {
  fecha:      <Calendar size={14} strokeWidth={2} />,
  hito:       <Sparkles size={14} strokeWidth={2} />,
  lugar:      <MapPin   size={14} strokeWidth={2} />,
  recurrente: <Repeat   size={14} strokeWidth={2} />,
};

const TIPO_COLOR: Record<TipoDesbloqueo, string> = {
  fecha:      '#3a5a8a',
  hito:       '#735c00',
  lugar:      '#4a7a4e',
  recurrente: '#855324',
};

// ── Componente ─────────────────────────────────────────────
export default function TimeCapsule() {
  const navigate = useNavigate();

  const [capsulas, setCapsulas]         = useState<Capsula[]>(CAPSULAS_MOCK);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtro, setFiltro]             = useState<'todas' | EstadoCap>('todas');
  const [toast, setToast]               = useState('');

  // Formulario nueva cápsula
  const [fTitulo,        setFTitulo]        = useState('');
  const [fDestinatario,  setFDestinatario]  = useState('');
  const [fRelacion,      setFRelacion]      = useState('');
  const [fEsParaMi,      setFEsParaMi]      = useState(false);
  const [fTipo,          setFTipo]          = useState<TipoDesbloqueo>('fecha');
  const [fContenido,     setFContenido]     = useState<TipoContenido>('video');
  const [fFecha,         setFFecha]         = useState('');
  const [fHito,          setFHito]          = useState('');
  const [fLugar,         setFLugar]         = useState('');
  const [fRecurrencia,   setFRecurrencia]   = useState('');
  const [fOpenWhen,      setFOpenWhen]      = useState('');
  const [fDescripcion,   setFDescripcion]   = useState('');
  const [fUsarOpenWhen,  setFUsarOpenWhen]  = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const crearCapsula = () => {
    if (!fTitulo.trim()) { showToast('⚠️ El título es obligatorio'); return; }
    const nueva: Capsula = {
      id:            Date.now().toString(),
      titulo:        fTitulo.trim(),
      destinatario:  fEsParaMi ? 'Yo mismo/a' : fDestinatario.trim() || 'Sin especificar',
      esParaMi:      fEsParaMi,
      avatar:        fEsParaMi
        ? 'https://i.pravatar.cc/80?img=11'
        : `https://i.pravatar.cc/80?img=${Math.floor(Math.random()*50)+1}`,
      relacion:      fEsParaMi ? 'Yo mismo/a' : fRelacion,
      tipo:          fTipo,
      tipoContenido: fContenido,
      fechaApertura: fFecha,
      hito:          fHito || undefined,
      lugar:         fLugar || undefined,
      recurrencia:   fRecurrencia || undefined,
      openWhen:      fUsarOpenWhen && fOpenWhen ? fOpenWhen : undefined,
      estado:        'sellada',
      descripcion:   fDescripcion.trim() || '—',
    };
    setCapsulas(prev => [nueva, ...prev]);
    setModalAbierto(false);
    resetForm();
    showToast('✓ Cápsula sellada y programada');
  };

  const resetForm = () => {
    setFTitulo(''); setFDestinatario(''); setFRelacion(''); setFEsParaMi(false);
    setFTipo('fecha'); setFContenido('video'); setFFecha(''); setFHito('');
    setFLugar(''); setFRecurrencia(''); setFOpenWhen(''); setFDescripcion('');
    setFUsarOpenWhen(false);
  };

  const capsulasFiltradas = filtro === 'todas'
    ? capsulas
    : capsulas.filter(c => c.estado === filtro);

  const stats = {
    activas:  capsulas.filter(c => c.estado === 'sellada').length,
    proxima:  capsulas.find(c => c.estado === 'proxima'),
    herederos: [...new Set(capsulas.filter(c => !c.esParaMi).map(c => c.destinatario))].length,
    paraMi:   capsulas.filter(c => c.esParaMi).length,
  };

  return (
    <div className="tc-page with-navbar">

      {/* ── HEADER ── */}
      <header className="tc-header">
        <div className="tc-header__left">
          <button className="tc-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="tc-header__title">Cápsula del Tiempo</h1>
            <p className="tc-header__sub">La bóveda de promesas futuras</p>
          </div>
        </div>
        <button className="tc-header__nuevo" onClick={() => setModalAbierto(true)}>
          <Plus size={18} strokeWidth={2} />
          Nueva
        </button>
      </header>

      <main className="tc-main">

        {/* ══ HERO STATS ══ */}
        <div className="tc-hero fade-up">
          <div className="tc-hero__bg" />
          <div className="tc-hero__inner">
            <div className="tc-hero__top">
              <span className="tc-hero__eyebrow">Mensajes viajando al futuro</span>
              <h2 className="tc-hero__titulo">
                {stats.activas} cápsula{stats.activas !== 1 ? 's' : ''} sellada{stats.activas !== 1 ? 's' : ''}
              </h2>
            </div>

            <div className="tc-hero__stats">
              {[
                { val: stats.activas,   label: 'Activas',    icono: <Lock    size={14} strokeWidth={2} /> },
                { val: stats.herederos, label: 'Destinatarios', icono: <Users size={14} strokeWidth={2} /> },
                { val: stats.paraMi,    label: 'Para mí',    icono: <User    size={14} strokeWidth={2} /> },
              ].map(s => (
                <div key={s.label} className="tc-hero__stat">
                  <span className="tc-hero__stat-icono">{s.icono}</span>
                  <span className="tc-hero__stat-val">{s.val}</span>
                  <span className="tc-hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Próximo lanzamiento */}
            {stats.proxima && (
              <div className="tc-hero__proxima">
                <div className="tc-hero__proxima-dot" />
                <div>
                  <span className="tc-hero__proxima-label">Próximo lanzamiento</span>
                  <span className="tc-hero__proxima-titulo">{stats.proxima.titulo}</span>
                  <span className="tc-hero__proxima-fecha">
                    {stats.proxima.fechaApertura
                      ? new Date(stats.proxima.fechaApertura).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
                      : stats.proxima.recurrencia
                    }
                  </span>
                </div>
                <ChevronRight size={16} strokeWidth={1.8} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </div>
            )}
          </div>
        </div>

        {/* ══ PARA MÍ MISMO — Card especial ══ */}
        <div className="tc-para-mi fade-up" style={{ animationDelay: '0.06s' }}>
          <div className="tc-para-mi__left">
            <div className="tc-para-mi__icono">
              <User size={22} strokeWidth={1.4} />
            </div>
            <div>
              <h3 className="tc-para-mi__titulo">Mensaje para vos mismo</h3>
              <p className="tc-para-mi__desc">
                Grabate un video hoy. Abrilo en 5, 10 o 20 años.
                ¿Cuánto cumpliste de lo que soñabas?
              </p>
            </div>
          </div>
          <button
            className="tc-para-mi__btn"
            onClick={() => { setFEsParaMi(true); setModalAbierto(true); }}
          >
            <Video size={15} strokeWidth={1.8} />
            Grabar
          </button>
        </div>

        {/* ══ FILTROS ══ */}
        <div className="tc-filtros fade-up" style={{ animationDelay: '0.1s' }}>
          {[
            { id: 'todas',   label: 'Todas'   },
            { id: 'sellada', label: '🔒 Selladas' },
            { id: 'proxima', label: '⏳ Próximas' },
            { id: 'abierta', label: '🔓 Abiertas' },
          ].map(f => (
            <button
              key={f.id}
              className={`tc-filtro-btn${filtro === f.id ? ' active' : ''}`}
              onClick={() => setFiltro(f.id as any)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ══ GRILLA DE CÁPSULAS ══ */}
        <div className="tc-grid fade-up" style={{ animationDelay: '0.12s' }}>
          {capsulasFiltradas.map((cap, i) => {
            const countdown = calcCountdown(cap.fechaApertura);
            const tipoColor = TIPO_COLOR[cap.tipo];

            return (
              <div
                key={cap.id}
                className={`tc-card${cap.esParaMi ? ' tc-card--para-mi' : ''}${cap.estado === 'proxima' ? ' tc-card--proxima' : ''}`}
                style={{ animationDelay: `${0.12 + i * 0.04}s` }}
              >
                {/* Imagen de fondo si tiene */}
                {cap.imagen && (
                  <div className="tc-card__img">
                    <img src={cap.imagen} alt={cap.titulo} />
                    <div className="tc-card__img-overlay" />
                  </div>
                )}

                {/* Header */}
                <div className="tc-card__header">
                  <div className="tc-card__avatar-wrap">
                    <img src={cap.avatar} alt={cap.destinatario} className="tc-card__avatar" />
                    {cap.esParaMi && (
                      <div className="tc-card__yo-badge">Yo</div>
                    )}
                  </div>
                  <div className="tc-card__dest-info">
                    <span className="tc-card__para">Para:</span>
                    <span className="tc-card__dest-nombre">{cap.destinatario}</span>
                    <span className="tc-card__relacion">{cap.relacion}</span>
                  </div>
                  <div className="tc-card__estado-icono">
                    {cap.estado === 'abierta'
                      ? <Unlock size={16} strokeWidth={1.8} style={{ color: '#4a7a4e' }} />
                      : <Lock   size={16} strokeWidth={1.8} style={{ color: tipoColor }} />
                    }
                  </div>
                </div>

                {/* Título y descripción */}
                <h4 className="tc-card__titulo">{cap.titulo}</h4>
                <p className="tc-card__desc">{cap.descripcion}</p>

                {/* Open When */}
                {cap.openWhen && (
                  <div className="tc-card__open-when">
                    <Heart size={12} strokeWidth={2} />
                    Abrí esto {cap.openWhen}
                  </div>
                )}

                {/* Footer */}
                <div className="tc-card__footer">
                  <div className="tc-card__tipo-badge" style={{ color: tipoColor, background: `${tipoColor}12` }}>
                    {TIPO_ICONO[cap.tipo]}
                    {cap.tipo === 'fecha'      && countdown}
                    {cap.tipo === 'hito'       && cap.hito}
                    {cap.tipo === 'lugar'      && cap.lugar}
                    {cap.tipo === 'recurrente' && cap.recurrencia}
                  </div>
                  <div className="tc-card__contenido-badge">
                    {cap.tipoContenido === 'video' && <Video  size={12} strokeWidth={2} />}
                    {cap.tipoContenido === 'carta' && <Mail   size={12} strokeWidth={2} />}
                    {cap.tipoContenido === 'ambos' && <><Video size={12} strokeWidth={2} /><Mail size={12} strokeWidth={2} /></>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Card agregar */}
          <button className="tc-card-nueva" onClick={() => setModalAbierto(true)}>
            <div className="tc-card-nueva__icono">
              <Plus size={24} strokeWidth={1.6} />
            </div>
            <span>Nueva cápsula</span>
          </button>
        </div>

        {/* ══ SECCIÓN ASEGURÁ TU LEGADO ══ */}
        <div className="tc-asegura fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="tc-asegura__bg" />
          <div className="tc-asegura__inner">
            <h3 className="tc-asegura__titulo">Asegurá tu legado</h3>
            <p className="tc-asegura__desc">
              Todas las cápsulas están encriptadas. Tu voz permanece privada hasta el momento exacto que hayas elegido.
            </p>
            <div className="tc-asegura__grid">
              {[
                { icono: <Video   size={22} strokeWidth={1.4} />, label: 'Grabar Video',    path: null },
                { icono: <Mail    size={22} strokeWidth={1.4} />, label: 'Escribir Carta',  path: '/cartas-privadas' },
                { icono: <Lock    size={22} strokeWidth={1.4} />, label: 'Bóveda',          path: '/caja-fuerte' },
                { icono: <Users   size={22} strokeWidth={1.4} />, label: 'Herederos',       path: '/herederos' },
              ].map(a => (
                <button
                  key={a.label}
                  className="tc-asegura__item"
                  onClick={() => a.path ? navigate(a.path) : setModalAbierto(true)}
                >
                  {a.icono}
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* ════ MODAL NUEVA CÁPSULA ════ */}
      {modalAbierto && (
        <div className="tc-overlay" onClick={() => { setModalAbierto(false); resetForm(); }}>
          <div className="tc-modal" onClick={e => e.stopPropagation()}>

            <div className="tc-modal__handle"><div className="tc-modal__bar" /></div>

            <div className="tc-modal__header">
              <h3>Programar nuevo legado</h3>
              <button onClick={() => { setModalAbierto(false); resetForm(); }}>
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            <div className="tc-modal__body">

              {/* Para mí toggle */}
              <div className="tc-modal__para-mi-toggle">
                <button
                  className={`tc-modal__para-mi-btn${fEsParaMi ? '' : ' active'}`}
                  onClick={() => setFEsParaMi(false)}
                >
                  <Users size={15} strokeWidth={1.8} />
                  Para otra persona
                </button>
                <button
                  className={`tc-modal__para-mi-btn${fEsParaMi ? ' active' : ''}`}
                  onClick={() => setFEsParaMi(true)}
                >
                  <User size={15} strokeWidth={1.8} />
                  Para mí mismo
                </button>
              </div>

              {/* Destinatario */}
              {!fEsParaMi && (
                <>
                  <div className="tc-modal__grupo">
                    <label>Destinatario *</label>
                    <input
                      value={fDestinatario}
                      onChange={e => setFDestinatario(e.target.value)}
                      placeholder="Nombre y apellido"
                    />
                  </div>
                  <div className="tc-modal__grupo">
                    <label>Relación</label>
                    <select value={fRelacion} onChange={e => setFRelacion(e.target.value)}>
                      <option value="">Seleccioná</option>
                      {['Hijo/a','Nieto/a','Esposo/a','Hermano/a','Amigo/a','Sobrino/a','Otro'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Título */}
              <div className="tc-modal__grupo">
                <label>Título de la cápsula *</label>
                <input
                  value={fTitulo}
                  onChange={e => setFTitulo(e.target.value)}
                  placeholder={fEsParaMi ? 'Ej: A vos, dentro de 10 años' : 'Ej: El consejo que nunca te di'}
                />
              </div>

              {/* Tipo de contenido */}
              <div className="tc-modal__grupo">
                <label>Tipo de contenido</label>
                <div className="tc-modal__tipo-contenido">
                  {([
                    { id: 'video', icono: <Video size={16} strokeWidth={1.8} />, label: 'Video' },
                    { id: 'carta', icono: <Mail  size={16} strokeWidth={1.8} />, label: 'Carta' },
                    { id: 'ambos', icono: <><Video size={14} strokeWidth={1.8}/><Mail size={14} strokeWidth={1.8}/></>, label: 'Ambos' },
                  ] as const).map(t => (
                    <button
                      key={t.id}
                      className={`tc-modal__contenido-btn${fContenido === t.id ? ' active' : ''}`}
                      onClick={() => setFContenido(t.id)}
                    >
                      {t.icono}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de desbloqueo */}
              <div className="tc-modal__grupo">
                <label>¿Cuándo se abre?</label>
                <div className="tc-modal__tipos-desbloq">
                  {([
                    { id: 'fecha',      icono: <Calendar size={15} strokeWidth={1.8} />, label: 'Fecha exacta' },
                    { id: 'hito',       icono: <Sparkles size={15} strokeWidth={1.8} />, label: 'Hito de vida' },
                    { id: 'lugar',      icono: <MapPin   size={15} strokeWidth={1.8} />, label: 'Lugar GPS'    },
                    { id: 'recurrente', icono: <Repeat   size={15} strokeWidth={1.8} />, label: 'Recurrente'   },
                  ] as const).map(t => (
                    <button
                      key={t.id}
                      className={`tc-modal__tipo-btn${fTipo === t.id ? ' active' : ''}`}
                      style={fTipo === t.id ? { borderColor: TIPO_COLOR[t.id], color: TIPO_COLOR[t.id], background: `${TIPO_COLOR[t.id]}0f` } : {}}
                      onClick={() => setFTipo(t.id)}
                    >
                      {t.icono}
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Campos según tipo */}
                {fTipo === 'fecha' && (
                  <input
                    type="date"
                    value={fFecha}
                    onChange={e => setFFecha(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ marginTop: '10px' }}
                    className="tc-modal__input"
                  />
                )}

                {fTipo === 'hito' && (
                  <div style={{ marginTop: '10px' }}>
                    <input
                      value={fHito}
                      onChange={e => setFHito(e.target.value)}
                      placeholder="Ej: El día de tu casamiento"
                      className="tc-modal__input"
                    />
                    <div className="tc-modal__sugerencias">
                      {HITOS_SUGERIDOS.map(h => (
                        <button key={h} className="tc-modal__suger-btn" onClick={() => setFHito(h)}>
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {fTipo === 'lugar' && (
                  <div style={{ marginTop: '10px' }}>
                    <div className="tc-modal__lugar-wrap">
                      <MapPin size={16} strokeWidth={1.8} />
                      <input
                        value={fLugar}
                        onChange={e => setFLugar(e.target.value)}
                        placeholder="Ej: Cerro Aconcagua, Mendoza"
                        className="tc-modal__input tc-modal__input--lugar"
                      />
                    </div>
                    <p className="tc-modal__gps-hint">
                      📍 La cápsula se abrirá automáticamente cuando el destinatario esté a menos de 100 metros de este lugar.
                    </p>
                  </div>
                )}

                {fTipo === 'recurrente' && (
                  <div style={{ marginTop: '10px' }}>
                    <select
                      value={fRecurrencia}
                      onChange={e => setFRecurrencia(e.target.value)}
                      className="tc-modal__input"
                    >
                      <option value="">Seleccioná frecuencia</option>
                      <option value="Cada año nuevo">Cada año nuevo (31 Dic)</option>
                      <option value="Cada cumpleaños">Cada cumpleaños</option>
                      <option value="Cada aniversario">Cada aniversario</option>
                      <option value="Cada 5 años">Cada 5 años</option>
                      <option value="Cada 10 años">Cada 10 años</option>
                    </select>
                    <input
                      type="date"
                      value={fFecha}
                      onChange={e => setFFecha(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{ marginTop: '8px' }}
                      className="tc-modal__input"
                      placeholder="Primera fecha de envío"
                    />
                  </div>
                )}
              </div>

              {/* Open When */}
              <div className="tc-modal__grupo">
                <div className="tc-modal__open-when-toggle">
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Heart size={14} strokeWidth={2} style={{ color: '#E8847A' }} />
                      Carta "Abrí esto cuando..."
                    </label>
                    <p className="tc-modal__open-when-hint">Se activa cuando el destinatario lo necesite</p>
                  </div>
                  <div
                    className={`tc-toggle${fUsarOpenWhen ? ' on' : ''}`}
                    onClick={() => setFUsarOpenWhen(!fUsarOpenWhen)}
                  >
                    <div className="tc-toggle__thumb" />
                  </div>
                </div>

                {fUsarOpenWhen && (
                  <div>
                    <input
                      value={fOpenWhen}
                      onChange={e => setFOpenWhen(e.target.value)}
                      placeholder="cuando estés triste, cuando tengas miedo..."
                      className="tc-modal__input"
                      style={{ marginTop: '8px' }}
                    />
                    <div className="tc-modal__sugerencias">
                      {OPEN_WHEN_SUGERENCIAS.map(s => (
                        <button key={s} className="tc-modal__suger-btn tc-modal__suger-btn--heart"
                          onClick={() => setFOpenWhen(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload */}
              <div className="tc-modal__grupo">
                <label>
                  {fContenido === 'video' ? 'Subir video' : fContenido === 'carta' ? 'Subir carta/imagen' : 'Adjuntar contenido'}
                </label>
                <div className="tc-modal__upload" onClick={() => showToast('📂 Seleccionando archivo...')}>
                  <Upload size={24} strokeWidth={1.4} />
                  <span>Arrastrá o seleccioná un archivo</span>
                  <small>{fContenido !== 'carta' ? 'MP4, MOV · max 500MB' : 'JPG, PNG, PDF'}</small>
                  <button className="tc-modal__upload-btn">Seleccionar</button>
                </div>
              </div>

              {/* Descripción */}
              <div className="tc-modal__grupo">
                <label>Mensaje / descripción</label>
                <textarea
                  value={fDescripcion}
                  onChange={e => setFDescripcion(e.target.value)}
                  rows={3}
                  placeholder={fEsParaMi
                    ? 'Contale a tu yo futuro cómo te sentís hoy, cuáles son tus sueños...'
                    : 'Qué querés que sepa cuando abra esta cápsula...'
                  }
                  className="tc-modal__textarea"
                />
              </div>
            </div>

            <div className="tc-modal__footer">
              <button className="tc-modal__cancelar" onClick={() => { setModalAbierto(false); resetForm(); }}>
                Cancelar
              </button>
              <button className="tc-modal__guardar" onClick={crearCapsula}>
                <Lock size={15} strokeWidth={2} />
                Sellar cápsula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="tc-toast">
          <Check size={13} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
