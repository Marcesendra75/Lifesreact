// ============================================
// LIFE'S — Árbol Genealógico
// El estandarte del proyecto
// ============================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './FamilyTree.scss';

// ── Tipos ──
interface TreeNode {
  id: number;
  name: string;
  role: string;
  gen: number;
  parentId: number | null;
  birth?: string;
  death?: string;
  country?: string;
  countryFlag?: string;
  desc?: string;
  img?: string;
  isDead?: boolean;
  dnaPercent?: number;
}

type FamilyTab = 'all' | 'yo' | 'pareja' | 'hijos' | 'padres' | 'abuelos' | 'bisabuelos' | 'hermanos';

// ── Datos iniciales ──
const INITIAL_DATA: TreeNode[] = [
  {
    id: 1, name: 'Julian Valenzuela', role: 'Yo', gen: 0, parentId: null,
    birth: '15 Abr 1978', country: 'Argentina', countryFlag: '🇦🇷',
    desc: '"Preservo lo que el tiempo intentará olvidar."',
    dnaPercent: 100,
    img: 'https://i.pravatar.cc/80?img=11',
  },
  {
    id: 2, name: 'Ricardo Valenzuela', role: 'Padre', gen: 1, parentId: 1,
    birth: '3 Jun 1950', country: 'Argentina', countryFlag: '🇦🇷',
    desc: 'Carpintero de oficio, filósofo de corazón.',
    dnaPercent: 50,
    img: 'https://i.pravatar.cc/80?img=60',
  },
  {
    id: 3, name: 'Isabel Morales', role: 'Madre', gen: 1, parentId: 1,
    birth: '22 Sep 1953', country: 'Argentina', countryFlag: '🇦🇷',
    desc: 'Maestra rural. Sus palabras construyeron generaciones.',
    dnaPercent: 50,
    img: 'https://i.pravatar.cc/80?img=47',
  },
  {
    id: 4, name: 'Arthur Valenzuela', role: 'Abuelo paterno', gen: 2, parentId: 2,
    birth: '11 Ene 1922', death: '3 Mar 1998', country: 'Italia', countryFlag: '🇮🇹',
    desc: 'Emigró de Génova en 1946 con una maleta y un sueño.',
    dnaPercent: 25, isDead: true,
    img: 'https://i.pravatar.cc/80?img=70',
  },
  {
    id: 5, name: 'Elena Vance', role: 'Esposa', gen: 1, parentId: 1,
    birth: '5 Mar 1980', country: 'Argentina', countryFlag: '🇦🇷',
    desc: 'El ancla y la brisa de nuestra historia compartida.',
    dnaPercent: 50,
    img: 'https://i.pravatar.cc/80?img=25',
  },
  {
    id: 6, name: 'Rosa Ferretti', role: 'Abuela paterna', gen: 2, parentId: 2,
    birth: '20 May 1925', death: '14 Jul 2010', country: 'Italia', countryFlag: '🇮🇹',
    desc: 'Cocinera de alma, guardiana de recetas centenarias.',
    dnaPercent: 25, isDead: true,
    img: 'https://i.pravatar.cc/80?img=45',
  },
  {
    id: 7, name: 'Carlos Morales', role: 'Abuelo materno', gen: 2, parentId: 3,
    birth: '8 Feb 1928', death: '22 Nov 2005', country: 'España', countryFlag: '🇪🇸',
    desc: 'Músico y poeta. Llegó de Sevilla buscando horizontes.',
    dnaPercent: 25, isDead: true,
    img: 'https://i.pravatar.cc/80?img=65',
  },
  {
    id: 8, name: 'Lucía Paz', role: 'Abuela materna', gen: 2, parentId: 3,
    birth: '14 Oct 1930', country: 'Argentina', countryFlag: '🇦🇷',
    desc: 'Tejedora de historias, coleccionista de silencios.',
    dnaPercent: 25,
    img: 'https://i.pravatar.cc/80?img=44',
  },
];

// ── Mapa de categorías ──
const CATEGORY_MAP: Record<FamilyTab, (n: TreeNode) => boolean> = {
  all:        () => true,
  yo:         n => n.gen === 0,
  pareja:     n => ['Esposo/a','Esposa','Esposo','Cónyuge','Pareja'].includes(n.role),
  hijos:      n => ['Hijo/a','Hijo','Hija','Nieto/a','Nieto','Nieta'].includes(n.role) || n.gen === -1,
  padres:     n => ['Padre','Madre'].includes(n.role),
  abuelos:    n => n.role.toLowerCase().includes('abuelo') || n.role.toLowerCase().includes('abuela'),
  bisabuelos: n => n.role.toLowerCase().includes('bisabuelo') || n.role.toLowerCase().includes('bisabuela') || n.gen === 3,
  hermanos:   n => ['Hermano/a','Hermano','Hermana','Medio hermano/a'].includes(n.role),
};

