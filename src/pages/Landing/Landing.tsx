// ============================================
// LIFE'S — Landing Page (Personal + Empresas)
// Lucide React | Rediseñada
// ============================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Building2, LogIn, ArrowRight, GitBranch,
  Activity, Lock, Zap, Coins, UserPlus,
  BadgeCheck, TrendingUp, Users, Film,
  Heart,
} from 'lucide-react';
import './Landing.scss';

type Mode = 'personal' | 'empresa';

const PALABRAS = ['recuerdos', 'emociones', 'momentos', 'personas', 'historias', 'legados'];

const TAGS_PERSONAL = [
  { icono: <GitBranch size={11} strokeWidth={2} />, label: 'Árbol genealógico' },
  { icono: <Activity  size={11} strokeWidth={2} />, label: 'Línea de vida'     },
  { icono: <Lock      size={11} strokeWidth={2} />, label: 'Caja fuerte'       },
  { icono: <Zap       size={11} strokeWidth={2} />, label: 'Ecos IA'           },
  { icono: <Coins     size={11} strokeWidth={2} />, label: 'Ahorro herederos'  },
  { icono: <Heart     size={11} strokeWidth={2} />, label: 'Cápsula del tiempo'},
];

const TAGS_EMPRESA = [
  { icono: <GitBranch  size={11} strokeWidth={2} />, label: 'Árbol organizacional' },
  { icono: <Activity   size={11} strokeWidth={2} />, label: 'Historia corporativa'  },
  { icono: <Users      size={11} strokeWidth={2} />, label: 'Personas clave'        },
  { icono: <BadgeCheck size={11} strokeWidth={2} />, label: 'Legado verificado'     },
  { icono: <TrendingUp size={11} strokeWidth={2} />, label: 'Monetización'          },
  { icono: <Film       size={11} strokeWidth={2} />, label: 'Archivo multimedia'    },
];

const PLANES = [
  { id: 'starter',    nombre: 'Starter',      precio: '$500',  dark: false },
  { id: 'pro',        nombre: 'Pro ⭐',        precio: '$1.200',dark: true  },
  { id: 'enterprise', nombre: 'Enterprise',   precio: 'Custom',dark: false },
];

