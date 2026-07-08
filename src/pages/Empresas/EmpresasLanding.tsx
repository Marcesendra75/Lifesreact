// ============================================================
// LIFE'S — EmpresasLanding.tsx
// Landing + Formulario de solicitud de perfil empresarial
// Lucide React | SCSS | with-navbar
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Shield, Users, GitBranch, TrendingUp,
  Video, Star, Check, ChevronDown, ChevronRight,
  Send, X, ArrowRight, Globe, Trophy, Landmark,
  Sparkles, Lock, BadgeCheck, BarChart3,
} from 'lucide-react';
import './EmpresasLanding.scss';

// ── Tipos ──────────────────────────────────────────────────
type TipoEntidad = 'empresa' | 'gobierno' | 'deporte' | '';

// ── Rubros por categoría ───────────────────────────────────
const RUBROS: Record<string, string[]> = {
  'Medios y Comunicación':  ['Diario / Periódico','Revista','Radio','Canal de TV','Portal digital','Agencia de noticias','Productora audiovisual','Agencia de publicidad','Agencia de PR'],
  'Servicios Financieros':  ['Banco','Fintech','Aseguradora / Broker de seguros','Inmobiliaria','Fondo de inversión','Estudio contable','Estudio jurídico','Cooperativa de crédito'],
  'Salud':                  ['Hospital / Clínica','Farmacéutica','Obra social / Prepaga','Laboratorio','Centro médico','Biotecnología'],
  'Educación':              ['Universidad','Colegio / Instituto','Academia / Capacitación','EdTech','Centro de idiomas','Fundación educativa'],
  'Tecnología':             ['Software / SaaS','Hardware','Startup tecnológica','Agencia digital','Telecomunicaciones','IA / Machine Learning','Ciberseguridad'],
  'Comercio y Servicios':   ['Retail / Comercio','E-commerce','Supermercado / Hipermercado','Shopping / Mall','Franquicia','Gastronomía','Hotelería / Turismo','Logística / Transporte'],
  'Industria':              ['Manufactura','Construcción / Arquitectura','Agroindustria','Minería','Energía / Petróleo','Automotriz','Química / Petroquímica'],
  'Social / Tercer sector': ['ONG','Fundación','Asociación civil','Cooperativa','Sindicato','Partido político','Iglesia / Religioso','Cámara empresarial'],
};

const RUBROS_DEPORTE: Record<string, string[]> = {
  'Deportes colectivos': ['Fútbol','Basketball','Rugby','Hockey','Vóley','Handball','Waterpolo'],
  'Deportes individuales': ['Tenis','Natación','Atletismo','Ciclismo','Boxeo','Artes marciales','Equitación'],
  'Motor':               ['Automovilismo','Motociclismo','Karting'],
  'Instituciones':       ['Club multideportivo','Federación','Asociación deportiva','Liga / Torneo'],
};

const RUBROS_GOBIERNO: Record<string, string[]> = {
  'Nacional':    ['País / Estado nacional','Ministerio','Secretaría de Estado','Organismo público','Poder Judicial','Poder Legislativo'],
  'Provincial':  ['Provincia / Estado','Ministerio provincial','Secretaría provincial'],
  'Municipal':   ['Municipio / Intendencia','Secretaría municipal','Ente municipal'],
  'Internacional':['Embajada / Consulado','Organismo internacional','Unión regional'],
};

// ── Features para empresas ─────────────────────────────────
const FEATURES = [
  { icono: <GitBranch size={24} strokeWidth={1.6} />, titulo: 'Árbol del legado', desc: 'Árbol genealógico de tu organización: fundadores, presidentes, directores y empleados históricos.' },
  { icono: <TrendingUp size={24} strokeWidth={1.6} />, titulo: 'Historia de productos', desc: 'Línea de vida e árbol visual de todos los productos y servicios que lanzó tu empresa.' },
  { icono: <Video size={24} strokeWidth={1.6} />, titulo: 'Archivo multimedia', desc: 'Fotos, videos y documentos históricos organizados por décadas y hitos.' },
  { icono: <Users size={24} strokeWidth={1.6} />, titulo: 'Equipo colaborativo', desc: 'Múltiples usuarios con roles y permisos. Cada área construye su parte del legado.' },
  { icono: <Sparkles size={24} strokeWidth={1.6} />, titulo: 'Historia con IA', desc: 'Nuestra IA redacta la historia institucional a partir de los datos que cargás.' },
  { icono: <BadgeCheck size={24} strokeWidth={1.6} />, titulo: 'Perfil verificado', desc: 'Badge de verificación que garantiza la autenticidad de tu perfil institucional.' },
];

