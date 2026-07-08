// ============================================================
// LIFE'S — PerfilEmpresa.tsx
// Perfil público de empresa verificada
// Lucide React | SCSS | with-navbar
// ============================================================
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, Globe, MapPin, Calendar,
  Users, Package, TrendingUp, Award, Plus,
  Activity, GitBranch, Mail, ExternalLink,
  Share2, AtSign, Link2,
  ChevronRight, Edit2, Building2, X, Check,
  Briefcase,
} from 'lucide-react';
import './PerfilEmpresa.scss';

// ── Tipos ──────────────────────────────────────────────────
interface Hito {
  id: string;
  año: number;
  titulo: string;
  descripcion: string;
  imagen?: string;
  importante: boolean;
}

interface Directivo {
  id: string;
  nombre: string;
  cargo: string;
  avatar: string;
  desde: string;
}

interface Producto {
  id: string;
  nombre: string;
  año: number;
  descripcion: string;
  activo: boolean;
  imagen?: string;
}

// ── Datos mock ─────────────────────────────────────────────
const EMPRESA_MOCK = {
  nombre:      'Banco Nación Argentina',
  slogan:      'El banco de todos los argentinos',
  rubro:       'Servicios Financieros',
  subrubro:    'Banco',
  pais:        'Argentina',
  ciudad:      'Buenos Aires',
  fundacion:   1891,
  empleados:   18000,
  web:         'www.bna.com.ar',
  email:       'contacto@bna.com.ar',
  descripcion: 'El Banco de la Nación Argentina es la institución financiera más grande del país. Fundado en 1891 por ley del Congreso Nacional, es el banco del Estado argentino y opera con presencia en todo el territorio nacional e internacional.',
  mision:      'Ser el banco del desarrollo nacional, apoyando la producción, el comercio, la industria y las familias argentinas con servicios financieros accesibles y de calidad.',
  portada:     'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
  logo:        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=80',
  verificado:  true,
  redes: {
    instagram: '@banconacion',
    twitter:   '@BancoNacion',
    linkedin:  'banco-nacion-argentina',
  },
};

