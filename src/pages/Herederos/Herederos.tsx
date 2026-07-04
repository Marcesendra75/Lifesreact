// ============================================================
// LIFE'S — Herederos.tsx
// Lucide React | SCSS | with-navbar
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, X, Check, ChevronRight, ChevronDown,
  Users, User, Mail, Heart, FileText, Coins, Scale,
  Video, Mail as MailIcon, Edit3, Shield, Clock,
  AlertTriangle, BookOpen, Sparkles, Save, Trash2,
} from 'lucide-react';
import './Herederos.scss';

// ── Tipos ──────────────────────────────────────────────────
type Condicion = 'inmediato' | 'verificacion' | 'fallecimiento';
type Relacion  = 'hijo/a' | 'pareja' | 'hermano/a' | 'padre/madre' | 'amigo/a' | 'otro';

interface AccesoSeccion {
  documentos:    boolean;
  cajaValores:   boolean;
  testamento:    boolean;
  videos:        boolean;
  cartas:        boolean;
}

interface Heredero {
  id:          string;
  nombre:      string;
  apellido:    string;
  email:       string;
  relacion:    Relacion;
  avatar:      string;
  porcentaje:  number;
  condicion:   Condicion;
  acceso:      AccesoSeccion;
  cartaLibre:  string;
  expandido:   boolean;
  cartaAbierta:boolean;
}

// ── Datos mock ─────────────────────────────────────────────
const HEREDEROS_INICIALES: Heredero[] = [
  {
    id: '1',
    nombre: 'Elena', apellido: 'García',
    email: 'elena@email.com',
    relacion: 'pareja',
    avatar: 'https://i.pravatar.cc/80?img=25',
    porcentaje: 60,
    condicion: 'fallecimiento',
    acceso: { documentos: true, cajaValores: true, testamento: true, videos: true, cartas: true },
    cartaLibre: 'Elena, gracias por ser mi compañera de vida. Quiero que sepas que cada día a tu lado fue un regalo. Lo que construimos juntos es el legado más importante que puedo dejarte.',
    expandido: false,
    cartaAbierta: false,
  },
  {
    id: '2',
    nombre: 'Sofía', apellido: 'García',
    email: 'sofia@email.com',
    relacion: 'hijo/a',
    avatar: 'https://i.pravatar.cc/80?img=20',
    porcentaje: 40,
    condicion: 'fallecimiento',
    acceso: { documentos: true, cajaValores: true, testamento: false, videos: true, cartas: true },
    cartaLibre: '',
    expandido: false,
    cartaAbierta: false,
  },
];

const PREGUNTAS_GUIA = [
  '¿Qué querés que recuerde de vos?',
  '¿Qué consejo le darías para su vida?',
  '¿Qué momentos compartidos atesorás más?',
  '¿Qué valores querés que lleve siempre consigo?',
  '¿Qué sueños tenés para él/ella?',
];

const SECCIONES_ACCESO = [
  { key: 'documentos',  label: 'Documentos Vitales', icono: <FileText size={14} strokeWidth={1.8} /> },
  { key: 'cajaValores', label: 'Caja de Valores',    icono: <Coins    size={14} strokeWidth={1.8} /> },
  { key: 'testamento',  label: 'Testamento',          icono: <Scale    size={14} strokeWidth={1.8} /> },
  { key: 'videos',      label: 'Último Tributo',      icono: <Video    size={14} strokeWidth={1.8} /> },
  { key: 'cartas',      label: 'Cartas Privadas',     icono: <MailIcon size={14} strokeWidth={1.8} /> },
];

const CONDICION_CONFIG = {
  inmediato:    { label: 'Acceso inmediato',       color: '#4a7a4e', bg: 'rgba(74,122,78,0.1)'  },
  verificacion: { label: 'Tras verificación',      color: '#735c00', bg: 'rgba(115,92,0,0.1)'   },
  fallecimiento:{ label: 'Tras fallecimiento',     color: '#3a5a8a', bg: 'rgba(58,90,138,0.1)'  },
};

const RELACIONES: Relacion[] = ['hijo/a','pareja','hermano/a','padre/madre','amigo/a','otro'];

