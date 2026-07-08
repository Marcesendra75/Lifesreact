// ============================================================
// LIFE'S — ArbolEmpresa.tsx
// Árbol genealógico de liderazgo empresarial
// Lucide React | SCSS | with-navbar
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Plus,
  X, Check, Calendar, MapPin, Award, ChevronRight,
  User, Building2, Clock, Star, Briefcase, Edit2,
  Download, Share2,
} from 'lucide-react';
import './ArbolEmpresa.scss';

// ── Tipos ──────────────────────────────────────────────────
interface NodoLider {
  id: number;
  nombre: string;
  cargo: string;
  cargoPersonalizado?: string;
  desde: string;
  hasta: string | 'Actualidad';
  pais: string;
  bandera: string;
  foto?: string;
  bio: string;
  logros: string[];
  era: number; // 0 = fundador, 1 = primera generación, etc.
  parentId: number | null;
  esActual?: boolean;
  area?: string; // para ramas laterales: CFO, CTO, etc.
}

// ── Config de eras ─────────────────────────────────────────
const ERA_CONFIG = [
  { label: 'Fundadores',        color: '#C9932A', glow: 'rgba(201,147,42,0.35)', ring: 'linear-gradient(135deg,#C9932A,#ffe088)', size: 84 },
  { label: 'Primera dirección', color: '#855324', glow: 'rgba(133,83,36,0.3)',   ring: 'linear-gradient(135deg,#855324,#C9932A)', size: 68 },
  { label: 'Era moderna',       color: '#03192E', glow: 'rgba(3,25,46,0.25)',    ring: 'linear-gradient(135deg,#03192e,#1a2e44)', size: 58 },
  { label: 'Liderazgo actual',  color: '#4a7a4e', glow: 'rgba(74,122,78,0.3)',  ring: 'linear-gradient(135deg,#4a7a4e,#86efac)', size: 58 },
  { label: 'Equipo directivo',  color: '#3a5a8a', glow: 'rgba(58,90,138,0.25)', ring: 'linear-gradient(135deg,#3a5a8a,#7eb3d4)', size: 48 },
];

