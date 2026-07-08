// ============================================================
// LIFE'S — LineaVidaEmpresa.tsx
// Historia + Árbol de Productos de la empresa
// Lucide React | SCSS | with-navbar
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Activity, GitBranch, Plus, X, Check,
  Calendar, Star, Package, ChevronRight, Filter,
  ZoomIn, ZoomOut, RotateCcw, List, Network,
} from 'lucide-react';
import './LineaVidaEmpresa.scss';

// ── Tipos ──────────────────────────────────────────────────
type Vista = 'linea' | 'arbol';

interface HitoEmpresa {
  id: string;
  año: number;
  mes?: number;
  titulo: string;
  descripcion: string;
  categoria: 'fundacion' | 'producto' | 'expansion' | 'premio' | 'persona' | 'tecnologia' | 'otro';
  imagen?: string;
  destacado: boolean;
  productos?: string[];
}

interface NodoProducto {
  id: string;
  nombre: string;
  año: number;
  descripcion: string;
  activo: boolean;
  color: string;
  hijos?: NodoProducto[];
  nivel: number;
}

// ── Config categorías ──────────────────────────────────────
const CAT_CONFIG = {
  fundacion:   { label: 'Fundación',    color: '#03192e', emoji: '🏛️' },
  producto:    { label: 'Producto',     color: '#C9932A', emoji: '📦' },
  expansion:   { label: 'Expansión',   color: '#4a7a4e', emoji: '🌍' },
  premio:      { label: 'Premio',       color: '#735c00', emoji: '🏆' },
  persona:     { label: 'Persona clave',color: '#855324', emoji: '👤' },
  tecnologia:  { label: 'Tecnología',  color: '#3a5a8a', emoji: '💻' },
  otro:        { label: 'Otro',         color: '#8A8279', emoji: '📌' },
};