const TABS = [
  { id: 'all' as FamilyTab,        icon: 'groups',            label: 'Todos' },
  { id: 'yo' as FamilyTab,         icon: 'person',            label: 'Yo' },
  { id: 'pareja' as FamilyTab,     icon: 'favorite',          label: 'Pareja' },
  { id: 'hijos' as FamilyTab,      icon: 'child_care',        label: 'Hijos' },
  { id: 'padres' as FamilyTab,     icon: 'escalator_warning', label: 'Padres' },
  { id: 'abuelos' as FamilyTab,    icon: 'elderly',           label: 'Abuelos' },
  { id: 'bisabuelos' as FamilyTab, icon: 'history',           label: 'Bisabuelos' },
  { id: 'hermanos' as FamilyTab,   icon: 'group',             label: 'Hermanos' },
];

// ── Colores por generación ──
const GEN_COLORS = [
  { ring: 'linear-gradient(135deg,#C9A84C,#ffe088)', size: 76, glow: 'rgba(201,168,76,0.4)' },   // gen 0 — dorado
  { ring: 'linear-gradient(135deg,#855324,#03192e)', size: 62, glow: 'rgba(133,83,36,0.3)' },    // gen 1 — cobre
  { ring: 'linear-gradient(135deg,#03192e,#1a2e44)', size: 52, glow: 'rgba(3,25,46,0.25)' },     // gen 2 — azul noche
  { ring: 'linear-gradient(135deg,#74777d,#c4c6cd)', size: 42, glow: 'rgba(116,119,125,0.2)' },  // gen 3 — plata
];

function getGenConfig(gen: number) {
  const idx = Math.min(Math.abs(gen), GEN_COLORS.length - 1);
  return GEN_COLORS[idx];
}

// ── Layout de posiciones ──
function computeLayout(nodes: TreeNode[], W: number, H: number) {
  const scaleX = W / 800;
  const scaleY = H / 560;

  const ANCHOR: Record<string, { x: number; y: number }> = {
    root:       { x: 400, y: 300 },
    padre:      { x: 220, y: 195 },
    madre:      { x: 580, y: 195 },
    pareja:     { x: 400, y: 120 },
    hermano:    { x: 260, y: 155 },
    extra1:     { x: 540, y: 155 },
    abueloPat1: { x: 95,  y: 80  },
    abueloPat2: { x: 210, y: 90  },
    abueloMat1: { x: 590, y: 90  },
    abueloMat2: { x: 705, y: 80  },
    extra2a:    { x: 400, y: 42  },
    extra2b:    { x: 320, y: 100 },
    bisa1:      { x: 60,  y: 42  },
    bisa2:      { x: 145, y: 50  },
    bisa3:      { x: 655, y: 50  },
    bisa4:      { x: 740, y: 42  },
    bisa5:      { x: 480, y: 100 },
    hijo1:      { x: 270, y: 490 },
    hijo2:      { x: 400, y: 510 },
    hijo3:      { x: 530, y: 490 },
    hijo4:      { x: 180, y: 525 },
    hijo5:      { x: 620, y: 525 },
  };

  const toReal = (pt: { x: number; y: number }) => ({
    x: pt.x * scaleX,
    y: pt.y * scaleY,
  });

  const positions: Record<number, { x: number; y: number }> = {};

  // Gen 0
  const gen0 = nodes.find(n => n.gen === 0);
  if (gen0) positions[gen0.id] = toReal(ANCHOR.root);

  // Gen 1
  const gen1Anchors = [ANCHOR.padre, ANCHOR.madre, ANCHOR.pareja, ANCHOR.hermano, ANCHOR.extra1];
  const gen1 = nodes.filter(n => n.gen === 1);
  gen1.forEach((n, i) => { positions[n.id] = toReal(gen1Anchors[i % gen1Anchors.length]); });

  // Gen 2
  const gen2Anchors = [ANCHOR.abueloPat1, ANCHOR.abueloPat2, ANCHOR.abueloMat1, ANCHOR.abueloMat2, ANCHOR.extra2a, ANCHOR.extra2b];
  const gen2 = nodes.filter(n => n.gen === 2);
  gen2.forEach((n, i) => { positions[n.id] = toReal(gen2Anchors[i % gen2Anchors.length]); });

  // Gen 3
  const gen3Anchors = [ANCHOR.bisa1, ANCHOR.bisa2, ANCHOR.bisa3, ANCHOR.bisa4, ANCHOR.bisa5];
  const gen3 = nodes.filter(n => n.gen === 3);
  gen3.forEach((n, i) => { positions[n.id] = toReal(gen3Anchors[i % gen3Anchors.length]); });

  // Hijos
  const hijoAnchors = [ANCHOR.hijo1, ANCHOR.hijo2, ANCHOR.hijo3, ANCHOR.hijo4, ANCHOR.hijo5];
  const hijos = nodes.filter(n => n.gen === -1);
  hijos.forEach((n, i) => { positions[n.id] = toReal(hijoAnchors[i % hijoAnchors.length]); });

  return positions;
}

