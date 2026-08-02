// ============================================================
// LIFE'S — AdminEmpresa.tsx | Panel Admin Empresarial
// Dashboard oscuro estilo cockpit
// Lucide React | SCSS | Sin navbar externa
// ============================================================
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Edit2, GitBranch, Package,
  Users, BarChart3, CreditCard, Shield, Bell,
  Eye, LogOut, TrendingUp, HardDrive, AlertTriangle,
  Check, ChevronRight, Plus, Search,
  Clock, Star, Activity, ExternalLink, X,
  FileText, Lock, Unlock, Crown, Image, Upload,
  Globe, MapPin, Phone, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import './AdminEmpresa.scss';

// ── Tipos ──────────────────────────────────────────────────
type Modulo =
  | 'dashboard' | 'perfil' | 'hitos' | 'arbol'
  | 'productos' | 'multimedia' | 'equipo'
  | 'estadisticas' | 'plan' | 'seguridad';

interface NavItem {
  id: Modulo;
  label: string;
  icono: React.ReactNode;
  badge?: number;
  grupo: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',         icono: <LayoutDashboard size={17} strokeWidth={1.8} />, grupo: 'principal' },
  { id: 'perfil',       label: 'Perfil público',    icono: <Edit2           size={17} strokeWidth={1.8} />, grupo: 'principal' },
  { id: 'hitos',        label: 'Hitos e historia',  icono: <Activity        size={17} strokeWidth={1.8} />, badge: 3, grupo: 'contenido' },
  { id: 'arbol',        label: 'Árbol liderazgo',   icono: <GitBranch       size={17} strokeWidth={1.8} />, grupo: 'contenido' },
  { id: 'productos',    label: 'Productos',          icono: <Package         size={17} strokeWidth={1.8} />, grupo: 'contenido' },
  { id: 'multimedia',   label: 'Multimedia',         icono: <HardDrive       size={17} strokeWidth={1.8} />, grupo: 'contenido' },
  { id: 'equipo',       label: 'Equipo y roles',     icono: <Users           size={17} strokeWidth={1.8} />, grupo: 'gestion' },
  { id: 'estadisticas', label: 'Estadísticas',       icono: <BarChart3       size={17} strokeWidth={1.8} />, grupo: 'gestion' },
  { id: 'plan',         label: 'Plan y facturación', icono: <CreditCard      size={17} strokeWidth={1.8} />, grupo: 'gestion' },
  { id: 'seguridad',    label: 'Seguridad',          icono: <Shield          size={17} strokeWidth={1.8} />, grupo: 'gestion' },
];

const ACTIVIDAD = [
  { avatar: 'https://i.pravatar.cc/32?img=44', nombre: 'Ana G.',    accion: 'publicó nuevo hito histórico',    tiempo: 'Hace 12 min', color: '#86efac' },
  { avatar: 'https://i.pravatar.cc/32?img=33', nombre: 'Carlos M.', accion: 'editó el árbol de liderazgo',     tiempo: 'Hace 1 hora', color: '#ffe088' },
  { avatar: 'https://i.pravatar.cc/32?img=50', nombre: 'Daniel T.', accion: 'subió 3 fotos a multimedia',      tiempo: 'Hace 3 hs',   color: '#58a6ff' },
  { avatar: 'https://i.pravatar.cc/32?img=25', nombre: 'María R.',  accion: 'invitó a nuevo usuario al equipo', tiempo: 'Ayer 14:20', color: '#C9932A' },
  { avatar: 'https://i.pravatar.cc/32?img=55', nombre: 'Roberto S.',accion: 'activó 2FA en su cuenta',          tiempo: 'Ayer 11:05', color: '#86efac' },
];

const BARRAS = [
  { dia: 'Lun', pct: 45, val: 483  },
  { dia: 'Mar', pct: 62, val: 667  },
  { dia: 'Mié', pct: 38, val: 408  },
  { dia: 'Jue', pct: 78, val: 840  },
  { dia: 'Vie', pct: 95, val: 1024 },
  { dia: 'Sáb', pct: 55, val: 592  },
  { dia: 'Dom', pct: 40, val: 430  },
];

interface MiembroEquipo {
  id: string;
  nombre: string;
  email: string;
  cargo: string;
  rol: 'Admin' | 'Editor' | 'Viewer';
  avatar: string;
  activo: boolean;
  fa2: boolean;
  desde: string;
}

const EQUIPO_INIT: MiembroEquipo[] = [
  { id:'1', nombre:'Daniel Tillard',  email:'d.tillard@bna.com.ar',  cargo:'Presidente',       rol:'Admin',  avatar:'https://i.pravatar.cc/32?img=50', activo:true,  fa2:true,  desde:'Mar 2020' },
  { id:'2', nombre:'María Rodríguez', email:'m.rodriguez@bna.com.ar', cargo:'Vicepresidenta',   rol:'Admin',  avatar:'https://i.pravatar.cc/32?img=25', activo:true,  fa2:true,  desde:'Jun 2021' },
  { id:'3', nombre:'Carlos Martínez', email:'c.martinez@bna.com.ar',  cargo:'Dir. Operaciones', rol:'Editor', avatar:'https://i.pravatar.cc/32?img=33', activo:true,  fa2:false, desde:'Ene 2019' },
  { id:'4', nombre:'Ana Gutiérrez',   email:'a.gutierrez@bna.com.ar', cargo:'Dir. Digital',     rol:'Editor', avatar:'https://i.pravatar.cc/32?img=44', activo:true,  fa2:true,  desde:'Feb 2022' },
  { id:'5', nombre:'Roberto Sánchez', email:'r.sanchez@bna.com.ar',   cargo:'Dir. Riesgo',      rol:'Viewer', avatar:'https://i.pravatar.cc/32?img=55', activo:false, fa2:false, desde:'Nov 2018' },
];

interface HitoAdmin {
  id: string;
  año: number;
  mes: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: 'publicado' | 'borrador' | 'incompleto';
  imagen: boolean;
  destacado: boolean;
}

const HITOS_INIT: HitoAdmin[] = [
  { id:'1', año:2024, mes:'Junio',    titulo:'Sucursal número 700',        descripcion:'Apertura de la sucursal 700 en Argentina, consolidando el liderazgo federal.', categoria:'Expansión',   estado:'publicado',  imagen:true,  destacado:true  },
  { id:'2', año:2021, mes:'Marzo',    titulo:'Cuenta DNI gratuita',         descripcion:'Inclusión financiera masiva: cuenta bancaria gratuita para todos los argentinos.', categoria:'Producto',    estado:'publicado',  imagen:true,  destacado:true  },
  { id:'3', año:2020, mes:'Octubre',  titulo:'Lanzamiento BNA+',            descripcion:'App móvil supermoderna con más de 2 millones de usuarios en el primer año.',      categoria:'Digital',     estado:'publicado',  imagen:true,  destacado:true  },
  { id:'4', año:2016, mes:'Abril',    titulo:'Crédito Hipotecario UVA',     descripcion:'',                                                                                 categoria:'Producto',    estado:'incompleto', imagen:false, destacado:false },
  { id:'5', año:2010, mes:'Agosto',   titulo:'Premio al banco más federal',  descripcion:'',                                                                                 categoria:'Premio',      estado:'incompleto', imagen:false, destacado:false },
];




interface NodoLiderazgo {
  id: string;
  nombre: string;
  cargo: string;
  desde: string;
  hasta: string;
  foto: string;
  bio: string;
  era: number;
  parentId: string | null;
  esActual: boolean;
}

const ARBOL_MOCK: NodoLiderazgo[] = [
  { id:'1', nombre:'Carlos Pellegrini',  cargo:'Fundador / Presidente',       desde:'1891', hasta:'1895', foto:'https://i.pravatar.cc/60?img=70', bio:'Presidente de la Nación Argentina y creador del Banco Nación.', era:0, parentId:null,  esActual:false },
  { id:'2', nombre:'Vicente F. López',   cargo:'1er Presidente Directorio',   desde:'1891', hasta:'1894', foto:'https://i.pravatar.cc/60?img=65', bio:'Historiador y economista. Sentó las bases operativas iniciales.', era:1, parentId:'1', esActual:false },
  { id:'3', nombre:'Enrique García',     cargo:'Presidente del Directorio',   desde:'1944', hasta:'1955', foto:'https://i.pravatar.cc/60?img=60', bio:'Llevó al banco a su primera gran expansión nacional.', era:2, parentId:'2', esActual:false },
  { id:'4', nombre:'Roberto Lavagna',    cargo:'Presidente Ejecutivo',        desde:'1995', hasta:'2000', foto:'https://i.pravatar.cc/60?img=55', bio:'Modernizó el banco durante la era de convertibilidad.', era:2, parentId:'3', esActual:false },
  { id:'5', nombre:'Daniel Tillard',     cargo:'Presidente del Directorio',   desde:'2020', hasta:'Actualidad', foto:'https://i.pravatar.cc/60?img=50', bio:'Líder de la transformación digital con BNA+ y Cuenta DNI.', era:3, parentId:'4', esActual:true },
  { id:'6', nombre:'María Rodríguez',    cargo:'Vicepresidenta',              desde:'2021', hasta:'Actualidad', foto:'https://i.pravatar.cc/60?img=25', bio:'Especialista en derecho bancario y cumplimiento normativo.', era:4, parentId:'5', esActual:true },
  { id:'7', nombre:'Ana Gutiérrez',      cargo:'Directora Digital',           desde:'2022', hasta:'Actualidad', foto:'https://i.pravatar.cc/60?img=44', bio:'Ingeniera en sistemas. Lidera la transformación digital.', era:4, parentId:'5', esActual:true },
  { id:'8', nombre:'Carlos Martínez',    cargo:'Director de Operaciones',     desde:'2019', hasta:'Actualidad', foto:'https://i.pravatar.cc/60?img=33', bio:'Supervisa las operaciones de las 700 sucursales del país.', era:4, parentId:'5', esActual:true },
];

const ERA_LABELS = ['Fundadores','Primera dirección','Era moderna','Liderazgo actual','Equipo directivo'];
const ERA_COLORS = ['#C9932A','#855324','#3a5a8a','#4a7a4e','#58a6ff'];

