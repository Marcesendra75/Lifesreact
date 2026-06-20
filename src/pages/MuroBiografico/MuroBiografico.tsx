// ============================================
// LIFE'S — Muro Biográfico
// Hub central del legado personal
// ============================================
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './MuroBiografico.scss';

// ── Capítulos de vida ──
const CAPITULOS = [
  { id: 'infancia',  emoji: '👶', label: 'Infancia',  años: '1978 – 1990' },
  { id: 'juventud',  emoji: '🎓', label: 'Juventud',  años: '1990 – 2000' },
  { id: 'familia',   emoji: '❤️', label: 'Familia',   años: '2000 – 2010' },
  { id: 'logros',    emoji: '🏆', label: 'Logros',    años: '2010 – 2020' },
  { id: 'hoy',       emoji: '🌿', label: 'Hoy',       años: '2020 – hoy'  },
];

// ── Secciones del legado (botones hub) ──
const SECCIONES = [
  {
    icon:   'timeline',
    label:  'Línea de Vida',
    desc:   'Tu historia día a día',
    path:   '/linea-de-vida',
    vault:  false,
    color:  '#855324',
    bg:     'rgba(133,83,36,0.08)',
  },
  {
    icon:   'account_tree',
    label:  'Árbol Genealógico',
    desc:   'Tu linaje y raíces',
    path:   '/arbol-genealogico',
    vault:  false,
    color:  '#03192e',
    bg:     'rgba(3,25,46,0.06)',
  },
  {
    icon:   'map',
    label:  'Mapa del Linaje',
    desc:   'Lugares de tu historia',
    path:   '/mapa-linaje',
    vault:  false,
    color:  '#735c00',
    bg:     'rgba(115,92,0,0.08)',
  },
  {
    icon:   'photo_album',
    label:  'Recuerdos',
    desc:   'Fotos, videos y momentos',
    path:   '/feed',
    vault:  false,
    color:  '#855324',
    bg:     'rgba(133,83,36,0.06)',
  },
  {
    icon:   'inventory_2',
    label:  'Caja Fuerte',
    desc:   'Documentos privados',
    path:   '/caja-fuerte',
    vault:  true,
    color:  '#C9A84C',
    bg:     'rgba(201,168,76,0.1)',
  },
  {
    icon:   'savings',
    label:  'Caja de Valores',
    desc:   'Ahorro y herencia',
    path:   '/caja-de-valores',
    vault:  true,
    color:  '#C9A84C',
    bg:     'rgba(201,168,76,0.08)',
  },
  {
    icon:   'movie',
    label:  'Último Tributo',
    desc:   'Tu video de despedida',
    path:   '/ultimo-tributo',
    vault:  true,
    color:  '#03192e',
    bg:     'rgba(3,25,46,0.06)',
  },
  {
    icon:   'psychology',
    label:  'Ecos IA',
    desc:   'Tu yo digital para el futuro',
    path:   '/ecos/1',
    vault:  false,
    color:  '#735c00',
    bg:     'rgba(115,92,0,0.06)',
  },
  {
    icon:   'hourglass_top',
    label:  'Cápsula del Tiempo',
    desc:   'Mensajes al futuro',
    path:   '/capsula-del-tiempo',
    vault:  false,
    color:  '#855324',
    bg:     'rgba(133,83,36,0.06)',
  },
  {
    icon:   'local_post_office',
    label:  'Postal Digital',
    desc:   'Enviar recuerdos físicos',
    path:   '/postal',
    vault:  false,
    color:  '#03192e',
    bg:     'rgba(3,25,46,0.05)',
  },
  {
    icon:   'group',
    label:  'Vínculos',
    desc:   'Seguidores y familia',
    path:   '/vinculos',
    vault:  false,
    color:  '#855324',
    bg:     'rgba(133,83,36,0.06)',
  },
  {
    icon:   'credit_card',
    label:  'Tarjeta del Legado',
    desc:   'Tu nivel y beneficios',
    path:   '/tarjeta-legado',
    vault:  false,
    color:  '#C9A84C',
    bg:     'rgba(201,168,76,0.08)',
  },
];

