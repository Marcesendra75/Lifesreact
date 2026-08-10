// ============================================================
// LIFE'S — LifesAdmin.tsx | Panel de Administración General
// RBAC completo — sidebar dinámico según rol
// Lucide React | SCSS | Sin navbar externa
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, UserCog, BarChart3,
  Settings, Bell, Search, LogOut, ChevronRight, Eye,
  TrendingUp, HardDrive, Shield, AlertTriangle, Check,
  Clock, Crown, Star, Activity, Package, X, Edit2,
  FileText, Trash2, CheckCircle, XCircle, MoreVertical,
  Lock, Mail, Calendar, MapPin, Briefcase, GitBranch,
  RefreshCw, Download, Filter,
} from 'lucide-react';
import './LifesAdmin.scss';
import MetricasPanel from '../MetricasPanel/MetricasPanel';

// ── Tipos ──────────────────────────────────────────────────
type RolUsuario = 'Superadmin' | 'Administrador' | 'Supervisor de Área' | 'Facilitador de Admisión' | 'Creador';

type ModuloId =
  | 'dashboard' | 'empresas' | 'usuarios' | 'equipo'
  | 'metricas' | 'config' | 'logs';

interface NavItemLA {
  id: ModuloId;
  label: string;
  icono: React.ReactNode;
  badge?: number;
  roles: RolUsuario[];
  grupo: string;
}

interface UsuarioSesion {
  nombre: string;
  email: string;
  rol: RolUsuario;
  color: string;
}

// ── Configuración de roles y colores ───────────────────────
const ROL_COLORS: Record<RolUsuario, string> = {
  'Superadmin':              '#C9932A',
  'Administrador':           '#3a5a8a',
  'Supervisor de Área':      '#4a7a4e',
  'Facilitador de Admisión': '#855324',
  'Creador':                 '#58a6ff',
};

const ROL_ICONS: Record<RolUsuario, React.ReactNode> = {
  'Superadmin':              <Crown     size={12} strokeWidth={2}/>,
  'Administrador':           <Shield    size={12} strokeWidth={2}/>,
  'Supervisor de Área':      <Eye       size={12} strokeWidth={2}/>,
  'Facilitador de Admisión': <CheckCircle size={12} strokeWidth={2}/>,
  'Creador':                 <GitBranch size={12} strokeWidth={2}/>,
};

// ── Nav items con control de roles ─────────────────────────
const NAV_ITEMS: NavItemLA[] = [
  {
    id: 'dashboard', label: 'Dashboard', grupo: 'principal',
    icono: <LayoutDashboard size={17} strokeWidth={1.8}/>,
    roles: ['Superadmin','Administrador','Supervisor de Área','Facilitador de Admisión','Creador'],
  },
  {
    id: 'empresas', label: 'Empresas', grupo: 'gestion', badge: 5,
    icono: <Building2 size={17} strokeWidth={1.8}/>,
    roles: ['Superadmin','Administrador','Supervisor de Área','Facilitador de Admisión'],
  },
  {
    id: 'usuarios', label: 'Usuarios', grupo: 'gestion',
    icono: <Users size={17} strokeWidth={1.8}/>,
    roles: ['Superadmin','Administrador','Supervisor de Área'],
  },
  {
    id: 'equipo', label: 'Equipo interno', grupo: 'gestion',
    icono: <UserCog size={17} strokeWidth={1.8}/>,
    roles: ['Superadmin','Administrador'],
  },
  {
    id: 'metricas', label: 'Métricas', grupo: 'analisis',
    icono: <BarChart3 size={17} strokeWidth={1.8}/>,
    roles: ['Superadmin','Administrador','Supervisor de Área'],
  },
  {
    id: 'logs', label: 'Log de accesos', grupo: 'analisis',
    icono: <Activity size={17} strokeWidth={1.8}/>,
    roles: ['Superadmin','Administrador'],
  },
  {
    id: 'config', label: 'Configuración', grupo: 'sistema',
    icono: <Settings size={17} strokeWidth={1.8}/>,
    roles: ['Superadmin'],
  },
];

const GRUPO_LABELS: Record<string, string> = {
  principal: 'Principal',
  gestion:   'Gestión',
  analisis:  'Análisis',
  sistema:   'Sistema',
};


// ── Datos mock métricas ────────────────────────────────────
const PERIODOS = ['Semana','Mes','Trimestre','Año'];

const METRICAS_DATA = {
  Semana: {
    usuarios: { total:1247, nuevos:43, activos:891, activacion:68 },
    empresas: { total:38, nuevas:3, pendientes:5, tiempoVerif:'1.8 días' },
    ingresos: {
      ars: { mrr:2850000, arr:34200000, crecimiento:12, recuerdos:145000, cajaValores:380000 },
      usd: { mrr:2850, arr:34200, crecimiento:12, recuerdos:145, cajaValores:380 },
      btc: { total:0.0421, crecimiento:8 },
    },
    retencion: { tasa:94, churn:6, regresaron:28 },
    engagement: { hitos:8432, capsulas:234, arboles:891, storage:'2.4 TB' },
    graficoUsuarios: [180,210,195,240,225,280,260,310,290,340,320,380,360,410,390,440,420,470,450,500,480,530,510,560,540,590,570,620,600,650],
    graficoIngresos: [180000,210000,195000,240000,225000,280000,260000,310000,290000,340000,320000,380000,360000,410000,390000,440000,420000,470000,450000,500000,480000,530000,510000,560000,540000,590000,570000,620000,600000,650000],
  },
  Mes: {
    usuarios: { total:1247, nuevos:186, activos:891, activacion:68 },
    empresas: { total:38, nuevas:8, pendientes:5, tiempoVerif:'2.1 días' },
    ingresos: {
      ars: { mrr:2850000, arr:34200000, crecimiento:18, recuerdos:580000, cajaValores:1520000 },
      usd: { mrr:2850, arr:34200, crecimiento:18, recuerdos:580, cajaValores:1520 },
      btc: { total:0.182, crecimiento:12 },
    },
    retencion: { tasa:94, churn:6, regresaron:112 },
    engagement: { hitos:8432, capsulas:234, arboles:891, storage:'2.4 TB' },
    graficoUsuarios: [820,870,910,960,1010,1060,1110,1160,1210,1247],
    graficoIngresos: [1800000,2100000,2300000,2500000,2650000,2750000,2800000,2820000,2840000,2850000],
  },
  Trimestre: {
    usuarios: { total:1247, nuevos:524, activos:891, activacion:71 },
    empresas: { total:38, nuevas:18, pendientes:5, tiempoVerif:'2.4 días' },
    ingresos: {
      ars: { mrr:2850000, arr:34200000, crecimiento:34, recuerdos:1740000, cajaValores:4560000 },
      usd: { mrr:2850, arr:34200, crecimiento:34, recuerdos:1740, cajaValores:4560 },
      btc: { total:0.541, crecimiento:28 },
    },
    retencion: { tasa:92, churn:8, regresaron:289 },
    engagement: { hitos:8432, capsulas:234, arboles:891, storage:'2.4 TB' },
    graficoUsuarios: [420,520,620,720,820,920,1020,1100,1180,1247],
    graficoIngresos: [800000,1100000,1400000,1700000,2000000,2200000,2400000,2600000,2750000,2850000],
  },
  Año: {
    usuarios: { total:1247, nuevos:1247, activos:891, activacion:74 },
    empresas: { total:38, nuevas:38, pendientes:5, tiempoVerif:'2.8 días' },
    ingresos: {
      ars: { mrr:2850000, arr:34200000, crecimiento:210, recuerdos:6960000, cajaValores:18240000 },
      usd: { mrr:2850, arr:34200, crecimiento:210, recuerdos:6960, cajaValores:18240 },
      btc: { total:2.164, crecimiento:180 },
    },
    retencion: { tasa:89, churn:11, regresaron:891 },
    engagement: { hitos:8432, capsulas:234, arboles:891, storage:'2.4 TB' },
    graficoUsuarios: [0,42,98,186,312,468,645,812,962,1080,1162,1247],
    graficoIngresos: [0,120000,380000,720000,1100000,1520000,1900000,2250000,2530000,2720000,2810000,2850000],
  },
};

