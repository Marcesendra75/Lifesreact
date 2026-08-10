// ============================================================
// LIFE'S — TripleSeguridad.tsx
// Sistema de doble y triple seguridad con Tarjeta Life's
// Paso 1: Email + contraseña
// Paso 2: Código QR de la tarjeta (+ botón cámara futuro)
// Paso 3: PIN de 6 dígitos
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Shield, Lock, Eye, EyeOff, QrCode, Camera,
  CheckCircle, AlertCircle, ArrowLeft, Smartphone,
  Key, ChevronRight, X,
} from 'lucide-react';
import './TripleSeguridad.scss';

// ── Usuarios de prueba ─────────────────────────────────────
const USUARIOS = [
  {
    email: 'juan@lifes.com', password: 'Juan2026!',
    nombre: 'Juan García', nivel: 'Personal', color: '#C9932A',
    codigoQR: 'LA-2024-JG-4821', pin: '123456',
    tarjeta: 'Oro', avatar: 'JG',
  },
  {
    email: 'maria@lifes.com', password: 'Maria2026!',
    nombre: 'María López', nivel: 'Bóveda', color: '#1a1a2e',
    codigoQR: 'LA-2024-ML-7392', pin: '123456',
    tarjeta: 'Negro', avatar: 'ML',
  },
  {
    email: 'admin@lifes.com', password: 'Admin2026!',
    nombre: 'Admin Life\'s', nivel: 'Legado', color: '#b8b8b8',
    codigoQR: 'LA-2024-AD-9156', pin: '123456',
    tarjeta: 'Platino', avatar: 'AL',
  },
];

const NIVEL_CONFIG = {
  Personal: { pasos: 2, label: 'Doble seguridad',  color: '#C9932A', icono: '🥇' },
  Bóveda:   { pasos: 3, label: 'Triple seguridad', color: '#3a3a5c', icono: '🔒' },
  Legado:   { pasos: 3, label: 'Triple seguridad', color: '#b8b8b8', icono: '👑' },
};

// ── Componente QR visual (simulado) ───────────────────────
function QRVisual({ codigo, color }: { codigo: string; color: string }) {
  // Generamos un patrón SVG único basado en el código
  const seed = codigo.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: 21 }, (_, i) =>
    Array.from({ length: 21 }, (_, j) => {
      // Patrón determinístico basado en el código
      const v = (seed * (i + 1) * (j + 1) * 7919) % 100;
      // Esquinas siempre negras (patrón QR real)
      if ((i < 7 && j < 7) || (i < 7 && j > 13) || (i > 13 && j < 7)) {
        if (i === 0 || i === 6 || j === 0 || j === 6) return true;
        if (i > 1 && i < 5 && j > 1 && j < 5) return true;
        return false;
      }
      return v < 45;
    })
  );

  return (
    <svg viewBox="0 0 105 105" className="ts-qr-svg">
      <rect width="105" height="105" fill="white" rx="6"/>
      {cells.map((row, i) =>
        row.map((filled, j) =>
          filled ? (
            <rect key={`${i}-${j}`} x={j * 5} y={i * 5} width="5" height="5"
              fill={color === '#1a1a2e' ? '#1a1a2e' : '#03192E'}/>
          ) : null
        )
      )}
    </svg>
  );
}