// ── Datos mock: Banco Nación Argentina ─────────────────────
const LIDERES: NodoLider[] = [
  {
    id: 1, nombre: 'Carlos Pellegrini', cargo: 'Fundador / Presidente',
    desde: '1891', hasta: '1895', pais: 'Argentina', bandera: '🇦🇷',
    foto: 'https://i.pravatar.cc/80?img=70',
    bio: 'Presidente de la Nación Argentina y creador del Banco Nación. Impulsó la modernización financiera del país en un momento de crisis económica.',
    logros: ['Fundó el Banco Nación en 1891','Estabilizó la crisis financiera de 1890','Creó el marco legal bancario argentino'],
    era: 0, parentId: null,
  },
  {
    id: 2, nombre: 'Vicente Fidel López', cargo: 'Primer Presidente del Directorio',
    desde: '1891', hasta: '1894', pais: 'Argentina', bandera: '🇦🇷',
    foto: 'https://i.pravatar.cc/80?img=65',
    bio: 'Historiador, jurista y economista argentino. Primer presidente ejecutivo del Banco, sentó las bases operativas de la institución.',
    logros: ['Definió la estructura operativa inicial','Abrió las primeras 15 sucursales','Implementó el sistema de cuentas corrientes'],
    era: 1, parentId: 1,
  },
  {
    id: 3, nombre: 'Enrique García', cargo: 'Presidente del Directorio',
    desde: '1944', hasta: '1955', pais: 'Argentina', bandera: '🇦🇷',
    foto: 'https://i.pravatar.cc/80?img=60',
    bio: 'Llevó el banco a su primera gran expansión nacional durante el período peronista. Bajo su gestión se abrieron sucursales en todos los rincones del país.',
    logros: ['Expansión a todas las provincias','200 nuevas sucursales','Primer crédito agroindustrial masivo'],
    era: 2, parentId: 2,
  },
  {
    id: 4, nombre: 'Roberto Lavagna', cargo: 'Presidente Ejecutivo',
    desde: '1995', hasta: '2000', pais: 'Argentina', bandera: '🇦🇷',
    foto: 'https://i.pravatar.cc/80?img=55',
    bio: 'Economista. Modernizó el banco durante la era de convertibilidad. Implementó los primeros sistemas electrónicos y la red de cajeros.',
    logros: ['500 cajeros automáticos instalados','Home banking pionero en Argentina','Certificación ISO 9001 bancaria'],
    era: 2, parentId: 3,
  },
  {
    id: 5, nombre: 'Daniel Tillard', cargo: 'Presidente', cargoPersonalizado: 'Presidente del Directorio',
    desde: '2020', hasta: 'Actualidad', pais: 'Argentina', bandera: '🇦🇷',
    foto: 'https://i.pravatar.cc/80?img=50',
    bio: 'Contador público y especialista en finanzas públicas. Líder de la transformación digital del banco con el lanzamiento de BNA+ y la Cuenta DNI.',
    logros: ['Lanzamiento BNA+ (2M usuarios)','Cuenta DNI gratuita para todos los argentinos','Sucursal número 700','Récord histórico de créditos hipotecarios'],
    era: 3, parentId: 4, esActual: true,
  },
  // Ramas directivas actuales
  {
    id: 6, nombre: 'María Rodríguez', cargo: 'Vicepresidenta', area: 'Dirección General',
    desde: '2021', hasta: 'Actualidad', pais: 'Argentina', bandera: '🇦🇷',
    foto: 'https://i.pravatar.cc/80?img=25',
    bio: 'Especialista en derecho bancario y finanzas corporativas. Lidera la vicepresidencia con foco en cumplimiento normativo.',
    logros: ['Implementación de Basilea III','Programa de compliance bancario','Gestión de riesgos operativos'],
    era: 4, parentId: 5, esActual: true, area: 'Vicepresidencia',
  },
  {
    id: 7, nombre: 'Carlos Martínez', cargo: 'Director de Operaciones', area: 'COO',
    desde: '2019', hasta: 'Actualidad', pais: 'Argentina', bandera: '🇦🇷',
    foto: 'https://i.pravatar.cc/80?img=33',
    bio: 'Ingeniero industrial con especialización en gestión bancaria. Supervisa las operaciones de las 700 sucursales del país.',
    logros: ['Automatización de 300 procesos internos','Reducción de costos operativos 18%','Apertura de 50 nuevas sucursales'],
    era: 4, parentId: 5, esActual: true, area: 'Operaciones',
  },
  {
    id: 8, nombre: 'Ana Gutiérrez', cargo: 'Directora Digital', area: 'CTO',
    desde: '2022', hasta: 'Actualidad', pais: 'Argentina', bandera: '🇦🇷',
    foto: 'https://i.pravatar.cc/80?img=44',
    bio: 'Ingeniera en sistemas y MBA. Lidera la transformación digital del banco más grande del país.',
    logros: ['BNA+ con 2 millones de usuarios','Cuenta DNI digital','Implementación de IA en atención al cliente'],
    era: 4, parentId: 5, esActual: true, area: 'Digital',
  },
];

// ── Layout automático ──────────────────────────────────────
function calcularPosiciones(lideres: NodoLider[], W: number): Record<number, { x: number; y: number }> {
  const pos: Record<number, { x: number; y: number }> = {};
  const VERT_GAP = 180;
  const HORIZ_GAP = 200;

  const porEra: Record<number, NodoLider[]> = {};
  lideres.forEach(l => {
    if (!porEra[l.era]) porEra[l.era] = [];
    porEra[l.era].push(l);
  });

  Object.entries(porEra).forEach(([eraStr, nodos]) => {
    const era = parseInt(eraStr);
    const y = 60 + era * VERT_GAP;
    const totalW = (nodos.length - 1) * HORIZ_GAP;
    const startX = Math.max(W / 2 - totalW / 2, 100);
    nodos.forEach((n, i) => {
      pos[n.id] = { x: startX + i * HORIZ_GAP, y };
    });
  });

  return pos;
}

