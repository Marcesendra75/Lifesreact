// ============================================================
// LIFE'S — Profile.tsx
// Perfil unificado: Hero + Capítulos de vida + Números + Vínculos
// + Recuerdos + Mi legado completo (hub) + Sobre mí + Frase
// Multi-perfil por userId (ruta /perfil/:userId) + persistencia local
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity, GitBranch, Map, Image, Shield, Coins,
  Film, Zap, Hourglass, Mail, CreditCard, Lock,
  Users, LayoutDashboard, BookOpen, ArrowRight,
  UserPlus, Check, X, Send, Bell,
} from 'lucide-react';
import './Profile.scss';

// ── Tipos ──────────────────────────────────────────────────
type NivelTarjeta = 'plata' | 'oro' | 'diamante' | 'platino';
type TipoVinculo  =
  | 'pareja' | 'padre' | 'madre' | 'hijo/a'
  | 'hermano/a' | 'abuelo/a' | 'amigo/a' | 'compañero/a'
  | 'familiar' | 'colega' | 'conocido/a' | 'primo/a';

type EstadoSolicitud = 'pendiente' | 'aceptada' | 'rechazada';

interface SolicitudVinculo {
  id: string;
  deUserId: string;
  deNombre: string;
  deAvatar: string;
  paraUserId: string;
  tipo: TipoVinculo;
  mensaje: string;
  fecha: string;
  estado: EstadoSolicitud;
}

interface Capitulo {
  id: string;
  nombre: string;
  desde: number;
  hasta: number;
  color: string;
}

interface Vinculo {
  id: string;
  nombre: string;
  tipo: TipoVinculo;
  avatar: string;
  userId?: string;
}

interface Recuerdo {
  id: string;
  titulo: string;
  foto: string;
  fecha: string;
  lugar: string;
}

interface DatosPerfil {
  nombre: string;
  apellido: string;
  fraseDeLegado: string;
  bio: string;
  fechaNacimiento: string;
  ciudad: string;
  pais: string;
  trabajo: string;
  origen: string;
  nivel: NivelTarjeta;
  portada: string;
  avatar: string;
  aniosVividos: number;
  recuerdosTotal: number;
  paises: number;
  generaciones: number;
  vinculos: number;
  hitos: number;
}

interface PerfilCompleto {
  datos: DatosPerfil;
  capitulos: Capitulo[];
  vinculos: Vinculo[];
  recuerdos: Recuerdo[];
}

// ── ID por defecto (perfil "propio" cuando no hay :userId) ──
const MI_USER_ID = '1';

// ── Emojis para capítulos (se ciclan por índice) ────────────
const EMOJIS_CAPITULO = ['👶', '🎓', '💼', '🏆', '🌿', '⭐', '🌟', '💫'];

// ── Mi legado completo — hub de secciones (idéntico al Muro) ──
const SECCIONES = [
  { icono: <Activity   size={22} strokeWidth={1.6} />, label: 'Línea de Vida',      desc: 'Tu historia día a día',        path: '/linea-de-vida',     vault: false, color: '#855324', bg: 'rgba(133,83,36,0.08)'  },
  { icono: <GitBranch  size={22} strokeWidth={1.6} />, label: 'Árbol Genealógico',  desc: 'Tu linaje y raíces',           path: '/arbol-genealogico', vault: false, color: '#03192e', bg: 'rgba(3,25,46,0.06)'    },
  { icono: <Map        size={22} strokeWidth={1.6} />, label: 'Mapa del Linaje',    desc: 'Lugares de tu historia',       path: '/mapa-linaje',       vault: false, color: '#735c00', bg: 'rgba(115,92,0,0.08)'   },
  { icono: <Image      size={22} strokeWidth={1.6} />, label: 'Recuerdos',          desc: 'Fotos, videos y momentos',     path: '/feed',              vault: false, color: '#855324', bg: 'rgba(133,83,36,0.06)'  },
  { icono: <Shield     size={22} strokeWidth={1.6} />, label: 'Caja Fuerte',        desc: 'Documentos privados',          path: '/caja-fuerte',       vault: true,  color: '#C9A84C', bg: 'rgba(201,168,76,0.1)'  },
  { icono: <Coins      size={22} strokeWidth={1.6} />, label: 'Caja de Valores',    desc: 'Ahorro y herencia',            path: '/caja-de-valores',   vault: true,  color: '#C9A84C', bg: 'rgba(201,168,76,0.08)' },
  { icono: <Film       size={22} strokeWidth={1.6} />, label: 'Último Tributo',     desc: 'Tu video de despedida',        path: '/ultimo-tributo',    vault: true,  color: '#03192e', bg: 'rgba(3,25,46,0.06)'    },
  { icono: <Zap        size={22} strokeWidth={1.6} />, label: 'Ecos IA',            desc: 'Tu yo digital para el futuro', path: '/ecos/1',            vault: false, color: '#735c00', bg: 'rgba(115,92,0,0.06)'   },
  { icono: <Hourglass  size={22} strokeWidth={1.6} />, label: 'Cápsula del Tiempo', desc: 'Mensajes al futuro',           path: '/capsula-del-tiempo',vault: false, color: '#855324', bg: 'rgba(133,83,36,0.06)'  },
  { icono: <Mail       size={22} strokeWidth={1.6} />, label: 'Postal Digital',     desc: 'Enviar recuerdos físicos',     path: '/postal',            vault: false, color: '#03192e', bg: 'rgba(3,25,46,0.05)'    },
  { icono: <Users      size={22} strokeWidth={1.6} />, label: 'Vínculos',           desc: 'Seguidores y familia',         path: '/vinculos',          vault: false, color: '#855324', bg: 'rgba(133,83,36,0.06)'  },
  { icono: <CreditCard size={22} strokeWidth={1.6} />, label: 'Tarjeta del Legado', desc: 'Tu nivel y beneficios',        path: '/tarjeta-legado',    vault: false, color: '#C9A84C', bg: 'rgba(201,168,76,0.08)' },
];