export default function Landing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode]               = useState<Mode>('personal');
  const [palabra, setPalabra]         = useState(PALABRAS[0]);
  const [palabraAnim, setPalabraAnim] = useState<'in' | 'out' | ''>('');
  const [sliderStyle, setSliderStyle] = useState({ left: '4px', width: '0px' });

  const pillRef  = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef  = useRef<HTMLInputElement>(null);
  const emailERef= useRef<HTMLInputElement>(null);
  const passERef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('mode') === 'empresa') setMode('empresa');
  }, [searchParams]);

  useEffect(() => {
    const calcSlider = () => {
      if (!pillRef.current) return;
      const w = pillRef.current.offsetWidth - 8;
      const half = w / 2;
      setSliderStyle({
        left:  mode === 'personal' ? '4px' : `${half + 4}px`,
        width: `${half}px`,
      });
    };
    calcSlider();
    window.addEventListener('resize', calcSlider);
    return () => window.removeEventListener('resize', calcSlider);
  }, [mode]);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setPalabraAnim('out');
      setTimeout(() => {
        idx = (idx + 1) % PALABRAS.length;
        setPalabra(PALABRAS[idx]);
        setPalabraAnim('in');
      }, 700);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent, tipo: 'personal' | 'empresa') => {
    e.preventDefault();
    navigate(`/acceso-seguro?tipo=${tipo}`);
  };

  return (
    <div className="landing-root">
      <div className="landing-orb landing-orb--1" />
      <div className="landing-orb landing-orb--2" />

      <div className="landing-container">

        {/* ── PILL SELECTOR ── */}
        <div className="landing-pill" ref={pillRef}>
          <div className="landing-pill__slider" style={sliderStyle} />
          <button
            className={`landing-pill__btn${mode === 'personal' ? ' active' : ''}`}
            onClick={() => setMode('personal')}
          >
            <User size={14} strokeWidth={2} />
            Personal
          </button>
          <button
            className={`landing-pill__btn${mode === 'empresa' ? ' active' : ''}`}
            onClick={() => setMode('empresa')}
          >
            <Building2 size={14} strokeWidth={2} />
            Empresas
          </button>
        </div>

        {/* ══ SECCIÓN PERSONAL ══ */}
        {mode === 'personal' && (
          <div className="landing-section fade-up">

            <div className="landing-logo" style={{ transform: 'rotate(-1deg)' }}>
              <div className="landing-logo__border" />
              <div className="landing-logo__wrap">
                <img src="/images/landing.png" alt="Life's"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>

            <div className="landing-title">
              <h1 className="landing-title__main">Life's</h1>
              <p className="landing-title__sub">
                La vida es{' '}
                <span className={`landing-palabra landing-palabra--${palabraAnim}`}>
                  {palabra}
                </span>
              </p>
            </div>

            <form onSubmit={(e) => handleLogin(e, 'personal')} className="landing-form">
              <input ref={emailRef} className="landing-field"
                type="text" placeholder="Usuario o Email" autoComplete="username" />
              <input ref={passRef} className="landing-field"
                type="password" placeholder="Contraseña" autoComplete="current-password" />
              <button type="submit" className="landing-btn landing-btn--primary">
                <LogIn size={15} strokeWidth={2} />
                <span>Acceder</span>
              </button>
            </form>

            <div className="landing-recover">
              <button className="landing-footer-link" onClick={() => navigate('/recuperar?tipo=usuario')}>
                ¿Olvidé mi usuario?
              </button>
              <button className="landing-footer-link" onClick={() => navigate('/recuperar?tipo=password')}>
                ¿Olvidé mi contraseña?
              </button>
            </div>

            <div className="landing-divider">¿Primera vez?</div>

            <button className="landing-btn landing-btn--outline" onClick={() => navigate('/crear-cuenta')}>
              <UserPlus size={15} strokeWidth={2} />
              Crear mi legado personal
            </button>

            <div className="landing-tags">
              {TAGS_PERSONAL.map(t => (
                <span key={t.label} className="landing-tag">
                  {t.icono}
                  {t.label}
                </span>
              ))}
            </div>

            <div className="landing-switch">
              <button className="landing-footer-link" onClick={() => setMode('empresa')}>
                ¿Sos empresa? Accedé aquí →
              </button>
            </div>
          </div>
        )}

        {/* ══ SECCIÓN EMPRESAS ══ */}
        {mode === 'empresa' && (
          <div className="landing-section fade-up">

            <div className="landing-logo">
              <div className="landing-logo__border" style={{ borderColor: 'rgba(3,25,46,0.2)' }} />
              <div className="landing-logo__wrap landing-logo__wrap--dark">
                <Building2 size={52} strokeWidth={1.2} color="rgba(255,224,136,0.85)" />
              </div>
            </div>

            <div className="landing-empresa-badge-wrap">
              <div className="landing-empresa-badge">
                <Building2 size={13} strokeWidth={2} />
                Life's Empresas
              </div>
            </div>

            <div className="landing-title">
              <h2 className="landing-title__empresa">
                El legado<br />de tu organización
              </h2>
              <p className="landing-title__empresa-sub">
                Preservá la historia, cultura y ADN de tu empresa para las generaciones futuras.
              </p>
            </div>

            <form onSubmit={(e) => handleLogin(e, 'empresa')} className="landing-form">
              <input ref={emailERef} className="landing-field"
                type="email" placeholder="Email corporativo" autoComplete="email" />
              <input ref={passERef} className="landing-field"
                type="password" placeholder="Contraseña" autoComplete="current-password" />
              <button type="submit" className="landing-btn landing-btn--empresa">
                <Building2 size={15} strokeWidth={2} />
                Acceder al Perfil Corporativo
              </button>
            </form>

            <div className="landing-recover">
              <button className="landing-footer-link" onClick={() => navigate('/recuperar')}>
                ¿Olvidé mis credenciales?
              </button>
              <button className="landing-footer-link" onClick={() => navigate('/acceso-seguro?tipo=empresa')}>
                Acceso seguro
              </button>
            </div>

            <div className="landing-divider">¿Tu empresa aún no está?</div>

            <button
              className="landing-btn landing-btn--outline landing-btn--empresas-cta"
              onClick={() => navigate('/empresas')}
            >
              <ArrowRight size={15} strokeWidth={2} />
              Solicitar perfil verificado
            </button>

            <div className="landing-tags">
              {TAGS_EMPRESA.map(t => (
                <span key={t.label} className="landing-tag">
                  {t.icono}
                  {t.label}
                </span>
              ))}
            </div>

            {/* Planes */}
            <div className="landing-planes">
              <div className="landing-planes__label">Planes disponibles · USD/año</div>
              <div className="landing-planes__grid">
                {PLANES.map(p => (
                  <button
                    key={p.id}
                    className={`landing-plan${p.dark ? ' landing-plan--dark' : ''}`}
                    onClick={() => navigate(`/empresas#planes`)}
                  >
                    <div className="landing-plan__nombre">{p.nombre}</div>
                    <div className="landing-plan__precio">{p.precio}</div>
                    <div className="landing-plan__periodo">{p.dark ? '/año ⭐' : '/año'}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="landing-switch">
              <button className="landing-footer-link" onClick={() => setMode('personal')}>
                ← Acceso Personal
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
