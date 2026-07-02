// ============================================================
// LIFE'S — Profile.tsx
// Vista pública + Drawer de edición lateral
// ============================================================
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.scss';

// ── Tipos ──────────────────────────────────────────────────
type NivelTarjeta = 'plata' | 'oro' | 'diamante' | 'platino';
type TipoVinculo  =
  | 'pareja' | 'padre' | 'madre' | 'hijo/a'
  | 'hermano/a' | 'abuelo/a' | 'amigo/a' | 'compañero/a';

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

// ── Datos mock ─────────────────────────────────────────────
const PERFIL_INICIAL: DatosPerfil = {
  nombre:          'Marcelo',
  apellido:        'García',
  fraseDeLegado:   'Viví cada momento como si fuera el último, amé como si fuera el primero.',
  bio:             'Padre, emprendedor y eterno curioso. Construí mi vida ladrillo a ladrillo, viajé por 12 países y aprendí que lo único que importa son las personas que elegís a tu lado.',
  fechaNacimiento: '1975-08-14',
  ciudad:          'Mendoza',
  pais:            'Argentina',
  trabajo:         'Broker de Seguros · Tu Seguro Salud',
  origen:          'Mendoza, Argentina',
  nivel:           'oro',
  portada:         'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80',
  avatar:          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  aniosVividos:    50,
  recuerdosTotal:  847,
  paises:          12,
  generaciones:    4,
  vinculos:        238,
  hitos:           34,
};

const CAPITULOS_INICIALES: Capitulo[] = [
  { id: '1', nombre: 'Infancia',     desde: 1975, hasta: 1987, color: '#7EC8E3' },
  { id: '2', nombre: 'Adolescencia', desde: 1988, hasta: 1993, color: '#A8D8A8' },
  { id: '3', nombre: 'Juventud',     desde: 1994, hasta: 2002, color: '#C9932A' },
  { id: '4', nombre: 'Adultez',      desde: 2003, hasta: 2018, color: '#E8847A' },
  { id: '5', nombre: 'Madurez',      desde: 2019, hasta: 2025, color: '#9B8EC4' },
];