// ── Base de datos de perfiles ──────────────────────────────
const PERFILES_DB: Record<string, PerfilCompleto> = {

  // ── Julian Valenzuela (perfil propio / dueño de la cuenta) ──
  '1': {
    datos: {
      nombre:          'Julian',
      apellido:        'Valenzuela',
      fraseDeLegado:   'Preservar los momentos que definen nuestra historia, uno a la vez.',
      bio:              'Archivista de recuerdos familiares. Convertí la memoria de mi familia en un legado ordenado y vivo, para que nadie olvide de dónde venimos.',
      fechaNacimiento: '1989-03-22',
      ciudad:          'Mendoza',
      pais:            'Argentina',
      trabajo:         'Archivista de Recuerdos Familiares',
      origen:          'Mendoza, Argentina',
      nivel:           'oro',
      portada:         'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1400&q=80',
      avatar:          'https://i.pravatar.cc/200?img=11',
      aniosVividos:    36,
      recuerdosTotal:  482,
      paises:          6,
      generaciones:    3,
      vinculos:        124,
      hitos:           28,
    },
    capitulos: [
      { id: '1', nombre: 'Infancia',    desde: 1989, hasta: 2001, color: '#7EC8E3' },
      { id: '2', nombre: 'Adolescencia',desde: 2002, hasta: 2007, color: '#A8D8A8' },
      { id: '3', nombre: 'Universidad', desde: 2008, hasta: 2013, color: '#C9932A' },
      { id: '4', nombre: 'Vida adulta', desde: 2014, hasta: 2025, color: '#E8847A' },
    ],
    vinculos: [
      { id: '1', nombre: 'María Valenzuela', tipo: 'hermano/a', avatar: 'https://i.pravatar.cc/100?img=5',  userId: '2' },
      { id: '2', nombre: 'Marcelo García',   tipo: 'amigo/a',   avatar: 'https://i.pravatar.cc/100?img=68', userId: '3' },
      { id: '3', nombre: 'Abuelo Pedro',     tipo: 'abuelo/a',  avatar: 'https://i.pravatar.cc/100?img=70' },
      { id: '4', nombre: 'Papá Carlos',      tipo: 'padre',     avatar: 'https://i.pravatar.cc/100?img=60' },
    ],
    recuerdos: [
      { id: '1', titulo: 'La vieja casa de campo en Segovia', foto: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80', fecha: '2010', lugar: 'Segovia' },
      { id: '2', titulo: 'Graduación en Salamanca',           foto: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80', fecha: '2013', lugar: 'Salamanca' },
      { id: '3', titulo: 'Primer archivo familiar digitalizado',foto:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', fecha: '2020', lugar: 'Mendoza' },
    ],
  },

  // ── María Valenzuela ──
  '2': {
    datos: {
      nombre:          'María',
      apellido:        'Valenzuela',
      fraseDeLegado:   'El conocimiento es el único legado que nadie te puede quitar.',
      bio:              'Docente y guardiana de los recuerdos de infancia de la familia. Creo que cada pequeño momento merece ser contado con cariño.',
      fechaNacimiento: '1992-11-08',
      ciudad:          'Mendoza',
      pais:            'Argentina',
      trabajo:         'Docente de Educación Primaria',
      origen:          'Mendoza, Argentina',
      nivel:           'plata',
      portada:         'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1400&q=80',
      avatar:          'https://i.pravatar.cc/200?img=5',
      aniosVividos:    33,
      recuerdosTotal:  215,
      paises:          3,
      generaciones:    3,
      vinculos:        87,
      hitos:           16,
    },
    capitulos: [
      { id: '1', nombre: 'Infancia',    desde: 1992, hasta: 2004, color: '#7EC8E3' },
      { id: '2', nombre: 'Adolescencia',desde: 2005, hasta: 2010, color: '#A8D8A8' },
      { id: '3', nombre: 'Docencia',    desde: 2011, hasta: 2025, color: '#9B8EC4' },
    ],
    vinculos: [
      { id: '1', nombre: 'Julian Valenzuela', tipo: 'hermano/a', avatar: 'https://i.pravatar.cc/100?img=11', userId: '1' },
      { id: '2', nombre: 'Papá Carlos',       tipo: 'padre',     avatar: 'https://i.pravatar.cc/100?img=60' },
    ],
    recuerdos: [
      { id: '1', titulo: 'El primer día de escuela',       foto: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80', fecha: '1998', lugar: 'Mendoza' },
      { id: '2', titulo: 'Mi primer aula como docente',    foto: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80', fecha: '2015', lugar: 'Mendoza' },
    ],
  },

  // ── Marcelo García ──
  '3': {
    datos: {
      nombre:          'Marcelo',
      apellido:        'García',
      fraseDeLegado:   'Viví cada momento como si fuera el último, amé como si fuera el primero.',
      bio:              'Padre, emprendedor y eterno curioso. Construí mi vida ladrillo a ladrillo, viajé por 12 países y aprendí que lo único que importa son las personas que elegís a tu lado.',
      fechaNacimiento: '1975-08-14',
      ciudad:          'Mendoza',
      pais:            'Argentina',
      trabajo:         'Broker de Seguros · Tu Seguro Salud',
      origen:          'Mendoza, Argentina',
      nivel:           'oro',
      portada:         'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80',
      avatar:          'https://i.pravatar.cc/200?img=68',
      aniosVividos:    50,
      recuerdosTotal:  847,
      paises:          12,
      generaciones:    4,
      vinculos:        238,
      hitos:           34,
    },
    capitulos: [
      { id: '1', nombre: 'Infancia',     desde: 1975, hasta: 1987, color: '#7EC8E3' },
      { id: '2', nombre: 'Adolescencia', desde: 1988, hasta: 1993, color: '#A8D8A8' },
      { id: '3', nombre: 'Juventud',     desde: 1994, hasta: 2002, color: '#C9932A' },
      { id: '4', nombre: 'Adultez',      desde: 2003, hasta: 2018, color: '#E8847A' },
      { id: '5', nombre: 'Madurez',      desde: 2019, hasta: 2025, color: '#9B8EC4' },
    ],
    vinculos: [
      { id: '1', nombre: 'Elena García',      tipo: 'pareja',    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
      { id: '2', nombre: 'Sofía García',      tipo: 'hijo/a',    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
      { id: '3', nombre: 'Lucas García',      tipo: 'hijo/a',    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
      { id: '4', nombre: 'Roberto García',    tipo: 'padre',     avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80' },
      { id: '5', nombre: 'Ana García',        tipo: 'hermano/a', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80' },
      { id: '6', nombre: 'Julian Valenzuela', tipo: 'amigo/a',   avatar: 'https://i.pravatar.cc/100?img=11', userId: '1' },
    ],
    recuerdos: [
      { id: '1', titulo: 'El día que nació Sofía', foto: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80', fecha: '2001', lugar: 'Mendoza' },
      { id: '2', titulo: 'Viaje a Patagonia',      foto: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80', fecha: '2018', lugar: 'Patagonia' },
      { id: '3', titulo: 'Primer negocio propio',  foto: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80', fecha: '2005', lugar: 'Mendoza' },
    ],
  },
};

const COLORES_DISPONIBLES = [
  '#7EC8E3', '#A8D8A8', '#C9932A', '#E8847A',
  '#9B8EC4', '#F6C90E', '#4ECDC4', '#FF6B6B',
];

const TIPOS_VINCULO: TipoVinculo[] = [
  'pareja', 'padre', 'madre', 'hijo/a',
  'hermano/a', 'abuelo/a', 'amigo/a', 'compañero/a',
  'familiar', 'colega', 'conocido/a', 'primo/a',
];

// Íconos y etiquetas por tipo de vínculo
const VINCULO_CONFIG: Record<TipoVinculo, { emoji: string; label: string; categoria: string }> = {
  'pareja':     { emoji: '💑', label: 'Pareja',      categoria: 'familiar' },
  'padre':      { emoji: '👨‍👧', label: 'Padre',       categoria: 'familiar' },
  'madre':      { emoji: '👩‍👧', label: 'Madre',       categoria: 'familiar' },
  'hijo/a':     { emoji: '👶', label: 'Hijo/a',      categoria: 'familiar' },
  'hermano/a':  { emoji: '🧑‍🤝‍🧑', label: 'Hermano/a',  categoria: 'familiar' },
  'abuelo/a':   { emoji: '👴', label: 'Abuelo/a',    categoria: 'familiar' },
  'primo/a':    { emoji: '🫂', label: 'Primo/a',     categoria: 'familiar' },
  'familiar':   { emoji: '👨‍👩‍👧‍👦', label: 'Familiar',   categoria: 'familiar' },
  'amigo/a':    { emoji: '💛', label: 'Amigo/a',     categoria: 'social'   },
  'conocido/a': { emoji: '🤝', label: 'Conocido/a',  categoria: 'social'   },
  'compañero/a':{ emoji: '🙌', label: 'Compañero/a', categoria: 'social'   },
  'colega':     { emoji: '💼', label: 'Colega',      categoria: 'trabajo'  },
};

// Clave localStorage para solicitudes
const SOLICITUDES_KEY = 'lifes_vinculos_solicitudes';

function cargarSolicitudes(): SolicitudVinculo[] {
  try {
    const raw = localStorage.getItem(SOLICITUDES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function guardarSolicitudes(sols: SolicitudVinculo[]) {
  try {
    localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(sols));
  } catch {}
}

const NIVEL_CONFIG = {
  plata:    { label: 'Plata',    color: '#C0C0C0', bg: 'rgba(192,192,192,0.15)' },
  oro:      { label: 'Oro',      color: '#C9932A', bg: 'rgba(201,147,42,0.15)'  },
  diamante: { label: 'Diamante', color: '#7EC8E3', bg: 'rgba(126,200,227,0.15)' },
  platino:  { label: 'Platino',  color: '#9B8EC4', bg: 'rgba(155,142,196,0.15)' },
};

// ── Persistencia local ──────────────────────────────────────
const STORAGE_KEY = 'lifes_perfiles';

function cargarPerfilGuardado(userId: string): PerfilCompleto | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const todos = JSON.parse(raw);
    return todos[userId] || null;
  } catch {
    return null;
  }
}

function guardarPerfilLocal(userId: string, perfil: PerfilCompleto) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const todos = raw ? JSON.parse(raw) : {};
    todos[userId] = perfil;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // localStorage no disponible — falla silenciosa
  }
}

function obtenerPerfilBase(userId: string): PerfilCompleto {
  const guardado = cargarPerfilGuardado(userId);
  if (guardado) return guardado;
  return PERFILES_DB[userId] || PERFILES_DB[MI_USER_ID];
}

// ── Componente principal ───────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();
  const { userId: userIdParam } = useParams<{ userId?: string }>();
  const userId = userIdParam || MI_USER_ID;
  const esPropio = userId === MI_USER_ID;

  const base = obtenerPerfilBase(userId);

  const [perfil,    setPerfil]    = useState<DatosPerfil>(base.datos);
  const [capitulos, setCapitulos] = useState<Capitulo[]>(base.capitulos);
  const [vinculos,  setVinculos]  = useState<Vinculo[]>(base.vinculos);
  const [recuerdos, setRecuerdos] = useState<Recuerdo[]>(base.recuerdos);

  // Recargar datos cuando cambia el userId de la URL
  useEffect(() => {
    const nuevoBase = obtenerPerfilBase(userId);
    setPerfil(nuevoBase.datos);
    setCapitulos(nuevoBase.capitulos);
    setVinculos(nuevoBase.vinculos);
    setRecuerdos(nuevoBase.recuerdos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ── Estado modal solicitud de vínculo ──────────────────────
  const [modalSolicitud, setModalSolicitud]   = useState(false);
  const [tipoSolicitud,  setTipoSolicitud]    = useState<TipoVinculo>('conocido/a');
  const [mensajeSolicitud, setMensajeSolicitud] = useState('');
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [solicitudes, setSolicitudes]           = useState<SolicitudVinculo[]>(cargarSolicitudes);

  // ── Panel notificaciones ────────────────────────────────────
  const [panelNotif, setPanelNotif] = useState(false);

  // Solicitudes recibidas para el perfil propio (userId === MI_USER_ID)
  const solicitudesRecibidas = solicitudes.filter(
    s => s.paraUserId === MI_USER_ID && s.estado === 'pendiente'
  );

  // ¿Ya es vínculo o ya envié solicitud?
  const yaEsVinculo = vinculos.some(v => v.userId === userId);
  const solicitudPendiente = solicitudes.some(
    s => s.deUserId === MI_USER_ID && s.paraUserId === userId && s.estado === 'pendiente'
  );

  // ── Enviar solicitud ────────────────────────────────────────
  const enviarSolicitud = () => {
    const nueva: SolicitudVinculo = {
      id:         Date.now().toString(),
      deUserId:   MI_USER_ID,
      deNombre:   PERFILES_DB[MI_USER_ID].datos.nombre + ' ' + PERFILES_DB[MI_USER_ID].datos.apellido,
      deAvatar:   PERFILES_DB[MI_USER_ID].datos.avatar,
      paraUserId: userId,
      tipo:       tipoSolicitud,
      mensaje:    mensajeSolicitud,
      fecha:      new Date().toISOString(),
      estado:     'pendiente',
    };
    const nuevas = [...solicitudes, nueva];
    setSolicitudes(nuevas);
    guardarSolicitudes(nuevas);
    setSolicitudEnviada(true);
    setTimeout(() => {
      setModalSolicitud(false);
      setSolicitudEnviada(false);
      setMensajeSolicitud('');
    }, 2000);
  };

  // ── Responder solicitud recibida ────────────────────────────
  const responderSolicitud = (id: string, accion: 'aceptada' | 'rechazada') => {
    const actualizadas = solicitudes.map(s =>
      s.id === id ? { ...s, estado: accion } : s
    );
    setSolicitudes(actualizadas);
    guardarSolicitudes(actualizadas);

    // Si acepta → agregar al listado de vínculos local
    if (accion === 'aceptada') {
      const sol = solicitudes.find(s => s.id === id);
      if (sol) {
        const nuevoVinculo: Vinculo = {
          id:     Date.now().toString(),
          nombre: sol.deNombre,
          tipo:   sol.tipo,
          avatar: sol.deAvatar,
          userId: sol.deUserId,
        };
        const nuevosVinculos = [...vinculos, nuevoVinculo];
        setVinculos(nuevosVinculos);
        guardarPerfilLocal(MI_USER_ID, {
          datos: perfil,
          capitulos,
          vinculos: nuevosVinculos,
          recuerdos,
        });
      }
    }
  };

  // Drawer edición
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [drawerSeccion, setDrawerSeccion] = useState<'perfil' | 'capitulos' | 'vinculos'>('perfil');

  // Edición temporal (se aplica al guardar)
  const [editPerfil,    setEditPerfil]    = useState<DatosPerfil>(base.datos);
  const [editCapitulos, setEditCapitulos] = useState<Capitulo[]>(base.capitulos);
  const [editVinculos,  setEditVinculos]  = useState<Vinculo[]>(base.vinculos);

  // ── Abrir drawer ──
  const abrirDrawer = (seccion: typeof drawerSeccion) => {
    setEditPerfil({ ...perfil });
    setEditCapitulos(capitulos.map(c => ({ ...c })));
    setEditVinculos(vinculos.map(v => ({ ...v })));
    setDrawerSeccion(seccion);
    setDrawerAbierto(true);
  };

  // ── Guardar cambios (persiste en localStorage) ──
  const guardar = () => {
    const nuevoPerfil: PerfilCompleto = {
      datos: { ...editPerfil },
      capitulos: [...editCapitulos],
      vinculos: [...editVinculos],
      recuerdos: [...recuerdos],
    };
    setPerfil(nuevoPerfil.datos);
    setCapitulos(nuevoPerfil.capitulos);
    setVinculos(nuevoPerfil.vinculos);
    guardarPerfilLocal(userId, nuevoPerfil);
    setDrawerAbierto(false);
  };

  // ── Capítulos: agregar / editar / borrar ──
  const agregarCapitulo = () => {
    const ultimo = editCapitulos[editCapitulos.length - 1];
    const desde  = ultimo ? ultimo.hasta + 1 : new Date().getFullYear();
    setEditCapitulos([...editCapitulos, {
      id:     Date.now().toString(),
      nombre: 'Nuevo capítulo',
      desde,
      hasta:  desde + 5,
      color:  COLORES_DISPONIBLES[editCapitulos.length % COLORES_DISPONIBLES.length],
    }]);
  };

  const actualizarCapitulo = (id: string, campo: keyof Capitulo, valor: string | number) => {
    setEditCapitulos(editCapitulos.map(c =>
      c.id === id ? { ...c, [campo]: valor } : c
    ));
  };

  const eliminarCapitulo = (id: string) => {
    setEditCapitulos(editCapitulos.filter(c => c.id !== id));
  };

  // ── Vínculos: agregar / editar / borrar ──
  const agregarVinculo = () => {
    setEditVinculos([...editVinculos, {
      id:     Date.now().toString(),
      nombre: '',
      tipo:   'amigo/a',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80`,
    }]);
  };

  const actualizarVinculo = (id: string, campo: keyof Vinculo, valor: string) => {
    setEditVinculos(editVinculos.map(v =>
      v.id === id ? { ...v, [campo]: valor } : v
    ));
  };

  const eliminarVinculo = (id: string) => {
    setEditVinculos(editVinculos.filter(v => v.id !== id));
  };

  // ── Navegar al perfil de un vínculo (si tiene userId) ──
  const irAVinculo = (v: Vinculo) => {
    if (v.userId) navigate(`/perfil/${v.userId}`);
  };

  const nivelCfg = NIVEL_CONFIG[perfil.nivel];

  return (
    <div className="profile-page with-navbar">

      {/* ════════════════════════════════════════════════
          ① HERO
      ════════════════════════════════════════════════ */}
      <div className="profile-hero">
        <div
          className="profile-hero__portada"
          style={{ backgroundImage: `url(${perfil.portada})` }}
        >
          <div className="profile-hero__portada-overlay" />
        </div>

        <div className="profile-hero__contenido">
          <div className="profile-hero__avatar-wrap">
            <div
              className="profile-hero__nivel-ring"
              style={{ '--nivel-color': nivelCfg.color } as React.CSSProperties}
            >
              <img
                src={perfil.avatar}
                alt={perfil.nombre}
                className="profile-hero__avatar"
              />
            </div>
            <div
              className="profile-hero__nivel-badge"
              style={{ background: nivelCfg.bg, color: nivelCfg.color }}
            >
              {nivelCfg.label}
            </div>
          </div>

          <div className="profile-hero__info">
            <h1 className="profile-hero__nombre">
              {perfil.nombre} {perfil.apellido}
            </h1>
            <p className="profile-hero__frase">"{perfil.fraseDeLegado}"</p>
            <div className="profile-hero__meta">
              {perfil.ciudad && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {perfil.ciudad}, {perfil.pais}
                </span>
              )}
              {perfil.trabajo && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  {perfil.trabajo}
                </span>
              )}
              {perfil.fechaNacimiento && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {new Date(perfil.fechaNacimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          <div className="profile-hero__acciones">
            {esPropio ? (
              <>
                {/* Campana de notificaciones */}
                <button
                  className="profile-hero__notif-btn"
                  onClick={() => setPanelNotif(!panelNotif)}
                >
                  <Bell size={16} strokeWidth={2} />
                  {solicitudesRecibidas.length > 0 && (
                    <span className="profile-hero__notif-badge">
                      {solicitudesRecibidas.length}
                    </span>
                  )}
                </button>
                <button
                  className="profile-hero__editar"
                  onClick={() => abrirDrawer('perfil')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar perfil
                </button>
              </>
            ) : (
              /* Botón conectar para perfiles ajenos */
              yaEsVinculo ? (
                <div className="profile-hero__ya-vinculado">
                  <Check size={14} strokeWidth={2.5} />
                  Conectados
                </div>
              ) : solicitudPendiente ? (
                <div className="profile-hero__solicitud-enviada">
                  <Send size={13} strokeWidth={2} />
                  Solicitud enviada
                </div>
              ) : (
                <button
                  className="profile-hero__conectar"
                  onClick={() => setModalSolicitud(true)}
                >
                  <UserPlus size={15} strokeWidth={2} />
                  Conectar
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          ② NÚMEROS CON ALMA
      ════════════════════════════════════════════════ */}
      <section className="profile-numeros">
        {[
          { valor: perfil.aniosVividos,    label: 'Años vividos',    icono: '⏳', ruta: null },
          { valor: perfil.recuerdosTotal,  label: 'Recuerdos',       icono: '📸', ruta: `/linea-de-vida/${userId}` },
          { valor: perfil.paises,          label: 'Países',          icono: '🌍', ruta: null },
          { valor: perfil.generaciones,    label: 'Generaciones',    icono: '🌳', ruta: `/arbol-genealogico/${userId}` },
          { valor: perfil.vinculos,        label: 'Vínculos',        icono: '🤝', ruta: null },
          { valor: perfil.hitos,           label: 'Hitos de vida',   icono: '⭐', ruta: `/linea-de-vida/${userId}` },
        ].map((m, i) => (
          <div
            key={i}
            className={`profile-metrica${m.ruta ? ' profile-metrica--link' : ''}`}
            onClick={() => m.ruta && navigate(m.ruta)}
          >
            <span className="profile-metrica__icono">{m.icono}</span>
            <span className="profile-metrica__valor">{m.valor.toLocaleString('es-AR')}</span>
            <span className="profile-metrica__label">{m.label}</span>
            {m.ruta && (
              <span className="profile-metrica__arrow">→</span>
            )}
          </div>
        ))}
      </section>

      {/* ════════════════════════════════════════════════
          ③ CAPÍTULOS DE VIDA
      ════════════════════════════════════════════════ */}
      <section className="profile-capitulos-sec">
        <div className="profile-barra-header">
          <div>
            <span className="profile-seccion-eyebrow">
              {esPropio ? 'Tu historia' : 'Su historia'}
            </span>
            <h2 className="profile-seccion-titulo">
              <BookOpen size={18} strokeWidth={1.8} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Capítulos de vida
            </h2>
          </div>
          {esPropio ? (
            <button
              className="profile-btn-editar-sec"
              onClick={() => abrirDrawer('capitulos')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar capítulos
            </button>
          ) : (
            <button
              className="profile-btn-ver"
              onClick={() => navigate(`/linea-de-vida/${userId}`)}
            >
              Ver todo →
            </button>
          )}
        </div>

        <div className="profile-capitulos">
          {capitulos.map((c, i) => (
            <button
              key={c.id}
              className="profile-capitulo"
              style={{ borderColor: c.color }}
              onClick={() => navigate(`/linea-de-vida/${userId}?epoca=${c.id}`)}
            >
              <span className="profile-capitulo__emoji">{EMOJIS_CAPITULO[i % EMOJIS_CAPITULO.length]}</span>
              <span className="profile-capitulo__label">{c.nombre}</span>
              <span className="profile-capitulo__años">{c.desde} – {c.hasta}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          ④ MIS VÍNCULOS
      ════════════════════════════════════════════════ */}
      <section className="profile-vinculos-sec">
        <div className="profile-barra-header">
          <div>
            <span className="profile-seccion-eyebrow">Las personas que importan</span>
            <h2 className="profile-seccion-titulo">
              {esPropio ? 'Mis Vínculos' : 'Vínculos'}
            </h2>
          </div>
          {esPropio && (
            <button
              className="profile-btn-editar-sec"
              onClick={() => abrirDrawer('vinculos')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
          )}
        </div>

        <div className="profile-vinculos-grid">
          {vinculos.map(v => (
            <div
              key={v.id}
              className="profile-vinculo-card"
              onClick={() => irAVinculo(v)}
              style={{ cursor: v.userId ? 'pointer' : 'default' }}
              title={v.userId ? `Ver perfil de ${v.nombre}` : undefined}
            >
              <img
                src={v.avatar}
                alt={v.nombre}
                className="profile-vinculo-card__avatar"
              />
              <span className="profile-vinculo-card__nombre">{v.nombre}</span>
              <span className="profile-vinculo-card__tipo">{v.tipo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          ⑤ RECUERDOS DESTACADOS
      ════════════════════════════════════════════════ */}
      <section className="profile-recuerdos-sec">
        <div className="profile-barra-header">
          <div>
            <span className="profile-seccion-eyebrow">Los más especiales</span>
            <h2 className="profile-seccion-titulo">Recuerdos Destacados</h2>
          </div>
          <button
            className="profile-btn-ver"
            onClick={() => navigate(`/linea-de-vida/${userId}`)}
          >
            Ver todos →
          </button>
        </div>

        <div className="profile-recuerdos-grid">
          {recuerdos.map((r, i) => (
            <div
              key={r.id}
              className={`profile-recuerdo${i === 0 ? ' profile-recuerdo--grande' : ''}`}
              onClick={() => navigate(`/linea-de-vida/${userId}`)}
            >
              <img src={r.foto} alt={r.titulo} />
              <div className="profile-recuerdo__overlay">
                <span className="profile-recuerdo__titulo">{r.titulo}</span>
                <span className="profile-recuerdo__meta">{r.fecha} · {r.lugar}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          ⑥ MI LEGADO COMPLETO (hub — solo perfil propio)
      ════════════════════════════════════════════════ */}
      {esPropio && (
        <section className="profile-hub-sec">
          <div className="profile-barra-header">
            <div>
              <span className="profile-seccion-eyebrow">El mapa de tu legado</span>
              <h2 className="profile-seccion-titulo">
                <LayoutDashboard size={18} strokeWidth={1.8} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Mi legado completo
              </h2>
            </div>
          </div>
          <div className="profile-hub-grid">
            {SECCIONES.map(s => (
              <button
                key={s.path}
                className="profile-hub-item"
                onClick={() => navigate(s.path)}
                style={{ background: s.bg }}
              >
                <div className="profile-hub-item__icon-wrap" style={{ color: s.color }}>
                  {s.icono}
                  {s.vault && (
                    <span className="profile-hub-item__lock">
                      <Lock size={10} strokeWidth={2.5} />
                    </span>
                  )}
                </div>
                <span className="profile-hub-item__label">{s.label}</span>
                <span className="profile-hub-item__desc">{s.desc}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════
          ⑦ SOBRE MÍ
      ════════════════════════════════════════════════ */}
      <section className="profile-sobre">
        <div className="profile-barra-header">
          <div>
            <span className="profile-seccion-eyebrow">
              {esPropio ? 'Mi historia' : 'Su historia'}
            </span>
            <h2 className="profile-seccion-titulo">
              {esPropio ? 'Sobre mí' : `Sobre ${perfil.nombre}`}
            </h2>
          </div>
          {esPropio && (
            <button
              className="profile-btn-editar-sec"
              onClick={() => abrirDrawer('perfil')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Editar
            </button>
          )}
        </div>
        <p className="profile-sobre__bio">{perfil.bio}</p>
        <div className="profile-sobre__datos">
          {[
            { icono: '📅', label: 'Nacimiento', valor: new Date(perfil.fechaNacimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { icono: '📍', label: 'Ciudad',     valor: `${perfil.ciudad}, ${perfil.pais}` },
            { icono: '💼', label: 'Trabajo',    valor: perfil.trabajo },
            { icono: '🌱', label: 'Origen',     valor: perfil.origen },
          ].map((d, i) => (
            <div key={i} className="profile-sobre__dato">
              <span className="profile-sobre__dato-icono">{d.icono}</span>
              <div>
                <span className="profile-sobre__dato-label">{d.label}</span>
                <span className="profile-sobre__dato-valor">{d.valor}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          ⑧ FRASE DE LEGADO
      ════════════════════════════════════════════════ */}
      <section className="profile-legado">
        <div className="profile-legado__comillas">"</div>
        <p className="profile-legado__frase">{perfil.fraseDeLegado}</p>
        <span className="profile-legado__firma">— {perfil.nombre} {perfil.apellido}</span>
      </section>


      {/* ════════════════════════════════════════════════
          PANEL DE NOTIFICACIONES (solicitudes recibidas)
      ════════════════════════════════════════════════ */}
      {panelNotif && esPropio && (
        <div className="profile-notif-overlay" onClick={() => setPanelNotif(false)}>
          <div className="profile-notif-panel" onClick={e => e.stopPropagation()}>
            <div className="profile-notif-panel__header">
              <Bell size={16} strokeWidth={2} />
              <h3>Solicitudes de vínculo</h3>
              <button onClick={() => setPanelNotif(false)}>
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {solicitudesRecibidas.length === 0 ? (
              <div className="profile-notif-panel__empty">
                <span>🎉</span>
                <p>No tenés solicitudes pendientes</p>
              </div>
            ) : (
              <div className="profile-notif-panel__lista">
                {solicitudesRecibidas.map(sol => (
                  <div key={sol.id} className="profile-notif-item">
                    <img src={sol.deAvatar} alt={sol.deNombre} className="profile-notif-item__avatar" />
                    <div className="profile-notif-item__info">
                      <span className="profile-notif-item__nombre">{sol.deNombre}</span>
                      <span className="profile-notif-item__tipo">
                        {VINCULO_CONFIG[sol.tipo]?.emoji} quiere conectar como{' '}
                        <strong>{VINCULO_CONFIG[sol.tipo]?.label}</strong>
                      </span>
                      {sol.mensaje && (
                        <p className="profile-notif-item__mensaje">"{sol.mensaje}"</p>
                      )}
                    </div>
                    <div className="profile-notif-item__acciones">
                      <button
                        className="profile-notif-item__aceptar"
                        onClick={() => responderSolicitud(sol.id, 'aceptada')}
                      >
                        <Check size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        className="profile-notif-item__rechazar"
                        onClick={() => responderSolicitud(sol.id, 'rechazada')}
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          MODAL DE SOLICITUD DE VÍNCULO
      ════════════════════════════════════════════════ */}
      {modalSolicitud && !esPropio && (
        <div className="profile-modal-overlay" onClick={() => setModalSolicitud(false)}>
          <div className="profile-modal-solicitud" onClick={e => e.stopPropagation()}>

            {solicitudEnviada ? (
              /* ── Estado éxito ── */
              <div className="profile-modal-solicitud__exito">
                <div className="profile-modal-solicitud__exito-icon">✅</div>
                <h3>¡Solicitud enviada!</h3>
                <p>{perfil.nombre} recibirá tu solicitud de vínculo.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="profile-modal-solicitud__header">
                  <img
                    src={perfil.avatar}
                    alt={perfil.nombre}
                    className="profile-modal-solicitud__avatar"
                  />
                  <div>
                    <h3>Conectar con {perfil.nombre}</h3>
                    <p>Elegí cómo te relacionás con esta persona</p>
                  </div>
                  <button
                    className="profile-modal-solicitud__cerrar"
                    onClick={() => setModalSolicitud(false)}
                  >
                    <X size={18} strokeWidth={2} />
                  </button>
                </div>

                {/* Selector de tipo */}
                <div className="profile-modal-solicitud__tipos">
                  <label className="profile-modal-solicitud__label">Tipo de vínculo</label>
                  <div className="profile-modal-solicitud__grid">
                    {(TIPOS_VINCULO).map(tipo => {
                      const cfg = VINCULO_CONFIG[tipo];
                      return (
                        <button
                          key={tipo}
                          className={`profile-modal-solicitud__tipo-btn${tipoSolicitud === tipo ? ' active' : ''}`}
                          onClick={() => setTipoSolicitud(tipo)}
                        >
                          <span className="profile-modal-solicitud__tipo-emoji">{cfg.emoji}</span>
                          <span className="profile-modal-solicitud__tipo-label">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mensaje opcional */}
                <div className="profile-modal-solicitud__mensaje-wrap">
                  <label className="profile-modal-solicitud__label">
                    Mensaje (opcional)
                  </label>
                  <textarea
                    className="profile-modal-solicitud__textarea"
                    placeholder={`Hola ${perfil.nombre}, me gustaría conectar con vos...`}
                    value={mensajeSolicitud}
                    onChange={e => setMensajeSolicitud(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                  <span className="profile-modal-solicitud__contador">
                    {mensajeSolicitud.length}/200
                  </span>
                </div>

                {/* Botón enviar */}
                <button
                  className="profile-modal-solicitud__enviar"
                  onClick={enviarSolicitud}
                >
                  <Send size={15} strokeWidth={2} />
                  Enviar solicitud de vínculo
                </button>

                <p className="profile-modal-solicitud__nota">
                  {perfil.nombre} podrá aceptar, rechazar o cambiar el tipo de vínculo.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          DRAWER DE EDICIÓN (solo perfil propio)
      ════════════════════════════════════════════════ */}
      {drawerAbierto && esPropio && (
        <div className="profile-drawer-overlay" onClick={() => setDrawerAbierto(false)}>
          <aside
            className="profile-drawer"
            onClick={e => e.stopPropagation()}
          >
            {/* Header drawer */}
            <div className="profile-drawer__header">
              <div className="profile-drawer__tabs">
                {([
                  { id: 'perfil',    label: 'Perfil'          },
                  { id: 'capitulos', label: 'Capítulos'       },
                  { id: 'vinculos',  label: 'Vínculos'        },
                ] as const).map(t => (
                  <button
                    key={t.id}
                    className={`profile-drawer__tab${drawerSeccion === t.id ? ' active' : ''}`}
                    onClick={() => setDrawerSeccion(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                className="profile-drawer__cerrar"
                onClick={() => setDrawerAbierto(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Contenido drawer */}
            <div className="profile-drawer__body">

              {/* ── Tab Perfil ── */}
              {drawerSeccion === 'perfil' && (
                <div className="profile-drawer__form">
                  <div className="profile-drawer__grupo">
                    <label>Nombre</label>
                    <input
                      value={editPerfil.nombre}
                      onChange={e => setEditPerfil({ ...editPerfil, nombre: e.target.value })}
                    />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Apellido</label>
                    <input
                      value={editPerfil.apellido}
                      onChange={e => setEditPerfil({ ...editPerfil, apellido: e.target.value })}
                    />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Frase de legado</label>
                    <textarea
                      rows={3}
                      value={editPerfil.fraseDeLegado}
                      onChange={e => setEditPerfil({ ...editPerfil, fraseDeLegado: e.target.value })}
                    />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Bio</label>
                    <textarea
                      rows={4}
                      value={editPerfil.bio}
                      onChange={e => setEditPerfil({ ...editPerfil, bio: e.target.value })}
                    />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Fecha de nacimiento</label>
                    <input
                      type="date"
                      value={editPerfil.fechaNacimiento}
                      onChange={e => setEditPerfil({ ...editPerfil, fechaNacimiento: e.target.value })}
                    />
                  </div>
                  <div className="profile-drawer__grid2">
                    <div className="profile-drawer__grupo">
                      <label>Ciudad</label>
                      <input
                        value={editPerfil.ciudad}
                        onChange={e => setEditPerfil({ ...editPerfil, ciudad: e.target.value })}
                      />
                    </div>
                    <div className="profile-drawer__grupo">
                      <label>País</label>
                      <input
                        value={editPerfil.pais}
                        onChange={e => setEditPerfil({ ...editPerfil, pais: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Trabajo / Ocupación</label>
                    <input
                      value={editPerfil.trabajo}
                      onChange={e => setEditPerfil({ ...editPerfil, trabajo: e.target.value })}
                    />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Origen</label>
                    <input
                      value={editPerfil.origen}
                      onChange={e => setEditPerfil({ ...editPerfil, origen: e.target.value })}
                    />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>URL Avatar</label>
                    <input
                      value={editPerfil.avatar}
                      onChange={e => setEditPerfil({ ...editPerfil, avatar: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>URL Foto de portada</label>
                    <input
                      value={editPerfil.portada}
                      onChange={e => setEditPerfil({ ...editPerfil, portada: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              {/* ── Tab Capítulos ── */}
              {drawerSeccion === 'capitulos' && (
                <div className="profile-drawer__form">
                  <p className="profile-drawer__hint">
                    Definí los capítulos de tu vida. Cada uno tiene un nombre, rango de años y color de acento.
                  </p>
                  {editCapitulos.map((c, i) => (
                    <div key={c.id} className="profile-drawer__capitulo">
                      <div className="profile-drawer__capitulo-header">
                        <span
                          className="profile-drawer__capitulo-color"
                          style={{ background: c.color }}
                        />
                        <span className="profile-drawer__capitulo-num">Capítulo {i + 1}</span>
                        <button
                          className="profile-drawer__capitulo-del"
                          onClick={() => eliminarCapitulo(c.id)}
                        >✕</button>
                      </div>
                      <div className="profile-drawer__grupo">
                        <label>Nombre del capítulo</label>
                        <input
                          value={c.nombre}
                          onChange={e => actualizarCapitulo(c.id, 'nombre', e.target.value)}
                        />
                      </div>
                      <div className="profile-drawer__grid2">
                        <div className="profile-drawer__grupo">
                          <label>Desde (año)</label>
                          <input
                            type="number"
                            value={c.desde}
                            onChange={e => actualizarCapitulo(c.id, 'desde', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="profile-drawer__grupo">
                          <label>Hasta (año)</label>
                          <input
                            type="number"
                            value={c.hasta}
                            onChange={e => actualizarCapitulo(c.id, 'hasta', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="profile-drawer__grupo">
                        <label>Color</label>
                        <div className="profile-drawer__colores">
                          {COLORES_DISPONIBLES.map(col => (
                            <button
                              key={col}
                              className={`profile-drawer__color-chip${c.color === col ? ' active' : ''}`}
                              style={{ background: col }}
                              onClick={() => actualizarCapitulo(c.id, 'color', col)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    className="profile-drawer__add"
                    onClick={agregarCapitulo}
                  >
                    + Agregar capítulo
                  </button>
                </div>
              )}

              {/* ── Tab Vínculos ── */}
              {drawerSeccion === 'vinculos' && (
                <div className="profile-drawer__form">
                  <p className="profile-drawer__hint">
                    Las personas más importantes de tu vida. Podés agregar hasta 8.
                  </p>
                  {editVinculos.map(v => (
                    <div key={v.id} className="profile-drawer__vinculo">
                      <div className="profile-drawer__vinculo-header">
                        <img src={v.avatar} alt={v.nombre} className="profile-drawer__vinculo-avatar" />
                        <button
                          className="profile-drawer__capitulo-del"
                          onClick={() => eliminarVinculo(v.id)}
                        >✕</button>
                      </div>
                      <div className="profile-drawer__grupo">
                        <label>Nombre completo</label>
                        <input
                          value={v.nombre}
                          placeholder="Nombre y apellido"
                          onChange={e => actualizarVinculo(v.id, 'nombre', e.target.value)}
                        />
                      </div>
                      <div className="profile-drawer__grupo">
                        <label>Tipo de vínculo</label>
                        <select
                          value={v.tipo}
                          onChange={e => actualizarVinculo(v.id, 'tipo', e.target.value)}
                        >
                          {TIPOS_VINCULO.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {editVinculos.length < 8 && (
                    <button
                      className="profile-drawer__add"
                      onClick={agregarVinculo}
                    >
                      + Agregar vínculo
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer drawer */}
            <div className="profile-drawer__footer">
              <button
                className="profile-drawer__cancelar"
                onClick={() => setDrawerAbierto(false)}
              >
                Cancelar
              </button>
              <button
                className="profile-drawer__guardar"
                onClick={guardar}
              >
                Guardar cambios
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
