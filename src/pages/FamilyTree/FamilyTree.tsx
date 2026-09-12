// ============================================
// LIFE'S — Árbol Genealógico
// Conectado al backend real: motherId/fatherId/parejas
// se traducen a roles y generaciones calculados en el cliente
// ============================================
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Search, Share2, X, ZoomIn, ZoomOut, Maximize2,
  Crosshair, ChevronRight, Users, User, Heart, Baby,
  UserCheck, Clock, Edit2, TreePine, Map as MapIcon,
  Download, BookOpen, UserPlus, Cake, GitBranch,
  Check, Camera, Tag, Bell, Trash2,
} from 'lucide-react';
import { familyService, connectionService } from '../../services/api';
import { connectSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import arbolFondo from './arbol-fondo.webp';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import './FamilyTree.scss';

interface TreeNode {
  id: string;
  name: string;
  role: string;
  gen: number;
  motherId: string | null;
  fatherId: string | null;
  gender?: string | null;
  birth?: string;
  death?: string;
  desc?: string;
  img?: string | null;
  isDead?: boolean;
  dnaPercent?: number | null;
  posX?: number | null;
  posY?: number | null;
  hijosNombres?: string[];
  linkedUserId?: string | null;
  linkPendienteUserId?: string | null;
  relacionManual?: string | null;
}

type FamilyTab = 'all' | 'yo' | 'pareja' | 'hijos' | 'padres' | 'abuelos' | 'bisabuelos' | 'hermanos';

const CATEGORY_MAP: Record<FamilyTab, (n: TreeNode) => boolean> = {
  all: () => true,
  yo: n => n.role === 'Yo',
  pareja: n => n.role === 'Pareja',
  hijos: n => ['Hijo', 'Hija', 'Hijo/a', 'Nieto', 'Nieta', 'Nieto/a'].includes(n.role),
  padres: n => ['Padre', 'Madre'].includes(n.role),
  abuelos: n => n.role.toLowerCase().includes('abuelo') || n.role.toLowerCase().includes('abuela'),
  bisabuelos: n => n.role.toLowerCase().includes('bisabuelo') || n.role.toLowerCase().includes('bisabuela'),
  hermanos: n => ['Hermano', 'Hermana', 'Hermano/a'].includes(n.role),
};

const TABS: { id: FamilyTab; icono: React.ReactNode; label: string }[] = [
  { id: 'all', icono: <Users size={16} strokeWidth={1.8} />, label: 'Todos' },
  { id: 'yo', icono: <User size={16} strokeWidth={1.8} />, label: 'Yo' },
  { id: 'pareja', icono: <Heart size={16} strokeWidth={1.8} />, label: 'Pareja' },
  { id: 'hijos', icono: <Baby size={16} strokeWidth={1.8} />, label: 'Hijos' },
  { id: 'padres', icono: <UserCheck size={16} strokeWidth={1.8} />, label: 'Padres' },
  { id: 'abuelos', icono: <Users size={16} strokeWidth={1.8} />, label: 'Abuelos' },
  { id: 'bisabuelos', icono: <Clock size={16} strokeWidth={1.8} />, label: 'Bisabuelos' },
  { id: 'hermanos', icono: <GitBranch size={16} strokeWidth={1.8} />, label: 'Hermanos' },
];

const GEN_COLORS = [
  { ring: 'linear-gradient(135deg,#C9A84C,#ffe088)', size: 76, glow: 'rgba(201,168,76,0.4)' },
  { ring: 'linear-gradient(135deg,#855324,#03192e)', size: 62, glow: 'rgba(133,83,36,0.3)' },
  { ring: 'linear-gradient(135deg,#03192e,#1a2e44)', size: 52, glow: 'rgba(3,25,46,0.25)' },
  { ring: 'linear-gradient(135deg,#74777d,#c4c6cd)', size: 42, glow: 'rgba(116,119,125,0.2)' },
];

function getGenConfig(gen: number) { return GEN_COLORS[Math.min(Math.abs(gen), GEN_COLORS.length - 1)]; }

// reparte una lista de personas en una fila horizontal a una altura fija,
// ajustando el ancho ocupado según cuántas sean — nunca se pisan, sin importar la cantidad
function distribuirFila(items: TreeNode[], y: number, xCentro = 400, anchoMax = 700) {
  const posiciones: { [id: string]: { x: number; y: number } } = {};
  const n = items.length;
  if (n === 0) return posiciones;
  if (n === 1) { posiciones[items[0].id] = { x: xCentro, y }; return posiciones; }
  const ancho = Math.min(anchoMax, 90 * (n - 1));
  const paso = ancho / (n - 1);
  const xInicio = xCentro - ancho / 2;
  items.forEach((item, i) => { posiciones[item.id] = { x: xInicio + paso * i, y }; });
  return posiciones;
}

function computeLayout(nodes: TreeNode[], W: number, H: number) {
  const scaleX = W / 800, scaleY = H / 560;
  const toReal = (pt: { x: number; y: number }) => ({ x: pt.x * scaleX, y: pt.y * scaleY });
  const positions: { [id: string]: { x: number; y: number } } = {};

  const asignar = (virtuales: { [id: string]: { x: number; y: number } }) => {
    Object.entries(virtuales).forEach(([id, pt]) => { positions[id] = toReal(pt); });
  };

  const yo = nodes.find(n => n.gen === 0 && n.role === 'Yo');
  if (yo) asignar({ [yo.id]: { x: 400, y: 300 } });

  asignar(distribuirFila(nodes.filter(n => n.gen === 0 && n.role === 'Pareja'), 300, 560, 200));
  asignar(distribuirFila(nodes.filter(n => n.gen === 0 && n.role !== 'Yo' && n.role !== 'Pareja'), 300, 220, 340));
  asignar(distribuirFila(nodes.filter(n => n.gen === 1), 195, 400, 620));
  asignar(distribuirFila(nodes.filter(n => n.gen === 2), 85, 400, 700));
  asignar(distribuirFila(nodes.filter(n => n.gen === 3), 46, 400, 760));
  asignar(distribuirFila(nodes.filter(n => n.gen === -1), 495, 400, 620));
  asignar(distribuirFila(nodes.filter(n => n.gen === -2), 525, 400, 700));
  asignar(distribuirFila(nodes.filter(n => n.gen === -3), 550, 400, 760));

  // si alguien ya tiene una posición guardada a mano, esa manda por sobre el casillero automático
  nodes.forEach(n => {
    if (n.posX != null && n.posY != null) positions[n.id] = toReal({ x: n.posX, y: n.posY });
  });

  return positions;
}

// ── Traduce motherId/fatherId/parejas reales en rol + generación ──
function calcularRolesYGeneraciones(members: any[], partners: any[], yoId: string | null): TreeNode[] {
  const byId = new Map<string, any>(members.map((m) => [m.id, m]));
  const gen = new Map<string, number>();
  const role = new Map<string, string>();

  const yo = yoId ? byId.get(yoId) : null;

  if (yo) {
    gen.set(yo.id, 0);
    role.set(yo.id, 'Yo');

    if (yo.fatherId && byId.has(yo.fatherId)) { gen.set(yo.fatherId, 1); role.set(yo.fatherId, 'Padre'); }
    if (yo.motherId && byId.has(yo.motherId)) { gen.set(yo.motherId, 1); role.set(yo.motherId, 'Madre'); }

    const etiquetaAscendencia = (genero: string | null | undefined, generacion: number) => {
      if (genero === 'female') return generacion === 2 ? 'Abuela' : 'Bisabuela';
      if (genero === 'male') return generacion === 2 ? 'Abuelo' : 'Bisabuelo';
      return generacion === 2 ? 'Abuelo/a' : 'Bisabuelo/a';
    };

    const recorrerAscendencia = (id: string | null | undefined, ladoPaterno: boolean, generacion: number) => {
      if (!id || !byId.has(id)) return;
      const persona = byId.get(id);
      gen.set(id, generacion);
      // el "paterno"/"materno" tiene que concordar en género con la
      // persona en sí ("Abuela materna", no "Abuela materno") — el
      // "lado" (de dónde viene) es un dato aparte del género de quien lo es
      const lado = persona.gender === 'female'
        ? (ladoPaterno ? 'paterna' : 'materna')
        : (ladoPaterno ? 'paterno' : 'materno');
      role.set(id, `${etiquetaAscendencia(persona.gender, generacion)} ${lado}`);
      if (generacion < 3) {
        recorrerAscendencia(persona.fatherId, ladoPaterno, generacion + 1);
        recorrerAscendencia(persona.motherId, ladoPaterno, generacion + 1);
      }
    };
    if (yo.fatherId && byId.has(yo.fatherId)) {
      const padre = byId.get(yo.fatherId);
      recorrerAscendencia(padre.fatherId, true, 2);
      recorrerAscendencia(padre.motherId, true, 2);
    }
    if (yo.motherId && byId.has(yo.motherId)) {
      const madre = byId.get(yo.motherId);
      recorrerAscendencia(madre.fatherId, false, 2);
      recorrerAscendencia(madre.motherId, false, 2);
    }

    // ── Hermanos ──
    members.forEach((m) => {
      if (m.id === yo.id || gen.has(m.id)) return;
      const compartePadre = yo.fatherId && m.fatherId === yo.fatherId;
      const comparteMadre = yo.motherId && m.motherId === yo.motherId;
      if (compartePadre || comparteMadre) {
        gen.set(m.id, 0);
        role.set(m.id, m.gender === 'male' ? 'Hermano' : m.gender === 'female' ? 'Hermana' : 'Hermano/a');
      }
    });

    // ── Tíos/as: hermanos de tu madre o de tu padre ──
    const marcarTios = (progenitor: any, lado: 'materno' | 'paterno') => {
      if (!progenitor) return;
      members.forEach((m) => {
        if (m.id === progenitor.id || gen.has(m.id)) return;
        const compartePadre = progenitor.fatherId && m.fatherId === progenitor.fatherId;
        const carteMadre = progenitor.motherId && m.motherId === progenitor.motherId;
        if (compartePadre || carteMadre) {
          gen.set(m.id, 1);
          const etiqueta = m.gender === 'male' ? 'Tío' : m.gender === 'female' ? 'Tía' : 'Tío/a';
          role.set(m.id, `${etiqueta} ${lado}`);
        }
      });
    };
    if (yo.fatherId && byId.has(yo.fatherId)) marcarTios(byId.get(yo.fatherId), 'paterno');
    if (yo.motherId && byId.has(yo.motherId)) marcarTios(byId.get(yo.motherId), 'materno');

    // ── Pareja ──
    let yoPartnerId: string | null = null;
    partners.forEach((p) => {
      const otroId = p.memberAId === yo.id ? p.memberBId : p.memberBId === yo.id ? p.memberAId : null;
      if (otroId && byId.has(otroId) && !gen.has(otroId)) {
        gen.set(otroId, 0);
        role.set(otroId, 'Pareja');
        yoPartnerId = otroId;
      }
    });

    // ── Suegros y cuñados por el lado de la pareja ──
    if (yoPartnerId && byId.has(yoPartnerId)) {
      const pareja = byId.get(yoPartnerId);
      if (pareja.motherId && byId.has(pareja.motherId) && !gen.has(pareja.motherId)) {
        gen.set(pareja.motherId, 1);
        role.set(pareja.motherId, 'Suegra');
      }
      if (pareja.fatherId && byId.has(pareja.fatherId) && !gen.has(pareja.fatherId)) {
        gen.set(pareja.fatherId, 1);
        role.set(pareja.fatherId, 'Suegro');
      }
      members.forEach((m) => {
        if (gen.has(m.id) || m.id === yoPartnerId) return;
        const compartePadre = pareja.fatherId && m.fatherId === pareja.fatherId;
        const comparteMadre = pareja.motherId && m.motherId === pareja.motherId;
        if (compartePadre || comparteMadre) {
          gen.set(m.id, 0);
          role.set(m.id, m.gender === 'male' ? 'Cuñado' : m.gender === 'female' ? 'Cuñada' : 'Cuñado/a');
        }
      });
    }

    // ── Cuñados por el lado de los hermanos (la pareja de un hermano tuyo) ──
    members.forEach((m) => {
      const rolDeM = role.get(m.id);
      if (rolDeM !== 'Hermano' && rolDeM !== 'Hermana' && rolDeM !== 'Hermano/a') return;
      partners.forEach((p) => {
        const otroId = p.memberAId === m.id ? p.memberBId : p.memberBId === m.id ? p.memberAId : null;
        if (otroId && byId.has(otroId) && !gen.has(otroId)) {
          const otro = byId.get(otroId);
          gen.set(otroId, 0);
          role.set(otroId, otro.gender === 'male' ? 'Cuñado' : otro.gender === 'female' ? 'Cuñada' : 'Cuñado/a');
        }
      });
    });

    // ── Sobrinos/as: hijos de un hermano/a tuyo ──
    members.forEach((m) => {
      const rolDeM = role.get(m.id);
      if (rolDeM !== 'Hermano' && rolDeM !== 'Hermana' && rolDeM !== 'Hermano/a') return;
      members.forEach((h) => {
        if (gen.has(h.id) || (h.motherId !== m.id && h.fatherId !== m.id)) return;
        gen.set(h.id, -1);
        role.set(h.id, h.gender === 'male' ? 'Sobrino' : h.gender === 'female' ? 'Sobrina' : 'Sobrino/a');
      });
    });

    // ── Hijos, nietos y bisnietos ──
    const hijosDe = (padreId: string) => members.filter((m) => m.motherId === padreId || m.fatherId === padreId);
    hijosDe(yo.id).forEach((h) => {
      if (gen.has(h.id)) return;
      gen.set(h.id, -1);
      role.set(h.id, h.gender === 'male' ? 'Hijo' : h.gender === 'female' ? 'Hija' : 'Hijo/a');
      hijosDe(h.id).forEach((nieto) => {
        if (gen.has(nieto.id)) return;
        gen.set(nieto.id, -2);
        role.set(nieto.id, nieto.gender === 'male' ? 'Nieto' : nieto.gender === 'female' ? 'Nieta' : 'Nieto/a');
        hijosDe(nieto.id).forEach((bisnieto) => {
          if (gen.has(bisnieto.id)) return;
          gen.set(bisnieto.id, -3);
          role.set(bisnieto.id, bisnieto.gender === 'male' ? 'Bisnieto' : bisnieto.gender === 'female' ? 'Bisnieta' : 'Bisnieto/a');
        });
      });
    });
  }

  // lo que quedó sin ubicar (agregado suelto todavía) va a una categoría genérica
  members.forEach((m) => {
    if (!gen.has(m.id)) { gen.set(m.id, 1); role.set(m.id, 'Familiar'); }
  });

  const calcularDna = (rol: string): number | null => {
    if (rol === 'Yo') return null;
    if (rol === 'Pareja') return null; // sin relación de sangre
    if (['Padre', 'Madre', 'Hijo', 'Hija', 'Hijo/a', 'Hermano', 'Hermana', 'Hermano/a'].includes(rol)) return 50;
    if (rol.toLowerCase().includes('abuelo') || rol.toLowerCase().includes('abuela')) return 25;
    if (rol.toLowerCase().startsWith('tío') || rol.toLowerCase().startsWith('tía')) return 25;
    if (['Nieto', 'Nieta', 'Nieto/a'].includes(rol)) return 25;
    if (rol.toLowerCase().includes('bisabuelo') || rol.toLowerCase().includes('bisabuela')) return 13;
    return null; // familiar suelto, todavía no calculamos su parentesco real
  };

  return members.map((m) => {
    const g = gen.get(m.id) ?? 1;
    const rol = m.relacionManual || role.get(m.id) || 'Familiar';
    const hijosNombres = members
      .filter((h) => h.motherId === m.id || h.fatherId === m.id)
      .map((h) => h.firstName);
    return {
      id: m.id,
      name: `${m.firstName} ${m.lastName || ''}`.trim(),
      role: rol,
      gen: g,
      motherId: m.motherId,
      fatherId: m.fatherId,
      gender: m.gender,
      birth: m.birthDate ? new Date(m.birthDate).toLocaleDateString('es-AR') : undefined,
      death: m.deathDate ? new Date(m.deathDate).toLocaleDateString('es-AR') : undefined,
      desc: m.bio || undefined,
      img: m.photoUrl || null,
      isDead: !!m.deathDate,
      dnaPercent: calcularDna(rol),
      posX: m.posX,
      posY: m.posY,
      hijosNombres,
      linkedUserId: m.linkedUserId,
      linkPendienteUserId: m.linkPendienteUserId,
      relacionManual: m.relacionManual,
    };
  });
}

export default function FamilyTree() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [members, setMembers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [yoId, setYoId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const [zoom, setZoom] = useState(1);
  const [zoomConBoton, setZoomConBoton] = useState(false);
  const [esPantallaCompleta, setEsPantallaCompleta] = useState(false);

  // hace zoom manteniendo fijo el punto (anchorX, anchorY) de la pantalla,
  // sea el cursor del mouse o el centro del árbol
  const zoomHacia = (nuevoZoom: number, anchorX: number, anchorY: number) => {
    const zoomFinal = Math.min(3, Math.max(0.05, nuevoZoom));
    setPanX(prevPanX => {
      const worldX = (anchorX - prevPanX) / zoom;
      return anchorX - worldX * zoomFinal;
    });
    setPanY(prevPanY => {
      const worldY = (anchorY - prevPanY) / zoom;
      return anchorY - worldY * zoomFinal;
    });
    setZoom(zoomFinal);
  };
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [modalNode, setModalNode] = useState<TreeNode | null>(null);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [activeTab, setActiveTab] = useState<FamilyTab>('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [highlightPath, setHighlightPath] = useState<string[]>([]);
  const [wrapSize, setWrapSize] = useState({ w: 800, h: 560 });
  const [toast, setToast] = useState('');

  // ── Formulario AGREGAR ──
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newGender, setNewGender] = useState('');
  const [newBirth, setNewBirth] = useState('');
  const [newVive, setNewVive] = useState(true);
  const [newDeath, setNewDeath] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAnchorId, setNewAnchorId] = useState('');
  const [newRelacion, setNewRelacion] = useState('');
  const [newRolPropio, setNewRolPropio] = useState<'madre' | 'padre'>('madre');
  const [newAscendenciaId, setNewAscendenciaId] = useState('');
  const [newHijosCompartidos, setNewHijosCompartidos] = useState<string[]>([]);
  const [newHermanosCompartidos, setNewHermanosCompartidos] = useState<string[]>([]);
  const [newImgFile, setNewImgFile] = useState<File | null>(null);
  const [newImgPreview, setNewImgPreview] = useState('');

  // ── Modal EDICIÓN ──
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editBirth, setEditBirth] = useState('');
  const [editVive, setEditVive] = useState(true);
  const [editDeath, setEditDeath] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editRelacionManual, setEditRelacionManual] = useState('');
  const [editAnchorId, setEditAnchorId] = useState('');
  const [editRelacion, setEditRelacion] = useState('');
  const [editOriginalRelacion, setEditOriginalRelacion] = useState('');
  const [editRolPropio, setEditRolPropio] = useState<'madre' | 'padre'>('madre');
  const [editAscendenciaId, setEditAscendenciaId] = useState('');
  const [editHijosCompartidos, setEditHijosCompartidos] = useState<string[]>([]);
  const [editHermanosCompartidos, setEditHermanosCompartidos] = useState<string[]>([]);
  const [editImgFile, setEditImgFile] = useState<File | null>(null);
  const [editImgPreview, setEditImgPreview] = useState('');

  // ── Vincular pareja ──
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // ── Vaciar el árbol entero (siempre queda tu propio nodo) ──
  const [confirmandoVaciarArbol, setConfirmandoVaciarArbol] = useState(false);
  const [vaciandoArbol, setVaciandoArbol] = useState(false);

  // ── Etiquetar a una persona real (con aceptación) ──
  const [etiquetando, setEtiquetando] = useState(false);
  const [misConexiones, setMisConexiones] = useState<any[]>([]);
  const [buscarEtiquetaQ, setBuscarEtiquetaQ] = useState('');
  const [cargandoConexiones, setCargandoConexiones] = useState(false);
  const [enviandoEtiqueta, setEnviandoEtiqueta] = useState(false);
  const [desvinculando, setDesvinculando] = useState(false);

  // ── Propuestas de etiquetado que te llegaron a vos (de árboles ajenos) ──
  const [propuestasOpen, setPropuestasOpen] = useState(false);
  const [propuestas, setPropuestas] = useState<any[]>([]);
  const [cargandoPropuestas, setCargandoPropuestas] = useState(false);

  // ── Pantalla de detalle de una propuesta puntual (reemplaza el
  // aceptar/rechazar rápido — acá se ve el contexto completo, y una vez
  // aceptada aparece el paso de "copiar árbol") ──
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [detallePropuesta, setDetallePropuesta] = useState<any | null>(null);
  const [detalleEnviando, setDetalleEnviando] = useState(false);
  const [detalleAceptada, setDetalleAceptada] = useState(false);
  const [detalleReciprocalId, setDetalleReciprocalId] = useState<string | null>(null);
  const [detalleCopyPreview, setDetalleCopyPreview] = useState<{ total: number; primeraVez: boolean; fusionesPosibles: any[] } | null>(null);
  const [detalleFusionesElegidas, setDetalleFusionesElegidas] = useState<Set<string>>(new Set());
  const [detalleCargandoPreview, setDetalleCargandoPreview] = useState(false);
  const [detalleCopiando, setDetalleCopiando] = useState(false);

  // ── "Copiar árbol" desde el modal normal de alguien ya vinculado ──
  const [previewCopiaModal, setPreviewCopiaModal] = useState<{ total: number; primeraVez: boolean; fusionesPosibles: any[] } | null>(null);
  const [fusionesElegidasModal, setFusionesElegidasModal] = useState<Set<string>>(new Set());
  const [cargandoPreviewModal, setCargandoPreviewModal] = useState(false);
  const [copiandoDesdeModal, setCopiandoDesdeModal] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cargaCountRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragNodePos, setDragNodePos] = useState<{ x: number; y: number } | null>(null);
  const nodeDragStart = useRef({ mouseX: 0, mouseY: 0, nodeX: 0, nodeY: 0, offsetX: 0, offsetY: 0 });
  const lastMouseClientRef = useRef({ x: 0, y: 0 });
  // espejo del pan en un ref — durante el arrastre lo necesitamos al
  // instante, sin esperar al próximo render de React
  const panXRef = useRef(0);
  const panYRef = useRef(0);
  useEffect(() => { panXRef.current = panX; }, [panX]);
  useEffect(() => { panYRef.current = panY; }, [panY]);
  const inputFotoEditRef = useRef<HTMLInputElement>(null);
  const inputFotoNewRef = useRef<HTMLInputElement>(null);
  // el modal solo se cierra si el click EMPEZÓ y TERMINÓ en el fondo —
  // así una selección de texto que arrancás adentro y soltás afuera no lo cierra
  const mouseDownOnOverlayRef = useRef(false);
  const [verFotoGrande, setVerFotoGrande] = useState(false);

  useEffect(() => { cargarArbol(); }, []);

  async function cargarArbol() {
    setCargando(true);
    try {
      const res: any = await familyService.getTree();
      setMembers(res.data.members);
      setPartners(res.data.partners);
      setYoId(res.data.yoId);
      cargaCountRef.current += 1;
    } catch (err) {
      console.error('Error al cargar el árbol:', err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const measure = () => { if (wrapRef.current) setWrapSize({ w: wrapRef.current.clientWidth, h: wrapRef.current.clientHeight }); };
    measure();
    window.addEventListener('resize', measure);
    const onFullscreenChange = () => {
      setEsPantallaCompleta(!!document.fullscreenElement);
      setTimeout(measure, 50);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('resize', measure);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  // ── Autoscroll al arrastrar un nodo cerca del borde ──
  // mientras estás moviendo una persona, si te acercás al borde del
  // recuadro (esté o no en pantalla completa) el lienzo se desplaza solo,
  // así podés soltar la rama en cualquier lugar sin que "rebote" al centro
  useEffect(() => {
    if (!draggingNodeId) return;
    const EDGE = 60;   // px desde el borde donde arranca el autoscroll
    const SPEED = 6;   // velocidad máxima, en px por frame — más suave para poder soltar con precisión
    let frameId: number;

    const tick = () => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (rect) {
        const { x: mx, y: my } = lastMouseClientRef.current;
        const localX = mx - rect.left;
        const localY = my - rect.top;
        let dPanX = 0, dPanY = 0;
        if (localX < EDGE) dPanX = SPEED * (1 - localX / EDGE);
        else if (localX > rect.width - EDGE) dPanX = -SPEED * (1 - (rect.width - localX) / EDGE);
        if (localY < EDGE) dPanY = SPEED * (1 - localY / EDGE);
        else if (localY > rect.height - EDGE) dPanY = -SPEED * (1 - (rect.height - localY) / EDGE);

        if (dPanX || dPanY) {
          panXRef.current += dPanX;
          panYRef.current += dPanY;
          setPanX(panXRef.current);
          setPanY(panYRef.current);
        }

        // única fuente de verdad para la posición del nodo mientras se
        // arrastra: se recalcula cada cuadro a partir del mouse y el pan
        // actuales, así nunca compite con ningún otro cálculo
        const worldX = (mx - rect.left - panXRef.current) / zoom + nodeDragStart.current.offsetX;
        const worldY = (my - rect.top - panYRef.current) / zoom + nodeDragStart.current.offsetY;
        setDragNodePos({ x: worldX, y: worldY });
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [draggingNodeId, zoom]);

  // ── Termina el arrastre de un nodo con el mouse soltado en CUALQUIER
  // lugar de la pantalla, no solo si soltás adentro del recuadro del árbol
  useEffect(() => {
    if (!draggingNodeId) return;
    const onWindowMouseUp = async () => {
      const id = draggingNodeId;
      const finalPos = dragNodePos;
      if (!finalPos) {
        setDraggingNodeId(null);
        setDragNodePos(null);
        return;
      }
      const scaleX = wrapSize.w / 800, scaleY = wrapSize.h / 560;
      try {
        await familyService.updatePosition(id, finalPos.x / scaleX, finalPos.y / scaleY);
        await cargarArbol();
      } catch (err: any) {
        showToast(`⚠️ ${err.message || 'Error al guardar la posición'}`);
      } finally {
        // recién ahora soltamos el nodo — así se queda quieto, exactamente
        // donde lo soltaste, durante todo el ida-y-vuelta al servidor, en
        // vez de caer a la posición vieja y "saltar" cuando llega lo nuevo
        setDraggingNodeId(null);
        setDragNodePos(null);
      }
    };
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => window.removeEventListener('mouseup', onWindowMouseUp);
  }, [draggingNodeId, dragNodePos, wrapSize]);

  // Escape cierra el modal/popup que esté abierto en ese momento, el más "de arriba" primero
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (confirmandoEliminar) { setConfirmandoEliminar(false); return; }
      if (editOpen) { setEditOpen(false); return; }
      if (addPanelOpen) { cerrarAddPanel(); return; }
      if (modalNode) { closeModal(); return; }
      if (searchOpen) { setSearchOpen(false); return; }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmandoEliminar, editOpen, addPanelOpen, modalNode, searchOpen]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Memoizados a propósito: este cálculo es pesado (recorre ascendencia,
  // hermanos, cuñados, sobrinos...) y antes se rehacía en CADA frame
  // mientras arrastrabas un nodo (60 veces por segundo), aunque nada de
  // esto hubiera cambiado — eso era lo que hacía "titilar" algunos
  // círculos durante el arrastre. Ahora solo se recalcula cuando de
  // verdad cambian los datos del árbol o el tamaño del lienzo.
  const treeData = useMemo(
    () => calcularRolesYGeneraciones(members, partners, yoId),
    [members, partners, yoId]
  );
  const positions = useMemo(
    () => computeLayout(treeData, wrapSize.w, wrapSize.h),
    [treeData, wrapSize.w, wrapSize.h]
  );

  // posición real de cualquier nodo, respetando el arrastre en vivo si se está moviendo
  const getPos = (id: string) => (draggingNodeId === id && dragNodePos) ? dragNodePos : positions[id];

  const getAncestorPath = (nodeId: string): string[] => {
    const path: string[] = [nodeId];
    const visit = (id: string) => {
      const node = treeData.find(n => n.id === id);
      if (!node) return;
      if (node.motherId) { path.push(node.motherId); visit(node.motherId); }
      if (node.fatherId) { path.push(node.fatherId); visit(node.fatherId); }
    };
    visit(nodeId);
    return path;
  };

  const openModal = (node: TreeNode) => {
    setModalNode(node);
    setHighlightPath(getAncestorPath(node.id));
    setPreviewCopiaModal(null);
    // volvemos a preguntar puntualmente por esta persona al abrir su
    // modal — así, si del otro lado ya aceptó/rechazó, se refleja acá sin
    // tener que refrescar toda la página (solo cerrando y reabriendo)
    familyService.getMember(node.id)
      .then((res: any) => {
        setMembers(prev => prev.map(m => m.id === node.id ? res.data : m));
      })
      .catch(() => {});
  };

  const closeModal = () => { setModalNode(null); setHighlightPath([]); setEtiquetando(false); setPreviewCopiaModal(null); };

  // si el modal de detalle está abierto, lo mantenemos sincronizado con
  // los datos más frescos de treeData (por ejemplo, después del refetch
  // puntual que dispara openModal)
  useEffect(() => {
    if (!modalNode) return;
    const actualizado = treeData.find(n => n.id === modalNode.id);
    if (actualizado) setModalNode(actualizado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData]);

  const abrirEtiquetado = async () => {
    setEtiquetando(true);
    setBuscarEtiquetaQ('');
    if (misConexiones.length === 0) {
      setCargandoConexiones(true);
      try {
        const res: any = await connectionService.list('accepted');
        setMisConexiones(res.data);
      } catch {
        setMisConexiones([]);
      } finally {
        setCargandoConexiones(false);
      }
    }
  };

  const proponerEtiqueta = async (targetUserId: string, nombre: string) => {
    if (!modalNode) return;
    setEnviandoEtiqueta(true);
    try {
      await familyService.proposeLink(modalNode.id, targetUserId);
      showToast(`✓ Le enviaste la etiqueta a ${nombre} — falta que la acepte`);
      setEtiquetando(false);
      await cargarArbol();
      setModalNode(prev => prev && prev.id === modalNode.id ? { ...prev, linkPendienteUserId: targetUserId } : prev);
    } catch (err: any) {
      showToast(`⚠️ ${err.message || 'No se pudo etiquetar'}`);
    } finally {
      setEnviandoEtiqueta(false);
    }
  };

  const cancelarPropuestaPropia = async () => {
    if (!modalNode) return;
    try {
      await familyService.cancelLink(modalNode.id);
      showToast('Propuesta cancelada');
      await cargarArbol();
      setModalNode(prev => prev && prev.id === modalNode.id ? { ...prev, linkPendienteUserId: null } : prev);
    } catch (err: any) {
      showToast(`⚠️ ${err.message || 'No se pudo cancelar'}`);
    }
  };

  const desvincularPersona = async () => {
    if (!modalNode) return;
    setDesvinculando(true);
    try {
      await familyService.unlinkMember(modalNode.id);
      showToast('Se desvinculó a la persona de este familiar');
      await cargarArbol();
      setModalNode(prev => prev && prev.id === modalNode.id ? { ...prev, linkedUserId: null } : prev);
    } catch (err: any) {
      showToast(`⚠️ ${err.message || 'No se pudo desvincular'}`);
    } finally {
      setDesvinculando(false);
    }
  };

  const cargarPropuestas = () => {
    setCargandoPropuestas(true);
    familyService.getPendingLinks()
      .then((res: any) => setPropuestas(res.data))
      .catch(() => setPropuestas([]))
      .finally(() => setCargandoPropuestas(false));
  };

  // se cargan al entrar al árbol, así el numerito del header ya aparece
  // sin que haga falta abrir el panel primero
  useEffect(() => {
    cargarPropuestas();
  }, []);

  // en vivo: si te etiquetan o te aceptan/rechazan mientras estás en el
  // árbol, el badge y el panel de Propuestas se actualizan solos — y si
  // tenés abierto el modal de esa persona puntual, también se refresca
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('lifes_token');
    if (!token) return;
    const socket = connectSocket(token);
    const onNuevo = () => {
      cargarPropuestas();
      if (modalNode) {
        familyService.getMember(modalNode.id)
          .then((res: any) => setMembers(prev => prev.map(m => m.id === modalNode.id ? res.data : m)))
          .catch(() => {});
      }
    };
    socket.on('notification:new', onNuevo);
    return () => { socket.off('notification:new', onNuevo); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, modalNode]);

  // esto sí reacciona cada vez que cambia la URL — así, si ya estabas
  // parado en el árbol y tocás la notificación de nuevo, igual se abre
  // el detalle (antes solo funcionaba en la primera carga de la página)
  useEffect(() => {
    const propuestaId = searchParams.get('propuesta');
    if (!propuestaId) return;
    const encontrada = propuestas.find((p: any) => p.memberId === propuestaId);
    if (encontrada) {
      abrirDetallePropuesta(encontrada);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, propuestas]);

  const abrirPropuestas = () => setPropuestasOpen(v => !v);

  const toggleSearch = () => {
    if (searchOpen) { setSearchOpen(false); setSearchQ(''); }
    else setSearchOpen(true);
  };

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onClickFuera = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, [searchOpen]);

  const compartirInvitacion = async () => {
    const texto = `Te invito a armar tu árbol genealógico conmigo en Life's — descargá la app y empezá tu legado: ${window.location.origin}/`;
    try {
      await navigator.clipboard.writeText(texto);
      showToast('✓ Invitación copiada — pegala donde quieras compartirla');
    } catch {
      showToast('⚠️ No se pudo copiar la invitación');
    }
  };

  const abrirDetallePropuesta = (p: any) => {
    setPropuestasOpen(false);
    setDetallePropuesta(p);
    setDetalleAbierto(true);
    setDetalleAceptada(false);
    setDetalleReciprocalId(null);
    setDetalleCopyPreview(null);
  };

  const cerrarDetalle = () => {
    setDetalleAbierto(false);
    setDetallePropuesta(null);
    setDetalleAceptada(false);
    setDetalleReciprocalId(null);
    setDetalleCopyPreview(null);
  };

  const aceptarDetalle = async () => {
    if (!detallePropuesta) return;
    setDetalleEnviando(true);
    try {
      const res: any = await familyService.acceptLink(detallePropuesta.memberId);
      setDetalleAceptada(true);
      setDetalleReciprocalId(res.data.reciprocalMemberId);
      setPropuestas(prev => prev.filter(p => p.memberId !== detallePropuesta.memberId));
      // sin esto, el nodo recíproco recién creado no aparecía en tu propio
      // árbol hasta refrescar la página — ahora se ve al toque, aunque
      // cierres el detalle sin llegar a copiar nada todavía
      await cargarArbol();
    } catch (err: any) {
      showToast(`⚠️ ${err.message || 'No se pudo aceptar'}`);
    } finally {
      setDetalleEnviando(false);
    }
  };

  const rechazarDetalle = async () => {
    if (!detallePropuesta) return;
    setDetalleEnviando(true);
    try {
      await familyService.rejectLink(detallePropuesta.memberId);
      setPropuestas(prev => prev.filter(p => p.memberId !== detallePropuesta.memberId));
      cerrarDetalle();
    } catch (err: any) {
      showToast(`⚠️ ${err.message || 'No se pudo rechazar'}`);
    } finally {
      setDetalleEnviando(false);
    }
  };

  // apenas se acepta, ya buscamos cuántas personas nuevas trae copiar
  useEffect(() => {
    if (!detalleAceptada || !detalleReciprocalId) return;
    setDetalleCargandoPreview(true);
    familyService.previewCopyTree(detalleReciprocalId)
      .then((res: any) => {
        setDetalleCopyPreview(res.data);
        setDetalleFusionesElegidas(new Set(res.data.fusionesPosibles.map((f: any) => f.sourceId)));
      })
      .catch(() => setDetalleCopyPreview(null))
      .finally(() => setDetalleCargandoPreview(false));
  }, [detalleAceptada, detalleReciprocalId]);

  const copiarArbolDesdeDetalle = async () => {
    if (!detalleReciprocalId || !detalleCopyPreview) return;
    setDetalleCopiando(true);
    try {
      const fusiones = detalleCopyPreview.fusionesPosibles
        .filter((f: any) => detalleFusionesElegidas.has(f.sourceId))
        .map((f: any) => ({ sourceId: f.sourceId, existingId: f.existingId }));
      const res: any = await familyService.copyTree(detalleReciprocalId, fusiones);
      showToast(`✓ Se agregaron ${res.data.creados} persona${res.data.creados === 1 ? '' : 's'} a tu árbol`);
      await cargarArbol();
      cerrarDetalle();
    } catch (err: any) {
      showToast(`⚠️ ${err.message || 'No se pudo copiar el árbol'}`);
    } finally {
      setDetalleCopiando(false);
    }
  };

  // ── Copiar árbol desde el modal normal de alguien ya vinculado ──
  const abrirPreviewCopiaModal = async () => {
    if (!modalNode) return;
    setCargandoPreviewModal(true);
    setPreviewCopiaModal(null);
    try {
      const res: any = await familyService.previewCopyTree(modalNode.id);
      setPreviewCopiaModal(res.data);
      setFusionesElegidasModal(new Set(res.data.fusionesPosibles.map((f: any) => f.sourceId)));
    } catch (err: any) {
      showToast(`⚠️ ${err.message || 'No se pudo revisar su árbol'}`);
    } finally {
      setCargandoPreviewModal(false);
    }
  };

  const confirmarCopiaModal = async () => {
    if (!modalNode || !previewCopiaModal) return;
    setCopiandoDesdeModal(true);
    try {
      const fusiones = previewCopiaModal.fusionesPosibles
        .filter((f: any) => fusionesElegidasModal.has(f.sourceId))
        .map((f: any) => ({ sourceId: f.sourceId, existingId: f.existingId }));
      const res: any = await familyService.copyTree(modalNode.id, fusiones);
      showToast(`✓ Se agregaron ${res.data.creados} persona${res.data.creados === 1 ? '' : 's'} a tu árbol`);
      setPreviewCopiaModal(null);
      await cargarArbol();
    } catch (err: any) {
      showToast(`⚠️ ${err.message || 'No se pudo copiar'}`);
    } finally {
      setCopiandoDesdeModal(false);
    }
  };

  const abrirEdicion = (node: TreeNode) => {
    setEditId(node.id);
    setEditOriginalRelacion('');
    const [fn, ...rest] = node.name.split(' ');
    setEditFirstName(fn); setEditLastName(rest.join(' '));
    setEditGender(node.gender || '');
    setEditBirth(''); setEditDeath(''); setEditVive(!node.isDead);
    setEditDesc(node.desc || '');
    setEditRelacionManual(node.relacionManual || '');
    setEditImgFile(null); setEditImgPreview(node.img || '');

    let anchorId = yoNode?.id || '';
    let relacion = '';
    let rolPropio: 'madre' | 'padre' = 'madre';
    let ascendenciaId = '';
    const rolLower = node.role.toLowerCase();

    const yoPartner = treeData.find(n => n.role === 'Pareja');
    const hermanosDeYo = treeData.filter(n => ['Hermano', 'Hermana', 'Hermano/a'].includes(n.role));

    if (node.role === 'Padre') relacion = 'padre';
    else if (node.role === 'Madre') relacion = 'madre';
    else if (['Hijo', 'Hija', 'Hijo/a'].includes(node.role)) {
      relacion = node.role === 'Hija' ? 'hija' : 'hijo';
      rolPropio = node.motherId === yoNode?.id ? 'madre' : 'padre';
    } else if (['Hermano', 'Hermana', 'Hermano/a'].includes(node.role)) {
      relacion = node.role === 'Hermana' ? 'hermana' : 'hermano';
    } else if (node.role === 'Pareja') {
      relacion = 'pareja';
    } else if (rolLower.startsWith('abuelo') || rolLower.startsWith('abuela')) {
      relacion = rolLower.startsWith('abuela') ? 'abuela' : 'abuelo';
      rolPropio = node.gender === 'female' ? 'madre' : 'padre';
    } else if (['Nieto', 'Nieta', 'Nieto/a'].includes(node.role)) {
      relacion = node.role === 'Nieta' ? 'nieta' : 'nieto';
      const esDeEsteHijo = hijosDeYo.find(h => h.id === node.motherId || h.id === node.fatherId);
      if (esDeEsteHijo) {
        ascendenciaId = esDeEsteHijo.id;
        rolPropio = node.motherId === esDeEsteHijo.id ? 'madre' : 'padre';
      }
    } else if (node.role === 'Suegro' || node.role === 'Suegra') {
      // es el padre/madre de tu pareja
      if (yoPartner) {
        anchorId = yoPartner.id;
        relacion = node.role === 'Suegra' ? 'madre' : 'padre';
      }
    } else if (node.role === 'Cuñado' || node.role === 'Cuñada' || node.role === 'Cuñado/a') {
      // caso A: es pareja de un hermano/a tuyo
      const hermanoPareja = hermanosDeYo.find(h =>
        partners.some((p: any) => (p.memberAId === h.id && p.memberBId === node.id) || (p.memberBId === h.id && p.memberAId === node.id))
      );
      if (hermanoPareja) {
        anchorId = hermanoPareja.id;
        relacion = 'pareja';
      } else if (yoPartner) {
        // caso B: es hermano/a de tu pareja
        const comparte = (yoPartner.motherId && node.motherId === yoPartner.motherId) || (yoPartner.fatherId && node.fatherId === yoPartner.fatherId);
        if (comparte) {
          anchorId = yoPartner.id;
          relacion = node.gender === 'female' ? 'hermana' : 'hermano';
        }
      }
    }

    setEditAnchorId(anchorId);
    setEditRelacion(relacion);
    setEditOriginalRelacion(relacion);
    setEditRolPropio(rolPropio);
    setEditAscendenciaId(ascendenciaId);
    const yaCompartidos = hijosDeYo.filter(h => h.motherId === node.id || h.fatherId === node.id).map(h => h.id);
    setEditHijosCompartidos(yaCompartidos);
    // igual que arriba, pero para el checklist de "¿es también madre/padre
    // de estos hermanos?" — precargamos quiénes ya tienen a esta persona
    // como ese progenitor, para que el checklist refleje el estado real
    const yaHermanosCompartidos = (relacion === 'madre' || relacion === 'padre')
      ? treeData
        .filter(n => n.id !== node.id && n.id !== yoNode?.id && (relacion === 'madre' ? n.motherId === node.id : n.fatherId === node.id))
        .map(n => n.id)
      : [];
    setEditHermanosCompartidos(yaHermanosCompartidos);
    setEditOpen(true);
  };

  const onFotoEditSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImgFile(file);
    setEditImgPreview(URL.createObjectURL(file));
  };

  const onFotoNewSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewImgFile(file);
    setNewImgPreview(URL.createObjectURL(file));
  };

  const guardarEdicion = async () => {
    if (!editFirstName.trim()) { showToast('⚠️ El nombre no puede estar vacío'); return; }
    if (!editAnchorNode) { showToast('⚠️ Elegí con quién es la relación'); return; }
    if ((editRelacion === 'abuelo' || editRelacion === 'abuela') && editAnchorNode.motherId && editAnchorNode.fatherId && !editAscendenciaId) {
      showToast('⚠️ Elegí de qué lado (madre o padre)'); return;
    }
    if ((editRelacion === 'abuelo' || editRelacion === 'abuela') && !editAnchorNode.motherId && !editAnchorNode.fatherId) {
      showToast(`⚠️ Primero agregá a la madre o al padre de ${editAnchorNode.name}`); return;
    }
    if ((editRelacion === 'nieto' || editRelacion === 'nieta') && hijosDeEditAnchor.length === 0) {
      showToast(`⚠️ Primero agregá un hijo o hija de ${editAnchorNode.name}`); return;
    }
    if ((editRelacion === 'nieto' || editRelacion === 'nieta') && hijosDeEditAnchor.length > 1 && !editAscendenciaId) {
      showToast('⚠️ Elegí de cuál de sus hijos'); return;
    }
    if ((editRelacion === 'hermano' || editRelacion === 'hermana') && !editAnchorNode.motherId && !editAnchorNode.fatherId) {
      showToast(`⚠️ Para marcarlo como hermano/a de ${editAnchorNode.name}, primero agregale una madre o un padre — es lo que los conecta como hermanos`); return;
    }
    try {
      const fields: Record<string, string> = { firstName: editFirstName.trim() };
      if (editLastName.trim()) fields.lastName = editLastName.trim();
      if (editGender) fields.gender = editGender;
      if (editBirth) fields.birthDate = editBirth;
      fields.deathDate = editVive ? '' : (editDeath || '');
      if (editDesc) fields.bio = editDesc;
      fields.relacionManual = editRelacionManual.trim();

      const nodoActual = treeData.find(n => n.id === editId);

      if (editRelacion === 'hermano' || editRelacion === 'hermana') {
        fields.motherId = editAnchorNode.motherId || '';
        fields.fatherId = editAnchorNode.fatherId || '';
      } else if (editRelacion === 'hijo' || editRelacion === 'hija') {
        if (editRolPropio === 'madre') {
          fields.motherId = editAnchorNode.id;
          if (nodoActual?.fatherId === editAnchorNode.id) fields.fatherId = '';
        } else {
          fields.fatherId = editAnchorNode.id;
          if (nodoActual?.motherId === editAnchorNode.id) fields.motherId = '';
        }
      } else if (editRelacion === 'abuelo' || editRelacion === 'abuela') {
        // el vínculo real no va en ESTA persona — va en su nieto/a (el
        // progenitor), que es quien pasa a tenerla como madre/padre. Acá
        // solo limpiamos cualquier motherId/fatherId viejo que hubiera
        // quedado mal en ella (de una edición anterior con este bug)
        fields.motherId = '';
        fields.fatherId = '';
      } else if (editRelacion === 'nieto' || editRelacion === 'nieta') {
        const hijoId = (hijosDeEditAnchor.length === 1 ? hijosDeEditAnchor[0].id : editAscendenciaId) || '';
        if (editRolPropio === 'madre') {
          fields.motherId = hijoId;
          if (nodoActual?.fatherId === hijoId) fields.fatherId = '';
        } else {
          fields.fatherId = hijoId;
          if (nodoActual?.motherId === hijoId) fields.motherId = '';
        }
      } else if (['hermano', 'hermana', 'hijo', 'hija', 'abuelo', 'abuela', 'nieto', 'nieta'].includes(editOriginalRelacion)) {
        fields.motherId = '';
        fields.fatherId = '';
      }

      const resPropio: any = await familyService.updateMember(editId as string, fields, editImgFile || undefined);

      if (editRelacion === 'abuelo' || editRelacion === 'abuela') {
        const progenitorId = editAscendenciaId || editAnchorNode.fatherId || editAnchorNode.motherId || '';
        if (progenitorId) {
          if (editRolPropio === 'madre') await familyService.updateMember(progenitorId, { motherId: editId as string });
          else await familyService.updateMember(progenitorId, { fatherId: editId as string });
        }
      }

      if (editRelacion === 'madre' || editRelacion === 'padre') {
        const slotHermanos = editRelacion === 'madre' ? 'motherId' : 'fatherId';
        await familyService.updateMember(editAnchorNode.id, { [slotHermanos]: editId as string });
        for (const hermano of hermanosDeEditAnchorList) {
          const actual = slotHermanos === 'motherId' ? hermano.motherId : hermano.fatherId;
          const deberiaEstarMarcado = editHermanosCompartidos.includes(hermano.id);
          if (deberiaEstarMarcado && actual !== editId) {
            await familyService.updateMember(hermano.id, { [slotHermanos]: editId as string });
          } else if (!deberiaEstarMarcado && actual === editId) {
            await familyService.updateMember(hermano.id, { [slotHermanos]: '' });
          }
        }
      }
      if (editRelacion === 'pareja') {
        const yaEsPareja = partners.some((p: any) =>
          (p.memberAId === editAnchorNode.id && p.memberBId === editId) || (p.memberBId === editAnchorNode.id && p.memberAId === editId)
        );
        if (!yaEsPareja) await familyService.addPartner(editAnchorNode.id, editId as string);

        const slot = editGender === 'female' ? 'motherId' : editGender === 'male' ? 'fatherId' : null;
        const saltados: string[] = [];
        if (slot) {
          for (const hijo of hijosDeEditAnchor) {
            const actual = slot === 'motherId' ? hijo.motherId : hijo.fatherId;
            const deberiaEstarMarcado = editHijosCompartidos.includes(hijo.id);
            if (deberiaEstarMarcado && actual !== editId) {
              if (actual) {
                const nombreActual = hijosDeEditAnchor.find(h2 => h2.id === actual)?.name
                  || members.find(m => m.id === actual)?.firstName
                  || 'otra persona';
                saltados.push(`${hijo.name} (ya tiene a ${nombreActual} como ${slot === 'motherId' ? 'madre' : 'padre'})`);
              } else {
                await familyService.updateMember(hijo.id, { [slot]: editId as string });
              }
            } else if (!deberiaEstarMarcado && actual === editId) {
              await familyService.updateMember(hijo.id, { [slot]: '' });
            }
          }
        }
        if (saltados.length > 0) showToast(`⚠️ ${saltados.join('; ')}`);
      }

      await cargarArbol();
      setEditOpen(false);
      // actualizamos el modal de detalle (si seguía abierto atrás) con los
      // datos frescos de la propia respuesta del guardado — no hace falta
      // esperar a que se recalcule todo el árbol para ver el cambio reflejado
      setModalNode(prev => prev && prev.id === editId
        ? {
          ...prev,
          img: resPropio.data.photoUrl,
          name: `${resPropio.data.firstName} ${resPropio.data.lastName || ''}`.trim(),
          desc: resPropio.data.bio || undefined,
        }
        : prev
      );
      showToast('✓ Persona actualizada');
    } catch (err: any) {
      showToast(`⚠️ ${err.message || 'Error al guardar'}`);
    }
  };

  const cerrarAddPanel = () => {
    setAddPanelOpen(false);
    setNewFirstName(''); setNewLastName(''); setNewGender(''); setNewBirth(''); setNewDeath('');
    setNewDesc(''); setNewVive(true); setNewAnchorId(''); setNewRelacion(''); setNewRolPropio('madre'); setNewAscendenciaId(''); setNewHijosCompartidos([]); setNewHermanosCompartidos([]);
    setNewImgFile(null); setNewImgPreview('');
  };

  const yoNode = treeData.find(n => n.role === 'Yo');
  const hijosDeYo = yoNode ? treeData.filter(n => n.motherId === yoNode.id || n.fatherId === yoNode.id) : [];
  const anchorNode = treeData.find(n => n.id === newAnchorId) || yoNode;
  const hijosDeAnchor = anchorNode ? treeData.filter(n => n.motherId === anchorNode.id || n.fatherId === anchorNode.id) : [];
  const editAnchorNode = treeData.find(n => n.id === editAnchorId) || yoNode;
  const hijosDeEditAnchor = editAnchorNode ? treeData.filter(n => n.motherId === editAnchorNode.id || n.fatherId === editAnchorNode.id) : [];

  // hermanos ya existentes del "ancla" — comparten con él/ella su otro
  // progenitor. Sirve para, al sumarle una madre/padre nueva, ofrecer
  // reconectarlos también a ellos en el mismo paso (en vez de a mano)
  const hermanosDeAnchor = (anchor: any) => anchor
    ? treeData.filter(n => n.id !== anchor.id && (
      (anchor.motherId && n.motherId === anchor.motherId) ||
      (anchor.fatherId && n.fatherId === anchor.fatherId)
    ))
    : [];
  const hermanosDeNewAnchor = hermanosDeAnchor(anchorNode);
  const hermanosDeEditAnchorList = hermanosDeAnchor(editAnchorNode);

  const GENERO_IMPLICITO: Record<string, string> = {
    madre: 'female', padre: 'male', hermana: 'female', hermano: 'male',
    hija: 'female', hijo: 'male', abuela: 'female', abuelo: 'male', nieta: 'female', nieto: 'male',
  };

  const addPerson = async () => {
    if (!newFirstName.trim()) { showToast('⚠️ El nombre no puede estar vacío'); return; }
    if (!newRelacion) { showToast('⚠️ Elegí qué relación es'); return; }
    if (!anchorNode) { showToast('⚠️ Elegí con quién es la relación'); return; }

    if ((newRelacion === 'abuelo' || newRelacion === 'abuela') && anchorNode.motherId && anchorNode.fatherId && !newAscendenciaId) {
      showToast('⚠️ Elegí de qué lado (madre o padre)'); return;
    }
    if ((newRelacion === 'abuelo' || newRelacion === 'abuela') && !anchorNode.motherId && !anchorNode.fatherId) {
      showToast(`⚠️ Primero agregá a la madre o al padre de ${anchorNode.name}`); return;
    }
    if ((newRelacion === 'nieto' || newRelacion === 'nieta') && hijosDeAnchor.length === 0) {
      showToast(`⚠️ Primero agregá un hijo o hija de ${anchorNode.name}`); return;
    }
    if ((newRelacion === 'nieto' || newRelacion === 'nieta') && hijosDeAnchor.length > 1 && !newAscendenciaId) {
      showToast('⚠️ Elegí de cuál de sus hijos'); return;
    }
    if ((newRelacion === 'hermano' || newRelacion === 'hermana') && !anchorNode.motherId && !anchorNode.fatherId) {
      showToast(`⚠️ Para marcarlo como hermano/a de ${anchorNode.name}, primero agregale una madre o un padre — es lo que los conecta como hermanos`); return;
    }

    try {
      const fields: Record<string, string> = { firstName: newFirstName.trim() };
      if (newLastName.trim()) fields.lastName = newLastName.trim();
      if (newBirth) fields.birthDate = newBirth;
      if (!newVive && newDeath) fields.deathDate = newDeath;
      if (newDesc) fields.bio = newDesc;
      const genero = newGender || GENERO_IMPLICITO[newRelacion] || '';
      if (genero) fields.gender = genero;

      if (newRelacion === 'hermano' || newRelacion === 'hermana') {
        if (anchorNode.motherId) fields.motherId = anchorNode.motherId;
        if (anchorNode.fatherId) fields.fatherId = anchorNode.fatherId;
      }
      if (newRelacion === 'hijo' || newRelacion === 'hija') {
        if (newRolPropio === 'madre') fields.motherId = anchorNode.id; else fields.fatherId = anchorNode.id;
      }
      if (newRelacion === 'nieto' || newRelacion === 'nieta') {
        const hijoId = hijosDeAnchor.length === 1 ? hijosDeAnchor[0].id : newAscendenciaId;
        if (newRolPropio === 'madre') fields.motherId = hijoId; else fields.fatherId = hijoId;
      }

      const res: any = await familyService.createMember(fields, newImgFile || undefined);
      const nuevoId = res.data.id;

      if (newRelacion === 'abuelo' || newRelacion === 'abuela') {
        const progenitorId = newAscendenciaId || anchorNode.fatherId || anchorNode.motherId as string;
        if (newRolPropio === 'madre') await familyService.updateMember(progenitorId, { motherId: nuevoId });
        else await familyService.updateMember(progenitorId, { fatherId: nuevoId });
      }

      if (newRelacion === 'madre' || newRelacion === 'padre') {
        const slotHermanos = newRelacion === 'madre' ? 'motherId' : 'fatherId';
        await familyService.updateMember(anchorNode.id, { [slotHermanos]: nuevoId });
        for (const hermano of hermanosDeNewAnchor) {
          const actual = slotHermanos === 'motherId' ? hermano.motherId : hermano.fatherId;
          const deberiaEstarMarcado = newHermanosCompartidos.includes(hermano.id);
          if (deberiaEstarMarcado) {
            await familyService.updateMember(hermano.id, { [slotHermanos]: nuevoId });
          } else if (actual === nuevoId) {
            await familyService.updateMember(hermano.id, { [slotHermanos]: '' });
          }
        }
      }
      if (newRelacion === 'pareja') {
        await familyService.addPartner(anchorNode.id, nuevoId);
        const slot = genero === 'female' ? 'motherId' : genero === 'male' ? 'fatherId' : null;
        if (slot && newHijosCompartidos.length > 0) {
          for (const hijoId of newHijosCompartidos) {
            const hijo = hijosDeAnchor.find(h => h.id === hijoId);
            const yaOcupado = slot === 'motherId' ? hijo?.motherId : hijo?.fatherId;
            if (!yaOcupado) await familyService.updateMember(hijoId, { [slot]: nuevoId });
          }
        }
      }

      await cargarArbol();
      cerrarAddPanel();
      showToast('✓ Persona agregada al árbol');
    } catch (err: any) {
      showToast(`⚠️ ${err.message || 'Error al agregar'}`);
    }
  };


  const stats = {
    personas: treeData.length,
    generaciones: [...new Set(treeData.map(n => Math.abs(n.gen)))].length,
  };

  const filteredIds = searchQ
    ? treeData.filter(n => n.name.toLowerCase().includes(searchQ.toLowerCase()) || n.role.toLowerCase().includes(searchQ.toLowerCase())).map(n => n.id)
    : null;

  const renderBranches = () => {
    const lineas: JSX.Element[] = [];
    treeData.forEach(node => {
      ([node.motherId, node.fatherId] as (string | null)[]).filter(Boolean).forEach(parentId => {
        const from = getPos(parentId as string), to = getPos(node.id);
        if (!from || !to) return;
        const isHighlighted = highlightPath.includes(node.id) && highlightPath.includes(parentId as string);
        const cx1 = from.x + (to.x - from.x) * 0.5, cy1 = from.y;
        const cx2 = from.x + (to.x - from.x) * 0.5, cy2 = to.y;
        lineas.push(
          <path key={`branch-${node.id}-${parentId}`}
            d={`M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`}
            stroke={isHighlighted ? '#C9A84C' : node.gen === 1 ? '#a0948a' : node.gen === 2 ? '#b8aea8' : '#c4c6cd'}
            strokeWidth={isHighlighted ? 3 : node.gen === 1 ? 2.5 : node.gen === 2 ? 2 : 1.5}
            fill="none" strokeLinecap="round"
            className={`ft-branch ${isHighlighted ? 'ft-branch--highlight' : ''}`}
            style={{ opacity: (filteredIds && !filteredIds.includes(node.id)) ? 0.1 : 1, transition: 'opacity 0.4s ease' }}
          />
        );
      });
    });
    return lineas;
  };


  return (
    <div className="ft-root with-navbar">

      <header className="ft-header">
        <div className="ft-header__left">
          <button className="ft-header__back" onClick={() => navigate('/feed')}><ArrowLeft size={20} strokeWidth={1.8} /></button>
          <div>
            <h1 className="ft-header__title">Árbol Genealógico</h1>
            <p className="ft-header__sub">{stats.personas} personas · {stats.generaciones} generaciones</p>
          </div>
        </div>
        <div className="ft-header__actions">
          <div className="ft-header__search-wrap" ref={searchWrapRef}>
            <input
              ref={searchInputRef}
              className={`ft-header__search-input${searchOpen ? ' is-open' : ''}`}
              placeholder="Buscar familiar..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            <button className="ft-header__btn" onClick={toggleSearch}><Search size={18} strokeWidth={1.8} /></button>
          </div>
          <button className="ft-header__btn ft-header__btn--propuestas" onClick={abrirPropuestas} title="Propuestas de etiquetado">
            <Bell size={18} strokeWidth={1.8} />
            {propuestas.length > 0 && <span className="ft-header__badge">{propuestas.length}</span>}
          </button>
          <button className="ft-header__btn" onClick={compartirInvitacion} title="Invitar a alguien a Life's">
            <Share2 size={18} strokeWidth={1.8} />
          </button>
          <button className="ft-header__btn ft-header__btn--peligro" onClick={() => setConfirmandoVaciarArbol(true)} title="Vaciar todo el árbol">
            <Trash2 size={18} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {propuestasOpen && (
        <>
          <div className="ft-menu-backdrop-arbol" onClick={() => setPropuestasOpen(false)} />
          <div className="ft-propuestas-panel">
            <div className="ft-propuestas-panel__header">
              <span>Propuestas de etiquetado</span>
              <button onClick={() => setPropuestasOpen(false)}><X size={16} strokeWidth={1.8} /></button>
            </div>
            {cargandoPropuestas && <p className="ft-propuestas-panel__vacio">Cargando...</p>}
            {!cargandoPropuestas && propuestas.length === 0 && (
              <p className="ft-propuestas-panel__vacio">No tenés propuestas pendientes.</p>
            )}
            {!cargandoPropuestas && propuestas.map((p: any) => (
              <button key={p.memberId} className="ft-propuestas-panel__item" onClick={() => abrirDetallePropuesta(p)}>
                {p.owner.avatarUrl
                  ? <img src={p.owner.avatarUrl} alt={p.owner.firstName} />
                  : <div className="ft-propuestas-panel__item-vacio">{p.owner.firstName[0]}</div>
                }
                <div className="ft-propuestas-panel__item-info">
                  <strong>{p.owner.firstName} {p.owner.lastName}</strong>
                  <span>te agregó a su árbol como "{p.firstName} {p.lastName || ''}"</span>
                </div>
                <ChevronRight size={16} strokeWidth={1.8} className="ft-propuestas-panel__item-arrow" />
              </button>
            ))}
          </div>
        </>
      )}

      {cargando && cargaCountRef.current === 0 && <div className="ft-toast" style={{ position: 'relative', margin: '20px auto', width: 'fit-content' }}>Cargando tu árbol...</div>}

      {/* ÁRBOL */}
      <div className={`ft-wrap ${isDragging ? 'ft-wrap--dragging' : ''}`} ref={wrapRef}
        onMouseDown={e => {
          setZoomConBoton(false);
          hasDraggedRef.current = false;
          mouseDownPos.current = { x: e.clientX, y: e.clientY };
          setIsDragging(true);
          setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
        }}
        onMouseMove={e => {
          if (draggingNodeId) {
            lastMouseClientRef.current = { x: e.clientX, y: e.clientY };
            if (Math.abs(e.clientX - nodeDragStart.current.mouseX) > 5 || Math.abs(e.clientY - nodeDragStart.current.mouseY) > 5) {
              hasDraggedRef.current = true;
            }
            return;
          }
          if (!isDragging) return;
          if (Math.abs(e.clientX - mouseDownPos.current.x) > 5 || Math.abs(e.clientY - mouseDownPos.current.y) > 5) {
            hasDraggedRef.current = true;
          }
          setPanX(e.clientX - dragStart.x); setPanY(e.clientY - dragStart.y);
        }}
        onMouseUp={() => {
          // el arrastre de un nodo ahora se termina con el listener global
          // de window (más abajo), no acá — así funciona aunque sueltes
          // el mouse afuera del recuadro
          setIsDragging(false);
        }}
        onMouseLeave={() => {
          setIsDragging(false);
          // el arrastre de un NODO no se cancela al salir del recuadro —
          // sigue vivo (con autoscroll) hasta que soltás el mouse en
          // cualquier lugar de la pantalla
        }}
        onWheel={e => {
          if (!esPantallaCompleta) return;
          e.preventDefault();
          const rect = wrapRef.current?.getBoundingClientRect();
          if (!rect) return;
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          setZoomConBoton(false);
          zoomHacia(zoom - e.deltaY * 0.001, mouseX, mouseY);
        }}>

        {/* <svg className="ft-bg-tree" viewBox="0 0 800 560" preserveAspectRatio="xMidYMax meet">
          <g fill="none" stroke="#03192e" strokeLinecap="round">
            <path strokeWidth="9"  d="M400 440 Q340 460 270 490 Q230 505 180 520"/>
            <path strokeWidth="7"  d="M400 440 Q360 465 320 495 Q290 510 260 530"/>
            <path strokeWidth="6"  d="M400 440 Q395 460 390 490 Q387 510 385 535"/>
            <path strokeWidth="6"  d="M400 440 Q420 458 445 482 Q460 500 470 525"/>
            <path strokeWidth="7"  d="M400 440 Q440 460 490 488 Q530 508 570 522"/>
            <path strokeWidth="4"  d="M270 490 Q240 500 210 515"/>
            <path strokeWidth="4"  d="M270 490 Q240 500 210 515"/>
            <path strokeWidth="3"  d="M320 495 Q295 510 275 528"/>
            <path strokeWidth="4"  d="M490 488 Q510 500 530 520"/>
          </g>
          <path fill="none" stroke="#03192e" strokeLinecap="round" strokeWidth="28" d="M400 440 Q398 390 395 350 Q392 310 390 270"/>
          <path fill="none" stroke="#03192e" strokeLinecap="round" strokeWidth="22" d="M390 270 Q388 240 385 210 Q382 180 378 155"/>
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
            <circle cx="370" cy="35"  r="5" fill="#C9A84C" opacity="0.9"/>
            <circle cx="98"  cy="52"  r="4" fill="#C9A84C" opacity="0.85"/>
            <circle cx="685" cy="52"  r="4" fill="#C9A84C" opacity="0.85"/>
            <circle cx="320" cy="48"  r="3" fill="#ffe088" opacity="0.8"/>
            <circle cx="420" cy="44"  r="3" fill="#ffe088" opacity="0.8"/>
            <circle cx="148" cy="80"  r="3" fill="#ffe088" opacity="0.75"/>
            <circle cx="632" cy="78"  r="3" fill="#ffe088" opacity="0.75"/>
          </g>
        </svg> */}

        <img src={arbolFondo} alt="" className="ft-bg-tree" draggable={false} />

        <div className={`ft-capa-arbol${zoomConBoton ? ' ft-capa-arbol--zoom-suave' : ''}`}
          style={{ transform: `translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin: '0 0' }}>

          <svg ref={svgRef} className="ft-svg">
            {renderBranches()}
            {partners.map((p: any) => {
              const from = getPos(p.memberAId), to = getPos(p.memberBId);
              if (!from || !to) return null;
              const cx1 = from.x + (to.x - from.x) * 0.5, cy1 = from.y;
              const cx2 = from.x + (to.x - from.x) * 0.5, cy2 = to.y;
              return (
                <path key={`pareja-${p.id}`}
                  d={`M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`}
                  fill="none" stroke="#C9A84C" strokeWidth={2} strokeDasharray="5 5" opacity={0.55}
                />
              );
            })}
          </svg>

          <div className="ft-nodes">
            {treeData.map((node, ni) => {
              const pos = (draggingNodeId === node.id && dragNodePos) ? dragNodePos : positions[node.id];
              if (!pos) return null;
              const cfg = getGenConfig(node.gen);
              const isHighlighted = highlightPath.includes(node.id);
              const isFiltered = filteredIds ? !filteredIds.includes(node.id) : false;
              return (
                <div key={node.id}
                  className={`ft-node ${node.isDead ? 'ft-node--dead' : ''} ${isHighlighted ? 'ft-node--highlight' : ''} ${draggingNodeId === node.id ? 'ft-node--arrastrando' : ''} ${cargaCountRef.current > 1 ? 'ft-node--sin-entrada' : ''}`}
                  style={{ left: pos.x, top: pos.y, animationDelay: `${ni * 0.08}s`, opacity: isFiltered ? 0.12 : 1, pointerEvents: isFiltered ? 'none' : 'all' }}
                  onMouseDown={e => {
                    e.stopPropagation();
                    const p = positions[node.id];
                    if (!p) return;
                    hasDraggedRef.current = false;
                    lastMouseClientRef.current = { x: e.clientX, y: e.clientY };
                    setDraggingNodeId(node.id);
                    const rect = wrapRef.current?.getBoundingClientRect();
                    const worldXAlClick = rect ? (e.clientX - rect.left - panX) / zoom : 0;
                    const worldYAlClick = rect ? (e.clientY - rect.top - panY) / zoom : 0;
                    nodeDragStart.current = {
                      mouseX: e.clientX, mouseY: e.clientY, nodeX: p.x, nodeY: p.y,
                      offsetX: p.x - worldXAlClick, offsetY: p.y - worldYAlClick,
                    };
                  }}
                  onClick={() => { if (hasDraggedRef.current) return; openModal(node); }}>
                  <div className="ft-node__glow" style={{ background: cfg.glow, opacity: isHighlighted ? 1 : 0.5 }} />
                  <div className="ft-node__ring" style={{ background: isHighlighted ? 'linear-gradient(135deg,#C9A84C,#ffe088)' : cfg.ring, width: cfg.size + 8, height: cfg.size + 8 }}>
                    {node.img
                      ? <img src={node.img} alt={node.name} className="ft-node__img" draggable={false} style={{ width: cfg.size, height: cfg.size, filter: node.isDead ? 'grayscale(0.7) sepia(0.3)' : 'none' }} />
                      : <div className="ft-node__initials" style={{ width: cfg.size, height: cfg.size }}>{node.name.charAt(0)}</div>
                    }
                    {node.isDead && <div className="ft-node__candle">🕯️</div>}
                  </div>
                  <div className="ft-node__name" style={{ maxWidth: cfg.size + 32 }}>{node.name.split(' ')[0]}</div>
                  <div className="ft-node__role">{node.role}</div>
                  {zoom > 1.3 && node.hijosNombres && node.hijosNombres.length > 0 && (
                    <div className="ft-node__tarjeta">
                      <span className="ft-node__tarjeta-label">
                        {node.gender === 'female' ? 'Madre de' : node.gender === 'male' ? 'Padre de' : 'Progenitor/a de'}
                      </span>
                      <span className="ft-node__tarjeta-nombres">{node.hijosNombres.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        <div className="ft-zoom">
          <button className="ft-zoom__btn" title="Acercar" onClick={() => { setZoomConBoton(true); const r = wrapRef.current?.getBoundingClientRect(); zoomHacia(zoom + 0.15, (r?.width ?? 0) / 2, (r?.height ?? 0) / 2); }}><ZoomIn size={18} strokeWidth={1.8} /></button>
          <button className="ft-zoom__btn" title="Alejar" onClick={() => { setZoomConBoton(true); const r = wrapRef.current?.getBoundingClientRect(); zoomHacia(zoom - 0.15, (r?.width ?? 0) / 2, (r?.height ?? 0) / 2); }}><ZoomOut size={18} strokeWidth={1.8} /></button>
          <button className="ft-zoom__btn" title="Centrar árbol" onClick={() => { setZoomConBoton(true); setZoom(1); setPanX(0); setPanY(0); }}><Crosshair size={18} strokeWidth={1.8} /></button>
          <button className="ft-zoom__btn" title="Pantalla completa" onClick={() => wrapRef.current?.requestFullscreen()}><Maximize2 size={18} strokeWidth={1.8} /></button>
        </div>

        <div className="ft-leyenda">
          {[
            { grad: 'linear-gradient(135deg,#C9A84C,#ffe088)', label: 'Tú' },
            { grad: 'linear-gradient(135deg,#855324,#03192e)', label: 'Padres / Pareja' },
            { grad: 'linear-gradient(135deg,#03192e,#1a2e44)', label: 'Abuelos / Hijos' },
            { grad: 'linear-gradient(135deg,#74777d,#c4c6cd)', label: 'Bisabuelos' },
          ].map(l => (
            <div key={l.label} className="ft-leyenda__item">
              <div className="ft-leyenda__dot" style={{ background: l.grad }} /><span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PANEL INFO */}
      <div className="ft-panel-wrap">
        <div className="ft-stats">
          <div className="ft-stats__header">
            <div><h2 className="ft-stats__title">El Linaje Vivo</h2><p className="ft-stats__sub">Tocá una categoría para filtrar</p></div>
            <div className="ft-stats__nums">
              {[{ val: stats.personas, label: 'Personas' }, { val: stats.generaciones, label: 'Gen.' }].map(s => (
                <div key={s.label} className="ft-stat-num">
                  <span className="ft-stat-num__val">{s.val}</span>
                  <span className="ft-stat-num__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ft-tabs">
            {TABS.map(tab => {
              const count = treeData.filter(CATEGORY_MAP[tab.id]).length;
              return (
                <button key={tab.id} className={`ft-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    if (activeTab === tab.id && panelOpen) { setPanelOpen(false); return; }
                    setActiveTab(tab.id);
                    setPanelOpen(true);
                  }}>
                  {tab.icono}{tab.label}{count > 0 && <span className="ft-tab__count">({count})</span>}
                </button>
              );
            })}
          </div>
          {panelOpen && (
            <div className="ft-family-list">
              <div className="ft-family-list__header">
                <span>{TABS.find(t => t.id === activeTab)?.label} · {treeData.filter(CATEGORY_MAP[activeTab]).length} personas</span>
                <button onClick={() => setPanelOpen(false)}><X size={18} strokeWidth={1.8} /></button>
              </div>
              {treeData.filter(CATEGORY_MAP[activeTab]).length === 0 ? (
                <div className="ft-family-list__empty">
                  <Search size={32} strokeWidth={1.4} /><p>Aún no hay personas en esta categoría</p>
                  <button onClick={() => setAddPanelOpen(true)}>Agregar ahora</button>
                </div>
              ) : (
                <div className="ft-family-list__scroll">
                  {treeData.filter(CATEGORY_MAP[activeTab]).map(node => (
                    <div key={node.id} className="ft-person-card" onClick={() => openModal(node)}>
                      <div className="ft-person-card__ring" style={{ background: getGenConfig(node.gen).ring }}>
                        {node.img
                          ? <img src={node.img} alt={node.name} style={{ filter: node.isDead ? 'grayscale(0.6) sepia(0.3)' : 'none' }} />
                          : <div className="ft-person-card__ring-vacio">{node.name.charAt(0)}</div>
                        }
                      </div>
                      <div className="ft-person-card__info">
                        <div className="ft-person-card__name">{node.name} {node.isDead ? '🕯️' : ''}</div>
                        <div className="ft-person-card__role">{node.role}</div>
                        {node.birth && <div className="ft-person-card__birth">{node.birth}{node.death ? ` — ${node.death}` : ''}</div>}
                      </div>
                      <ChevronRight size={16} strokeWidth={1.8} className="ft-person-card__arrow" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="ft-add-wrap">
          <button className="ft-add-btn" onClick={() => setAddPanelOpen(true)}>
            <UserPlus size={18} strokeWidth={1.8} />Agregar persona al árbol
          </button>
          <div className="ft-quick-actions">
            {[
              { icono: <BookOpen size={15} strokeWidth={1.8} />, label: 'Recuerdos', path: '/feed' },
              { icono: <MapIcon size={15} strokeWidth={1.8} />, label: 'Mapa linaje', path: '/mapa-linaje' },
              { icono: <Download size={15} strokeWidth={1.8} />, label: 'Exportar', path: '/feed' },
            ].map(a => (
              <button key={a.label} className="ft-quick-action" onClick={() => navigate(a.path)}>
                {a.icono}<span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ MODAL VER PERSONA ══ */}
      {modalNode && (
        <div
          className="ft-modal-overlay"
          onMouseDown={e => { mouseDownOnOverlayRef.current = e.target === e.currentTarget; }}
          onMouseUp={e => {
            if (mouseDownOnOverlayRef.current && e.target === e.currentTarget) closeModal();
            mouseDownOnOverlayRef.current = false;
          }}
        >
          <div className="ft-modal">
            <div className="ft-modal__banner">
              <div className="ft-modal__banner-bg" style={{ background: getGenConfig(modalNode.gen).ring }}>
                {modalNode.isDead && <div className="ft-modal__dead-overlay" />}
                <button className="ft-modal__close" onClick={closeModal}><X size={18} strokeWidth={1.8} /></button>
              </div>
              <div className="ft-modal__avatar-wrap">
                <div
                  className="ft-modal__avatar-ring"
                  style={{ background: getGenConfig(modalNode.gen).ring, cursor: modalNode.img ? 'zoom-in' : 'default' }}
                  onClick={() => modalNode.img && setVerFotoGrande(true)}
                >
                  {modalNode.img
                    ? <img src={modalNode.img} alt={modalNode.name} style={{ filter: modalNode.isDead ? 'grayscale(0.5) sepia(0.4)' : 'none' }} />
                    : <div className="ft-modal__avatar-vacio">{modalNode.name.charAt(0)}</div>
                  }
                </div>
                {modalNode.isDead && <div className="ft-modal__candle-big">🕯️</div>}
              </div>
            </div>
            <div className="ft-modal__body">
              <div className="ft-modal__head">
                {modalNode.linkedUserId ? (
                  <Link to={`/perfil/${modalNode.linkedUserId}`} className="ft-modal__name ft-modal__name--link">
                    {modalNode.name}
                  </Link>
                ) : (
                  <h3 className="ft-modal__name">{modalNode.name}</h3>
                )}
                <span className="ft-modal__role">{modalNode.role}</span>
                {modalNode.isDead && <span className="ft-modal__dead-badge">✝ En memoria</span>}
              </div>
              {modalNode.dnaPercent !== undefined && modalNode.dnaPercent !== null && modalNode.role !== 'Yo' && (
                <div className="ft-modal__dna">
                  <div className="ft-modal__dna-header"><span>ADN compartido (estimado)</span><span className="ft-modal__dna-val">{modalNode.dnaPercent}%</span></div>
                  <div className="ft-modal__dna-bar"><div className="ft-modal__dna-fill" style={{ width: `${modalNode.dnaPercent}%` }} /></div>
                </div>
              )}
              <div className="ft-modal__grid">
                {[
                  { icono: <Cake size={15} strokeWidth={1.8} />, label: 'Nacimiento', val: modalNode.birth || '—' },
                  { icono: <Users size={15} strokeWidth={1.8} />, label: 'Parentesco', val: modalNode.role },
                  { icono: <GitBranch size={15} strokeWidth={1.8} />, label: 'Generación', val: modalNode.gen === 0 ? 'Tu generación' : `Gen. ${Math.abs(modalNode.gen)}` },
                  ...(modalNode.death ? [{ icono: <Heart size={15} strokeWidth={1.8} />, label: 'Fallecimiento', val: modalNode.death }] : []),
                ].map(d => (
                  <div key={d.label} className="ft-modal__data-item">
                    {d.icono}<div><div className="ft-modal__data-label">{d.label}</div><div className="ft-modal__data-val">{d.val}</div></div>
                  </div>
                ))}
              </div>
              {modalNode.desc && <p className="ft-modal__desc">"{modalNode.desc}"</p>}


              {modalNode.role !== 'Yo' && (
                <div className="ft-modal__etiquetado">
                  {modalNode.linkedUserId ? (
                    <>
                      <div className="ft-modal__etiquetado-estado">
                        <Check size={14} strokeWidth={2} /> Vinculado con una cuenta real
                        <button onClick={desvincularPersona} disabled={desvinculando}>
                          {desvinculando ? 'Desvinculando...' : 'Desvincular'}
                        </button>
                      </div>
                      {!previewCopiaModal && !cargandoPreviewModal && (
                        <button className="ft-modal__btn-etiquetar" onClick={abrirPreviewCopiaModal}>
                          Copiar su árbol
                        </button>
                      )}
                      {cargandoPreviewModal && <p className="ft-modal__etiquetado-vacio">Revisando su árbol...</p>}
                      {previewCopiaModal && previewCopiaModal.total === 0 && (
                        <p className="ft-modal__etiquetado-vacio">Ya tenés todo lo de su árbol copiado.</p>
                      )}
                      {previewCopiaModal && previewCopiaModal.total > 0 && (
                        <div className="ft-modal__copiar-confirm ft-modal__copiar-confirm--col">
                          {previewCopiaModal.fusionesPosibles.length > 0 && (
                            <div className="ft-modal__fusiones">
                              <span className="ft-modal__fusiones-titulo">Encontramos personas que ya tenías cargadas — ¿son la misma?</span>
                              {previewCopiaModal.fusionesPosibles.map((f: any) => (
                                <label key={f.sourceId} className="ft-add-check">
                                  <input
                                    type="checkbox"
                                    checked={fusionesElegidasModal.has(f.sourceId)}
                                    onChange={e => {
                                      setFusionesElegidasModal(prev => {
                                        const s = new Set(prev);
                                        e.target.checked ? s.add(f.sourceId) : s.delete(f.sourceId);
                                        return s;
                                      });
                                    }}
                                  />
                                  {f.sourceName} = {f.existingName} (tu {f.slot})
                                </label>
                              ))}
                            </div>
                          )}
                          <div className="ft-modal__copiar-confirm-row">
                            <span>
                              {previewCopiaModal.primeraVez
                                ? `Se sumarán ${previewCopiaModal.total} persona${previewCopiaModal.total === 1 ? '' : 's'} nuevas.`
                                : `${previewCopiaModal.total} persona${previewCopiaModal.total === 1 ? '' : 's'} nueva${previewCopiaModal.total === 1 ? '' : 's'} desde la última copia.`}
                            </span>
                            <button disabled={copiandoDesdeModal} onClick={confirmarCopiaModal}>
                              {copiandoDesdeModal ? 'Copiando...' : 'Confirmar copia'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : modalNode.linkPendienteUserId ? (
                    <div className="ft-modal__etiquetado-estado">
                      <Clock size={14} strokeWidth={1.8} /> Esperando que acepte la etiqueta
                      <button onClick={cancelarPropuestaPropia}>Cancelar</button>
                    </div>
                  ) : etiquetando ? (
                    <div className="ft-modal__etiquetado-lista">
                      {cargandoConexiones && <p className="ft-modal__etiquetado-vacio">Cargando tus conexiones...</p>}
                      {!cargandoConexiones && misConexiones.length === 0 && (
                        <p className="ft-modal__etiquetado-vacio">
                          Todavía no tenés conexiones. Etiquetar solo funciona con personas ya conectadas —
                          si esta persona no usa Life's todavía, tocá el ícono de compartir (📤) arriba del árbol para invitarla.
                        </p>
                      )}
                      {!cargandoConexiones && misConexiones.length > 0 && (
                        <input
                          type="text"
                          className="ft-modal__etiquetado-buscador"
                          placeholder="Buscar en tus conexiones..."
                          value={buscarEtiquetaQ}
                          onChange={e => setBuscarEtiquetaQ(e.target.value)}
                          autoFocus
                        />
                      )}
                      {!cargandoConexiones && misConexiones.length > 0 && (
                        <div className="ft-modal__etiquetado-conexiones">
                          {misConexiones
                            .filter((c: any) => {
                              if (!buscarEtiquetaQ.trim()) return true;
                              const otro = c.requesterId === user?.id ? c.addressee : c.requester;
                              return `${otro.firstName} ${otro.lastName || ''}`.toLowerCase().includes(buscarEtiquetaQ.toLowerCase());
                            })
                            .map((c: any) => {
                              const otro = c.requesterId === user?.id ? c.addressee : c.requester;
                              return (
                                <button
                                  key={c.id}
                                  className="ft-modal__etiquetado-persona"
                                  disabled={enviandoEtiqueta}
                                  onClick={() => proponerEtiqueta(otro.id, otro.firstName)}
                                >
                                  {otro.avatarUrl
                                    ? <img src={otro.avatarUrl} alt={otro.firstName} />
                                    : <div className="ft-modal__etiquetado-persona-vacio">{otro.firstName[0]}</div>
                                  }
                                  <span>{otro.firstName} {otro.lastName}</span>
                                </button>
                              );
                            })}
                        </div>
                      )}
                      <button className="ft-modal__etiquetado-cerrar" onClick={() => setEtiquetando(false)}>Cancelar</button>
                    </div>
                  ) : (
                    <button className="ft-modal__btn-etiquetar" onClick={abrirEtiquetado}>
                      <Tag size={14} strokeWidth={1.8} /> Etiquetar a esta persona
                    </button>
                  )}
                </div>
              )}

              <div className="ft-modal__actions">
                <button className="ft-modal__btn-secondary" onClick={closeModal}>Cerrar</button>
                <button className="ft-modal__btn-primary" onClick={() => abrirEdicion(modalNode)}>
                  <Edit2 size={14} strokeWidth={1.8} />Editar
                </button>
              </div>
              {modalNode.role !== 'Yo' && (
                <button className="ft-modal__btn-eliminar" onClick={() => setConfirmandoEliminar(true)}>
                  Eliminar del árbol
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL EDICIÓN ══ */}
      {editOpen && (
        <div
          className="ft-modal-overlay"
          onMouseDown={e => { mouseDownOnOverlayRef.current = e.target === e.currentTarget; }}
          onMouseUp={e => {
            if (mouseDownOnOverlayRef.current && e.target === e.currentTarget) setEditOpen(false);
            mouseDownOnOverlayRef.current = false;
          }}
        >
          <div className="ft-add-panel" style={{ position: 'relative', bottom: 'auto', borderRadius: 16, maxWidth: 440, margin: 'auto' }}>
            <div className="ft-add-panel__header">
              <h3>Editar persona</h3>
              <button onClick={() => setEditOpen(false)}><X size={18} strokeWidth={1.8} /></button>
            </div>
            <div className="ft-add-panel__body">
              <input ref={inputFotoEditRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFotoEditSelected} />
              <div className="ft-edit-modal__foto-wrap">
                <div className="ft-edit-modal__foto-preview">
                  {editImgPreview ? <img src={editImgPreview} alt="preview" /> : <div className="ft-add-panel__foto-placeholder"><Camera size={24} strokeWidth={1.4} /></div>}
                </div>
                <div className="ft-edit-modal__foto-info">
                  <p className="ft-edit-modal__foto-label">Foto del familiar</p>
                  <button className="ft-edit-modal__foto-btn" onClick={() => inputFotoEditRef.current?.click()}>
                    <Camera size={14} strokeWidth={1.8} />Cambiar foto
                  </button>
                </div>
              </div>
              <div className="ft-add-row">
                <div className="ft-add-field"><label>Nombre *</label><input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} /></div>
                <div className="ft-add-field"><label>Apellido</label><input value={editLastName} onChange={e => setEditLastName(e.target.value)} /></div>
              </div>
              <div className="ft-add-field">
                <label>Género</label>
                <select value={editGender} onChange={e => setEditGender(e.target.value)}>
                  <option value="">— No especificar —</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div className="ft-add-row">
                <div className="ft-add-field"><label>Nacimiento</label><input type="date" value={editBirth} onChange={e => setEditBirth(e.target.value)} /></div>
                <div className="ft-add-field">
                  <label>¿Está vivo/a?</label>
                  <select value={editVive ? 'si' : 'no'} onChange={e => setEditVive(e.target.value === 'si')}>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              {!editVive && (
                <div className="ft-add-field">
                  <label>Fecha de fallecimiento (opcional)</label>
                  <input type="date" value={editDeath} onChange={e => setEditDeath(e.target.value)} />
                </div>
              )}

              <div className="ft-add-field">
                <label>¿Relación con quién? *</label>
                <select value={editAnchorId} onChange={e => { setEditAnchorId(e.target.value); setEditAscendenciaId(''); }}>
                  {yoNode && <option value={yoNode.id}>Vos (Yo)</option>}
                  {treeData.filter(n => n.role !== 'Yo' && n.id !== editId).map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.role})</option>
                  ))}
                </select>
              </div>

              <div className="ft-add-field">
                <label>¿Qué relación es?</label>
                <select value={editRelacion} onChange={e => { setEditRelacion(e.target.value); setEditAscendenciaId(''); }}>
                  <option value="">— Sin relación directa —</option>
                  <optgroup label="Ascendencia">
                    <option value="madre">Madre</option>
                    <option value="padre">Padre</option>
                    <option value="abuelo">Abuelo</option>
                    <option value="abuela">Abuela</option>
                  </optgroup>
                  <optgroup label="Directos">
                    <option value="hermano">Hermano</option>
                    <option value="hermana">Hermana</option>
                    <option value="pareja">Pareja / Esposo/a</option>
                  </optgroup>
                  <optgroup label="Descendencia">
                    <option value="hijo">Hijo</option>
                    <option value="hija">Hija</option>
                    <option value="nieto">Nieto</option>
                    <option value="nieta">Nieta</option>
                  </optgroup>
                </select>
              </div>

              {(editRelacion === 'hijo' || editRelacion === 'hija') && editAnchorNode && (
                <div className="ft-add-field">
                  <label>¿{editAnchorNode.name} es la madre o el padre de este/a {editRelacion === 'hijo' ? 'hijo' : 'hija'}?</label>
                  <select value={editRolPropio} onChange={e => setEditRolPropio(e.target.value as 'madre' | 'padre')}>
                    <option value="madre">Es la madre</option>
                    <option value="padre">Es el padre</option>
                  </select>
                </div>
              )}

              {(editRelacion === 'abuelo' || editRelacion === 'abuela') && editAnchorNode && (
                <>
                  {editAnchorNode.motherId && editAnchorNode.fatherId && (
                    <div className="ft-add-field">
                      <label>¿De qué lado?</label>
                      <select value={editAscendenciaId} onChange={e => setEditAscendenciaId(e.target.value)}>
                        <option value="">— Elegir —</option>
                        <option value={editAnchorNode.motherId}>Del lado de {members.find(m => m.id === editAnchorNode.motherId)?.firstName} (su madre)</option>
                        <option value={editAnchorNode.fatherId}>Del lado de {members.find(m => m.id === editAnchorNode.fatherId)?.firstName} (su padre)</option>
                      </select>
                    </div>
                  )}
                  <div className="ft-add-field">
                    <label>¿Es la madre o el padre de {members.find(m => m.id === (editAscendenciaId || editAnchorNode.fatherId || editAnchorNode.motherId))?.firstName || 'esa persona'}?</label>
                    <select value={editRolPropio} onChange={e => setEditRolPropio(e.target.value as 'madre' | 'padre')}>
                      <option value="madre">Es la madre</option>
                      <option value="padre">Es el padre</option>
                    </select>
                  </div>
                </>
              )}

              {editRelacion === 'pareja' && hijosDeEditAnchor.length > 0 && (
                <div className="ft-checklist-wrap">
                  <label>¿Es también madre/padre de alguno de estos hijos? {!editGender && '(elegí primero el Género arriba)'}</label>
                  {hijosDeEditAnchor.map(h => {
                    const slot = editGender === 'female' ? 'motherId' : editGender === 'male' ? 'fatherId' : null;
                    const actualId = slot === 'motherId' ? h.motherId : slot === 'fatherId' ? h.fatherId : null;
                    const otroYaAsignado = actualId && actualId !== editId ? treeData.find(n => n.id === actualId) : null;
                    return (
                      <label key={h.id} className="ft-add-check">
                        <input
                          type="checkbox"
                          disabled={!editGender}
                          checked={editHijosCompartidos.includes(h.id)}
                          onChange={e => {
                            setEditHijosCompartidos(prev =>
                              e.target.checked ? [...prev, h.id] : prev.filter(id => id !== h.id)
                            );
                          }}
                        />
                        {h.name}
                        {otroYaAsignado && <span className="ft-add-check__pista"> — ya tiene a {otroYaAsignado.name} como {slot === 'motherId' ? 'madre' : 'padre'}</span>}
                      </label>
                    );
                  })}
                </div>
              )}

              {(editRelacion === 'madre' || editRelacion === 'padre') && editAnchorNode && hermanosDeEditAnchorList.length > 0 && (
                <div className="ft-checklist-wrap">
                  <label>¿Es también {editRelacion} de alguno de estos hermanos de {editAnchorNode.name}?</label>
                  {hermanosDeEditAnchorList.map(h => {
                    const actualId = editRelacion === 'madre' ? h.motherId : h.fatherId;
                    const otroYaAsignado = actualId && actualId !== editId ? treeData.find(n => n.id === actualId) : null;
                    return (
                      <label key={h.id} className="ft-add-check">
                        <input
                          type="checkbox"
                          checked={editHermanosCompartidos.includes(h.id)}
                          onChange={e => {
                            setEditHermanosCompartidos(prev =>
                              e.target.checked ? [...prev, h.id] : prev.filter(id => id !== h.id)
                            );
                          }}
                        />
                        {h.name}
                        {otroYaAsignado && <span className="ft-add-check__pista"> — ya tiene a {otroYaAsignado.name} como {editRelacion}</span>}
                      </label>
                    );
                  })}
                </div>
              )}

              {(editRelacion === 'nieto' || editRelacion === 'nieta') && hijosDeEditAnchor.length > 0 && editAnchorNode && (
                <>
                  {hijosDeEditAnchor.length > 1 && (
                    <div className="ft-add-field">
                      <label>¿Hijo/a de cuál de los hijos de {editAnchorNode.name}?</label>
                      <select value={editAscendenciaId} onChange={e => setEditAscendenciaId(e.target.value)}>
                        <option value="">— Elegir —</option>
                        {hijosDeEditAnchor.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="ft-add-field">
                    <label>¿{hijosDeEditAnchor.length === 1 ? hijosDeEditAnchor[0].name : 'Esa persona'} es la madre o el padre de este/a nieto/a?</label>
                    <select value={editRolPropio} onChange={e => setEditRolPropio(e.target.value as 'madre' | 'padre')}>
                      <option value="madre">Es la madre</option>
                      <option value="padre">Es el padre</option>
                    </select>
                  </div>
                </>
              )}
              <div className="ft-add-field"><label>Nota biográfica</label><textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2} /></div>
              <div className="ft-add-field">
                <label>Relación mostrada (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Sobrina, Tío segundo, Madrina..."
                  value={editRelacionManual}
                  onChange={e => setEditRelacionManual(e.target.value)}
                />
                <span className="ft-add-field__hint">Si lo dejás vacío, se calcula solo según el parentesco. Escribí acá solo si el cálculo automático no da con el rol correcto.</span>
              </div>
              <div className="ft-add-panel__btns">
                <button className="ft-add-panel__cancel" onClick={() => setEditOpen(false)}><X size={14} strokeWidth={1.8} />Cancelar</button>
                <button className="ft-add-panel__submit" onClick={guardarEdicion}><Check size={14} strokeWidth={1.8} />Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ PANEL AGREGAR ══ */}
      {addPanelOpen && (
        <>
          <div className="ft-overlay" onClick={cerrarAddPanel} />
          <div className="ft-add-panel">
            <div className="ft-add-panel__handle" onClick={cerrarAddPanel}><div className="ft-add-panel__handle-bar" /></div>
            <div className="ft-add-panel__header">
              <h3>Nueva rama del árbol</h3>
              <button onClick={cerrarAddPanel}><X size={18} strokeWidth={1.8} /></button>
            </div>
            <div className="ft-add-panel__body">
              <input ref={inputFotoNewRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFotoNewSelected} />
              <div className="ft-edit-modal__foto-wrap">
                <div className="ft-edit-modal__foto-preview">
                  {newImgPreview ? <img src={newImgPreview} alt="preview" /> : <div className="ft-add-panel__foto-placeholder"><Camera size={24} strokeWidth={1.4} /></div>}
                </div>
                <div className="ft-edit-modal__foto-info">
                  <p className="ft-edit-modal__foto-label">Foto del familiar</p>
                  <p className="ft-edit-modal__foto-hint">Opcional · JPG, PNG o WEBP</p>
                  <button className="ft-edit-modal__foto-btn" onClick={() => inputFotoNewRef.current?.click()}>
                    <Camera size={14} strokeWidth={1.8} />{newImgPreview ? 'Cambiar foto' : 'Agregar foto'}
                  </button>
                  {newImgPreview && (
                    <button className="ft-add-panel__foto-quitar" onClick={() => { setNewImgFile(null); setNewImgPreview(''); }}>
                      <X size={11} strokeWidth={2} />Quitar
                    </button>
                  )}
                </div>
              </div>
              <div className="ft-add-row">
                <div className="ft-add-field"><label>Nombre *</label><input value={newFirstName} onChange={e => setNewFirstName(e.target.value)} placeholder="Ej: María" /></div>
                <div className="ft-add-field"><label>Apellido</label><input value={newLastName} onChange={e => setNewLastName(e.target.value)} placeholder="Ej: García" /></div>
              </div>
              <div className="ft-add-field">
                <label>Género</label>
                <select value={newGender} onChange={e => setNewGender(e.target.value)}>
                  <option value="">— No especificar —</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div className="ft-add-row">
                <div className="ft-add-field"><label>Nacimiento</label><input type="date" value={newBirth} onChange={e => setNewBirth(e.target.value)} /></div>
                <div className="ft-add-field">
                  <label>¿Está vivo/a?</label>
                  <select value={newVive ? 'si' : 'no'} onChange={e => setNewVive(e.target.value === 'si')}>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              {!newVive && (
                <div className="ft-add-field">
                  <label>Fecha de fallecimiento (opcional)</label>
                  <input type="date" value={newDeath} onChange={e => setNewDeath(e.target.value)} />
                </div>
              )}

              <div className="ft-add-field"><label>Nota biográfica</label><textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Su historia, su legado..." rows={2} /></div>

              <div className="ft-add-field">
                <label>¿Relación con quién? *</label>
                <select value={newAnchorId} onChange={e => { setNewAnchorId(e.target.value); setNewAscendenciaId(''); }}>
                  {yoNode && <option value={yoNode.id}>Vos (Yo)</option>}
                  {treeData.filter(n => n.role !== 'Yo').map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.role})</option>
                  ))}
                </select>
              </div>

              <div className="ft-add-field">
                <label>¿Qué relación es? *</label>
                <select value={newRelacion} onChange={e => { setNewRelacion(e.target.value); setNewAscendenciaId(''); }}>
                  <option value="">— Elegir —</option>
                  <optgroup label="Ascendencia">
                    <option value="madre">Madre</option>
                    <option value="padre">Padre</option>
                    <option value="abuelo">Abuelo</option>
                    <option value="abuela">Abuela</option>
                  </optgroup>
                  <optgroup label="Directos">
                    <option value="hermano">Hermano</option>
                    <option value="hermana">Hermana</option>
                    <option value="pareja">Pareja / Esposo/a</option>
                  </optgroup>
                  <optgroup label="Descendencia">
                    <option value="hijo">Hijo</option>
                    <option value="hija">Hija</option>
                    <option value="nieto">Nieto</option>
                    <option value="nieta">Nieta</option>
                  </optgroup>
                </select>
              </div>

              {(newRelacion === 'hijo' || newRelacion === 'hija') && anchorNode && (
                <div className="ft-add-field">
                  <label>¿{anchorNode.name} es la madre o el padre de este/a {newRelacion === 'hijo' ? 'hijo' : 'hija'}?</label>
                  <select value={newRolPropio} onChange={e => setNewRolPropio(e.target.value as 'madre' | 'padre')}>
                    <option value="madre">Es la madre</option>
                    <option value="padre">Es el padre</option>
                  </select>
                </div>
              )}

              {(newRelacion === 'abuelo' || newRelacion === 'abuela') && anchorNode && (
                <>
                  {anchorNode.motherId && anchorNode.fatherId && (
                    <div className="ft-add-field">
                      <label>¿De qué lado?</label>
                      <select value={newAscendenciaId} onChange={e => setNewAscendenciaId(e.target.value)}>
                        <option value="">— Elegir —</option>
                        <option value={anchorNode.motherId}>Del lado de {members.find(m => m.id === anchorNode.motherId)?.firstName} (su madre)</option>
                        <option value={anchorNode.fatherId}>Del lado de {members.find(m => m.id === anchorNode.fatherId)?.firstName} (su padre)</option>
                      </select>
                    </div>
                  )}
                  <div className="ft-add-field">
                    <label>¿Es la madre o el padre de {members.find(m => m.id === (newAscendenciaId || anchorNode.fatherId || anchorNode.motherId))?.firstName || 'esa persona'}?</label>
                    <select value={newRolPropio} onChange={e => setNewRolPropio(e.target.value as 'madre' | 'padre')}>
                      <option value="madre">Es la madre</option>
                      <option value="padre">Es el padre</option>
                    </select>
                  </div>
                </>
              )}

              {newRelacion === 'pareja' && hijosDeAnchor.length > 0 && (
                <div className="ft-checklist-wrap">
                  <label>¿Es también madre/padre de alguno de estos hijos? {!newGender && '(elegí primero el Género arriba)'}</label>
                  {hijosDeAnchor.map(h => {
                    const slot = newGender === 'female' ? 'motherId' : newGender === 'male' ? 'fatherId' : null;
                    const actualId = slot === 'motherId' ? h.motherId : slot === 'fatherId' ? h.fatherId : null;
                    const otroYaAsignado = actualId ? treeData.find(n => n.id === actualId) : null;
                    return (
                      <label key={h.id} className="ft-add-check">
                        <input
                          type="checkbox"
                          disabled={!newGender}
                          checked={newHijosCompartidos.includes(h.id)}
                          onChange={e => {
                            setNewHijosCompartidos(prev =>
                              e.target.checked ? [...prev, h.id] : prev.filter(id => id !== h.id)
                            );
                          }}
                        />
                        {h.name}
                        {otroYaAsignado && <span className="ft-add-check__pista"> — ya tiene a {otroYaAsignado.name} como {slot === 'motherId' ? 'madre' : 'padre'}</span>}
                      </label>
                    );
                  })}
                </div>
              )}

              {(newRelacion === 'madre' || newRelacion === 'padre') && anchorNode && hermanosDeNewAnchor.length > 0 && (
                <div className="ft-checklist-wrap">
                  <label>¿Es también {newRelacion} de alguno de estos hermanos de {anchorNode.name}?</label>
                  {hermanosDeNewAnchor.map(h => {
                    const actualId = newRelacion === 'madre' ? h.motherId : h.fatherId;
                    const otroYaAsignado = actualId ? treeData.find(n => n.id === actualId) : null;
                    return (
                      <label key={h.id} className="ft-add-check">
                        <input
                          type="checkbox"
                          checked={newHermanosCompartidos.includes(h.id)}
                          onChange={e => {
                            setNewHermanosCompartidos(prev =>
                              e.target.checked ? [...prev, h.id] : prev.filter(id => id !== h.id)
                            );
                          }}
                        />
                        {h.name}
                        {otroYaAsignado && <span className="ft-add-check__pista"> — ya tiene a {otroYaAsignado.name} como {newRelacion}</span>}
                      </label>
                    );
                  })}
                </div>
              )}

              {(newRelacion === 'nieto' || newRelacion === 'nieta') && hijosDeAnchor.length > 0 && anchorNode && (
                <>
                  {hijosDeAnchor.length > 1 && (
                    <div className="ft-add-field">
                      <label>¿Hijo/a de cuál de los hijos de {anchorNode.name}?</label>
                      <select value={newAscendenciaId} onChange={e => setNewAscendenciaId(e.target.value)}>
                        <option value="">— Elegir —</option>
                        {hijosDeAnchor.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="ft-add-field">
                    <label>¿{hijosDeAnchor.length === 1 ? hijosDeAnchor[0].name : 'Esa persona'} es la madre o el padre de este/a nieto/a?</label>
                    <select value={newRolPropio} onChange={e => setNewRolPropio(e.target.value as 'madre' | 'padre')}>
                      <option value="madre">Es la madre</option>
                      <option value="padre">Es el padre</option>
                    </select>
                  </div>
                </>
              )}

              <p className="ft-add-panel__hint" style={{ fontSize: '0.72rem', color: '#8A8279', margin: '-8px 0 4px' }}>
                El género se completa solo según la relación que elegiste (podés cambiarlo en "Género" si hace falta). El rol ("Cuñado", "Suegra", etc.) todavía no se calcula solo para vínculos indirectos — por ahora va a aparecer como "Familiar" hasta que sumemos ese cálculo.
              </p>
              <div className="ft-add-panel__btns">
                <button className="ft-add-panel__cancel" onClick={cerrarAddPanel}>Cancelar</button>
                <button className="ft-add-panel__submit" onClick={addPerson}><TreePine size={16} strokeWidth={1.8} />Plantar rama</button>
              </div>
            </div>
          </div>
        </>
      )}

      {confirmandoVaciarArbol && (
        <ConfirmModal
          titulo="Vaciar todo el árbol"
          mensaje={`Esto va a eliminar a las personas que cargaste a mano en tu árbol. No se puede deshacer. Las personas vinculadas a una cuenta real (vos incluido) no se tocan — para desvincular a alguien puntual, usá "Desvincular" en su propio perfil.`}
          textoConfirmar={vaciandoArbol ? 'Vaciando...' : 'Sí, vaciar todo'}
          peligroso
          onConfirm={async () => {
            setVaciandoArbol(true);
            try {
              const res: any = await familyService.deleteTree();
              await cargarArbol();
              setConfirmandoVaciarArbol(false);
              showToast(`✓ Se eliminaron ${res.data.eliminados} personas del árbol`);
            } catch (err: any) {
              showToast(`⚠️ ${err.message || 'Error al vaciar el árbol'}`);
            } finally {
              setVaciandoArbol(false);
            }
          }}
          onCancel={() => setConfirmandoVaciarArbol(false)}
        />
      )}

      {confirmandoEliminar && modalNode && (
        <ConfirmModal
          titulo="Eliminar del árbol"
          mensaje={(() => {
            const hijosDelEliminado = treeData.filter(n => n.motherId === modalNode.id || n.fatherId === modalNode.id);
            const base = `¿Eliminar a ${modalNode.name} del árbol? Esta acción no se puede deshacer.`;
            if (hijosDelEliminado.length === 0) return base;
            return `${base} ${modalNode.name} tiene ${hijosDelEliminado.length} hijo${hijosDelEliminado.length === 1 ? '' : 's'} en el árbol (${hijosDelEliminado.map(h => h.name).join(', ')}) — van a quedar sin ese vínculo, y tendrías que reconectarlos a mano si volvés a agregar a esta persona.`;
          })()}
          textoConfirmar={eliminando ? 'Eliminando...' : 'Sí, eliminar'}
          peligroso
          onConfirm={async () => {
            if (!modalNode) return;
            setEliminando(true);
            try {
              await familyService.deleteMember(modalNode.id);
              await cargarArbol();
              setConfirmandoEliminar(false);
              closeModal();
              showToast('✓ Persona eliminada del árbol');
            } catch (err: any) {
              showToast(`⚠️ ${err.message || 'Error al eliminar'}`);
            } finally {
              setEliminando(false);
            }
          }}
          onCancel={() => setConfirmandoEliminar(false)}
        />
      )}

      {verFotoGrande && modalNode?.img && (
        <div className="ft-foto-grande-overlay" onClick={() => setVerFotoGrande(false)}>
          <button className="ft-foto-grande-cerrar" onClick={() => setVerFotoGrande(false)}><X size={20} strokeWidth={2} /></button>
          <img src={modalNode.img} alt={modalNode.name} onClick={e => e.stopPropagation()} />
        </div>
      )}

      {detalleAbierto && detallePropuesta && (
        <div className="ft-modal-overlay" onClick={e => { if (e.target === e.currentTarget) cerrarDetalle(); }}>
          <div className="ft-detalle-modal">
            <button className="ft-detalle-modal__cerrar" onClick={cerrarDetalle}><X size={18} strokeWidth={1.8} /></button>

            <div className="ft-detalle-modal__header">
              {detallePropuesta.owner.avatarUrl
                ? <img src={detallePropuesta.owner.avatarUrl} alt={detallePropuesta.owner.firstName} />
                : <div className="ft-detalle-modal__avatar-vacio">{detallePropuesta.owner.firstName[0]}</div>
              }
              <div>
                <strong>{detallePropuesta.owner.firstName} {detallePropuesta.owner.lastName}</strong>
                <p>te agregó a su árbol genealógico como <b>"{detallePropuesta.firstName} {detallePropuesta.lastName || ''}"</b></p>
              </div>
            </div>

            {!detalleAceptada ? (
              <div className="ft-detalle-modal__acciones">
                <button className="ft-detalle-modal__rechazar" disabled={detalleEnviando} onClick={rechazarDetalle}>
                  Rechazar
                </button>
                <button className="ft-detalle-modal__aceptar" disabled={detalleEnviando} onClick={aceptarDetalle}>
                  {detalleEnviando ? 'Aceptando...' : 'Aceptar etiqueta'}
                </button>
              </div>
            ) : (
              <div className="ft-detalle-modal__copiar">
                <p className="ft-detalle-modal__copiar-texto">
                  ✓ Etiqueta aceptada. ¿Querés copiar el árbol de {detallePropuesta.owner.firstName} al tuyo?
                </p>
                {detalleCargandoPreview && <p className="ft-detalle-modal__copiar-vacio">Revisando su árbol...</p>}
                {!detalleCargandoPreview && detalleCopyPreview && detalleCopyPreview.total === 0 && (
                  <p className="ft-detalle-modal__copiar-vacio">Ya tenés todo lo de su árbol copiado — no hay nada nuevo para traer.</p>
                )}
                {!detalleCargandoPreview && detalleCopyPreview && detalleCopyPreview.total > 0 && (
                  <>
                    {detalleCopyPreview.fusionesPosibles.length > 0 && (
                      <div className="ft-modal__fusiones">
                        <span className="ft-modal__fusiones-titulo">Encontramos personas que ya tenías cargadas — ¿son la misma?</span>
                        {detalleCopyPreview.fusionesPosibles.map((f: any) => (
                          <label key={f.sourceId} className="ft-add-check">
                            <input
                              type="checkbox"
                              checked={detalleFusionesElegidas.has(f.sourceId)}
                              onChange={e => {
                                setDetalleFusionesElegidas(prev => {
                                  const s = new Set(prev);
                                  e.target.checked ? s.add(f.sourceId) : s.delete(f.sourceId);
                                  return s;
                                });
                              }}
                            />
                            {f.sourceName} = {f.existingName} (tu {f.slot})
                          </label>
                        ))}
                      </div>
                    )}
                    <p className="ft-detalle-modal__copiar-conteo">
                      {detalleCopyPreview.primeraVez
                        ? `Se van a sumar ${detalleCopyPreview.total} persona${detalleCopyPreview.total === 1 ? '' : 's'} de su árbol al tuyo.`
                        : `Hay ${detalleCopyPreview.total} persona${detalleCopyPreview.total === 1 ? '' : 's'} nueva${detalleCopyPreview.total === 1 ? '' : 's'} desde la última vez.`}
                    </p>
                    <button className="ft-detalle-modal__copiar-btn" disabled={detalleCopiando} onClick={copiarArbolDesdeDetalle}>
                      {detalleCopiando ? 'Copiando...' : 'Copiar árbol'}
                    </button>
                  </>
                )}
                <button className="ft-detalle-modal__cerrar-simple" onClick={cerrarDetalle}>Listo, cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div className="ft-toast">{toast}</div>}
    </div>
  );
}