const MULTIMEDIA_MOCK = [
  { id:'1', tipo:'imagen', nombre:'Portada institucional 2024', fecha:'12 Jul 2026', tamaño:'2.4 MB', url:'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80', categoria:'Portada' },
  { id:'2', tipo:'imagen', nombre:'Sede central Buenos Aires',  fecha:'08 Jul 2026', tamaño:'1.8 MB', url:'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&q=80', categoria:'Instalaciones' },
  { id:'3', tipo:'imagen', nombre:'Lanzamiento BNA+ 2020',      fecha:'05 Jul 2026', tamaño:'3.1 MB', url:'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80', categoria:'Productos' },
  { id:'4', tipo:'imagen', nombre:'Equipo directivo 2024',      fecha:'01 Jul 2026', tamaño:'1.2 MB', url:'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80', categoria:'Equipo' },
  { id:'5', tipo:'imagen', nombre:'Sucursal número 700',        fecha:'28 Jun 2026', tamaño:'2.7 MB', url:'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&q=80', categoria:'Instalaciones' },
  { id:'6', tipo:'video',  nombre:'Video institucional 2024',   fecha:'20 Jun 2026', tamaño:'45 MB',  url:'', categoria:'Institucional' },
  { id:'7', tipo:'imagen', nombre:'Historia fundación 1891',    fecha:'15 Jun 2026', tamaño:'0.9 MB', url:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', categoria:'Historia' },
  { id:'8', tipo:'imagen', nombre:'Logo oficial actualizado',   fecha:'10 Jun 2026', tamaño:'0.3 MB', url:'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80', categoria:'Identidad' },
];

const VISITAS_DIARIAS = [
  {dia:'01', pct:45, val:412}, {dia:'02', pct:38, val:348}, {dia:'03', pct:62, val:567},
  {dia:'04', pct:55, val:503}, {dia:'05', pct:78, val:714}, {dia:'06', pct:92, val:841},
  {dia:'07', pct:48, val:439}, {dia:'08', pct:35, val:320}, {dia:'09', pct:67, val:612},
  {dia:'10', pct:82, val:749}, {dia:'11', pct:95, val:868}, {dia:'12', pct:71, val:649},
  {dia:'13', pct:58, val:530}, {dia:'14', pct:43, val:393},
];

const PRODUCTOS_MOCK = [
  { id: '1', nombre: 'Crédito Hipotecario UVA', año: 2016, categoria: 'Créditos',   activo: true,  desc: 'Préstamos para vivienda ajustados por UVA con tasas accesibles.', imagen: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300&q=80' },
  { id: '2', nombre: 'BNA+',                    año: 2020, categoria: 'Digital',    activo: true,  desc: 'Aplicación móvil para gestionar todos tus productos bancarios.',   imagen: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&q=80' },
  { id: '3', nombre: 'Cuenta DNI',              año: 2021, categoria: 'Cuentas',    activo: true,  desc: 'Cuenta gratuita con solo el DNI, sin requisitos adicionales.',     imagen: '' },
  { id: '4', nombre: 'Crédito PYME',            año: 2018, categoria: 'Créditos',   activo: true,  desc: 'Financiamiento para pequeñas y medianas empresas argentinas.',     imagen: '' },
  { id: '5', nombre: 'Caja de Ahorro Plus',     año: 1995, categoria: 'Cuentas',    activo: false, desc: 'Cuenta de ahorro con beneficios exclusivos para clientes.',         imagen: '' },
];

export default function AdminEmpresa() {
  const navigate = useNavigate();
  const [modulo, setModulo] = useState<Modulo>('dashboard');
  const [toast,  setToast]  = useState('');
  const [statsPeriodo, setStatsPeriodo] = useState('30D');

  // ── Estado Multimedia ──
  const [mediaItems,   setMediaItems]   = useState(MULTIMEDIA_MOCK);
  const [mediaFiltro,  setMediaFiltro]  = useState('Todos');
  const [mediaVista,   setMediaVista]   = useState<'grilla'|'lista'>('grilla');
  const [mediaSelec,   setMediaSelec]   = useState<string[]>([]);
  const [modalMedia,   setModalMedia]   = useState<typeof MULTIMEDIA_MOCK[0] | null>(null);
  const fileInputRef   = useRef<HTMLInputElement>(null);

  // ── Estado Equipo ──
  const [equipo,        setEquipo]        = useState<MiembroEquipo[]>(EQUIPO_INIT);
  const [modalEquipo,   setModalEquipo]   = useState(false);
  const [miembroEdit,   setMiembroEdit]   = useState<MiembroEquipo | null>(null);
  const [eNombre,       setENombre]       = useState('');
  const [eEmail,        setEEmail]        = useState('');
  const [eCargo,        setECargo]        = useState('');
  const [eRol,          setERol]          = useState<'Admin'|'Editor'|'Viewer'>('Viewer');
  const [eActivo,       setEActivo]       = useState(true);

  // ── Estado Hitos ──
  const [hitos,        setHitos]        = useState<HitoAdmin[]>(HITOS_INIT);
  const [modalHito,    setModalHito]    = useState(false);
  const [hitoEditando, setHitoEditando] = useState<HitoAdmin | null>(null);
  const [hAño,         setHAño]         = useState('');
  const [hMes,         setHMes]         = useState('');
  const [hTitulo,      setHTitulo]      = useState('');
  const [hDesc,        setHDesc]        = useState('');
  const [hCat,         setHCat]         = useState('');
  const [hDestacado,   setHDestacado]   = useState(false);
  const [hEstado,      setHEstado]      = useState<'publicado'|'borrador'|'incompleto'>('borrador');

  // ── Estado Árbol ──
  const [nodos,        setNodos]        = useState<NodoLiderazgo[]>(ARBOL_MOCK);
  const [nodoSelec,    setNodoSelec]    = useState<NodoLiderazgo | null>(null);
  const [modalNodo,    setModalNodo]    = useState(false);
  const [nodoEditando, setNodoEditando] = useState<NodoLiderazgo | null>(null);
  const [nNombre,      setNNombre]      = useState('');
  const [nCargo,       setNCargo]       = useState('');
  const [nDesde,       setNDesde]       = useState('');
  const [nHasta,       setNHasta]       = useState('');
  const [nBio,         setNBio]         = useState('');
  const [nEra,         setNEra]         = useState(4);
  const [nParent,      setNParent]      = useState('5');
  const [nActual,      setNActual]      = useState(false);
  const fileInputPerfil = useRef<HTMLInputElement>(null);


  // ── Estado Perfil ──
  const [pNombre,      setPNombre]      = useState('Banco Nación Argentina');
  const [pSlogan,      setPSlogan]      = useState('El banco de todos los argentinos');
  const [pDesc,        setPDesc]        = useState('El Banco de la Nación Argentina es la institución financiera más grande del país. Fundado en 1891 por ley del Congreso Nacional.');
  const [pMision,      setPMision]      = useState('Ser el banco del desarrollo nacional, apoyando la producción, el comercio, la industria y las familias argentinas.');
  const [pWeb,         setPWeb]         = useState('www.bna.com.ar');
  const [pEmail,       setPEmail]       = useState('contacto@bna.com.ar');
  const [pInstagram,   setPInstagram]   = useState('@banconacion');
  const [pLinkedin,    setPLinkedin]    = useState('banco-nacion-argentina');
  const [perfilGuardado, setPerfilGuardado] = useState(false);

  // ── Estado Productos ──
  const [productos,    setProductos]    = useState(PRODUCTOS_MOCK);
  const [modalProd,    setModalProd]    = useState(false);
  const [prodEditando, setProdEditando] = useState<typeof PRODUCTOS_MOCK[0] | null>(null);
  const [pProdNombre,  setPProdNombre]  = useState('');
  const [pProdAño,     setPProdAño]     = useState('');
  const [pProdCat,     setPProdCat]     = useState('');
  const [pProdDesc,    setPProdDesc]    = useState('');
  const [pProdActivo,  setPProdActivo]  = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };


  const abrirModalEquipo = (miembro?: MiembroEquipo) => {
    if (miembro) {
      setMiembroEdit(miembro);
      setENombre(miembro.nombre); setEEmail(miembro.email);
      setECargo(miembro.cargo);   setERol(miembro.rol);
      setEActivo(miembro.activo);
    } else {
      setMiembroEdit(null);
      setENombre(''); setEEmail(''); setECargo('');
      setERol('Viewer'); setEActivo(true);
    }
    setModalEquipo(true);
  };

  const guardarMiembro = () => {
    if (!eNombre.trim() || !eEmail.trim()) { showToast('⚠️ Nombre y email son obligatorios'); return; }
    if (miembroEdit) {
      setEquipo(prev => prev.map(m => m.id === miembroEdit.id
        ? { ...m, nombre:eNombre, email:eEmail, cargo:eCargo, rol:eRol, activo:eActivo }
        : m
      ));
      showToast('✓ Usuario actualizado');
    } else {
      setEquipo(prev => [...prev, {
        id: Date.now().toString(), nombre:eNombre, email:eEmail,
        cargo:eCargo, rol:eRol, activo:eActivo, fa2:false,
        avatar:`https://i.pravatar.cc/32?img=${Math.floor(Math.random()*70)+1}`,
        desde: new Date().toLocaleDateString('es-AR',{month:'short',year:'numeric'}),
      }]);
      showToast('✓ Invitación enviada a ' + eEmail);
    }
    setModalEquipo(false);
  };

  const eliminarMiembro = (id: string) => {
    setEquipo(prev => prev.filter(m => m.id !== id));
    showToast('✓ Usuario eliminado del equipo');
  };

  const toggleFA2 = (id: string) => {
    setEquipo(prev => prev.map(m => m.id === id ? { ...m, fa2: !m.fa2 } : m));
    showToast('✓ 2FA actualizado');
  };

  const toggleActivo2 = (id: string) => {
    setEquipo(prev => prev.map(m => m.id === id ? { ...m, activo: !m.activo } : m));
    showToast('✓ Estado actualizado');
  };

  const abrirModalHito = (hito?: HitoAdmin) => {
    if (hito) {
      setHitoEditando(hito);
      setHAño(hito.año.toString()); setHMes(hito.mes);
      setHTitulo(hito.titulo); setHDesc(hito.descripcion);
      setHCat(hito.categoria); setHDestacado(hito.destacado);
      setHEstado(hito.estado);
    } else {
      setHitoEditando(null);
      setHAño(''); setHMes(''); setHTitulo(''); setHDesc('');
      setHCat(''); setHDestacado(false); setHEstado('borrador');
    }
    setModalHito(true);
  };

  const guardarHito = () => {
    if (!hTitulo.trim() || !hAño) { showToast('⚠️ Año y título son obligatorios'); return; }
    if (hitoEditando) {
      setHitos(prev => prev.map(h => h.id === hitoEditando.id
        ? { ...h, año:parseInt(hAño), mes:hMes, titulo:hTitulo, descripcion:hDesc, categoria:hCat, destacado:hDestacado, estado:hEstado,
            imagen: h.imagen }
        : h
      ).sort((a,b) => b.año - a.año));
      showToast('✓ Hito actualizado');
    } else {
      const nuevo: HitoAdmin = {
        id: Date.now().toString(), año:parseInt(hAño), mes:hMes,
        titulo:hTitulo, descripcion:hDesc, categoria:hCat||'Otro',
        estado:hEstado, imagen:false, destacado:hDestacado,
      };
      setHitos(prev => [...prev, nuevo].sort((a,b) => b.año - a.año));
      showToast('✓ Hito agregado a la historia');
    }
    setModalHito(false);
  };

  const eliminarHito = (id: string) => {
    setHitos(prev => prev.filter(h => h.id !== id));
    showToast('✓ Hito eliminado');
  };

  const abrirModalNodo = (nodo?: NodoLiderazgo) => {
    if (nodo) {
      setNodoEditando(nodo);
      setNNombre(nodo.nombre); setNCargo(nodo.cargo);
      setNDesde(nodo.desde);   setNHasta(nodo.hasta === 'Actualidad' ? '' : nodo.hasta);
      setNBio(nodo.bio);       setNEra(nodo.era);
      setNParent(nodo.parentId || ''); setNActual(nodo.esActual);
    } else {
      setNodoEditando(null);
      setNNombre(''); setNCargo(''); setNDesde(''); setNHasta('');
      setNBio(''); setNEra(4); setNParent('5'); setNActual(false);
    }
    setModalNodo(true);
  };

  const guardarNodo = () => {
    if (!nNombre.trim() || !nCargo.trim()) { showToast('⚠️ Nombre y cargo son obligatorios'); return; }
    if (nodoEditando) {
      setNodos(prev => prev.map(n => n.id === nodoEditando.id
        ? { ...n, nombre:nNombre, cargo:nCargo, desde:nDesde, hasta:nActual?'Actualidad':nHasta, bio:nBio, era:nEra, parentId:nParent||null, esActual:nActual }
        : n
      ));
      showToast('✓ Directivo actualizado');
    } else {
      setNodos(prev => [...prev, {
        id: Date.now().toString(), nombre:nNombre, cargo:nCargo,
        desde:nDesde||'2024', hasta:nActual?'Actualidad':(nHasta||'2024'),
        foto:`https://i.pravatar.cc/60?img=${Math.floor(Math.random()*70)+1}`,
        bio:nBio, era:nEra, parentId:nParent||null, esActual:nActual,
      }]);
      showToast('✓ Directivo agregado al árbol');
    }
    setModalNodo(false);
  };

  const eliminarNodo = (id: string) => {
    setNodos(prev => prev.filter(n => n.id !== id));
    setNodoSelec(null);
    showToast('✓ Nodo eliminado');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const nuevos = Array.from(files).map((file, i) => ({
      id: Date.now().toString() + i,
      tipo: file.type.startsWith('video') ? 'video' : 'imagen',
      nombre: file.name.replace(/\.[^/.]+$/, ''),
      fecha: new Date().toLocaleDateString('es-AR', { day:'2-digit', month:'short', year:'numeric' }),
      tamaño: file.size > 1024*1024 ? `${(file.size/1024/1024).toFixed(1)} MB` : `${(file.size/1024).toFixed(0)} KB`,
      url: URL.createObjectURL(file),
      categoria: 'Sin categoría',
    }));
    setMediaItems(prev => [...nuevos, ...prev]);
    showToast(`✓ ${files.length} archivo${files.length > 1 ? 's' : ''} subido${files.length > 1 ? 's' : ''}`);
    e.target.value = '';
  };

  const abrirModalProd = (prod?: typeof PRODUCTOS_MOCK[0]) => {
    if (prod) {
      setProdEditando(prod);
      setPProdNombre(prod.nombre);
      setPProdAño(prod.año.toString());
      setPProdCat(prod.categoria);
      setPProdDesc(prod.desc);
      setPProdActivo(prod.activo);
    } else {
      setProdEditando(null);
      setPProdNombre(''); setPProdAño(''); setPProdCat(''); setPProdDesc(''); setPProdActivo(true);
    }
    setModalProd(true);
  };

  const guardarProducto = () => {
    if (!pProdNombre.trim()) { showToast('⚠️ El nombre es obligatorio'); return; }
    if (prodEditando) {
      setProductos(prev => prev.map(p => p.id === prodEditando.id
        ? { ...p, nombre: pProdNombre, año: parseInt(pProdAño) || p.año, categoria: pProdCat, desc: pProdDesc, activo: pProdActivo }
        : p
      ));
      showToast('✓ Producto actualizado');
    } else {
      setProductos(prev => [...prev, {
        id: Date.now().toString(), nombre: pProdNombre,
        año: parseInt(pProdAño) || new Date().getFullYear(),
        categoria: pProdCat || 'General', desc: pProdDesc, activo: pProdActivo, imagen: '',
      }]);
      showToast('✓ Producto agregado');
    }
    setModalProd(false);
  };

  const toggleActivo = (id: string) => {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, activo: !p.activo } : p));
    showToast('✓ Estado actualizado');
  };

  const eliminarProducto = (id: string) => {
    setProductos(prev => prev.filter(p => p.id !== id));
    showToast('✓ Producto eliminado');
  };

  const guardarPerfil = () => {
    setPerfilGuardado(true);
    showToast('✓ Perfil actualizado correctamente');
    setTimeout(() => setPerfilGuardado(false), 3000);
  };

  const grupos = ['principal', 'contenido', 'gestion'];
  const grupoLabels: Record<string,string> = { principal:'Principal', contenido:'Contenido', gestion:'Gestión' };

  return (
    <div className="adm-root">

      {/* ════ SIDEBAR ════ */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar__logo">
          <div className="adm-sidebar__logo-avatar">
            <img src="https://i.pravatar.cc/40?img=70" alt="Empresa" />
          </div>
          <div className="adm-sidebar__logo-info">
            <span className="adm-sidebar__logo-lifes">Life's Empresas</span>
            <span className="adm-sidebar__logo-nombre">Banco Nación Arg.</span>
            <span className="adm-sidebar__logo-badge">
              <Check size={9} strokeWidth={3} /> Verificado · Professional
            </span>
          </div>
        </div>

        <nav className="adm-sidebar__nav">
          {grupos.map(g => (
            <div key={g} className="adm-sidebar__grupo">
              <span className="adm-sidebar__grupo-label">{grupoLabels[g]}</span>
              {NAV_ITEMS.filter(i => i.grupo === g).map(item => (
                <button
                  key={item.id}
                  className={`adm-sidebar__item${modulo === item.id ? ' active' : ''}`}
                  onClick={() => setModulo(item.id)}
                >
                  <span className="adm-sidebar__icon">{item.icono}</span>
                  <span className="adm-sidebar__label">{item.label}</span>
                  {item.badge && <span className="adm-sidebar__badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar__footer">
          <button className="adm-sidebar__footer-btn" onClick={() => navigate('/empresas/perfil')}>
            <Eye size={14} strokeWidth={1.8} /> Ver perfil público
          </button>
          <button className="adm-sidebar__footer-btn adm-sidebar__footer-btn--salir" onClick={() => navigate('/')}>
            <LogOut size={14} strokeWidth={1.8} /> Salir del panel
          </button>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <div className="adm-main">

        {/* TOPBAR */}
        <header className="adm-topbar">
          <div>
            <h1 className="adm-topbar__titulo">{NAV_ITEMS.find(i => i.id === modulo)?.label}</h1>
            <span className="adm-topbar__bread">Banco Nación Argentina · Panel Admin</span>
          </div>
          <div className="adm-topbar__right">
            <div className="adm-topbar__search"><Search size={13} strokeWidth={1.8} /> Buscar...</div>
            <div className="adm-topbar__notif">
              <Bell size={16} strokeWidth={1.8} />
              <span className="adm-topbar__notif-badge">3</span>
            </div>
            <div className="adm-topbar__perfil">
              <img src="https://i.pravatar.cc/32?img=50" alt="Admin" />
              <div>
                <span className="adm-topbar__perfil-nombre">Daniel Tillard</span>
                <span className="adm-topbar__perfil-rol">Administrador</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <div className="adm-contenido">

          {/* ── DASHBOARD ── */}
          {modulo === 'dashboard' && (
            <div className="adm-dashboard">

              {/* Alerta */}
              <div className="adm-alerta">
                <AlertTriangle size={16} strokeWidth={1.8} />
                <span>Tu plan <strong>Professional</strong> vence el <strong>15 de agosto de 2026</strong>.</span>
                <button onClick={() => setModulo('plan')}>Renovar →</button>
              </div>

              {/* KPIs */}
              <div className="adm-kpi-grid">
                {[
                  { icono: <Eye       size={18} strokeWidth={1.6}/>, val:'4.821', label:'Visitas este mes',  trend:'+18%',     up:true,  pct:74, color:'#C9932A' },
                  { icono: <Activity  size={18} strokeWidth={1.6}/>, val:'12',    label:'Hitos publicados',  trend:'+3 nuevos',up:true,  pct:60, color:'#4a7a4e' },
                  { icono: <Users     size={18} strokeWidth={1.6}/>, val:'8',     label:'Usuarios activos',  trend:'8/10',     up:null,  pct:80, color:'#3a5a8a' },
                  { icono: <HardDrive size={18} strokeWidth={1.6}/>, val:'41 GB', label:'Almacenamiento',    trend:'82% lleno',up:false, pct:82, color:'#ba1a1a', dark:true },
                ].map((k,i) => (
                  <div key={i} className={`adm-kpi${(k as any).dark ? ' adm-kpi--dark' : ''}`}>
                    <div className="adm-kpi__header">
                      <span style={{ color: k.color }}>{k.icono}</span>
                      <span className={`adm-kpi__trend ${k.up === true ? 'up' : k.up === false ? 'down' : 'neu'}`}>{k.trend}</span>
                    </div>
                    <div className="adm-kpi__val">{k.val}</div>
                    <div className="adm-kpi__label">{k.label}</div>
                    <div className="adm-kpi__bar">
                      <div className="adm-kpi__bar-fill" style={{ width:`${k.pct}%`, background:`linear-gradient(90deg,${k.color},${k.color}66)` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Gráfico + Actividad */}
              <div className="adm-row-2">
                <div className="adm-panel">
                  <div className="adm-panel__header">
                    <span className="adm-panel__titulo">Visitas — últimos 7 días</span>
                    <button className="adm-panel__link" onClick={() => setModulo('estadisticas')}>
                      Ver estadísticas <ChevronRight size={12} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="adm-chart">
                    {BARRAS.map(b => (
                      <div key={b.dia} className="adm-chart__bar-wrap">
                        <span className="adm-chart__val">{b.val}</span>
                        <div className="adm-chart__track">
                          <div className="adm-chart__fill" style={{ height:`${b.pct}%` }} />
                        </div>
                        <span className="adm-chart__label">{b.dia}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adm-panel">
                  <div className="adm-panel__header">
                    <span className="adm-panel__titulo">Actividad reciente</span>
                    <button className="adm-panel__link" onClick={() => setModulo('seguridad')}>
                      Ver log <ChevronRight size={12} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="adm-actividad">
                    {ACTIVIDAD.map((a,i) => (
                      <div key={i} className="adm-act-item">
                        <div className="adm-act-item__dot" style={{ background: a.color }} />
                        <img src={a.avatar} alt={a.nombre} className="adm-act-item__avatar" />
                        <div className="adm-act-item__info">
                          <span className="adm-act-item__texto"><strong>{a.nombre}</strong> {a.accion}</span>
                          <span className="adm-act-item__tiempo">{a.tiempo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Accesos rápidos */}
              <div className="adm-accesos">
                {[
                  { icono:<Edit2    size={20} strokeWidth={1.6}/>, color:'#C9932A', titulo:'Editar perfil',    desc:'Logo, portada, descripción',  estado:'Completo',    ec:'#4a7a4e', mod:'perfil'  },
                  { icono:<Activity size={20} strokeWidth={1.6}/>, color:'#ba1a1a', titulo:'Hitos pendientes', desc:'3 hitos sin imagen',           estado:'3 pendientes',ec:'#ba1a1a', mod:'hitos'   },
                  { icono:<Users    size={20} strokeWidth={1.6}/>, color:'#3a5a8a', titulo:'Equipo',           desc:'8 activos · 2 sin 2FA',        estado:'Atención',    ec:'#C9932A', mod:'equipo'  },
                  { icono:<HardDrive size={20} strokeWidth={1.6}/>,color:'#ba1a1a', titulo:'Almacenamiento',   desc:'41 GB de 50 GB usados',        estado:'82% lleno',   ec:'#ba1a1a', mod:'plan'    },
                ].map((a,i) => (
                  <button key={i} className="adm-acceso" onClick={() => setModulo(a.mod as Modulo)}>
                    <div className="adm-acceso__icono" style={{ color:a.color, background:`${a.color}14` }}>{a.icono}</div>
                    <div className="adm-acceso__info">
                      <span className="adm-acceso__titulo">{a.titulo}</span>
                      <span className="adm-acceso__desc">{a.desc}</span>
                    </div>
                    <span className="adm-acceso__estado" style={{ color:a.ec, background:`${a.ec}12` }}>{a.estado}</span>
                    <ChevronRight size={14} strokeWidth={1.8} style={{ color:'rgba(255,255,255,0.2)', flexShrink:0 }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── HITOS ── */}
          {modulo === 'hitos' && (
            <div className="adm-modulo">
              <div className="adm-modulo__header">
                <div>
                  <h2 className="adm-modulo__titulo">Hitos e historia</h2>
                  <p className="adm-modulo__sub">{hitos.length} hitos · {hitos.filter(h=>h.estado==='incompleto').length} incompletos · {hitos.filter(h=>h.destacado).length} destacados</p>
                </div>
                <button className="adm-btn-primary" onClick={() => abrirModalHito()}>
                  <Plus size={14} strokeWidth={2}/> Nuevo hito
                </button>
              </div>

              {/* Tabla hitos */}
              <div className="adm-tabla">
                <div className="adm-tabla__head" style={{gridTemplateColumns:'80px 80px 1fr 120px 60px 60px 90px'}}>
                  <span>Año</span><span>Mes</span><span>Título</span><span>Categoría</span><span>Estado</span><span>Imagen</span><span>Acciones</span>
                </div>
                {hitos.map(h => (
                  <div key={h.id} className="adm-tabla__row" style={{gridTemplateColumns:'80px 80px 1fr 120px 60px 60px 90px'}}>
                    <span className="adm-tabla__año">{h.año}</span>
                    <span style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{h.mes}</span>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      {h.destacado && <Star size={11} strokeWidth={0} fill="#C9932A"/>}
                      <span className="adm-tabla__txt">{h.titulo}</span>
                    </div>
                    <span className="adm-badge adm-badge--gris">{h.categoria}</span>
                    <span className={`adm-badge ${h.estado==='publicado'?'adm-badge--verde':h.estado==='borrador'?'adm-badge--azul':'adm-badge--warn'}`}>
                      {h.estado==='publicado'?'✓':h.estado==='borrador'?'Borrador':'⚠'}
                    </span>
                    <span>{h.imagen
                      ? <Check size={13} strokeWidth={2.5} style={{color:'#86efac'}}/>
                      : <X     size={13} strokeWidth={2}   style={{color:'#f85149'}}/>
                    }</span>
                    <div className="adm-tabla__acciones">
                      <button onClick={() => abrirModalHito(h)} title="Editar">
                        <Edit2 size={13} strokeWidth={1.8}/>
                      </button>
                      <button onClick={() => showToast('🔗 Link copiado')} title="Copiar link">
                        <ExternalLink size={13} strokeWidth={1.8}/>
                      </button>
                      <button onClick={() => eliminarHito(h.id)} title="Eliminar" style={{color:'rgba(248,81,73,0.6)'}}>
                        <Trash2 size={13} strokeWidth={1.8}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info incompletos */}
              {hitos.some(h => h.estado === 'incompleto') && (
                <div className="adm-hitos-alerta">
                  <AlertTriangle size={14} strokeWidth={1.8}/>
                  <span>Tenés <strong>{hitos.filter(h=>h.estado==='incompleto').length} hitos incompletos</strong> — editálos para agregar descripción e imagen</span>
                </div>
              )}

            </div>
          )}

          {/* ── EQUIPO ── */}
          {modulo === 'equipo' && (
            <div className="adm-modulo">
              <div className="adm-modulo__header">
                <div>
                  <h2 className="adm-modulo__titulo">Equipo y roles</h2>
                  <p className="adm-modulo__sub">
                    {equipo.length} miembros · {equipo.filter(m=>m.activo).length} activos · {equipo.filter(m=>!m.fa2).length} sin 2FA
                  </p>
                </div>
                <button className="adm-btn-primary" onClick={() => abrirModalEquipo()}>
                  <Plus size={14} strokeWidth={2}/> Invitar usuario
                </button>
              </div>

              {/* Info roles */}
              <div className="adm-equipo-roles-info">
                {[
                  { rol:'Admin',  color:'#C9932A', desc:'Acceso total — puede invitar y eliminar usuarios' },
                  { rol:'Editor', color:'#58a6ff', desc:'Puede editar contenido pero no gestionar usuarios' },
                  { rol:'Viewer', color:'rgba(255,255,255,0.3)', desc:'Solo lectura — no puede editar nada' },
                ].map(r => (
                  <div key={r.rol} className="adm-equipo-rol-item">
                    <span className="adm-badge" style={{background:`${r.color}15`,color:r.color}}>{r.rol}</span>
                    <span>{r.desc}</span>
                  </div>
                ))}
              </div>

              {/* Tabla */}
              <div className="adm-tabla">
                <div className="adm-tabla__head" style={{gridTemplateColumns:'1fr 120px 90px 70px 80px 80px 90px'}}>
                  <span>Usuario</span><span>Cargo</span><span>Rol</span><span>2FA</span><span>Estado</span><span>Desde</span><span>Acciones</span>
                </div>
                {equipo.map(u => (
                  <div key={u.id} className="adm-tabla__row" style={{gridTemplateColumns:'1fr 120px 90px 70px 80px 80px 90px'}}>
                    <div className="adm-tabla__usuario">
                      <img src={u.avatar} alt={u.nombre}/>
                      <div style={{display:'flex',flexDirection:'column',gap:'1px'}}>
                        <span style={{fontSize:'0.78rem',fontWeight:700,color:'rgba(255,255,255,0.9)'}}>{u.nombre}</span>
                        <span style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)'}}>{u.email}</span>
                      </div>
                    </div>
                    <span className="adm-tabla__cargo">{u.cargo}</span>
                    <span className={`adm-badge ${u.rol==='Admin'?'adm-badge--ambar':u.rol==='Editor'?'adm-badge--azul':'adm-badge--gris'}`}>
                      {u.rol}
                    </span>
                    <button
                      onClick={() => toggleFA2(u.id)}
                      title={u.fa2 ? 'Desactivar 2FA' : 'Activar 2FA'}
                      style={{background:'none',border:'none',cursor:'pointer',display:'flex'}}
                    >
                      {u.fa2
                        ? <Lock   size={14} strokeWidth={2} style={{color:'#86efac'}}/>
                        : <Unlock size={14} strokeWidth={2} style={{color:'#f85149'}}/>
                      }
                    </button>
                    <button
                      onClick={() => toggleActivo2(u.id)}
                      className={`adm-badge ${u.activo?'adm-badge--verde':'adm-badge--gris'}`}
                      style={{border:'none',cursor:'pointer'}}
                    >
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </button>
                    <span style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.3)'}}>{u.desde}</span>
                    <div className="adm-tabla__acciones">
                      <button onClick={() => abrirModalEquipo(u)} title="Editar">
                        <Edit2 size={13} strokeWidth={1.8}/>
                      </button>
                      <button
                        onClick={() => eliminarMiembro(u.id)}
                        title="Eliminar" style={{color:'rgba(248,81,73,0.6)'}}
                      >
                        <Trash2 size={13} strokeWidth={1.8}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Alerta 2FA */}
              {equipo.some(m => !m.fa2 && m.activo) && (
                <div className="adm-hitos-alerta">
                  <AlertTriangle size={14} strokeWidth={1.8}/>
                  <span><strong>{equipo.filter(m=>!m.fa2&&m.activo).length} usuarios activos</strong> sin 2FA activado — recomendamos solicitarles que lo activen</span>
                </div>
              )}
            </div>
          )}

          {/* ── PLAN ── */}
          {modulo === 'plan' && (
            <div className="adm-modulo">
              <h2 className="adm-modulo__titulo">Plan y facturación</h2>
              <div className="adm-plan-grid">
                <div className="adm-plan-card adm-plan-card--current">
                  <span className="adm-plan-card__badge"><Crown size={11} strokeWidth={2}/> Plan actual</span>
                  <h3>Professional</h3>
                  <div className="adm-plan-card__precio">$1.200 <span>/año</span></div>
                  <div className="adm-plan-card__vence"><Clock size={12} strokeWidth={1.8}/> Vence el 15 de agosto de 2026</div>
                  <div className="adm-plan-card__storage">
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.68rem',color:'rgba(255,255,255,0.5)',marginBottom:'6px'}}>
                      <span>Almacenamiento</span><span>41 GB / 50 GB</span>
                    </div>
                    <div className="adm-kpi__bar"><div className="adm-kpi__bar-fill" style={{width:'82%',background:'linear-gradient(90deg,#C9932A,#f85149)'}}/></div>
                  </div>
                  <button className="adm-btn-primary" style={{width:'100%',marginTop:'8px'}} onClick={() => showToast('🔄 Renovando...')}>
                    Renovar Professional — $1.200
                  </button>
                </div>
                <div className="adm-plan-card">
                  <span className="adm-plan-card__badge adm-plan-card__badge--upgrade"><Star size={10} strokeWidth={0} fill="currentColor"/> Upgrade</span>
                  <h3>Enterprise</h3>
                  <div className="adm-plan-card__precio">A consultar</div>
                  <ul className="adm-plan-card__features">
                    {['Usuarios ilimitados','Almacenamiento ilimitado','API access','Account manager','SLA garantizado'].map(f => (
                      <li key={f}><Check size={11} strokeWidth={2.5}/>{f}</li>
                    ))}
                  </ul>
                  <button className="adm-btn-secondary" style={{width:'100%'}} onClick={() => showToast('📧 Contactando ventas...')}>
                    Contactar ventas
                  </button>
                </div>
              </div>
              <div className="adm-panel" style={{marginTop:'16px'}}>
                <div className="adm-panel__header"><span className="adm-panel__titulo">Historial de pagos</span></div>
                {[
                  {fecha:'15 Ago 2025',plan:'Professional',monto:'$1.200'},
                  {fecha:'15 Ago 2024',plan:'Professional',monto:'$1.200'},
                  {fecha:'15 Ago 2023',plan:'Starter',     monto:'$500'  },
                ].map((p,i) => (
                  <div key={i} className="adm-tabla__row">
                    <span style={{color:'rgba(255,255,255,0.4)',fontSize:'0.72rem'}}>{p.fecha}</span>
                    <span style={{color:'rgba(255,255,255,0.8)',fontSize:'0.75rem'}}>{p.plan}</span>
                    <span style={{color:'#ffe088',fontWeight:700,fontSize:'0.8rem'}}>{p.monto}</span>
                    <span className="adm-badge adm-badge--verde">Pagado</span>
                    <button className="adm-tabla__acciones" onClick={() => showToast('📄 Descargando...')}>
                      <FileText size={13} strokeWidth={1.8}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SEGURIDAD ── */}
          {modulo === 'seguridad' && (
            <div className="adm-modulo">
              <h2 className="adm-modulo__titulo">Seguridad</h2>
              <div className="adm-seg-grid">
                <div className="adm-panel">
                  <div className="adm-panel__header"><span className="adm-panel__titulo">Estado de seguridad</span></div>
                  {[
                    {label:'2FA activado en tu cuenta', ok:true },
                    {label:'2 usuarios sin 2FA',        ok:false},
                    {label:'Contraseña actualizada',    ok:true },
                    {label:'Sesiones activas: 1',       ok:true },
                  ].map((s,i) => (
                    <div key={i} className="adm-seg-item">
                      {s.ok
                        ? <Check         size={14} strokeWidth={2.5} style={{color:'#86efac',flexShrink:0}}/>
                        : <AlertTriangle size={14} strokeWidth={2}   style={{color:'#f85149',flexShrink:0}}/>
                      }
                      <span style={{fontSize:'0.78rem',color:s.ok?'rgba(255,255,255,0.7)':'#f85149',flex:1}}>{s.label}</span>
                      {!s.ok && <button className="adm-btn-xs" onClick={() => showToast('📧 Recordatorio enviado')}>Solucionar</button>}
                    </div>
                  ))}
                </div>
                <div className="adm-panel">
                  <div className="adm-panel__header"><span className="adm-panel__titulo">Log de actividad</span></div>
                  <div className="adm-actividad">
                    {ACTIVIDAD.map((a,i) => (
                      <div key={i} className="adm-act-item">
                        <div className="adm-act-item__dot" style={{background:a.color}}/>
                        <img src={a.avatar} alt={a.nombre} className="adm-act-item__avatar"/>
                        <div className="adm-act-item__info">
                          <span className="adm-act-item__texto"><strong>{a.nombre}</strong> {a.accion}</span>
                          <span className="adm-act-item__tiempo">{a.tiempo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PERFIL ── */}
          {modulo === 'perfil' && (
            <div className="adm-modulo">
              <div className="adm-modulo__header">
                <div>
                  <h2 className="adm-modulo__titulo">Perfil público</h2>
                  <p className="adm-modulo__sub">Así se ve tu organización para el mundo</p>
                </div>
                <button className="adm-btn-primary" onClick={guardarPerfil}>
                  {perfilGuardado ? <><Check size={14} strokeWidth={2}/> Guardado</> : <><Upload size={14} strokeWidth={2}/> Guardar cambios</>}
                </button>
              </div>

              {/* Portada y logo */}
              <div className="adm-perfil-portada">
                <div className="adm-perfil-portada__img">
                  <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" alt="Portada" />
                  <button className="adm-perfil-portada__btn" onClick={() => fileInputPerfil.current?.click()}>
                    <Image size={14} strokeWidth={1.8} /> Cambiar portada
                  </button>
                </div>
                <div className="adm-perfil-portada__logo-wrap">
                  <img src="https://i.pravatar.cc/80?img=70" alt="Logo" className="adm-perfil-portada__logo" />
                  <button className="adm-perfil-portada__logo-btn" onClick={() => fileInputPerfil.current?.click()}>
                    <Upload size={11} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Campos */}
              <div className="adm-perfil-grid">
                <div className="adm-campo">
                  <label>Nombre de la organización</label>
                  <input value={pNombre} onChange={e => setPNombre(e.target.value)} />
                </div>
                <div className="adm-campo">
                  <label>Slogan</label>
                  <input value={pSlogan} onChange={e => setPSlogan(e.target.value)} />
                </div>
                <div className="adm-campo adm-campo--full">
                  <label>Descripción</label>
                  <textarea rows={4} value={pDesc} onChange={e => setPDesc(e.target.value)} />
                </div>
                <div className="adm-campo adm-campo--full">
                  <label>Misión</label>
                  <textarea rows={3} value={pMision} onChange={e => setPMision(e.target.value)} />
                </div>
                <div className="adm-campo">
                  <label><Globe size={12} strokeWidth={1.8}/> Sitio web</label>
                  <input value={pWeb} onChange={e => setPWeb(e.target.value)} placeholder="www.empresa.com" />
                </div>
                <div className="adm-campo">
                  <label><Phone size={12} strokeWidth={1.8}/> Email de contacto</label>
                  <input value={pEmail} onChange={e => setPEmail(e.target.value)} placeholder="contacto@empresa.com" />
                </div>
                <div className="adm-campo">
                  <label>Instagram</label>
                  <input value={pInstagram} onChange={e => setPInstagram(e.target.value)} placeholder="@usuario" />
                </div>
                <div className="adm-campo">
                  <label>LinkedIn</label>
                  <input value={pLinkedin} onChange={e => setPLinkedin(e.target.value)} placeholder="nombre-empresa" />
                </div>
              </div>

              {/* Preview */}
              <div className="adm-perfil-preview">
                <span className="adm-perfil-preview__label">Preview del perfil público</span>
                <div className="adm-perfil-preview__card">
                  <div className="adm-perfil-preview__header">
                    <img src="https://i.pravatar.cc/40?img=70" alt="Logo" />
                    <div>
                      <strong>{pNombre}</strong>
                      <span>{pSlogan}</span>
                    </div>
                  </div>
                  <p>{pDesc.slice(0,120)}...</p>
                  <div className="adm-perfil-preview__links">
                    {pWeb && <span>🌐 {pWeb}</span>}
                    {pInstagram && <span>📸 {pInstagram}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTOS ── */}
          {modulo === 'productos' && (
            <div className="adm-modulo">
              <div className="adm-modulo__header">
                <div>
                  <h2 className="adm-modulo__titulo">Productos y servicios</h2>
                  <p className="adm-modulo__sub">{productos.length} productos · {productos.filter(p=>p.activo).length} activos</p>
                </div>
                <button className="adm-btn-primary" onClick={() => abrirModalProd()}>
                  <Plus size={14} strokeWidth={2}/> Nuevo producto
                </button>
              </div>

              {/* Grilla de productos */}
              <div className="adm-prod-grid">
                {productos.map(prod => (
                  <div key={prod.id} className={`adm-prod-card${!prod.activo ? ' adm-prod-card--inactivo' : ''}`}>
                    <div className="adm-prod-card__img">
                      {prod.imagen
                        ? <img src={prod.imagen} alt={prod.nombre} />
                        : <div className="adm-prod-card__img-placeholder"><Package size={24} strokeWidth={1.4}/></div>
                      }
                      <span className={`adm-prod-card__estado ${prod.activo ? 'activo' : 'inactivo'}`}>
                        {prod.activo ? 'Activo' : 'Discontinuado'}
                      </span>
                    </div>
                    <div className="adm-prod-card__body">
                      <div className="adm-prod-card__cat">{prod.categoria} · {prod.año}</div>
                      <h4 className="adm-prod-card__nombre">{prod.nombre}</h4>
                      <p className="adm-prod-card__desc">{prod.desc}</p>
                    </div>
                    <div className="adm-prod-card__footer">
                      <button
                        className="adm-prod-card__toggle"
                        onClick={() => toggleActivo(prod.id)}
                        title={prod.activo ? 'Marcar como discontinuado' : 'Activar'}
                      >
                        {prod.activo
                          ? <ToggleRight size={18} strokeWidth={1.8} style={{color:'#86efac'}}/>
                          : <ToggleLeft  size={18} strokeWidth={1.8} style={{color:'rgba(255,255,255,0.2)'}}/>
                        }
                      </button>
                      <button className="adm-prod-card__edit" onClick={() => abrirModalProd(prod)}>
                        <Edit2 size={13} strokeWidth={1.8}/>
                      </button>
                      <button className="adm-prod-card__del" onClick={() => eliminarProducto(prod.id)}>
                        <Trash2 size={13} strokeWidth={1.8}/>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Card agregar */}
                <button className="adm-prod-nueva" onClick={() => abrirModalProd()}>
                  <Plus size={24} strokeWidth={1.4}/>
                  <span>Nuevo producto</span>
                </button>
              </div>
            </div>
          )}

          {/* ── ESTADÍSTICAS ── */}
          {modulo === 'estadisticas' && (
            <div className="adm-modulo">
              <div className="adm-modulo__header">
                <div>
                  <h2 className="adm-modulo__titulo">Estadísticas</h2>
                  <p className="adm-modulo__sub">Rendimiento del perfil · últimos 30 días</p>
                </div>
                <div className="adm-stats-periodo">
                  {['7D','30D','90D'].map(p => (
                    <button
                      key={p}
                      className={`adm-stats-periodo__btn${statsPeriodo === p ? ' active' : ''}`}
                      onClick={() => setStatsPeriodo(p)}
                    >{p}</button>
                  ))}
                </div>
              </div>

              {/* KPIs */}
              <div className="adm-kpi-grid">
                {[
                  { icono: <Eye       size={18} strokeWidth={1.6}/>, val:'18.432', label:'Visitas totales',      trend:'+24%',     up:true,  pct:74, color:'#C9932A' },
                  { icono: <Clock     size={18} strokeWidth={1.6}/>, val:'2:34',   label:'Tiempo promedio',      trend:'+8%',      up:true,  pct:55, color:'#4a7a4e' },
                  { icono: <Users     size={18} strokeWidth={1.6}/>, val:'3.291',  label:'Visitantes únicos',    trend:'+18%',     up:true,  pct:62, color:'#3a5a8a' },
                  { icono: <TrendingUp size={18} strokeWidth={1.6}/>,val:'68%',    label:'Tasa de retorno',      trend:'+5%',      up:true,  pct:68, color:'#735c00' },
                ].map((k,i) => (
                  <div key={i} className="adm-kpi">
                    <div className="adm-kpi__header">
                      <span style={{color:k.color}}>{k.icono}</span>
                      <span className={`adm-kpi__trend ${k.up ? 'up' : 'down'}`}>{k.trend}</span>
                    </div>
                    <div className="adm-kpi__val">{k.val}</div>
                    <div className="adm-kpi__label">{k.label}</div>
                    <div className="adm-kpi__bar">
                      <div className="adm-kpi__bar-fill" style={{width:`${k.pct}%`, background:`linear-gradient(90deg,${k.color},${k.color}66)`}}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gráfico visitas por día */}
              <div className="adm-panel">
                <div className="adm-panel__header">
                  <span className="adm-panel__titulo">Visitas por día</span>
                  <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.3)'}}>últimos {statsPeriodo}</span>
                </div>
                <div className="adm-stats-linea">
                  {VISITAS_DIARIAS.map((v,i) => (
                    <div key={i} className="adm-stats-linea__col">
                      <div className="adm-stats-linea__track">
                        <div className="adm-stats-linea__fill" style={{height:`${v.pct}%`}}/>
                        <span className="adm-stats-linea__tooltip">{v.val}</span>
                      </div>
                      <span className="adm-stats-linea__label">{v.dia}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fila 2: Secciones + Dispositivos + Países */}
              <div className="adm-stats-row3">

                {/* Secciones más visitadas */}
                <div className="adm-panel">
                  <div className="adm-panel__header">
                    <span className="adm-panel__titulo">Secciones más vistas</span>
                  </div>
                  <div className="adm-stats-secciones">
                    {[
                      { label: 'Hitos históricos',    pct: 42, val: '7.741', color: '#C9932A' },
                      { label: 'Perfil principal',    pct: 28, val: '5.161', color: '#4a7a4e' },
                      { label: 'Árbol de liderazgo',  pct: 18, val: '3.317', color: '#3a5a8a' },
                      { label: 'Productos',           pct: 8,  val: '1.474', color: '#855324' },
                      { label: 'Línea de vida',       pct: 4,  val:  '737',  color: '#735c00' },
                    ].map((s,i) => (
                      <div key={i} className="adm-stats-seccion">
                        <span className="adm-stats-seccion__label">{s.label}</span>
                        <div className="adm-stats-seccion__bar-wrap">
                          <div className="adm-stats-seccion__bar">
                            <div className="adm-stats-seccion__fill" style={{width:`${s.pct}%`, background:s.color}}/>
                          </div>
                          <span className="adm-stats-seccion__pct">{s.pct}%</span>
                        </div>
                        <span className="adm-stats-seccion__val">{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispositivos */}
                <div className="adm-panel">
                  <div className="adm-panel__header">
                    <span className="adm-panel__titulo">Dispositivos</span>
                  </div>
                  <div className="adm-stats-donut-wrap">
                    <svg viewBox="0 0 120 120" className="adm-stats-donut">
                      <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18"/>
                      <circle cx="60" cy="60" r="45" fill="none" stroke="#C9932A" strokeWidth="18"
                        strokeDasharray={`${0.58 * 283} ${283}`} strokeDashoffset="70.75" strokeLinecap="round"/>
                      <circle cx="60" cy="60" r="45" fill="none" stroke="#3a5a8a" strokeWidth="18"
                        strokeDasharray={`${0.32 * 283} ${283}`} strokeDashoffset={`${-(0.58 * 283) + 70.75}`} strokeLinecap="round"/>
                      <circle cx="60" cy="60" r="45" fill="none" stroke="#4a7a4e" strokeWidth="18"
                        strokeDasharray={`${0.10 * 283} ${283}`} strokeDashoffset={`${-(0.90 * 283) + 70.75}`} strokeLinecap="round"/>
                      <text x="60" y="56" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">58%</text>
                      <text x="60" y="70" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">Mobile</text>
                    </svg>
                    <div className="adm-stats-donut-legend">
                      {[
                        { color:'#C9932A', label:'Mobile',  pct:'58%' },
                        { color:'#3a5a8a', label:'Desktop', pct:'32%' },
                        { color:'#4a7a4e', label:'Tablet',  pct:'10%' },
                      ].map(d => (
                        <div key={d.label} className="adm-stats-donut-legend__item">
                          <div className="adm-stats-donut-legend__dot" style={{background:d.color}}/>
                          <span>{d.label}</span>
                          <strong>{d.pct}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Países */}
                <div className="adm-panel">
                  <div className="adm-panel__header">
                    <span className="adm-panel__titulo">Países de origen</span>
                  </div>
                  <div className="adm-stats-paises">
                    {[
                      { bandera:'🇦🇷', pais:'Argentina', pct:72, val:'13.271' },
                      { bandera:'🇪🇸', pais:'España',    pct:12, val:'2.211'  },
                      { bandera:'🇺🇸', pais:'EE.UU.',    pct:8,  val:'1.474'  },
                      { bandera:'🇧🇷', pais:'Brasil',    pct:5,  val:'921'    },
                      { bandera:'🇲🇽', pais:'México',    pct:3,  val:'552'    },
                    ].map((p,i) => (
                      <div key={i} className="adm-stats-pais">
                        <span className="adm-stats-pais__bandera">{p.bandera}</span>
                        <div className="adm-stats-pais__info">
                          <div className="adm-stats-pais__top">
                            <span className="adm-stats-pais__nombre">{p.pais}</span>
                            <span className="adm-stats-pais__val">{p.val}</span>
                          </div>
                          <div className="adm-stats-pais__bar">
                            <div className="adm-stats-pais__fill" style={{width:`${p.pct}%`}}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Hitos más vistos */}
              <div className="adm-panel">
                <div className="adm-panel__header">
                  <span className="adm-panel__titulo">Hitos más visitados</span>
                </div>
                <div className="adm-tabla">
                  <div className="adm-tabla__head" style={{gridTemplateColumns:'1fr 80px 80px 100px'}}>
                    <span>Hito</span><span>Año</span><span>Visitas</span><span>Tendencia</span>
                  </div>
                  {[
                    { titulo:'Lanzamiento BNA+',          año:2020, visitas:'4.821', trend:'+32%', up:true  },
                    { titulo:'Cuenta DNI gratuita',        año:2021, visitas:'3.412', trend:'+18%', up:true  },
                    { titulo:'Sucursal número 700',        año:2024, visitas:'2.931', trend:'+45%', up:true  },
                    { titulo:'Crédito Hipotecario UVA',    año:2016, visitas:'1.847', trend:'-3%',  up:false },
                    { titulo:'Fundación del Banco',        año:1891, visitas:'1.203', trend:'+8%',  up:true  },
                  ].map((h,i) => (
                    <div key={i} className="adm-tabla__row" style={{gridTemplateColumns:'1fr 80px 80px 100px'}}>
                      <span className="adm-tabla__txt">{h.titulo}</span>
                      <span className="adm-tabla__año">{h.año}</span>
                      <span style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.8)',fontWeight:700}}>{h.visitas}</span>
                      <span className={`adm-badge ${h.up ? 'adm-badge--verde' : 'adm-badge--warn'}`}>{h.trend}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── MULTIMEDIA ── */}
          {modulo === 'multimedia' && (
            <div className="adm-modulo">
              <div className="adm-modulo__header">
                <div>
                  <h2 className="adm-modulo__titulo">Multimedia</h2>
                  <p className="adm-modulo__sub">{mediaItems.length} archivos · {(mediaItems.reduce((a,_) => a, 0))} elementos</p>
                </div>
                <div className="adm-media-acciones">
                  <button className="adm-btn-secondary adm-btn-secondary--sm"
                    onClick={() => fileInputRef.current?.click()}>
                    <Upload size={13} strokeWidth={2}/> Subir archivos
                  </button>
                  <button className="adm-btn-primary adm-btn-primary--sm"
                    onClick={() => fileInputRef.current?.click()}>
                    <Plus size={13} strokeWidth={2}/> Agregar
                  </button>
                </div>
              </div>

              {/* Filtros y controles */}
              <div className="adm-media-toolbar">
                <div className="adm-media-filtros">
                  {['Todos','Portada','Instalaciones','Productos','Equipo','Historia','Identidad','Institucional'].map(f => (
                    <button
                      key={f}
                      className={`adm-media-filtro${mediaFiltro === f ? ' active' : ''}`}
                      onClick={() => setMediaFiltro(f)}
                    >{f}</button>
                  ))}
                </div>
                <div className="adm-media-vista">
                  <button
                    className={`adm-media-vista__btn${mediaVista === 'grilla' ? ' active' : ''}`}
                    onClick={() => setMediaVista('grilla')}
                  >⊞</button>
                  <button
                    className={`adm-media-vista__btn${mediaVista === 'lista' ? ' active' : ''}`}
                    onClick={() => setMediaVista('lista')}
                  >☰</button>
                </div>
              </div>

              {/* Storage info */}
              <div className="adm-media-storage">
                <div className="adm-media-storage__info">
                  <HardDrive size={14} strokeWidth={1.8}/>
                  <span>Almacenamiento: <strong>41 GB</strong> de 50 GB usados</span>
                </div>
                <div className="adm-media-storage__bar">
                  <div className="adm-media-storage__fill" style={{width:'82%'}}/>
                </div>
                <button className="adm-btn-xs" onClick={() => setModulo('plan')}>
                  Ampliar →
                </button>
              </div>

              {/* Grilla */}
              {mediaVista === 'grilla' && (
                <div className="adm-media-grid">
                  {mediaItems
                    .filter(m => mediaFiltro === 'Todos' || m.categoria === mediaFiltro)
                    .map(item => (
                      <div
                        key={item.id}
                        className={`adm-media-card${mediaSelec.includes(item.id) ? ' selected' : ''}`}
                        onClick={() => setModalMedia(item)}
                      >
                        <div className="adm-media-card__thumb">
                          {item.tipo === 'imagen' && item.url
                            ? <img src={item.url} alt={item.nombre}/>
                            : (
                              <div className="adm-media-card__placeholder">
                                {item.tipo === 'video'
                                  ? <span style={{fontSize:'2rem'}}>🎬</span>
                                  : <Image size={28} strokeWidth={1.2}/>
                                }
                              </div>
                            )
                          }
                          <div className="adm-media-card__overlay">
                            <button
                              className="adm-media-card__select"
                              onClick={e => {
                                e.stopPropagation();
                                setMediaSelec(prev =>
                                  prev.includes(item.id)
                                    ? prev.filter(i => i !== item.id)
                                    : [...prev, item.id]
                                );
                              }}
                            >
                              {mediaSelec.includes(item.id) ? '✓' : '○'}
                            </button>
                            <span className="adm-media-card__tipo">{item.tipo}</span>
                          </div>
                        </div>
                        <div className="adm-media-card__info">
                          <span className="adm-media-card__nombre">{item.nombre}</span>
                          <span className="adm-media-card__meta">{item.categoria} · {item.tamaño}</span>
                        </div>
                      </div>
                    ))
                  }

                  {/* Card subir nuevo */}
                  <button className="adm-media-nueva" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={24} strokeWidth={1.4}/>
                    <span>Subir archivo</span>
                    <span style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.2)'}}>JPG, PNG, MP4 · Max 500MB</span>
                  </button>
                </div>
              )}

              {/* Vista lista */}
              {mediaVista === 'lista' && (
                <div className="adm-tabla">
                  <div className="adm-tabla__head" style={{gridTemplateColumns:'40px 1fr 100px 80px 90px 80px'}}>
                    <span></span><span>Nombre</span><span>Categoría</span><span>Tipo</span><span>Tamaño</span><span>Acciones</span>
                  </div>
                  {mediaItems
                    .filter(m => mediaFiltro === 'Todos' || m.categoria === mediaFiltro)
                    .map(item => (
                      <div key={item.id} className="adm-tabla__row" style={{gridTemplateColumns:'40px 1fr 100px 80px 90px 80px'}}>
                        <div className="adm-media-lista__thumb">
                          {item.url
                            ? <img src={item.url} alt={item.nombre}/>
                            : <span>{item.tipo === 'video' ? '🎬' : '🖼️'}</span>
                          }
                        </div>
                        <span className="adm-tabla__txt">{item.nombre}</span>
                        <span className="adm-badge adm-badge--gris">{item.categoria}</span>
                        <span className="adm-badge adm-badge--azul">{item.tipo}</span>
                        <span style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{item.tamaño}</span>
                        <div className="adm-tabla__acciones">
                          <button onClick={() => setModalMedia(item)}><Eye size={13} strokeWidth={1.8}/></button>
                          <button onClick={() => { setMediaItems(p => p.filter(m => m.id !== item.id)); showToast('✓ Eliminado'); }} style={{color:'rgba(248,81,73,0.6)'}}>
                            <Trash2 size={13} strokeWidth={1.8}/>
                          </button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* Acciones selección múltiple */}
              {mediaSelec.length > 0 && (
                <div className="adm-media-selec-bar">
                  <span>{mediaSelec.length} archivo{mediaSelec.length > 1 ? 's' : ''} seleccionado{mediaSelec.length > 1 ? 's' : ''}</span>
                  <button className="adm-btn-xs" onClick={() => {
                    setMediaItems(p => p.filter(m => !mediaSelec.includes(m.id)));
                    setMediaSelec([]);
                    showToast('✓ Archivos eliminados');
                  }}>
                    <Trash2 size={11} strokeWidth={2}/> Eliminar selección
                  </button>
                  <button className="adm-btn-xs" onClick={() => setMediaSelec([])}>
                    Cancelar
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ── ÁRBOL DE LIDERAZGO ── */}
          {modulo === 'arbol' && (
            <div className="adm-modulo">
              <div className="adm-modulo__header">
                <div>
                  <h2 className="adm-modulo__titulo">Árbol de liderazgo</h2>
                  <p className="adm-modulo__sub">{nodos.length} personas · {nodos.filter(n=>n.esActual).length} en actividad</p>
                </div>
                <button className="adm-btn-primary" onClick={() => abrirModalNodo()}>
                  <Plus size={14} strokeWidth={2}/> Agregar directivo
                </button>
              </div>

              {/* Leyenda eras */}
              <div className="adm-arbol-leyenda">
                {ERA_LABELS.map((label, i) => (
                  <div key={i} className="adm-arbol-leyenda__item">
                    <div className="adm-arbol-leyenda__dot" style={{background: ERA_COLORS[i]}}/>
                    <span>{label}</span>
                  </div>
                ))}
                <div className="adm-arbol-leyenda__item">
                  <div className="adm-arbol-leyenda__dot" style={{background:'#4a7a4e', outline:'2px solid #86efac', outlineOffset:'1px'}}/>
                  <span>En actividad</span>
                </div>
              </div>

              <div className="adm-arbol-wrap">
                {/* Panel árbol */}
                <div className="adm-arbol-canvas">
                  {ERA_LABELS.map((eraLabel, eraIdx) => {
                    const nodosEra = nodos.filter(n => n.era === eraIdx);
                    if (nodosEra.length === 0) return null;
                    return (
                      <div key={eraIdx} className="adm-arbol-era">
                        <div className="adm-arbol-era__label" style={{color: ERA_COLORS[eraIdx]}}>
                          <div className="adm-arbol-era__dot" style={{background: ERA_COLORS[eraIdx]}}/>
                          {eraLabel}
                        </div>
                        <div className="adm-arbol-era__nodos">
                          {nodosEra.map(nodo => (
                            <div
                              key={nodo.id}
                              className={`adm-arbol-nodo${nodoSelec?.id === nodo.id ? ' selected' : ''}${nodo.esActual ? ' actual' : ''}`}
                              style={{borderColor: ERA_COLORS[Math.min(nodo.era, ERA_COLORS.length-1)]}}
                              onClick={() => setNodoSelec(nodoSelec?.id === nodo.id ? null : nodo)}
                            >
                              <img src={nodo.foto} alt={nodo.nombre} className="adm-arbol-nodo__foto"/>
                              {nodo.esActual && <div className="adm-arbol-nodo__activo"/>}
                              <div className="adm-arbol-nodo__info">
                                <span className="adm-arbol-nodo__nombre">{nodo.nombre.split(' ').slice(0,2).join(' ')}</span>
                                <span className="adm-arbol-nodo__cargo" style={{color: ERA_COLORS[Math.min(nodo.era, ERA_COLORS.length-1)]}}>
                                  {nodo.cargo.split(' ').slice(0,3).join(' ')}
                                </span>
                                <span className="adm-arbol-nodo__periodo">{nodo.desde} – {nodo.hasta}</span>
                              </div>
                              {nodo.parentId && (
                                <div className="adm-arbol-nodo__conector" style={{borderColor: ERA_COLORS[Math.min(nodo.era, ERA_COLORS.length-1)]}}/>
                              )}
                            </div>
                          ))}
                          <button
                            className="adm-arbol-nodo adm-arbol-nodo--nueva"
                            onClick={() => { setNEra(eraIdx); abrirModalNodo(); }}
                          >
                            <Plus size={18} strokeWidth={1.6}/>
                            <span>Agregar</span>
                          </button>
                        </div>
                        {eraIdx < ERA_LABELS.length - 1 && nodos.some(n => n.era === eraIdx + 1) && (
                          <div className="adm-arbol-era__linea" style={{borderColor: ERA_COLORS[eraIdx]}}/>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Panel detalle */}
                {nodoSelec && (
                  <div className="adm-arbol-detalle">
                    <div className="adm-arbol-detalle__header">
                      <img src={nodoSelec.foto} alt={nodoSelec.nombre}/>
                      <div>
                        <h3>{nodoSelec.nombre}</h3>
                        <span style={{color: ERA_COLORS[Math.min(nodoSelec.era, ERA_COLORS.length-1)], fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em'}}>
                          {nodoSelec.cargo}
                        </span>
                        <div style={{display:'flex', gap:'6px', marginTop:'4px', flexWrap:'wrap'}}>
                          <span className="adm-badge adm-badge--gris">{ERA_LABELS[nodoSelec.era]}</span>
                          {nodoSelec.esActual && <span className="adm-badge adm-badge--verde">En actividad</span>}
                        </div>
                      </div>
                      <button className="adm-arbol-detalle__close" onClick={() => setNodoSelec(null)}>
                        <X size={16} strokeWidth={1.8}/>
                      </button>
                    </div>

                    <div className="adm-arbol-detalle__body">
                      <div className="adm-arbol-detalle__dato">
                        <span>Período</span>
                        <strong>{nodoSelec.desde} – {nodoSelec.hasta}</strong>
                      </div>
                      {nodoSelec.parentId && (
                        <div className="adm-arbol-detalle__dato">
                          <span>Predecesor</span>
                          <strong>{nodos.find(n => n.id === nodoSelec.parentId)?.nombre || '—'}</strong>
                        </div>
                      )}
                      {nodos.some(n => n.parentId === nodoSelec.id) && (
                        <div className="adm-arbol-detalle__dato">
                          <span>Sucesor/es</span>
                          <strong>{nodos.filter(n => n.parentId === nodoSelec.id).map(n => n.nombre.split(' ')[0]).join(', ')}</strong>
                        </div>
                      )}
                      <div className="adm-arbol-detalle__bio">
                        <span>Bio</span>
                        <p>{nodoSelec.bio || 'Sin descripción.'}</p>
                      </div>
                    </div>

                    <div className="adm-arbol-detalle__footer">
                      <button className="adm-btn-secondary" onClick={() => abrirModalNodo(nodoSelec)}>
                        <Edit2 size={13} strokeWidth={1.8}/> Editar
                      </button>
                      <button className="adm-btn-secondary" style={{color:'rgba(248,81,73,0.8)'}}
                        onClick={() => eliminarNodo(nodoSelec.id)}>
                        <Trash2 size={13} strokeWidth={1.8}/> Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── PLACEHOLDER módulos restantes ── */}
          {!['dashboard','hitos','equipo','plan','seguridad','perfil','productos','estadisticas','multimedia','arbol'].includes(modulo) && (
            <div className="adm-placeholder">
              <div style={{fontSize:'2.5rem',opacity:0.3}}>🏗️</div>
              <h2>{NAV_ITEMS.find(i => i.id === modulo)?.label}</h2>
              <p>Módulo en construcción</p>
              <button className="adm-btn-primary" onClick={() => setModulo('dashboard')}>
                ← Volver al Dashboard
              </button>
            </div>
          )}

        </div>
      </div>




      {/* ════ MODAL EQUIPO ════ */}
      {modalEquipo && (
        <div className="adm-overlay" onClick={() => setModalEquipo(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal__header">
              <h3>{miembroEdit ? 'Editar usuario' : 'Invitar usuario al equipo'}</h3>
              <button onClick={() => setModalEquipo(false)}><X size={18} strokeWidth={1.8}/></button>
            </div>
            <div className="adm-modal__body">
              <div className="adm-campo">
                <label>Nombre completo *</label>
                <input value={eNombre} onChange={e => setENombre(e.target.value)} placeholder="Ej: Juan Pérez"/>
              </div>
              <div className="adm-campo">
                <label>Email corporativo *</label>
                <input type="email" value={eEmail} onChange={e => setEEmail(e.target.value)} placeholder="juan@empresa.com"/>
              </div>
              <div className="adm-campo">
                <label>Cargo</label>
                <input value={eCargo} onChange={e => setECargo(e.target.value)} placeholder="Ej: Director de Marketing"/>
              </div>
              <div className="adm-campo">
                <label>Rol en el panel</label>
                <div style={{display:'flex',gap:'8px'}}>
                  {(['Admin','Editor','Viewer'] as const).map(r => (
                    <button key={r} onClick={() => setERol(r)}
                      style={{
                        flex:1, padding:'10px 8px', borderRadius:'8px', border:'none',
                        cursor:'pointer', fontFamily:'Manrope,sans-serif',
                        fontSize:'0.75rem', fontWeight:700,
                        background: eRol===r
                          ? r==='Admin' ? 'rgba(201,147,42,0.2)' : r==='Editor' ? 'rgba(88,166,255,0.15)' : 'rgba(255,255,255,0.08)'
                          : 'rgba(255,255,255,0.04)',
                        color: eRol===r
                          ? r==='Admin' ? '#ffe088' : r==='Editor' ? '#58a6ff' : 'rgba(255,255,255,0.6)'
                          : 'rgba(255,255,255,0.25)',
                      }}
                    >{r}</button>
                  ))}
                </div>
                <p style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.25)',margin:'4px 0 0'}}>
                  {eRol==='Admin' ? 'Acceso total — puede invitar y eliminar usuarios' :
                   eRol==='Editor' ? 'Puede editar contenido pero no gestionar usuarios' :
                   'Solo lectura — no puede editar nada'}
                </p>
              </div>
              {miembroEdit && (
                <div className="adm-modal__toggle-row">
                  <div>
                    <label>Usuario activo</label>
                    <p style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.25)',margin:'2px 0 0'}}>Los inactivos no pueden acceder al panel</p>
                  </div>
                  <div className={`adm-toggle${eActivo ? ' on' : ''}`} onClick={() => setEActivo(!eActivo)}>
                    <div className="adm-toggle__thumb"/>
                  </div>
                </div>
              )}
              {!miembroEdit && (
                <div className="adm-equipo-invit-info">
                  <span>📧</span>
                  <p>Se enviará un email de invitación a <strong>{eEmail || 'la dirección indicada'}</strong> con instrucciones para acceder al panel.</p>
                </div>
              )}
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn-secondary" onClick={() => setModalEquipo(false)}>Cancelar</button>
              <button className="adm-btn-primary" onClick={guardarMiembro}>
                <Check size={14} strokeWidth={2}/>
                {miembroEdit ? 'Guardar cambios' : 'Enviar invitación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL HITO ════ */}
      {modalHito && (
        <div className="adm-overlay" onClick={() => setModalHito(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal__header">
              <h3>{hitoEditando ? 'Editar hito' : 'Nuevo hito histórico'}</h3>
              <button onClick={() => setModalHito(false)}><X size={18} strokeWidth={1.8}/></button>
            </div>
            <div className="adm-modal__body">
              <div className="adm-perfil-grid" style={{marginTop:0}}>
                <div className="adm-campo">
                  <label>Año *</label>
                  <input type="number" value={hAño} onChange={e => setHAño(e.target.value)} placeholder="Ej: 2024" min="1800" max="2099"/>
                </div>
                <div className="adm-campo">
                  <label>Mes</label>
                  <select value={hMes} onChange={e => setHMes(e.target.value)}>
                    <option value="">Sin especificar</option>
                    {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="adm-campo">
                <label>Título *</label>
                <input value={hTitulo} onChange={e => setHTitulo(e.target.value)} placeholder="Ej: Lanzamiento de nueva plataforma digital"/>
              </div>
              <div className="adm-campo">
                <label>Categoría</label>
                <select value={hCat} onChange={e => setHCat(e.target.value)}>
                  <option value="">Seleccioná una categoría</option>
                  {['Fundación','Expansión','Producto','Digital','Premio','Persona clave','Tecnología','Otro'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="adm-campo">
                <label>Descripción</label>
                <textarea rows={4} value={hDesc} onChange={e => setHDesc(e.target.value)} placeholder="Contá qué pasó y por qué fue importante para la organización..."/>
              </div>
              <div className="adm-campo">
                <label>Estado de publicación</label>
                <div style={{display:'flex',gap:'8px'}}>
                  {(['borrador','publicado','incompleto'] as const).map(e => (
                    <button key={e} onClick={() => setHEstado(e)}
                      style={{
                        flex:1, padding:'8px', borderRadius:'8px', border:'none', cursor:'pointer',
                        fontFamily:'Manrope,sans-serif', fontSize:'0.72rem', fontWeight:700,
                        background: hEstado===e
                          ? e==='publicado' ? 'rgba(74,122,78,0.2)' : e==='borrador' ? 'rgba(88,166,255,0.15)' : 'rgba(248,81,73,0.12)'
                          : 'rgba(255,255,255,0.05)',
                        color: hEstado===e
                          ? e==='publicado' ? '#86efac' : e==='borrador' ? '#58a6ff' : '#f85149'
                          : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {e==='publicado'?'✓ Publicado':e==='borrador'?'Borrador':'⚠ Incompleto'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="adm-modal__toggle-row">
                <div>
                  <label>Hito destacado</label>
                  <p style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.25)',margin:'2px 0 0'}}>Se mostrará con estrella en el perfil público</p>
                </div>
                <div className={`adm-toggle${hDestacado ? ' on' : ''}`} onClick={() => setHDestacado(!hDestacado)}>
                  <div className="adm-toggle__thumb"/>
                </div>
              </div>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn-secondary" onClick={() => setModalHito(false)}>Cancelar</button>
              <button className="adm-btn-primary" onClick={guardarHito}>
                <Check size={14} strokeWidth={2}/> {hitoEditando ? 'Guardar cambios' : 'Agregar hito'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL NODO ÁRBOL ════ */}
      {modalNodo && (
        <div className="adm-overlay" onClick={() => setModalNodo(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal__header">
              <h3>{nodoEditando ? 'Editar directivo' : 'Agregar al árbol'}</h3>
              <button onClick={() => setModalNodo(false)}><X size={18} strokeWidth={1.8}/></button>
            </div>
            <div className="adm-modal__body">
              <div className="adm-campo">
                <label>Nombre completo *</label>
                <input value={nNombre} onChange={e => setNNombre(e.target.value)} placeholder="Ej: Juan Carlos Pérez"/>
              </div>
              <div className="adm-campo">
                <label>Cargo *</label>
                <input value={nCargo} onChange={e => setNCargo(e.target.value)} placeholder="Ej: Presidente, CEO, Director..."/>
              </div>
              <div className="adm-perfil-grid" style={{marginTop:0}}>
                <div className="adm-campo">
                  <label>Desde (año)</label>
                  <input value={nDesde} onChange={e => setNDesde(e.target.value)} placeholder="2024"/>
                </div>
                <div className="adm-campo">
                  <label>Hasta (año)</label>
                  <input value={nActual ? 'Actualidad' : nHasta} onChange={e => setNHasta(e.target.value)} disabled={nActual} placeholder="2028"/>
                </div>
              </div>
              <div className="adm-modal__toggle-row">
                <div>
                  <label>Actualmente en el cargo</label>
                  <p style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.25)',margin:'2px 0 0'}}>Se mostrará con badge verde</p>
                </div>
                <div className={`adm-toggle${nActual ? ' on' : ''}`} onClick={() => setNActual(!nActual)}>
                  <div className="adm-toggle__thumb"/>
                </div>
              </div>
              <div className="adm-campo">
                <label>Era / Nivel</label>
                <div style={{display:'flex', gap:'6px', flexWrap:'wrap'}}>
                  {ERA_LABELS.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => setNEra(i)}
                      style={{
                        background: nEra === i ? ERA_COLORS[i] : 'rgba(255,255,255,0.06)',
                        color: nEra === i ? '#0d1117' : 'rgba(255,255,255,0.4)',
                        border: 'none', borderRadius: '999px', padding: '4px 12px',
                        fontFamily: 'Manrope, sans-serif', fontSize: '0.65rem',
                        fontWeight: 700, cursor: 'pointer',
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <div className="adm-campo">
                <label>Reporta a</label>
                <select value={nParent} onChange={e => setNParent(e.target.value)}>
                  <option value="">Sin predecesor (raíz)</option>
                  {nodos.filter(n => n.id !== nodoEditando?.id).map(n => (
                    <option key={n.id} value={n.id}>{n.nombre} — {n.cargo}</option>
                  ))}
                </select>
              </div>
              <div className="adm-campo">
                <label>Bio breve</label>
                <textarea rows={3} value={nBio} onChange={e => setNBio(e.target.value)} placeholder="Descripción de su rol y trayectoria..."/>
              </div>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn-secondary" onClick={() => setModalNodo(false)}>Cancelar</button>
              <button className="adm-btn-primary" onClick={guardarNodo}>
                <Check size={14} strokeWidth={2}/> {nodoEditando ? 'Guardar cambios' : 'Agregar al árbol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL MULTIMEDIA LIGHTBOX ════ */}
      {modalMedia && (
        <div className="adm-overlay" onClick={() => setModalMedia(null)}>
          <div className="adm-lightbox" onClick={e => e.stopPropagation()}>
            <button className="adm-lightbox__close" onClick={() => setModalMedia(null)}>
              <X size={20} strokeWidth={1.8}/>
            </button>
            <div className="adm-lightbox__img">
              {modalMedia.url
                ? <img src={modalMedia.url} alt={modalMedia.nombre}/>
                : <div className="adm-lightbox__placeholder">
                    {modalMedia.tipo === 'video' ? '🎬' : <Image size={48} strokeWidth={1}/>}
                  </div>
              }
            </div>
            <div className="adm-lightbox__info">
              <h3>{modalMedia.nombre}</h3>
              <div className="adm-lightbox__meta">
                <span className="adm-badge adm-badge--gris">{modalMedia.categoria}</span>
                <span className="adm-badge adm-badge--azul">{modalMedia.tipo}</span>
                <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{modalMedia.tamaño}</span>
                <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{modalMedia.fecha}</span>
              </div>
              <div className="adm-lightbox__acciones">
                <button className="adm-btn-secondary" onClick={() => showToast('📋 Link copiado')}>
                  Copiar link
                </button>
                <button className="adm-btn-secondary" onClick={() => showToast('⬇️ Descargando...')}>
                  Descargar
                </button>
                <button className="adm-btn-secondary" style={{color:'rgba(248,81,73,0.8)'}}
                  onClick={() => {
                    setMediaItems(p => p.filter(m => m.id !== modalMedia.id));
                    setModalMedia(null);
                    showToast('✓ Archivo eliminado');
                  }}>
                  <Trash2 size={13} strokeWidth={1.8}/> Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL PRODUCTO ════ */}
      {modalProd && (
        <div className="adm-overlay" onClick={() => setModalProd(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal__header">
              <h3>{prodEditando ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => setModalProd(false)}><X size={18} strokeWidth={1.8}/></button>
            </div>
            <div className="adm-modal__body">
              <div className="adm-campo">
                <label>Nombre *</label>
                <input value={pProdNombre} onChange={e => setPProdNombre(e.target.value)} placeholder="Ej: BNA+ App" />
              </div>
              <div className="adm-perfil-grid">
                <div className="adm-campo">
                  <label>Año de lanzamiento</label>
                  <input type="number" value={pProdAño} onChange={e => setPProdAño(e.target.value)} placeholder="2024" />
                </div>
                <div className="adm-campo">
                  <label>Categoría</label>
                  <select value={pProdCat} onChange={e => setPProdCat(e.target.value)}>
                    <option value="">Seleccioná</option>
                    {['Créditos','Cuentas','Digital','Inversiones','Seguros','Servicios','Otro'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="adm-campo">
                <label>Descripción</label>
                <textarea rows={3} value={pProdDesc} onChange={e => setPProdDesc(e.target.value)} placeholder="Descripción breve del producto..." />
              </div>
              <div className="adm-modal__toggle-row">
                <div>
                  <label>Producto activo</label>
                  <p style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.3)',margin:'2px 0 0'}}>
                    Los inactivos se muestran como discontinuados
                  </p>
                </div>
                <div
                  className={`adm-toggle${pProdActivo ? ' on' : ''}`}
                  onClick={() => setPProdActivo(!pProdActivo)}
                >
                  <div className="adm-toggle__thumb"/>
                </div>
              </div>
            </div>
            <div className="adm-modal__footer">
              <button className="adm-btn-secondary" onClick={() => setModalProd(false)}>Cancelar</button>
              <button className="adm-btn-primary" onClick={guardarProducto}>
                <Check size={14} strokeWidth={2}/> {prodEditando ? 'Guardar cambios' : 'Agregar producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Inputs file ocultos ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <input
        ref={fileInputPerfil}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) showToast('✓ Imagen de portada actualizada');
          e.target.value = '';
        }}
      />

      {/* ── Bottom Nav Mobile ── */}
      <nav className="adm-bottom-nav">
        {[
          { id:'dashboard',  label:'Inicio',    icono:'📊' },
          { id:'hitos',      label:'Hitos',     icono:'📌' },
          { id:'equipo',     label:'Equipo',    icono:'👥' },
          { id:'multimedia', label:'Media',     icono:'🖼️' },
          { id:'plan',       label:'Plan',      icono:'💳' },
        ].map(item => (
          <button
            key={item.id}
            className={`adm-bottom-nav__item${modulo === item.id ? ' active' : ''}`}
            onClick={() => setModulo(item.id as any)}
          >
            <span style={{fontSize:'1.1rem'}}>{item.icono}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Toast */}
      {toast && (
        <div className="adm-toast">
          <Check size={13} strokeWidth={2.5} />{toast}
        </div>
      )}

    </div>
  );
}
