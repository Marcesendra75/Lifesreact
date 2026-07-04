// ============================================================
// LIFE'S — SafeBox.tsx | Hub central de la Bóveda del Legado
// Lucide React | SCSS | with-navbar
// ============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Lock, Fingerprint, Key, Users,
  FileText, Mail, Video, Scale, Coins, Hourglass,
  ChevronRight, Plus, AlertTriangle, CheckCircle,
  Heart, Clock, Eye, EyeOff, Zap,
} from 'lucide-react';
import './SafeBox.scss';

// ── Tipos ──────────────────────────────────────────────────
interface CajaSeguridad {
  id: string;
  titulo: string;
  desc: string;
  icono: React.ReactNode;
  count: number;
  nivel: 'maximo' | 'alto' | 'medio';
  ruta: string;
  color: string;
  grande?: boolean;
  oscuro?: boolean;
}

// ── Cajas de seguridad ─────────────────────────────────────
const CAJAS: CajaSeguridad[] = [
  {
    id: 'herederos',
    titulo: 'Herederos',
    desc: 'Personas designadas para recibir tu legado',
    icono: <Users size={28} strokeWidth={1.6} />,
    count: 2,
    nivel: 'maximo',
    ruta: '/herederos',
    color: '#855324',
    grande: true,
    oscuro: true,
  },
  {
    id: 'documentos',
    titulo: 'Documentos Vitales',
    desc: 'DNI, pasaporte, actas de nacimiento y escrituras',
    icono: <FileText size={28} strokeWidth={1.6} />,
    count: 8,
    nivel: 'maximo',
    ruta: '/caja-de-valores',
    color: '#03192e',
    grande: true,
  },
  {
    id: 'cartas',
    titulo: 'Cartas Privadas',
    desc: 'Mensajes personales para tus seres queridos',
    icono: <Mail size={28} strokeWidth={1.6} />,
    count: 142,
    nivel: 'alto',
    ruta: '/cartas-privadas',
    color: '#855324',
  },
  {
    id: 'videos',
    titulo: 'Último Tributo',
    desc: 'Tu mensaje final y videos del legado',
    icono: <Video size={28} strokeWidth={1.6} />,
    count: 24,
    nivel: 'alto',
    ruta: '/ultimo-tributo',
    color: '#03192e',
  },
  {
    id: 'testamento',
    titulo: 'Testamento Legal',
    desc: 'Voluntades y disposiciones finales',
    icono: <Scale size={28} strokeWidth={1.6} />,
    count: 3,
    nivel: 'maximo',
    ruta: '/testamento',
    color: '#735c00',
    oscuro: true,
  },
  {
    id: 'ahorro',
    titulo: 'Caja de Valores',
    desc: 'Ahorro e inversiones para tus herederos',
    icono: <Coins size={28} strokeWidth={1.6} />,
    count: 1,
    nivel: 'alto',
    ruta: '/caja-de-valores',
    color: '#735c00',
  },
  {
    id: 'capsula',
    titulo: 'Cápsula del Tiempo',
    desc: 'Mensajes programados para el futuro',
    icono: <Hourglass size={28} strokeWidth={1.6} />,
    count: 12,
    nivel: 'medio',
    ruta: '/capsula-del-tiempo',
    color: '#3a5a8a',
  },
  {
    id: 'ecos',
    titulo: 'Ecos IA',
    desc: 'Tu voz y personalidad preservadas con inteligencia artificial',
    icono: <Zap size={28} strokeWidth={1.6} />,
    count: 6,
    nivel: 'alto',
    ruta: '/ecos/mi-perfil',
    color: '#4a7a4e',
  },
];

const NIVEL_LABELS = {
  maximo: { label: 'Acceso Máximo', color: '#ba1a1a' },
  alto:   { label: 'Encriptado Nivel 4', color: '#735c00' },
  medio:  { label: 'Protegido', color: '#3a5a8a' },
};