// ── Recuerdos destacados mock ──
const RECUERDOS_DESTACADOS = [
  {
    id: 1,
    imagen: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80',
    titulo: 'La vieja casa de campo',
    epoca:  'familia',
  },
  {
    id: 2,
    imagen: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
    titulo: 'Primer día de escuela',
    epoca:  'infancia',
  },
  {
    id: 3,
    imagen: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
    titulo: 'Graduación universitaria',
    epoca:  'juventud',
  },
  {
    id: 4,
    imagen: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80',
    titulo: 'Viaje a Patagonia',
    epoca:  'logros',
  },
];

export default function MuroBiografico() {
  const navigate  = useNavigate();
  const { userId } = useParams();
  const esPropio  = !userId;

  const [capituloActivo, setCapituloActivo] = useState('todos');

  const handleNav = (path: string, vault: boolean) => {
    if (vault) {
      navigate(`/acceso-seguro?acceso=${encodeURIComponent(path)}&redirect=${encodeURIComponent(path)}`);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="mb-root">

      {/* ── HEADER ── */}
      <header className="mb-header">
        <div className="mb-header__inner">
          <button className="mb-header__back" onClick={() => navigate('/feed')}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="mb-header__title">El Legado</h1>
          <div className="mb-header__actions">
            {esPropio && (
              <button className="mb-header__btn" onClick={() => navigate('/configuracion')}>
                <span className="material-symbols-outlined">settings</span>
              </button>
            )}
            <button className="mb-header__btn">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mb-main">

        {/* ── PORTADA ── */}
        <section className="mb-portada">
          <div className="mb-portada__cover">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
              alt="Portada del legado"
            />
            <div className="mb-portada__cover-overlay" />
            {/* Frase de legado sobre la imagen */}
            <div className="mb-portada__frase">
              <p>"Preservando los momentos que definen nuestra historia."</p>
            </div>
          </div>

          <div className="mb-portada__info">
            <div className="mb-portada__avatar-wrap">
              <img src="https://i.pravatar.cc/160?img=11" alt="Julian Valenzuela" />
              <div className="mb-portada__nivel">
                <span className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24", color: '#C9A84C' }}>
                  workspace_premium
                </span>
              </div>
            </div>

            <div className="mb-portada__texto">
              <h2 className="mb-portada__nombre">Julian Valenzuela</h2>
              <p className="mb-portada__rol">Archivista de Recuerdos Familiares</p>
              <div className="mb-portada__origen">
                <span className="material-symbols-outlined">location_on</span>
                Mendoza, Argentina · Desde 1978
              </div>
            </div>

            {esPropio && (
              <button className="mb-portada__edit" onClick={() => navigate('/perfil')}>
                <span className="material-symbols-outlined">edit</span>
                Editar perfil
              </button>
            )}
          </div>
        </section>

        {/* ── LEGADO EN NÚMEROS ── */}
        <section className="mb-numeros">
          {[
            { valor: '482',  label: 'Recuerdos',     icon: 'photo_camera',   path: '/feed' },
            { valor: '124',  label: 'Vínculos',       icon: 'group',          path: '/vinculos' },
            { valor: '3',    label: 'Generaciones',   icon: 'account_tree',   path: '/arbol-genealogico' },
            { valor: '5',    label: 'Países',         icon: 'public',         path: '/mapa-linaje' },
            { valor: '47',   label: 'Años de vida',   icon: 'cake',           path: '/linea-de-vida' },
            { valor: '12',   label: 'Hitos guardados',icon: 'emoji_events',   path: '/linea-de-vida' },
          ].map(n => (
            <button key={n.label} className="mb-numero" onClick={() => navigate(n.path)}>
              <span className="material-symbols-outlined mb-numero__icon"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                {n.icon}
              </span>
              <span className="mb-numero__val">{n.valor}</span>
              <span className="mb-numero__label">{n.label}</span>
            </button>
          ))}
        </section>

        {/* ── CAPÍTULOS DE VIDA ── */}
        <section className="mb-capitulos-section">
          <div className="mb-section-header">
            <h3 className="mb-section-title">
              <span className="material-symbols-outlined">auto_stories</span>
              Capítulos de vida
            </h3>
            <button className="mb-section-link" onClick={() => navigate('/linea-de-vida')}>
              Ver todo
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="mb-capitulos">
            {CAPITULOS.map(c => (
              <button
                key={c.id}
                className={`mb-capitulo ${capituloActivo === c.id ? 'active' : ''}`}
                onClick={() => {
                  setCapituloActivo(c.id);
                  navigate(`/linea-de-vida?epoca=${c.id}`);
                }}
              >
                <span className="mb-capitulo__emoji">{c.emoji}</span>
                <span className="mb-capitulo__label">{c.label}</span>
                <span className="mb-capitulo__años">{c.años}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── RECUERDOS DESTACADOS ── */}
        <section className="mb-recuerdos-section">
          <div className="mb-section-header">
            <h3 className="mb-section-title">
              <span className="material-symbols-outlined">photo_album</span>
              Recuerdos destacados
            </h3>
            <button className="mb-section-link" onClick={() => navigate('/feed')}>
              Ver todos
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="mb-recuerdos-grid">
            {RECUERDOS_DESTACADOS.map(r => (
              <div key={r.id} className="mb-recuerdo" onClick={() => navigate('/feed')}>
                <img src={r.imagen} alt={r.titulo} />
                <div className="mb-recuerdo__overlay">
                  <span className="mb-recuerdo__titulo">{r.titulo}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── HUB DE SECCIONES ── */}
        <section className="mb-hub">
          <div className="mb-section-header">
            <h3 className="mb-section-title">
              <span className="material-symbols-outlined">dashboard</span>
              Mi legado completo
            </h3>
          </div>

          <div className="mb-hub-grid">
            {SECCIONES.map(s => (
              <button
                key={s.path}
                className="mb-hub-item"
                onClick={() => handleNav(s.path, s.vault)}
                style={{ background: s.bg }}
              >
                <div className="mb-hub-item__icon-wrap" style={{ color: s.color }}>
                  <span className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                    {s.icon}
                  </span>
                  {s.vault && (
                    <span className="mb-hub-item__lock">
                      <span className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                        lock
                      </span>
                    </span>
                  )}
                </div>
                <span className="mb-hub-item__label">{s.label}</span>
                <span className="mb-hub-item__desc">{s.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── SOBRE MÍ ── */}
        <section className="mb-sobre-mi">
          <div className="mb-section-header">
            <h3 className="mb-section-title">
              <span className="material-symbols-outlined">person</span>
              Sobre mí
            </h3>
            {esPropio && (
              <button className="mb-section-link" onClick={() => navigate('/perfil')}>
                Editar
                <span className="material-symbols-outlined">edit</span>
              </button>
            )}
          </div>
          <div className="mb-sobre-mi__card">
            <p className="mb-sobre-mi__texto">
              Preservando los momentos que definen nuestra historia. Un legado no es lo que dejamos
              atrás, sino lo que vive en los demás. Padre, esposo, archivista de recuerdos familiares.
              Creo que cada historia merece ser contada y recordada para siempre.
            </p>
            <div className="mb-sobre-mi__datos">
              {[
                { icon: 'cake',      label: '15 de abril, 1978' },
                { icon: 'location_on',label: 'Mendoza, Argentina' },
                { icon: 'work',      label: 'Archivista familiar' },
                { icon: 'public',    label: 'Origen: Italia / Argentina' },
              ].map(d => (
                <div key={d.label} className="mb-sobre-mi__dato">
                  <span className="material-symbols-outlined">{d.icon}</span>
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FRASE FINAL ── */}
        <div className="mb-frase-final">
          <div className="mb-frase-final__linea" />
          <span className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
            history_edu
          </span>
          <div className="mb-frase-final__linea" />
        </div>
        <p className="mb-frase-final__texto">
          "La memoria es el único paraíso del que no podemos ser expulsados."
        </p>

      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="mb-bottom-nav">
        {[
          { icon: 'timeline',    label: 'Línea',   path: '/linea-de-vida',    vault: false, active: false },
          { icon: 'account_tree',label: 'Árbol',   path: '/arbol-genealogico',vault: false, active: false },
          { icon: 'person',      label: 'Perfil',  path: '/muro-biografico',  vault: false, active: true  },
          { icon: 'inventory_2', label: 'Bóveda',  path: '/caja-fuerte',      vault: true,  active: false },
          { icon: 'psychology',  label: 'Ecos IA', path: '/ecos/1',           vault: false, active: false },
        ].map(n => (
          <button
            key={n.path}
            className={`mb-bottom-nav__item ${n.active ? 'active' : ''}`}
            onClick={() => handleNav(n.path, n.vault)}
          >
            <span className="material-symbols-outlined"
              style={n.active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}>
              {n.icon}
            </span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