// ── Datos mock ─────────────────────────────────────────────
const EMPRESAS_MOCK = [
  { id:'1', nombre:'Banco Nación Argentina',  pais:'🇦🇷', plan:'Professional', estado:'verificada',  facilitador:'Carlos R.', fecha:'12 Jul 2026', nivel:2 },
  { id:'2', nombre:'YPF S.A.',                pais:'🇦🇷', plan:'Enterprise',   estado:'pendiente',   facilitador:'Carlos R.', fecha:'18 Jul 2026', nivel:2 },
  { id:'3', nombre:'Municipio de Mendoza',    pais:'🇦🇷', plan:'Professional', estado:'pendiente',   facilitador:'Sin asignar',fecha:'20 Jul 2026', nivel:1 },
  { id:'4', nombre:'Club Atlético Boca',      pais:'🇦🇷', plan:'Starter',      estado:'verificada',  facilitador:'Laura M.',  fecha:'05 Jul 2026', nivel:1 },
  { id:'5', nombre:'Boreal Seguros',          pais:'🇦🇷', plan:'Starter',      estado:'rechazada',   facilitador:'Laura M.',  fecha:'01 Jul 2026', nivel:1 },
  { id:'6', nombre:'Grupo Clarín',            pais:'🇦🇷', plan:'Enterprise',   estado:'en_revision', facilitador:'Sin asignar',fecha:'21 Jul 2026', nivel:2 },
];

interface UsuarioSitio {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  pais: string;
  plan: string;
  estado: string;
  hitos: number;
  desde: string;
  celular: string;
  ultimaActividad: string;
}

const USUARIOS_MOCK: UsuarioSitio[] = [
  { id:'1', nombre:'Juan',    apellido:'García',    email:'juan@gmail.com',    dni:'28123456', pais:'🇦🇷 Argentina', plan:'Personal', estado:'activo',    hitos:12, desde:'Ene 2026', celular:'+54 9 261 555-1001', ultimaActividad:'Hoy 09:22'   },
  { id:'2', nombre:'María',   apellido:'López',     email:'maria@hotmail.com', dni:'31456789', pais:'🇦🇷 Argentina', plan:'Personal', estado:'activo',    hitos:8,  desde:'Feb 2026', celular:'+54 9 341 555-2002', ultimaActividad:'Ayer 14:35'  },
  { id:'3', nombre:'Carlos',  apellido:'Ruiz',      email:'carlos@yahoo.com',  dni:'35789012', pais:'🇦🇷 Argentina', plan:'Personal', estado:'suspendido',hitos:3,  desde:'Mar 2026', celular:'+54 9 261 555-3003', ultimaActividad:'15 Jul 2026' },
  { id:'4', nombre:'Ana',     apellido:'Fernández', email:'ana@gmail.com',     dni:'29345678', pais:'🇦🇷 Argentina', plan:'Personal', estado:'activo',    hitos:25, desde:'Dic 2025', celular:'+54 9 11 555-4004',  ultimaActividad:'Hoy 11:48'   },
  { id:'5', nombre:'Pedro',   apellido:'Martínez',  email:'pedro@outlook.com', dni:'38901234', pais:'🇦🇷 Argentina', plan:'Personal', estado:'activo',    hitos:6,  desde:'Abr 2026', celular:'+54 9 351 555-5005', ultimaActividad:'Ayer 20:11'  },
  { id:'6', nombre:'Sofía',   apellido:'Torres',    email:'sofia@gmail.com',   dni:'40123456', pais:'🇺🇾 Uruguay',   plan:'Personal', estado:'activo',    hitos:18, desde:'Mar 2026', celular:'+598 9 555-6006',   ultimaActividad:'Hoy 08:30'   },
  { id:'7', nombre:'Diego',   apellido:'Romero',    email:'diego@yahoo.com',   dni:'36567890', pais:'🇦🇷 Argentina', plan:'Personal', estado:'activo',    hitos:9,  desde:'May 2026', celular:'+54 9 261 555-7007', ultimaActividad:'Hace 3 días' },
  { id:'8', nombre:'Luciana', apellido:'Paz',       email:'luciana@gmail.com', dni:'41234567', pais:'🇨🇱 Chile',     plan:'Personal', estado:'activo',    hitos:4,  desde:'Jun 2026', celular:'+56 9 555-8008',    ultimaActividad:'Ayer 16:22'  },
];

const EQUIPO_INTERNO_MOCK = [
  { id:'1', nombre:'Marcelo García',    email:'superadmin@lifes.com', rol:'Superadmin'            as RolUsuario, equipo:'Dirección',      activo:true,  ultimoAcceso:'Hoy 09:15',    fa2:true  },
  { id:'2', nombre:'Admin Operaciones', email:'admin@lifes.com',      rol:'Administrador'         as RolUsuario, equipo:'Operaciones',    activo:true,  ultimoAcceso:'Hoy 08:42',    fa2:true  },
  { id:'3', nombre:'Laura Méndez',      email:'supervisor@lifes.com', rol:'Supervisor de Área'    as RolUsuario, equipo:'Verificación',   activo:true,  ultimoAcceso:'Ayer 18:30',   fa2:true  },
  { id:'4', nombre:'Carlos Ruiz',       email:'facilitador@lifes.com',rol:'Facilitador de Admisión' as RolUsuario, equipo:'Verificación', activo:true,  ultimoAcceso:'Hoy 10:05',    fa2:false },
  { id:'5', nombre:'Ana Technica',      email:'dev@lifes.com',        rol:'Creador'               as RolUsuario, equipo:'Desarrollo',     activo:true,  ultimoAcceso:'Ayer 23:11',   fa2:true  },
];

