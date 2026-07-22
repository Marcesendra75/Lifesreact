// ============================================================
// LIFE'S — LoginAdmin.tsx | Login Panel Admin Empresarial
// Lucide React | SCSS | Sin navbar
// Usuario de prueba: admin@bancnacion.com / Admin2026!
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Eye, EyeOff, Shield, LogIn,
  AlertCircle, Check, Lock, Mail,
} from 'lucide-react';
import './LoginAdmin.scss';

// ── Usuario de prueba ──────────────────────────────────────
const USUARIO_PRUEBA = {
  email:    'admin@banconacion.com',
  password: 'Admin2026!',
  nombre:   'Daniel Tillard',
  empresa:  'Banco Nación Argentina',
  rol:      'Administrador',
};

export default function LoginAdmin() {
  const navigate = useNavigate();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState('');
  const [cargando,   setCargando]   = useState(false);
  const [mostrarCredenciales, setMostrarCredenciales] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Completá todos los campos');
      return;
    }

    setCargando(true);

    // Simular delay de autenticación
    setTimeout(() => {
      if (
        email.trim().toLowerCase() === USUARIO_PRUEBA.email &&
        password === USUARIO_PRUEBA.password
      ) {
        // Login exitoso → ir al panel admin
        navigate('/empresas/admin');
      } else {
        setError('Email o contraseña incorrectos');
        setCargando(false);
      }
    }, 800);
  };

  const autocompletar = () => {
    setEmail(USUARIO_PRUEBA.email);
    setPassword(USUARIO_PRUEBA.password);
    setError('');
  };

  return (
    <div className="la-page">
      {/* Fondo con árbol sutil */}
      <div className="la-bg" />

      <div className="la-wrap">

        {/* Logo */}
        <div className="la-logo">
          <div className="la-logo__icono">
            <Building2 size={28} strokeWidth={1.4} />
          </div>
          <div className="la-logo__textos">
            <span className="la-logo__lifes">Life's</span>
            <span className="la-logo__badge">Panel Admin Empresarial</span>
          </div>
        </div>

        {/* Card login */}
        <div className="la-card">
          <div className="la-card__header">
            <Shield size={20} strokeWidth={1.6} className="la-card__shield" />
            <div>
              <h1 className="la-card__titulo">Acceso al panel</h1>
              <p className="la-card__sub">Solo para administradores verificados</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="la-form">

            {/* Email */}
            <div className="la-campo">
              <label>Email corporativo</label>
              <div className="la-input-wrap">
                <Mail size={15} strokeWidth={1.8} className="la-input-icon" />
                <input
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  className={error ? 'error' : ''}
                />
              </div>
            </div>

            {/* Password */}
            <div className="la-campo">
              <label>Contraseña</label>
              <div className="la-input-wrap">
                <Lock size={15} strokeWidth={1.8} className="la-input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  className={error ? 'error' : ''}
                />
                <button
                  type="button"
                  className="la-toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass
                    ? <EyeOff size={15} strokeWidth={1.8} />
                    : <Eye    size={15} strokeWidth={1.8} />
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="la-error">
                <AlertCircle size={14} strokeWidth={2} />
                {error}
              </div>
            )}

            {/* Botón login */}
            <button
              type="submit"
              className="la-btn-submit"
              disabled={cargando}
            >
              {cargando ? (
                <span className="la-btn-submit__loader" />
              ) : (
                <>
                  <LogIn size={16} strokeWidth={2} />
                  Ingresar al panel
                </>
              )}
            </button>

          </form>

          {/* Links */}
          <div className="la-links">
            <button
              className="la-link"
              onClick={() => navigate('/recuperar')}
            >
              ¿Olvidé mi contraseña?
            </button>
            <button
              className="la-link"
              onClick={() => navigate('/empresas')}
            >
              Volver a Empresas
            </button>
          </div>
        </div>

        {/* Credenciales de prueba */}
        <div className="la-test-creds">
          <button
            className="la-test-creds__toggle"
            onClick={() => setMostrarCredenciales(!mostrarCredenciales)}
          >
            <Shield size={12} strokeWidth={2} />
            {mostrarCredenciales ? 'Ocultar' : 'Ver'} credenciales de prueba
          </button>

          {mostrarCredenciales && (
            <div className="la-test-creds__card">
              <div className="la-test-creds__header">
                <span>🧪 Usuario de prueba</span>
                <button className="la-test-creds__usar" onClick={autocompletar}>
                  <Check size={11} strokeWidth={2.5} />
                  Autocompletar
                </button>
              </div>
              <div className="la-test-creds__datos">
                <div className="la-test-creds__dato">
                  <span>Empresa</span>
                  <strong>{USUARIO_PRUEBA.empresa}</strong>
                </div>
                <div className="la-test-creds__dato">
                  <span>Email</span>
                  <strong>{USUARIO_PRUEBA.email}</strong>
                </div>
                <div className="la-test-creds__dato">
                  <span>Contraseña</span>
                  <strong>{USUARIO_PRUEBA.password}</strong>
                </div>
                <div className="la-test-creds__dato">
                  <span>Rol</span>
                  <strong>{USUARIO_PRUEBA.rol}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="la-footer">
          Life's · Panel Admin Empresarial · Solo acceso autorizado
        </p>

      </div>
    </div>
  );
}
