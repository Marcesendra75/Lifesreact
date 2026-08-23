// ============================================================
// LIFE'S — ForgotPassword.tsx
// Recupero de contraseña (OTP 6 dígitos) y recupero de usuario
// Ruta: /recuperar?tipo=password | /recuperar?tipo=usuario
// Paleta: neblina azulada #EEF3F8
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail, ArrowLeft, CheckCircle, AlertCircle,
  Eye, EyeOff, RefreshCw, User, Lock, ChevronRight,
  Shield,
} from 'lucide-react';
import './ForgotPassword.scss';

// ── Usuarios de prueba (mismos que TripleSeguridad) ─────────
const USUARIOS_DB = [
  { email: 'juan@lifes.com',  usuario: 'julian.v',   nombre: 'Julian Valenzuela' },
  { email: 'maria@lifes.com', usuario: 'maria.lopez', nombre: 'María López'       },
  { email: 'admin@lifes.com', usuario: 'admin.lifes', nombre: 'Admin Life\'s'     },
];

// ── Tipos de flujo ──────────────────────────────────────────
type Tipo  = 'password' | 'usuario';
type Paso  = 'email' | 'otp' | 'nueva-pass' | 'exito-pass' | 'exito-usuario';

// ── Helper: enmascarar email ────────────────────────────────
function enmascararEmail(email: string) {
  const [user, domain] = email.split('@');
  const visible = user.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(2, user.length - 2))}@${domain}`;
}

// ── Helper: enmascarar usuario ──────────────────────────────
function enmascararUsuario(usuario: string) {
  const visible = usuario.slice(0, 3);
  return `${visible}${'*'.repeat(Math.max(2, usuario.length - 3))}`;
}

// ── Generar OTP simulado ────────────────────────────────────
function generarOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Componente ──────────────────────────────────────────────
export default function ForgotPassword() {
  const navigate      = useNavigate();
  const [searchParams] = useSearchParams();
  const tipo: Tipo    = (searchParams.get('tipo') as Tipo) || 'password';

  const [paso, setPaso]         = useState<Paso>('email');
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  // OTP
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [otpGen, setOtpGen]     = useState('');
  const [segundos, setSegundos] = useState(15 * 60); // 15 min
  const [otpExpirado, setOtpExpirado] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Nueva contraseña
  const [nuevaPass, setNuevaPass]       = useState('');
  const [confirmarPass, setConfirmarPass] = useState('');
  const [showNueva, setShowNueva]       = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  // Datos encontrados
  const [usuarioEncontrado, setUsuarioEncontrado] = useState('');
  const [emailMasked, setEmailMasked]             = useState('');

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
  }, [paso, otpGen]); // otpGen como dep para reiniciar al reenviar

  const formatTiempo = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ── Paso 1: verificar email ─────────────────────────────
  const verificarEmail = () => {
    setError('');
    if (!email.trim()) { setError('Ingresá tu email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email inválido'); return; }

    setCargando(true);
    setTimeout(() => {
      const user = USUARIOS_DB.find(u => u.email === email.toLowerCase().trim());

      if (tipo === 'password') {
        // Siempre mostramos éxito para no revelar si el email existe (seguridad)
        const codigo = generarOTP();
        setOtpGen(codigo);
        console.info(`[DEV] OTP generado: ${codigo}`); // Solo en dev
        setEmailMasked(enmascararEmail(email));
        setCargando(false);
        setPaso('otp');
      } else {
        // Recupero de usuario
        if (user) {
          setUsuarioEncontrado(user.usuario);
          setEmailMasked(enmascararEmail(email));
          setCargando(false);
          setPaso('exito-usuario');
        } else {
          // Respuesta genérica por seguridad
          setEmailMasked(enmascararEmail(email));
          setCargando(false);
          setPaso('exito-usuario');
        }
      }
    }, 800);
  };

  // ── Reenviar OTP ────────────────────────────────────────
  const reenviarOTP = () => {
    const codigo = generarOTP();
    setOtpGen(codigo);
    console.info(`[DEV] OTP reenviado: ${codigo}`);
    setOtp(['', '', '', '', '', '']);
    setError('');
    otpRefs.current[0]?.focus();
  };

  // ── Manejo input OTP ────────────────────────────────────
  const handleOtp = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const nuevo = [...otp];
    nuevo[idx] = val.slice(-1);
    setOtp(nuevo);
    setError('');
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    // Auto-verificar al completar
    if (nuevo.every(d => d !== '')) {
      verificarOTP(nuevo.join(''));
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // ── Verificar OTP ───────────────────────────────────────
  const verificarOTP = (codigo?: string) => {
    const c = codigo || otp.join('');
    setError('');
    if (c.length < 6) { setError('Ingresá los 6 dígitos'); return; }
    if (otpExpirado) { setError('El código expiró. Solicitá uno nuevo.'); return; }
    setCargando(true);
    setTimeout(() => {
      if (c === otpGen) {
        setCargando(false);
        setPaso('nueva-pass');
      } else {
        setError('Código incorrecto');
        setCargando(false);
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    }, 500);
  };

  // ── Validar contraseña ──────────────────────────────────
  const validarPass = (pass: string) => {
    if (pass.length < 8)          return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(pass))      return 'Al menos una mayúscula';
    if (!/[0-9]/.test(pass))      return 'Al menos un número';
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

  // ── Guardar nueva contraseña ────────────────────────────
  const guardarNuevaPass = () => {
    setError('');
    const err = validarPass(nuevaPass);
    if (err) { setError(err); return; }
    if (nuevaPass !== confirmarPass) { setError('Las contraseñas no coinciden'); return; }
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      setPaso('exito-pass');
    }, 700);
  };

  const score = fortalezaPass(nuevaPass);
  const fortalezaLabel = ['', 'Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'][score];
  const fortalezaColor = ['', '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1D9E75'][score];

  // ── Demo: rellenar OTP ──────────────────────────────────
  const usarOTPDemo = () => {
    const digits = otpGen.split('');
    setOtp(digits);
    setTimeout(() => verificarOTP(otpGen), 100);
  };

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
            <span className="fp-logo__badge">
              {tipo === 'password' ? '🔑 Recuperar contraseña' : '👤 Recuperar usuario'}
            </span>
          </div>
        </div>

        {/* ══ PASO: EMAIL ══ */}
        {paso === 'email' && (
          <div className="fp-card">
            <div className="fp-card__header">
              {tipo === 'password'
                ? <Lock size={20} strokeWidth={1.6} />
                : <User size={20} strokeWidth={1.6} />
              }
              <div>
                <h2>{tipo === 'password' ? 'Recuperar contraseña' : 'Recuperar usuario'}</h2>
                <p>
                  {tipo === 'password'
                    ? 'Te enviamos un código al email de tu cuenta'
                    : 'Ingresá el email asociado a tu cuenta'
                  }
                </p>
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
                  : <>{tipo === 'password' ? 'Enviar código' : 'Buscar cuenta'} <ChevronRight size={15} /></>
                }
              </button>

              {/* Demo */}
              <div className="fp-demo">
                <p>Emails de prueba:</p>
                {USUARIOS_DB.map(u => (
                  <button key={u.email} className="fp-demo__item"
                    onClick={() => setEmail(u.email)}>
                    {u.email}
                  </button>
                ))}
              </div>
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

              {/* Contador */}
              <div className={`fp-timer${otpExpirado ? ' expired' : ''}`}>
                {otpExpirado
                  ? 'El código expiró'
                  : <>El código expira en <strong>{formatTiempo(segundos)}</strong></>
                }
              </div>

              {/* Demo */}
              <div className="fp-demo-otp">
                <span>Código de prueba:</span>
                <button className="fp-demo-otp__btn" onClick={usarOTPDemo}>
                  {otpGen} <span>← usar</span>
                </button>
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
              disabled={!otpExpirado && segundos > 14 * 60}
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

                {/* Barra de fortaleza */}
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

        {/* ══ PASO: ÉXITO CONTRASEÑA ══ */}
        {paso === 'exito-pass' && (
          <div className="fp-card fp-card--exito">
            <div className="fp-exito-icon">
              <CheckCircle size={48} strokeWidth={1.2} />
            </div>
            <h2>¡Contraseña actualizada!</h2>
            <p>Tu contraseña fue cambiada exitosamente. Ya podés ingresar con tu nueva contraseña.</p>
            <button className="fp-btn-primary" onClick={() => navigate('/')}>
              Ir al inicio <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* ══ PASO: ÉXITO USUARIO ══ */}
        {paso === 'exito-usuario' && (
          <div className="fp-card fp-card--exito">
            <div className="fp-exito-icon">
              <Mail size={48} strokeWidth={1.2} />
            </div>
            <h2>Email enviado</h2>
            <p>
              Si existe una cuenta asociada a <strong>{emailMasked}</strong>, vas a recibir
              un email con tu nombre de usuario en los próximos minutos.
            </p>
            {usuarioEncontrado && (
              <div className="fp-usuario-hint">
                <span className="fp-usuario-hint__label">Tu usuario</span>
                <span className="fp-usuario-hint__valor">
                  {enmascararUsuario(usuarioEncontrado)}
                </span>
              </div>
            )}
            <button className="fp-btn-primary" onClick={() => navigate('/')}>
              Volver al inicio <ChevronRight size={15} />
            </button>
            <button className="fp-btn-secondary" onClick={() => navigate('/acceso-seguro?tipo=personal')}>
              Ir al login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