const VINCULOS_INICIALES: Vinculo[] = [
  { id: '1', nombre: 'Elena García',   tipo: 'pareja',    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { id: '2', nombre: 'Sofía García',   tipo: 'hijo/a',    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
  { id: '3', nombre: 'Lucas García',   tipo: 'hijo/a',    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
  { id: '4', nombre: 'Roberto García', tipo: 'padre',     avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80' },
  { id: '5', nombre: 'Ana García',     tipo: 'hermano/a', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80' },
  { id: '6', nombre: 'Carlos Ruiz',    tipo: 'amigo/a',   avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80' },
];

const RECUERDOS_DESTACADOS: Recuerdo[] = [
  { id: '1', titulo: 'El día que nació Sofía',      foto: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80', fecha: '2001', lugar: 'Mendoza' },
  { id: '2', titulo: 'Viaje a Patagonia',            foto: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80', fecha: '2018', lugar: 'Patagonia' },
  { id: '3', titulo: 'Primer negocio propio',        foto: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80', fecha: '2005', lugar: 'Mendoza' },
];

const COLORES_DISPONIBLES = [
  '#7EC8E3', '#A8D8A8', '#C9932A', '#E8847A',
  '#9B8EC4', '#F6C90E', '#4ECDC4', '#FF6B6B',
];

const TIPOS_VINCULO: TipoVinculo[] = [
  'pareja', 'padre', 'madre', 'hijo/a',
  'hermano/a', 'abuelo/a', 'amigo/a', 'compañero/a',
];

// ── Helpers ────────────────────────────────────────────────
const NIVEL_CONFIG = {
  plata:    { label: 'Plata',    color: '#C0C0C0', bg: 'rgba(192,192,192,0.15)' },
  oro:      { label: 'Oro',      color: '#C9932A', bg: 'rgba(201,147,42,0.15)'  },
  diamante: { label: 'Diamante', color: '#7EC8E3', bg: 'rgba(126,200,227,0.15)' },
  platino:  { label: 'Platino',  color: '#9B8EC4', bg: 'rgba(155,142,196,0.15)' },
};

// ── Componente principal ───────────────────────────────────
export default function Profile() {
  const navigate = useNavigate();

  const [perfil,    setPerfil]    = useState<DatosPerfil>(PERFIL_INICIAL);
  const [capitulos, setCapitulos] = useState<Capitulo[]>(CAPITULOS_INICIALES);
  const [vinculos,  setVinculos]  = useState<Vinculo[]>(VINCULOS_INICIALES);

  // Drawer edición
  const [drawerAbierto,   setDrawerAbierto]   = useState(false);
  const [drawerSeccion,   setDrawerSeccion]   = useState<'perfil' | 'barra' | 'vinculos'>('perfil');

  // Edición temporal (se aplica al guardar)
  const [editPerfil,    setEditPerfil]    = useState<DatosPerfil>(PERFIL_INICIAL);
  const [editCapitulos, setEditCapitulos] = useState<Capitulo[]>(CAPITULOS_INICIALES);
  const [editVinculos,  setEditVinculos]  = useState<Vinculo[]>(VINCULOS_INICIALES);

  // Tooltip barra de vida
  const [tooltipCap, setTooltipCap] = useState<Capitulo | null>(null);
  const [tooltipX,   setTooltipX]   = useState(0);

  const barraRef = useRef<HTMLDivElement>(null);

  // ── Barra de vida: calcular anchos ──
  const anioMin  = Math.min(...capitulos.map(c => c.desde));
  const anioMax  = Math.max(...capitulos.map(c => c.hasta));
  const totalAños = anioMax - anioMin || 1;

  const getPct = (c: Capitulo) =>
    ((c.hasta - c.desde) / totalAños) * 100;

  // ── Abrir drawer ──
  const abrirDrawer = (seccion: typeof drawerSeccion) => {
    setEditPerfil({ ...perfil });
    setEditCapitulos(capitulos.map(c => ({ ...c })));
    setEditVinculos(vinculos.map(v => ({ ...v })));
    setDrawerSeccion(seccion);
    setDrawerAbierto(true);
  };

  // ── Guardar cambios ──
  const guardar = () => {
    setPerfil({ ...editPerfil });
    setCapitulos([...editCapitulos]);
    setVinculos([...editVinculos]);
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
          {/* Avatar */}
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

          {/* Info */}
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

          {/* Botón editar */}
          <button
            className="profile-hero__editar"
            onClick={() => abrirDrawer('perfil')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar perfil
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          ② BARRA DE VIDA
      ════════════════════════════════════════════════ */}
      <section className="profile-barra-wrap">
        <div className="profile-barra-header">
          <div>
            <span className="profile-seccion-eyebrow">Tu historia</span>
            <h2 className="profile-seccion-titulo">Barra de Vida</h2>
          </div>
          <button
            className="profile-btn-editar-sec"
            onClick={() => abrirDrawer('barra')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar capítulos
          </button>
        </div>

        {/* Línea de años */}
        <div className="profile-barra-anos">
          {capitulos.map(c => (
            <div
              key={c.id}
              className="profile-barra-ano"
              style={{ width: `${getPct(c)}%` }}
            >
              {c.desde}
            </div>
          ))}
          <div className="profile-barra-ano profile-barra-ano--ultimo">
            {anioMax}
          </div>
        </div>

        {/* Barra principal */}
        <div className="profile-barra" ref={barraRef}>
          {capitulos.map((c, i) => (
            <div
              key={c.id}
              className="profile-barra__cap"
              style={{
                width:      `${getPct(c)}%`,
                background: c.color,
                borderRadius: i === 0
                  ? '20px 0 0 20px'
                  : i === capitulos.length - 1
                  ? '0 20px 20px 0'
                  : '0',
              }}
              onMouseEnter={e => {
                setTooltipCap(c);
                const rect = barraRef.current?.getBoundingClientRect();
                const capRect = (e.target as HTMLElement).getBoundingClientRect();
                setTooltipX(capRect.left - (rect?.left ?? 0) + capRect.width / 2);
              }}
              onMouseLeave={() => setTooltipCap(null)}
            />
          ))}

          {/* Tooltip */}
          {tooltipCap && (
            <div
              className="profile-barra__tooltip"
              style={{ left: tooltipX }}
            >
              <strong>{tooltipCap.nombre}</strong>
              <span>{tooltipCap.desde} – {tooltipCap.hasta}</span>
              <span className="profile-barra__tooltip-dur">
                {tooltipCap.hasta - tooltipCap.desde} años
              </span>
            </div>
          )}
        </div>

        {/* Leyenda */}
        <div className="profile-barra-leyenda">
          {capitulos.map(c => (
            <div key={c.id} className="profile-barra-leyenda__item">
              <span
                className="profile-barra-leyenda__dot"
                style={{ background: c.color }}
              />
              <span>{c.nombre}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          ③ NÚMEROS CON ALMA
      ════════════════════════════════════════════════ */}
      <section className="profile-numeros">
        {[
          { valor: perfil.aniosVividos,    label: 'Años vividos',    icono: '⏳', ruta: null },
          { valor: perfil.recuerdosTotal,  label: 'Recuerdos',       icono: '📸', ruta: '/linea-de-vida' },
          { valor: perfil.paises,          label: 'Países',          icono: '🌍', ruta: null },
          { valor: perfil.generaciones,    label: 'Generaciones',    icono: '🌳', ruta: '/arbol-genealogico' },
          { valor: perfil.vinculos,        label: 'Vínculos',        icono: '🤝', ruta: null },
          { valor: perfil.hitos,           label: 'Hitos de vida',   icono: '⭐', ruta: '/linea-de-vida' },
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
          ④ MIS VÍNCULOS
      ════════════════════════════════════════════════ */}
      <section className="profile-vinculos-sec">
        <div className="profile-barra-header">
          <div>
            <span className="profile-seccion-eyebrow">Las personas que importan</span>
            <h2 className="profile-seccion-titulo">Mis Vínculos</h2>
          </div>
          <button
            className="profile-btn-editar-sec"
            onClick={() => abrirDrawer('vinculos')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </button>
        </div>

        <div className="profile-vinculos-grid">
          {vinculos.map(v => (
            <div key={v.id} className="profile-vinculo-card">
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
            onClick={() => navigate('/linea-de-vida')}
          >
            Ver todos →
          </button>
        </div>

        <div className="profile-recuerdos-grid">
          {RECUERDOS_DESTACADOS.map((r, i) => (
            <div
              key={r.id}
              className={`profile-recuerdo${i === 0 ? ' profile-recuerdo--grande' : ''}`}
              onClick={() => navigate('/linea-de-vida')}
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
          ⑥ SOBRE MÍ
      ════════════════════════════════════════════════ */}
      <section className="profile-sobre">
        <div className="profile-barra-header">
          <div>
            <span className="profile-seccion-eyebrow">Mi historia</span>
            <h2 className="profile-seccion-titulo">Sobre mí</h2>
          </div>
          <button
            className="profile-btn-editar-sec"
            onClick={() => abrirDrawer('perfil')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </button>
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
          ⑦ FRASE DE LEGADO
      ════════════════════════════════════════════════ */}
      <section className="profile-legado">
        <div className="profile-legado__comillas">"</div>
        <p className="profile-legado__frase">{perfil.fraseDeLegado}</p>
        <span className="profile-legado__firma">— {perfil.nombre} {perfil.apellido}</span>
      </section>


      {/* ════════════════════════════════════════════════
          DRAWER DE EDICIÓN
      ════════════════════════════════════════════════ */}
      {drawerAbierto && (
        <div className="profile-drawer-overlay" onClick={() => setDrawerAbierto(false)}>
          <aside
            className="profile-drawer"
            onClick={e => e.stopPropagation()}
          >
            {/* Header drawer */}
            <div className="profile-drawer__header">
              <div className="profile-drawer__tabs">
                {([
                  { id: 'perfil',   label: 'Perfil'    },
                  { id: 'barra',    label: 'Barra de Vida' },
                  { id: 'vinculos', label: 'Vínculos'  },
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

              {/* ── Tab Barra de Vida ── */}
              {drawerSeccion === 'barra' && (
                <div className="profile-drawer__form">
                  <p className="profile-drawer__hint">
                    Definí los capítulos de tu vida. Cada uno tiene un nombre, rango de años y color.
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
