// ============================================
// LIFE'S — Login
// ============================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import './Login.scss';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);

    if (!email || !password) {
      setError('Completá email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      navigate('/feed');
    } catch (err: any) {
      setError(err.message || 'Email o contraseña incorrectos.');
      if (err.message?.includes('confirmar tu email')) {
        setNeedsVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authService.resendVerification(email);
      setResendCooldown(120);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      // si falla el reenv\u00edo no hace falta mostrar nada distinto, el mensaje de arriba ya cubre el caso
    }
  };

  return (
    <div className="lg-root">

      <header className="lg-header">
        <div className="lg-header__inner">
          <button className="lg-header__logo" onClick={() => navigate('/')}>
            <img src="/images/landing.png" alt="Life's" className="lg-header__img" />
            <span className="lg-header__name">Life's</span>
          </button>
        </div>
      </header>

      <main className="lg-main">
        <div className="lg-card">

          <div className="lg-card__header">
            <h1 className="lg-card__title">Bienvenido de nuevo</h1>
            <p className="lg-card__subtitle">Accedé a tu archivo personal</p>
          </div>

          {error && (
            <div className="lg-error">
              {error}
              {needsVerification && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="lg-resend-btn"
                >
                  {resendCooldown > 0
                    ? `Reenviar en ${resendCooldown}s`
                    : 'Reenviar email de confirmación'}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="lg-form">
            <div className="lg-field">
              <label className="lg-field__label">Correo Electrónico</label>
              <input
                className="lg-field__input"
                type="email"
                placeholder="archivo@legado.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />
            </div>

            <div className="lg-field">
              <label className="lg-field__label">Contraseña</label>
              <input
                className="lg-field__input"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
            </div>

            <button type="button" className="lg-forgot" onClick={() => navigate('/recuperar')}>
              ¿Olvidaste tu contraseña?
            </button>

            <button type="submit" className="lg-btn-submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="lg-signup-link">
            <span>¿Todavía no sos custodio de tu historia?</span>
            <button type="button" className="lg-signup-link__btn" onClick={() => navigate('/crear-cuenta')}>
              Creá tu cuenta
            </button>
          </div>

        </div>
      </main>

    </div>
  );
}