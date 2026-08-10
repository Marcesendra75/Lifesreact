// ============================================================
// LIFE'S — CartasPrivadas.tsx | Editor de Cartas de Legado
// Ruta: /cartas-privadas
// Tipografías · Papel · Tinta · Preview en tiempo real
// ============================================================
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Plus, Trash2, Edit2, Send,
  Calendar, User, Clock, Check, X, Eye, EyeOff,
  Feather, BookOpen, AlertCircle,
} from 'lucide-react';
import './CartasPrivadas.scss';

// ── Tipos ──────────────────────────────────────────────────
type EstadoCarta = 'borrador' | 'programada' | 'enviada' | 'post_partida';

interface Carta {
  id: string;
  destinatario: string;
  asunto: string;
  contenido: string;
  fechaEnvio: string;
  postPartida: boolean;
  estado: EstadoCarta;
  papel: string;
  fuente: string;
  tinta: string;
  sello: string;
  creadaEl: string;
}

// ── Opciones visuales ──────────────────────────────────────
const PAPELES = [
  { id:'crema',      label:'Crema envejecido', bg:'#fdf6e3', borde:'#d4b896' },
  { id:'blanco',     label:'Blanco clásico',   bg:'#ffffff', borde:'#e0e0e0' },
  { id:'azul',       label:'Azul cielo',       bg:'#eef4fb', borde:'#b8cfe8' },
  { id:'rosa',       label:'Rosa suave',       bg:'#fdf0f0', borde:'#e8c4c4' },
  { id:'pergamino',  label:'Pergamino',        bg:'#f5ead0', borde:'#c8a96e' },
  { id:'elegante',   label:'Oscuro elegante',  bg:'#1a1a2e', borde:'#4a4a6a' },
];

const FUENTES = [
  { id:'newsreader', label:'Cursiva romántica',   clase:'font-newsreader' },
  { id:'mono',       label:'Máquina de escribir', clase:'font-mono'       },
  { id:'script',     label:'Manuscrita',          clase:'font-script'     },
  { id:'moderna',    label:'Moderna',             clase:'font-moderna'    },
  { id:'clasica',    label:'Clásica serif',       clase:'font-clasica'    },
];

const TINTAS = [
  { id:'negro',   label:'Negro',      color:'#1a1a1a' },
  { id:'azul',    label:'Azul marino',color:'#1a3a5c' },
  { id:'burdeos', label:'Burdeos',    color:'#6b1a2a' },
  { id:'verde',   label:'Verde oscuro',color:'#1a4a2a'},
  { id:'dorado',  label:'Dorado',     color:'#8b6914' },
  { id:'blanco',  label:'Blanco',     color:'#f5f0e8' },
];

const SELLOS = [
  { id:'ninguno', label:'Sin sello',  emoji:''   },
  { id:'corazon', label:'Corazón',    emoji:'♥'  },
  { id:'flor',    label:'Flor',       emoji:'✿'  },
  { id:'estrella',label:'Estrella',   emoji:'★'  },
  { id:'infinito',label:'Infinito',   emoji:'∞'  },
  { id:'paloma',  label:'Paloma',     emoji:'✦'  },
];

const DESTINATARIOS_MOCK = [
  'María García (hija)',
  'Carlos García (hijo)',
  'Ana López (pareja)',
  'Pedro García (hermano)',
  'Familia completa',
];

const CARTAS_MOCK: Carta[] = [
  { id:'1', destinatario:'María García (hija)',   asunto:'Para cuando seas madre',        contenido:'Mi querida María, cuando leas esto...',            fechaEnvio:'', postPartida:true,  estado:'programada', papel:'crema',     fuente:'newsreader', tinta:'azul',  sello:'corazon', creadaEl:'12 Jun 2026' },
  { id:'2', destinatario:'Carlos García (hijo)',  asunto:'Para tu cumpleaños 30',         contenido:'Carlos, treinta años ya...',                       fechaEnvio:'2031-07-15', postPartida:false, estado:'programada', papel:'blanco',    fuente:'clasica',    tinta:'negro', sello:'estrella',creadaEl:'05 Jul 2026' },
  { id:'3', destinatario:'Familia completa',      asunto:'Mi mayor legado',               contenido:'A cada uno de ustedes...',                         fechaEnvio:'', postPartida:true,  estado:'borrador',   papel:'pergamino', fuente:'script',     tinta:'burdeos',sello:'infinito',creadaEl:'20 Jul 2026' },
];

