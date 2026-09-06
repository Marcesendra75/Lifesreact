// ============================================
// LIFE'S — Landing Page (Personal + Empresas)
// ============================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User, Building2, LogIn, ArrowRight, GitBranch,
  Activity, Lock, Zap, Coins, Heart, Shield,
  UserPlus, TrendingUp, Users, BadgeCheck,
} from 'lucide-react';
import './Landing.scss';

type Mode = 'personal' | 'empresa';

const PALABRAS = ['recuerdos', 'emociones', 'momentos', 'personas', 'historias', 'legados'];

export default function Landing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [mode, setMode]             = useState<Mode>('personal');
  const [loginError, setLoginError] = useState('');
  const [palabra, setPalabra]       = useState(PALABRAS[0]);
  const [palabraAnim, setPalabraAnim] = useState<'in' | 'out' | ''>('');
  const [sliderStyle, setSliderStyle] = useState({ left: '4px', width: '0px' });

  const pillRef    = useRef<HTMLDivElement>(null);
  const emailRef   = useRef<HTMLInputElement>(null);
  const passRef    = useRef<HTMLInputElement>(null);
  const emailERef  = useRef<HTMLInputElement>(null);
  const passERef   = useRef<HTMLInputElement>(null);

  // Leer parámetro URL ?mode=empresa
  useEffect(() => {
    if (searchParams.get('mode') === 'empresa') setMode('empresa');
  }, [searchParams]);

  // Calcular slider
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

  // Animación Thanos en palabras
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

    const handleLogin = async (e: React.FormEvent, tipo: 'personal' | 'empresa') => {
    e.preventDefault();
    setLoginError('');

    // El login de Empresas es Fase 3 (todavía no tiene backend propio)
    if (tipo === 'empresa') {
      navigate(`/acceso-seguro?tipo=${tipo}`);
      return;
    }

    const email = emailRef.current?.value.trim();
    const password = passRef.current?.value;

    if (!email || !password) {
      setLoginError('Completá usuario/email y contraseña.');
      return;
    }

    try {
      await login({ email, password });
      navigate('/feed');
    } catch (err: any) {
      setLoginError(err.message || 'Email o contraseña incorrectos.');
    }
  };

  return (
    <div className="landing-root">
      {/* Orbes de fondo */}
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

            {/* Logo */}
            <div className="landing-logo" style={{ transform: 'rotate(-1deg)' }}>
              <div className="landing-logo__border" />
              <div className="landing-logo__wrap">
                <img src="/images/landing.png" alt="Life's" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Título */}
            <div className="landing-title">
              <h1 className="landing-title__main">Life's</h1>
              <p className="landing-title__sub">
                La vida es{' '}
                <span className={`landing-palabra landing-palabra--${palabraAnim}`}>
                  {palabra}
                </span>
              </p>
            </div>

            {/* Formulario */}
            {loginError && <div className="landing-error">{loginError}</div>}
            <form onSubmit={(e) => handleLogin(e, 'personal')} className="landing-form">
              <input
                ref={emailRef}
                className="landing-field"
                type="text"
                placeholder="Usuario o Email"
                autoComplete="username"
              />
              <input
                ref={passRef}
                className="landing-field"
                type="password"
                placeholder="Contraseña"
                autoComplete="current-password"
              />

              <button type="submit" className="landing-btn landing-btn--primary">
                <LogIn size={15} strokeWidth={2} />
                <span>Acceder</span>
              </button>
            </form>

            {/* Links recuperar */}
            <div className="landing-recover">
              <button className="landing-footer-link" onClick={() => navigate('/recuperar?tipo=usuario')}>
                ¿Olvidé mi usuario?
              </button>
              <button className="landing-footer-link" onClick={() => navigate('/recuperar?tipo=password')}>
                ¿Olvidé mi contraseña?
              </button>
            </div>

            {/* Separador */}
            <div className="landing-divider">¿Primera vez?</div>

            {/* Crear cuenta */}
            <button
              className="landing-btn landing-btn--outline"
              onClick={() => navigate('/crear-cuenta')}
            >
              <UserPlus size={15} strokeWidth={2} />
              Crear mi legado personal
            </button>

            {/* Feature tags */}
            <div className="landing-tags">
              {([
                { icono: <GitBranch  size={11} strokeWidth={2} />, label: 'Árbol genealógico' },
                { icono: <Activity   size={11} strokeWidth={2} />, label: 'Línea de vida'     },
                { icono: <Lock       size={11} strokeWidth={2} />, label: 'Caja fuerte'       },
                { icono: <Zap        size={11} strokeWidth={2} />, label: 'Ecos IA'           },
                { icono: <Coins      size={11} strokeWidth={2} />, label: 'Ahorro herederos'  },
                { icono: <Heart      size={11} strokeWidth={2} />, label: 'Cápsula del tiempo'},
              ] as const).map((t) => (
                <span key={t.label} className="landing-tag">
                  {t.icono}
                  {t.label}
                </span>
              ))}
            </div>

            {/* Switch a empresa */}
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

            {/* Logo empresas */}
            <div className="landing-logo">
              <div className="landing-logo__border" style={{ borderColor: 'rgba(3,25,46,0.2)' }} />
              <div className="landing-logo__wrap" style={{ background: 'white', padding: '8px' }}>
                <img src="/images/empresas.png" alt="Life's Empresas" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Badge */}
            <div className="landing-empresa-badge-wrap">
              <div className="landing-empresa-badge">
                <Building2 size={13} strokeWidth={2} />
                Life's Empresas
              </div>
            </div>

            {/* Título */}
            <div className="landing-title">
              <h2 className="landing-title__empresa">
                El legado<br />de tu organización
              </h2>
              <p className="landing-title__empresa-sub">
                Preservá la historia, cultura y ADN de tu empresa para las generaciones futuras.
              </p>
            </div>

            {/* Formulario empresa */}
            <form onSubmit={(e) => handleLogin(e, 'empresa')} className="landing-form">
              <input
                ref={emailERef}
                className="landing-field"
                type="email"
                placeholder="Email corporativo"
                autoComplete="email"
              />
              <input
                ref={passERef}
                className="landing-field"
                type="password"
                placeholder="Contraseña"
                autoComplete="current-password"
              />

              <button type="submit" className="landing-btn landing-btn--empresa">
                <Building2 size={15} strokeWidth={2} />
                Acceder al Perfil Corporativo
              </button>
            </form>

            {/* Links */}
            <div className="landing-recover">
              <button className="landing-footer-link" onClick={() => navigate('/recuperar')}>
                ¿Olvidé mis credenciales?
              </button>
              <button className="landing-footer-link" onClick={() => navigate('/acceso-seguro?tipo=empresa')}>
                Acceso seguro
              </button>
            </div>

            {/* Separador */}
            <div className="landing-divider">¿Tu empresa aún no está?</div>

            {/* Registrar empresa */}
            <button
              className="landing-btn landing-btn--outline landing-btn--empresas-cta"
              onClick={() => navigate('/empresas')}
            >
              <ArrowRight size={15} strokeWidth={2} />
              Solicitar perfil verificado
            </button>

            {/* Feature tags empresa */}
            <div className="landing-tags">
              {([
                { icono: <GitBranch  size={11} strokeWidth={2} />, label: 'Árbol organizacional' },
                { icono: <Activity   size={11} strokeWidth={2} />, label: 'Historia corporativa'  },
                { icono: <Users      size={11} strokeWidth={2} />, label: 'Personas clave'        },
                { icono: <BadgeCheck size={11} strokeWidth={2} />, label: 'Legado verificado'     },
                { icono: <TrendingUp size={11} strokeWidth={2} />, label: 'Monetización'          },
              ] as const).map((t) => (
                <span key={t.label} className="landing-tag">
                  {t.icono}
                  {t.label}
                </span>
              ))}
            </div>

            {/* Planes */}
            <div className="landing-planes">
              <div className="landing-planes__label">Planes disponibles</div>
              <div className="landing-planes__grid">
                {[
                  { id: 'starter',    nombre: 'Starter',     precio: '$500',   dark: false },
                  { id: 'pro',        nombre: 'Pro ⭐',      precio: '$1.200', dark: true  },
                  { id: 'enterprise', nombre: 'Enterprise',   precio: 'Custom', dark: false },
                ].map((p) => (
                  <button
                    key={p.id}
                    className={`landing-plan${p.dark ? ' landing-plan--dark' : ''}`}
                    onClick={() => navigate(`/empresas/planes#${p.id}`)}
                  >
                    <div className="landing-plan__nombre">{p.nombre}</div>
                    <div className="landing-plan__precio">{p.precio}</div>
                    <div className="landing-plan__periodo">/año</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Acceso Panel Admin */}
            <div className="landing-admin-acceso">
              <div className="landing-admin-acceso__divider">
                <span>Acceso directo</span>
              </div>
              <button
                className="landing-btn landing-btn--admin"
                onClick={() => navigate('/empresas/login-admin')}
              >
                <Shield size={15} strokeWidth={2} />
                Ingresar al Panel Admin
              </button>
              <p className="landing-admin-acceso__hint">
                Solo para administradores de organizaciones verificadas
              </p>
            </div>

            {/* Switch a personal */}
            <div className="landing-switch">
              <button className="landing-footer-link" onClick={() => setMode('personal')}>
                ← Acceso Personal
              </button>
            </div>
          </div>
        )}

      </div>{/* /landing-container */}
    </div>
  );
}