const LOGS_MOCK = [
  { usuario:'Marcelo García',    rol:'Superadmin',              fecha:'26 Jul 2026', hora:'09:15:32', resultado:'Éxito',  ip:'192.168.1.1'   },
  { usuario:'Admin Operaciones', rol:'Administrador',           fecha:'26 Jul 2026', hora:'08:42:11', resultado:'Éxito',  ip:'192.168.1.45'  },
  { usuario:'Carlos Ruiz',       rol:'Facilitador de Admisión', fecha:'26 Jul 2026', hora:'10:05:44', resultado:'Éxito',  ip:'201.231.14.22' },
  { usuario:'Ana Technica',      rol:'Creador',                 fecha:'25 Jul 2026', hora:'23:11:09', resultado:'Éxito',  ip:'181.45.22.8'   },
  { usuario:'Desconocido',       rol:'—',                       fecha:'25 Jul 2026', hora:'03:44:21', resultado:'Fallo',  ip:'45.33.32.156'  },
  { usuario:'Laura Méndez',      rol:'Supervisor de Área',      fecha:'25 Jul 2026', hora:'18:30:55', resultado:'Éxito',  ip:'192.168.1.88'  },
];

// ── Componente ─────────────────────────────────────────────
export default function LifesAdmin() {
  const navigate  = useNavigate();
  const [usuario, setUsuario]  = useState<UsuarioSesion | null>(null);
  const [modulo,  setModulo]   = useState<ModuloId>('dashboard');
  const [toast,   setToast]    = useState('');
  const [filtroEmpresa,  setFiltroEmpresa]  = useState('Todos');
  const [fichaEmpleado,  setFichaEmpleado]  = useState<EmpleadoInterno | null>(null);
  const [buscarUsuarios,  setBuscarUsuarios]  = useState('');
  const [perfilUsuario,   setPerfilUsuario]   = useState<UsuarioSitio | null>(null);
  const [filtroUsuarios, setFiltroUsuarios] = useState('Todos');
  const [periodoMetrica, setPeriodoMetrica] = useState('Mes');
  const [monedaMetrica,  setMonedaMetrica]  = useState<'ars'|'usd'|'btc'>('ars');

  // ── Estado Configuración ──
  const [cfgNombrePlat,   setCfgNombrePlat]   = useState("Life's");
  const [cfgEmailSoporte, setCfgEmailSoporte] = useState('soporte@lifes.com');
  const [cfgEmailAdmin,   setCfgEmailAdmin]   = useState('admin@lifes.com');
  const [cfgPrecioStart,  setCfgPrecioStart]  = useState('500');
  const [cfgPrecioPro,    setCfgPrecioPro]    = useState('1200');
  const [cfgPrecioEnt,    setCfgPrecioEnt]    = useState('A consultar');
  const [cfgStorageStart, setCfgStorageStart] = useState('10');
  const [cfgStoragePro,   setCfgStoragePro]   = useState('50');
  const [cfgStorageEnt,   setCfgStorageEnt]   = useState('500');
  const [cfgTasaNivel1,   setCfgTasaNivel1]   = useState('3.5');
  const [cfgTasaNivel2,   setCfgTasaNivel2]   = useState('4.8');
  const [cfgTasaNivel3,   setCfgTasaNivel3]   = useState('5.8');
  const [cfgTasaNivel4,   setCfgTasaNivel4]   = useState('7.2');
  const [cfgPrecioRecuerdo, setCfgPrecioRecuerdo] = useState('2500');
  const [cfgPrecioLogistica, setCfgPrecioLogistica] = useState('1500');
  const [cfgMantenimiento,  setCfgMantenimiento]  = useState(false);
  const [cfgRegistroAbierto, setCfgRegistroAbierto] = useState(true);
  const [cfgNotifEmail,    setCfgNotifEmail]   = useState(true);
  const [cfgNotifWhatsapp, setCfgNotifWhatsapp] = useState(false);
  const [cfgSeccionActiva, setCfgSeccionActiva] = useState('plataforma');

  useEffect(() => {
    const data = sessionStorage.getItem('la_usuario');
    if (!data) { navigate('/lifes-admin/login'); return; }
    setUsuario(JSON.parse(data));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(''), 3000);
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('la_usuario');
    navigate('/lifes-admin/login');
  };

  if (!usuario) return null;

  const rol = usuario.rol as RolUsuario;
  const color = ROL_COLORS[rol] || '#C9932A';
  const navItems = NAV_ITEMS.filter(i => i.roles.includes(rol));
  const grupos = [...new Set(navItems.map(i => i.grupo))];

  const empresasFiltradas = filtroEmpresa === 'Todos'
    ? EMPRESAS_MOCK
    : EMPRESAS_MOCK.filter(e => e.estado === filtroEmpresa);

  // Solo empresas asignadas para Facilitador
  const empresasVista = rol === 'Facilitador de Admisión'
    ? EMPRESAS_MOCK.filter(e => e.facilitador === usuario.nombre || e.facilitador === 'Sin asignar')
    : empresasFiltradas;

  return (
    <div className="la-root">

      {/* ════ SIDEBAR ════ */}
      <aside className="la-sidebar">
        <div className="la-sidebar__logo">
          <div className="la-sidebar__logo-icono" style={{background:`linear-gradient(135deg, ${color}, ${color}88)`}}>
            <Crown size={16} strokeWidth={2}/>
          </div>
          <div className="la-sidebar__logo-textos">
            <span className="la-sidebar__logo-lifes">Life's</span>
            <span className="la-sidebar__logo-sub">Admin General</span>
          </div>
        </div>

        {/* Usuario logueado */}
        <div className="la-sidebar__usuario">
          <div className="la-sidebar__usuario-avatar" style={{borderColor: color}}>
            {usuario.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="la-sidebar__usuario-info">
            <span className="la-sidebar__usuario-nombre">{usuario.nombre}</span>
            <span className="la-sidebar__usuario-rol" style={{color}}>
              {ROL_ICONS[rol]} {rol}
            </span>
          </div>
        </div>

        {/* Nav dinámica según rol */}
        <nav className="la-sidebar__nav">
          {grupos.map(grupo => (
            <div key={grupo} className="la-sidebar__grupo">
              <span className="la-sidebar__grupo-label">{GRUPO_LABELS[grupo]}</span>
              {navItems.filter(i => i.grupo === grupo).map(item => (
                <button
                  key={item.id}
                  className={`la-sidebar__item${modulo === item.id ? ' active' : ''}`}
                  style={modulo === item.id ? {background:`${color}14`, color:`${color}dd`} : {}}
                  onClick={() => setModulo(item.id)}
                >
                  <span className="la-sidebar__icon">{item.icono}</span>
                  <span className="la-sidebar__label">{item.label}</span>
                  {item.badge && <span className="la-sidebar__badge">{item.badge}</span>}
                  {modulo === item.id && (
                    <div className="la-sidebar__active-bar" style={{background: color}}/>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="la-sidebar__footer">
          <button className="la-sidebar__footer-btn" onClick={() => navigate('/')}>
            <Eye size={14} strokeWidth={1.8}/> Ver sitio
          </button>
          <button className="la-sidebar__footer-btn la-sidebar__footer-btn--salir" onClick={cerrarSesion}>
            <LogOut size={14} strokeWidth={1.8}/> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <div className="la-main">

        {/* TOPBAR */}
        <header className="la-topbar">
          <div>
            <h1 className="la-topbar__titulo">
              {NAV_ITEMS.find(i => i.id === modulo)?.label}
            </h1>
            <span className="la-topbar__bread">Life's Admin · {rol}</span>
          </div>
          <div className="la-topbar__right">
            <div className="la-topbar__search"><Search size={13} strokeWidth={1.8}/> Buscar...</div>
            <div className="la-topbar__notif">
              <Bell size={16} strokeWidth={1.8}/>
              <span className="la-topbar__notif-badge">5</span>
            </div>
            <div className="la-topbar__perfil" style={{borderColor:`${color}40`}}>
              <div className="la-topbar__perfil-avatar" style={{background:`${color}20`, color}}>
                {usuario.nombre.charAt(0)}
              </div>
              <div>
                <span className="la-topbar__perfil-nombre">{usuario.nombre}</span>
                <span className="la-topbar__perfil-rol" style={{color}}>{rol}</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <div className="la-contenido">

          {/* ── DASHBOARD ── */}
          {modulo === 'dashboard' && (
            <div className="la-dashboard">

              {/* Bienvenida personalizada */}
              <div className="la-bienvenida">
                <div>
                  <h2 className="la-bienvenida__titulo">
                    Buenos días, <em>{usuario.nombre.split(' ')[0]}</em> 👋
                  </h2>
                  <p className="la-bienvenida__sub">
                    {rol === 'Facilitador de Admisión'
                      ? `Tenés ${EMPRESAS_MOCK.filter(e=>e.estado==='pendiente').length} empresas pendientes de verificación`
                      : `Panel de administración · ${new Date().toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}`
                    }
                  </p>
                </div>
                <div className="la-bienvenida__rol-badge" style={{background:`${color}14`, borderColor:`${color}30`, color}}>
                  {ROL_ICONS[rol]} {rol}
                </div>
              </div>

              {/* KPIs según rol */}
              {['Superadmin','Administrador','Supervisor de Área'].includes(rol) && (
                <div className="la-kpi-grid">
                  {[
                    { icono:<Users      size={18} strokeWidth={1.6}/>, val:'1.247', label:'Usuarios totales',     trend:'+43 esta semana', color:'#C9932A', pct:68 },
                    { icono:<Building2  size={18} strokeWidth={1.6}/>, val:'38',    label:'Empresas verificadas', trend:'+3 este mes',      color:'#4a7a4e', pct:55 },
                    { icono:<Clock      size={18} strokeWidth={1.6}/>, val:'5',     label:'Pendientes verificar', trend:'2 con demora',     color:'#f85149', pct:30 },
                    { icono:<HardDrive  size={18} strokeWidth={1.6}/>, val:'2.4 TB',label:'Storage usado',        trend:'de 10 TB total',   color:'#3a5a8a', pct:24 },
                  ].map((k,i) => (
                    <div key={i} className="la-kpi">
                      <div className="la-kpi__header">
                        <span style={{color:k.color}}>{k.icono}</span>
                        <span className="la-kpi__trend">{k.trend}</span>
                      </div>
                      <div className="la-kpi__val">{k.val}</div>
                      <div className="la-kpi__label">{k.label}</div>
                      <div className="la-kpi__bar">
                        <div className="la-kpi__bar-fill" style={{width:`${k.pct}%`, background:`linear-gradient(90deg,${k.color},${k.color}55)`}}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Accesos rápidos según rol */}
              <div className="la-accesos-rapidos">
                {navItems.filter(i => i.id !== 'dashboard').slice(0,4).map(item => (
                  <button key={item.id} className="la-acceso" onClick={() => setModulo(item.id)}>
                    <div className="la-acceso__icono" style={{color, background:`${color}12`}}>
                      {item.icono}
                    </div>
                    <span className="la-acceso__label">{item.label}</span>
                    {item.badge && <span className="la-acceso__badge">{item.badge}</span>}
                    <ChevronRight size={14} strokeWidth={1.8} style={{color:'rgba(255,255,255,0.2)', marginLeft:'auto'}}/>
                  </button>
                ))}
              </div>

              {/* Empresas pendientes — visible para verificadores */}
              {['Superadmin','Administrador','Supervisor de Área','Facilitador de Admisión'].includes(rol) && (
                <div className="la-panel">
                  <div className="la-panel__header">
                    <span className="la-panel__titulo">Empresas pendientes de verificación</span>
                    <button className="la-panel__link" onClick={() => setModulo('empresas')}>
                      Ver todas <ChevronRight size={12} strokeWidth={2}/>
                    </button>
                  </div>
                  <div className="la-tabla">
                    <div className="la-tabla__head" style={{gridTemplateColumns:'1fr 100px 120px 110px 80px'}}>
                      <span>Empresa</span><span>Plan</span><span>Facilitador</span><span>Fecha</span><span>Nivel</span>
                    </div>
                    {EMPRESAS_MOCK.filter(e => e.estado==='pendiente'||e.estado==='en_revision').slice(0,3).map(e => (
                      <div key={e.id} className="la-tabla__row" style={{gridTemplateColumns:'1fr 100px 120px 110px 80px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <span style={{fontSize:'1rem'}}>{e.pais}</span>
                          <span style={{fontSize:'0.78rem',fontWeight:700,color:'rgba(255,255,255,0.85)'}}>{e.nombre}</span>
                        </div>
                        <span className={`la-badge ${e.plan==='Enterprise'?'la-badge--oro':e.plan==='Professional'?'la-badge--azul':'la-badge--gris'}`}>{e.plan}</span>
                        <span style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{e.facilitador}</span>
                        <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.3)'}}>{e.fecha}</span>
                        <span className={`la-badge ${e.nivel===2?'la-badge--warn':'la-badge--gris'}`}>Nivel {e.nivel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Log de accesos recientes — solo admins */}
              {['Superadmin','Administrador'].includes(rol) && (
                <div className="la-panel">
                  <div className="la-panel__header">
                    <span className="la-panel__titulo">Últimos accesos al panel</span>
                    <button className="la-panel__link" onClick={() => setModulo('logs')}>
                      Ver log completo <ChevronRight size={12} strokeWidth={2}/>
                    </button>
                  </div>
                  <div className="la-actividad">
                    {LOGS_MOCK.slice(0,4).map((l,i) => (
                      <div key={i} className="la-act-item">
                        <div className={`la-act-item__dot ${l.resultado==='Éxito'?'la-act-item__dot--ok':'la-act-item__dot--fail'}`}/>
                        <div className="la-act-item__info">
                          <span><strong>{l.usuario}</strong> — {l.rol}</span>
                          <span>{l.fecha} {l.hora} · {l.ip}</span>
                        </div>
                        <span className={`la-badge ${l.resultado==='Éxito'?'la-badge--verde':'la-badge--rojo'}`}>
                          {l.resultado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── EMPRESAS ── */}
          {modulo === 'empresas' && (
            <div className="la-modulo">
              <div className="la-modulo__header">
                <div>
                  <h2 className="la-modulo__titulo">
                    {rol === 'Facilitador de Admisión' ? 'Mis empresas asignadas' : 'Gestión de empresas'}
                  </h2>
                  <p className="la-modulo__sub">{empresasVista.length} empresas · {EMPRESAS_MOCK.filter(e=>e.estado==='pendiente').length} pendientes</p>
                </div>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  <button className="la-btn-primary" onClick={() => navigate('/lifes-admin/alta-empresa')}
                    style={{whiteSpace:'nowrap'}}>
                    + Nueva empresa
                  </button>
                  {['Todos','pendiente','verificada','en_revision','rechazada'].map(f => (
                    <button key={f}
                      className={`la-filtro-btn${filtroEmpresa===f?' active':''}`}
                      onClick={() => setFiltroEmpresa(f)}
                    >
                      {f==='Todos'?'Todos':f==='pendiente'?'Pendientes':f==='verificada'?'Verificadas':f==='en_revision'?'En revisión':'Rechazadas'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="la-tabla">
                <div className="la-tabla__head" style={{gridTemplateColumns:'1fr 100px 120px 110px 100px 120px'}}>
                  <span>Empresa</span><span>Plan</span><span>Facilitador</span><span>Fecha</span><span>Estado</span><span>Acciones</span>
                </div>
                {empresasVista.map(e => (
                  <div key={e.id} className="la-tabla__row" style={{gridTemplateColumns:'1fr 100px 120px 110px 100px 120px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <span style={{fontSize:'1rem'}}>{e.pais}</span>
                      <div>
                        <div style={{fontSize:'0.78rem',fontWeight:700,color:'rgba(255,255,255,0.85)'}}>{e.nombre}</div>
                        <div style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.3)'}}>Nivel {e.nivel}</div>
                      </div>
                    </div>
                    <span className={`la-badge ${e.plan==='Enterprise'?'la-badge--oro':e.plan==='Professional'?'la-badge--azul':'la-badge--gris'}`}>{e.plan}</span>
                    <span style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{e.facilitador}</span>
                    <span style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.3)'}}>{e.fecha}</span>
                    <span className={`la-badge ${
                      e.estado==='verificada'?'la-badge--verde':
                      e.estado==='pendiente'?'la-badge--warn':
                      e.estado==='en_revision'?'la-badge--azul':'la-badge--rojo'}`}>
                      {e.estado==='verificada'?'✓ Verificada':
                       e.estado==='pendiente'?'⏳ Pendiente':
                       e.estado==='en_revision'?'🔍 En revisión':'✗ Rechazada'}
                    </span>
                    <div style={{display:'flex',gap:'5px'}}>
                      {(e.estado==='pendiente'||e.estado==='en_revision') && (
                        <>
                          <button className="la-btn-xs la-btn-xs--verde" onClick={() => showToast(`✓ ${e.nombre} verificada`)}>
                            <CheckCircle size={11} strokeWidth={2}/> Aprobar
                          </button>
                          <button className="la-btn-xs la-btn-xs--rojo" onClick={() => showToast(`✗ ${e.nombre} rechazada`)}>
                            <XCircle size={11} strokeWidth={2}/> Rechazar
                          </button>
                        </>
                      )}
                      {e.estado==='verificada' && (
                        <button className="la-btn-xs" onClick={() => showToast('👁️ Viendo perfil...')}>
                          <Eye size={11} strokeWidth={1.8}/> Ver
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USUARIOS ── */}
          {/* ── USUARIOS — Lista ── */}
          {modulo === 'usuarios' && !perfilUsuario && (
            <div className="la-modulo">
              <div className="la-modulo__header">
                <div>
                  <h2 className="la-modulo__titulo">Usuarios del sitio</h2>
                  <p className="la-modulo__sub">
                    {USUARIOS_MOCK.length} usuarios registrados · {USUARIOS_MOCK.filter(u=>u.estado==='activo').length} activos
                  </p>
                </div>
              </div>

              {/* Buscador */}
              <div className="la-usuarios-toolbar">
                <div className="la-buscador">
                  <Search size={14} strokeWidth={1.8} className="la-buscador__icono"/>
                  <input
                    value={buscarUsuarios}
                    onChange={e => setBuscarUsuarios(e.target.value)}
                    placeholder="Buscar por nombre, apellido, email o DNI..."
                    className="la-buscador__input"
                  />
                  {buscarUsuarios && (
                    <button className="la-buscador__clear" onClick={() => setBuscarUsuarios('')}>
                      <X size={13} strokeWidth={2}/>
                    </button>
                  )}
                </div>
                <div className="la-filtros-row">
                  {['Todos','activo','suspendido'].map(f => (
                    <button key={f}
                      className={`la-filtro-btn${filtroUsuarios===f?' active':''}`}
                      onClick={() => setFiltroUsuarios(f)}
                    >
                      {f==='Todos'?'Todos':f==='activo'?'Activos':'Suspendidos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabla */}
              <div className="la-tabla">
                <div className="la-tabla__head" style={{gridTemplateColumns:'1fr 100px 100px 80px 80px 110px'}}>
                  <span>Usuario</span><span>País · DNI</span><span>Plan</span><span>Hitos</span><span>Estado</span><span>Acciones</span>
                </div>
                {USUARIOS_MOCK
                  .filter(u =>
                    (filtroUsuarios === 'Todos' || u.estado === filtroUsuarios) &&
                    (
                      u.nombre.toLowerCase().includes(buscarUsuarios.toLowerCase())   ||
                      u.apellido.toLowerCase().includes(buscarUsuarios.toLowerCase()) ||
                      u.email.toLowerCase().includes(buscarUsuarios.toLowerCase())    ||
                      u.dni.includes(buscarUsuarios)
                    )
                  )
                  .map(u => (
                    <div key={u.id} className="la-tabla__row" style={{gridTemplateColumns:'1fr 100px 100px 80px 80px 110px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div className="la-usuario-avatar">{u.nombre.charAt(0)}</div>
                        <div>
                          <div style={{fontSize:'0.78rem',fontWeight:700,color:'rgba(255,255,255,0.85)'}}>
                            {u.nombre} {u.apellido}
                          </div>
                          <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)'}}>{u.email}</div>
                        </div>
                      </div>
                      <div>
                        <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.5)'}}>{u.pais}</div>
                        <div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.25)',fontFamily:'monospace'}}>{u.dni}</div>
                      </div>
                      <span className="la-badge la-badge--gris">{u.plan}</span>
                      <span style={{fontSize:'0.78rem',fontWeight:700,color:'rgba(255,255,255,0.7)'}}>{u.hitos}</span>
                      <span className={`la-badge ${u.estado==='activo'?'la-badge--verde':'la-badge--rojo'}`}>
                        {u.estado==='activo'?'Activo':'Suspendido'}
                      </span>
                      <div style={{display:'flex',gap:'5px'}}>
                        {['Superadmin','Administrador','Supervisor de Área'].includes(rol) && (
                          <button className="la-btn-xs" onClick={() => setPerfilUsuario(u)} title="Ver perfil completo">
                            <Eye size={11} strokeWidth={1.8}/> Ver
                          </button>
                        )}
                        {['Superadmin','Administrador'].includes(rol) && (
                          <button className="la-btn-xs la-btn-xs--warn"
                            onClick={() => showToast(`⚠️ ${u.nombre} ${u.estado==='activo'?'suspendido':'reactivado'}`)}>
                            <Lock size={11} strokeWidth={2}/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                }
                {USUARIOS_MOCK.filter(u =>
                  (filtroUsuarios==='Todos'||u.estado===filtroUsuarios) &&
                  (u.nombre.toLowerCase().includes(buscarUsuarios.toLowerCase())||
                   u.apellido.toLowerCase().includes(buscarUsuarios.toLowerCase())||
                   u.email.toLowerCase().includes(buscarUsuarios.toLowerCase())||
                   u.dni.includes(buscarUsuarios))
                ).length === 0 && (
                  <div className="la-sin-resultados">
                    <Search size={20} strokeWidth={1.4}/>
                    <span>No se encontraron usuarios con "<strong>{buscarUsuarios}</strong>"</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── USUARIOS — Perfil completo ── */}
          {modulo === 'usuarios' && perfilUsuario && (
            <div className="la-modulo">
              <div className="la-modulo__header">
                <button className="la-btn-back" onClick={() => setPerfilUsuario(null)}>
                  ← Volver a usuarios
                </button>
                {['Superadmin','Administrador'].includes(rol) && (
                  <div style={{marginLeft:'auto',display:'flex',gap:'8px'}}>
                    <button className="la-btn-xs la-btn-xs--warn"
                      onClick={() => showToast(`⚠️ ${perfilUsuario.nombre} ${perfilUsuario.estado==='activo'?'suspendido':'reactivado'}`)}>
                      <Lock size={11} strokeWidth={2}/>
                      {perfilUsuario.estado==='activo' ? 'Suspender' : 'Reactivar'}
                    </button>
                    <button className="la-btn-xs la-btn-xs--rojo"
                      onClick={() => { showToast('🗑️ Usuario eliminado'); setPerfilUsuario(null); }}>
                      <Trash2 size={11} strokeWidth={2}/> Eliminar cuenta
                    </button>
                  </div>
                )}
              </div>

              {/* Header perfil */}
              <div className="la-ficha-header">
                <div className="la-usuario-avatar" style={{width:72,height:72,fontSize:'1.8rem',flexShrink:0,borderRadius:'50%',background:'rgba(201,147,42,0.12)',color:'#ffe088',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800}}>
                  {perfilUsuario.nombre.charAt(0)}
                </div>
                <div className="la-ficha-header__info">
                  <h2>{perfilUsuario.nombre} {perfilUsuario.apellido}</h2>
                  <span style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{perfilUsuario.email}</span>
                  <div className="la-ficha-badges">
                    <span className="la-badge la-badge--gris">{perfilUsuario.plan}</span>
                    <span className={`la-badge ${perfilUsuario.estado==='activo'?'la-badge--verde':'la-badge--rojo'}`}>
                      {perfilUsuario.estado==='activo'?'Activo':'Suspendido'}
                    </span>
                    <span className="la-badge la-badge--gris">{perfilUsuario.pais}</span>
                  </div>
                </div>
              </div>

              {/* Secciones */}
              <div className="la-ficha-grid">
                <div className="la-ficha-seccion">
                  <h3 className="la-ficha-seccion__titulo">Datos personales</h3>
                  {[
                    { label:'Nombre completo', val:`${perfilUsuario.nombre} ${perfilUsuario.apellido}` },
                    { label:'DNI / Documento', val: perfilUsuario.dni },
                    { label:'País',            val: perfilUsuario.pais },
                    { label:'Email',           val: perfilUsuario.email },
                    { label:'Celular',         val: perfilUsuario.celular },
                  ].map(d => (
                    <div key={d.label} className="la-ficha-dato">
                      <span>{d.label}</span><strong>{d.val}</strong>
                    </div>
                  ))}
                </div>

                <div className="la-ficha-seccion">
                  <h3 className="la-ficha-seccion__titulo">Actividad en Life's</h3>
                  {[
                    { label:'Plan activo',       val: perfilUsuario.plan },
                    { label:'Miembro desde',     val: perfilUsuario.desde },
                    { label:'Última actividad',  val: perfilUsuario.ultimaActividad },
                    { label:'Hitos creados',     val: `${perfilUsuario.hitos} hitos` },
                    { label:'Estado de cuenta',  val: perfilUsuario.estado==='activo'?'✓ Activa':'⚠️ Suspendida' },
                  ].map(d => (
                    <div key={d.label} className="la-ficha-dato">
                      <span>{d.label}</span><strong>{d.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón ir al perfil público */}
              {['Superadmin','Administrador','Supervisor de Área'].includes(rol) && (
                <button className="la-btn-ver-perfil"
                  onClick={() => showToast('🔗 Abriendo perfil público...')}>
                  <Eye size={15} strokeWidth={1.8}/> Ver perfil público completo en Life's
                </button>
              )}
            </div>
          )}

          {/* ── EQUIPO INTERNO ── */}
          {modulo === 'equipo' && (
            <div className="la-modulo">
              <div className="la-modulo__header">
                <div>
                  <h2 className="la-modulo__titulo">Equipo interno Life's</h2>
                  <p className="la-modulo__sub">{EQUIPO_INTERNO_MOCK.length} colaboradores · {EQUIPO_INTERNO_MOCK.filter(m=>!m.fa2).length} sin 2FA</p>
                </div>
                {['Superadmin','Administrador'].includes(rol) && (
                  <button className="la-btn-primary" onClick={() => navigate('/lifes-admin/alta-empleado')}>
                    + Nuevo empleado
                  </button>
                )}
              </div>
              <div className="la-tabla">
                <div className="la-tabla__head" style={{gridTemplateColumns:'1fr 140px 120px 80px 120px 60px'}}>
                  <span>Colaborador</span><span>Rol</span><span>Equipo</span><span>2FA</span><span>Último acceso</span><span>Acc.</span>
                </div>
                {EQUIPO_INTERNO_MOCK.map(m => (
                  <div key={m.id} className="la-tabla__row" style={{gridTemplateColumns:'1fr 140px 120px 80px 120px 60px'}}>
                    <div>
                      <div style={{fontSize:'0.78rem',fontWeight:700,color:'rgba(255,255,255,0.85)'}}>{m.nombre}</div>
                      <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)'}}>{m.email}</div>
                    </div>
                    <span className="la-badge" style={{background:`${ROL_COLORS[m.rol]}15`,color:ROL_COLORS[m.rol]}}>
                      {ROL_ICONS[m.rol]} {m.rol}
                    </span>
                    <span style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{m.equipo}</span>
                    <span>{m.fa2
                      ? <Lock size={13} strokeWidth={2} style={{color:'#86efac'}}/>
                      : <Lock size={13} strokeWidth={2} style={{color:'#f85149'}}/>
                    }</span>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{m.ultimoAcceso}</span>
                    <div style={{display:'flex',gap:'4px'}}>
                      {rol==='Superadmin' && (
                        <button className="la-btn-xs la-btn-xs--rojo" onClick={() => showToast(`⚠️ Acceso revocado`)}>
                          <X size={11} strokeWidth={2}/>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LOG DE ACCESOS ── */}
          {modulo === 'logs' && (
            <div className="la-modulo">
              <div className="la-modulo__header">
                <div>
                  <h2 className="la-modulo__titulo">Log de accesos</h2>
                  <p className="la-modulo__sub">Registro completo de ingresos al panel</p>
                </div>
                <button className="la-btn-primary" onClick={() => showToast('⬇️ Exportando log...')}>
                  <Download size={14} strokeWidth={2}/> Exportar
                </button>
              </div>
              <div className="la-tabla">
                <div className="la-tabla__head" style={{gridTemplateColumns:'1fr 140px 100px 80px 120px 80px'}}>
                  <span>Usuario</span><span>Rol</span><span>Fecha</span><span>Hora</span><span>IP</span><span>Resultado</span>
                </div>
                {[...LOGS_MOCK, ...LOGS_MOCK].map((l,i) => (
                  <div key={i} className="la-tabla__row" style={{gridTemplateColumns:'1fr 140px 100px 80px 120px 80px'}}>
                    <span style={{fontSize:'0.78rem',fontWeight:700,color:'rgba(255,255,255,0.8)'}}>{l.usuario}</span>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{l.rol}</span>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{l.fecha}</span>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)',fontFamily:'monospace'}}>{l.hora}</span>
                    <span style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.3)',fontFamily:'monospace'}}>{l.ip}</span>
                    <span className={`la-badge ${l.resultado==='Éxito'?'la-badge--verde':'la-badge--rojo'}`}>
                      {l.resultado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CONFIGURACIÓN ── */}
          {modulo === 'config' && rol === 'Superadmin' && (
            <div className="la-modulo">
              <div className="la-modulo__header">
                <div>
                  <h2 className="la-modulo__titulo">Configuración de plataforma</h2>
                  <p className="la-modulo__sub">Solo visible para Superadmin · Los cambios afectan toda la plataforma</p>
                </div>
                <button className="la-btn-primary" onClick={() => showToast('✓ Configuración guardada')}>
                  <Check size={14} strokeWidth={2}/> Guardar cambios
                </button>
              </div>

              {/* Tabs de configuración */}
              <div className="la-cfg-tabs">
                {[
                  { id:'plataforma', label:'🌐 Plataforma' },
                  { id:'planes',     label:'💳 Planes' },
                  { id:'legado',     label:'🏦 Fondo de Legado' },
                  { id:'recuerdos',  label:'💌 Recuerdos' },
                  { id:'notif',      label:'🔔 Notificaciones' },
                  { id:'sistema',    label:'⚙️ Sistema' },
                ].map(t => (
                  <button key={t.id}
                    className={`la-cfg-tab${cfgSeccionActiva===t.id?' active':''}`}
                    onClick={() => setCfgSeccionActiva(t.id)}
                  >{t.label}</button>
                ))}
              </div>

              {/* ── Plataforma ── */}
              {cfgSeccionActiva === 'plataforma' && (
                <div className="la-cfg-seccion">
                  <h3 className="la-cfg-seccion__titulo">Datos generales</h3>
                  <div className="la-cfg-grid">
                    <div className="la-cfg-campo">
                      <label>Nombre de la plataforma</label>
                      <input value={cfgNombrePlat} onChange={e => setCfgNombrePlat(e.target.value)}/>
                    </div>
                    <div className="la-cfg-campo">
                      <label>Email de soporte</label>
                      <input type="email" value={cfgEmailSoporte} onChange={e => setCfgEmailSoporte(e.target.value)}/>
                    </div>
                    <div className="la-cfg-campo">
                      <label>Email de administración</label>
                      <input type="email" value={cfgEmailAdmin} onChange={e => setCfgEmailAdmin(e.target.value)}/>
                    </div>
                  </div>

                  <h3 className="la-cfg-seccion__titulo" style={{marginTop:'8px'}}>Storage por plan (GB)</h3>
                  <div className="la-cfg-grid">
                    <div className="la-cfg-campo">
                      <label>Starter</label>
                      <div className="la-cfg-input-unit">
                        <input type="number" value={cfgStorageStart} onChange={e => setCfgStorageStart(e.target.value)}/>
                        <span>GB</span>
                      </div>
                    </div>
                    <div className="la-cfg-campo">
                      <label>Professional</label>
                      <div className="la-cfg-input-unit">
                        <input type="number" value={cfgStoragePro} onChange={e => setCfgStoragePro(e.target.value)}/>
                        <span>GB</span>
                      </div>
                    </div>
                    <div className="la-cfg-campo">
                      <label>Enterprise</label>
                      <div className="la-cfg-input-unit">
                        <input type="number" value={cfgStorageEnt} onChange={e => setCfgStorageEnt(e.target.value)}/>
                        <span>GB</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Planes ── */}
              {cfgSeccionActiva === 'planes' && (
                <div className="la-cfg-seccion">
                  <h3 className="la-cfg-seccion__titulo">Precios de planes empresariales (ARS / año)</h3>
                  <div className="la-cfg-planes">
                    {[
                      { label:'Starter',      color:'#8A8279', precio:cfgPrecioStart,  set:setCfgPrecioStart,  desc:'PyMEs, clubes y ONGs' },
                      { label:'Professional', color:'#C9932A', precio:cfgPrecioPro,    set:setCfgPrecioPro,    desc:'Empresas medianas' },
                      { label:'Enterprise',   color:'#3a5a8a', precio:cfgPrecioEnt,    set:setCfgPrecioEnt,    desc:'Grandes corporaciones' },
                    ].map(p => (
                      <div key={p.label} className="la-cfg-plan-card">
                        <div className="la-cfg-plan-card__header" style={{borderColor:p.color}}>
                          <span className="la-cfg-plan-card__nombre" style={{color:p.color}}>{p.label}</span>
                          <span className="la-cfg-plan-card__desc">{p.desc}</span>
                        </div>
                        <div className="la-cfg-campo">
                          <label>Precio anual</label>
                          <div className="la-cfg-input-unit">
                            <span>$</span>
                            <input value={p.precio} onChange={e => p.set(e.target.value)}
                              placeholder={p.label==='Enterprise'?'A consultar':'0'}/>
                            <span>ARS</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="la-cfg-info-box">
                    <span>💡</span>
                    <p>Los cambios de precio aplican solo a nuevas contrataciones. Los planes activos mantienen el precio al momento de la compra hasta su vencimiento.</p>
                  </div>
                </div>
              )}

              {/* ── Fondo de Legado ── */}
              {cfgSeccionActiva === 'legado' && (
                <div className="la-cfg-seccion">
                  <h3 className="la-cfg-seccion__titulo">Tasas de interés mensual por nivel</h3>
                  <div className="la-cfg-grid">
                    {[
                      { label:'Nivel Base (2-4 años)',  val:cfgTasaNivel1, set:setCfgTasaNivel1, color:'#8A8279' },
                      { label:'Nivel Plata (4-7 años)', val:cfgTasaNivel2, set:setCfgTasaNivel2, color:'#C9932A' },
                      { label:'Nivel Oro (7-10 años)',  val:cfgTasaNivel3, set:setCfgTasaNivel3, color:'#C9932A' },
                      { label:'Nivel Legado (+10 años)',val:cfgTasaNivel4, set:setCfgTasaNivel4, color:'#ffe088' },
                    ].map(n => (
                      <div key={n.label} className="la-cfg-campo">
                        <label style={{color:n.color}}>{n.label}</label>
                        <div className="la-cfg-input-unit">
                          <input type="number" step="0.1" min="0" max="20"
                            value={n.val} onChange={e => n.set(e.target.value)}/>
                          <span>% mensual</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="la-cfg-info-box">
                    <span>⚠️</span>
                    <p>Modificar las tasas afecta los nuevos depósitos únicamente. Los depósitos existentes mantienen la tasa acordada al momento del ingreso.</p>
                  </div>
                </div>
              )}

              {/* ── Recuerdos ── */}
              {cfgSeccionActiva === 'recuerdos' && (
                <div className="la-cfg-seccion">
                  <h3 className="la-cfg-seccion__titulo">Precios de venta de recuerdos</h3>
                  <div className="la-cfg-grid">
                    <div className="la-cfg-campo">
                      <label>Precio base del recuerdo</label>
                      <div className="la-cfg-input-unit">
                        <span>$</span>
                        <input type="number" value={cfgPrecioRecuerdo}
                          onChange={e => setCfgPrecioRecuerdo(e.target.value)}/>
                        <span>ARS</span>
                      </div>
                    </div>
                    <div className="la-cfg-campo">
                      <label>Costo de logística</label>
                      <div className="la-cfg-input-unit">
                        <span>$</span>
                        <input type="number" value={cfgPrecioLogistica}
                          onChange={e => setCfgPrecioLogistica(e.target.value)}/>
                        <span>ARS</span>
                      </div>
                    </div>
                    <div className="la-cfg-campo">
                      <label>Precio total al cliente</label>
                      <div className="la-cfg-input-unit la-cfg-input-unit--readonly">
                        <span>$</span>
                        <input readOnly value={parseInt(cfgPrecioRecuerdo||'0') + parseInt(cfgPrecioLogistica||'0')}/>
                        <span>ARS</span>
                      </div>
                    </div>
                  </div>

                  <div className="la-cfg-info-box">
                    <span>💌</span>
                    <p>El precio total incluye el recuerdo más la logística de envío. En producción la logística se calculará automáticamente por zona vía n8n.</p>
                  </div>
                </div>
              )}

              {/* ── Notificaciones ── */}
              {cfgSeccionActiva === 'notif' && (
                <div className="la-cfg-seccion">
                  <h3 className="la-cfg-seccion__titulo">Canales de notificación</h3>
                  <div className="la-cfg-toggles">
                    {[
                      { label:'Notificaciones por email',     desc:'Bienvenida, verificación, pagos, recordatorios', val:cfgNotifEmail,    set:setCfgNotifEmail    },
                      { label:'Notificaciones por WhatsApp',  desc:'Alertas críticas y confirmaciones (vía n8n)',    val:cfgNotifWhatsapp, set:setCfgNotifWhatsapp },
                    ].map(n => (
                      <div key={n.label} className="la-cfg-toggle-item">
                        <div>
                          <span className="la-cfg-toggle-item__label">{n.label}</span>
                          <span className="la-cfg-toggle-item__desc">{n.desc}</span>
                        </div>
                        <div className={`la-cfg-toggle${n.val?' on':''}`} onClick={() => n.set(!n.val)}>
                          <div className="la-cfg-toggle__thumb"/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Sistema ── */}
              {cfgSeccionActiva === 'sistema' && (
                <div className="la-cfg-seccion">
                  <h3 className="la-cfg-seccion__titulo">Estado del sistema</h3>
                  <div className="la-cfg-toggles">
                    {[
                      { label:'Modo mantenimiento',   desc:'Bloquea el acceso público mientras se realizan tareas técnicas', val:cfgMantenimiento,   set:setCfgMantenimiento,   danger:true  },
                      { label:'Registro abierto',     desc:'Permite que nuevos usuarios creen cuenta en la plataforma',      val:cfgRegistroAbierto, set:setCfgRegistroAbierto, danger:false },
                    ].map(n => (
                      <div key={n.label} className={`la-cfg-toggle-item${n.danger?' danger':''}`}>
                        <div>
                          <span className="la-cfg-toggle-item__label">{n.label}</span>
                          <span className="la-cfg-toggle-item__desc">{n.desc}</span>
                          {n.danger && n.val && (
                            <span className="la-cfg-toggle-item__alerta">⚠️ El sitio está en mantenimiento — usuarios no pueden ingresar</span>
                          )}
                        </div>
                        <div className={`la-cfg-toggle${n.val?' on':''}${n.danger?' danger':''}`}
                          onClick={() => n.set(!n.val)}>
                          <div className="la-cfg-toggle__thumb"/>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="la-cfg-seccion__titulo" style={{marginTop:'8px'}}>Información del sistema</h3>
                  <div className="la-cfg-sysinfo">
                    {[
                      { label:'Versión frontend',  val:'1.0.0 · React 18 + Vite 4' },
                      { label:'Stack',             val:'TypeScript · SCSS · React Router' },
                      { label:'Entorno',           val:'Desarrollo local · localhost:5173' },
                      { label:'Último deploy',     val:'Pendiente · Backend en desarrollo' },
                      { label:'Base de datos',     val:'⏳ Pendiente implementación' },
                      { label:'Storage',           val:'⏳ Pendiente · S3 / Cloudflare R2' },
                      { label:'Autenticación',     val:'⏳ Pendiente · JWT + 2FA' },
                      { label:'n8n',               val:'⏳ Pendiente · Flujos en desarrollo' },
                    ].map(s => (
                      <div key={s.label} className="la-cfg-sysinfo__item">
                        <span>{s.label}</span>
                        <strong>{s.val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ── MÉTRICAS ── */}
          {modulo === 'metricas' && (
            <MetricasPanel
              periodo={periodoMetrica}
              setPeriodo={setPeriodoMetrica}
              moneda={monedaMetrica}
              setMoneda={setMonedaMetrica}
              showToast={showToast}
            />
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="la-toast">
          <Check size={13} strokeWidth={2.5}/>{toast}
        </div>
      )}

    </div>
  );
}
