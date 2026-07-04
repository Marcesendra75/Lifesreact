// ============================================
// LIFE'S — Muro Biográfico
// Lucide React | Links corregidos | with-navbar
// ============================================
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Settings, Share2, MapPin, Edit2,
  Camera, Users, GitBranch, Globe, Cake, Star,
  Activity, BookOpen, Map, Image, Shield, Coins,
  Film, Zap, Hourglass, Mail, CreditCard, Lock,
  ArrowRight, LayoutDashboard, User, ChevronRight,
} from 'lucide-react';
import './MuroBiografico.scss';

// ── Capítulos de vida ──────────────────────────────────────
const CAPITULOS = [
  { id: 'infancia', emoji: '👶', label: 'Infancia', años: '1978 – 1990' },
  { id: 'juventud', emoji: '🎓', label: 'Juventud', años: '1990 – 2000' },
  { id: 'familia',  emoji: '❤️', label: 'Familia',  años: '2000 – 2010' },
  { id: 'logros',   emoji: '🏆', label: 'Logros',   años: '2010 – 2020' },
  { id: 'hoy',      emoji: '🌿', label: 'Hoy',      años: '2020 – hoy'  },
];

// ── Secciones hub ──────────────────────────────────────────
const SECCIONES = [
  { icono: <Activity  size={22} strokeWidth={1.6} />, label: 'Línea de Vida',    desc: 'Tu historia día a día',       path: '/linea-de-vida',    vault: false, color: '#855324', bg: 'rgba(133,83,36,0.08)'    },
  { icono: <GitBranch size={22} strokeWidth={1.6} />, label: 'Árbol Genealógico',desc: 'Tu linaje y raíces',          path: '/arbol-genealogico',vault: false, color: '#03192e', bg: 'rgba(3,25,46,0.06)'      },
  { icono: <Map       size={22} strokeWidth={1.6} />, label: 'Mapa del Linaje',  desc: 'Lugares de tu historia',      path: '/mapa-linaje',      vault: false, color: '#735c00', bg: 'rgba(115,92,0,0.08)'     },
  { icono: <Image     size={22} strokeWidth={1.6} />, label: 'Recuerdos',        desc: 'Fotos, videos y momentos',    path: '/feed',             vault: false, color: '#855324', bg: 'rgba(133,83,36,0.06)'    },
  { icono: <Shield    size={22} strokeWidth={1.6} />, label: 'Caja Fuerte',      desc: 'Documentos privados',         path: '/caja-fuerte',      vault: true,  color: '#C9A84C', bg: 'rgba(201,168,76,0.1)'    },
  { icono: <Coins     size={22} strokeWidth={1.6} />, label: 'Caja de Valores',  desc: 'Ahorro y herencia',           path: '/caja-de-valores',  vault: true,  color: '#C9A84C', bg: 'rgba(201,168,76,0.08)'   },
  { icono: <Film      size={22} strokeWidth={1.6} />, label: 'Último Tributo',   desc: 'Tu video de despedida',       path: '/ultimo-tributo',   vault: true,  color: '#03192e', bg: 'rgba(3,25,46,0.06)'      },
  { icono: <Zap       size={22} strokeWidth={1.6} />, label: 'Ecos IA',          desc: 'Tu yo digital para el futuro',path: '/ecos/1',           vault: false, color: '#735c00', bg: 'rgba(115,92,0,0.06)'     },
  { icono: <Hourglass size={22} strokeWidth={1.6} />, label: 'Cápsula del Tiempo',desc: 'Mensajes al futuro',         path: '/capsula-del-tiempo',vault:false, color: '#855324', bg: 'rgba(133,83,36,0.06)'    },
  { icono: <Mail      size={22} strokeWidth={1.6} />, label: 'Postal Digital',   desc: 'Enviar recuerdos físicos',    path: '/postal',           vault: false, color: '#03192e', bg: 'rgba(3,25,46,0.05)'      },
  { icono: <Users     size={22} strokeWidth={1.6} />, label: 'Vínculos',         desc: 'Seguidores y familia',        path: '/vinculos',         vault: false, color: '#855324', bg: 'rgba(133,83,36,0.06)'    },
  { icono: <CreditCard size={22} strokeWidth={1.6}/>, label: 'Tarjeta del Legado',desc: 'Tu nivel y beneficios',      path: '/tarjeta-legado',   vault: false, color: '#C9A84C', bg: 'rgba(201,168,76,0.08)'   },
];