// ── Datos mock ─────────────────────────────────────────────
const HITOS_MOCK: HitoEmpresa[] = [
  { id: '1',  año: 1891, titulo: 'Fundación del Banco Nación',      descripcion: 'Creación por ley del Congreso Nacional durante la presidencia de Carlos Pellegrini. Primer banco estatal de Argentina.', categoria: 'fundacion',  destacado: true,  imagen: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&q=80' },
  { id: '2',  año: 1900, titulo: 'Primera sucursal del interior',   descripcion: 'Apertura en Córdoba, marcando el inicio de la expansión federal.',                                                         categoria: 'expansion',  destacado: false },
  { id: '3',  año: 1944, titulo: 'Cobertura nacional completa',     descripcion: 'Presencia en todas las provincias argentinas con más de 200 sucursales.',                                                  categoria: 'expansion',  destacado: true  },
  { id: '4',  año: 1960, titulo: 'Primer crédito hipotecario',      descripcion: 'Lanzamiento del programa de créditos hipotecarios para familias argentinas.',                                              categoria: 'producto',   destacado: true,  productos: ['Crédito Hipotecario'] },
  { id: '5',  año: 1975, titulo: 'Automatización bancaria',         descripcion: 'Incorporación de los primeros sistemas de procesamiento electrónico de datos.',                                            categoria: 'tecnologia', destacado: false },
  { id: '6',  año: 1995, titulo: 'Red de cajeros automáticos',      descripcion: 'Despliegue de la primera red de ATMs en todo el país con más de 500 cajeros.',                                            categoria: 'tecnologia', destacado: true,  imagen: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=600&q=80', productos: ['Cajero BNA'] },
  { id: '7',  año: 2000, titulo: 'Home Banking',                    descripcion: 'Lanzamiento de la primera plataforma de banca online del banco.',                                                         categoria: 'producto',   destacado: false, productos: ['Home Banking BNA'] },
  { id: '8',  año: 2010, titulo: 'Premio al banco más federal',     descripcion: 'Reconocimiento internacional por la cobertura en localidades con menos de 1000 habitantes.',                              categoria: 'premio',     destacado: true  },
  { id: '9',  año: 2016, titulo: 'Crédito UVA',                     descripcion: 'Innovación con créditos hipotecarios ajustados por UVA, democratizando el acceso a la vivienda.',                        categoria: 'producto',   destacado: true,  imagen: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80', productos: ['Crédito Hipotecario UVA'] },
  { id: '10', año: 2020, titulo: 'Lanzamiento BNA+',               descripcion: 'App móvil supermoderna con más de 2 millones de usuarios en el primer año.',                                               categoria: 'producto',   destacado: true,  imagen: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80', productos: ['BNA+'] },
  { id: '11', año: 2021, titulo: 'Cuenta DNI gratuita',            descripcion: 'Inclusión financiera masiva: cuenta bancaria gratuita para todos los argentinos con DNI.',                                 categoria: 'producto',   destacado: true,  productos: ['Cuenta DNI'] },
  { id: '12', año: 2024, titulo: 'Sucursal número 700',            descripcion: 'Apertura de la sucursal 700 en Argentina, consolidando el liderazgo federal.',                                             categoria: 'expansion',  destacado: true  },
];

const ARBOL_PRODUCTOS: NodoProducto[] = [
  {
    id: 'p1', nombre: 'Productos Bancarios', año: 1891, descripcion: 'Línea base',
    activo: true, color: '#03192e', nivel: 0,
    hijos: [
      {
        id: 'p2', nombre: 'Créditos', año: 1960, descripcion: 'Línea de créditos',
        activo: true, color: '#855324', nivel: 1,
        hijos: [
          { id: 'p5', nombre: 'Crédito Hipotecario', año: 1960, descripcion: 'Crédito para vivienda', activo: true, color: '#C9932A', nivel: 2, hijos: [
            { id: 'p8', nombre: 'Crédito UVA', año: 2016, descripcion: 'Ajustado por UVA', activo: true, color: '#ffe088', nivel: 3 },
          ]},
          { id: 'p6', nombre: 'Crédito PYME', año: 2018, descripcion: 'Para pequeñas empresas', activo: true, color: '#C9932A', nivel: 2 },
        ],
      },
      {
        id: 'p3', nombre: 'Cuentas y Ahorro', año: 1891, descripcion: 'Cuentas bancarias',
        activo: true, color: '#3a5a8a', nivel: 1,
        hijos: [
          { id: 'p9', nombre: 'Caja de Ahorro Plus', año: 1995, descripcion: 'Ahorro con beneficios', activo: false, color: '#74777d', nivel: 2 },
          { id: 'p10', nombre: 'Cuenta DNI', año: 2021, descripcion: 'Cuenta gratuita con DNI', activo: true, color: '#4a7a4e', nivel: 2 },
        ],
      },
      {
        id: 'p4', nombre: 'Digital', año: 2000, descripcion: 'Banca digital',
        activo: true, color: '#4a7a4e', nivel: 1,
        hijos: [
          { id: 'p11', nombre: 'Home Banking', año: 2000, descripcion: 'Banca online', activo: true, color: '#735c00', nivel: 2 },
          { id: 'p12', nombre: 'Cajero BNA', año: 1995, descripcion: 'Red de ATMs', activo: true, color: '#735c00', nivel: 2 },
          { id: 'p13', nombre: 'BNA+', año: 2020, descripcion: 'App móvil', activo: true, color: '#C9932A', nivel: 2 },
        ],
      },
    ],
  },
];

// ── Componente nodo árbol ──────────────────────────────────
function NodoArbol({ nodo, zoom }: { nodo: NodoProducto; zoom: number }) {
  const [expandido, setExpandido] = useState(nodo.nivel < 2);

  return (
    <div className="lve-nodo-wrap">
      <div
        className={`lve-nodo${!nodo.activo ? ' lve-nodo--inactivo' : ''}`}
        style={{ borderColor: nodo.color, background: `${nodo.color}10` }}
        onClick={() => nodo.hijos && setExpandido(!expandido)}
      >
        <div className="lve-nodo__año" style={{ color: nodo.color }}>{nodo.año}</div>
        <div className="lve-nodo__nombre">{nodo.nombre}</div>
        {!nodo.activo && <div className="lve-nodo__disc">Discontinuado</div>}
        {nodo.hijos && (
          <div className="lve-nodo__toggle" style={{ color: nodo.color }}>
            {expandido ? '−' : '+'}
          </div>
        )}
      </div>
      {nodo.hijos && expandido && (
        <div className="lve-nodo__hijos">
          <div className="lve-nodo__linea-v" style={{ borderColor: `${nodo.color}40` }} />
          <div className="lve-nodo__hijos-grid">
            {nodo.hijos.map(hijo => (
              <NodoArbol key={hijo.id} nodo={hijo} zoom={zoom} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────
export default function LineaVidaEmpresa() {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();

  const [vista,      setVista]      = useState<Vista>(
    searchParams.get('vista') === 'arbol' ? 'arbol' : 'linea'
  );
  const [filtrosCat, setFiltrosCat] = useState<string[]>([]);
  const [zoom,       setZoom]       = useState(1);
  const [modalHito,  setModalHito]  = useState(false);
  const [toast,      setToast]      = useState('');

  // Nuevo hito
  const [hitos,      setHitos]      = useState<HitoEmpresa[]>(HITOS_MOCK);
  const [nTitulo,    setNTitulo]    = useState('');
  const [nAño,       setNAño]       = useState('');
  const [nDesc,      setNDesc]      = useState('');
  const [nCat,       setNCat]       = useState<keyof typeof CAT_CONFIG>('producto');
  const [nDestacado, setNDestacado] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleFiltro = (cat: string) => {
    setFiltrosCat(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const hitosFiltrados = filtrosCat.length === 0
    ? hitos
    : hitos.filter(h => filtrosCat.includes(h.categoria));

  const agregarHito = () => {
    if (!nTitulo.trim() || !nAño) { showToast('⚠️ Título y año son obligatorios'); return; }
    const nuevo: HitoEmpresa = {
      id: Date.now().toString(),
      año: parseInt(nAño),
      titulo: nTitulo.trim(),
      descripcion: nDesc.trim(),
      categoria: nCat,
      destacado: nDestacado,
    };
    setHitos(prev => [...prev, nuevo].sort((a, b) => a.año - b.año));
    setModalHito(false);
    setNTitulo(''); setNAño(''); setNDesc(''); setNDestacado(false);
    showToast('✓ Hito agregado a la historia');
  };

  return (
    <div className="lve-page with-navbar">

      {/* ── HEADER ── */}
      <header className="lve-header">
        <div className="lve-header__left">
          <button className="lve-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="lve-header__title">Historia Empresarial</h1>
            <p className="lve-header__sub">Banco Nación Argentina · desde 1891</p>
          </div>
        </div>
        <button className="lve-header__add" onClick={() => setModalHito(true)}>
          <Plus size={16} strokeWidth={2} />
          Agregar
        </button>
      </header>

      {/* ── SELECTOR VISTA ── */}
      <div className="lve-vista-selector">
        <button
          className={`lve-vista-btn${vista === 'linea' ? ' active' : ''}`}
          onClick={() => setVista('linea')}
        >
          <Activity size={16} strokeWidth={1.8} />
          Línea de tiempo
        </button>
        <button
          className={`lve-vista-btn${vista === 'arbol' ? ' active' : ''}`}
          onClick={() => setVista('arbol')}
        >
          <GitBranch size={16} strokeWidth={1.8} />
          Árbol de productos
        </button>
      </div>

      {/* ════ VISTA: LÍNEA DE TIEMPO ════ */}
      {vista === 'linea' && (
        <div className="lve-linea-wrap">

          {/* Filtros por categoría */}
          <div className="lve-filtros">
            <Filter size={14} strokeWidth={1.8} className="lve-filtros__icono" />
            {(Object.entries(CAT_CONFIG) as [keyof typeof CAT_CONFIG, typeof CAT_CONFIG[keyof typeof CAT_CONFIG]][]).map(([key, cfg]) => (
              <button
                key={key}
                className={`lve-filtro-btn${filtrosCat.includes(key) ? ' active' : ''}`}
                style={filtrosCat.includes(key) ? { background: cfg.color, color: 'white', borderColor: cfg.color } : {}}
                onClick={() => toggleFiltro(key)}
              >
                {cfg.emoji} {cfg.label}
              </button>
            ))}
            {filtrosCat.length > 0 && (
              <button className="lve-filtro-limpiar" onClick={() => setFiltrosCat([])}>
                <X size={12} strokeWidth={2} /> Limpiar
              </button>
            )}
          </div>

          {/* Contador */}
          <div className="lve-linea-meta">
            <span>{hitosFiltrados.length} hitos</span>
            <span>{hitosFiltrados.filter(h => h.destacado).length} destacados</span>
          </div>

          {/* Timeline */}
          <div className="lve-timeline">
            {hitosFiltrados.map((hito, i) => {
              const cfg = CAT_CONFIG[hito.categoria];
              return (
                <div
                  key={hito.id}
                  className={`lve-hito${hito.destacado ? ' lve-hito--destacado' : ''}`}
                >
                  {/* Línea y dot */}
                  <div className="lve-hito__track">
                    <div className="lve-hito__dot" style={{ background: cfg.color }}>
                      <span>{cfg.emoji}</span>
                    </div>
                    {i < hitosFiltrados.length - 1 && (
                      <div className="lve-hito__linea" />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="lve-hito__card">
                    <div className="lve-hito__card-header">
                      <div className="lve-hito__año-wrap">
                        <span className="lve-hito__año">{hito.año}</span>
                        <span
                          className="lve-hito__cat-badge"
                          style={{ color: cfg.color, background: `${cfg.color}12` }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      {hito.destacado && (
                        <Star size={14} strokeWidth={0} fill="#C9932A" className="lve-hito__star" />
                      )}
                    </div>
                    <h3 className="lve-hito__titulo">{hito.titulo}</h3>
                    <p className="lve-hito__desc">{hito.descripcion}</p>

                    {hito.imagen && (
                      <img src={hito.imagen} alt={hito.titulo} className="lve-hito__img" />
                    )}

                    {hito.productos && hito.productos.length > 0 && (
                      <div className="lve-hito__productos">
                        {hito.productos.map(p => (
                          <span key={p} className="lve-hito__producto-tag">
                            <Package size={10} strokeWidth={2} />
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Botón agregar al final */}
            <button className="lve-agregar-inline" onClick={() => setModalHito(true)}>
              <Plus size={18} strokeWidth={2} />
              Agregar nuevo hito
            </button>
          </div>
        </div>
      )}

      {/* ════ VISTA: ÁRBOL DE PRODUCTOS ════ */}
      {vista === 'arbol' && (
        <div className="lve-arbol-wrap">

          {/* Controles zoom */}
          <div className="lve-arbol-controles">
            <button className="lve-arbol-ctrl" onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}>
              <ZoomIn size={16} strokeWidth={1.8} />
            </button>
            <button className="lve-arbol-ctrl" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>
              <ZoomOut size={16} strokeWidth={1.8} />
            </button>
            <button className="lve-arbol-ctrl" onClick={() => setZoom(1)}>
              <RotateCcw size={16} strokeWidth={1.8} />
            </button>
            <span className="lve-arbol-zoom">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Leyenda */}
          <div className="lve-arbol-leyenda">
            <div className="lve-leyenda-item">
              <div className="lve-leyenda-dot" style={{ background: '#4a7a4e' }} />
              <span>Activo</span>
            </div>
            <div className="lve-leyenda-item">
              <div className="lve-leyenda-dot" style={{ background: '#8A8279' }} />
              <span>Discontinuado</span>
            </div>
            <div className="lve-leyenda-item">
              <ChevronRight size={12} strokeWidth={2} />
              <span>Clickeá para expandir</span>
            </div>
          </div>

          {/* Árbol */}
          <div
            className="lve-arbol-canvas"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
            {ARBOL_PRODUCTOS.map(nodo => (
              <NodoArbol key={nodo.id} nodo={nodo} zoom={zoom} />
            ))}
          </div>

          {/* Botón ir a línea de tiempo */}
          <button className="lve-arbol-ver-linea" onClick={() => setVista('linea')}>
            <List size={16} strokeWidth={1.8} />
            Ver historia completa en línea de tiempo
            <ChevronRight size={14} strokeWidth={1.8} />
          </button>
        </div>
      )}

      {/* ════ MODAL NUEVO HITO ════ */}
      {modalHito && (
        <div className="lve-overlay" onClick={() => setModalHito(false)}>
          <div className="lve-modal" onClick={e => e.stopPropagation()}>
            <div className="lve-modal__handle"><div className="lve-modal__bar" /></div>
            <div className="lve-modal__header">
              <h3>Nuevo hito histórico</h3>
              <button onClick={() => setModalHito(false)}>
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>
            <div className="lve-modal__body">
              <div className="lve-modal__grupo">
                <label>Título *</label>
                <input className="lve-modal__input" placeholder="Ej: Lanzamiento de nueva línea de productos"
                  value={nTitulo} onChange={e => setNTitulo(e.target.value)} />
              </div>
              <div className="lve-modal__grupo">
                <label>Año *</label>
                <input className="lve-modal__input" type="number" placeholder="Ej: 2024"
                  min="1800" max="2099" value={nAño} onChange={e => setNAño(e.target.value)} />
              </div>
              <div className="lve-modal__grupo">
                <label>Categoría</label>
                <div className="lve-modal__cats">
                  {(Object.entries(CAT_CONFIG) as [keyof typeof CAT_CONFIG, typeof CAT_CONFIG[keyof typeof CAT_CONFIG]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      className={`lve-modal__cat-btn${nCat === key ? ' active' : ''}`}
                      style={nCat === key ? { background: cfg.color, color: 'white', borderColor: cfg.color } : {}}
                      onClick={() => setNCat(key)}
                    >
                      {cfg.emoji} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="lve-modal__grupo">
                <label>Descripción</label>
                <textarea className="lve-modal__textarea" rows={3}
                  placeholder="Contá qué pasó y por qué fue importante para la organización..."
                  value={nDesc} onChange={e => setNDesc(e.target.value)} />
              </div>
              <div className="lve-modal__toggle-row">
                <div>
                  <label>Hito destacado</label>
                  <p className="lve-modal__toggle-desc">Se marcará con estrella y tendrá mayor visibilidad</p>
                </div>
                <div
                  className={`lve-toggle${nDestacado ? ' on' : ''}`}
                  onClick={() => setNDestacado(!nDestacado)}
                >
                  <div className="lve-toggle__thumb" />
                </div>
              </div>
            </div>
            <div className="lve-modal__footer">
              <button className="lve-modal__cancelar" onClick={() => setModalHito(false)}>Cancelar</button>
              <button className="lve-modal__guardar" onClick={agregarHito}>
                <Check size={15} strokeWidth={2} />
                Guardar hito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="lve-toast">
          <Check size={13} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
