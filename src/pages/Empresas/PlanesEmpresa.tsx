// ============================================================
// LIFE'S — PlanesEmpresa.tsx | Pricing B2B
// Lucide React | SCSS | with-navbar-empresa
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, X, ChevronDown, ChevronUp,
  Building2, Users, HardDrive, GitBranch, Sparkles,
  HeadphonesIcon, Shield, Crown, Zap, BarChart3,
  FileText, Video, Settings, Lock, Globe, Mail,
  ArrowRight, BadgeCheck, Star,
} from 'lucide-react';
import './PlanesEmpresa.scss';

// ── Tipos ──────────────────────────────────────────────────
interface Plan {
  id: string;
  nombre: string;
  precio: string;
  periodo: string;
  desc: string;
  color: string;
  destacado: boolean;
  cta: string;
  badge?: string;
}

interface CategoriaCom {
  label: string;
  icono: React.ReactNode;
  features: {
    label: string;
    starter: string | boolean;
    pro: string | boolean;
    enterprise: string | boolean;
  }[];
}

interface FaqItem {
  pregunta: string;
  respuesta: string;
}

// ── Planes ─────────────────────────────────────────────────
const PLANES: Plan[] = [
  {
    id: 'starter',
    nombre: 'Starter',
    precio: '$500',
    periodo: '/año',
    desc: 'Para PyMEs, clubes y ONGs que quieren preservar su historia',
    color: '#855324',
    destacado: false,
    cta: 'Solicitar Starter',
  },
  {
    id: 'pro',
    nombre: 'Professional',
    precio: '$1.200',
    periodo: '/año',
    desc: 'Para empresas medianas, municipios y organizaciones en crecimiento',
    color: '#C9932A',
    destacado: true,
    cta: 'Solicitar Professional',
    badge: 'Más elegido',
  },
  {
    id: 'enterprise',
    nombre: 'Enterprise',
    precio: 'A consultar',
    periodo: '',
    desc: 'Para grandes corporaciones, gobiernos y organizaciones complejas',
    color: '#03192E',
    destacado: false,
    cta: 'Contactar ventas',
  },
];

// ── Tabla comparativa ──────────────────────────────────────
const COMPARATIVA: CategoriaCom[] = [
  {
    label: 'Perfil y contenido',
    icono: <Building2 size={16} strokeWidth={1.8} />,
    features: [
      { label: 'Perfil institucional verificado',    starter: true,      pro: true,           enterprise: true },
      { label: 'Foto de portada y logo',             starter: true,      pro: true,           enterprise: true },
      { label: 'Descripción y misión',               starter: true,      pro: true,           enterprise: true },
      { label: 'Hitos históricos',                   starter: '20',      pro: 'Ilimitados',   enterprise: 'Ilimitados' },
      { label: 'Fotos por hito',                     starter: '3',       pro: '10',           enterprise: 'Ilimitadas' },
      { label: 'Videos institucionales',             starter: '2',       pro: '20',           enterprise: 'Ilimitados' },
      { label: 'Productos / Servicios',              starter: '10',      pro: '50',           enterprise: 'Ilimitados' },
    ],
  },
  {
    label: 'Usuarios y equipo',
    icono: <Users size={16} strokeWidth={1.8} />,
    features: [
      { label: 'Usuarios administradores',           starter: '2',       pro: '10',           enterprise: 'Ilimitados' },
      { label: 'Roles y permisos',                   starter: false,     pro: true,           enterprise: true },
      { label: 'Accesos temporales para agencias',   starter: false,     pro: true,           enterprise: true },
      { label: 'Log de actividad',                   starter: false,     pro: true,           enterprise: true },
      { label: 'Auditoría completa',                 starter: false,     pro: false,          enterprise: true },
      { label: '2FA para el equipo',                 starter: false,     pro: true,           enterprise: true },
    ],
  },
  {
    label: 'Almacenamiento',
    icono: <HardDrive size={16} strokeWidth={1.8} />,
    features: [
      { label: 'Almacenamiento total',               starter: '5 GB',    pro: '50 GB',        enterprise: 'Ilimitado' },
      { label: 'Tamaño máximo por archivo',          starter: '100 MB',  pro: '500 MB',       enterprise: '2 GB' },
      { label: 'Almacenamiento adicional',           starter: '+$10/GB', pro: '+$8/GB',       enterprise: 'Negociable' },
    ],
  },
  {
    label: 'Árbol de liderazgo',
    icono: <GitBranch size={16} strokeWidth={1.8} />,
    features: [
      { label: 'Árbol genealógico de liderazgo',     starter: 'Básico',  pro: 'Completo',     enterprise: 'Completo' },
      { label: 'Nodos históricos',                   starter: '10',      pro: 'Ilimitados',   enterprise: 'Ilimitados' },
      { label: 'Árbol de productos',                 starter: false,     pro: true,           enterprise: true },
      { label: 'Exportar árbol en PDF/PNG',          starter: false,     pro: true,           enterprise: true },
      { label: 'Vista interactiva con zoom',         starter: false,     pro: true,           enterprise: true },
    ],
  },
  {
    label: 'IA y automatización',
    icono: <Sparkles size={16} strokeWidth={1.8} />,
    features: [
      { label: 'IA para redactar historia',          starter: false,     pro: true,           enterprise: true },
      { label: 'Compilación automática de hitos',    starter: false,     pro: true,           enterprise: true },
      { label: 'Generación de reportes IA',          starter: false,     pro: false,          enterprise: true },
      { label: 'API access',                         starter: false,     pro: false,          enterprise: true },
    ],
  },
  {
    label: 'Soporte',
    icono: <HeadphonesIcon size={16} strokeWidth={1.8} />,
    features: [
      { label: 'Soporte por email',                  starter: true,      pro: true,           enterprise: true },
      { label: 'Tiempo de respuesta',                starter: '72hs',    pro: '24hs',         enterprise: '4hs' },
      { label: 'Soporte prioritario',                starter: false,     pro: true,           enterprise: true },
      { label: 'Account manager dedicado',           starter: false,     pro: false,          enterprise: true },
      { label: 'SLA garantizado',                    starter: false,     pro: false,          enterprise: true },
      { label: 'Onboarding asistido',                starter: false,     pro: true,           enterprise: true },
    ],
  },
];

