// ============================================================
// LIFE'S — LoginLifesAdmin.tsx | Login Panel Admin General
// Acceso exclusivo equipo interno Life's
// Lucide React | SCSS | Sin navbar
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Shield, LogIn, AlertCircle,
  Lock, Mail, Crown,
} from 'lucide-react';
import './LoginLifesAdmin.scss';

// ── Usuarios de prueba ─────────────────────────────────────
const USUARIOS = [
  { email:'superadmin@lifes.com',    password:'Lifes2026!',   nombre:'Marcelo García',    rol:'Superadmin',           color:'#C9932A' },
  { email:'admin@lifes.com',         password:'Admin2026!',   nombre:'Admin Operaciones', rol:'Administrador',        color:'#3a5a8a' },
  { email:'supervisor@lifes.com',    password:'Super2026!',   nombre:'Laura Méndez',      rol:'Supervisor de Área',   color:'#4a7a4e' },
  { email:'facilitador@lifes.com',   password:'Facil2026!',   nombre:'Carlos Ruiz',       rol:'Facilitador de Admisión', color:'#855324' },
  { email:'dev@lifes.com',           password:'Dev2026!',     nombre:'Ana Technica',      rol:'Creador',              color:'#58a6ff' },
];

const ROL_COLORS: Record<string, string> = {
  'Superadmin':             '#C9932A',
  'Administrador':          '#3a5a8a',
  'Supervisor de Área':     '#4a7a4e',
  'Facilitador de Admisión':'#855324',
  'Creador':                '#58a6ff',
};

export default function LoginLifesAdmin() {
  const navigate = useNavigate();

  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState('');
  const [cargando,  setCargando]  = useState(false);
  const [mostrarCreds, setMostrarCreds] = useState(false);
  const [credSelec, setCredSelec] = useState<typeof USUARIOS[0] | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Completá todos los campos'); return; }

    setCargando(true);
    setTimeout(() => {
      const usuario = USUARIOS.find(
        u => u.email === email.trim().toLowerCase() && u.password === password
      );
      if (usuario) {
        // Guardar en sessionStorage para usar en el panel
        sessionStorage.setItem('la_usuario', JSON.stringify(usuario));
        // Log de acceso (simulado)
        const log = {
          usuario: usuario.nombre,
          rol: usuario.rol,
          fecha: new Date().toLocaleDateString('es-AR'),
          hora: new Date().toLocaleTimeString('es-AR'),
          resultado: 'Éxito',
        };
        const logs = JSON.parse(sessionStorage.getItem('la_logs') || '[]');
        sessionStorage.setItem('la_logs', JSON.stringify([log, ...logs]));
        navigate('/lifes-admin');
      } else {
        setError('Email o contraseña incorrectos');
        setCargando(false);
      }
    }, 800);
  };

  const autocompletar = (u: typeof USUARIOS[0]) => {
    setEmail(u.email);
    setPassword(u.password);
    setCredSelec(u);
    setError('');
  };

  return (
    <div className="lla-page">
      <div className="lla-bg" />

      <div className="lla-wrap">

        {/* Logo */}
        <div className="lla-logo">
          <div className="lla-logo__icono">
            <Crown size={26} strokeWidth={1.4} />
          </div>
          <div className="lla-logo__textos">
            <span className="lla-logo__lifes">Life's</span>
            <span className="lla-logo__badge">Panel de Administración General</span>
          </div>
        </div>

        {/* Card */}
        <div className="lla-card">
          <div className="lla-card__header">
            <Shield size={20} strokeWidth={1.6} className="lla-card__shield" />
            <div>
              <h1 className="lla-card__titulo">Acceso restringido</h1>
              <p className="lla-card__sub">Exclusivo para equipo interno Life's</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="lla-form">
            <div className="lla-campo">
              <label>Email</label>
              <div className="lla-input-wrap">
                <Mail size={15} strokeWidth={1.8} className="lla-input-icon" />
                <input
                  type="email"
                  placeholder="usuario@lifes.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  className={error ? 'error' : ''}
                />
              </div>
            </div>

            <div className="lla-campo">
              <label>Contraseña</label>
              <div className="lla-input-wrap">
                <Lock size={15} strokeWidth={1.8} className="lla-input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  className={error ? 'error' : ''}
                />
                <button type="button" className="lla-toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={15} strokeWidth={1.8}/> : <Eye size={15} strokeWidth={1.8}/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="lla-error">
                <AlertCircle size={14} strokeWidth={2}/>
                {error}
              </div>
            )}

            <button type="submit" className="lla-btn-submit" disabled={cargando}>
              {cargando
                ? <span className="lla-btn-submit__loader"/>
                : <><LogIn size={16} strokeWidth={2}/> Ingresar al panel</>
              }
            </button>
          </form>

          <div className="lla-links">
            <button className="lla-link" onClick={() => navigate('/')}>
              ← Volver al sitio
            </button>
            <button className="lla-link" onClick={() => navigate('/recuperar')}>
              ¿Olvidé mi contraseña?
            </button>
          </div>
        </div>

        {/* Credenciales de prueba */}
        <div className="lla-test-creds">
          <button
            className="lla-test-creds__toggle"
            onClick={() => setMostrarCreds(!mostrarCreds)}
          >
            <Shield size={12} strokeWidth={2}/>
            {mostrarCreds ? 'Ocultar' : 'Ver'} usuarios de prueba
          </button>

          {mostrarCreds && (
            <div className="lla-test-creds__card">
              <p className="lla-test-creds__titulo">Seleccioná un usuario para autocompletar:</p>
              <div className="lla-test-creds__lista">
                {USUARIOS.map(u => (
                  <button
                    key={u.email}
                    className={`lla-test-creds__usuario${credSelec?.email === u.email ? ' selected' : ''}`}
                    onClick={() => autocompletar(u)}
                    style={credSelec?.email === u.email ? { borderColor: u.color } : {}}
                  >
                    <div className="lla-test-creds__rol-dot" style={{background: u.color}}/>
                    <div className="lla-test-creds__usuario-info">
                      <strong>{u.nombre}</strong>
                      <span style={{color: u.color}}>{u.rol}</span>
                      <span>{u.email}</span>
                    </div>
                    {credSelec?.email === u.email && (
                      <span className="lla-test-creds__check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="lla-footer">
          Life's · Sistema de Administración Interna · Acceso registrado y auditado
        </p>
      </div>
    </div>
  );
}