export default function FamilyTree() {
  const navigate = useNavigate();

  const [treeData, setTreeData]         = useState<TreeNode[]>(INITIAL_DATA);
  const [zoom, setZoom]                 = useState(1);
  const [panX, setPanX]                 = useState(0);
  const [panY, setPanY]                 = useState(0);
  const [isDragging, setIsDragging]     = useState(false);
  const [dragStart, setDragStart]       = useState({ x: 0, y: 0 });
  const [modalNode, setModalNode]       = useState<TreeNode | null>(null);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQ, setSearchQ]           = useState('');
  const [activeTab, setActiveTab]       = useState<FamilyTab>('all');
  const [panelOpen, setPanelOpen]       = useState(false);
  const [highlightPath, setHighlightPath] = useState<number[]>([]);
  const [wrapSize, setWrapSize]         = useState({ w: 800, h: 560 });

  // Nuevo miembro
  const [newName, setNewName]     = useState('');
  const [newRole, setNewRole]     = useState('');
  const [newBirth, setNewBirth]   = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [newParent, setNewParent] = useState(1);
  const [newDead, setNewDead]     = useState(false);

  const wrapRef  = useRef<HTMLDivElement>(null);
  const svgRef   = useRef<SVGSVGElement>(null);

  // Medir el wrap
  useEffect(() => {
    const measure = () => {
      if (wrapRef.current) {
        setWrapSize({ w: wrapRef.current.clientWidth, h: wrapRef.current.clientHeight });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const positions = computeLayout(treeData, wrapSize.w, wrapSize.h);

  // ── Calcular camino de ascendencia ──
  const getAncestorPath = (nodeId: number): number[] => {
    const path: number[] = [nodeId];
    let current = treeData.find(n => n.id === nodeId);
    while (current?.parentId) {
      path.push(current.parentId);
      current = treeData.find(n => n.id === current!.parentId);
    }
    return path;
  };

  // ── Abrir modal ──
  const openModal = (node: TreeNode) => {
    setModalNode(node);
    const path = getAncestorPath(node.id);
    setHighlightPath(path);
  };

  const closeModal = () => {
    setModalNode(null);
    setHighlightPath([]);
  };

  // ── Agregar persona ──
  const addPerson = () => {
    if (!newName.trim() || !newRole) return;

    const parentNode = treeData.find(n => n.id === newParent);
    const genFinal =
      ['Hijo/a','Hijo','Hija','Nieto/a'].includes(newRole) ? -1 :
      ['Abuelo paterno','Abuela paterna','Abuelo materno','Abuela materna'].includes(newRole) ? 2 :
      ['Bisabuelo/a'].includes(newRole) ? 3 : 1;

    const flagMap: Record<string, string> = {
      Argentina: '🇦🇷', Italia: '🇮🇹', España: '🇪🇸', Uruguay: '🇺🇾',
      Chile: '🇨🇱', Brasil: '🇧🇷', Francia: '🇫🇷', Alemania: '🇩🇪',
      México: '🇲🇽', Colombia: '🇨🇴', Perú: '🇵🇪',
    };

    const newId = Math.max(...treeData.map(n => n.id)) + 1;
    const parentDna = parentNode?.dnaPercent || 50;

    setTreeData(prev => [...prev, {
      id: newId,
      name: newName.trim(),
      role: newRole,
      gen: genFinal,
      parentId: newParent,
      birth: newBirth,
      country: newCountry,
      countryFlag: flagMap[newCountry] || '🌍',
      desc: newDesc,
      dnaPercent: Math.round(parentDna / 2),
      isDead: newDead,
      img: `https://i.pravatar.cc/80?img=${newId + 20}`,
    }]);

    setAddPanelOpen(false);
    setNewName(''); setNewRole(''); setNewBirth('');
    setNewCountry(''); setNewDesc(''); setNewDead(false);
  };

  // ── Stats ──
  const stats = {
    personas:     treeData.length,
    generaciones: [...new Set(treeData.map(n => Math.abs(n.gen)))].length,
    paises:       [...new Set(treeData.filter(n => n.country).map(n => n.country))].length,
  };

  // ── Filtro de búsqueda ──
  const filteredIds = searchQ
    ? treeData.filter(n =>
        n.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        n.role.toLowerCase().includes(searchQ.toLowerCase())
      ).map(n => n.id)
    : null;

  // ── Dibujar ramas SVG ──
  const renderBranches = () => {
    return treeData.map(node => {
      if (!node.parentId) return null;
      const from = positions[node.parentId];
      const to   = positions[node.id];
      if (!from || !to) return null;

      const isHighlighted = highlightPath.includes(node.id) && highlightPath.includes(node.parentId);
      const pathLen = Math.hypot(to.x - from.x, to.y - from.y);
      const cx1 = from.x + (to.x - from.x) * 0.2;
      const cy1 = from.y + pathLen * 0.2;
      const cx2 = to.x - (to.x - from.x) * 0.2;
      const cy2 = to.y - pathLen * 0.15;

      const genConfig = getGenConfig(node.gen);
      const strokeColor = isHighlighted ? '#C9A84C' :
        node.gen === 1 ? '#a0948a' :
        node.gen === 2 ? '#b8aea8' : '#c4c6cd';
      const strokeW = isHighlighted ? 3 :
        node.gen === 1 ? 2.5 :
        node.gen === 2 ? 2 : 1.5;

      return (
        <path
          key={`branch-${node.id}`}
          d={`M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`}
          stroke={strokeColor}
          strokeWidth={strokeW}
          fill="none"
          strokeLinecap="round"
          className={`ft-branch ${isHighlighted ? 'ft-branch--highlight' : ''}`}
          style={{
            opacity: (filteredIds && !filteredIds.includes(node.id)) ? 0.1 : 1,
            transition: 'all 0.4s ease',
          }}
        />
      );
    });
  };

  return (
    <div className="ft-root">

      {/* ── HEADER ── */}
      <header className="ft-header">
        <div className="ft-header__left">
          <button className="ft-header__back" onClick={() => navigate('/feed')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="ft-header__title">Árbol Genealógico</h1>
            <p className="ft-header__sub">{stats.personas} personas · {stats.generaciones} generaciones</p>
          </div>
        </div>
        <div className="ft-header__actions">
          <button className="ft-header__btn" onClick={() => setSearchOpen(!searchOpen)}>
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="ft-header__btn">
            <span className="material-symbols-outlined">share</span>
          </button>
          <div className="ft-header__avatar">
            <img src="https://i.pravatar.cc/32?img=11" alt="" />
          </div>
        </div>
      </header>

      {/* ── BARRA DE BÚSQUEDA ── */}
      {searchOpen && (
        <div className="ft-search-bar">
          <span className="material-symbols-outlined">search</span>
          <input
            autoFocus
            placeholder="Buscar familiar..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          {searchQ && (
            <button onClick={() => setSearchQ('')}>
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      )}

      {/* ══ ÁRBOL CANVAS ══ */}
      <div
        className={`ft-wrap ${isDragging ? 'ft-wrap--dragging' : ''}`}
        ref={wrapRef}
        onMouseDown={e => {
          if ((e.target as HTMLElement).closest('.ft-node')) return;
          setIsDragging(true);
          setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
        }}
        onMouseMove={e => {
          if (!isDragging) return;
          setPanX(e.clientX - dragStart.x);
          setPanY(e.clientY - dragStart.y);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Árbol artístico de fondo */}
        <svg className="ft-bg-tree" viewBox="0 0 800 560" preserveAspectRatio="xMidYMax meet">
          {/* Raíces */}
          <g fill="none" stroke="#03192e" strokeLinecap="round">
            <path strokeWidth="9"  d="M400 440 Q340 460 270 490 Q230 505 180 520"/>
            <path strokeWidth="7"  d="M400 440 Q360 465 320 495 Q290 510 260 530"/>
            <path strokeWidth="6"  d="M400 440 Q395 460 390 490 Q387 510 385 535"/>
            <path strokeWidth="6"  d="M400 440 Q420 458 445 482 Q460 500 470 525"/>
            <path strokeWidth="7"  d="M400 440 Q440 460 490 488 Q530 508 570 522"/>
            <path strokeWidth="4"  d="M270 490 Q240 500 210 515"/>
            <path strokeWidth="3"  d="M320 495 Q295 510 275 528"/>
            <path strokeWidth="4"  d="M490 488 Q510 500 530 520"/>
          </g>
          {/* Tronco */}
          <path fill="none" stroke="#03192e" strokeLinecap="round" strokeWidth="28" d="M400 440 Q398 390 395 350 Q392 310 390 270"/>
          <path fill="none" stroke="#03192e" strokeLinecap="round" strokeWidth="22" d="M390 270 Q388 240 385 210 Q382 180 378 155"/>
          {/* Ramas */}
          <g fill="none" stroke="#03192e" strokeLinecap="round">
            <path strokeWidth="14" d="M390 270 Q360 255 330 235 Q300 215 270 195"/>
            <path strokeWidth="10" d="M270 195 Q245 180 218 162 Q195 148 175 132"/>
            <path strokeWidth="7"  d="M175 132 Q155 118 135 105 Q115 92 98 80"/>
            <path strokeWidth="14" d="M390 270 Q420 252 450 232 Q478 214 508 196"/>
            <path strokeWidth="10" d="M508 196 Q535 180 562 162 Q586 146 608 130"/>
            <path strokeWidth="7"  d="M608 130 Q628 116 648 103 Q668 90 685 78"/>
            <path strokeWidth="12" d="M385 210 Q384 185 382 162 Q380 140 378 118"/>
            <path strokeWidth="8"  d="M378 118 Q376 98 374 80 Q372 62 370 46"/>
            <path strokeWidth="8"  d="M330 235 Q315 215 298 195 Q282 175 265 158"/>
            <path strokeWidth="8"  d="M450 232 Q465 212 480 192 Q495 172 510 155"/>
          </g>
          {/* Copa — follaje con colores vivos */}
          <g>
            <ellipse cx="370" cy="46"  rx="62" ry="48" fill="#2d6a4f" opacity="0.85"/>
            <ellipse cx="320" cy="60"  rx="48" ry="40" fill="#40916c" opacity="0.80"/>
            <ellipse cx="420" cy="55"  rx="52" ry="42" fill="#52b788" opacity="0.75"/>
            <ellipse cx="370" cy="28"  rx="44" ry="34" fill="#74c69d" opacity="0.70"/>
            <ellipse cx="98"  cy="65"  rx="46" ry="38" fill="#2d6a4f" opacity="0.78"/>
            <ellipse cx="148" cy="92"  rx="40" ry="32" fill="#40916c" opacity="0.72"/>
            <ellipse cx="72"  cy="48"  rx="32" ry="26" fill="#52b788" opacity="0.68"/>
            <ellipse cx="685" cy="64"  rx="46" ry="38" fill="#2d6a4f" opacity="0.78"/>
            <ellipse cx="632" cy="90"  rx="40" ry="32" fill="#40916c" opacity="0.72"/>
            <ellipse cx="706" cy="46"  rx="32" ry="26" fill="#52b788" opacity="0.68"/>
            <ellipse cx="188" cy="80"  rx="34" ry="28" fill="#40916c" opacity="0.65"/>
            <ellipse cx="235" cy="112" rx="30" ry="24" fill="#52b788" opacity="0.62"/>
            <ellipse cx="586" cy="80"  rx="34" ry="28" fill="#40916c" opacity="0.65"/>
            <ellipse cx="535" cy="110" rx="30" ry="24" fill="#52b788" opacity="0.62"/>
            {/* Detalles dorados — flores / frutos */}
            <circle cx="370" cy="35"  r="5" fill="#C9A84C" opacity="0.9"/>
            <circle cx="98"  cy="52"  r="4" fill="#C9A84C" opacity="0.85"/>
            <circle cx="685" cy="52"  r="4" fill="#C9A84C" opacity="0.85"/>
            <circle cx="320" cy="48"  r="3" fill="#ffe088" opacity="0.8"/>
            <circle cx="420" cy="44"  r="3" fill="#ffe088" opacity="0.8"/>
            <circle cx="148" cy="80"  r="3" fill="#ffe088" opacity="0.75"/>
            <circle cx="632" cy="78"  r="3" fill="#ffe088" opacity="0.75"/>
          </g>
        </svg>

        {/* SVG de conexiones */}
        <svg
          ref={svgRef}
          className="ft-svg"
          style={{ transform: `translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {renderBranches()}
        </svg>

        {/* Nodos */}
        <div
          className="ft-nodes"
          style={{ transform: `translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin: 'center center' }}
        >
          {treeData.map((node, ni) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const cfg = getGenConfig(node.gen);
            const isHighlighted = highlightPath.includes(node.id);
            const isFiltered = filteredIds ? !filteredIds.includes(node.id) : false;

            return (
              <div
                key={node.id}
                className={`ft-node ${node.isDead ? 'ft-node--dead' : ''} ${isHighlighted ? 'ft-node--highlight' : ''}`}
                style={{
                  left: pos.x, top: pos.y,
                  animationDelay: `${ni * 0.08}s`,
                  opacity: isFiltered ? 0.12 : 1,
                  pointerEvents: isFiltered ? 'none' : 'all',
                }}
                onClick={() => openModal(node)}
              >
                {/* Glow de fondo */}
                <div
                  className="ft-node__glow"
                  style={{ background: cfg.glow, opacity: isHighlighted ? 1 : 0.5 }}
                />

                {/* Anillo */}
                <div
                  className="ft-node__ring"
                  style={{
                    background: isHighlighted ? 'linear-gradient(135deg,#C9A84C,#ffe088)' : cfg.ring,
                    width: cfg.size + 8, height: cfg.size + 8,
                  }}
                >
                  {/* Foto */}
                  {node.img ? (
                    <img
                      src={node.img}
                      alt={node.name}
                      className="ft-node__img"
                      style={{
                        width: cfg.size, height: cfg.size,
                        filter: node.isDead ? 'grayscale(0.7) sepia(0.3)' : 'none',
                      }}
                    />
                  ) : (
                    <div className="ft-node__initials" style={{ width: cfg.size, height: cfg.size }}>
                      {node.name.charAt(0)}
                    </div>
                  )}

                  {/* Vela para fallecidos */}
                  {node.isDead && (
                    <div className="ft-node__candle">🕯️</div>
                  )}

                  {/* Bandera país */}
                  {node.countryFlag && (
                    <div className="ft-node__flag">{node.countryFlag}</div>
                  )}
                </div>

                {/* Nombre */}
                <div className="ft-node__name" style={{ maxWidth: cfg.size + 32 }}>
                  {node.name.split(' ')[0]}
                </div>
                <div className="ft-node__role">{node.role}</div>
              </div>
            );
          })}
        </div>

        {/* Controles de zoom */}
        <div className="ft-zoom">
          <button className="ft-zoom__btn" onClick={() => setZoom(z => Math.min(2, z + 0.15))}>
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="ft-zoom__btn" onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}>
            <span className="material-symbols-outlined">remove</span>
          </button>
          <button className="ft-zoom__btn" onClick={() => { setZoom(1); setPanX(0); setPanY(0); }}>
            <span className="material-symbols-outlined">center_focus_strong</span>
          </button>
        </div>

        {/* Leyenda */}
        <div className="ft-leyenda">
          {[
            { grad: 'linear-gradient(135deg,#C9A84C,#ffe088)', label: 'Tú' },
            { grad: 'linear-gradient(135deg,#855324,#03192e)', label: 'Padres / Pareja' },
            { grad: 'linear-gradient(135deg,#03192e,#1a2e44)', label: 'Abuelos / Hijos' },
            { grad: 'linear-gradient(135deg,#74777d,#c4c6cd)', label: 'Bisabuelos' },
          ].map(l => (
            <div key={l.label} className="ft-leyenda__item">
              <div className="ft-leyenda__dot" style={{ background: l.grad }} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PANEL INFO + TABS ══ */}
      <div className="ft-panel-wrap">
        <div className="ft-stats">
          <div className="ft-stats__header">
            <div>
              <h2 className="ft-stats__title">El Linaje Vivo</h2>
              <p className="ft-stats__sub">Tocá una categoría para filtrar</p>
            </div>
            <div className="ft-stats__nums">
              {[
                { val: stats.personas,     label: 'Personas' },
                { val: stats.generaciones, label: 'Gen.' },
                { val: stats.paises,       label: 'Países' },
              ].map(s => (
                <div key={s.label} className="ft-stat-num">
                  <span className="ft-stat-num__val">{s.val}</span>
                  <span className="ft-stat-num__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="ft-tabs">
            {TABS.map(tab => {
              const count = treeData.filter(CATEGORY_MAP[tab.id]).length;
              return (
                <button
                  key={tab.id}
                  className={`ft-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPanelOpen(true);
                  }}
                >
                  <span className="material-symbols-outlined"
                    style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                  {count > 0 && <span className="ft-tab__count">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Lista expandible */}
          {panelOpen && (
            <div className="ft-family-list">
              <div className="ft-family-list__header">
                <span>{TABS.find(t => t.id === activeTab)?.label} · {treeData.filter(CATEGORY_MAP[activeTab]).length} personas</span>
                <button onClick={() => setPanelOpen(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {treeData.filter(CATEGORY_MAP[activeTab]).length === 0 ? (
                <div className="ft-family-list__empty">
                  <span className="material-symbols-outlined">person_search</span>
                  <p>Aún no hay personas en esta categoría</p>
                  <button onClick={() => setAddPanelOpen(true)}>Agregar ahora</button>
                </div>
              ) : (
                treeData.filter(CATEGORY_MAP[activeTab]).map(node => (
                  <div key={node.id} className="ft-person-card" onClick={() => openModal(node)}>
                    <div className="ft-person-card__ring" style={{ background: getGenConfig(node.gen).ring }}>
                      <img src={node.img || `https://i.pravatar.cc/44?img=${node.id}`} alt={node.name}
                        style={{ filter: node.isDead ? 'grayscale(0.6) sepia(0.3)' : 'none' }} />
                    </div>
                    <div className="ft-person-card__info">
                      <div className="ft-person-card__name">
                        {node.name} {node.isDead ? '🕯️' : ''} {node.countryFlag}
                      </div>
                      <div className="ft-person-card__role">{node.role}</div>
                      {node.birth && <div className="ft-person-card__birth">{node.birth}{node.death ? ` — ${node.death}` : ''}</div>}
                    </div>
                    <span className="material-symbols-outlined ft-person-card__arrow">chevron_right</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Botón agregar */}
        <div className="ft-add-wrap">
          <button className="ft-add-btn" onClick={() => setAddPanelOpen(true)}>
            <span className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              person_add
            </span>
            Agregar persona al árbol
          </button>
          <div className="ft-quick-actions">
            {[
              { icon: 'photo_album',  label: 'Recuerdos', path: '/feed' },
              { icon: 'map',          label: 'Mapa linaje', path: '/mapa-linaje' },
              { icon: 'download',     label: 'Exportar', path: '/feed' },
            ].map(a => (
              <button key={a.label} className="ft-quick-action" onClick={() => navigate(a.path)}>
                <span className="material-symbols-outlined">{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MODAL — Ver persona ══ */}
      {modalNode && (
        <div className="ft-modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="ft-modal">
            {/* Banner */}
            <div className="ft-modal__banner" style={{ background: getGenConfig(modalNode.gen).ring }}>
              {modalNode.isDead && <div className="ft-modal__dead-overlay" />}
              <button className="ft-modal__close" onClick={closeModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="ft-modal__avatar-wrap">
                <div className="ft-modal__avatar-ring" style={{ background: getGenConfig(modalNode.gen).ring }}>
                  <img
                    src={modalNode.img || `https://i.pravatar.cc/72?img=${modalNode.id}`}
                    alt={modalNode.name}
                    style={{ filter: modalNode.isDead ? 'grayscale(0.5) sepia(0.4)' : 'none' }}
                  />
                </div>
                {modalNode.isDead && <div className="ft-modal__candle-big">🕯️</div>}
              </div>
            </div>

            <div className="ft-modal__body">
              {/* Nombre y rol */}
              <div className="ft-modal__head">
                <h3 className="ft-modal__name">
                  {modalNode.name} {modalNode.countryFlag}
                </h3>
                <span className="ft-modal__role">{modalNode.role}</span>
                {modalNode.isDead && <span className="ft-modal__dead-badge">✝ En memoria</span>}
              </div>

              {/* DNA */}
              {modalNode.dnaPercent && (
                <div className="ft-modal__dna">
                  <div className="ft-modal__dna-header">
                    <span>ADN compartido</span>
                    <span className="ft-modal__dna-val">{modalNode.dnaPercent}%</span>
                  </div>
                  <div className="ft-modal__dna-bar">
                    <div className="ft-modal__dna-fill" style={{ width: `${modalNode.dnaPercent}%` }} />
                  </div>
                </div>
              )}

              {/* Datos */}
              <div className="ft-modal__grid">
                {[
                  { icon: 'cake',           label: 'Nacimiento', val: modalNode.birth || '—' },
                  { icon: 'public',         label: 'País',       val: `${modalNode.countryFlag || ''} ${modalNode.country || '—'}` },
                  { icon: 'family_restroom',label: 'Parentesco', val: modalNode.role },
                  { icon: 'account_tree',   label: 'Generación', val: modalNode.gen === 0 ? 'Tú' : `Gen. ${Math.abs(modalNode.gen)}` },
                  ...(modalNode.death ? [{ icon: 'sentiment_very_dissatisfied', label: 'Fallecimiento', val: modalNode.death }] : []),
                ].map(d => (
                  <div key={d.label} className="ft-modal__data-item">
                    <span className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                      {d.icon}
                    </span>
                    <div>
                      <div className="ft-modal__data-label">{d.label}</div>
                      <div className="ft-modal__data-val">{d.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Descripción */}
              {modalNode.desc && (
                <p className="ft-modal__desc">"{modalNode.desc}"</p>
              )}

              {/* Acciones */}
              <div className="ft-modal__actions">
                <button className="ft-modal__btn-secondary" onClick={closeModal}>Cerrar</button>
                <button className="ft-modal__btn-primary">
                  <span className="material-symbols-outlined">edit</span>
                  Editar
                </button>
                <button className="ft-modal__btn-icon">
                  <span className="material-symbols-outlined">share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PANEL AGREGAR PERSONA ══ */}
      {addPanelOpen && (
        <>
          <div className="ft-overlay" onClick={() => setAddPanelOpen(false)} />
          <div className="ft-add-panel">
            <div className="ft-add-panel__handle" onClick={() => setAddPanelOpen(false)}>
              <div className="ft-add-panel__handle-bar" />
            </div>
            <div className="ft-add-panel__header">
              <h3>Nueva rama del árbol</h3>
              <button onClick={() => setAddPanelOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="ft-add-panel__body">
              <div className="ft-add-field">
                <label>Nombre completo *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: María García de López" />
              </div>
              <div className="ft-add-field">
                <label>Parentesco *</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                  <option value="">— Seleccioná —</option>
                  <optgroup label="Ascendencia">
                    <option>Padre</option><option>Madre</option>
                    <option>Abuelo paterno</option><option>Abuela paterna</option>
                    <option>Abuelo materno</option><option>Abuela materna</option>
                    <option>Bisabuelo/a</option>
                  </optgroup>
                  <optgroup label="Pareja e hijos">
                    <option>Esposa</option><option>Esposo</option>
                    <option>Pareja</option><option>Hijo/a</option>
                    <option>Nieto/a</option>
                  </optgroup>
                  <optgroup label="Lateral">
                    <option>Hermano/a</option><option>Tío/a</option>
                    <option>Primo/a</option><option>Sobrino/a</option>
                  </optgroup>
                </select>
              </div>
              <div className="ft-add-row">
                <div className="ft-add-field">
                  <label>Nacimiento</label>
                  <input type="date" value={newBirth} onChange={e => setNewBirth(e.target.value)} />
                </div>
                <div className="ft-add-field">
                  <label>País de origen</label>
                  <input value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="Ej: Argentina" />
                </div>
              </div>
              <div className="ft-add-field">
                <label>Nota biográfica</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Su historia, su legado..." rows={2} />
              </div>
              <div className="ft-add-field">
                <label>Conectar desde</label>
                <select value={newParent} onChange={e => setNewParent(Number(e.target.value))}>
                  {treeData.map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.role})</option>
                  ))}
                </select>
              </div>
              <div className="ft-add-check">
                <input type="checkbox" id="isDead" checked={newDead} onChange={e => setNewDead(e.target.checked)} />
                <label htmlFor="isDead">🕯️ Esta persona ya falleció</label>
              </div>
              <div className="ft-add-panel__btns">
                <button className="ft-add-panel__cancel" onClick={() => setAddPanelOpen(false)}>Cancelar</button>
                <button className="ft-add-panel__submit" onClick={addPerson}>
                  <span className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                    park
                  </span>
                  Plantar rama
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══ BOTTOM NAV ══ */}
      <nav className="ft-bottom-nav">
        {[
          { icon: 'home',          label: 'Inicio',    path: '/feed',             active: false },
          { icon: 'auto_stories',  label: 'Recuerdos', path: '/muro-biografico',  active: false },
          { icon: 'account_tree',  label: 'Árbol',     path: '/arbol-genealogico',active: true  },
          { icon: 'group',         label: 'Vínculos',  path: '/vinculos',         active: false },
          { icon: 'settings',      label: 'Ajustes',   path: '/configuracion',    active: false },
        ].map(n => (
          <button key={n.path} className={`ft-bottom-nav__item ${n.active ? 'active' : ''}`}
            onClick={() => navigate(n.path)}>
            <span className="material-symbols-outlined"
              style={n.active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}>
              {n.icon}
            </span>
            {n.label}
          </button>
        ))}

        {/* Botón central agregar */}
        <button
          className="ft-bottom-nav__add"
          onClick={() => setAddPanelOpen(true)}
        >
          <span className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
            person_add
          </span>
        </button>
      </nav>
    </div>
  );
}