// ── Features del admin panel ───────────────────────────────
const ADMIN_FEATURES = [
  { icono: <FileText  size={20} strokeWidth={1.6} />, titulo: 'Edición completa del perfil',    desc: 'Modificá nombre, descripción, misión, logo y portada en cualquier momento desde el panel.' },
  { icono: <GitBranch size={20} strokeWidth={1.6} />, titulo: 'Gestión del árbol de liderazgo', desc: 'Agregá, editá y eliminá nodos del árbol. Cargá fotos, bios y logros de cada directivo.' },
  { icono: <BarChart3 size={20} strokeWidth={1.6} />, titulo: 'Estadísticas del perfil',        desc: 'Métricas de visitas, visualizaciones por sección y alcance del contenido publicado.' },
  { icono: <Users     size={20} strokeWidth={1.6} />, titulo: 'Gestión de usuarios',            desc: 'Invitá a tu equipo, asigná roles (Editor, Viewer, Admin) y controlá quién puede editar qué.' },
  { icono: <Video     size={20} strokeWidth={1.6} />, titulo: 'Archivo multimedia',             desc: 'Subí fotos y videos directamente. Organizalos por categoría, hito o período histórico.' },
  { icono: <Shield    size={20} strokeWidth={1.6} />, titulo: 'Seguridad y accesos',            desc: '2FA para todo el equipo, log de actividad y accesos temporales para agencias externas.' },
  { icono: <Settings  size={20} strokeWidth={1.6} />, titulo: 'Configuración del perfil',       desc: 'Definí qué secciones son públicas, cuáles requieren verificación y cómo se muestra el perfil.' },
  { icono: <Sparkles  size={20} strokeWidth={1.6} />, titulo: 'Asistente IA',                   desc: 'La IA redacta la historia institucional, sugiere hitos y genera descripciones profesionales.' },
];

// ── FAQ ────────────────────────────────────────────────────
const FAQ: FaqItem[] = [
  {
    pregunta: '¿Cómo se activa el perfil después de contratar?',
    respuesta: 'Una vez aprobada la verificación (Nivel 1: 48hs, Nivel 2: reunión virtual), te enviamos las credenciales de acceso al panel administrador. Desde ahí podés empezar a construir el perfil de tu organización inmediatamente.',
  },
  {
    pregunta: '¿Puedo cambiar de plan durante el año?',
    respuesta: 'Sí. Podés hacer upgrade en cualquier momento — se prorratea el saldo restante del plan actual. El downgrade aplica al inicio del siguiente período anual.',
  },
  {
    pregunta: '¿Qué pasa con el contenido si no renuevo?',
    respuesta: 'El perfil pasa a modo "solo lectura" — el contenido sigue visible públicamente pero no podés editarlo. Tenés 90 días para renovar o exportar tu contenido antes de que se archive.',
  },
  {
    pregunta: '¿Hay descuento para ONGs y organizaciones sin fines de lucro?',
    respuesta: 'Sí. Las ONGs, fundaciones y organizaciones sin fines de lucro verificadas acceden al plan Professional con un 40% de descuento. Contactanos con documentación de tu organización.',
  },
  {
    pregunta: '¿El Enterprise incluye todo sin límite?',
    respuesta: 'El plan Enterprise incluye usuarios, almacenamiento y hitos ilimitados, más API access, generación de reportes IA, account manager dedicado y SLA garantizado. El precio se define según el tamaño y necesidades de la organización.',
  },
];