const PLANES = [
  {
    nombre: 'Starter',
    precio: '500',
    periodo: 'año',
    desc: 'Para PyMEs y organizaciones pequeñas',
    color: '#855324',
    features: ['3 usuarios del equipo','5GB almacenamiento','Árbol del legado básico','Perfil verificado','Soporte por email'],
    destacado: false,
  },
  {
    nombre: 'Professional',
    precio: '1.200',
    periodo: 'año',
    desc: 'Para empresas medianas y clubes',
    color: '#C9932A',
    features: ['10 usuarios del equipo','25GB almacenamiento','Árbol del legado completo','Historia de productos','IA para redactar historia','Espacio publicitario básico','Soporte prioritario'],
    destacado: true,
  },
  {
    nombre: 'Enterprise',
    precio: 'A consultar',
    periodo: '',
    desc: 'Para grandes corporaciones y gobierno',
    color: '#03192E',
    features: ['Usuarios ilimitados','Almacenamiento ilimitado','Todo Professional incluido','Árbol de productos premium','Panel administrador avanzado','Log de actividad completo','Account manager dedicado','SLA garantizado'],
    destacado: false,
  },
];

// ── Componente ─────────────────────────────────────────────
export default function EmpresasLanding() {
  const navigate = useNavigate();

  // Estado formulario
  const [tipoEntidad,    setTipoEntidad]    = useState<TipoEntidad>('');
  const [rubroCategoria, setRubroCategoria] = useState('');
  const [rubro,          setRubro]          = useState('');
  const [nombre,         setNombre]         = useState('');
  const [apellido,       setApellido]       = useState('');
  const [cargo,          setCargo]          = useState('');
  const [empresa,        setEmpresa]        = useState('');
  const [pais,           setPais]           = useState('Argentina');
  const [celular,        setCelular]        = useState('');
  const [whatsapp,       setWhatsapp]       = useState('');
  const [email,          setEmail]          = useState('');
  const [cuit,           setCuit]           = useState('');
  const [mensaje,        setMensaje]        = useState('');
  const [nivelVerif,     setNivelVerif]     = useState<1|2>(1);
  const [acordeonAbierto,setAcordeonAbierto]= useState<string | null>(null);
  const [modalExito,     setModalExito]     = useState(false);
  const [errores,        setErrores]        = useState<Record<string,string>>({});

  // Determinar nivel de verificación según tipo
  const handleTipoEntidad = (tipo: TipoEntidad) => {
    setTipoEntidad(tipo);
    setRubroCategoria('');
    setRubro('');
    setNivelVerif(tipo === 'gobierno' ? 2 : 1);
  };

  // Rubros según tipo
  const getRubros = () => {
    if (tipoEntidad === 'deporte')  return RUBROS_DEPORTE;
    if (tipoEntidad === 'gobierno') return RUBROS_GOBIERNO;
    return RUBROS;
  };

  // Validación
  const validar = () => {
    const errs: Record<string,string> = {};
    if (!tipoEntidad)      errs.tipo     = 'Seleccioná el tipo de entidad';
    if (!rubro)            errs.rubro    = 'Seleccioná el rubro';
    if (!nombre.trim())    errs.nombre   = 'Nombre obligatorio';
    if (!apellido.trim())  errs.apellido = 'Apellido obligatorio';
    if (!cargo.trim())     errs.cargo    = 'Cargo obligatorio';
    if (!empresa.trim())   errs.empresa  = 'Nombre de la organización obligatorio';
    if (!email.trim() || !email.includes('@')) errs.email = 'Email corporativo válido requerido';
    if (!celular.trim())   errs.celular  = 'Número de celular obligatorio';
    setErrores(errs);
    return Object.keys(errs).length === 0;
  };

  const enviarSolicitud = () => {
    if (!validar()) return;
    setModalExito(true);
  };

  const tipoConfig = {
    empresa:  { icono: <Building2 size={20} strokeWidth={1.8} />, label: 'Empresa / Organización', color: '#855324' },
    gobierno: { icono: <Landmark  size={20} strokeWidth={1.8} />, label: 'Entidad Gubernamental',  color: '#3a5a8a' },
    deporte:  { icono: <Trophy    size={20} strokeWidth={1.8} />, label: 'Club / Deporte',         color: '#4a7a4e' },
  };

  return (
    <div className="el-page">

      {/* ── HEADER ── */}
      <header className="el-header">
        <div className="el-header__inner">
          <button className="el-header__logo" onClick={() => navigate('/')}>
            <span className="el-header__logo-text">Life's</span>
            <span className="el-header__logo-badge">Empresas</span>
          </button>
          <div className="el-header__nav">
            <button onClick={() => navigate('/')}>Para personas</button>
            <button className="active">Para empresas</button>
          </div>
          <button className="el-header__cta" onClick={() => document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' })}>
            Solicitar perfil
            <ArrowRight size={15} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="el-hero">
        <div className="el-hero__bg" />
        <div className="el-hero__inner">
          <div className="el-hero__badge">
            <Sparkles size={13} strokeWidth={2} />
            Nuevo · Life's para Organizaciones
          </div>
          <h1 className="el-hero__titulo">
            El legado de tu organización,<br />
            <em>preservado para siempre</em>
          </h1>
          <p className="el-hero__desc">
            Creá el perfil institucional de tu empresa, club, municipio o fundación.
            Documentá tu historia, tu gente y tus productos en el archivo digital más completo del mundo .
          </p>
          <div className="el-hero__btns">
            <button
              className="el-hero__btn-primary"
              onClick={() => document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Solicitar perfil verificado
              <ArrowRight size={16} strokeWidth={2} />
            </button>
            <button className="el-hero__btn-secondary" onClick={() => navigate('/empresas/perfil')}>
              Ver ejemplo de perfil
            </button>
          </div>
          <div className="el-hero__tipos">
            {Object.entries(tipoConfig).map(([key, cfg]) => (
              <div key={key} className="el-hero__tipo">
                <span style={{ color: cfg.color }}>{cfg.icono}</span>
                {cfg.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="el-features">
        <div className="el-section-header">
          <span className="el-eyebrow">¿Qué incluye?</span>
          <h2 className="el-titulo-seccion">Todo lo que necesita tu organización</h2>
        </div>
        <div className="el-features-grid">
          {FEATURES.map(f => (
            <div key={f.titulo} className="el-feature-card">
              <div className="el-feature-card__icono">{f.icono}</div>
              <h3 className="el-feature-card__titulo">{f.titulo}</h3>
              <p className="el-feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ VERIFICACIÓN ══ */}
      <section className="el-verificacion">
        <div className="el-verificacion__inner">
          <div className="el-verificacion__texto">
            <span className="el-eyebrow">Seguridad y confianza</span>
            <h2 className="el-titulo-seccion">Sistema de verificación en dos niveles</h2>
            <p>Protegemos los nombres y reputaciones de todas las organizaciones. Ningún perfil se activa sin verificación.</p>
          </div>
          <div className="el-verificacion__niveles">
            <div className="el-nivel-card el-nivel-card--1">
              <div className="el-nivel-card__num">1</div>
              <h4>Verificación automática</h4>
              <p>CUIT/RUT + documentación + email corporativo + WhatsApp. Activación en 48hs.</p>
              <div className="el-nivel-card__para">
                Para: Empresas · Clubes · Fundaciones · ONGs
              </div>
            </div>
            <div className="el-nivel-card el-nivel-card--2">
              <div className="el-nivel-card__num">2</div>
              <h4>Verificación presencial / virtual</h4>
              <p>Reunión por Meet o Zoom con el equipo de Life's. Nunca por teléfono.</p>
              <div className="el-nivel-card__para">
                Para: Gobiernos · Municipios · Clubes de primera división · Empresas +500 empleados
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PLANES ══ */}
      <section className="el-planes" id="planes">
        <div className="el-section-header">
          <span className="el-eyebrow">Precios</span>
          <h2 className="el-titulo-seccion">Planes para cada organización</h2>
          <p className="el-planes__sub">Todos los precios en USD. Facturación anual.</p>
        </div>
        <div className="el-planes-grid">
          {PLANES.map(p => (
            <div
              key={p.nombre}
              className={`el-plan-card${p.destacado ? ' el-plan-card--destacado' : ''}`}
              style={p.destacado ? { borderColor: p.color } : {}}
            >
              {p.destacado && <div className="el-plan-card__popular">Más elegido</div>}
              <h3 className="el-plan-card__nombre" style={{ color: p.color }}>{p.nombre}</h3>
              <p className="el-plan-card__desc">{p.desc}</p>
              <div className="el-plan-card__precio">
                {p.periodo
                  ? <><span className="el-plan-card__monto">${p.precio}</span><span>/{p.periodo}</span></>
                  : <span className="el-plan-card__monto el-plan-card__monto--consultar">{p.precio}</span>
                }
              </div>
              <ul className="el-plan-card__features">
                {p.features.map(f => (
                  <li key={f}>
                    <Check size={14} strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="el-plan-card__btn"
                style={{ background: p.destacado ? p.color : undefined }}
                onClick={() => document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {p.precio === 'A consultar' ? 'Contactar' : 'Solicitar'}
                <ChevronRight size={15} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FORMULARIO DE SOLICITUD ══ */}
      <section className="el-formulario" id="formulario">
        <div className="el-formulario__inner">
          <div className="el-formulario__header">
            <span className="el-eyebrow">Primer paso</span>
            <h2 className="el-titulo-seccion">Solicitá tu perfil verificado</h2>
            <p>Completá el formulario y nos contactaremos a la brevedad para coordinar la verificación.</p>
          </div>

          <div className="el-form-card">

            {/* PASO 1 — Tipo de entidad */}
            <div className="el-form-section">
              <h4 className="el-form-section__titulo">
                <Globe size={16} strokeWidth={1.8} />
                Tipo de entidad
              </h4>
              <div className="el-tipo-btns">
                {(Object.entries(tipoConfig) as [TipoEntidad, typeof tipoConfig[keyof typeof tipoConfig]][]).map(([key, cfg]) => (
                  <button
                    key={key}
                    className={`el-tipo-btn${tipoEntidad === key ? ' active' : ''}`}
                    style={tipoEntidad === key ? { borderColor: cfg.color, color: cfg.color, background: `${cfg.color}0f` } : {}}
                    onClick={() => handleTipoEntidad(key)}
                  >
                    {cfg.icono}
                    {cfg.label}
                  </button>
                ))}
              </div>
              {errores.tipo && <span className="el-error">{errores.tipo}</span>}

              {/* Aviso nivel 2 */}
              {tipoEntidad === 'gobierno' && (
                <div className="el-aviso-nivel2">
                  <Lock size={14} strokeWidth={1.8} />
                  <p>Las entidades gubernamentales requieren verificación manual por Meet o Zoom con el equipo de Life's.</p>
                </div>
              )}
            </div>

            {/* PASO 2 — Rubro (acordeón) */}
            {tipoEntidad && (
              <div className="el-form-section">
                <h4 className="el-form-section__titulo">
                  <BarChart3 size={16} strokeWidth={1.8} />
                  Rubro de la organización
                </h4>
                <div className="el-rubros-acordeon">
                  {Object.entries(getRubros()).map(([categoria, items]) => (
                    <div key={categoria} className={`el-acordeon-item${acordeonAbierto === categoria ? ' abierto' : ''}`}>
                      <button
                        className="el-acordeon-item__header"
                        onClick={() => setAcordeonAbierto(acordeonAbierto === categoria ? null : categoria)}
                      >
                        <span>{categoria}</span>
                        <ChevronDown
                          size={16} strokeWidth={1.8}
                          style={{ transform: acordeonAbierto === categoria ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                        />
                      </button>
                      {acordeonAbierto === categoria && (
                        <div className="el-acordeon-item__body">
                          {items.map(item => (
                            <button
                              key={item}
                              className={`el-rubro-chip${rubro === item ? ' active' : ''}`}
                              onClick={() => { setRubro(item); setRubroCategoria(categoria); }}
                            >
                              {rubro === item && <Check size={11} strokeWidth={2.5} />}
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {rubro && (
                  <div className="el-rubro-seleccionado">
                    <Check size={13} strokeWidth={2.5} />
                    Rubro seleccionado: <strong>{rubro}</strong>
                  </div>
                )}
                {errores.rubro && <span className="el-error">{errores.rubro}</span>}
              </div>
            )}

            {/* PASO 3 — Datos de la organización */}
            {rubro && (
              <div className="el-form-section">
                <h4 className="el-form-section__titulo">
                  <Building2 size={16} strokeWidth={1.8} />
                  Datos de la organización
                </h4>
                <div className="el-grid-2">
                  <div className="el-campo">
                    <label>Nombre de la organización *</label>
                    <input className={errores.empresa ? 'error' : ''} value={empresa}
                      onChange={e => setEmpresa(e.target.value)}
                      placeholder="Ej: Banco Nación Argentina" />
                    {errores.empresa && <span className="el-error">{errores.empresa}</span>}
                  </div>
                  <div className="el-campo">
                    <label>País</label>
                    <select value={pais} onChange={e => setPais(e.target.value)}>
                      {['Argentina','Chile','Uruguay','Paraguay','Bolivia','Perú','Colombia','México','España','Otro'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="el-campo">
                  <label>CUIT / RUT / Número de identificación fiscal</label>
                  <input value={cuit} onChange={e => setCuit(e.target.value)}
                    placeholder="Ej: 30-71234567-8" />
                </div>
              </div>
            )}

            {/* PASO 4 — Datos del solicitante */}
            {rubro && (
              <div className="el-form-section">
                <h4 className="el-form-section__titulo">
                  <Users size={16} strokeWidth={1.8} />
                  Datos del solicitante
                </h4>
                <div className="el-grid-2">
                  <div className="el-campo">
                    <label>Nombre *</label>
                    <input className={errores.nombre ? 'error' : ''} value={nombre}
                      onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" />
                    {errores.nombre && <span className="el-error">{errores.nombre}</span>}
                  </div>
                  <div className="el-campo">
                    <label>Apellido *</label>
                    <input className={errores.apellido ? 'error' : ''} value={apellido}
                      onChange={e => setApellido(e.target.value)} placeholder="Tu apellido" />
                    {errores.apellido && <span className="el-error">{errores.apellido}</span>}
                  </div>
                </div>
                <div className="el-campo">
                  <label>Cargo en la organización *</label>
                  <input className={errores.cargo ? 'error' : ''} value={cargo}
                    onChange={e => setCargo(e.target.value)} placeholder="Ej: Gerente de Marketing, Director, Presidente" />
                  {errores.cargo && <span className="el-error">{errores.cargo}</span>}
                </div>
                <div className="el-grid-2">
                  <div className="el-campo">
                    <label>Email corporativo *</label>
                    <input type="email" className={errores.email ? 'error' : ''} value={email}
                      onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" />
                    {errores.email && <span className="el-error">{errores.email}</span>}
                  </div>
                  <div className="el-campo">
                    <label>Celular / WhatsApp *</label>
                    <input className={errores.celular ? 'error' : ''} value={celular}
                      onChange={e => { setCelular(e.target.value); setWhatsapp(e.target.value); }}
                      placeholder="+54 9 11 1234-5678" />
                    {errores.celular && <span className="el-error">{errores.celular}</span>}
                  </div>
                </div>
                <div className="el-campo">
                  <label>Mensaje adicional (opcional)</label>
                  <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} rows={3}
                    placeholder="Contanos brevemente qué querés preservar de tu organización..." />
                </div>

                {/* Aviso reunión */}
                <div className={`el-aviso-reunion${nivelVerif === 2 ? ' nivel-2' : ''}`}>
                  <Shield size={14} strokeWidth={1.8} />
                  <p>
                    {nivelVerif === 1
                      ? 'Nos contactaremos en las próximas 48hs para coordinar la verificación por Meet o Zoom.'
                      : 'Esta entidad requiere verificación manual. Coordinaremos una reunión por Meet o Zoom. Nunca por teléfono.'
                    }
                  </p>
                </div>

                <button className="el-btn-enviar" onClick={enviarSolicitud}>
                  <Send size={16} strokeWidth={2} />
                  Enviar solicitud de perfil
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="el-footer">
        <div className="el-footer__inner">
          <span className="el-footer__logo">Life's · Empresas</span>
          <p className="el-footer__texto">
            © 2026 Life's — El arca de la humanidad · Para personas y organizaciones
          </p>
          <div className="el-footer__links">
            <button onClick={() => navigate('/')}>Para personas</button>
            <button onClick={() => navigate('/empresas/planes')}>Planes</button>
          </div>
        </div>
      </footer>

      {/* ════ MODAL ÉXITO ════ */}
      {modalExito && (
        <div className="el-overlay" onClick={() => setModalExito(false)}>
          <div className="el-modal-exito" onClick={e => e.stopPropagation()}>
            <div className="el-modal-exito__icono">
              <Check size={32} strokeWidth={2} />
            </div>
            <h3>¡Solicitud enviada!</h3>
            <p>
              Recibimos la solicitud de perfil para <strong>{empresa}</strong>.
              Nos contactaremos a <strong>{email}</strong> en las próximas{' '}
              {nivelVerif === 1 ? '48 horas' : '72 horas'} para coordinar la verificación.
            </p>
            <div className="el-modal-exito__detalle">
              <div><span>Organización:</span> <strong>{empresa}</strong></div>
              <div><span>Tipo:</span> <strong>{tipoConfig[tipoEntidad as keyof typeof tipoConfig]?.label}</strong></div>
              <div><span>Rubro:</span> <strong>{rubro}</strong></div>
              <div><span>Verificación:</span> <strong>Nivel {nivelVerif} — {nivelVerif === 1 ? 'Automática (48hs)' : 'Manual — Meet/Zoom'}</strong></div>
            </div>
            <p className="el-modal-exito__aclaracion">
              La reunión será únicamente por <strong>Meet o Zoom</strong> — nunca por teléfono.
            </p>
            <button className="el-modal-exito__btn" onClick={() => { setModalExito(false); navigate('/'); }}>
              Entendido — volver al inicio
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