// ── Componente ─────────────────────────────────────────────
export default function ArbolEmpresa() {
  const navigate  = useNavigate();
  const svgRef    = useRef<SVGSVGElement>(null);

  const [lideres,    setLideres]    = useState<NodoLider[]>(LIDERES);
  const [zoom,       setZoom]       = useState(0.9);
  const [panX,       setPanX]       = useState(0);
  const [panY,       setPanY]       = useState(0);
  const [seleccionado, setSeleccionado] = useState<NodoLider | null>(null);
  const [dragging,   setDragging]   = useState(false);
  const [dragStart,  setDragStart]  = useState({ x: 0, y: 0 });
  const [modalAdd,   setModalAdd]   = useState(false);
  const [toast,      setToast]      = useState('');

  // Nuevo nodo
  const [nNombre,  setNNombre]  = useState('');
  const [nCargo,   setNCargo]   = useState('');
  const [nDesde,   setNDesde]   = useState('');
  const [nHasta,   setNHasta]   = useState('');
  const [nBio,     setNBio]     = useState('');
  const [nParent,  setNParent]  = useState<number>(5);
  const [nEra,     setNEra]     = useState(4);
  const [nActual,  setNActual]  = useState(false);

  const W = 900;
  const posiciones = calcularPosiciones(lideres, W);
  const maxEra = Math.max(...lideres.map(l => l.era));
  const H = (maxEra + 1) * 180 + 120;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Pan con mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest('.lve-nodo-empresa')) return;
    setDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };
  const handleMouseUp = () => setDragging(false);

  const agregarLider = () => {
    if (!nNombre.trim() || !nCargo.trim()) { showToast('⚠️ Nombre y cargo son obligatorios'); return; }
    const nuevo: NodoLider = {
      id: Math.max(...lideres.map(l => l.id)) + 1,
      nombre: nNombre.trim(), cargo: nCargo.trim(),
      desde: nDesde || '2024', hasta: nActual ? 'Actualidad' : (nHasta || '2024'),
      pais: 'Argentina', bandera: '🇦🇷',
      foto: `https://i.pravatar.cc/80?img=${Math.floor(Math.random()*70)+1}`,
      bio: nBio.trim() || 'Sin descripción.',
      logros: [], era: nEra, parentId: nParent,
      esActual: nActual,
    };
    setLideres(prev => [...prev, nuevo]);
    setModalAdd(false);
    setNNombre(''); setNCargo(''); setNDesde(''); setNHasta(''); setNBio(''); setNActual(false);
    showToast(`✓ ${nuevo.nombre} agregado al árbol`);
  };

  // Líneas de conexión
  const renderLineas = () => {
    return lideres.filter(l => l.parentId !== null).map(l => {
      const from = posiciones[l.parentId!];
      const to   = posiciones[l.id];
      if (!from || !to) return null;
      const eraConfig = ERA_CONFIG[Math.min(l.era, ERA_CONFIG.length - 1)];
      const mx = (from.x + to.x) / 2;
      return (
        <path
          key={`line-${l.id}`}
          d={`M ${from.x} ${from.y + 40} C ${from.x} ${mx} ${to.x} ${to.y - 40} ${to.x} ${to.y - 40}`}
          fill="none"
          stroke={eraConfig.color}
          strokeWidth="1.5"
          strokeDasharray={l.esActual ? 'none' : '4,3'}
          opacity={l.esActual ? 0.7 : 0.35}
        />
      );
    });
  };

  return (
    <div className="ae-page with-navbar">

      {/* ── HEADER ── */}
      <header className="ae-header">
        <div className="ae-header__left">
          <button className="ae-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="ae-header__title">Árbol de Liderazgo</h1>
            <p className="ae-header__sub">Banco Nación Argentina · 1891 – Actualidad</p>
          </div>
        </div>
        <div className="ae-header__acciones">
          <button className="ae-header__btn" onClick={() => showToast('📤 Exportando...')}>
            <Download size={17} strokeWidth={1.8} />
          </button>
          <button className="ae-header__btn" onClick={() => showToast('🔗 Link copiado')}>
            <Share2 size={17} strokeWidth={1.8} />
          </button>
          <button className="ae-header__add" onClick={() => setModalAdd(true)}>
            <Plus size={16} strokeWidth={2} />
            Agregar
          </button>
        </div>
      </header>

      {/* ── CONTROLES ── */}
      <div className="ae-controles">
        <div className="ae-zoom-btns">
          <button className="ae-ctrl-btn" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
            <ZoomIn size={16} strokeWidth={1.8} />
          </button>
          <span className="ae-zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="ae-ctrl-btn" onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))}>
            <ZoomOut size={16} strokeWidth={1.8} />
          </button>
          <button className="ae-ctrl-btn" onClick={() => { setZoom(0.9); setPanX(0); setPanY(0); }}>
            <RotateCcw size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Leyenda de eras */}
        <div className="ae-leyenda">
          {ERA_CONFIG.map((e, i) => (
            <div key={i} className="ae-leyenda-item">
              <div className="ae-leyenda-dot" style={{ background: e.ring }} />
              <span>{e.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CANVAS SVG ── */}
      <div
        className="ae-canvas-wrap"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          style={{
            transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
            transformOrigin: 'center top',
            transition: dragging ? 'none' : 'transform 0.2s',
          }}
        >
          {/* Líneas de conexión */}
          {renderLineas()}

          {/* Nodos */}
          {lideres.map(lider => {
            const pos    = posiciones[lider.id];
            if (!pos) return null;
            const era    = ERA_CONFIG[Math.min(lider.era, ERA_CONFIG.length - 1)];
            const isSelec = seleccionado?.id === lider.id;
            const avatarSize = era.size;

            return (
              <g
                key={lider.id}
                className="lve-nodo-empresa"
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSeleccionado(isSelec ? null : lider)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glow */}
                {isSelec && (
                  <circle
                    cx={0} cy={0} r={avatarSize / 2 + 12}
                    fill={era.glow} opacity={0.6}
                  />
                )}

                {/* Ring */}
                <circle
                  cx={0} cy={0} r={avatarSize / 2 + 4}
                  fill="none"
                  stroke={era.color}
                  strokeWidth={lider.esActual ? 3 : 1.5}
                  strokeDasharray={lider.esActual ? 'none' : '3,2'}
                  opacity={0.8}
                />

                {/* Avatar background */}
                <circle cx={0} cy={0} r={avatarSize / 2} fill="white" />

                {/* Foto */}
                {lider.foto && (
                  <clipPath id={`clip-${lider.id}`}>
                    <circle cx={0} cy={0} r={avatarSize / 2 - 2} />
                  </clipPath>
                )}
                {lider.foto && (
                  <image
                    href={lider.foto}
                    x={-(avatarSize / 2 - 2)}
                    y={-(avatarSize / 2 - 2)}
                    width={avatarSize - 4}
                    height={avatarSize - 4}
                    clipPath={`url(#clip-${lider.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                )}

                {/* Badge actual */}
                {lider.esActual && (
                  <circle
                    cx={avatarSize / 2 - 4}
                    cy={-(avatarSize / 2 - 4)}
                    r={7}
                    fill="#4a7a4e"
                  />
                )}

                {/* Nombre */}
                <text
                  x={0} y={avatarSize / 2 + 16}
                  textAnchor="middle"
                  className="ae-nodo-nombre"
                  style={{ fontSize: lider.era === 0 ? '13px' : '11px', fontWeight: 700, fill: '#03192e' }}
                >
                  {lider.nombre.split(' ').slice(0, 2).join(' ')}
                </text>

                {/* Cargo */}
                <text
                  x={0} y={avatarSize / 2 + 30}
                  textAnchor="middle"
                  style={{ fontSize: '9px', fill: era.color, fontWeight: 600 }}
                >
                  {(lider.cargoPersonalizado || lider.cargo).split(' ').slice(0, 3).join(' ')}
                </text>

                {/* Años */}
                <text
                  x={0} y={avatarSize / 2 + 42}
                  textAnchor="middle"
                  style={{ fontSize: '8px', fill: '#8A8279' }}
                >
                  {lider.desde} – {lider.hasta}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── PANEL LATERAL — Info del nodo seleccionado ── */}
      {seleccionado && (
        <div className="ae-panel">
          <div className="ae-panel__header">
            <img
              src={seleccionado.foto || 'https://i.pravatar.cc/80?img=1'}
              alt={seleccionado.nombre}
              className="ae-panel__avatar"
            />
            <div className="ae-panel__info">
              <div className="ae-panel__nombre-wrap">
                <h3 className="ae-panel__nombre">{seleccionado.nombre}</h3>
                {seleccionado.esActual && (
                  <span className="ae-panel__actual-badge">Activo</span>
                )}
              </div>
              <span className="ae-panel__cargo">
                {seleccionado.cargoPersonalizado || seleccionado.cargo}
              </span>
              <div className="ae-panel__meta">
                <span>
                  <Calendar size={12} strokeWidth={1.8} />
                  {seleccionado.desde} – {seleccionado.hasta}
                </span>
                <span>
                  <MapPin size={12} strokeWidth={1.8} />
                  {seleccionado.bandera} {seleccionado.pais}
                </span>
              </div>
            </div>
            <button className="ae-panel__close" onClick={() => setSeleccionado(null)}>
              <X size={18} strokeWidth={1.8} />
            </button>
          </div>

          <div className="ae-panel__body">
            {/* Era badge */}
            <div
              className="ae-panel__era-badge"
              style={{
                background: `${ERA_CONFIG[Math.min(seleccionado.era, ERA_CONFIG.length - 1)].color}12`,
                color: ERA_CONFIG[Math.min(seleccionado.era, ERA_CONFIG.length - 1)].color,
              }}
            >
              <Clock size={12} strokeWidth={1.8} />
              {ERA_CONFIG[Math.min(seleccionado.era, ERA_CONFIG.length - 1)].label}
            </div>

            {/* Bio */}
            <div className="ae-panel__seccion">
              <h4>
                <User size={13} strokeWidth={1.8} />
                Sobre {seleccionado.nombre.split(' ')[0]}
              </h4>
              <p>{seleccionado.bio}</p>
            </div>

            {/* Logros */}
            {seleccionado.logros.length > 0 && (
              <div className="ae-panel__seccion">
                <h4>
                  <Award size={13} strokeWidth={1.8} />
                  Logros durante su gestión
                </h4>
                <ul>
                  {seleccionado.logros.map((l, i) => (
                    <li key={i}>
                      <Check size={11} strokeWidth={2.5} />
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sucesor */}
            {(() => {
              const sucesor = lideres.find(l => l.parentId === seleccionado.id && l.era === seleccionado.era + 1);
              return sucesor ? (
                <div className="ae-panel__sucesor">
                  <span className="ae-panel__sucesor-label">Sucesor</span>
                  <button
                    className="ae-panel__sucesor-card"
                    onClick={() => setSeleccionado(sucesor)}
                  >
                    <img src={sucesor.foto} alt={sucesor.nombre} />
                    <div>
                      <span>{sucesor.nombre}</span>
                      <span>{sucesor.cargo}</span>
                    </div>
                    <ChevronRight size={14} strokeWidth={1.8} />
                  </button>
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* ════ MODAL AGREGAR LÍDER ════ */}
      {modalAdd && (
        <div className="ae-overlay" onClick={() => setModalAdd(false)}>
          <div className="ae-modal" onClick={e => e.stopPropagation()}>
            <div className="ae-modal__handle"><div className="ae-modal__bar" /></div>
            <div className="ae-modal__header">
              <h3>Agregar al árbol de liderazgo</h3>
              <button onClick={() => setModalAdd(false)}>
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>
            <div className="ae-modal__body">
              <div className="ae-modal__grupo">
                <label>Nombre completo *</label>
                <input className="ae-modal__input" placeholder="Ej: Juan Carlos Pérez"
                  value={nNombre} onChange={e => setNNombre(e.target.value)} />
              </div>
              <div className="ae-modal__grupo">
                <label>Cargo *</label>
                <input className="ae-modal__input" placeholder="Ej: Presidente, CEO, Director de Finanzas"
                  value={nCargo} onChange={e => setNCargo(e.target.value)} />
              </div>
              <div className="ae-modal__grid-2">
                <div className="ae-modal__grupo">
                  <label>Desde (año)</label>
                  <input className="ae-modal__input" placeholder="Ej: 2024"
                    value={nDesde} onChange={e => setNDesde(e.target.value)} />
                </div>
                <div className="ae-modal__grupo">
                  <label>Hasta (año)</label>
                  <input className="ae-modal__input" placeholder="Ej: 2028" disabled={nActual}
                    value={nActual ? 'Actualidad' : nHasta}
                    onChange={e => setNHasta(e.target.value)} />
                </div>
              </div>

              {/* Toggle actualmente en el cargo */}
              <div className="ae-modal__toggle-row">
                <div>
                  <label>Actualmente en el cargo</label>
                  <p className="ae-modal__toggle-desc">Se mostrará con badge verde "Activo"</p>
                </div>
                <div className={`ae-toggle${nActual ? ' on' : ''}`} onClick={() => setNActual(!nActual)}>
                  <div className="ae-toggle__thumb" />
                </div>
              </div>

              {/* Era */}
              <div className="ae-modal__grupo">
                <label>Era / Nivel en el árbol</label>
                <div className="ae-modal__eras">
                  {ERA_CONFIG.map((e, i) => (
                    <button
                      key={i}
                      className={`ae-modal__era-btn${nEra === i ? ' active' : ''}`}
                      style={nEra === i ? { background: e.color, color: 'white', borderColor: e.color } : {}}
                      onClick={() => setNEra(i)}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Depende de */}
              <div className="ae-modal__grupo">
                <label>Reporta a / Sucesor de</label>
                <select className="ae-modal__input" value={nParent}
                  onChange={e => setNParent(parseInt(e.target.value))}>
                  {lideres.map(l => (
                    <option key={l.id} value={l.id}>{l.nombre} — {l.cargo}</option>
                  ))}
                </select>
              </div>

              <div className="ae-modal__grupo">
                <label>Breve bio</label>
                <textarea className="ae-modal__textarea" rows={3}
                  placeholder="Descripción breve de su rol y trayectoria..."
                  value={nBio} onChange={e => setNBio(e.target.value)} />
              </div>
            </div>
            <div className="ae-modal__footer">
              <button className="ae-modal__cancelar" onClick={() => setModalAdd(false)}>Cancelar</button>
              <button className="ae-modal__guardar" onClick={agregarLider}>
                <Check size={15} strokeWidth={2} />
                Agregar al árbol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="ae-toast">
          <Check size={13} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