// ── Componente ─────────────────────────────────────────────
export default function Herederos() {
  const navigate = useNavigate();

  const [herederos, setHerederos] = useState<Heredero[]>(HEREDEROS_INICIALES);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [cartaInstrucciones, setCartaInstrucciones] = useState(false);
  const [preguntaActiva, setPreguntaActiva] = useState<{id:string; pregunta:string} | null>(null);
  const [toast, setToast] = useState('');

  // Nuevo heredero
  const [nuevoNombre,   setNuevoNombre]   = useState('');
  const [nuevoApellido, setNuevoApellido] = useState('');
  const [nuevoEmail,    setNuevoEmail]    = useState('');
  const [nuevoRelacion, setNuevoRelacion] = useState<Relacion>('hijo/a');
  const [nuevoPct,      setNuevoPct]      = useState(10);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Completitud del plan
  const conCarta    = herederos.filter(h => h.cartaLibre.trim().length > 0).length;
  const totalConfig = herederos.length * 5; // 5 aspectos por heredero
  const configHecho = herederos.reduce((acc, h) => {
    let pts = 0;
    if (h.cartaLibre.trim()) pts++;
    if (h.email) pts++;
    if (h.porcentaje > 0) pts++;
    if (Object.values(h.acceso).some(Boolean)) pts++;
    if (h.condicion) pts++;
    return acc + pts;
  }, 0);
  const pctCompletitud = herederos.length === 0 ? 0 : Math.round((configHecho / totalConfig) * 100);

  // Total de porcentajes
  const totalPct = herederos.reduce((acc, h) => acc + h.porcentaje, 0);

  // Actualizar heredero
  const actualizar = (id: string, campo: keyof Heredero, valor: any) => {
    setHerederos(prev => prev.map(h => h.id === id ? { ...h, [campo]: valor } : h));
  };

  const actualizarAcceso = (id: string, seccion: keyof AccesoSeccion, valor: boolean) => {
    setHerederos(prev => prev.map(h =>
      h.id === id ? { ...h, acceso: { ...h.acceso, [seccion]: valor } } : h
    ));
  };

  // Agregar heredero
  const agregarHeredero = () => {
    if (!nuevoNombre.trim() || !nuevoEmail.trim()) {
      showToast('⚠️ Nombre y email son obligatorios');
      return;
    }
    const nuevo: Heredero = {
      id:          Date.now().toString(),
      nombre:      nuevoNombre.trim(),
      apellido:    nuevoApellido.trim(),
      email:       nuevoEmail.trim(),
      relacion:    nuevoRelacion,
      avatar:      `https://i.pravatar.cc/80?img=${Math.floor(Math.random()*70)+1}`,
      porcentaje:  nuevoPct,
      condicion:   'fallecimiento',
      acceso:      { documentos: true, cajaValores: false, testamento: false, videos: true, cartas: true },
      cartaLibre:  '',
      expandido:   true,
      cartaAbierta:false,
    };
    setHerederos(prev => [...prev, nuevo]);
    setDrawerAbierto(false);
    setNuevoNombre(''); setNuevoApellido(''); setNuevoEmail(''); setNuevoPct(10);
    showToast(`✓ ${nuevo.nombre} agregado como heredero`);
  };

  // Eliminar heredero
  const eliminarHeredero = (id: string) => {
    const h = herederos.find(x => x.id === id);
    setHerederos(prev => prev.filter(x => x.id !== id));
    showToast(`✓ ${h?.nombre} eliminado de herederos`);
  };

  // Insertar pregunta guía en carta
  const insertarPregunta = (id: string, pregunta: string) => {
    const h = herederos.find(x => x.id === id);
    const textoActual = h?.cartaLibre || '';
    const nuevo = textoActual
      ? `${textoActual}\n\n${pregunta}\n`
      : `${pregunta}\n`;
    actualizar(id, 'cartaLibre', nuevo);
    setPreguntaActiva(null);
    showToast('✓ Pregunta agregada como guía');
  };

  return (
    <div className="her-page with-navbar">

      {/* ── HEADER ── */}
      <header className="her-header">
        <div className="her-header__left">
          <button className="her-header__back" onClick={() => navigate('/caja-fuerte')}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="her-header__title">Herederos</h1>
            <p className="her-header__sub">Tu plan de herencia digital</p>
          </div>
        </div>
        <button className="her-header__add" onClick={() => setDrawerAbierto(true)}>
          <Plus size={18} strokeWidth={2} />
          Agregar
        </button>
      </header>

      <main className="her-main">

        {/* ══ 1. HERO ══ */}
        <div className="her-hero fade-up">
          <div className="her-hero__bg" />
          <div className="her-hero__inner">
            <div className="her-hero__top">
              <div className="her-hero__icono">
                <Users size={28} strokeWidth={1.4} />
              </div>
              <div>
                <p className="her-hero__eyebrow">Las personas que van a continuar tu legado</p>
                <h2 className="her-hero__titulo">
                  {herederos.length === 0
                    ? 'Aún no designaste herederos'
                    : `${herederos.length} heredero${herederos.length !== 1 ? 's' : ''} designado${herederos.length !== 1 ? 's' : ''}`
                  }
                </h2>
              </div>
            </div>

            {/* Barra completitud */}
            <div className="her-hero__prog-wrap">
              <div className="her-hero__prog-header">
                <span>Tu plan de herencia está completo</span>
                <span className="her-hero__prog-pct">{pctCompletitud}%</span>
              </div>
              <div className="her-prog-track">
                <div className="her-prog-fill" style={{ width: `${pctCompletitud}%` }} />
              </div>
              {pctCompletitud < 100 && (
                <p className="her-hero__prog-hint">
                  {conCarta < herederos.length
                    ? `Escribí cartas personales para ${herederos.length - conCarta} heredero${herederos.length - conCarta !== 1 ? 's' : ''} más`
                    : 'Configurá los accesos de cada heredero'
                  }
                </p>
              )}
            </div>

            {/* Distribución total */}
            {herederos.length > 0 && (
              <div className="her-hero__dist">
                <span className="her-hero__dist-label">Distribución total</span>
                <span className={`her-hero__dist-total${totalPct === 100 ? ' ok' : totalPct > 100 ? ' error' : ''}`}>
                  {totalPct}%
                  {totalPct === 100 && <Check size={14} strokeWidth={2.5} />}
                  {totalPct !== 100 && <AlertTriangle size={14} strokeWidth={1.8} />}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ══ 2. CARDS DE HEREDEROS ══ */}
        {herederos.length === 0 ? (
          <div className="her-empty fade-up">
            <Users size={48} strokeWidth={1.2} />
            <h3>Aún no tenés herederos designados</h3>
            <p>Designá las personas que van a continuar tu legado y tendrán acceso a tu bóveda.</p>
            <button className="her-empty__btn" onClick={() => setDrawerAbierto(true)}>
              <Plus size={16} strokeWidth={2} />
              Agregar primer heredero
            </button>
          </div>
        ) : (
          <div className="her-cards fade-up" style={{ animationDelay: '0.08s' }}>
            {herederos.map((h, idx) => {
              const condCfg = CONDICION_CONFIG[h.condicion];
              return (
                <div key={h.id} className="her-card">

                  {/* ── Card header ── */}
                  <div className="her-card__header">
                    <img src={h.avatar} alt={h.nombre} className="her-card__avatar" />
                    <div className="her-card__info">
                      <h3 className="her-card__nombre">{h.nombre} {h.apellido}</h3>
                      <span className="her-card__relacion">{h.relacion}</span>
                      <span className="her-card__email">{h.email}</span>
                    </div>
                    <div className="her-card__acciones">
                      <button
                        className="her-card__toggle"
                        onClick={() => actualizar(h.id, 'expandido', !h.expandido)}
                      >
                        <ChevronDown
                          size={18} strokeWidth={1.8}
                          style={{ transform: h.expandido ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}
                        />
                      </button>
                      <button
                        className="her-card__eliminar"
                        onClick={() => eliminarHeredero(h.id)}
                      >
                        <Trash2 size={15} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>

                  {/* ── Barra de porcentaje ── */}
                  <div className="her-card__pct-wrap">
                    <div className="her-card__pct-header">
                      <span>Porcentaje de herencia</span>
                      <strong>{h.porcentaje}%</strong>
                    </div>
                    <div className="her-card__pct-track">
                      <div
                        className="her-card__pct-fill"
                        style={{ width: `${h.porcentaje}%` }}
                      />
                    </div>
                    <input
                      type="range" min={0} max={100} value={h.porcentaje}
                      className="her-card__pct-slider"
                      style={{ '--pct': `${h.porcentaje}%` } as React.CSSProperties}
                      onChange={e => actualizar(h.id, 'porcentaje', parseInt(e.target.value))}
                    />
                  </div>

                  {/* ── Condición de acceso ── */}
                  <div className="her-card__condicion-wrap">
                    <span className="her-card__condicion-label">Condición de acceso</span>
                    <div className="her-card__condiciones">
                      {(Object.keys(CONDICION_CONFIG) as Condicion[]).map(c => (
                        <button
                          key={c}
                          className={`her-condicion-btn${h.condicion === c ? ' active' : ''}`}
                          style={h.condicion === c
                            ? { background: condCfg.bg, color: condCfg.color, borderColor: condCfg.color }
                            : {}
                          }
                          onClick={() => actualizar(h.id, 'condicion', c)}
                        >
                          {c === 'inmediato'     && <Check         size={12} strokeWidth={2.5} />}
                          {c === 'verificacion'  && <Shield        size={12} strokeWidth={2} />}
                          {c === 'fallecimiento' && <Clock         size={12} strokeWidth={2} />}
                          {CONDICION_CONFIG[c].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Contenido expandible ── */}
                  {h.expandido && (
                    <div className="her-card__expandido">

                      {/* Accesos por sección */}
                      <div className="her-card__accesos">
                        <h4 className="her-card__seccion-titulo">
                          <Shield size={14} strokeWidth={1.8} />
                          Secciones con acceso
                        </h4>
                        <div className="her-card__accesos-grid">
                          {SECCIONES_ACCESO.map(s => (
                            <div key={s.key} className="her-acceso-item">
                              <div className="her-acceso-item__left">
                                <span className={`her-acceso-item__icono${h.acceso[s.key as keyof AccesoSeccion] ? ' on' : ''}`}>
                                  {s.icono}
                                </span>
                                <span className="her-acceso-item__label">{s.label}</span>
                              </div>
                              <div
                                className={`her-toggle${h.acceso[s.key as keyof AccesoSeccion] ? ' on' : ''}`}
                                onClick={() => actualizarAcceso(h.id, s.key as keyof AccesoSeccion, !h.acceso[s.key as keyof AccesoSeccion])}
                              >
                                <div className="her-toggle__thumb" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Carta personal */}
                      <div className="her-card__carta">
                        <div className="her-card__carta-header">
                          <h4 className="her-card__seccion-titulo">
                            <Edit3 size={14} strokeWidth={1.8} />
                            Carta personal para {h.nombre}
                          </h4>
                          <button
                            className="her-card__carta-toggle"
                            onClick={() => actualizar(h.id, 'cartaAbierta', !h.cartaAbierta)}
                          >
                            {h.cartaAbierta ? 'Cerrar' : h.cartaLibre ? 'Editar' : 'Escribir'}
                            <ChevronRight
                              size={14} strokeWidth={1.8}
                              style={{ transform: h.cartaAbierta ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
                            />
                          </button>
                        </div>

                        {h.cartaAbierta && (
                          <div className="her-carta-editor">
                            {/* Preguntas guía */}
                            <div className="her-carta-guias">
                              <span className="her-carta-guias__label">
                                <Sparkles size={12} strokeWidth={1.8} />
                                Preguntas guía
                              </span>
                              <div className="her-carta-guias__btns">
                                {PREGUNTAS_GUIA.map(p => (
                                  <button
                                    key={p}
                                    className="her-carta-guia-btn"
                                    onClick={() => insertarPregunta(h.id, p)}
                                  >
                                    + {p}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <textarea
                              className="her-carta-textarea"
                              placeholder={`Querido/a ${h.nombre}...\n\nEscribí lo que querés que sepa de vos, tus consejos, tus sueños para él/ella...`}
                              value={h.cartaLibre}
                              rows={8}
                              onChange={e => actualizar(h.id, 'cartaLibre', e.target.value)}
                            />
                            <div className="her-carta-footer">
                              <span className="her-carta-footer__count">{h.cartaLibre.length} caracteres</span>
                              <button
                                className="her-carta-footer__guardar"
                                onClick={() => {
                                  actualizar(h.id, 'cartaAbierta', false);
                                  showToast(`✓ Carta para ${h.nombre} guardada`);
                                }}
                              >
                                <Save size={14} strokeWidth={1.8} />
                                Guardar carta
                              </button>
                            </div>
                          </div>
                        )}

                        {!h.cartaAbierta && h.cartaLibre && (
                          <p className="her-carta-preview">
                            "{h.cartaLibre.slice(0, 120)}{h.cartaLibre.length > 120 ? '...' : ''}"
                          </p>
                        )}

                        {!h.cartaAbierta && !h.cartaLibre && (
                          <p className="her-carta-vacia">
                            Aún no escribiste una carta para {h.nombre}. Es uno de los regalos más importantes que podés dejarle.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ 3. CARTA DE INSTRUCCIONES ⭐ ══ */}
        <div className="her-instrucciones fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="her-instrucciones__header">
            <div className="her-instrucciones__icono">
              <BookOpen size={24} strokeWidth={1.4} />
            </div>
            <div>
              <h3 className="her-instrucciones__titulo">Carta de Instrucciones</h3>
              <p className="her-instrucciones__sub">
                Un documento generado automáticamente con todo lo que tus herederos necesitan saber
              </p>
            </div>
            <button
              className="her-instrucciones__btn"
              onClick={() => setCartaInstrucciones(true)}
            >
              Ver
              <ChevronRight size={15} strokeWidth={1.8} />
            </button>
          </div>

          <div className="her-instrucciones__preview">
            {[
              '📍 Dónde están tus activos y documentos',
              '🔑 Cómo acceder a cada sección de la bóveda',
              '📞 Contactos importantes (abogado, contador)',
              '📋 Qué hacer primero en caso de emergencia',
              '💌 Tus deseos y voluntades expresas',
            ].map(item => (
              <div key={item} className="her-instrucciones__item">
                <Check size={12} strokeWidth={2.5} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ 4. BOTÓN AGREGAR ══ */}
        <button
          className="her-btn-agregar fade-up"
          style={{ animationDelay: '0.2s' }}
          onClick={() => setDrawerAbierto(true)}
        >
          <Plus size={18} strokeWidth={2} />
          Agregar nuevo heredero
        </button>

      </main>

      {/* ════ DRAWER — Agregar heredero ════ */}
      {drawerAbierto && (
        <div className="her-overlay" onClick={() => setDrawerAbierto(false)}>
          <aside className="her-drawer" onClick={e => e.stopPropagation()}>

            <div className="her-drawer__header">
              <h3>Nuevo heredero</h3>
              <button onClick={() => setDrawerAbierto(false)}>
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            <div className="her-drawer__body">
              <div className="her-drawer__grupo">
                <label>Nombre *</label>
                <input
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Sofía"
                />
              </div>
              <div className="her-drawer__grupo">
                <label>Apellido</label>
                <input
                  value={nuevoApellido}
                  onChange={e => setNuevoApellido(e.target.value)}
                  placeholder="Ej: García"
                />
              </div>
              <div className="her-drawer__grupo">
                <label>Email *</label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={e => setNuevoEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="her-drawer__grupo">
                <label>Relación</label>
                <select
                  value={nuevoRelacion}
                  onChange={e => setNuevoRelacion(e.target.value as Relacion)}
                >
                  {RELACIONES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="her-drawer__grupo">
                <label>Porcentaje de herencia: <strong>{nuevoPct}%</strong></label>
                <input
                  type="range" min={0} max={100} value={nuevoPct}
                  className="her-card__pct-slider"
                  style={{ '--pct': `${nuevoPct}%` } as React.CSSProperties}
                  onChange={e => setNuevoPct(parseInt(e.target.value))}
                />
                {totalPct + nuevoPct > 100 && (
                  <p className="her-drawer__aviso">
                    <AlertTriangle size={12} strokeWidth={1.8} />
                    El total superaría el 100% ({totalPct + nuevoPct}%)
                  </p>
                )}
              </div>
            </div>

            <div className="her-drawer__footer">
              <button className="her-drawer__cancelar" onClick={() => setDrawerAbierto(false)}>
                Cancelar
              </button>
              <button className="her-drawer__guardar" onClick={agregarHeredero}>
                <Plus size={15} strokeWidth={2} />
                Agregar heredero
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ════ MODAL — Carta de instrucciones ════ */}
      {cartaInstrucciones && (
        <div className="her-overlay" onClick={() => setCartaInstrucciones(false)}>
          <div className="her-carta-modal" onClick={e => e.stopPropagation()}>
            <div className="her-carta-modal__header">
              <div>
                <span className="her-carta-modal__eyebrow">Life's · Documento generado automáticamente</span>
                <h3>Carta de Instrucciones</h3>
              </div>
              <button onClick={() => setCartaInstrucciones(false)}>
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="her-carta-modal__body">
              <div className="her-carta-modal__intro">
                <p>
                  Este documento fue preparado por <strong>Marcelo García</strong> para guiar a sus herederos
                  en caso de un evento inesperado. Contiene todo lo que necesitan saber para actuar con claridad.
                </p>
              </div>

              {[
                {
                  titulo: '1. Mis herederos designados',
                  icono: <Users size={16} strokeWidth={1.8} />,
                  contenido: herederos.map(h =>
                    `• ${h.nombre} ${h.apellido} (${h.relacion}) — ${h.porcentaje}% — ${h.email}`
                  ).join('\n') || 'Aún no designaste herederos.',
                },
                {
                  titulo: '2. Dónde están mis activos',
                  icono: <Coins size={16} strokeWidth={1.8} />,
                  contenido: `• Caja de Valores: accesible desde /caja-de-valores con PIN de bóveda\n• Documentos vitales: carpeta "Documentos" en la bóveda\n• Testamento digital: sección Testamento de la bóveda`,
                },
                {
                  titulo: '3. Cómo acceder a la bóveda',
                  icono: <Shield size={16} strokeWidth={1.8} />,
                  contenido: `• Ingresar a lifes.app con el email registrado\n• Completar triple seguridad: PIN + biometría + QR\n• En caso de no poder acceder, contactar a soporte@lifes.app`,
                },
                {
                  titulo: '4. Qué hacer primero',
                  icono: <AlertTriangle size={16} strokeWidth={1.8} />,
                  contenido: `1. Leer el testamento digital\n2. Contactar al abogado\n3. Revisar la Caja de Valores\n4. Ver el video de último tributo\n5. Leer las cartas personales`,
                },
                {
                  titulo: '5. Mis deseos expresos',
                  icono: <Heart size={16} strokeWidth={1.8} />,
                  contenido: `• Que este legado sea un puente entre generaciones\n• Que cada recuerdo guardado en Life's sea compartido con amor\n• Que cuiden de los más pequeños de la familia`,
                },
              ].map(s => (
                <div key={s.titulo} className="her-carta-modal__seccion">
                  <h4 className="her-carta-modal__sec-titulo">
                    {s.icono}
                    {s.titulo}
                  </h4>
                  <pre className="her-carta-modal__sec-contenido">{s.contenido}</pre>
                </div>
              ))}
            </div>

            <div className="her-carta-modal__footer">
              <button className="her-carta-modal__imprimir" onClick={() => showToast('🖨️ Preparando PDF...')}>
                <FileText size={15} strokeWidth={1.8} />
                Descargar PDF
              </button>
              <button className="her-carta-modal__cerrar" onClick={() => setCartaInstrucciones(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="her-toast">
          <Check size={13} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