// ── Recuerdos mock ─────────────────────────────────────────
const RECUERDOS_DESTACADOS = [
  { id: 1, imagen: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80', titulo: 'La vieja casa de campo', epoca: 'familia'  },
  { id: 2, imagen: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80', titulo: 'Primer día de escuela',  epoca: 'infancia' },
  { id: 3, imagen: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80', titulo: 'Graduación universitaria',epoca: 'juventud'},
  { id: 4, imagen: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80', titulo: 'Viaje a Patagonia',      epoca: 'logros'   },
];

// ── Componente ─────────────────────────────────────────────
export default function MuroBiografico() {
  const navigate      = useNavigate();
  const { userId }    = useParams();
  const esPropio      = !userId;
  const [capituloActivo, setCapituloActivo] = useState('todos');

  // En desarrollo: ir directo a todas las rutas sin auth
  const handleNav = (path: string) => navigate(path);

  return (
    <div className="mb-root with-navbar">

      {/* ── HEADER ── */}
      <header className="mb-header">
        <div className="mb-header__inner">
          <button className="mb-header__back" onClick={() => navigate('/feed')}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <h1 className="mb-header__title">El Legado</h1>
          <div className="mb-header__actions">
            {esPropio && (
              <button className="mb-header__btn" onClick={() => navigate('/configuracion')}>
                <Settings size={20} strokeWidth={1.8} />
              </button>
            )}
            <button className="mb-header__btn">
              <Share2 size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <main className="mb-main">

        {/* ── PORTADA ── */}
        <section className="mb-portada">
          <div className="mb-portada__cover">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80" alt="Portada" />
            <div className="mb-portada__cover-overlay" />
            <div className="mb-portada__frase">
              <p>"Preservando los momentos que definen nuestra historia."</p>
            </div>
          </div>

          <div className="mb-portada__info">
            <div className="mb-portada__avatar-wrap">
              <img src="https://i.pravatar.cc/160?img=11" alt="Julian Valenzuela" />
              <div className="mb-portada__nivel">
                <Star size={14} strokeWidth={0} fill="#C9A84C" />
              </div>
            </div>

            <div className="mb-portada__texto">
              <h2 className="mb-portada__nombre">Julian Valenzuela</h2>
              <p className="mb-portada__rol">Archivista de Recuerdos Familiares</p>
              <div className="mb-portada__origen">
                <MapPin size={13} strokeWidth={1.8} />
                Mendoza, Argentina · Desde 1978
              </div>
            </div>

            {esPropio && (
              <button className="mb-portada__edit" onClick={() => navigate('/perfil')}>
                <Edit2 size={14} strokeWidth={1.8} />
                Editar perfil
              </button>
            )}
          </div>
        </section>

        {/* ── LEGADO EN NÚMEROS ── */}
        <section className="mb-numeros">
          {[
            { valor: '482', label: 'Recuerdos',      icono: <Camera    size={18} strokeWidth={1.6} />, path: '/feed'              },
            { valor: '124', label: 'Vínculos',        icono: <Users     size={18} strokeWidth={1.6} />, path: '/vinculos'          },
            { valor: '3',   label: 'Generaciones',    icono: <GitBranch size={18} strokeWidth={1.6} />, path: '/arbol-genealogico' },
            { valor: '5',   label: 'Países',          icono: <Globe     size={18} strokeWidth={1.6} />, path: '/mapa-linaje'       },
            { valor: '47',  label: 'Años de vida',    icono: <Cake      size={18} strokeWidth={1.6} />, path: '/linea-de-vida'     },
            { valor: '12',  label: 'Hitos guardados', icono: <Star      size={18} strokeWidth={1.6} />, path: '/linea-de-vida'     },
          ].map(n => (
            <button key={n.label} className="mb-numero" onClick={() => navigate(n.path)}>
              <span className="mb-numero__icon">{n.icono}</span>
              <span className="mb-numero__val">{n.valor}</span>
              <span className="mb-numero__label">{n.label}</span>
            </button>
          ))}
        </section>

        {/* ── CAPÍTULOS DE VIDA ── */}
        <section className="mb-capitulos-section">
          <div className="mb-section-header">
            <h3 className="mb-section-title">
              <BookOpen size={18} strokeWidth={1.8} />
              Capítulos de vida
            </h3>
            <button className="mb-section-link" onClick={() => navigate('/linea-de-vida')}>
              Ver todo <ArrowRight size={14} strokeWidth={1.8} />
            </button>
          </div>
          <div className="mb-capitulos">
            {CAPITULOS.map(c => (
              <button
                key={c.id}
                className={`mb-capitulo ${capituloActivo === c.id ? 'active' : ''}`}
                onClick={() => { setCapituloActivo(c.id); navigate(`/linea-de-vida?epoca=${c.id}`); }}
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
              <Image size={18} strokeWidth={1.8} />
              Recuerdos destacados
            </h3>
            <button className="mb-section-link" onClick={() => navigate('/feed')}>
              Ver todos <ArrowRight size={14} strokeWidth={1.8} />
            </button>
          </div>
          <div className="mb-recuerdos-grid">
            {RECUERDOS_DESTACADOS.map(r => (
              <div key={r.id} className="mb-recuerdo" onClick={() => navigate('/linea-de-vida')}>
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
              <LayoutDashboard size={18} strokeWidth={1.8} />
              Mi legado completo
            </h3>
          </div>
          <div className="mb-hub-grid">
            {SECCIONES.map(s => (
              <button
                key={s.path}
                className="mb-hub-item"
                onClick={() => handleNav(s.path)}
                style={{ background: s.bg }}
              >
                <div className="mb-hub-item__icon-wrap" style={{ color: s.color }}>
                  {s.icono}
                  {s.vault && (
                    <span className="mb-hub-item__lock">
                      <Lock size={10} strokeWidth={2.5} />
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
              <User size={18} strokeWidth={1.8} />
              Sobre mí
            </h3>
            {esPropio && (
              <button className="mb-section-link" onClick={() => navigate('/perfil')}>
                Editar <Edit2 size={13} strokeWidth={1.8} />
              </button>
            )}
          </div>
          <div className="mb-sobre-mi__card">
            <p className="mb-sobre-mi__texto">
              Preservando los momentos que definen nuestra historia. Un legado no es lo que dejamos
              atrás, sino lo que vive en los demás. Padre, esposo, archivista de recuerdos familiares.
            </p>
            <div className="mb-sobre-mi__datos">
              {[
                { icono: <Cake    size={15} strokeWidth={1.8} />, label: '15 de abril, 1978'      },
                { icono: <MapPin  size={15} strokeWidth={1.8} />, label: 'Mendoza, Argentina'      },
                { icono: <Star    size={15} strokeWidth={1.8} />, label: 'Archivista familiar'     },
                { icono: <Globe   size={15} strokeWidth={1.8} />, label: 'Origen: Italia / Argentina' },
              ].map(d => (
                <div key={d.label} className="mb-sobre-mi__dato">
                  {d.icono}
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FRASE FINAL ── */}
        <div className="mb-frase-final">
          <div className="mb-frase-final__linea" />
          <BookOpen size={20} strokeWidth={1.4} />
          <div className="mb-frase-final__linea" />
        </div>
        <p className="mb-frase-final__texto">
          "La memoria es el único paraíso del que no podemos ser expulsados."
        </p>

      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="mb-bottom-nav">
        {[
          { icono: <Activity   size={22} strokeWidth={1.6} />, label: 'Línea',  path: '/linea-de-vida',    active: false },
          { icono: <GitBranch  size={22} strokeWidth={1.6} />, label: 'Árbol',  path: '/arbol-genealogico',active: false },
          { icono: <User       size={22} strokeWidth={1.6} />, label: 'Perfil', path: '/muro-biografico',  active: true  },
          { icono: <Shield     size={22} strokeWidth={1.6} />, label: 'Bóveda', path: '/caja-fuerte',      active: false },
          { icono: <Zap        size={22} strokeWidth={1.6} />, label: 'Ecos',   path: '/ecos/1',           active: false },
        ].map(n => (
          <button
            key={n.path}
            className={`mb-bottom-nav__item ${n.active ? 'active' : ''}`}
            onClick={() => navigate(n.path)}
          >
            {n.icono}
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