// ── Componente ─────────────────────────────────────────────
export default function PlanesEmpresa() {
  const navigate = useNavigate();

  const [faqAbierto, setFaqAbierto]   = useState<number | null>(null);
  const [catAbierta, setCatAbierta]   = useState<string | null>(null);
  const [toast,      setToast]        = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleCta = (planId: string) => {
    if (planId === 'enterprise') {
      navigate('/empresas?contacto=enterprise');
    } else {
      navigate('/empresas#formulario');
    }
  };

  const renderValor = (val: string | boolean) => {
    if (val === true)  return <Check size={16} strokeWidth={2.5} className="pe-comp__check" />;
    if (val === false) return <X     size={14} strokeWidth={2}   className="pe-comp__x" />;
    return <span className="pe-comp__val">{val}</span>;
  };

  return (
    <div className="pla-page with-navbar-empresa">

      {/* ── HEADER ── */}
      <header className="pla-header">
        <div className="pla-header__left">
          <button className="pla-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="pla-header__title">Planes y Precios</h1>
            <p className="pla-header__sub">Life's para Organizaciones</p>
          </div>
        </div>
        <button className="pla-header__contacto" onClick={() => navigate('/empresas')}>
          <Mail size={15} strokeWidth={1.8} />
          Contactar
        </button>
      </header>

      <main className="pla-main">

        {/* ══ HERO ══ */}
        <div className="pla-hero">
          <div className="pla-hero__bg" />
          <div className="pla-hero__inner">
            <div className="pla-hero__badge">
              <BadgeCheck size={13} strokeWidth={2} />
              Facturación anual · USD
            </div>
            <h2 className="pla-hero__titulo">
              El plan correcto<br />
              <em>para tu organización</em>
            </h2>
            <p className="pla-hero__desc">
              Todos los planes incluyen verificación de identidad, perfil público y soporte por email.
              Sin costos ocultos. Cancelación en cualquier momento.
            </p>
          </div>
        </div>

        {/* ══ CARDS DE PLANES ══ */}
        <div className="pla-planes-grid">
          {PLANES.map(plan => (
            <div
              key={plan.id}
              className={`pla-plan-card${plan.destacado ? ' pla-plan-card--destacado' : ''}`}
              style={plan.destacado ? { borderColor: plan.color } : {}}
            >
              {plan.badge && (
                <div className="pla-plan-card__badge" style={{ background: plan.color }}>
                  <Star size={10} strokeWidth={0} fill="white" />
                  {plan.badge}
                </div>
              )}

              <div className="pla-plan-card__header">
                <h3 className="pla-plan-card__nombre" style={{ color: plan.color }}>
                  {plan.nombre}
                </h3>
                <p className="pla-plan-card__desc">{plan.desc}</p>
              </div>

              <div className="pla-plan-card__precio">
                {plan.periodo ? (
                  <>
                    <span className="pla-plan-card__monto">{plan.precio}</span>
                    <span className="pla-plan-card__periodo">{plan.periodo}</span>
                  </>
                ) : (
                  <span className="pla-plan-card__monto pla-plan-card__monto--consultar">
                    {plan.precio}
                  </span>
                )}
              </div>

              <button
                className="pla-plan-card__cta"
                style={plan.destacado ? { background: plan.color } : {}}
                onClick={() => handleCta(plan.id)}
              >
                {plan.cta}
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>

        {/* ══ PANEL ADMINISTRADOR ══ */}
        <div className="pla-admin-section">
          <div className="pla-admin-section__header">
            <div className="pla-admin-section__icono">
              <Crown size={24} strokeWidth={1.4} />
            </div>
            <div>
              <span className="pla-eyebrow">Panel administrador incluido</span>
              <h3 className="pla-admin-section__titulo">¿Qué podés gestionar desde el panel?</h3>
              <p className="pla-admin-section__desc">
                Cada plan incluye acceso a un panel de administración donde tu equipo puede construir
                y mantener el legado de la organización de forma colaborativa.
              </p>
            </div>
          </div>
          <div className="pla-admin-grid">
            {ADMIN_FEATURES.map(f => (
              <div key={f.titulo} className="pla-admin-card">
                <div className="pla-admin-card__icono">{f.icono}</div>
                <h4 className="pla-admin-card__titulo">{f.titulo}</h4>
                <p className="pla-admin-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ TABLA COMPARATIVA ══ */}
        <div className="pla-comparativa">
          <div className="pla-comparativa__header">
            <span className="pla-eyebrow">Comparativa completa</span>
            <h3 className="pla-comparativa__titulo">Todo lo que incluye cada plan</h3>
          </div>

          {/* Header de planes */}
          <div className="pla-comp-table">
            <div className="pla-comp-header">
              <div className="pla-comp-header__vacio" />
              {PLANES.map(p => (
                <div
                  key={p.id}
                  className={`pla-comp-header__plan${p.destacado ? ' destacado' : ''}`}
                  style={p.destacado ? { borderColor: p.color, color: p.color } : {}}
                >
                  {p.nombre}
                  {p.destacado && <Star size={10} strokeWidth={0} fill={p.color} />}
                </div>
              ))}
            </div>

            {/* Categorías */}
            {COMPARATIVA.map(cat => (
              <div key={cat.label} className="pla-comp-cat">
                <button
                  className="pla-comp-cat__header"
                  onClick={() => setCatAbierta(catAbierta === cat.label ? null : cat.label)}
                >
                  <span className="pla-comp-cat__icono">{cat.icono}</span>
                  <span className="pla-comp-cat__label">{cat.label}</span>
                  {catAbierta === cat.label
                    ? <ChevronUp   size={16} strokeWidth={1.8} />
                    : <ChevronDown size={16} strokeWidth={1.8} />
                  }
                </button>

                {(catAbierta === cat.label || catAbierta === null) && (
                  <div className="pla-comp-cat__rows">
                    {cat.features.map(f => (
                      <div key={f.label} className="pla-comp-row">
                        <span className="pla-comp-row__label">{f.label}</span>
                        <div className="pla-comp-row__vals">
                          <div className="pla-comp-row__val">{renderValor(f.starter)}</div>
                          <div className="pla-comp-row__val pla-comp-row__val--pro">{renderValor(f.pro)}</div>
                          <div className="pla-comp-row__val">{renderValor(f.enterprise)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ══ FAQ ══ */}
        <div className="pla-faq">
          <div className="pla-faq__header">
            <span className="pla-eyebrow">Preguntas frecuentes</span>
            <h3 className="pla-faq__titulo">Todo lo que necesitás saber</h3>
          </div>
          <div className="pla-faq__lista">
            {FAQ.map((item, i) => (
              <div key={i} className={`pla-faq-item${faqAbierto === i ? ' abierto' : ''}`}>
                <button
                  className="pla-faq-item__pregunta"
                  onClick={() => setFaqAbierto(faqAbierto === i ? null : i)}
                >
                  <span>{item.pregunta}</span>
                  {faqAbierto === i
                    ? <ChevronUp   size={18} strokeWidth={1.8} />
                    : <ChevronDown size={18} strokeWidth={1.8} />
                  }
                </button>
                {faqAbierto === i && (
                  <div className="pla-faq-item__respuesta">
                    <p>{item.respuesta}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ══ CTA FINAL ══ */}
        <div className="pla-cta-final">
          <div className="pla-cta-final__bg" />
          <div className="pla-cta-final__inner">
            <Zap size={32} strokeWidth={1.4} className="pla-cta-final__icono" />
            <h3 className="pla-cta-final__titulo">¿No encontrás el plan ideal?</h3>
            <p className="pla-cta-final__desc">
              Cada organización es única. Hablemos y diseñamos juntos el plan que mejor se adapte a tu caso.
            </p>
            <div className="pla-cta-final__btns">
              <button
                className="pla-cta-final__btn-primary"
                onClick={() => navigate('/empresas')}
              >
                <Mail size={16} strokeWidth={2} />
                Solicitar reunión
              </button>
              <button
                className="pla-cta-final__btn-secondary"
                onClick={() => navigate('/empresas/perfil')}
              >
                Ver ejemplo de perfil
                <ArrowRight size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Toast */}
      {toast && (
        <div className="pla-toast">
          <Check size={13} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
