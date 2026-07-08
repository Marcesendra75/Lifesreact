// ============================================================
// LIFE'S — Testamento.tsx | Testamento Digital
// API Anthropic | Acordeón | Lucide React | SCSS | with-navbar
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronDown, Save, Sparkles, X,
  FileText, Users, Home, Monitor, Mail, Heart,
  Shield, AlertCircle, Check, Send, Bot, Loader,
  Scale, PlusCircle, Trash2, Eye, EyeOff,
} from 'lucide-react';
import './Testamento.scss';

// ── Tipos ──────────────────────────────────────────────────
interface Bien {
  id: string;
  descripcion: string;
  tipo: 'propiedad' | 'cuenta' | 'objeto' | 'otro';
  destinatario: string;
}

interface ActivoDigital {
  id: string;
  plataforma: string;
  usuario: string;
  instruccion: 'transferir' | 'eliminar' | 'mantener';
  destinatario?: string;
}

interface MensajeFinal {
  id: string;
  destinatario: string;
  relacion: string;
  mensaje: string;
}

interface SeccionTestamento {
  id: string;
  titulo: string;
  icono: React.ReactNode;
  completado: boolean;
}

// ── Secciones del testamento ───────────────────────────────
const SECCIONES: SeccionTestamento[] = [
  { id: 'voluntades',  titulo: 'Voluntades generales',    icono: <FileText size={20} strokeWidth={1.8} />, completado: false },
  { id: 'ejecutor',   titulo: 'Ejecutor testamentario',   icono: <Users    size={20} strokeWidth={1.8} />, completado: false },
  { id: 'bienes',     titulo: 'Bienes y activos',         icono: <Home     size={20} strokeWidth={1.8} />, completado: false },
  { id: 'digitales',  titulo: 'Activos digitales',        icono: <Monitor  size={20} strokeWidth={1.8} />, completado: false },
  { id: 'mensajes',   titulo: 'Mensajes finales',         icono: <Mail     size={20} strokeWidth={1.8} />, completado: false },
  { id: 'medicas',    titulo: 'Voluntades médicas',       icono: <Heart    size={20} strokeWidth={1.8} />, completado: false },
];

// ── Preguntas guía por sección ─────────────────────────────
const PREGUNTAS_GUIA: Record<string, string[]> = {
  voluntades: [
    '¿Cuáles son tus deseos principales para tu legado?',
    '¿Hay algo que querés que se haga o no se haga con tus pertenencias?',
    '¿Tenés deseos sobre tu velatorio o funeral?',
  ],
  ejecutor: [
    '¿Quién es la persona de más confianza para administrar tu legado?',
    '¿Tiene experiencia con trámites legales o financieros?',
    '¿Hay un ejecutor alternativo en caso de que el principal no pueda?',
  ],
  bienes: [
    '¿Cuáles son las propiedades más importantes que querés dejar?',
    '¿Tenés cuentas bancarias o inversiones a distribuir?',
    '¿Hay objetos de valor sentimental que querés que reciba alguien específico?',
  ],
  digitales: [
    '¿Qué plataformas y cuentas son más importantes para tu familia?',
    '¿Qué querés que pase con tus redes sociales?',
    '¿Tenés cripto u otros activos digitales de valor?',
  ],
  mensajes: [
    '¿A quién querés escribirle una carta final?',
    '¿Qué querés que recuerde de vos esa persona?',
    '¿Hay algo que nunca le dijiste y querés que sepa?',
  ],
  medicas: [
    '¿Querés que se tomen medidas extraordinarias para prolongar tu vida?',
    '¿Quién debe tomar decisiones médicas si vos no podés?',
    '¿Tenés deseos sobre donación de órganos?',
  ],
};