const HITOS_MOCK: Hito[] = [
  { id: '1', año: 1891, titulo: 'Fundación del Banco',          descripcion: 'Creación por ley del Congreso Nacional durante la presidencia de Carlos Pellegrini.',  imagen: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80', importante: true  },
  { id: '2', año: 1944, titulo: 'Expansión nacional',           descripcion: 'Apertura de sucursales en todas las provincias del país, consolidando la presencia federal.',    imagen: undefined, importante: false },
  { id: '3', año: 1995, titulo: 'Modernización tecnológica',    descripcion: 'Implementación del sistema de cajeros automáticos y banca electrónica en todo el país.',         imagen: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&q=80', importante: false },
  { id: '4', año: 2015, titulo: 'Banca digital',                descripcion: 'Lanzamiento de la app móvil y home banking con más de 2 millones de usuarios activos.',          imagen: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80', importante: true  },
  { id: '5', año: 2024, titulo: 'Hito del bicentenario',        descripcion: 'Superación de los 18.000 empleados y apertura de la sucursal número 700 en todo el país.',      imagen: undefined, importante: true  },
];

const DIRECTIVOS_MOCK: Directivo[] = [
  { id: '1', nombre: 'Daniel Tillard',    cargo: 'Presidente',               avatar: 'https://i.pravatar.cc/80?img=60', desde: '2020' },
  { id: '2', nombre: 'María Rodríguez',  cargo: 'Vicepresidenta',            avatar: 'https://i.pravatar.cc/80?img=25', desde: '2021' },
  { id: '3', nombre: 'Carlos Martínez',  cargo: 'Director de Operaciones',   avatar: 'https://i.pravatar.cc/80?img=33', desde: '2019' },
  { id: '4', nombre: 'Ana Gutiérrez',    cargo: 'Directora Digital',         avatar: 'https://i.pravatar.cc/80?img=44', desde: '2022' },
  { id: '5', nombre: 'Roberto Sánchez',  cargo: 'Director de Riesgo',        avatar: 'https://i.pravatar.cc/80?img=55', desde: '2018' },
];

const PRODUCTOS_MOCK: Producto[] = [
  { id: '1', nombre: 'Crédito Hipotecario UVA', año: 2016, descripcion: 'Préstamos para vivienda ajustados por UVA con tasas accesibles.', activo: true,  imagen: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&q=80' },
  { id: '2', nombre: 'BNA+',                     año: 2020, descripcion: 'Aplicación móvil para gestionar todos tus productos bancarios.',  activo: true,  imagen: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&q=80' },
  { id: '3', nombre: 'Cuenta DNI',               año: 2021, descripcion: 'Cuenta gratuita con solo el DNI, sin requisitos adicionales.',   activo: true,  imagen: undefined },
  { id: '4', nombre: 'Crédito PYME',             año: 2018, descripcion: 'Financiamiento para pequeñas y medianas empresas argentinas.',   activo: true,  imagen: undefined },
  { id: '5', nombre: 'Caja de Ahorro Plus',      año: 1995, descripcion: 'Cuenta de ahorro con beneficios exclusivos para clientes.',      activo: false, imagen: undefined },
];

// ── Componente ─────────────────────────────────────────────
export default function PerfilEmpresa() {
  const navigate    = useNavigate();
  const { empresaId } = useParams();

  // En producción esto vendrá del contexto de auth
  // true = el usuario logueado es admin de esta empresa
  const esPropietario = false; // cambiar a true cuando esté logueado como admin

  const [hitos,     setHitos]     = useState<Hito[]>(HITOS_MOCK);
  const [modalHito, setModalHito] = useState(false);
  const [tabActiva, setTabActiva] = useState<'hitos' | 'equipo' | 'productos'>('hitos');
  const [toast,     setToast]     = useState('');

  // Nuevo hito
  const [nHitoAño,   setNHitoAño]   = useState('');
  const [nHitoTit,   setNHitoTit]   = useState('');
  const [nHitoDesc,  setNHitoDesc]  = useState('');
  const [nHitoImp,   setNHitoImp]   = useState(false);

  const añosTrayectoria = new Date().getFullYear() - EMPRESA_MOCK.fundacion;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const agregarHito = () => {
    if (!nHitoAño || !nHitoTit.trim()) { showToast('⚠️ Año y título son obligatorios'); return; }
    const nuevo: Hito = {
      id: Date.now().toString(),
      año: parseInt(nHitoAño),
      titulo: nHitoTit.trim(),
      descripcion: nHitoDesc.trim(),
      importante: nHitoImp,
    };
    setHitos(prev => [...prev, nuevo].sort((a, b) => a.año - b.año));
    setModalHito(false);
    setNHitoAño(''); setNHitoTit(''); setNHitoDesc(''); setNHitoImp(false);
    showToast('✓ Hito agregado a la historia de la empresa');
  };

  return (
    <div className="pe-page with-navbar">

      {/* ── HEADER ── */}
      <header className="pe-header">
        <button className="pe-header__back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} strokeWidth={1.8} />
        </button>
        <span className="pe-header__titulo">Perfil Empresarial</span>
        <div className="pe-header__acciones">
          <button className="pe-header__btn" onClick={() => showToast('🔗 Link copiado')}>
            <Share2 size={18} strokeWidth={1.8} />
          </button>
          {esPropietario && (
            <button className="pe-header__btn" onClick={() => navigate('/empresas/linea-de-vida')}>
              <Edit2 size={18} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </header>

      {/* ══ PORTADA ══ */}
      <div className="pe-portada">
        <img src={EMPRESA_MOCK.portada} alt="Portada" className="pe-portada__img" />
        <div className="pe-portada__overlay" />
      </div>

      <main className="pe-main">

        {/* ══ HERO INFO ══ */}
        <div className="pe-hero-info fade-up">
          <div className="pe-hero-info__top">
            <div className="pe-logo-wrap">
              <img src={EMPRESA_MOCK.logo} alt={EMPRESA_MOCK.nombre} className="pe-logo" />
              {EMPRESA_MOCK.verificado && (
                <div className="pe-verificado-badge">
                  <BadgeCheck size={14} strokeWidth={2} />
                </div>
              )}
            </div>
            <div className="pe-hero-info__datos">
              <div className="pe-hero-info__nombre-wrap">
                <h1 className="pe-nombre">{EMPRESA_MOCK.nombre}</h1>
                {EMPRESA_MOCK.verificado && (
                  <span className="pe-verificado-tag">
                    <BadgeCheck size={12} strokeWidth={2} />
                    Verificado
                  </span>
                )}
              </div>
              <p className="pe-slogan">{EMPRESA_MOCK.slogan}</p>
              <div className="pe-meta">
                <span><Building2 size={13} strokeWidth={1.8} />{EMPRESA_MOCK.rubro} · {EMPRESA_MOCK.subrubro}</span>
                <span><MapPin size={13} strokeWidth={1.8} />{EMPRESA_MOCK.ciudad}, {EMPRESA_MOCK.pais}</span>
                <span><Calendar size={13} strokeWidth={1.8} />Fundada en {EMPRESA_MOCK.fundacion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══ STATS ══ */}
        <div className="pe-stats fade-up" style={{ animationDelay: '0.06s' }}>
          {[
            { val: `${añosTrayectoria}`,               label: 'Años de trayectoria', icono: <Award      size={18} strokeWidth={1.6} /> },
            { val: `${(EMPRESA_MOCK.empleados/1000).toFixed(0)}k`, label: 'Empleados',         icono: <Users      size={18} strokeWidth={1.6} /> },
            { val: `${PRODUCTOS_MOCK.filter(p => p.activo).length}`, label: 'Productos activos', icono: <Package    size={18} strokeWidth={1.6} /> },
            { val: `${hitos.length}`,                  label: 'Hitos históricos',   icono: <TrendingUp size={18} strokeWidth={1.6} /> },
          ].map(s => (
            <div key={s.label} className="pe-stat">
              <span className="pe-stat__icono">{s.icono}</span>
              <span className="pe-stat__val">{s.val}</span>
              <span className="pe-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ══ SOBRE LA EMPRESA ══ */}
        <div className="pe-card fade-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="pe-card__titulo">
            <Building2 size={16} strokeWidth={1.8} />
            Sobre la empresa
          </h3>
          <p className="pe-descripcion">{EMPRESA_MOCK.descripcion}</p>
          <div className="pe-mision">
            <span className="pe-mision__label">Misión</span>
            <p className="pe-mision__texto">{EMPRESA_MOCK.mision}</p>
          </div>
        </div>

        {/* ══ ACCESOS RÁPIDOS ══ */}
        <div className="pe-accesos fade-up" style={{ animationDelay: '0.12s' }}>
          <button className="pe-acceso-btn" onClick={() => navigate('/empresas/linea-de-vida')}>
            <div className="pe-acceso-btn__icono pe-acceso-btn__icono--ambar">
              <Activity size={22} strokeWidth={1.6} />
            </div>
            <div>
              <span className="pe-acceso-btn__titulo">Línea de Vida</span>
              <span className="pe-acceso-btn__sub">Historia completa de la empresa</span>
            </div>
            <ChevronRight size={16} strokeWidth={1.8} className="pe-acceso-btn__arrow" />
          </button>
          <button className="pe-acceso-btn" onClick={() => navigate('/empresas/linea-de-vida?vista=arbol')}>
            <div className="pe-acceso-btn__icono pe-acceso-btn__icono--verde">
              <GitBranch size={22} strokeWidth={1.6} />
            </div>
            <div>
              <span className="pe-acceso-btn__titulo">Árbol de Productos</span>
              <span className="pe-acceso-btn__sub">Genealogía visual de productos</span>
            </div>
            <ChevronRight size={16} strokeWidth={1.8} className="pe-acceso-btn__arrow" />
          </button>
        </div>

        {/* ══ TABS ══ */}
        <div className="pe-tabs fade-up" style={{ animationDelay: '0.14s' }}>
          {[
            { id: 'hitos',    label: 'Hitos',    icono: <TrendingUp size={15} strokeWidth={1.8} /> },
            { id: 'equipo',   label: 'Equipo actual', icono: <Users  size={15} strokeWidth={1.8} /> },
            { id: 'productos',label: 'Productos', icono: <Package    size={15} strokeWidth={1.8} /> },
          ].map(t => (
            <button
              key={t.id}
              className={`pe-tab${tabActiva === t.id ? ' active' : ''}`}
              onClick={() => setTabActiva(t.id as any)}
            >
              {t.icono}
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ HITOS ══ */}
        {tabActiva === 'hitos' && (
          <div className="pe-hitos fade-up">
            <div className="pe-section-header">
              <h3 className="pe-section-titulo">Historia de la empresa</h3>
              {esPropietario && (
                <button className="pe-section-btn" onClick={() => setModalHito(true)}>
                  <Plus size={15} strokeWidth={2} />
                  Agregar hito
                </button>
              )}
            </div>
            <div className="pe-hitos-lista">
              {hitos.map((h, i) => (
                <div key={h.id} className={`pe-hito${h.importante ? ' pe-hito--importante' : ''}`}>
                  <div className="pe-hito__timeline">
                    <div className="pe-hito__dot" />
                    {i < hitos.length - 1 && <div className="pe-hito__linea" />}
                  </div>
                  <div className="pe-hito__contenido">
                    <div className="pe-hito__header">
                      <span className="pe-hito__año">{h.año}</span>
                      {h.importante && <span className="pe-hito__badge">Hito clave</span>}
                    </div>
                    <h4 className="pe-hito__titulo">{h.titulo}</h4>
                    <p className="pe-hito__desc">{h.descripcion}</p>
                    {h.imagen && (
                      <img src={h.imagen} alt={h.titulo} className="pe-hito__img" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ EQUIPO ══ */}
        {tabActiva === 'equipo' && (
          <div className="pe-equipo fade-up">
            <div className="pe-section-header">
              <h3 className="pe-section-titulo">Equipo directivo</h3>
              {esPropietario && (
                <button className="pe-section-btn" onClick={() => showToast('👤 Agregar directivo...')}>
                  <Plus size={15} strokeWidth={2} />
                  Agregar
                </button>
              )}
            </div>
            <div className="pe-equipo-grid">
              {DIRECTIVOS_MOCK.map(d => (
                <div key={d.id} className="pe-directivo-card">
                  <img src={d.avatar} alt={d.nombre} className="pe-directivo-card__avatar" />
                  <h4 className="pe-directivo-card__nombre">{d.nombre}</h4>
                  <span className="pe-directivo-card__cargo">{d.cargo}</span>
                  <span className="pe-directivo-card__desde">Desde {d.desde}</span>
                </div>
              ))}
              {esPropietario && (
                <button
                  className="pe-directivo-nueva"
                  onClick={() => showToast('👤 Agregar nuevo directivo...')}
                >
                  <Plus size={22} strokeWidth={1.6} />
                  <span>Agregar</span>
                </button>
              )}
            </div>
            <button
              className="pe-ver-arbol-liderazgo"
              onClick={() => navigate('/empresas/arbol')}
            >
              <GitBranch size={16} strokeWidth={1.8} />
              Ver árbol genealógico de liderazgo completo
              <ChevronRight size={14} strokeWidth={1.8} />
            </button>
          </div>
        )}

        {/* ══ PRODUCTOS ══ */}
        {tabActiva === 'productos' && (
          <div className="pe-productos fade-up">
            <div className="pe-section-header">
              <h3 className="pe-section-titulo">Productos y servicios</h3>
              {esPropietario && (
                <button className="pe-section-btn" onClick={() => showToast('📦 Agregar producto...')}>
                  <Plus size={15} strokeWidth={2} />
                  Agregar
                </button>
              )}
            </div>
            <div className="pe-productos-grid">
              {PRODUCTOS_MOCK.map(p => (
                <div key={p.id} className={`pe-producto-card${!p.activo ? ' pe-producto-card--inactivo' : ''}`}>
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombre} className="pe-producto-card__img" />
                    : (
                      <div className="pe-producto-card__img-placeholder">
                        <Package size={24} strokeWidth={1.4} />
                      </div>
                    )
                  }
                  <div className="pe-producto-card__info">
                    <div className="pe-producto-card__header">
                      <h4 className="pe-producto-card__nombre">{p.nombre}</h4>
                      <span className={`pe-producto-card__estado${p.activo ? ' activo' : ''}`}>
                        {p.activo ? 'Activo' : 'Descontinuado'}
                      </span>
                    </div>
                    <span className="pe-producto-card__año">Lanzado en {p.año}</span>
                    <p className="pe-producto-card__desc">{p.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="pe-ver-arbol"
              onClick={() => navigate('/empresas/linea-de-vida?vista=arbol')}
            >
              <GitBranch size={16} strokeWidth={1.8} />
              Ver árbol genealógico de productos
              <ChevronRight size={15} strokeWidth={1.8} />
            </button>
          </div>
        )}

        {/* ══ CONTACTO ══ */}
        <div className="pe-contacto fade-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="pe-card__titulo">
            <Globe size={16} strokeWidth={1.8} />
            Contacto
          </h3>
          <div className="pe-contacto-links">
            <a href={`https://${EMPRESA_MOCK.web}`} target="_blank" rel="noreferrer" className="pe-contacto-link">
              <Globe size={16} strokeWidth={1.8} />
              {EMPRESA_MOCK.web}
              <ExternalLink size={12} strokeWidth={1.8} />
            </a>
            <a href={`mailto:${EMPRESA_MOCK.email}`} className="pe-contacto-link">
              <Mail size={16} strokeWidth={1.8} />
              {EMPRESA_MOCK.email}
            </a>
          </div>
          <div className="pe-redes">
            {EMPRESA_MOCK.redes.instagram && (
              <button className="pe-red-btn pe-red-btn--ig">
                <AtSign size={18} strokeWidth={1.8} />
                {EMPRESA_MOCK.redes.instagram}
              </button>
            )}
            {EMPRESA_MOCK.redes.twitter && (
              <button className="pe-red-btn pe-red-btn--tw">
                <AtSign size={18} strokeWidth={1.8} />
                {EMPRESA_MOCK.redes.twitter}
              </button>
            )}
            {EMPRESA_MOCK.redes.linkedin && (
              <button className="pe-red-btn pe-red-btn--li">
                <Link2 size={18} strokeWidth={1.8} />
                LinkedIn
              </button>
            )}
          </div>
        </div>

      </main>

      {/* ════ MODAL NUEVO HITO ════ */}
      {modalHito && (
        <div className="pe-overlay" onClick={() => setModalHito(false)}>
          <div className="pe-modal" onClick={e => e.stopPropagation()}>
            <div className="pe-modal__handle"><div className="pe-modal__bar" /></div>
            <div className="pe-modal__header">
              <h3>Nuevo hito histórico</h3>
              <button onClick={() => setModalHito(false)}>
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>
            <div className="pe-modal__body">
              <div className="pe-modal__grupo">
                <label>Año del hito *</label>
                <input type="number" className="pe-modal__input"
                  placeholder="Ej: 2024" min="1800" max="2099"
                  value={nHitoAño} onChange={e => setNHitoAño(e.target.value)} />
              </div>
              <div className="pe-modal__grupo">
                <label>Título *</label>
                <input className="pe-modal__input"
                  placeholder="Ej: Lanzamiento de nueva app"
                  value={nHitoTit} onChange={e => setNHitoTit(e.target.value)} />
              </div>
              <div className="pe-modal__grupo">
                <label>Descripción</label>
                <textarea className="pe-modal__textarea" rows={3}
                  placeholder="Contá qué pasó y por qué fue importante..."
                  value={nHitoDesc} onChange={e => setNHitoDesc(e.target.value)} />
              </div>
              <div className="pe-modal__toggle-row">
                <div>
                  <label>Hito clave</label>
                  <p className="pe-modal__toggle-desc">Se destacará visualmente en la línea de tiempo</p>
                </div>
                <div
                  className={`pe-toggle${nHitoImp ? ' on' : ''}`}
                  onClick={() => setNHitoImp(!nHitoImp)}
                >
                  <div className="pe-toggle__thumb" />
                </div>
              </div>
            </div>
            <div className="pe-modal__footer">
              <button className="pe-modal__cancelar" onClick={() => setModalHito(false)}>Cancelar</button>
              <button className="pe-modal__guardar" onClick={agregarHito}>
                <Check size={15} strokeWidth={2} />
                Guardar hito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="pe-toast">
          <Check size={13} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
