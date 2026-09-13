// ============================================
// LIFE'S — Mensajes (Fase 1)
// Lista de conversaciones + solicitudes de mensaje + hilo activo.
// Todo en vivo vía el mismo socket que ya usamos para notificaciones.
// ============================================
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, Plus, X, Check, CheckCheck, Search, Settings2, ArrowLeft, Reply, Pin, PinOff, Flag, Image as ImageIcon, MoreHorizontal, Smile, Mic, Play, Pause } from 'lucide-react';
import { createPortal } from 'react-dom';
import { chatService, connectionService, userService, giphyService } from '../../services/api';
import { connectSocket } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';
import ReportModal from '../../components/ReportModal/ReportModal';
import './Mensajes.scss';

const EMOJIS_REACCION = ['👍', '❤️', '😂', '😮', '😢', '🙏', '💪', '😍', '😘', '😡', '🥰', '🤔', '😭', '😋', '🔥', '🫂', '🫶'];

function formatDuracionAudio(s: number): string {
  const seg = Math.floor(s) || 0;
  return `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`;
}

function AudioMensaje({ src, duracionInicial }: { src: string; duracionInicial?: number | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(duracionInicial || 0);
  const [velocidad, setVelocidad] = useState(1);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (reproduciendo) audio.pause(); else audio.play();
  };

  const cambiarVelocidad = () => {
    const siguiente = velocidad === 1 ? 1.5 : velocidad === 1.5 ? 2 : 1;
    setVelocidad(siguiente);
    if (audioRef.current) audioRef.current.playbackRate = siguiente;
  };

  return (
    <div className="mensajes-audio-player">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
        onEnded={() => { setReproduciendo(false); setProgreso(0); }}
        onLoadedMetadata={(e) => { if (isFinite(e.currentTarget.duration)) setDuracion(e.currentTarget.duration); }}
        onTimeUpdate={(e) => setProgreso(e.currentTarget.currentTime)}
      />
      <button className="mensajes-audio-player__play" onClick={togglePlay}>
        {reproduciendo ? <Pause size={16} strokeWidth={2} /> : <Play size={16} strokeWidth={2} fill="currentColor" />}
      </button>
      <div className="mensajes-audio-player__barra">
        <div className="mensajes-audio-player__progreso" style={{ width: duracion ? `${(progreso / duracion) * 100}%` : '0%' }} />
      </div>
      <span className="mensajes-audio-player__tiempo">{formatDuracionAudio(progreso > 0 ? progreso : duracion)}</span>
      <button className="mensajes-audio-player__velocidad" onClick={cambiarVelocidad}>{velocidad}x</button>
    </div>
  );
}

interface ConversationSummary {
  conversationId: string;
  otro: { id: string; firstName: string; lastName: string; avatarUrl?: string | null } | null;
  ultimoMensaje: { content: string; senderId: string; createdAt: string } | null;
  noLeidos: number;
  isPinned: boolean;
  mutedUntil: string | null;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string | null;
  senderId: string;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentDuration?: number | null;
  isPinned?: boolean;
  reactions?: { userId: string; emoji: string }[];
  replyTo?: { id: string; content: string | null; attachmentType: string | null; senderName: string } | null;
}