// ── Componente ─────────────────────────────────────────────
export default function CartasPrivadas() {
  const navigate = useNavigate();

  const [vista, setVista] = useState<'lista' | 'editor'>('lista');
  const [cartaEdit, setCartaEdit] = useState<Carta | null>(null);
  const [cartas, setCartas] = useState<Carta[]>(CARTAS_MOCK);
  const [previewVisible, setPreviewVisible] = useState(true);

  // ── Estados editor ──
  const [destinatario, setDestinatario] = useState('');
  const [destinatarioCustom, setDestinatarioCustom] = useState('');
  const [asunto, setAsunto] = useState('');
  const [contenido, setContenido] = useState('');
  const [fechaEnvio, setFechaEnvio] = useState('');
  const [postPartida, setPostPartida] = useState(false);
  const [papel, setPapel] = useState('crema');
  const [fuente, setFuente] = useState('newsreader');
  const [tinta, setTinta] = useState('azul');
  const [sello, setSello] = useState('corazon');
  const [guardado, setGuardado] = useState(false);

  const papelActual = PAPELES.find(p => p.id === papel) || PAPELES[0];
  const fuenteActual = FUENTES.find(f => f.id === fuente) || FUENTES[0];
  const tintaActual = TINTAS.find(t => t.id === tinta) || TINTAS[0];
  const selloActual = SELLOS.find(s => s.id === sello) || SELLOS[0];

  const nuevaCarta = () => {
    setCartaEdit(null);
    setDestinatario(''); setDestinatarioCustom('');
    setAsunto(''); setContenido('');
    setFechaEnvio(''); setPostPartida(false);
    setPapel('crema'); setFuente('newsreader');
    setTinta('azul'); setSello('corazon');
    setVista('editor');
  };

  const editarCarta = (carta: Carta) => {
    setCartaEdit(carta);
    setDestinatario(carta.destinatario);
    setAsunto(carta.asunto);
    setContenido(carta.contenido);
    setFechaEnvio(carta.fechaEnvio);
    setPostPartida(carta.postPartida);
    setPapel(carta.papel);
    setFuente(carta.fuente);
    setTinta(carta.tinta);
    setSello(carta.sello);
    setVista('editor');
  };

  const guardarCarta = (estado: EstadoCarta) => {
    const dest = destinatario || destinatarioCustom;
    if (!dest || !asunto || !contenido) return;

    const nueva: Carta = {
      id: cartaEdit?.id || Date.now().toString(),
      destinatario: dest,
      asunto,
      contenido,
      fechaEnvio: postPartida ? '' : fechaEnvio,
      postPartida,
      estado,
      papel, fuente, tinta, sello,
      creadaEl: cartaEdit?.creadaEl || new Date().toLocaleDateString('es-AR', {day:'2-digit',month:'short',year:'numeric'}),
    };

    if (cartaEdit) {
      setCartas(prev => prev.map(c => c.id === cartaEdit.id ? nueva : c));
    } else {
      setCartas(prev => [nueva, ...prev]);
    }
    setGuardado(true);
    setTimeout(() => { setGuardado(false); setVista('lista'); }, 1200);
  };

  const eliminarCarta = (id: string) => {
    setCartas(prev => prev.filter(c => c.id !== id));
  };

  const estadoColor = (e: EstadoCarta) => {
    if (e === 'programada') return '#C9932A';
    if (e === 'enviada')    return '#86efac';
    if (e === 'post_partida') return '#58a6ff';
    return 'rgba(255,255,255,0.3)';
  };

  const estadoLabel = (e: EstadoCarta) => {
    if (e === 'programada')   return '📅 Programada';
    if (e === 'enviada')      return '✓ Enviada';
    if (e === 'post_partida') return '🕊️ Post partida';
    return '✏️ Borrador';
  };

  return (
    <div className="cp-page">

      {/* ── HEADER ── */}
      <header className="cp-header">
        <button className="cp-header__back" onClick={() => vista === 'editor' ? setVista('lista') : navigate(-1)}>
          <ArrowLeft size={18} strokeWidth={1.8}/>
        </button>
        <div className="cp-header__info">
          <Feather size={18} strokeWidth={1.4} className="cp-header__icono"/>
          <div>
            <h1 className="cp-header__titulo">
              {vista === 'lista' ? 'Cartas privadas' : cartaEdit ? 'Editar carta' : 'Nueva carta'}
            </h1>
            <p className="cp-header__sub">
              {vista === 'lista'
                ? `${cartas.length} cartas · ${cartas.filter(c=>c.postPartida).length} post partida`
                : 'Escribí desde el corazón'}
            </p>
          </div>
        </div>
        {vista === 'lista' && (
          <button className="cp-btn-nueva" onClick={nuevaCarta}>
            <Plus size={16} strokeWidth={2}/> Nueva carta
          </button>
        )}
        {vista === 'editor' && (
          <button
            className="cp-btn-preview"
            onClick={() => setPreviewVisible(!previewVisible)}
            title={previewVisible ? 'Ocultar preview' : 'Ver preview'}
          >
            {previewVisible ? <EyeOff size={16} strokeWidth={1.8}/> : <Eye size={16} strokeWidth={1.8}/>}
            {previewVisible ? 'Ocultar' : 'Ver carta'}
          </button>
        )}
      </header>

      {/* ══ LISTA DE CARTAS ══ */}
      {vista === 'lista' && (
        <div className="cp-lista-wrap">

          {cartas.length === 0 ? (
            <div className="cp-empty">
              <Feather size={40} strokeWidth={1}/>
              <h2>Todavía no escribiste ninguna carta</h2>
              <p>Las cartas de legado son palabras que perduran. Escribí la primera.</p>
              <button className="cp-btn-nueva" onClick={nuevaCarta}>
                <Plus size={15} strokeWidth={2}/> Escribir primera carta
              </button>
            </div>
          ) : (
            <div className="cp-cartas-grid">
              {cartas.map(carta => {
                const p = PAPELES.find(p => p.id === carta.papel) || PAPELES[0];
                const f = FUENTES.find(f => f.id === carta.fuente) || FUENTES[0];
                const t = TINTAS.find(t => t.id === carta.tinta) || TINTAS[0];
                const s = SELLOS.find(s => s.id === carta.sello) || SELLOS[0];
                return (
                  <div key={carta.id} className="cp-carta-card">
                    {/* Mini preview */}
                    <div className="cp-carta-card__preview"
                      style={{background: p.bg, borderColor: p.borde}}>
                      {s.emoji && <span className="cp-carta-card__sello" style={{color: t.color}}>{s.emoji}</span>}
                      <p className={`cp-carta-card__texto cp-${f.clase}`}
                        style={{color: t.color}}>
                        {carta.contenido.slice(0, 80)}...
                      </p>
                    </div>
                    {/* Info */}
                    <div className="cp-carta-card__info">
                      <div className="cp-carta-card__header">
                        <span className="cp-carta-card__asunto">{carta.asunto}</span>
                        <span className="cp-carta-card__estado"
                          style={{color: estadoColor(carta.estado), background:`${estadoColor(carta.estado)}15`}}>
                          {estadoLabel(carta.estado)}
                        </span>
                      </div>
                      <div className="cp-carta-card__meta">
                        <span><User size={11} strokeWidth={2}/> {carta.destinatario}</span>
                        <span>
                          {carta.postPartida
                            ? <><span style={{color:'#58a6ff'}}>🕊️ Post partida</span></>
                            : carta.fechaEnvio
                            ? <><Calendar size={11} strokeWidth={2}/> {carta.fechaEnvio}</>
                            : <><Clock size={11} strokeWidth={2}/> Sin fecha</>
                          }
                        </span>
                        <span style={{color:'rgba(255,255,255,0.2)'}}>{carta.creadaEl}</span>
                      </div>
                      <div className="cp-carta-card__acciones">
                        <button onClick={() => editarCarta(carta)}>
                          <Edit2 size={13} strokeWidth={1.8}/> Editar
                        </button>
                        <button onClick={() => eliminarCarta(carta.id)} className="cp-btn-del">
                          <Trash2 size={13} strokeWidth={1.8}/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Card nueva carta */}
              <button className="cp-carta-nueva" onClick={nuevaCarta}>
                <Plus size={28} strokeWidth={1.2}/>
                <span>Escribir nueva carta</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══ EDITOR ══ */}
      {vista === 'editor' && (
        <div className={`cp-editor-wrap${previewVisible ? ' con-preview' : ''}`}>

          {/* ── Panel izquierdo: formulario ── */}
          <div className="cp-editor-form">

            {/* Destinatario */}
            <div className="cp-seccion">
              <h3 className="cp-seccion__titulo"><User size={13} strokeWidth={2}/> Destinatario</h3>
              <div className="cp-destinatarios">
                {DESTINATARIOS_MOCK.map(d => (
                  <button key={d}
                    className={`cp-dest-btn${destinatario===d?' active':''}`}
                    onClick={() => { setDestinatario(d); setDestinatarioCustom(''); }}
                  >{d}</button>
                ))}
              </div>
              <input
                className="cp-input"
                value={destinatarioCustom}
                onChange={e => { setDestinatarioCustom(e.target.value); setDestinatario(''); }}
                placeholder="O escribí otro destinatario..."
              />
            </div>

            {/* Asunto */}
            <div className="cp-seccion">
              <h3 className="cp-seccion__titulo"><BookOpen size={13} strokeWidth={2}/> Asunto de la carta</h3>
              <input
                className="cp-input"
                value={asunto}
                onChange={e => setAsunto(e.target.value)}
                placeholder='Ej: "Para cuando seas madre", "En tu cumpleaños 30"...'
              />
            </div>

            {/* Contenido */}
            <div className="cp-seccion">
              <h3 className="cp-seccion__titulo"><Feather size={13} strokeWidth={2}/> Tu carta</h3>
              <textarea
                className="cp-textarea"
                value={contenido}
                onChange={e => setContenido(e.target.value)}
                placeholder="Escribí desde el corazón. Estas palabras perdurarán..."
                rows={10}
              />
              <span className="cp-contador">{contenido.length} caracteres · {contenido.split(/\s+/).filter(Boolean).length} palabras</span>
            </div>

            {/* Fecha de envío */}
            <div className="cp-seccion">
              <h3 className="cp-seccion__titulo"><Calendar size={13} strokeWidth={2}/> Cuándo se envía</h3>

              <div className={`cp-post-partida-toggle${postPartida?' active':''}`}
                onClick={() => setPostPartida(!postPartida)}>
                <div className="cp-post-partida-toggle__check">
                  {postPartida && <Check size={13} strokeWidth={2.5}/>}
                </div>
                <div>
                  <span>🕊️ Enviar solo después de mi partida</span>
                  <small>Los herederos la recibirán cuando se active el protocolo póstumo</small>
                </div>
              </div>

              {!postPartida && (
                <div className="cp-fecha-wrap">
                  <label>O elegí una fecha de envío programada:</label>
                  <input
                    type="date"
                    className="cp-input"
                    value={fechaEnvio}
                    onChange={e => setFechaEnvio(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {!fechaEnvio && (
                    <div className="cp-aviso">
                      <AlertCircle size={13} strokeWidth={2}/>
                      Sin fecha se guardará como borrador hasta que elijas cuándo enviarla
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Personalización */}
            <div className="cp-seccion">
              <h3 className="cp-seccion__titulo">🎨 Estilo de la carta</h3>

              {/* Papel */}
              <div className="cp-opcion-grupo">
                <label>Papel</label>
                <div className="cp-opciones-papel">
                  {PAPELES.map(p => (
                    <button key={p.id}
                      className={`cp-papel-btn${papel===p.id?' active':''}`}
                      style={{background:p.bg, borderColor: papel===p.id ? '#C9932A' : p.borde}}
                      onClick={() => setPapel(p.id)}
                      title={p.label}
                    >
                      <span style={{fontSize:'0.55rem',color:p.id==='elegante'?'#fff':'#333'}}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipografía */}
              <div className="cp-opcion-grupo">
                <label>Tipografía</label>
                <div className="cp-opciones-fila">
                  {FUENTES.map(f => (
                    <button key={f.id}
                      className={`cp-opcion-btn${fuente===f.id?' active':''}`}
                      onClick={() => setFuente(f.id)}
                    >{f.label}</button>
                  ))}
                </div>
              </div>

              {/* Color de tinta */}
              <div className="cp-opcion-grupo">
                <label>Color de tinta</label>
                <div className="cp-opciones-tinta">
                  {TINTAS.map(t => (
                    <button key={t.id}
                      className={`cp-tinta-btn${tinta===t.id?' active':''}`}
                      style={{background:t.color, borderColor:tinta===t.id?'#C9932A':'transparent'}}
                      onClick={() => setTinta(t.id)}
                      title={t.label}
                    />
                  ))}
                </div>
              </div>

              {/* Sello */}
              <div className="cp-opcion-grupo">
                <label>Sello decorativo</label>
                <div className="cp-opciones-fila">
                  {SELLOS.map(s => (
                    <button key={s.id}
                      className={`cp-sello-btn${sello===s.id?' active':''}`}
                      onClick={() => setSello(s.id)}
                    >
                      {s.emoji || '—'} <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="cp-editor-acciones">
              <button className="cp-btn-borrador"
                onClick={() => guardarCarta('borrador')}>
                Guardar borrador
              </button>
              <button
                className="cp-btn-guardar"
                disabled={!contenido || !(destinatario || destinatarioCustom) || !asunto || guardado}
                onClick={() => guardarCarta(postPartida ? 'post_partida' : fechaEnvio ? 'programada' : 'borrador')}
              >
                {guardado
                  ? <><Check size={15} strokeWidth={2}/> ¡Guardada!</>
                  : postPartida
                  ? <><Send size={15} strokeWidth={2}/> Programar post partida</>
                  : fechaEnvio
                  ? <><Send size={15} strokeWidth={2}/> Programar envío</>
                  : <><Check size={15} strokeWidth={2}/> Guardar carta</>
                }
              </button>
            </div>
          </div>

          {/* ── Panel derecho: preview ── */}
          {previewVisible && (
            <div className="cp-preview-panel">
              <div className="cp-preview-label">Vista previa</div>
              <div
                className={`cp-carta-preview cp-${fuenteActual.clase}`}
                style={{
                  background: papelActual.bg,
                  borderColor: papelActual.borde,
                  color: tintaActual.color,
                }}
              >
                {selloActual.emoji && (
                  <div className="cp-preview-sello" style={{color: tintaActual.color}}>
                    {selloActual.emoji}
                  </div>
                )}
                <div className="cp-preview-meta" style={{color:`${tintaActual.color}80`}}>
                  <span>Para: {destinatario || destinatarioCustom || '...'}</span>
                  <span>{postPartida ? '🕊️ Post partida' : fechaEnvio || 'Sin fecha'}</span>
                </div>
                <h2 className="cp-preview-asunto" style={{color: tintaActual.color}}>
                  {asunto || 'Asunto de la carta...'}
                </h2>
                <div className="cp-preview-contenido" style={{color: tintaActual.color}}>
                  {contenido || 'El contenido de tu carta aparecerá aquí mientras escribís...'}
                </div>
                <div className="cp-preview-firma" style={{color:`${tintaActual.color}80`}}>
                  Con amor ♥
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
