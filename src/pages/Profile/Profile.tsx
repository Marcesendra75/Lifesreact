// ============================================================
// LIFE'S — Profile.tsx
// Perfil real, conectado al backend: identidad + capítulos +
// vínculos (conexiones aceptadas) + recuerdos recientes + hub
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity, GitBranch, Map, Image, Shield, Coins,
  Film, Zap, Hourglass, Mail, CreditCard, Lock,
  Users, LayoutDashboard, BookOpen, Heart, MessageCircle,
  ChevronDown, UserX, Flag, Settings as SettingsIcon, MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService, chapterService, memoryService, connectionService, blockService } from '../../services/api';
import ImageCropModal from '../../components/ImageCropModal/ImageCropModal';
import FotoViewerModal from '../../components/FotoViewerModal/FotoViewerModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import './Profile.scss';

// ── Tipos ──────────────────────────────────────────────────
interface Chapter {
  id: string;
  nombre: string;
  desde: number;
  hasta: number;
  color: string;
  emoji: string;
}

interface MemoryItem {
  id: string;
  caption?: string;
  mediaUrl?: string | null;
  reactionCounts: Record<string, number>;
  commentsCount: number;
  createdAt: string;
}

interface ConnectionItem {
  id: string;
  requesterId: string;
  addresseeId: string;
  requester: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  addressee: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

interface PerfilAjeno {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  membershipLevel: string;
  isPrivate: boolean;
  esUnoMismo: boolean;
  estaConectado: boolean;
  connectionId: string | null;
  puedeVerContenido: boolean;
  estadoConexion: 'ninguna' | 'pendiente_enviada' | 'conectado' | 'rechazada';
  diasRestantes: number | null;
}

const NIVEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  bronze: { label: 'Bronce', color: '#855324', bg: 'rgba(133,83,36,0.12)' },
  silver: { label: 'Plata', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  gold: { label: 'Oro', color: '#C9932A', bg: 'rgba(201,147,42,0.14)' },
  diamond: { label: 'Diamante', color: '#3a5a8a', bg: 'rgba(58,90,138,0.12)' },
};

const EMOJIS_CAPITULO = ['👶', '🎓', '💼', '🏆', '🌿', '⭐', '🌟', '💫'];
const COLORES_DISPONIBLES = ['#7EC8E3', '#A8D8A8', '#C9932A', '#E8847A', '#855324', '#3a5a8a'];

// ── Hub de secciones (navegación estática) ──────────────────
const SECCIONES = [
  { icono: <Activity size={22} strokeWidth={1.6} />, label: 'Línea de Vida', desc: 'Tu historia día a día', path: '/linea-de-vida', vault: false, color: '#855324', bg: 'rgba(133,83,36,0.08)' },
  { icono: <GitBranch size={22} strokeWidth={1.6} />, label: 'Árbol Genealógico', desc: 'Tu linaje y raíces', path: '/arbol-genealogico', vault: false, color: '#03192e', bg: 'rgba(3,25,46,0.06)' },
  { icono: <Map size={22} strokeWidth={1.6} />, label: 'Mapa del Linaje', desc: 'Lugares de tu historia', path: '/mapa-linaje', vault: false, color: '#735c00', bg: 'rgba(115,92,0,0.08)' },
  { icono: <Image size={22} strokeWidth={1.6} />, label: 'Recuerdos', desc: 'Fotos, videos y momentos', path: '/feed', vault: false, color: '#855324', bg: 'rgba(133,83,36,0.06)' },
  { icono: <Shield size={22} strokeWidth={1.6} />, label: 'Caja Fuerte', desc: 'Documentos privados', path: '/caja-fuerte', vault: true, color: '#C9A84C', bg: 'rgba(201,168,76,0.1)' },
  { icono: <Coins size={22} strokeWidth={1.6} />, label: 'Caja de Valores', desc: 'Ahorro y herencia', path: '/caja-de-valores', vault: true, color: '#C9A84C', bg: 'rgba(201,168,76,0.08)' },
  { icono: <Film size={22} strokeWidth={1.6} />, label: 'Último Tributo', desc: 'Tu video de despedida', path: '/ultimo-tributo', vault: true, color: '#03192e', bg: 'rgba(3,25,46,0.06)' },
  { icono: <Zap size={22} strokeWidth={1.6} />, label: 'Ecos IA', desc: 'Tu yo digital para el futuro', path: '/ecos/me', vault: false, color: '#735c00', bg: 'rgba(115,92,0,0.06)' },
  { icono: <Hourglass size={22} strokeWidth={1.6} />, label: 'Cápsula del Tiempo', desc: 'Mensajes al futuro', path: '/capsula-del-tiempo', vault: false, color: '#855324', bg: 'rgba(133,83,36,0.06)' },
  { icono: <Mail size={22} strokeWidth={1.6} />, label: 'Postal Digital', desc: 'Enviar recuerdos físicos', path: '/postal', vault: false, color: '#03192e', bg: 'rgba(3,25,46,0.05)' },
  { icono: <Users size={22} strokeWidth={1.6} />, label: 'Vínculos', desc: 'Seguidores y familia', path: '/vinculos', vault: false, color: '#855324', bg: 'rgba(133,83,36,0.06)' },
  { icono: <CreditCard size={22} strokeWidth={1.6} />, label: 'Tarjeta del Legado', desc: 'Tu nivel y beneficios', path: '/tarjeta-legado', vault: false, color: '#C9A84C', bg: 'rgba(201,168,76,0.08)' },
];

function calcularAniosVividos(birthDate?: string | null): number {
  if (!birthDate) return 0;
  const nacimiento = new Date(birthDate);
  const hoy = new Date();
  let anios = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) anios--;
  return anios;
}