export default function Mensajes() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tab, setTab] = useState<'chats' | 'solicitudes'>('chats');
  const [conversaciones, setConversaciones] = useState<ConversationSummary[]>([]);
  const [solicitudes, setSolicitudes] = useState<ConversationSummary[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [borradorPara, setBorradorPara] = useState<{ id: string; firstName: string; lastName: string; avatarUrl?: string | null } | null>(null);
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [texto, setTexto] = useState('');
  const [otroEscribiendo, setOtroEscribiendo] = useState(false);
  const [otroLastReadAt, setOtroLastReadAt] = useState<string | null>(null);
  const [otroPresencia, setOtroPresencia] = useState<{ online: boolean; lastSeenAt: string | null } | null>(null);
  const [enLinea, setEnLinea] = useState<Set<string>>(new Set());

  const formatUltimaVez = (iso: string): string => {
    const fecha = new Date(iso);
    const diffMin = Math.floor((Date.now() - fecha.getTime()) / 60000);
    if (diffMin < 1) return 'hace un momento';
    if (diffMin < 60) return `hace ${diffMin} min`;
    const horas = Math.floor(diffMin / 60);
    if (horas < 24) return `hace ${horas} h`;
    return `el ${fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`;
  };
  const [enviando, setEnviando] = useState(false);

  const [busquedaLista, setBusquedaLista] = useState('');
  const [configAbierta, setConfigAbierta] = useState(false);
  const [guardandoConfig, setGuardandoConfig] = useState(false);

  // ── Fase 2: reaccionar, responder, fijar, reportar, imágenes ──
  const [menuMensajeAbierto, setMenuMensajeAbierto] = useState<string | null>(null);
  const [pickerReaccionAbierto, setPickerReaccionAbierto] = useState<string | null>(null);
  const [respondiendoAMensaje, setRespondiendoAMensaje] = useState<{ id: string; preview: string; senderName: string } | null>(null);
  const [reportandoMensajeId, setReportandoMensajeId] = useState<string | null>(null);
  const [pinnedAbierto, setPinnedAbierto] = useState(false);
  const [pinnedMensajes, setPinnedMensajes] = useState<Message[]>([]);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
  const [burbujaHover, setBurbujaHover] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const hoverCierreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onEnterBurbuja = (id: string) => {
    if (hoverCierreTimerRef.current) { clearTimeout(hoverCierreTimerRef.current); hoverCierreTimerRef.current = null; }
    setBurbujaHover(id);
  };
  const onLeaveBurbuja = () => {
    // no lo cerramos al toque — le damos un margen para que cruzar el
    // huequito hacia el toolbar (que ahora vive al costado) no lo cierre
    hoverCierreTimerRef.current = setTimeout(() => setBurbujaHover(null), 250);
  };
  const [imagenGrande, setImagenGrande] = useState<string | null>(null);
  const inputTextoRef = useRef<HTMLInputElement>(null);
  const [imagenPendiente, setImagenPendiente] = useState<File | null>(null);
  const [previewImagenUrl, setPreviewImagenUrl] = useState<string | null>(null);

  // ── Mensajes de voz ──
  const [grabando, setGrabando] = useState(false);
  const [tiempoGrabado, setTiempoGrabado] = useState(0);
  const [audioPendiente, setAudioPendiente] = useState<{ blob: Blob; url: string; duracion: number; tipo: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const grabacionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const grabacionInicioRef = useRef<number>(0);

  // ── GIPHY (gifs + stickers) ──
  const [giphyAbierto, setGiphyAbierto] = useState(false);
  const [giphyTab, setGiphyTab] = useState<'gifs' | 'stickers'>('gifs');
  const [giphyQ, setGiphyQ] = useState('');
  const [giphyResultados, setGiphyResultados] = useState<any[]>([]);
  const [giphyCargando, setGiphyCargando] = useState(false);
  const giphyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleFijar = async () => {
    if (!activeId || !activa) return;
    setGuardandoConfig(true);
    try {
      await chatService.updateSettings(activeId, { isPinned: !activa.isPinned });
      const patch = (lista: ConversationSummary[]) => lista.map(c => c.conversationId === activeId ? { ...c, isPinned: !activa.isPinned } : c);
      setConversaciones(patch);
      setSolicitudes(patch);
    } catch (err: any) {
      alert(err.message || 'No se pudo guardar');
    } finally {
      setGuardandoConfig(false);
    }
  };

  const toggleSilenciar = async () => {
    if (!activeId || !activa) return;
    setGuardandoConfig(true);
    const yaSilenciado = !!activa.mutedUntil;
    try {
      // "silenciar" simple, indefinido — un valor bien lejano en el
      // futuro; desilenciar lo manda a null
      const nuevoValor = yaSilenciado ? null : new Date('2099-12-31').toISOString();
      await chatService.updateSettings(activeId, { mutedUntil: nuevoValor });
      const patch = (lista: ConversationSummary[]) => lista.map(c => c.conversationId === activeId ? { ...c, mutedUntil: nuevoValor } : c);
      setConversaciones(patch);
      setSolicitudes(patch);
    } catch (err: any) {
      alert(err.message || 'No se pudo guardar');
    } finally {
      setGuardandoConfig(false);
    }
  };

  const bloquearConversacion = async () => {
    if (!activeId) return;
    if (!window.confirm('¿Bloquear esta conversación? No vas a recibir más mensajes de esta persona acá.')) return;
    try {
      await chatService.respond(activeId, 'block');
      setConfigAbierta(false);
      setActiveId(null);
      setMensajes([]);
      cargarListas();
    } catch (err: any) {
      alert(err.message || 'No se pudo bloquear');
    }
  };
  const [nuevoAbierto, setNuevoAbierto] = useState(false);
  const [misConexiones, setMisConexiones] = useState<any[]>([]);
  const [buscarQ, setBuscarQ] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cargandoMas, setCargandoMas] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mensajesFinRef = useRef<HTMLDivElement>(null);
  const conversacionesRef = useRef<ConversationSummary[]>([]);
  const solicitudesRef = useRef<ConversationSummary[]>([]);

  useEffect(() => { conversacionesRef.current = conversaciones; }, [conversaciones]);
  useEffect(() => { solicitudesRef.current = solicitudes; }, [solicitudes]);
  const hiloRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  const scrollAlFondo = (instantaneo = false) => {
    // un solo requestAnimationFrame no siempre alcanza — a veces el
    // navegador todavía no terminó de calcular el alto real de todas las
    // burbujas recién pintadas, y el scroll cae a mitad de camino. Con un
    // pequeño setTimeout de más, forzamos a esperar a que el layout esté
    // realmente listo antes de scrollear.
    requestAnimationFrame(() => {
      mensajesFinRef.current?.scrollIntoView({ behavior: instantaneo ? 'auto' : 'smooth' });
      setTimeout(() => {
        mensajesFinRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    });
  };

  const avisarNavbar = () => window.dispatchEvent(new CustomEvent('lifes:mensajes-actualizados'));

  const mismoDia = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString();

  const formatSeparadorFecha = (iso: string): string => {
    const fecha = new Date(iso);
    const hoy = new Date();
    const ayer = new Date(Date.now() - 86400000);
    if (fecha.toDateString() === hoy.toDateString()) return 'Hoy';
    if (fecha.toDateString() === ayer.toDateString()) return 'Ayer';
    return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatHoraExacta = (iso: string): string =>
    new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const activa = conversaciones.find(c => c.conversationId === activeId) || solicitudes.find(c => c.conversationId === activeId);
  const esSolicitudPendiente = !!solicitudes.find(c => c.conversationId === activeId);

  // ── Carga inicial ──
  const cargarListas = () => {
    setCargandoLista(true);
    return Promise.all([chatService.list(), chatService.listRequests()])
      .then(([resChats, resReq]: any) => {
        setConversaciones(resChats.data);
        setSolicitudes(resReq.data);
        return { chats: resChats.data as ConversationSummary[], solicitudes: resReq.data as ConversationSummary[] };
      })
      .catch(() => ({ chats: [] as ConversationSummary[], solicitudes: [] as ConversationSummary[] }))
      .finally(() => setCargandoLista(false));
  };

  useEffect(() => { cargarListas(); }, []);

  // ── ¿Venís de un perfil con "Mensaje" (?to=userId)? ──
  // Pedimos la lista fresca ACÁ MISMO (no confiamos en el estado que
  // pueda o no estar ya cargado) — así nunca hay carrera entre "¿ya
  // sabemos si existe la conversación?" y "¿terminó de cargar la lista?".
  // Si ya existe, la abrimos con su historial completo; si no, recién
  // ahí es un borrador nuevo.
  useEffect(() => {
    const to = searchParams.get('to');
    if (!to) return;
    setSearchParams({}, { replace: true });

    cargarListas().then(({ chats, solicitudes: reqs }) => {
      const yaExistente = [...chats, ...reqs].find(c => c.otro?.id === to);
      if (yaExistente) {
        abrirConversacion(yaExistente.conversationId);
        return;
      }
      userService.getById(to).then((res: any) => {
        setBorradorPara({ id: res.data.id, firstName: res.data.firstName, lastName: res.data.lastName, avatarUrl: res.data.avatarUrl });
        setActiveId(null);
        setMensajes([]);
      }).catch(() => { });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Abrir una conversación existente ──
  const abrirConversacion = (conversationId: string) => {
    setActiveId(conversationId);
    setBorradorPara(null);
    setCargandoMensajes(true);
    setPage(1);
    setTotalPages(1);
    setOtroLastReadAt(null);
    setRespondiendoAMensaje(null);
    setMenuMensajeAbierto(null);
    cargarFijados(conversationId);
    chatService.getMessages(conversationId, 1, 20)
      .then((res: any) => {
        setMensajes(res.data.items);
        setTotalPages(res.data.totalPages);
        setOtroLastReadAt(res.data.otroLastReadAt);
        setOtroPresencia(res.data.otroPresencia);
        const otroId = res.data.otroPresencia?.online ? (conversaciones.find(c => c.conversationId === conversationId)?.otro?.id || solicitudes.find(c => c.conversationId === conversationId)?.otro?.id) : null;
        setEnLinea(prev => {
          const s = new Set(prev);
          if (otroId) s.add(otroId); else if (res.data.otroPresencia) {
            const idAntiguo = conversaciones.find(c => c.conversationId === conversationId)?.otro?.id || solicitudes.find(c => c.conversationId === conversationId)?.otro?.id;
            if (idAntiguo) s.delete(idAntiguo);
          }
          return s;
        });
        scrollAlFondo(true);
      })
      .catch(() => setMensajes([]))
      .finally(() => setCargandoMensajes(false));

    const yaEsSolicitud = solicitudes.find(c => c.conversationId === conversationId);
    if (!yaEsSolicitud) {
      chatService.markRead(conversationId).then(avisarNavbar).catch(() => { });
      setConversaciones(prev => prev.map(c => c.conversationId === conversationId ? { ...c, noLeidos: 0 } : c));
    }
  };

  // ── Cargar mensajes más viejos al llegar arriba del todo, conservando
  // la posición de scroll (si no, el usuario "salta" al insertar contenido
  // arriba de donde está mirando) ──
  const cargarMasArriba = () => {
    if (!activeId || cargandoMas || page >= totalPages) return;
    setCargandoMas(true);
    const siguiente = page + 1;
    const contenedor = hiloRef.current;
    const alturaAntes = contenedor?.scrollHeight || 0;

    chatService.getMessages(activeId, siguiente, 20)
      .then((res: any) => {
        setMensajes(prev => [...res.data.items, ...prev]);
        setPage(siguiente);
        setTotalPages(res.data.totalPages);
        requestAnimationFrame(() => {
          if (contenedor) contenedor.scrollTop += contenedor.scrollHeight - alturaAntes;
        });
      })
      .catch(() => { })
      .finally(() => setCargandoMas(false));
  };

  useEffect(() => {
    if (!topSentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) cargarMasArriba();
    }, { threshold: 0.1 });
    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, page, totalPages, cargandoMas]);

  // ── Socket: mensajes/typing/read en vivo ──
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('lifes_token');
    if (!token) return;
    const socket = connectSocket(token);

    const onMessage = (payload: any) => {
      const { conversationId, message } = payload;
      if (conversationId === activeId) {
        setMensajes(prev => [...prev, message]);
        scrollAlFondo();
        // si ya tenías esta conversación abierta cuando llegó, la marcamos
        // como leída al instante — así el que te escribió ve el doble
        // tilde sin que vos tengas que "reabrir" nada
        chatService.markRead(conversationId).then(avisarNavbar).catch(() => { });
      }

      // si ya conocíamos esta conversación, actualizamos solo lo que
      // cambió (último mensaje, contador, orden) sin volver a pedir la
      // lista entera — así la foto de perfil nunca se vuelve a firmar de
      // nuevo y no "parpadea" en cada mensaje. Solo si es una conversación
      // TOTALMENTE nueva (recién llegada) hace falta pedir todo una vez.
      const yaExiste = conversacionesRef.current.some(c => c.conversationId === conversationId) || solicitudesRef.current.some(c => c.conversationId === conversationId);
      if (!yaExiste) { cargarListas(); return; }

      const patch = (lista: ConversationSummary[]) => lista.map(c => c.conversationId === conversationId
        ? { ...c, ultimoMensaje: message, noLeidos: conversationId === activeId ? 0 : c.noLeidos + 1, updatedAt: message.createdAt }
        : c
      ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      setConversaciones(prev => patch(prev));
      setSolicitudes(prev => patch(prev));
    };
    const onTyping = (payload: any) => {
      if (payload.conversationId === activeId) setOtroEscribiendo(payload.isTyping);
    };
    const onRead = (payload: any) => {
      if (payload.conversationId === activeId) {
        setOtroLastReadAt(payload.readAt);
      }
    };
    const onRequestAccepted = () => cargarListas();
    const onRequestRejected = () => cargarListas();
    const onPresence = (payload: { userId: string; online: boolean; lastSeenAt: string | null }) => {
      setEnLinea(prev => {
        const s = new Set(prev);
        payload.online ? s.add(payload.userId) : s.delete(payload.userId);
        return s;
      });
      const otroActivo = borradorPara || activa?.otro;
      if (otroActivo?.id === payload.userId) {
        setOtroPresencia({ online: payload.online, lastSeenAt: payload.lastSeenAt });
      }
    };
    const onMessageReaction = (payload: any) => {
      if (payload.conversationId === activeId) {
        setMensajes(prev => prev.map(m => m.id === payload.messageId ? { ...m, reactions: payload.reactions } : m));
      }
    };
    const onMessagePin = (payload: any) => {
      if (payload.conversationId === activeId) {
        setMensajes(prev => prev.map(m => m.id === payload.messageId ? { ...m, isPinned: payload.isPinned } : m));
        cargarFijados(payload.conversationId);
      }
    };

    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);
    socket.on('chat:read', onRead);
    socket.on('chat:request-accepted', onRequestAccepted);
    socket.on('chat:request-rejected', onRequestRejected);
    socket.on('chat:presence', onPresence);
    socket.on('chat:message-reaction', onMessageReaction);
    socket.on('chat:message-pin', onMessagePin);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
      socket.off('chat:read', onRead);
      socket.off('chat:request-accepted', onRequestAccepted);
      socket.off('chat:request-rejected', onRequestRejected);
      socket.off('chat:presence', onPresence);
      socket.off('chat:message-reaction', onMessageReaction);
      socket.off('chat:message-pin', onMessagePin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeId]);

  // ── Enviar mensaje (o crear la conversación si era un borrador) ──
  const enviar = async () => {
    if (imagenPendiente) {
      await confirmarEnvioImagen();
      return;
    }
    if (audioPendiente) {
      await confirmarEnvioAudio();
      return;
    }
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    const contenido = texto.trim();
    const respondiendoId = respondiendoAMensaje?.id;
    setTexto('');
    try {
      if (borradorPara) {
        const res: any = await chatService.start(borradorPara.id, contenido);
        setActiveId(res.data.conversationId);
        setMensajes([res.data.message]);
        setBorradorPara(null);
        cargarListas();
      } else if (activeId) {
        const res: any = await chatService.sendMessage(activeId, contenido, respondiendoId);
        setMensajes(prev => [...prev, res.data]);
        setRespondiendoAMensaje(null);
        scrollAlFondo();
        await chatService.markRead(activeId).catch(() => { });
        avisarNavbar();
        cargarListas();
      }
    } catch (err: any) {
      alert(err.message || 'No se pudo enviar el mensaje');
      setTexto(contenido);
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    if (!imagenGrande && !giphyAbierto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (imagenGrande) setImagenGrande(null);
      else if (giphyAbierto) setGiphyAbierto(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [imagenGrande, giphyAbierto]);

  const onCambiarTexto = (v: string) => {
    const eraVacio = !texto;
    setTexto(v);
    if (!activeId) return;
    chatService.typing(activeId, true).catch(() => { });
    // apenas empezás a escribir (primera letra), marcamos como leído
    if (eraVacio && v) {
      chatService.markRead(activeId).then(avisarNavbar).catch(() => { });
      setConversaciones(prev => prev.map(c => c.conversationId === activeId ? { ...c, noLeidos: 0 } : c));
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      chatService.typing(activeId, false).catch(() => { });
    }, 1500);
  };

  // ── Responder a una solicitud de mensaje ──
  const responder = async (decision: 'accept' | 'reject' | 'block' | 'spam') => {
    if (!activeId) return;
    try {
      await chatService.respond(activeId, decision);
      if (decision === 'accept') {
        cargarListas();
      } else {
        setActiveId(null);
        setMensajes([]);
        cargarListas();
      }
    } catch (err: any) {
      alert(err.message || 'No se pudo responder');
    }
  };

  // ── Empezar un chat nuevo desde el botón flotante ──
  const abrirNuevoChat = async () => {
    setNuevoAbierto(true);
    if (misConexiones.length === 0) {
      try {
        const res: any = await connectionService.list('accepted');
        setMisConexiones(res.data);
      } catch {
        setMisConexiones([]);
      }
    }
  };

  const elegirParaNuevoChat = (otro: any) => {
    setBorradorPara(otro);
    setActiveId(null);
    setMensajes([]);
    setNuevoAbierto(false);
  };

  const listaVisible = (tab === 'chats' ? conversaciones : solicitudes).filter(c =>
    !busquedaLista.trim() || `${c.otro?.firstName} ${c.otro?.lastName}`.toLowerCase().includes(busquedaLista.toLowerCase())
  );

  // el picker se dibuja en un portal (fuera de la burbuja) y calcula su
  // posición a partir de dónde está el botón que lo abrió — así nunca
  // depende de que el CSS del mensaje esté bien alineado, ni se corta
  // contra ningún borde de la pantalla
  const ALTO_ESTIMADO_MENU = 130;
  const abrirMenuMensaje = (e: React.MouseEvent, messageId: string) => {
    if (menuMensajeAbierto === messageId) { setMenuMensajeAbierto(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const hayEspacioArriba = rect.top - ALTO_ESTIMADO_MENU - 8 > 0;
    setMenuPos({
      top: hayEspacioArriba ? rect.top - 8 : rect.bottom + 8,
      left: Math.min(Math.max(8, rect.left - 100), window.innerWidth - 190),
    });
    setMenuMensajeAbierto(messageId);
  };

  const ALTO_ESTIMADO_PICKER = 210;
  const abrirPickerReaccion = (e: React.MouseEvent, messageId: string) => {
    if (pickerReaccionAbierto === messageId) { setPickerReaccionAbierto(null); return; }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const hayEspacioArriba = rect.top - ALTO_ESTIMADO_PICKER - 8 > 0;
    setPickerPos({
      top: hayEspacioArriba ? rect.top - 8 : rect.bottom + 8,
      left: Math.min(Math.max(8, rect.left - 90), window.innerWidth - 240),
    });
    setPickerReaccionAbierto(messageId);
  };

  // ── Reaccionar a un mensaje ──
  const reaccionarMensaje = async (messageId: string, emoji: string) => {
    setPickerReaccionAbierto(null);
    try {
      const res: any = await chatService.reactToMessage(messageId, emoji);
      setMensajes(prev => prev.map(m => m.id === messageId ? { ...m, reactions: res.data.reactions } : m));
    } catch (err: any) {
      alert(err.message || 'No se pudo reaccionar');
    }
  };

  // ── Responder a un mensaje puntual ──
  const iniciarRespuesta = (m: Message) => {
    setMenuMensajeAbierto(null);
    const otro = borradorPara || activa?.otro;
    setRespondiendoAMensaje({
      id: m.id,
      preview: m.attachmentType === 'image' ? '📷 Foto' : (m.content || ''),
      senderName: m.senderId === user?.id ? 'vos' : (otro?.firstName || ''),
    });
    // sin este pequeño delay, el input todavía no terminó de aparecer/
    // reacomodarse en pantalla y el focus no toma efecto
    setTimeout(() => inputTextoRef.current?.focus(), 50);
  };
  const cancelarRespuesta = () => setRespondiendoAMensaje(null);

  // ── Fijar / desfijar ──
  const irAMensajeFijado = (messageId: string) => {
    setPinnedAbierto(false);
    const yaEstaCargado = mensajes.some(m => m.id === messageId);
    if (yaEstaCargado) {
      const el = document.getElementById(`mensaje-${messageId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.classList.add('mensajes-burbuja--resaltado');
      setTimeout(() => el?.classList.remove('mensajes-burbuja--resaltado'), 1500);
    } else {
      // está más atrás en el historial, todavía sin cargar por la
      // paginación — por ahora solo avisamos, sin traerlo automático
      alert('Ese mensaje está más atrás en el historial — subí con el scroll para cargarlo');
    }
  };

  const cargarFijados = (conversationId: string) => {
    chatService.listPinned(conversationId).then((res: any) => setPinnedMensajes(res.data)).catch(() => setPinnedMensajes([]));
  };

  const togglePin = async (m: Message) => {
    setMenuMensajeAbierto(null);
    try {
      const res: any = await chatService.togglePinMessage(m.id);
      setMensajes(prev => prev.map(x => x.id === m.id ? { ...x, isPinned: res.data.isPinned } : x));
      if (activeId) cargarFijados(activeId);
    } catch (err: any) {
      alert(err.message || 'No se pudo fijar el mensaje');
    }
  };

  // ── GIPHY ──
  const buscarGiphy = (q: string, tab: 'gifs' | 'stickers') => {
    setGiphyCargando(true);
    const buscar = tab === 'gifs'
      ? (q.trim() ? giphyService.searchGifs(q) : giphyService.trendingGifs())
      : (q.trim() ? giphyService.searchStickers(q) : giphyService.trendingStickers());
    buscar
      .then((res: any) => setGiphyResultados(res.data))
      .catch(() => setGiphyResultados([]))
      .finally(() => setGiphyCargando(false));
  };

  const abrirGiphy = () => {
    setGiphyAbierto(true);
    setGiphyQ('');
    buscarGiphy('', giphyTab);
  };

  const cambiarGiphyTab = (tab: 'gifs' | 'stickers') => {
    setGiphyTab(tab);
    setGiphyQ('');
    buscarGiphy('', tab);
  };

  const onCambiarGiphyQ = (v: string) => {
    setGiphyQ(v);
    if (giphyDebounceRef.current) clearTimeout(giphyDebounceRef.current);
    giphyDebounceRef.current = setTimeout(() => buscarGiphy(v, giphyTab), 400);
  };

  const enviarGiphy = async (item: any, tipo: 'gif' | 'sticker') => {
    if (!activeId) return;
    setGiphyAbierto(false);
    try {
      const res: any = await chatService.sendExternalMedia(activeId, item.url, tipo, respondiendoAMensaje?.id);
      setMensajes(prev => [...prev, res.data]);
      setRespondiendoAMensaje(null);
      scrollAlFondo();
      await chatService.markRead(activeId).catch(() => {});
      avisarNavbar();
      cargarListas();
    } catch (err: any) {
      alert(err.message || 'No se pudo enviar');
    }
  };

  // ── Grabar y enviar audio ──
  const LIMITE_GRABACION_SEG = 180;

  const iniciarGrabacion = async () => {
    if (!activeId) {
      alert('Mandale primero un mensaje de texto para empezar la conversación');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const tipo = mr.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: tipo });
        const duracion = Math.round((Date.now() - grabacionInicioRef.current) / 1000);
        setAudioPendiente({ blob, url: URL.createObjectURL(blob), duracion, tipo });
      };
      mediaRecorderRef.current = mr;
      grabacionInicioRef.current = Date.now();
      mr.start();
      setGrabando(true);
      setTiempoGrabado(0);
      grabacionTimerRef.current = setInterval(() => {
        setTiempoGrabado(prev => {
          const nuevo = prev + 1;
          if (nuevo >= LIMITE_GRABACION_SEG) detenerGrabacion();
          return nuevo;
        });
      }, 1000);
    } catch {
      alert('No pudimos acceder al micrófono — revisá los permisos del navegador');
    }
  };

  const detenerGrabacion = () => {
    mediaRecorderRef.current?.stop();
    setGrabando(false);
    if (grabacionTimerRef.current) { clearInterval(grabacionTimerRef.current); grabacionTimerRef.current = null; }
  };

  const cancelarGrabacion = () => {
    if (grabando) {
      mediaRecorderRef.current?.stop();
      setGrabando(false);
      if (grabacionTimerRef.current) { clearInterval(grabacionTimerRef.current); grabacionTimerRef.current = null; }
    }
    if (audioPendiente) URL.revokeObjectURL(audioPendiente.url);
    setAudioPendiente(null);
    setTiempoGrabado(0);
  };

  const confirmarEnvioAudio = async () => {
    if (!audioPendiente || !activeId) return;
    setSubiendoImagen(true);
    try {
      const fd = new FormData();
      fd.append('file', audioPendiente.blob, `audio.${audioPendiente.tipo.includes('mp4') ? 'm4a' : 'webm'}`);
      fd.append('duration', String(audioPendiente.duracion));
      if (respondiendoAMensaje) fd.append('replyToId', respondiendoAMensaje.id);
      const res: any = await chatService.sendVoice(activeId, fd);
      setMensajes(prev => [...prev, res.data]);
      setRespondiendoAMensaje(null);
      cancelarGrabacion();
      scrollAlFondo();
      await chatService.markRead(activeId).catch(() => { });
      avisarNavbar();
      cargarListas();
    } catch (err: any) {
      alert(err.message || 'No se pudo enviar el audio');
    } finally {
      setSubiendoImagen(false);
    }
  };

  // ── Subir una imagen ──
  const onElegirImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!activeId) {
      alert('Mandale primero un mensaje de texto para empezar la conversación — después ya podés mandar fotos');
      return;
    }
    setImagenPendiente(file);
    setPreviewImagenUrl(URL.createObjectURL(file));
  };

  const cancelarImagenPendiente = () => {
    if (previewImagenUrl) URL.revokeObjectURL(previewImagenUrl);
    setImagenPendiente(null);
    setPreviewImagenUrl(null);
  };

  const confirmarEnvioImagen = async () => {
    if (!imagenPendiente || !activeId) return;
    setSubiendoImagen(true);
    const caption = texto.trim();
    try {
      const res: any = await chatService.sendImage(activeId, imagenPendiente, {
        replyToId: respondiendoAMensaje?.id,
        caption: caption || undefined,
      });
      setMensajes(prev => [...prev, res.data]);
      setRespondiendoAMensaje(null);
      setTexto('');
      cancelarImagenPendiente();
      scrollAlFondo();
      await chatService.markRead(activeId).catch(() => { });
      avisarNavbar();
      cargarListas();
    } catch (err: any) {
      alert(err.message || 'No se pudo enviar la imagen');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const hayConversacionAbierta = !!(activeId || borradorPara);

  const volverALaLista = () => {
    setActiveId(null);
    setBorradorPara(null);
    setMensajes([]);
  };

  return (
    <div className={`mensajes-root with-navbar${hayConversacionAbierta ? ' mensajes-root--con-chat' : ''}`}>
      <aside className="mensajes-lista">
        <div className="mensajes-lista__header">
          <h1>Mensajes</h1>
        </div>
        <div className="mensajes-tabs">
          <button className={tab === 'chats' ? 'active' : ''} onClick={() => setTab('chats')}>Chats</button>
          <button className={tab === 'solicitudes' ? 'active' : ''} onClick={() => setTab('solicitudes')}>
            Solicitudes {solicitudes.length > 0 && <span className="mensajes-tabs__badge">{solicitudes.length}</span>}
          </button>
        </div>

        <div className="mensajes-buscador">
          <Search size={15} strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Buscar en tus mensajes..."
            value={busquedaLista}
            onChange={e => setBusquedaLista(e.target.value)}
          />
        </div>

        {cargandoLista && <p className="mensajes-vacio">Cargando...</p>}
        {!cargandoLista && listaVisible.length === 0 && (
          <p className="mensajes-vacio">{tab === 'chats' ? 'Todavía no tenés conversaciones.' : 'No tenés solicitudes de mensaje.'}</p>
        )}

        {!cargandoLista && listaVisible.map(c => (
          <button
            key={c.conversationId}
            className={`mensajes-item${activeId === c.conversationId ? ' active' : ''}${c.noLeidos > 0 ? ' sin-leer' : ''}`}
            onClick={() => abrirConversacion(c.conversationId)}
          >
            <div className="mensajes-item__avatar-wrap">
              {c.otro?.avatarUrl
                ? <img src={c.otro.avatarUrl} alt={c.otro.firstName} />
                : <div className="mensajes-item__avatar-vacio">{c.otro?.firstName?.[0] || '?'}</div>
              }
              {c.otro?.id && enLinea.has(c.otro.id) && <span className="mensajes-punto-online mensajes-punto-online--lista" />}
            </div>
            <div className="mensajes-item__info">
              <strong>{c.otro?.firstName} {c.otro?.lastName}</strong>
              <span>{c.ultimoMensaje?.content || 'Sin mensajes'}</span>
            </div>
            {c.noLeidos > 0 && <span className="mensajes-item__badge">{c.noLeidos}</span>}
          </button>
        ))}

        <button className="mensajes-flotante" onClick={abrirNuevoChat} title="Mensaje nuevo">
          <Plus size={22} strokeWidth={2} />
        </button>
      </aside>

      <main className="mensajes-panel">
        {!activeId && !borradorPara && (
          <div className="mensajes-panel__vacio">
            <p>Elegí una conversación, o tocá "+" para escribirle a alguien nuevo.</p>
          </div>
        )}

        {(activeId || borradorPara) && (
          <>
            <div className="mensajes-panel__header">
              <button className="mensajes-panel__volver" onClick={volverALaLista} aria-label="Volver">
                <ArrowLeft size={20} strokeWidth={1.8} />
              </button>
              {borradorPara?.avatarUrl || activa?.otro?.avatarUrl
                ? <img src={(borradorPara || activa?.otro)?.avatarUrl || undefined} alt="" />
                : <div className="mensajes-item__avatar-vacio">{(borradorPara || activa?.otro)?.firstName?.[0] || '?'}</div>
              }
              <div className="mensajes-panel__header-info">
                <span className="mensajes-panel__nombre-wrap">
                  <Link to={`/perfil/${(borradorPara || activa?.otro)?.id}`} className="mensajes-panel__nombre-link">
                    {(borradorPara || activa?.otro)?.firstName} {(borradorPara || activa?.otro)?.lastName}
                  </Link>
                  {otroPresencia?.online && <span className="mensajes-punto-online" title="En línea" />}
                </span>
                <span className="mensajes-panel__escribiendo">
                  {otroEscribiendo
                    ? 'escribiendo...'
                    : otroPresencia?.online
                      ? 'en línea'
                      : otroPresencia?.lastSeenAt
                        ? `últ. vez ${formatUltimaVez(otroPresencia.lastSeenAt)}`
                        : ''}
                </span>
              </div>
              {activeId && (
                <button className="mensajes-panel__engranaje" onClick={() => setConfigAbierta(true)} title="Configurar conversación">
                  <Settings2 size={18} strokeWidth={1.8} />
                </button>
              )}
            </div>

            {esSolicitudPendiente && (
              <div className="mensajes-solicitud-banner">
                <span>Esta persona te escribió — todavía no aceptaste la conversación.</span>
                <div className="mensajes-solicitud-banner__acciones">
                  <button className="aceptar" onClick={() => responder('accept')}><Check size={14} /> Aceptar</button>
                  <button onClick={() => responder('reject')}>Rechazar</button>
                  <button onClick={() => responder('block')}>Bloquear</button>
                  <button onClick={() => responder('spam')}>Spam</button>
                </div>
              </div>
            )}

            {pinnedMensajes.length > 0 && (
              <button
                className="mensajes-pinned-banner"
                onClick={() => pinnedMensajes.length === 1 ? irAMensajeFijado(pinnedMensajes[0].id) : setPinnedAbierto(true)}
              >
                <Pin size={13} strokeWidth={2} />
                <span>{pinnedMensajes.length === 1 ? '1 mensaje fijado' : `${pinnedMensajes.length} mensajes fijados`} — {pinnedMensajes[0].attachmentType === 'image' ? '📷 Foto' : pinnedMensajes[0].content}</span>
              </button>
            )}

            <div className="mensajes-hilo" ref={hiloRef}>
              {cargandoMensajes && <p className="mensajes-vacio">Cargando mensajes...</p>}
              {!cargandoMensajes && page < totalPages && <div ref={topSentinelRef} className="mensajes-sentinel" />}
              {!cargandoMensajes && cargandoMas && <p className="mensajes-vacio mensajes-vacio--chico">Cargando mensajes anteriores...</p>}
              {!cargandoMensajes && mensajes.map((m, i) => {
                const esMio = m.senderId === user?.id;
                const otro = borradorPara || activa?.otro;
                const mostrarSeparador = i === 0 || !mismoDia(mensajes[i - 1].createdAt, m.createdAt);
                const reaccionesAgrupadas = (m.reactions || []).reduce((acc: Record<string, number>, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {});

                return (
                  <div key={m.id}>
                    {mostrarSeparador && (
                      <div className="mensajes-fecha-separador"><span>{formatSeparadorFecha(m.createdAt)}</span></div>
                    )}
                    <div className={`mensajes-fila${esMio ? ' mia' : ''}`} id={`mensaje-${m.id}`}>
                      {!esMio && (
                        otro?.avatarUrl
                          ? <img src={otro.avatarUrl} alt={otro.firstName} className="mensajes-fila__avatar" />
                          : <div className="mensajes-fila__avatar mensajes-item__avatar-vacio">{otro?.firstName?.[0] || '?'}</div>
                      )}

                      <div
                        className="mensajes-burbuja-wrap"
                        onMouseEnter={() => onEnterBurbuja(m.id)}
                        onMouseLeave={onLeaveBurbuja}
                      >
                        <div
                          className={`mensajes-burbuja-toolbar${burbujaHover === m.id ? ' visible' : ''}`}
                          onMouseEnter={() => onEnterBurbuja(m.id)}
                          onMouseLeave={onLeaveBurbuja}
                        >
                          <button onClick={(e) => abrirPickerReaccion(e, m.id)} title="Reaccionar">🙂</button>
                          <button onClick={() => iniciarRespuesta(m)} title="Responder"><Reply size={14} strokeWidth={1.8} /></button>
                          <button onClick={(e) => abrirMenuMensaje(e, m.id)} title="Más"><MoreHorizontal size={14} strokeWidth={1.8} /></button>
                        </div>

                         {m.attachmentType === 'sticker' && m.attachmentUrl ? (
                          <div className="mensajes-sticker">
                            {m.replyTo && (
                              <div className="mensajes-burbuja__cita mensajes-sticker__cita">
                                <strong>{m.replyTo.senderName}</strong>
                                <span>{m.replyTo.attachmentType === 'image' ? '📷 Foto' : m.replyTo.content}</span>
                              </div>
                            )}
                            <img src={m.attachmentUrl} alt="sticker" />
                            <div className="mensajes-sticker__pie">
                              <span className="mensajes-burbuja__tooltip">{formatHoraExacta(m.createdAt)}</span>
                              {esMio && (
                                otroLastReadAt && new Date(m.createdAt) <= new Date(otroLastReadAt)
                                  ? <CheckCheck size={13} strokeWidth={2} className="visto" />
                                  : <Check size={13} strokeWidth={2} />
                              )}
                            </div>
                          </div>
                        ) : (


                        <div className={`mensajes-burbuja${Object.keys(reaccionesAgrupadas).length > 0 ? ' con-reaccion' : ''}`}>
                          {m.replyTo && (
                            <div className="mensajes-burbuja__cita">
                              <strong>{m.replyTo.senderName}</strong>
                              <span>{m.replyTo.attachmentType === 'image' ? '📷 Foto' : m.replyTo.content}</span>
                            </div>
                          )}
                          {m.attachmentType === 'image' && m.attachmentUrl && (
                            <img
                              src={m.attachmentUrl}
                              alt=""
                              className="mensajes-burbuja__imagen"
                              onClick={() => setImagenGrande(m.attachmentUrl!)}
                            />
                          )}
                          {m.attachmentType === 'gif' && m.attachmentUrl && (
                            <img src={m.attachmentUrl} alt="" className="mensajes-burbuja__imagen mensajes-burbuja__gif" />
                          )}
                          {m.attachmentType === 'voice' && m.attachmentUrl && (
                            <AudioMensaje src={m.attachmentUrl} duracionInicial={m.attachmentDuration} />
                          )}
                          {m.content && <p>{m.content}</p>}
                          <div className="mensajes-burbuja__pie">
                            {m.isPinned && <Pin size={11} strokeWidth={2} className="mensajes-burbuja__pin-icon" />}
                            {esMio && (
                              <span className="mensajes-burbuja__estado">
                                {otroLastReadAt && new Date(m.createdAt) <= new Date(otroLastReadAt)
                                  ? <CheckCheck size={13} strokeWidth={2} className="visto" />
                                  : <Check size={13} strokeWidth={2} />}
                              </span>
                            )}
                          </div>
                          
                          <span className="mensajes-burbuja__tooltip">{formatHoraExacta(m.createdAt)}</span>

                          {Object.keys(reaccionesAgrupadas).length > 0 && (
                            <div className="mensajes-reacciones-resumen">
                              {Object.entries(reaccionesAgrupadas).map(([emoji, cant]) => (
                                <span key={emoji}>{emoji}{cant > 1 ? cant : ''}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {menuMensajeAbierto && createPortal(
                <>
                  <div className="mensajes-menu-backdrop" onClick={() => setMenuMensajeAbierto(null)} />
                  <div className="mensajes-menu mensajes-menu--portal" style={{ top: menuPos.top, left: menuPos.left }}>
                    {(() => {
                      const m = mensajes.find(x => x.id === menuMensajeAbierto);
                      if (!m) return null;
                      const esMio = m.senderId === user?.id;
                      return (
                        <>
                          <button onClick={() => iniciarRespuesta(m)}><Reply size={14} strokeWidth={1.8} /> Responder</button>
                          <button onClick={() => togglePin(m)}>
                            {m.isPinned ? <PinOff size={14} strokeWidth={1.8} /> : <Pin size={14} strokeWidth={1.8} />}
                            {m.isPinned ? 'Desfijar' : 'Fijar'}
                          </button>
                          {!esMio && (
                            <button onClick={() => { setMenuMensajeAbierto(null); setReportandoMensajeId(m.id); }}>
                              <Flag size={14} strokeWidth={1.8} /> Reportar
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </>,
                document.body
              )}

              {pickerReaccionAbierto && createPortal(
                <>
                  <div className="mensajes-menu-backdrop" onClick={() => setPickerReaccionAbierto(null)} />
                  <div className="mensajes-reaccion-picker mensajes-reaccion-picker--portal" style={{ top: pickerPos.top, left: pickerPos.left }}>
                    {EMOJIS_REACCION.map(e => {
                      const mensajeAbierto = mensajes.find(m => m.id === pickerReaccionAbierto);
                      const yaElegido = mensajeAbierto?.reactions?.some(r => r.userId === user?.id && r.emoji === e);
                      return (
                        <button key={e} onClick={() => reaccionarMensaje(pickerReaccionAbierto, e)} className={yaElegido ? 'active' : ''}>{e}</button>
                      );
                    })}
                  </div>
                </>,
                document.body
              )}

              <div ref={mensajesFinRef} />
            </div>

            {respondiendoAMensaje && (
              <div className="mensajes-respondiendo-bar">
                <div>
                  <strong>Respondiendo a {respondiendoAMensaje.senderName}</strong>
                  <span>{respondiendoAMensaje.preview}</span>
                </div>
                <button onClick={cancelarRespuesta}><X size={16} strokeWidth={1.8} /></button>
              </div>
            )}

            {grabando && (
              <div className="mensajes-grabando-bar">
                <span className="mensajes-grabando-punto" />
                <span>Grabando... {formatDuracionAudio(tiempoGrabado)}</span>
                <button onClick={cancelarGrabacion}><X size={16} strokeWidth={1.8} /></button>
                <button className="mensajes-grabando-detener" onClick={detenerGrabacion}><Check size={16} strokeWidth={1.8} /></button>
              </div>
            )}

            {!grabando && audioPendiente && (
              <div className="mensajes-audio-pendiente-bar">
                <audio src={audioPendiente.url} controls />
                <button onClick={cancelarGrabacion} disabled={subiendoImagen}><X size={16} strokeWidth={1.8} /></button>
              </div>
            )}

            {imagenPendiente && previewImagenUrl && (
              <div className="mensajes-imagen-pendiente-bar">
                <img src={previewImagenUrl} alt="" />
                <span>Agregá un comentario si querés, y tocá enviar</span>
                <button onClick={cancelarImagenPendiente} disabled={subiendoImagen}><X size={16} strokeWidth={1.8} /></button>
              </div>
            )}

            <div className="mensajes-input">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={onElegirImagen} style={{ display: 'none' }} />
              <button
                className="mensajes-input__imagen-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={esSolicitudPendiente || subiendoImagen || !activeId}
                title="Enviar imagen"
              >
                <ImageIcon size={18} strokeWidth={1.8} />
              </button>
              <button
                className="mensajes-input__imagen-btn"
                onClick={abrirGiphy}
                disabled={esSolicitudPendiente || !activeId || grabando || !!audioPendiente}
                title="GIF o sticker"
              >
                <Smile size={18} strokeWidth={1.8} />
              </button>
              <button
                className="mensajes-input__imagen-btn"
                onClick={iniciarGrabacion}
                disabled={esSolicitudPendiente || !activeId || grabando || !!audioPendiente}
                title="Grabar audio"
              >
                <Mic size={18} strokeWidth={1.8} />
              </button>
              <input
                ref={inputTextoRef}
                type="text"
                placeholder={imagenPendiente ? 'Agregá un comentario (opcional)...' : 'Escribí un mensaje...'}
                value={texto}
                onChange={e => onCambiarTexto(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && enviar()}
                disabled={esSolicitudPendiente || subiendoImagen || grabando || !!audioPendiente}
              />
              <button onClick={enviar} disabled={enviando || subiendoImagen || grabando || (!texto.trim() && !imagenPendiente && !audioPendiente) || esSolicitudPendiente}>
                <Send size={18} strokeWidth={1.8} />
              </button>
            </div>
          </>
        )}
      </main>

      {configAbierta && activa && (
        <div className="mensajes-modal-overlay" onClick={() => setConfigAbierta(false)}>
          <div className="mensajes-modal" onClick={e => e.stopPropagation()}>
            <div className="mensajes-modal__header">
              <span>Configurar conversación</span>
              <button onClick={() => setConfigAbierta(false)}><X size={18} /></button>
            </div>

            <div className="mensajes-config-fila" onClick={toggleFijar}>
              <span>Fijar arriba de la lista</span>
              <div className={`mensajes-config-switch ${activa.isPinned ? 'on' : ''}${guardandoConfig ? ' disabled' : ''}`}>
                <div className="mensajes-config-switch__thumb" />
              </div>
            </div>

            <div className="mensajes-config-fila" onClick={toggleSilenciar}>
              <span>Silenciar notificaciones</span>
              <div className={`mensajes-config-switch ${activa.mutedUntil ? 'on' : ''}${guardandoConfig ? ' disabled' : ''}`}>
                <div className="mensajes-config-switch__thumb" />
              </div>
            </div>

            <div className="mensajes-config-divisor" />

            <button className="mensajes-config-peligro" onClick={bloquearConversacion}>Bloquear esta conversación</button>

            <p className="mensajes-config-nota">
              La configuración de "mostrar visto" y "última conexión" es general para todos tus chats — la manejás desde <Link to="/configuracion" onClick={() => setConfigAbierta(false)}>Configuración → Privacidad</Link>.
            </p>
          </div>
        </div>
      )}

      {giphyAbierto && (
        <div className="mensajes-modal-overlay" onClick={() => setGiphyAbierto(false)}>
          <div className="mensajes-giphy-panel" onClick={e => e.stopPropagation()}>
            <div className="mensajes-modal__header">
              <span>GIFs y stickers</span>
              <button onClick={() => setGiphyAbierto(false)}><X size={18} /></button>
            </div>
            <div className="mensajes-tabs">
              <button className={giphyTab === 'gifs' ? 'active' : ''} onClick={() => cambiarGiphyTab('gifs')}>GIFs</button>
              <button className={giphyTab === 'stickers' ? 'active' : ''} onClick={() => cambiarGiphyTab('stickers')}>Stickers</button>
            </div>
            <div className="mensajes-buscador">
              <Search size={15} strokeWidth={1.8} />
              <input
                type="text"
                placeholder={`Buscar ${giphyTab === 'gifs' ? 'GIFs' : 'stickers'}...`}
                value={giphyQ}
                onChange={e => onCambiarGiphyQ(e.target.value)}
                autoFocus
              />
            </div>
            <div className="mensajes-giphy-grid">
              {giphyCargando && <p className="mensajes-vacio">Buscando...</p>}
              {!giphyCargando && giphyResultados.length === 0 && <p className="mensajes-vacio">Sin resultados.</p>}
              {!giphyCargando && giphyResultados.map(item => (
                <button key={item.id} className="mensajes-giphy-item" onClick={() => enviarGiphy(item, giphyTab === 'gifs' ? 'gif' : 'sticker')}>
                  <img src={item.previewUrl || item.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <p className="mensajes-giphy-attrib">Con la potencia de GIPHY</p>
          </div>
        </div>
      )}

      {imagenGrande && (
        <div className="mensajes-imagen-overlay" onClick={() => setImagenGrande(null)}>
          <button className="mensajes-imagen-overlay__cerrar" onClick={() => setImagenGrande(null)}><X size={20} strokeWidth={2} /></button>
          <img src={imagenGrande} alt="" onClick={e => e.stopPropagation()} />
        </div>
      )}



      {reportandoMensajeId && (
        <ReportModal
          entityType="message"
          entityId={reportandoMensajeId}
          onClose={() => setReportandoMensajeId(null)}
        />
      )}

      {pinnedAbierto && (
        <div className="mensajes-modal-overlay" onClick={() => setPinnedAbierto(false)}>
          <div className="mensajes-modal" onClick={e => e.stopPropagation()}>
            <div className="mensajes-modal__header">
              <span>Mensajes fijados</span>
              <button onClick={() => setPinnedAbierto(false)}><X size={18} /></button>
            </div>
            <div className="mensajes-modal__lista">
              {pinnedMensajes.length === 0 && <p className="mensajes-vacio">No hay mensajes fijados.</p>}
              {pinnedMensajes.map(m => (
                <button key={m.id} className="mensajes-pinned-item" onClick={() => irAMensajeFijado(m.id)}>
                  {m.attachmentType === 'image' && m.attachmentUrl && (
                    <img src={m.attachmentUrl} alt="" className="mensajes-pinned-item__thumb" />
                  )}
                  <div className="mensajes-pinned-item__texto">
                    <strong>{m.sender.firstName}</strong>
                    <span>{m.attachmentType === 'image' ? '📷 Foto' : m.content}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {nuevoAbierto && (
        <div className="mensajes-modal-overlay" onClick={() => setNuevoAbierto(false)}>
          <div className="mensajes-modal" onClick={e => e.stopPropagation()}>
            <div className="mensajes-modal__header">
              <span>Nuevo mensaje</span>
              <button onClick={() => setNuevoAbierto(false)}><X size={18} /></button>
            </div>
            <input
              type="text"
              placeholder="Buscar en tus conexiones..."
              value={buscarQ}
              onChange={e => setBuscarQ(e.target.value)}
              autoFocus
            />
            <div className="mensajes-modal__lista">
              {misConexiones
                .filter((c: any) => {
                  const otro = c.requesterId === user?.id ? c.addressee : c.requester;
                  return `${otro.firstName} ${otro.lastName || ''}`.toLowerCase().includes(buscarQ.toLowerCase());
                })
                .map((c: any) => {
                  const otro = c.requesterId === user?.id ? c.addressee : c.requester;
                  return (
                    <button key={c.id} className="mensajes-modal__persona" onClick={() => elegirParaNuevoChat(otro)}>
                      {otro.avatarUrl
                        ? <img src={otro.avatarUrl} alt={otro.firstName} />
                        : <div className="mensajes-item__avatar-vacio">{otro.firstName[0]}</div>
                      }
                      <span>{otro.firstName} {otro.lastName}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}