// ── Componente ─────────────────────────────────────────────
export default function TripleSeguridad() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destino = searchParams.get('destino') || '/feed';
  const nivelRequerido = searchParams.get('nivel') || 'Personal';

  const [paso, setPaso]       = useState(1);
  const [usuario, setUsuario] = useState<typeof USUARIOS[0] | null>(null);
  const [error, setError]     = useState('');
  const [cargando, setCargando] = useState(false);
  const [recordar, setRecordar] = useState(false);

  // Paso 1
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);

  // Paso 2
  const [codigoQR, setCodigoQR]   = useState('');
  const [modoCamera, setModoCamera] = useState(false);

  // Paso 3
  const [pin, setPin]             = useState(['', '', '', '', '', '']);
  const pinRefs                   = useRef<(HTMLInputElement | null)[]>([]);

  // Verificar si el dispositivo ya está recordado
  useEffect(() => {
    const recordado = localStorage.getItem('ls_dispositivo_seguro');
    if (recordado) {
      const { email, expira } = JSON.parse(recordado);
      if (new Date(expira) > new Date()) {
        const u = USUARIOS.find(u => u.email === email);
        if (u) {
          setUsuario(u);
          navigate(destino);
        }
      }
    }
  }, []);

  const verificarPaso1 = () => {
    setError('');
    if (!email || !password) { setError('Completá todos los campos'); return; }
    setCargando(true);
    setTimeout(() => {
      const u = USUARIOS.find(u => u.email === email.toLowerCase() && u.password === password);
      if (u) {
        setUsuario(u);
        setCargando(false);
        setPaso(2);
      } else {
        setError('Email o contraseña incorrectos');
        setCargando(false);
      }
    }, 600);
  };

  const verificarPaso2 = () => {
    setError('');
    if (!codigoQR.trim()) { setError('Ingresá el código de tu tarjeta Life\'s'); return; }
    setCargando(true);
    setTimeout(() => {
      if (usuario && codigoQR.trim().toUpperCase() === usuario.codigoQR) {
        setCargando(false);
        const cfg = NIVEL_CONFIG[usuario.nivel as keyof typeof NIVEL_CONFIG];
        if (cfg.pasos === 2) {
          // Solo doble seguridad — acceso directo
          guardarDispositivo();
          navigate(destino);
        } else {
          setPaso(3);
        }
      } else {
        setError('Código QR incorrecto. Verificá tu tarjeta Life\'s');
        setCargando(false);
      }
    }, 600);
  };

  const verificarPaso3 = () => {
    setError('');
    const pinCompleto = pin.join('');
    if (pinCompleto.length < 6) { setError('Ingresá los 6 dígitos del PIN'); return; }
    setCargando(true);
    setTimeout(() => {
      if (usuario && pinCompleto === usuario.pin) {
        guardarDispositivo();
        navigate(destino);
      } else {
        setError('PIN incorrecto');
        setCargando(false);
        setPin(['', '', '', '', '', '']);
        pinRefs.current[0]?.focus();
      }
    }, 600);
  };

  const guardarDispositivo = () => {
    if (recordar && usuario) {
      const expira = new Date();
      expira.setDate(expira.getDate() + 30);
      localStorage.setItem('ls_dispositivo_seguro', JSON.stringify({
        email: usuario.email, expira: expira.toISOString(),
      }));
    }
    if (usuario) {
      sessionStorage.setItem('ls_usuario', JSON.stringify(usuario));
    }
  };

  const handlePin = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const nuevo = [...pin];
    nuevo[idx] = val.slice(-1);
    setPin(nuevo);
    if (val && idx < 5) pinRefs.current[idx + 1]?.focus();
    if (nuevo.every(d => d !== '')) {
      // Auto-verificar cuando completa los 6 dígitos
      const pinCompleto = nuevo.join('');
      if (usuario && pinCompleto === usuario.pin) {
        setCargando(true);
        setTimeout(() => { guardarDispositivo(); navigate(destino); }, 400);
      } else if (pinCompleto.length === 6) {
        setTimeout(() => {
          setError('PIN incorrecto');
          setPin(['', '', '', '', '', '']);
          pinRefs.current[0]?.focus();
        }, 400);
      }
    }
  };

  const nivelCfg = usuario
    ? NIVEL_CONFIG[usuario.nivel as keyof typeof NIVEL_CONFIG]
    : NIVEL_CONFIG[nivelRequerido as keyof typeof NIVEL_CONFIG] || NIVEL_CONFIG.Personal;

  const pasoLabels = ['Identidad', 'Tarjeta QR', 'PIN secreto'];

  return (
    <div className="ts-page">
      <div className="ts-bg"/>

      <div className="ts-wrap">

        {/* Logo */}
        <div className="ts-logo">
          <div className="ts-logo__shield">
            <Shield size={28} strokeWidth={1.4}/>
          </div>
          <div>
            <span className="ts-logo__lifes">Life's</span>
            <span className="ts-logo__badge">
              {nivelCfg.icono} {nivelCfg.label}
            </span>
          </div>
        </div>

        {/* Indicador de pasos */}
        <div className="ts-pasos">
          {Array.from({ length: nivelCfg.pasos }, (_, i) => (
            <div key={i} className="ts-pasos__item">
              <div className={`ts-pasos__dot ${paso > i + 1 ? 'done' : paso === i + 1 ? 'active' : ''}`}>
                {paso > i + 1
                  ? <CheckCircle size={14} strokeWidth={2}/>
                  : <span>{i + 1}</span>
                }
              </div>
              <span className={`ts-pasos__label ${paso === i + 1 ? 'active' : ''}`}>
                {pasoLabels[i]}
              </span>
              {i < nivelCfg.pasos - 1 && (
                <div className={`ts-pasos__linea ${paso > i + 1 ? 'done' : ''}`}/>
              )}
            </div>
          ))}
        </div>

        {/* ══ PASO 1 — Email + contraseña ══ */}
        {paso === 1 && (
          <div className="ts-card">
            <div className="ts-card__header">
              <Lock size={20} strokeWidth={1.6} style={{color:'#C9932A'}}/>
              <div>
                <h2>Verificá tu identidad</h2>
                <p>Paso 1 de {nivelCfg.pasos} · Email y contraseña</p>
              </div>
            </div>

            <div className="ts-form">
              <div className="ts-campo">
                <label>Email</label>
                <input type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="tu@email.com" autoComplete="email"
                  className={error ? 'error' : ''}
                  onKeyDown={e => e.key === 'Enter' && verificarPaso1()}
                />
              </div>
              <div className="ts-campo">
                <label>Contraseña</label>
                <div className="ts-input-pass">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    className={error ? 'error' : ''}
                    onKeyDown={e => e.key === 'Enter' && verificarPaso1()}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              {error && (
                <div className="ts-error">
                  <AlertCircle size={14}/> {error}
                </div>
              )}

              <button className="ts-btn-primary" onClick={verificarPaso1} disabled={cargando}>
                {cargando
                  ? <span className="ts-loader"/>
                  : <>Continuar <ChevronRight size={16}/></>
                }
              </button>
            </div>

            {/* Usuarios de prueba */}
            <div className="ts-demo">
              <button className="ts-demo__toggle" onClick={() => {}}>
                Ver usuarios de prueba
              </button>
              <div className="ts-demo__lista">
                {USUARIOS.map(u => (
                  <button key={u.email} className="ts-demo__user"
                    onClick={() => { setEmail(u.email); setPassword(u.password); }}>
                    <div className="ts-demo__avatar" style={{background:`${u.color}20`,color:u.color}}>
                      {u.avatar}
                    </div>
                    <div>
                      <strong>{u.nombre}</strong>
                      <span>Tarjeta {u.tarjeta} · {u.nivel}</span>
                      <span>{u.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button className="ts-link" onClick={() => navigate('/')}>
              <ArrowLeft size={13}/> Volver al inicio
            </button>
          </div>
        )}

        {/* ══ PASO 2 — Código QR ══ */}
        {paso === 2 && usuario && (
          <div className="ts-card">
            <div className="ts-card__header">
              <QrCode size={20} strokeWidth={1.6} style={{color:'#C9932A'}}/>
              <div>
                <h2>Tarjeta Life's</h2>
                <p>Paso 2 de {nivelCfg.pasos} · Verificá con tu tarjeta</p>
              </div>
            </div>

            <div className="ts-usuario-mini">
              <div className="ts-usuario-mini__avatar" style={{background:`${usuario.color}20`,color:usuario.color}}>
                {usuario.avatar}
              </div>
              <div>
                <strong>{usuario.nombre}</strong>
                <span>Tarjeta {usuario.tarjeta} · {nivelCfg.icono} {nivelCfg.label}</span>
              </div>
            </div>

            {/* Tabs: código manual / cámara */}
            <div className="ts-metodo-tabs">
              <button
                className={`ts-metodo-tab${!modoCamera ? ' active' : ''}`}
                onClick={() => setModoCamera(false)}
              >
                <Key size={14} strokeWidth={2}/> Ingresar código
              </button>
              <button
                className={`ts-metodo-tab${modoCamera ? ' active' : ''}`}
                onClick={() => setModoCamera(true)}
              >
                <Camera size={14} strokeWidth={2}/> Escanear QR
              </button>
            </div>

            {!modoCamera ? (
              <div className="ts-form">
                <div className="ts-campo">
                  <label>Código de tu tarjeta Life's</label>
                  <input
                    value={codigoQR}
                    onChange={e => { setCodigoQR(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="Ej: LA-2024-JG-4821"
                    className={`ts-input-mono${error ? ' error' : ''}`}
                    onKeyDown={e => e.key === 'Enter' && verificarPaso2()}
                  />
                  <span className="ts-campo__hint">
                    Encontrás este código en el reverso de tu tarjeta o en la sección "Mi tarjeta"
                  </span>
                </div>

                {/* Demo: mostrar código del usuario */}
                <div className="ts-demo-qr">
                  <span>Código de prueba para <strong>{usuario.nombre}</strong>:</span>
                  <button className="ts-demo-qr__codigo"
                    onClick={() => setCodigoQR(usuario.codigoQR)}>
                    {usuario.codigoQR} <span>← Click para usar</span>
                  </button>
                </div>

                {error && <div className="ts-error"><AlertCircle size={14}/> {error}</div>}

                <button className="ts-btn-primary" onClick={verificarPaso2} disabled={cargando}>
                  {cargando ? <span className="ts-loader"/> : <>Verificar <ChevronRight size={16}/></>}
                </button>
              </div>
            ) : (
              <div className="ts-camara-placeholder">
                <Camera size={40} strokeWidth={1}/>
                <h3>Escáner de QR</h3>
                <p>La funcionalidad de cámara estará disponible en la versión con backend.</p>
                <p>Por ahora usá el ingreso manual de código.</p>
                <button className="ts-btn-secondary" onClick={() => setModoCamera(false)}>
                  Ingresar código manualmente
                </button>
              </div>
            )}

            <button className="ts-link" onClick={() => setPaso(1)}>
              <ArrowLeft size={13}/> Volver
            </button>
          </div>
        )}

        {/* ══ PASO 3 — PIN ══ */}
        {paso === 3 && usuario && (
          <div className="ts-card">
            <div className="ts-card__header">
              <Key size={20} strokeWidth={1.6} style={{color:'#C9932A'}}/>
              <div>
                <h2>PIN secreto</h2>
                <p>Paso 3 de {nivelCfg.pasos} · Último nivel de seguridad</p>
              </div>
            </div>

            <div className="ts-usuario-mini">
              <div className="ts-usuario-mini__avatar" style={{background:`${usuario.color}20`,color:usuario.color}}>
                {usuario.avatar}
              </div>
              <div>
                <strong>{usuario.nombre}</strong>
                <span>Verificación triple completando...</span>
              </div>
            </div>

            <div className="ts-pin-wrap">
              <p className="ts-pin-label">Ingresá tu PIN de 6 dígitos</p>
              <div className="ts-pin-inputs">
                {pin.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { pinRefs.current[i] = el; }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handlePin(e.target.value, i)}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !pin[i] && i > 0) {
                        pinRefs.current[i - 1]?.focus();
                      }
                    }}
                    className={`ts-pin-input${error ? ' error' : ''}`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <div className="ts-demo-qr">
                <span>PIN de prueba:</span>
                <button className="ts-demo-qr__codigo"
                  onClick={() => {
                    setPin(['1','2','3','4','5','6']);
                    setTimeout(verificarPaso3, 100);
                  }}>
                  123456 <span>← Click para usar</span>
                </button>
              </div>

              {error && <div className="ts-error"><AlertCircle size={14}/> {error}</div>}
              {cargando && <div className="ts-verificando"><span className="ts-loader"/> Verificando...</div>}
            </div>

            {/* Recordar dispositivo */}
            <div className="ts-recordar" onClick={() => setRecordar(!recordar)}>
              <div className={`ts-recordar__check${recordar ? ' active' : ''}`}>
                {recordar && <CheckCircle size={13} strokeWidth={2.5}/>}
              </div>
              <div>
                <span>No volver a pedir en este dispositivo</span>
                <small>Durante 30 días · Solo en este navegador</small>
              </div>
              <Smartphone size={16} style={{marginLeft:'auto',color:'rgba(255,255,255,0.2)'}}/>
            </div>

            <button className="ts-btn-primary" onClick={verificarPaso3} disabled={cargando}>
              {cargando ? <span className="ts-loader"/> : <>Acceder <Shield size={15}/></>}
            </button>

            <button className="ts-link" onClick={() => { setPaso(2); setPin(['','','','','','']); setError(''); }}>
              <ArrowLeft size={13}/> Volver
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