// ── Componente ─────────────────────────────────────────────
export default function SafeBox() {
  const navigate = useNavigate();

  const [protocoloActivo, setProtocoloActivo] = useState(true);
  const [diasProtocolo,   setDiasProtocolo]   = useState(365);
  const [mostrarPin,      setMostrarPin]       = useState(false);
  const [pinValue,        setPinValue]         = useState('');
  const [desbloqueado,    setDesbloqueado]     = useState(false);
  const [progSeguridad,   setProgSeguridad]    = useState(0);
  const [toast,           setToast]            = useState('');
  const [tiempoActivo,    setTiempoActivo]     = useState(0);

  // Animación de progreso al montar
  useEffect(() => {
    setTimeout(() => setProgSeguridad(87), 500);
  }, []);

  // Timer de sesión de bóveda (15 min = 900 seg)
  useEffect(() => {
    if (!desbloqueado) return;
    const interval = setInterval(() => {
      setTiempoActivo(prev => {
        if (prev >= 900) {
          setDesbloqueado(false);
          showToast('⏱️ Sesión de bóveda expirada por seguridad');
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [desbloqueado]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const tiempoRestante = () => {
    const seg = 900 - tiempoActivo;
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePin = (digit: string) => {
    if (pinValue.length >= 6) return;
    const nuevo = pinValue + digit;
    setPinValue(nuevo);
    if (nuevo.length === 6) {
      setTimeout(() => {
        setDesbloqueado(true);
        setMostrarPin(false);
        setPinValue('');
        showToast('✓ Bóveda desbloqueada — sesión activa 15 min');
      }, 300);
    }
  };

  const handleNavegar = (ruta: string) => {
    if (!desbloqueado) {
      setMostrarPin(true);
      return;
    }
    navigate(ruta);
  };

  const totalItems = CAJAS.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="sb-page with-navbar">

      {/* ── HEADER ── */}
      <header className="sb-header">
        <div className="sb-header__left">
          <button className="sb-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="sb-header__title">Bóveda del Legado</h1>
            <p className="sb-header__sub">Protocolo de seguridad activo</p>
          </div>
        </div>
        <div className="sb-header__actions">
          {desbloqueado && (
            <div className="sb-session-timer">
              <Clock size={12} strokeWidth={2} />
              {tiempoRestante()}
            </div>
          )}
          <button className="sb-header__btn" onClick={() => setMostrarPin(true)}>
            <Shield size={18} strokeWidth={1.8} />
          </button>
          <div className="sb-header__avatar">
            <img src="https://i.pravatar.cc/32?img=11" alt="Perfil" />
          </div>
        </div>
      </header>

      <main className="sb-main">

        {/* ══ 1. HERO BÓVEDA ══ */}
        <div className="sb-hero fade-up">
          <div className="sb-hero__bg1" />
          <div className="sb-hero__bg2" />
          <div className="sb-hero__inner">

            {/* Badge seguridad */}
            <div className="sb-hero__badges">
              <div className="sb-badge sb-badge--enc">
                <Fingerprint size={12} strokeWidth={2} />
                Totalmente Encriptado
              </div>
              <div className="sb-badge sb-badge--activo">
                <span className="sb-badge__dot" />
                Protocolo Activo
              </div>
            </div>

            {/* Título */}
            <h2 className="sb-hero__titulo">Bóveda Protegida</h2>
            <p className="sb-hero__desc">
              Solo vos podés acceder. Cifrado end-to-end de grado militar.
              Tu legado está a salvo.
            </p>

            {/* Stats */}
            <div className="sb-hero__stats">
              {[
                { val: totalItems, label: 'Ítems guardados' },
                { val: CAJAS.filter(c => c.nivel === 'maximo').length, label: 'Acceso máximo' },
                { val: 2,          label: 'Herederos designados' },
              ].map(s => (
                <div key={s.label} className="sb-hero__stat">
                  <span className="sb-hero__stat-val">{s.val}</span>
                  <span className="sb-hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Progreso seguridad */}
            <div className="sb-hero__prog-wrap">
              <div className="sb-hero__prog-header">
                <span>Integridad de la bóveda</span>
                <span className="sb-hero__prog-pct">87%</span>
              </div>
              <div className="sb-prog-track">
                <div className="sb-prog-fill" style={{ width: `${progSeguridad}%` }} />
              </div>
              <p className="sb-hero__prog-hint">
                Completá tu testamento para llegar al 100%
              </p>
            </div>

            {/* Botón desbloquear / estado */}
            {desbloqueado ? (
              <div className="sb-hero__desbloqueado">
                <CheckCircle size={16} strokeWidth={2} />
                Bóveda desbloqueada · {tiempoRestante()} restantes
              </div>
            ) : (
              <button className="sb-hero__btn-unlock" onClick={() => setMostrarPin(true)}>
                <Key size={16} strokeWidth={2} />
                Desbloquear bóveda
              </button>
            )}
          </div>
        </div>

        {/* ══ 2. CAJAS DE SEGURIDAD — BENTO GRID ══ */}
        <div className="sb-section-header fade-up" style={{ animationDelay: '0.05s' }}>
          <h3 className="sb-section-titulo">Cajas de Seguridad</h3>
          <button className="sb-btn-agregar" onClick={() => showToast('📁 Agregar nuevo ítem...')}>
            <Plus size={15} strokeWidth={2} />
            Nuevo ítem
          </button>
        </div>

        <div className="sb-grid fade-up" style={{ animationDelay: '0.1s' }}>
          {CAJAS.map((caja, i) => (
            <button
              key={caja.id}
              className={`sb-caja${caja.grande ? ' sb-caja--grande' : ''}${caja.oscuro ? ' sb-caja--oscuro' : ''}`}
              style={{ animationDelay: `${0.1 + i * 0.04}s` }}
              onClick={() => handleNavegar(caja.ruta)}
            >
              {/* Número decorativo */}
              <span className="sb-caja__num">
                {String(caja.count).padStart(2, '0')}
              </span>

              {/* Ícono */}
              <div
                className="sb-caja__icono"
                style={{
                  background: caja.oscuro
                    ? 'rgba(255,255,255,0.1)'
                    : `${caja.color}15`,
                  color: caja.oscuro ? '#ffe088' : caja.color,
                }}
              >
                {caja.icono}
              </div>

              {/* Info */}
              <div className="sb-caja__info">
                <h4 className="sb-caja__titulo">{caja.titulo}</h4>
                <p className="sb-caja__desc">{caja.desc}</p>
              </div>

              {/* Badge nivel */}
              <div className="sb-caja__footer">
                <div
                  className="sb-nivel-badge"
                  style={{ color: NIVEL_LABELS[caja.nivel].color }}
                >
                  <Shield size={10} strokeWidth={2.5} />
                  {NIVEL_LABELS[caja.nivel].label}
                </div>
                <ChevronRight
                  size={16}
                  strokeWidth={1.8}
                  className="sb-caja__arrow"
                />
              </div>

              {/* Candado si no está desbloqueado */}
              {!desbloqueado && (
                <div className="sb-caja__lock">
                  <Lock size={14} strokeWidth={2} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* ══ 3. PROTOCOLO DE ACCESO PÓSTUMO ══ */}
        <div className="sb-protocolo fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="sb-protocolo__header">
            <div className="sb-protocolo__icono">
              <Heart size={22} strokeWidth={1.6} />
            </div>
            <div>
              <h3 className="sb-protocolo__titulo">Protocolo de Acceso Póstumo</h3>
              <p className="sb-protocolo__sub">
                Si no visitás tu bóveda en el tiempo configurado, tus herederos recibirán acceso automático
              </p>
            </div>
            <div
              className={`sb-toggle${protocoloActivo ? ' on' : ''}`}
              onClick={() => {
                setProtocoloActivo(!protocoloActivo);
                showToast(protocoloActivo
                  ? '⏸️ Protocolo póstumo desactivado'
                  : '✓ Protocolo póstumo activado');
              }}
            >
              <div className="sb-toggle__thumb" />
            </div>
          </div>

          {protocoloActivo && (
            <div className="sb-protocolo__config">
              <p className="sb-protocolo__desc">
                Tu bóveda se abrirá a tus herederos si no la visitás en:
              </p>
              <div className="sb-protocolo__dias-wrap">
                {[180, 365, 730].map(d => (
                  <button
                    key={d}
                    className={`sb-protocolo__dia${diasProtocolo === d ? ' active' : ''}`}
                    onClick={() => {
                      setDiasProtocolo(d);
                      showToast(`✓ Protocolo configurado a ${d} días`);
                    }}
                  >
                    <span className="sb-protocolo__dia-num">{d}</span>
                    <span className="sb-protocolo__dia-label">días</span>
                  </button>
                ))}
              </div>
              <div className="sb-protocolo__aviso">
                <AlertTriangle size={14} strokeWidth={1.8} />
                <p>
                  Última visita: <strong>hoy</strong> · Próxima verificación automática:{' '}
                  <strong>en {diasProtocolo} días</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ══ 4. SEGURIDAD ══ */}
        <div className="sb-seguridad fade-up" style={{ animationDelay: '0.25s' }}>
          <h3 className="sb-section-titulo" style={{ marginBottom: '14px' }}>
            Estado de seguridad
          </h3>
          {[
            { icono: <Fingerprint size={18} strokeWidth={1.8} />, label: 'Biometría',         estado: 'Activa',     ok: true  },
            { icono: <Key         size={18} strokeWidth={1.8} />, label: 'PIN de bóveda',     estado: 'Configurado',ok: true  },
            { icono: <Shield      size={18} strokeWidth={1.8} />, label: 'Cifrado end-to-end',estado: 'Activo',     ok: true  },
            { icono: <FileText    size={18} strokeWidth={1.8} />, label: 'Testamento',         estado: 'Incompleto', ok: false },
          ].map(s => (
            <div key={s.label} className="sb-seg-row">
              <div className={`sb-seg-row__icono${s.ok ? ' ok' : ' warn'}`}>
                {s.icono}
              </div>
              <div className="sb-seg-row__info">
                <span className="sb-seg-row__label">{s.label}</span>
                <span className={`sb-seg-row__estado${s.ok ? ' ok' : ' warn'}`}>
                  {s.estado}
                </span>
              </div>
              {!s.ok && (
                <button
                  className="sb-seg-row__btn"
                  onClick={() => navigate('/testamento')}
                >
                  Completar
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ══ 5. FOOTER SEGURIDAD ══ */}
        <div className="sb-footer-seg fade-up" style={{ animationDelay: '0.3s' }}>
          <Shield size={28} strokeWidth={1.4} />
          <p className="sb-footer-seg__titulo">Encriptado de Grado Militar Activo</p>
          <p className="sb-footer-seg__sub">
            © Life's · Todos tus recuerdos están protegidos de punto a punto
          </p>
        </div>

      </main>

      {/* ════ MODAL PIN ════ */}
      {mostrarPin && (
        <div className="sb-overlay" onClick={() => { setMostrarPin(false); setPinValue(''); }}>
          <div className="sb-pin-modal" onClick={e => e.stopPropagation()}>
            <div className="sb-pin-modal__handle">
              <div className="sb-pin-modal__bar" />
            </div>

            <div className="sb-pin-modal__header">
              <div className="sb-pin-modal__lock-icon">
                <Lock size={28} strokeWidth={1.6} />
              </div>
              <h3>Verificación de identidad</h3>
              <p>Ingresá tu PIN de 6 dígitos para acceder a la bóveda</p>
            </div>

            {/* Puntos del PIN */}
            <div className="sb-pin-dots">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`sb-pin-dot${i < pinValue.length ? ' filled' : ''}`}
                />
              ))}
            </div>

            {/* Teclado numérico */}
            <div className="sb-pin-keyboard">
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
                <button
                  key={i}
                  className={`sb-pin-key${d === '' ? ' sb-pin-key--empty' : ''}${d === '⌫' ? ' sb-pin-key--back' : ''}`}
                  onClick={() => {
                    if (d === '⌫') setPinValue(prev => prev.slice(0, -1));
                    else if (d !== '') handlePin(d);
                  }}
                  disabled={d === ''}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="sb-pin-modal__opciones">
              <button onClick={() => showToast('👆 Abriendo biometría...')}>
                <Fingerprint size={16} strokeWidth={1.8} />
                Usar biometría
              </button>
              <button onClick={() => { setMostrarPin(false); setPinValue(''); }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="sb-toast">
          <CheckCircle size={14} strokeWidth={2} />
          {toast}
        </div>
      )}

    </div>
  );
}