// ── Componente ─────────────────────────────────────────────
export default function Testamento() {
  const navigate = useNavigate();

  // Estado acordeón
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>('voluntades');
  const [completados, setCompletados]       = useState<Record<string, boolean>>({});

  // Contenido secciones
  const [voluntades,  setVoluntades]  = useState('');
  const [ejecutorNombre, setEjecutorNombre] = useState('');
  const [ejecutorRelacion, setEjecutorRelacion] = useState('');
  const [ejecutorEmail, setEjecutorEmail] = useState('');
  const [ejecutorAlt, setEjecutorAlt]   = useState('');
  const [bienes, setBienes]             = useState<Bien[]>([]);
  const [digitales, setDigitales]       = useState<ActivoDigital[]>([]);
  const [mensajes, setMensajes]         = useState<MensajeFinal[]>([]);
  const [medicas, setMedicas]           = useState({
    medidas: '',
    tutor: '',
    organos: false,
    instrucciones: '',
  });

  // IA asistente
  const [iaAbierta,     setIaAbierta]     = useState(false);
  const [iaSeccion,     setIaSeccion]     = useState('');
  const [iaMensajes,    setIaMensajes]    = useState<{rol:string;texto:string}[]>([]);
  const [iaInput,       setIaInput]       = useState('');
  const [iaCargando,    setIaCargando]    = useState(false);

  // Visibilidad passwords
  const [mostrarClave,  setMostrarClave]  = useState<Record<string, boolean>>({});

  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Calcular completitud
  const pctCompletitud = () => {
    let pts = 0;
    if (voluntades.trim().length > 50)  pts++;
    if (ejecutorNombre.trim())           pts++;
    if (bienes.length > 0)              pts++;
    if (digitales.length > 0)           pts++;
    if (mensajes.length > 0)            pts++;
    if (medicas.tutor.trim())           pts++;
    return Math.round((pts / 6) * 100);
  };

  const marcarCompletado = (id: string) => {
    setCompletados(prev => ({ ...prev, [id]: true }));
    showToast('✓ Sección guardada');
  };

  // ── BIENES ──
  const agregarBien = () => {
    setBienes(prev => [...prev, { id: Date.now().toString(), descripcion: '', tipo: 'propiedad', destinatario: '' }]);
  };
  const actualizarBien = (id: string, campo: keyof Bien, valor: string) => {
    setBienes(prev => prev.map(b => b.id === id ? { ...b, [campo]: valor } : b));
  };
  const eliminarBien = (id: string) => setBienes(prev => prev.filter(b => b.id !== id));

  // ── DIGITALES ──
  const agregarDigital = () => {
    setDigitales(prev => [...prev, { id: Date.now().toString(), plataforma: '', usuario: '', instruccion: 'transferir' }]);
  };
  const actualizarDigital = (id: string, campo: keyof ActivoDigital, valor: string) => {
    setDigitales(prev => prev.map(d => d.id === id ? { ...d, [campo]: valor } : d));
  };
  const eliminarDigital = (id: string) => setDigitales(prev => prev.filter(d => d.id !== id));

  // ── MENSAJES ──
  const agregarMensaje = () => {
    setMensajes(prev => [...prev, { id: Date.now().toString(), destinatario: '', relacion: '', mensaje: '' }]);
  };
  const actualizarMensaje = (id: string, campo: keyof MensajeFinal, valor: string) => {
    setMensajes(prev => prev.map(m => m.id === id ? { ...m, [campo]: valor } : m));
  };
  const eliminarMensaje = (id: string) => setMensajes(prev => prev.filter(m => m.id !== id));

  // ── ASISTENTE IA ──
  const abrirIA = (seccionId: string) => {
    const sec = SECCIONES.find(s => s.id === seccionId);
    setIaSeccion(sec?.titulo || '');
    setIaMensajes([{
      rol: 'ia',
      texto: `Hola, soy el Asistente de Life's. Voy a ayudarte a redactar la sección "${sec?.titulo}". Para comenzar, ${PREGUNTAS_GUIA[seccionId]?.[0] || '¿qué querés incluir en esta sección?'}`,
    }]);
    setIaAbierta(true);
  };

  const enviarIA = async () => {
    if (!iaInput.trim()) return;
    const nuevoMsg = { rol: 'usuario', texto: iaInput.trim() };
    setIaMensajes(prev => [...prev, nuevoMsg]);
    setIaInput('');
    setIaCargando(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: `Sos el Asistente de Testamento Digital de Life's. Ayudás a las personas a redactar sus voluntades y disposiciones testamentarias de forma clara, emotiva y organizada. 
Estás ayudando a completar la sección: "${iaSeccion}".
Tus respuestas deben ser cálidas, empáticas y en español argentino.
Hacé preguntas de seguimiento para obtener más detalle.
Cuando tengas suficiente información, ofrecé redactar el texto para esa sección.
Máximo 3 párrafos cortos por respuesta.`,
          messages: [
            ...iaMensajes.map(m => ({
              role: m.rol === 'usuario' ? 'user' : 'assistant',
              content: m.texto,
            })),
            { role: 'user', content: iaInput.trim() },
          ],
        }),
      });
      const data = await response.json();
      const respuesta = data.content?.[0]?.text || 'No pude procesar tu respuesta.';
      setIaMensajes(prev => [...prev, { rol: 'ia', texto: respuesta }]);
    } catch {
      setIaMensajes(prev => [...prev, { rol: 'ia', texto: 'Tuve un problema. Intentá de nuevo.' }]);
    } finally {
      setIaCargando(false);
    }
  };

  const pct = pctCompletitud();

  return (
    <div className="test-page with-navbar">

      {/* ── HEADER ── */}
      <header className="test-header">
        <div className="test-header__left">
          <button className="test-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="test-header__title">Testamento Digital</h1>
            <p className="test-header__sub">Tus voluntades, protegidas para siempre</p>
          </div>
        </div>
        <button className="test-header__guardar" onClick={() => showToast('✓ Testamento guardado')}>
          <Save size={16} strokeWidth={2} />
          Guardar
        </button>
      </header>

      <main className="test-main">

        {/* ══ HERO ══ */}
        <div className="test-hero fade-up">
          <div className="test-hero__bg" />
          <div className="test-hero__inner">
            <div className="test-hero__top">
              <div className="test-hero__icono">
                <Scale size={28} strokeWidth={1.4} />
              </div>
              <div>
                <span className="test-hero__eyebrow">Bóveda del Legado</span>
                <h2 className="test-hero__titulo">Testamento de Marcelo García</h2>
                <p className="test-hero__fecha">
                  Última actualización: {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Barra de completitud */}
            <div className="test-hero__prog-wrap">
              <div className="test-hero__prog-header">
                <span>Completitud del testamento</span>
                <span className="test-hero__prog-pct">{pct}%</span>
              </div>
              <div className="test-prog-track">
                <div className="test-prog-fill" style={{ width: `${pct}%` }} />
              </div>
              {pct < 100 && (
                <p className="test-hero__prog-hint">
                  {pct === 0
                    ? 'Empezá por las voluntades generales'
                    : `Completá ${6 - Object.keys(completados).length} secciones más para proteger tu legado al 100%`
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ══ ACORDEÓN DE SECCIONES ══ */}
        <div className="test-acordeon fade-up" style={{ animationDelay: '0.08s' }}>
          {SECCIONES.map((sec, idx) => {
            const abierta = seccionAbierta === sec.id;
            const hecha   = completados[sec.id];

            return (
              <div
                key={sec.id}
                className={`test-seccion${abierta ? ' test-seccion--abierta' : ''}${hecha ? ' test-seccion--hecha' : ''}`}
                style={{ animationDelay: `${0.08 + idx * 0.04}s` }}
              >
                {/* Header acordeón */}
                <button
                  className="test-seccion__header"
                  onClick={() => setSeccionAbierta(abierta ? null : sec.id)}
                >
                  <div className="test-seccion__icono-wrap">
                    {hecha
                      ? <Check size={18} strokeWidth={2.5} />
                      : sec.icono
                    }
                  </div>
                  <span className="test-seccion__titulo">{sec.titulo}</span>
                  <div className="test-seccion__header-right">
                    {hecha && <span className="test-seccion__hecha-badge">Completa</span>}
                    <ChevronDown
                      size={18} strokeWidth={1.8}
                      className="test-seccion__chevron"
                      style={{ transform: abierta ? 'rotate(180deg)' : 'none' }}
                    />
                  </div>
                </button>

                {/* Contenido acordeón */}
                {abierta && (
                  <div className="test-seccion__body">

                    {/* Botón asistente IA */}
                    <button
                      className="test-ia-btn"
                      onClick={() => abrirIA(sec.id)}
                    >
                      <Sparkles size={15} strokeWidth={1.8} />
                      ¿Querés que te ayude a redactar esta sección?
                      <span className="test-ia-btn__badge">IA</span>
                    </button>

                    {/* ── VOLUNTADES GENERALES ── */}
                    {sec.id === 'voluntades' && (
                      <div className="test-campo-wrap">
                        <label className="test-label">Mis voluntades y disposiciones</label>
                        <textarea
                          className="test-textarea test-textarea--serif"
                          rows={8}
                          placeholder="Escribí tus deseos, disposiciones y todo aquello que querés que tu familia sepa y respete. Podés incluir deseos sobre el funeral, cómo repartir recuerdos, qué hacer con tu legado digital..."
                          value={voluntades}
                          onChange={e => setVoluntades(e.target.value)}
                        />
                        <span className="test-contador">{voluntades.length} caracteres</span>
                      </div>
                    )}

                    {/* ── EJECUTOR ── */}
                    {sec.id === 'ejecutor' && (
                      <div className="test-campo-wrap">
                        <div className="test-grid-2">
                          <div className="test-campo">
                            <label className="test-label">Nombre del ejecutor *</label>
                            <input className="test-input" placeholder="Nombre completo"
                              value={ejecutorNombre} onChange={e => setEjecutorNombre(e.target.value)} />
                          </div>
                          <div className="test-campo">
                            <label className="test-label">Relación</label>
                            <select className="test-input" value={ejecutorRelacion}
                              onChange={e => setEjecutorRelacion(e.target.value)}>
                              <option value="">Seleccioná</option>
                              {['Cónyuge','Hijo/a','Hermano/a','Amigo/a de confianza','Abogado','Contador'].map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="test-campo">
                          <label className="test-label">Email de contacto</label>
                          <input className="test-input" type="email" placeholder="email@ejemplo.com"
                            value={ejecutorEmail} onChange={e => setEjecutorEmail(e.target.value)} />
                        </div>
                        <div className="test-campo">
                          <label className="test-label">Ejecutor alternativo (opcional)</label>
                          <input className="test-input" placeholder="En caso de que el principal no pueda"
                            value={ejecutorAlt} onChange={e => setEjecutorAlt(e.target.value)} />
                        </div>
                        <div className="test-hint-box">
                          <AlertCircle size={14} strokeWidth={1.8} />
                          <p>El ejecutor será quien administre tu legado. Asegurate de haberlo consultado previamente.</p>
                        </div>
                      </div>
                    )}

                    {/* ── BIENES Y ACTIVOS ── */}
                    {sec.id === 'bienes' && (
                      <div className="test-campo-wrap">
                        {bienes.map(b => (
                          <div key={b.id} className="test-item-card">
                            <div className="test-grid-2">
                              <div className="test-campo">
                                <label className="test-label">Tipo</label>
                                <select className="test-input" value={b.tipo}
                                  onChange={e => actualizarBien(b.id, 'tipo', e.target.value)}>
                                  <option value="propiedad">🏠 Propiedad</option>
                                  <option value="cuenta">🏦 Cuenta bancaria</option>
                                  <option value="objeto">💎 Objeto de valor</option>
                                  <option value="otro">📦 Otro</option>
                                </select>
                              </div>
                              <div className="test-campo">
                                <label className="test-label">Destinatario</label>
                                <input className="test-input" placeholder="¿A quién va?"
                                  value={b.destinatario} onChange={e => actualizarBien(b.id, 'destinatario', e.target.value)} />
                              </div>
                            </div>
                            <div className="test-campo">
                              <label className="test-label">Descripción</label>
                              <input className="test-input"
                                placeholder="Ej: Casa en Mendoza, calle San Martín 1234"
                                value={b.descripcion} onChange={e => actualizarBien(b.id, 'descripcion', e.target.value)} />
                            </div>
                            <button className="test-eliminar" onClick={() => eliminarBien(b.id)}>
                              <Trash2 size={14} strokeWidth={1.8} /> Eliminar
                            </button>
                          </div>
                        ))}
                        <button className="test-agregar-btn" onClick={agregarBien}>
                          <PlusCircle size={16} strokeWidth={1.8} />
                          Agregar bien o activo
                        </button>
                      </div>
                    )}

                    {/* ── ACTIVOS DIGITALES ── */}
                    {sec.id === 'digitales' && (
                      <div className="test-campo-wrap">
                        <div className="test-hint-box test-hint-box--ambar">
                          <Shield size={14} strokeWidth={1.8} />
                          <p>Esta información está cifrada y solo accesible con triple seguridad. No incluyas contraseñas en texto plano — usá instrucciones de acceso.</p>
                        </div>
                        {digitales.map(d => (
                          <div key={d.id} className="test-item-card">
                            <div className="test-grid-2">
                              <div className="test-campo">
                                <label className="test-label">Plataforma / Servicio</label>
                                <input className="test-input" placeholder="Ej: Gmail, Instagram, Binance"
                                  value={d.plataforma} onChange={e => actualizarDigital(d.id, 'plataforma', e.target.value)} />
                              </div>
                              <div className="test-campo">
                                <label className="test-label">Usuario / Email</label>
                                <div className="test-input-icon-wrap">
                                  <input className="test-input" placeholder="usuario@email.com"
                                    type={mostrarClave[d.id] ? 'text' : 'password'}
                                    value={d.usuario} onChange={e => actualizarDigital(d.id, 'usuario', e.target.value)} />
                                  <button className="test-toggle-vis" onClick={() => setMostrarClave(prev => ({ ...prev, [d.id]: !prev[d.id] }))}>
                                    {mostrarClave[d.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="test-grid-2">
                              <div className="test-campo">
                                <label className="test-label">Instrucción</label>
                                <select className="test-input" value={d.instruccion}
                                  onChange={e => actualizarDigital(d.id, 'instruccion', e.target.value)}>
                                  <option value="transferir">Transferir a heredero</option>
                                  <option value="eliminar">Eliminar la cuenta</option>
                                  <option value="mantener">Mantener como memorial</option>
                                </select>
                              </div>
                              {d.instruccion === 'transferir' && (
                                <div className="test-campo">
                                  <label className="test-label">Destinatario</label>
                                  <input className="test-input" placeholder="¿A quién?"
                                    value={d.destinatario || ''} onChange={e => actualizarDigital(d.id, 'destinatario', e.target.value)} />
                                </div>
                              )}
                            </div>
                            <button className="test-eliminar" onClick={() => eliminarDigital(d.id)}>
                              <Trash2 size={14} strokeWidth={1.8} /> Eliminar
                            </button>
                          </div>
                        ))}
                        <button className="test-agregar-btn" onClick={agregarDigital}>
                          <PlusCircle size={16} strokeWidth={1.8} />
                          Agregar activo digital
                        </button>
                      </div>
                    )}

                    {/* ── MENSAJES FINALES ── */}
                    {sec.id === 'mensajes' && (
                      <div className="test-campo-wrap">
                        <p className="test-desc">
                          Escribí una carta personal para cada persona que querés que reciba un mensaje tuyo. Se entregará automáticamente cuando tus herederos accedan a la bóveda.
                        </p>
                        {mensajes.map(m => (
                          <div key={m.id} className="test-item-card test-item-card--carta">
                            <div className="test-grid-2">
                              <div className="test-campo">
                                <label className="test-label">Destinatario</label>
                                <input className="test-input" placeholder="Nombre"
                                  value={m.destinatario} onChange={e => actualizarMensaje(m.id, 'destinatario', e.target.value)} />
                              </div>
                              <div className="test-campo">
                                <label className="test-label">Relación</label>
                                <input className="test-input" placeholder="Hijo/a, Pareja..."
                                  value={m.relacion} onChange={e => actualizarMensaje(m.id, 'relacion', e.target.value)} />
                              </div>
                            </div>
                            <div className="test-campo">
                              <label className="test-label">Carta</label>
                              <textarea className="test-textarea test-textarea--serif" rows={5}
                                placeholder={`Querido/a ${m.destinatario || '...'}...\n\nEscribí lo que querés que sepa de vos.`}
                                value={m.mensaje} onChange={e => actualizarMensaje(m.id, 'mensaje', e.target.value)} />
                            </div>
                            <button className="test-eliminar" onClick={() => eliminarMensaje(m.id)}>
                              <Trash2 size={14} strokeWidth={1.8} /> Eliminar carta
                            </button>
                          </div>
                        ))}
                        <button className="test-agregar-btn" onClick={agregarMensaje}>
                          <PlusCircle size={16} strokeWidth={1.8} />
                          Escribir nueva carta
                        </button>
                      </div>
                    )}

                    {/* ── VOLUNTADES MÉDICAS ── */}
                    {sec.id === 'medicas' && (
                      <div className="test-campo-wrap">
                        <div className="test-campo">
                          <label className="test-label">Medidas de soporte vital</label>
                          <select className="test-input" value={medicas.medidas}
                            onChange={e => setMedicas(prev => ({ ...prev, medidas: e.target.value }))}>
                            <option value="">Seleccioná tu deseo</option>
                            <option value="si">Sí, quiero todas las medidas posibles</option>
                            <option value="no">No, prefiero no medidas extraordinarias</option>
                            <option value="selectivo">Solo en caso de posible recuperación</option>
                            <option value="familiar">Lo dejo a criterio de mi familia</option>
                          </select>
                        </div>
                        <div className="test-campo">
                          <label className="test-label">Tutor de decisiones médicas</label>
                          <input className="test-input"
                            placeholder="Nombre de quien tomará decisiones si vos no podés"
                            value={medicas.tutor} onChange={e => setMedicas(prev => ({ ...prev, tutor: e.target.value }))} />
                        </div>
                        <div className="test-toggle-campo">
                          <div>
                            <span className="test-label">Donación de órganos</span>
                            <p className="test-toggle-desc">Autorizo la donación de mis órganos tras mi fallecimiento</p>
                          </div>
                          <div
                            className={`test-toggle${medicas.organos ? ' on' : ''}`}
                            onClick={() => setMedicas(prev => ({ ...prev, organos: !prev.organos }))}
                          >
                            <div className="test-toggle__thumb" />
                          </div>
                        </div>
                        <div className="test-campo">
                          <label className="test-label">Instrucciones adicionales</label>
                          <textarea className="test-textarea" rows={4}
                            placeholder="Cualquier instrucción médica específica que querés dejar registrada..."
                            value={medicas.instrucciones}
                            onChange={e => setMedicas(prev => ({ ...prev, instrucciones: e.target.value }))} />
                        </div>
                      </div>
                    )}

                    {/* Footer de sección */}
                    <div className="test-seccion__footer">
                      <button className="test-seccion__guardar" onClick={() => marcarCompletado(sec.id)}>
                        <Check size={15} strokeWidth={2} />
                        Marcar sección como completa
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ══ AVISO LEGAL ══ */}
        <div className="test-aviso-legal fade-up" style={{ animationDelay: '0.25s' }}>
          <Scale size={20} strokeWidth={1.6} />
          <div>
            <h4>Aviso legal importante</h4>
            <p>
              Este testamento digital es un documento de voluntades personales dentro de Life's.
              <strong> No reemplaza a un testamento notarial.</strong> Para que tenga validez legal completa,
              te recomendamos acompañarlo con asesoramiento de un abogado o escribano matriculado.
              Life's actúa como repositorio seguro de tus voluntades, no como entidad legal.
            </p>
          </div>
        </div>

      </main>

      {/* ════ MODAL ASISTENTE IA ════ */}
      {iaAbierta && (
        <div className="test-ia-overlay" onClick={() => setIaAbierta(false)}>
          <div className="test-ia-modal" onClick={e => e.stopPropagation()}>

            <div className="test-ia-modal__header">
              <div className="test-ia-modal__titulo">
                <Bot size={18} strokeWidth={1.8} />
                Asistente IA · {iaSeccion}
              </div>
              <button onClick={() => setIaAbierta(false)}>
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <div className="test-ia-chat">
              {iaMensajes.map((m, i) => (
                <div key={i} className={`test-ia-msg test-ia-msg--${m.rol}`}>
                  <div className="test-ia-msg__avatar">
                    {m.rol === 'ia' ? <Bot size={14} strokeWidth={1.8} /> : null}
                  </div>
                  <div className="test-ia-msg__bubble">
                    <p>{m.texto}</p>
                  </div>
                </div>
              ))}
              {iaCargando && (
                <div className="test-ia-msg test-ia-msg--ia">
                  <div className="test-ia-msg__avatar"><Bot size={14} strokeWidth={1.8} /></div>
                  <div className="test-ia-msg__bubble">
                    <Loader size={16} strokeWidth={1.8} className="test-ia-loader" />
                  </div>
                </div>
              )}
            </div>

            <div className="test-ia-modal__input">
              <input
                placeholder="Respondé las preguntas del asistente..."
                value={iaInput}
                onChange={e => setIaInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && enviarIA()}
              />
              <button onClick={enviarIA} disabled={!iaInput.trim() || iaCargando}>
                <Send size={16} strokeWidth={1.8} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="test-toast">
          <Check size={13} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
