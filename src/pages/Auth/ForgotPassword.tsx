// ============================================================
// LIFE'S — ForgotPassword.tsx
// Recuperar contraseña con código de 6 dígitos, conectado al backend real
// Ruta: /recuperar
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, ArrowLeft, CheckCircle, AlertCircle,
  Eye, EyeOff, RefreshCw, Lock, ChevronRight,
  Shield,
} from 'lucide-react';
import { authService } from '../../services/api';
import './ForgotPassword.scss';

type Paso = 'email' | 'otp' | 'nueva-pass' | 'exito-pass';

// ── Helper: enmascarar email ────────────────────────────────
function enmascararEmail(email: string) {
  const [user, domain] = email.split('@');
  const visible = user.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(2, user.length - 2))}@${domain}`;
}

// ── Componente ──────────────────────────────────────────────
export default function ForgotPassword() {
  const navigate = useNavigate();

  const [paso, setPaso]         = useState<Paso>('email');
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  // OTP
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [segundos, setSegundos] = useState(15 * 60); // 15 min, igual que el backend
  const [otpExpirado, setOtpExpirado] = useState(false);
  const [codigoVerificado, setCodigoVerificado] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Nueva contraseña
  const [nuevaPass, setNuevaPass]         = useState('');
  const [confirmarPass, setConfirmarPass] = useState('');
  const [showNueva, setShowNueva]         = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const [emailMasked, setEmailMasked] = useState('');

  // ── Contador OTP ────────────────────────────────────────
  useEffect(() => {
    if (paso !== 'otp') return;
    setSegundos(15 * 60);
    setOtpExpirado(false);
    const interval = setInterval(() => {
      setSegundos(s => {
        if (s <= 1) {
          clearInterval(interval);
          setOtpExpirado(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paso]);

  const formatTiempo = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ── Paso 1: pedir el código ─────────────────────────────
  const verificarEmail = async () => {
    setError('');
    if (!email.trim()) { setError('Ingresá tu email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email inválido'); return; }

    setCargando(true);
    try {
      await authService.forgotPassword(email.toLowerCase().trim());
      setEmailMasked(enmascararEmail(email));
      setPaso('otp');
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setCargando(false);
    }
  };

  // ── Reenviar código ─────────────────────────────────────
  const reenviarOTP = async () => {
    setCargando(true);
    try {
      await authService.forgotPassword(email.toLowerCase().trim());
      setOtp(['', '', '', '', '', '']);
      setError('');
      setSegundos(15 * 60);
      setOtpExpirado(false);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Error al reenviar el código');
    } finally {
      setCargando(false);
    }
  };

  // ── Manejo input OTP ────────────────────────────────────
  const handleOtp = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const nuevo = [...otp];
    nuevo[idx] = val.slice(-1);
    setOtp(nuevo);
    setError('');
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (nuevo.every(d => d !== '')) {
      verificarOTP(nuevo.join(''));
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // ── Verificar código contra el backend real ─────────────
  const verificarOTP = async (codigo?: string) => {
    const c = codigo || otp.join('');
    setError('');
    if (c.length < 6) { setError('Ingresá los 6 dígitos'); return; }
    if (otpExpirado) { setError('El código expiró. Solicitá uno nuevo.'); return; }

    setCargando(true);
    try {
      await authService.verifyResetCode(email.toLowerCase().trim(), c);
      setCodigoVerificado(c);
      setPaso('nueva-pass');
    } catch (err: any) {
      setError(err.message || 'Código incorrecto');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setCargando(false);
    }
  };

  // ── Validar contraseña (mismas reglas que el backend) ───
  const validarPass = (pass: string) => {
    if (pass.length < 8)          return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(pass))      return 'Al menos una mayúscula';
    if (!/[0-9]/.test(pass))      return 'Al menos un número';
    if (!/[^A-Za-z0-9]/.test(pass)) return 'Al menos un símbolo (ej: !@#$%)';
    return null;
  };

  const fortalezaPass = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8)         score++;
    if (pass.length >= 12)        score++;
    if (/[A-Z]/.test(pass))       score++;
    if (/[0-9]/.test(pass))       score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  // ── Guardar nueva contraseña en el backend real ─────────
  const guardarNuevaPass = async () => {
    setError('');
    const err = validarPass(nuevaPass);
    if (err) { setError(err); return; }
    if (nuevaPass !== confirmarPass) { setError('Las contraseñas no coinciden'); return; }

    setCargando(true);
    try {
      await authService.resetPassword(email.toLowerCase().trim(), codigoVerificado, nuevaPass);
      setPaso('exito-pass');
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setCargando(false);
    }
  };

  const score = fortalezaPass(nuevaPass);
  const fortalezaLabel = ['', 'Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'][score];
  const fortalezaColor = ['', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1D9E75'][score];

  return (
    <div className="fp-page">
      <div className="fp-bg" />

      <div className="fp-wrap">

        {/* Logo */}
        <div className="fp-logo">
          <div className="fp-logo__shield">
            <Shield size={26} strokeWidth={1.4} />
          </div>
          <div>
            <span className="fp-logo__lifes">Life's</span>
            <span className="fp-logo__badge">🔑 Recuperar contraseña</span>
          </div>
        </div>

        {/* ══ PASO: EMAIL ══ */}
        {paso === 'email' && (
          <div className="fp-card">
            <div className="fp-card__header">
              <Lock size={20} strokeWidth={1.6} />
              <div>
                <h2>Recuperar contraseña</h2>
                <p>Te enviamos un código al email de tu cuenta</p>
              </div>
            </div>

            <div className="fp-form">
              <div className="fp-campo">
                <label>Email de tu cuenta</label>
                <div className="fp-input-wrap">
                  <Mail size={15} className="fp-input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    autoFocus
                    className={error ? 'error' : ''}
                    onKeyDown={e => e.key === 'Enter' && verificarEmail()}
                  />
                </div>
              </div>

              {error && (
                <div className="fp-error">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button className="fp-btn-primary" onClick={verificarEmail} disabled={cargando}>
                {cargando
                  ? <span className="fp-loader" />
                  : <>Enviar código <ChevronRight size={15} /></>
                }
              </button>
            </div>

            <button className="fp-link" onClick={() => navigate('/')}>
              <ArrowLeft size={13} /> Volver al inicio
            </button>
          </div>
        )}

        {/* ══ PASO: OTP ══ */}
        {paso === 'otp' && (
          <div className="fp-card">
            <div className="fp-card__header">
              <Mail size={20} strokeWidth={1.6} />
              <div>
                <h2>Revisá tu email</h2>
                <p>Enviamos un código a <strong>{emailMasked}</strong></p>
              </div>
            </div>

            <div className="fp-otp-wrap">
              <p className="fp-otp-label">Ingresá el código de 6 dígitos</p>
              <div className="fp-otp-inputs">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtp(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    className={`fp-otp-input${error ? ' error' : ''}${otpExpirado ? ' expired' : ''}`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <div className={`fp-timer${otpExpirado ? ' expired' : ''}`}>
                {otpExpirado
                  ? 'El código expiró'
                  : <>El código expira en <strong>{formatTiempo(segundos)}</strong></>
                }
              </div>

              {error && (
                <div className="fp-error">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {cargando && (
                <div className="fp-verificando">
                  <span className="fp-loader" /> Verificando...
                </div>
              )}
            </div>

            <button
              className="fp-btn-secondary"
              onClick={reenviarOTP}
              disabled={cargando || (!otpExpirado && segundos > 14 * 60)}
            >
              <RefreshCw size={14} />
              {otpExpirado ? 'Solicitar nuevo código' : 'Reenviar código'}
            </button>

            <button className="fp-link" onClick={() => { setPaso('email'); setOtp(['','','','','','']); setError(''); }}>
              <ArrowLeft size={13} /> Volver
            </button>
          </div>
        )}

        {/* ══ PASO: NUEVA CONTRASEÑA ══ */}
        {paso === 'nueva-pass' && (
          <div className="fp-card">
            <div className="fp-card__header">
              <Lock size={20} strokeWidth={1.6} />
              <div>
                <h2>Nueva contraseña</h2>
                <p>Elegí una contraseña segura para tu cuenta</p>
              </div>
            </div>

            <div className="fp-form">
              <div className="fp-campo">
                <label>Nueva contraseña</label>
                <div className="fp-input-wrap">
                  <Lock size={15} className="fp-input-icon" />
                  <input
                    type={showNueva ? 'text' : 'password'}
                    value={nuevaPass}
                    onChange={e => { setNuevaPass(e.target.value); setError(''); }}
                    placeholder="Mínimo 8 caracteres"
                    autoFocus
                    className={error ? 'error' : ''}
                  />
                  <button type="button" className="fp-toggle-pass"
                    onClick={() => setShowNueva(!showNueva)}>
                    {showNueva ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {nuevaPass && (
                  <div className="fp-fortaleza">
                    <div className="fp-fortaleza__barra">
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className="fp-fortaleza__segmento"
                          style={{ background: i <= score ? fortalezaColor : undefined }}
                        />
                      ))}
                    </div>
                    <span className="fp-fortaleza__label" style={{ color: fortalezaColor }}>
                      {fortalezaLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className="fp-campo">
                <label>Confirmar contraseña</label>
                <div className="fp-input-wrap">
                  <Lock size={15} className="fp-input-icon" />
                  <input
                    type={showConfirmar ? 'text' : 'password'}
                    value={confirmarPass}
                    onChange={e => { setConfirmarPass(e.target.value); setError(''); }}
                    placeholder="Repetí la contraseña"
                    className={error ? 'error' : ''}
                    onKeyDown={e => e.key === 'Enter' && guardarNuevaPass()}
                  />
                  <button type="button" className="fp-toggle-pass"
                    onClick={() => setShowConfirmar(!showConfirmar)}>
                    {showConfirmar ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {confirmarPass && nuevaPass === confirmarPass && (
                  <span className="fp-match">
                    <CheckCircle size={12} /> Las contraseñas coinciden
                  </span>
                )}
              </div>

              <div className="fp-requisitos">
                <span className={nuevaPass.length >= 8 ? 'ok' : ''}>✓ Mínimo 8 caracteres</span>
                <span className={/[A-Z]/.test(nuevaPass) ? 'ok' : ''}>✓ Una mayúscula</span>
                <span className={/[0-9]/.test(nuevaPass) ? 'ok' : ''}>✓ Un número</span>
                <span className={/[^A-Za-z0-9]/.test(nuevaPass) ? 'ok' : ''}>✓ Un símbolo</span>
              </div>

              {error && (
                <div className="fp-error">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button className="fp-btn-primary" onClick={guardarNuevaPass} disabled={cargando}>
                {cargando
                  ? <span className="fp-loader" />
                  : <>Guardar contraseña <ChevronRight size={15} /></>
                }
              </button>
            </div>
          </div>
        )}

        {/* ══ PASO: ÉXITO ══ */}
        {paso === 'exito-pass' && (
          <div className="fp-card fp-card--exito">
            <div className="fp-exito-icon">
              <CheckCircle size={48} strokeWidth={1.2} />
            </div>
            <h2>¡Contraseña actualizada!</h2>
            <p>Tu contraseña fue cambiada exitosamente. Ya podés ingresar con tu nueva contraseña.</p>
            <button className="fp-btn-primary" onClick={() => navigate('/login')}>
              Ir a Iniciar Sesión <ChevronRight size={15} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