export default function Profile() {
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const { user, logout } = useAuth();
  const esOtroPerfil = !!paramUserId && paramUserId !== user?.id;

  const [perfilAjeno, setPerfilAjeno] = useState<PerfilAjeno | null>(null);
  const [cargandoAjeno, setCargandoAjeno] = useState(esOtroPerfil);
  const [estadoConexion, setEstadoConexion] = useState<'ninguna' | 'enviada'>('ninguna');
  const [tooltipRechazoAbierto, setTooltipRechazoAbierto] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [confirmandoBloqueo, setConfirmandoBloqueo] = useState(false);

  // cerrar el menú desplegable con Escape
  useEffect(() => {
    if (!menuAbierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuAbierto(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuAbierto]);


  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || '');
  const [country, setCountry] = useState(user?.country || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(user?.coverUrl || '');

  // Precarga del avatar del hero — hasta que no termine de bajar la imagen
  // (o confirmemos que no hay ninguna), no mostramos el Hero real: se ve
  // el esqueleto, y recién cuando todo está listo aparece todo junto.
  const [avatarListo, setAvatarListo] = useState(false);
  const avatarUrlDelHero = esOtroPerfil ? perfilAjeno?.avatarUrl : avatarUrl;

  useEffect(() => {
    setAvatarListo(false);
    if (!avatarUrlDelHero) {
      setAvatarListo(true);
      return;
    }
    const img = new window.Image();
    img.onload = () => setAvatarListo(true);
    img.onerror = () => setAvatarListo(true); // si falla, no nos quedamos trabados esperando
    img.src = avatarUrlDelHero;
  }, [avatarUrlDelHero]);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [memoriesTotal, setMemoriesTotal] = useState(0);
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [memoriesAjenas, setMemoriesAjenas] = useState<MemoryItem[]>([]);
  const [cargandoMemoriesAjenas, setCargandoMemoriesAjenas] = useState(false);

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [drawerSeccion, setDrawerSeccion] = useState<'perfil' | 'capitulos'>('perfil');
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [subiendoPortada, setSubiendoPortada] = useState(false);
  const [avatarPendiente, setAvatarPendiente] = useState<File | null>(null);
  const [portadaPendiente, setPortadaPendiente] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const portadaInputRef = useRef<HTMLInputElement>(null);
  const [avatarMemoryId, setAvatarMemoryId] = useState<string | null>(null);
  const [coverMemoryId, setCoverMemoryId] = useState<string | null>(null);
  const [viendoFoto, setViendoFoto] = useState<'avatar' | 'portada' | null>(null);
  const [viendoRecuerdoAjeno, setViendoRecuerdoAjeno] = useState<MemoryItem | null>(null);

  // Form del capítulo nuevo/editado
  const [chapterEditId, setChapterEditId] = useState<string | null>(null);
  const [chapterForm, setChapterForm] = useState({ nombre: '', desde: '', hasta: '', color: COLORES_DISPONIBLES[0], emoji: EMOJIS_CAPITULO[0] });

  useEffect(() => {
    if (!user) return;
    if (esOtroPerfil) {
      cargarPerfilAjeno();
    } else {
      cargarTodo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramUserId]);

  async function cargarPerfilAjeno() {
    setCargandoAjeno(true);
    setEstadoConexion('ninguna');
    try {
      const res: any = await userService.getById(paramUserId as string);
      setPerfilAjeno(res.data);
      if (res.data.puedeVerContenido) {
        cargarMemoriesAjenas(res.data.id);
      }
    } catch (err) {
      console.error('Error al cargar el perfil:', err);
      setPerfilAjeno(null);
    } finally {
      setCargandoAjeno(false);
    }
  }

  async function cargarMemoriesAjenas(targetUserId: string) {
    setCargandoMemoriesAjenas(true);
    try {
      const res: any = await memoryService.getByUser(targetUserId, 1, 6);
      setMemoriesAjenas(res.data.items);
    } catch {
      setMemoriesAjenas([]);
    } finally {
      setCargandoMemoriesAjenas(false);
    }
  }
  const showToastReportar = () => {
    alert('El sistema de reportes todavía no está implementado — lo sumamos en el próximo bloque de moderación.');
  };

  const conectar = async () => {
    if (!perfilAjeno) return;
    try {
      await connectionService.sendRequestById(perfilAjeno.id);
      setEstadoConexion('enviada');
    } catch (err: any) {
      alert(err.message || 'No se pudo enviar la solicitud');
    }
  };

  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);

  const confirmarEliminarAmigo = async () => {
    if (!perfilAjeno?.connectionId) return;
    setConfirmandoEliminar(false);
    try {
      await connectionService.remove(perfilAjeno.connectionId);
      await cargarPerfilAjeno();
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar la conexión');
    }
  };

  const confirmarBloqueo = async () => {
    if (!perfilAjeno) return;
    setConfirmandoBloqueo(false);
    try {
      await blockService.block(perfilAjeno.id);
      navigate('/personas');
    } catch (err: any) {
      alert(err.message || 'No se pudo bloquear');
    }
  };

  async function cargarTodo() {
    setCargando(true);
    try {
      const [chaptersRes, memoriesRes, connectionsRes] = await Promise.all([
        chapterService.list() as Promise<any>,
        memoryService.getAll(1, 6) as Promise<any>,
        connectionService.list('accepted') as Promise<any>,
      ]);
      setChapters(chaptersRes.data);
      setMemories(memoriesRes.data.items);
      setMemoriesTotal(memoriesRes.data.total);
      setConnections(connectionsRes.data);
    } catch (err) {
      console.error('Error al cargar el perfil:', err);
    } finally {
      setCargando(false);
    }
  }

  if (!user) return null;

  if (esOtroPerfil) {
    if (cargandoAjeno) {
      return <div className="profile-root with-navbar"><p className="profile-vacio">Cargando perfil...</p></div>;
    }
    if (!perfilAjeno) {
      return <div className="profile-root with-navbar"><p className="profile-vacio">No encontramos a esa persona.</p></div>;
    }
  }

  const datosHero = esOtroPerfil && perfilAjeno ? perfilAjeno : user;
  const nivelCfg = NIVEL_CONFIG[datosHero.membershipLevel] || NIVEL_CONFIG.bronze;
  const aniosVividos = calcularAniosVividos(esOtroPerfil ? null : user.birthDate);
  const heroListo = avatarListo; // los datos (perfilAjeno/user) ya están garantizados acá, solo falta la imagen

  const abrirDrawer = (seccion: 'perfil' | 'capitulos') => {
    setDrawerSeccion(seccion);
    setBio(user.bio || '');
    setCity(user.city || '');
    setCountry(user.country || '');
    setDrawerAbierto(true);
  };

  const guardarPerfil = async () => {
    setGuardando(true);
    setGuardadoOk(false);
    try {
      const res: any = await userService.updateProfile({ bio, country, city });
      setBio(res.data.bio || '');
      setCity(res.data.city || '');
      setCountry(res.data.country || '');
      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Error al guardar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  const elegirAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPendiente(file);
    e.target.value = ''; // permite volver a elegir el mismo archivo si cancela
  };

  const elegirPortada = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPortadaPendiente(file);
    e.target.value = '';
  };

  const confirmarAvatar = async (blob: Blob) => {
    setAvatarPendiente(null);
    setSubiendoAvatar(true);
    try {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      const res: any = await userService.uploadAvatar(file);
      setAvatarUrl(res.data.avatarUrl);
      setAvatarMemoryId(res.data.profileMemoryId || null);
    } catch (err: any) {
      alert(err.message || 'Error al subir el avatar');
    } finally {
      setSubiendoAvatar(false);
    }
  };

  const confirmarPortada = async (blob: Blob) => {
    setPortadaPendiente(null);
    setSubiendoPortada(true);
    try {
      const file = new File([blob], 'portada.jpg', { type: 'image/jpeg' });
      const res: any = await userService.uploadCover(file);
      setCoverUrl(res.data.coverUrl);
      setCoverMemoryId(res.data.profileMemoryId || null);
    } catch (err: any) {
      alert(err.message || 'Error al subir la portada');
    } finally {
      setSubiendoPortada(false);
    }
  };

  const abrirEditorCapitulo = (c?: Chapter) => {
    if (c) {
      setChapterEditId(c.id);
      setChapterForm({ nombre: c.nombre, desde: String(c.desde), hasta: String(c.hasta), color: c.color, emoji: c.emoji });
    } else {
      setChapterEditId(null);
      setChapterForm({
        nombre: '', desde: '', hasta: '',
        color: COLORES_DISPONIBLES[chapters.length % COLORES_DISPONIBLES.length],
        emoji: EMOJIS_CAPITULO[chapters.length % EMOJIS_CAPITULO.length],
      });
    }
  };

  const guardarCapitulo = async () => {
    const desde = parseInt(chapterForm.desde);
    const hasta = parseInt(chapterForm.hasta);
    if (!chapterForm.nombre.trim() || !desde || !hasta) {
      alert('Completá nombre, desde y hasta');
      return;
    }
    try {
      if (chapterEditId) {
        const res: any = await chapterService.update(chapterEditId, { nombre: chapterForm.nombre, desde, hasta, color: chapterForm.color, emoji: chapterForm.emoji });
        setChapters(chapters.map(c => c.id === chapterEditId ? res.data : c));
      } else {
        const res: any = await chapterService.create({ nombre: chapterForm.nombre, desde, hasta, color: chapterForm.color, emoji: chapterForm.emoji });
        setChapters([...chapters, res.data].sort((a, b) => a.desde - b.desde));
      }
      setChapterEditId(null);
      setChapterForm({ nombre: '', desde: '', hasta: '', color: COLORES_DISPONIBLES[0], emoji: EMOJIS_CAPITULO[0] });
    } catch (err: any) {
      alert(err.message || 'Error al guardar el capítulo');
    }
  };

  const borrarCapitulo = async (id: string) => {
    try {
      await chapterService.delete(id);
      setChapters(chapters.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al borrar el capítulo');
    }
  };

  const reaccionarRecuerdo = async (id: string) => {
    try {
      const res: any = await memoryService.setReaction(id, 'emocionante');
      setMemories(memories.map(m => m.id === id ? { ...m, reactionCounts: res.data.reactionCounts } : m));
    } catch {
      // si falla la reacción, no rompemos la pantalla por esto
    }
  };

  return (
    <div className="profile-root with-navbar">

      {/* ════════════ HERO ════════════ */}
      {!heroListo && (
        <div className="profile-hero profile-hero--skeleton">
          <div className="profile-skel profile-skel--portada" />
          <div className="profile-hero__contenido">
            <div className="profile-hero__avatar-wrap">
              <div className="profile-skel profile-skel--avatar" />
            </div>
            <div className="profile-hero__info">
              <div className="profile-skel profile-skel--nombre" />
              <div className="profile-skel profile-skel--linea" />
            </div>
          </div>
        </div>
      )}

      {heroListo && (
      <div className="profile-hero">
        <div className="profile-hero__imagen">
          <div
            className="profile-hero__portada"
            style={
              (esOtroPerfil ? perfilAjeno?.coverUrl : coverUrl)
                ? { backgroundImage: `url(${esOtroPerfil ? perfilAjeno?.coverUrl : coverUrl})` }
                : { background: '#03192E' }
            }
            onClick={() => !esOtroPerfil && coverUrl && setViendoFoto('portada')}
          />
          <div className="profile-hero__portada-overlay" />
          {!esOtroPerfil && (
            <>
              <button
                className="profile-hero__portada-editar"
                onClick={(e) => { e.stopPropagation(); portadaInputRef.current?.click(); }}
              >
                📷 Editar portada
              </button>
              <input ref={portadaInputRef} type="file" accept="image/*" onChange={elegirPortada} hidden />
            </>
          )}
        </div>

        <div className="profile-hero__contenido">
          <div className="profile-hero__avatar-wrap">
            <div
              className="profile-hero__nivel-ring"
              style={{ '--nivel-color': nivelCfg.color } as React.CSSProperties}
              onClick={() => !esOtroPerfil && avatarUrl && setViendoFoto('avatar')}
            >
              {(esOtroPerfil ? perfilAjeno?.avatarUrl : avatarUrl)
                ? (
                  <img
                    key={esOtroPerfil ? perfilAjeno!.avatarUrl! : avatarUrl}
                    src={esOtroPerfil ? perfilAjeno!.avatarUrl! : avatarUrl}
                    alt={datosHero.firstName}
                    className="profile-hero__avatar"
                    onLoad={(e) => e.currentTarget.classList.add('cargada')}
                  />
                )
                : <div className="profile-hero__avatar profile-hero__avatar--vacio">{datosHero.firstName[0]}{datosHero.lastName[0]}</div>
              }
            </div>
            <div className="profile-hero__nivel-badge" style={{ background: nivelCfg.bg, color: nivelCfg.color }}>
              {nivelCfg.label}
            </div>
            {!esOtroPerfil && (
              <>
                <button
                  type="button"
                  className="profile-hero__avatar-editar"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  📷
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={elegirAvatar} hidden />
              </>
            )}
          </div>

          <div className="profile-hero__info">
            <h1 className="profile-hero__nombre">{datosHero.firstName} {datosHero.lastName}</h1>
            {(esOtroPerfil ? perfilAjeno?.bio : bio) && (
              <p className="profile-hero__frase">"{esOtroPerfil ? perfilAjeno?.bio : bio}"</p>
            )}
            <div className="profile-hero__meta">
              {((esOtroPerfil ? perfilAjeno?.city : city) || (esOtroPerfil ? perfilAjeno?.country : country)) && (
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {[esOtroPerfil ? perfilAjeno?.city : city, esOtroPerfil ? perfilAjeno?.country : country].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>

          <div className="profile-hero__acciones">
            {esOtroPerfil ? (
              <>
                {perfilAjeno?.estaConectado ? (
                  <div className="profile-hero__menu-wrap">
                    <button className="profile-hero__ya-vinculado profile-hero__ya-vinculado--btn" onClick={() => setMenuAbierto(v => !v)}>
                      ✓ Conectados <ChevronDown size={14} strokeWidth={2} />
                    </button>
                    {menuAbierto && (
                      <>
                        <div className="profile-hero__menu-backdrop" onClick={() => setMenuAbierto(false)} />
                        <div className="profile-hero__menu">
                          <button onClick={() => { setMenuAbierto(false); setConfirmandoEliminar(true); }}>
                            <UserX size={15} strokeWidth={1.8} /> Eliminar de mis amigos
                          </button>
                          <button onClick={() => { setMenuAbierto(false); setConfirmandoBloqueo(true); }}>
                            <UserX size={15} strokeWidth={1.8} /> Bloquear
                          </button>
                          <button onClick={() => { setMenuAbierto(false); showToastReportar(); }}>
                            <Flag size={15} strokeWidth={1.8} /> Reportar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : estadoConexion === 'enviada' || perfilAjeno?.estadoConexion === 'pendiente_enviada' ? (
                  <span className="profile-hero__solicitud-enviada">Solicitud enviada</span>
                ) : perfilAjeno?.estadoConexion === 'rechazada' ? (
                  <div style={{ position: 'relative' }}>
                    <button
                      className="profile-hero__solicitud-enviada"
                      style={{ background: 'rgba(186,26,26,0.08)', borderColor: 'rgba(186,26,26,0.25)', color: '#ba1a1a', border: '1.5px solid', cursor: 'pointer' }}
                      onClick={() => setTooltipRechazoAbierto(v => !v)}
                    >
                      Rechazada
                    </button>
                    {tooltipRechazoAbierto && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setTooltipRechazoAbierto(false)} />
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 10,
                          background: '#03192e', color: 'white', fontSize: '0.75rem', lineHeight: 1.4,
                          padding: '10px 14px', borderRadius: 10, width: 220, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                        }}>
                          Esta persona rechazó tu solicitud. Podés volver a intentarlo en {perfilAjeno.diasRestantes} día{perfilAjeno.diasRestantes === 1 ? '' : 's'}.
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button className="profile-hero__conectar" onClick={conectar}>Conectar</button>
                )}

                {!perfilAjeno?.estaConectado && (
                  <div className="profile-hero__menu-wrap">
                    <button className="profile-hero__mas-btn" onClick={() => setMenuAbierto(v => !v)} aria-label="Más opciones">
                      <MoreHorizontal size={18} strokeWidth={1.8} />
                    </button>
                    {menuAbierto && (
                      <>
                        <div className="profile-hero__menu-backdrop" onClick={() => setMenuAbierto(false)} />
                        <div className="profile-hero__menu">
                          <button onClick={() => { setMenuAbierto(false); setConfirmandoBloqueo(true); }}>
                            <UserX size={15} strokeWidth={1.8} /> Bloquear
                          </button>
                          <button onClick={() => { setMenuAbierto(false); showToastReportar(); }}>
                            <Flag size={15} strokeWidth={1.8} /> Reportar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <button className="profile-hero__editar" onClick={() => abrirDrawer('perfil')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Editar perfil
                </button>
                <div className="profile-hero__menu-wrap">
                  <button className="profile-hero__mas-btn" onClick={() => setMenuAbierto(v => !v)} aria-label="Más opciones">
                    <MoreHorizontal size={18} strokeWidth={1.8} />
                  </button>
                  {menuAbierto && (
                    <>
                      <div className="profile-hero__menu-backdrop" onClick={() => setMenuAbierto(false)} />
                      <div className="profile-hero__menu">
                        <button onClick={() => { setMenuAbierto(false); navigate('/configuracion'); }}>
                          <SettingsIcon size={15} strokeWidth={1.8} /> Configuración
                        </button>
                        <button onClick={() => { setMenuAbierto(false); logout(); }}>
                          Cerrar sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {confirmandoBloqueo && (
            <ConfirmModal
              titulo="Bloquear a esta persona"
              mensaje={`¿Bloquear a ${perfilAjeno?.firstName}? Ya no van a poder ver sus perfiles ni conectarse, y se elimina cualquier conexión que tuvieran.`}
              textoConfirmar="Sí, bloquear"
              peligroso
              onConfirm={confirmarBloqueo}
              onCancel={() => setConfirmandoBloqueo(false)}
            />
          )}

          {confirmandoEliminar && (
            <ConfirmModal
              titulo="Eliminar de mis amigos"
              mensaje={`¿Eliminar a ${perfilAjeno?.firstName} de tus conexiones? Van a dejar de estar conectados, pero podrán volver a conectarse en el futuro.`}
              textoConfirmar="Sí, eliminar"
              peligroso
              onConfirm={confirmarEliminarAmigo}
              onCancel={() => setConfirmandoEliminar(false)}
            />
          )}
        </div>
      </div>
      )}

      {heroListo && esOtroPerfil && !perfilAjeno?.puedeVerContenido && (
        <p className="profile-vacio" style={{ maxWidth: 900, margin: '32px auto 0', padding: '0 40px' }}>
          Este perfil es privado. Conectate con {perfilAjeno?.firstName} para ver más.
        </p>
      )}

      {esOtroPerfil && perfilAjeno?.puedeVerContenido && (
        <section className="profile-recuerdos-sec">
          <div className="profile-barra-header">
            <div>
              <span className="profile-seccion-eyebrow">Los más recientes</span>
              <h2 className="profile-seccion-titulo">Recuerdos</h2>
            </div>
          </div>

          {cargandoMemoriesAjenas && <p className="profile-vacio">Cargando...</p>}

          {!cargandoMemoriesAjenas && memoriesAjenas.length === 0 && (
            <p className="profile-vacio">{perfilAjeno.firstName} no agregó ningún recuerdo todavía.</p>
          )}

          {!cargandoMemoriesAjenas && memoriesAjenas.length > 0 && (
            <div className="profile-recuerdos-grid">
              {memoriesAjenas.slice(0, 3).map((m, i) => (
                <div
                  key={m.id}
                  className={`profile-recuerdo${i === 0 ? ' profile-recuerdo--grande' : ''}${!m.mediaUrl ? ' profile-recuerdo--solo-texto' : ''}`}
                  onClick={() => m.mediaUrl && setViendoRecuerdoAjeno(m)}
                  style={{ cursor: 'pointer' }}
                >
                  {m.mediaUrl && <img src={m.mediaUrl} alt={m.caption || 'Recuerdo'} />}
                  <div className="profile-recuerdo__overlay">
                    {m.caption && <span className="profile-recuerdo__titulo">{m.caption}</span>}
                    <span className="profile-recuerdo__meta">
                      {new Date(m.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!esOtroPerfil && (
        <>
          {/* ════════════ NÚMEROS ════════════ */}
          <section className="profile-numeros">
            {[
              { valor: aniosVividos, label: 'Años vividos', icono: '⏳', ruta: null },
              { valor: memoriesTotal, label: 'Recuerdos', icono: '📸', ruta: '/feed' },
              { valor: connections.length, label: 'Vínculos', icono: '🤝', ruta: '/vinculos' },
            ].map((m, i) => (
              <div
                key={i}
                className={`profile-metrica${m.ruta ? ' profile-metrica--link' : ''}`}
                onClick={() => m.ruta && navigate(m.ruta)}
              >
                <span className="profile-metrica__icono">{m.icono}</span>
                <span className="profile-metrica__valor">{m.valor.toLocaleString('es-AR')}</span>
                <span className="profile-metrica__label">{m.label}</span>
                {m.ruta && <span className="profile-metrica__arrow">→</span>}
              </div>
            ))}
          </section>

          {/* ════════════ CAPÍTULOS DE VIDA ════════════ */}
          <section className="profile-capitulos-sec">
            <div className="profile-barra-header">
              <div>
                <span className="profile-seccion-eyebrow">Tu historia</span>
                <h2 className="profile-seccion-titulo">
                  <BookOpen size={18} strokeWidth={1.8} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                  Capítulos de vida
                </h2>
              </div>
              <button className="profile-btn-editar-sec" onClick={() => abrirDrawer('capitulos')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Editar capítulos
              </button>
            </div>

            {chapters.length === 0 && !cargando && (
              <p className="profile-vacio">Todavía no armaste ningún capítulo. Editá para crear el primero.</p>
            )}

            <div className="profile-capitulos">
              {chapters.map((c) => (
                <div key={c.id} className="profile-capitulo" style={{ borderColor: c.color }}>
                  <span className="profile-capitulo__emoji">{c.emoji}</span>
                  <span className="profile-capitulo__label">{c.nombre}</span>
                  <span className="profile-capitulo__años">{c.desde} – {c.hasta}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ════════════ VÍNCULOS ════════════ */}
          <section className="profile-vinculos-sec">
            <div className="profile-barra-header">
              <div>
                <span className="profile-seccion-eyebrow">Las personas que importan</span>
                <h2 className="profile-seccion-titulo">Mis Vínculos</h2>
              </div>
              <button className="profile-btn-ver" onClick={() => navigate('/vinculos')}>Ver todos →</button>
            </div>

            {connections.length === 0 && !cargando && (
              <p className="profile-vacio">Todavía no tenés conexiones aceptadas.</p>
            )}

            <div className="profile-vinculos-grid">
              {connections.map(c => {
                const otro = c.requesterId === user.id ? c.addressee : c.requester;
                return (
                  <button key={c.id} className="profile-vinculo-card" onClick={() => navigate(`/perfil/${otro.id}`)}>
                    {otro.avatarUrl
                      ? <img src={otro.avatarUrl} alt={otro.firstName} className="profile-vinculo-card__avatar" />
                      : <div className="profile-vinculo-card__avatar profile-vinculo-card__avatar--vacio">{otro.firstName[0]}</div>
                    }
                    <span className="profile-vinculo-card__nombre">{otro.firstName} {otro.lastName}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ════════════ RECUERDOS ════════════ */}
          <section className="profile-recuerdos-sec">
            <div className="profile-barra-header">
              <div>
                <span className="profile-seccion-eyebrow">Los más recientes</span>
                <h2 className="profile-seccion-titulo">Recuerdos</h2>
              </div>
              <button className="profile-btn-ver" onClick={() => navigate('/feed')}>Ver todos →</button>
            </div>

            {memories.length === 0 && !cargando && (
              <p className="profile-vacio">Todavía no subiste ningún recuerdo.</p>
            )}

            <div className="profile-recuerdos-grid">
              {memories.slice(0, 3).map((m, i) => (
                <div
                  key={m.id}
                  className={`profile-recuerdo${i === 0 ? ' profile-recuerdo--grande' : ''}${!m.mediaUrl ? ' profile-recuerdo--solo-texto' : ''}`}
                  onClick={() => m.mediaUrl && setViendoRecuerdoAjeno(m)}
                  style={{ cursor: m.mediaUrl ? 'pointer' : 'default' }}
                >
                  {m.mediaUrl && <img src={m.mediaUrl} alt={m.caption || 'Recuerdo'} />}
                  <div className="profile-recuerdo__overlay">
                    {m.caption && <span className="profile-recuerdo__titulo">{m.caption}</span>}
                    <span className="profile-recuerdo__meta">
                      {new Date(m.createdAt).toLocaleDateString('es-AR')}
                    </span>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); reaccionarRecuerdo(m.id); }}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                      >
                        <Heart size={14} /> {Object.values(m.reactionCounts || {}).reduce((a, b) => a + b, 0)}
                      </button>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageCircle size={14} /> {m.commentsCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ════════════ MI LEGADO COMPLETO (hub) ════════════ */}
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
                <button key={s.path} className="profile-hub-item" onClick={() => navigate(s.path)} style={{ background: s.bg }}>
                  <div className="profile-hub-item__icon-wrap" style={{ color: s.color }}>
                    {s.icono}
                    {s.vault && <span className="profile-hub-item__lock"><Lock size={10} strokeWidth={2.5} /></span>}
                  </div>
                  <span className="profile-hub-item__label">{s.label}</span>
                  <span className="profile-hub-item__desc">{s.desc}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ════════════ DRAWER DE EDICIÓN ════════════ */}
      {drawerAbierto && (
        <div className="profile-drawer-overlay" onClick={() => setDrawerAbierto(false)}>
          <div className="profile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="profile-drawer__header">
              <div className="profile-drawer__tabs">
                <button
                  className={`profile-drawer__tab${drawerSeccion === 'perfil' ? ' active' : ''}`}
                  onClick={() => setDrawerSeccion('perfil')}
                >
                  Perfil
                </button>
                <button
                  className={`profile-drawer__tab${drawerSeccion === 'capitulos' ? ' active' : ''}`}
                  onClick={() => setDrawerSeccion('capitulos')}
                >
                  Capítulos
                </button>
              </div>
              <button className="profile-drawer__cerrar" onClick={() => setDrawerAbierto(false)}>✕</button>
            </div>

            {drawerSeccion === 'perfil' && (
              <div className="profile-drawer__body">
                <div className="profile-drawer__form">
                  <div className="profile-drawer__grupo">
                    <label>Foto de perfil</label>
                    <label className="profile-drawer__file-btn">
                      {subiendoAvatar ? 'Subiendo...' : 'Elegir imagen'}
                      <input type="file" accept="image/*" onChange={elegirAvatar} disabled={subiendoAvatar} hidden />
                    </label>
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Foto de portada</label>
                    <label className="profile-drawer__file-btn">
                      {subiendoPortada ? 'Subiendo...' : 'Elegir imagen'}
                      <input type="file" accept="image/*" onChange={elegirPortada} disabled={subiendoPortada} hidden />
                    </label>
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={3} />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Ciudad</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>País</label>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                  <button className="profile-drawer__btn-guardar" disabled={guardando} onClick={guardarPerfil}>
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  {guardadoOk && <span className="profile-drawer__confirmacion">✓ Cambios guardados</span>}
                </div>
              </div>
            )}

            {drawerSeccion === 'capitulos' && (
              <div className="profile-drawer__body">
                <div className="profile-drawer__form">
                  {chapters.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.1rem' }}>{c.emoji}</span>
                      <span style={{ flex: 1 }}>{c.nombre} ({c.desde}–{c.hasta})</span>
                      <button onClick={() => abrirEditorCapitulo(c)}>Editar</button>
                      <button onClick={() => borrarCapitulo(c.id)}>Borrar</button>
                    </div>
                  ))}

                  <hr />
                  <p className="profile-drawer__form-titulo">
                    {chapterEditId ? 'Editando capítulo' : 'Nuevo capítulo'}
                  </p>
                  <div className="profile-drawer__grupo">
                    <label>Nombre</label>
                    <input type="text" value={chapterForm.nombre} onChange={(e) => setChapterForm({ ...chapterForm, nombre: e.target.value })} />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Desde (año)</label>
                    <input type="number" value={chapterForm.desde} onChange={(e) => setChapterForm({ ...chapterForm, desde: e.target.value })} />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Hasta (año)</label>
                    <input type="number" value={chapterForm.hasta} onChange={(e) => setChapterForm({ ...chapterForm, hasta: e.target.value })} />
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Emoji</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {EMOJIS_CAPITULO.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setChapterForm({ ...chapterForm, emoji })}
                          className={`profile-drawer__emoji-btn${chapterForm.emoji === emoji ? ' active' : ''}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="profile-drawer__grupo">
                    <label>Color</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {COLORES_DISPONIBLES.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setChapterForm({ ...chapterForm, color })}
                          style={{
                            width: 24, height: 24, borderRadius: '50%', background: color, cursor: 'pointer',
                            border: chapterForm.color === color ? '2px solid #03192e' : '1px solid rgba(0,0,0,0.1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="profile-drawer__btn-guardar" onClick={guardarCapitulo}>
                      {chapterEditId ? 'Guardar cambios' : 'Agregar capítulo'}
                    </button>
                    {chapterEditId && (
                      <button className="profile-drawer__btn-cancelar" onClick={() => abrirEditorCapitulo()}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {avatarPendiente && (
        <ImageCropModal
          file={avatarPendiente}
          aspect={1}
          cropShape="round"
          titulo="Ajustá tu foto de perfil"
          onCancel={() => setAvatarPendiente(null)}
          onConfirm={confirmarAvatar}
        />
      )}

      {portadaPendiente && (
        <ImageCropModal
          file={portadaPendiente}
          aspect={3.4}
          cropShape="rect"
          titulo="Ajustá tu foto de portada"
          onCancel={() => setPortadaPendiente(null)}
          onConfirm={confirmarPortada}
        />
      )}

      {viendoFoto === 'avatar' && avatarUrl && (
        <FotoViewerModal
          memoryId={avatarMemoryId}
          imageUrl={avatarUrl}
          titulo="Foto de perfil"
          onClose={() => setViendoFoto(null)}
        />
      )}

      {viendoFoto === 'portada' && coverUrl && (
        <FotoViewerModal
          memoryId={coverMemoryId}
          imageUrl={coverUrl}
          titulo="Foto de portada"
          onClose={() => setViendoFoto(null)}
        />
      )}

      {viendoRecuerdoAjeno && (
        <FotoViewerModal
          memoryId={viendoRecuerdoAjeno.id}
          imageUrl={viendoRecuerdoAjeno.mediaUrl || ''}
          titulo={viendoRecuerdoAjeno.caption || `Recuerdo de ${perfilAjeno?.firstName}`}
          onClose={() => setViendoRecuerdoAjeno(null)}
        />
      )}

    </div>
  );
}