// ============================================
// LIFE'S — Verificar Email
// ============================================
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.scss'; // reusa el mismo estilo visual del login

export default function VerificarEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setError('Falta el token de verificación en el link.');
      return;
    }

    verifyEmail(token)
      .then(() => setStatus('ok'))
      .catch((err: any) => {
        setStatus('error');
        setError(err.message || 'El link es inválido o ya venció.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="lg-root">
      <header className="lg-header">
        <div className="lg-header__inner">
          <span className="lg-header__name">Life's</span>
        </div>
      </header>

      <main className="lg-main">
        <div className="lg-card">
          {status === 'cargando' && (
            <>
              <h1 className="lg-card__title">Confirmando tu cuenta...</h1>
              <p className="lg-card__subtitle">Un momento, por favor.</p>
            </>
          )}

          {status === 'ok' && (
            <>
              <h1 className="lg-card__title">¡Cuenta confirmada!</h1>
              <p className="lg-card__subtitle">Ya podés empezar a guardar tus recuerdos.</p>
              <button className="lg-btn-submit" onClick={() => navigate('/feed')}>
                Ir a mi Feed
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="lg-card__title">No pudimos confirmar tu cuenta</h1>
              <p className="lg-card__subtitle">{error}</p>
              <button className="lg-btn-submit" onClick={() => navigate('/login')}>
                Volver al inicio de sesión
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
