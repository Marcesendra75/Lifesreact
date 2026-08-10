// ============================================================
// LIFE'S — TarjetaLegado.tsx | Tarjeta con QR único
// Muestra la tarjeta digital del usuario con su QR
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Download, Share2, Eye, EyeOff,
  Copy, Check, Lock, Smartphone, RefreshCw, Info,
} from 'lucide-react';
import './TarjetaLegado.scss';

// ── Niveles de tarjeta ─────────────────────────────────────
const NIVELES = {
  Plata: {
    color: '#9ca3af', gradiente: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)',
    borde: '#9ca3af', factores: 1, label: 'Básico', acceso: 'Perfil público',
    descripcion: 'Acceso básico al perfil público de Life\'s',
  },
  Oro: {
    color: '#C9932A', gradiente: 'linear-gradient(135deg, #92400e 0%, #78350f 50%, #451a03 100%)',
    borde: '#C9932A', factores: 2, label: 'Personal', acceso: 'Páginas personales',
    descripcion: 'Doble seguridad — acceso a todas las páginas personales',
  },
  Negro: {
    color: '#a78bfa', gradiente: 'linear-gradient(135deg, #1e1b4b 0%, #0f0a2e 50%, #07041a 100%)',
    borde: '#a78bfa', factores: 3, label: 'Bóveda', acceso: 'Caja fuerte y documentos',
    descripcion: 'Triple seguridad — acceso a la bóveda y documentos privados',
  },
  Platino: {
    color: '#e2e8f0', gradiente: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
    borde: '#e2e8f0', factores: 3, label: 'Legado', acceso: 'Acceso completo',
    descripcion: 'Triple seguridad máxima — acceso total incluyendo protocolo póstumo',
  },
};

// ── Usuario de sesión simulado ─────────────────────────────
const USUARIO_DEMO = {
  nombre: 'Juan García',
  email: 'juan@lifes.com',
  nivel: 'Oro' as keyof typeof NIVELES,
  codigoQR: 'LA-2024-JG-4821',
  avatar: 'JG',
  emitida: '01 Ene 2024',
  vence: '01 Ene 2027',
  miembro: '#00421',
};

// ── QR Visual generado ─────────────────────────────────────
function QRCode({ codigo, color }: { codigo: string; color: string }) {
  const seed = codigo.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

  const genCell = (i: number, j: number): boolean => {
    // Esquinas — patrón finder real
    const enEsquina = (row: number, col: number, si: number, sj: number) =>
      row >= si && row <= si + 6 && col >= sj && col <= sj + 6;

    if (enEsquina(i, j, 0, 0) || enEsquina(i, j, 0, 14) || enEsquina(i, j, 14, 0)) {
      const r = i % 7 === 0 || j % 7 === 0 ||
        (i % 7 >= 2 && i % 7 <= 4 && j % 7 >= 2 && j % 7 <= 4);
      if (enEsquina(i, j, 0, 0)) return r;
      if (enEsquina(i, j, 0, 14)) return (i % 7 === 0 || (j - 14) % 7 === 0 ||
        (i % 7 >= 2 && i % 7 <= 4 && (j - 14) % 7 >= 2 && (j - 14) % 7 <= 4));
      if (enEsquina(i, j, 14, 0)) return ((i - 14) % 7 === 0 || j % 7 === 0 ||
        ((i - 14) % 7 >= 2 && (i - 14) % 7 <= 4 && j % 7 >= 2 && j % 7 <= 4));
    }

    // Separadores (zonas blancas)
    if ((i === 7 && j <= 7) || (i <= 7 && j === 7)) return false;
    if ((i === 7 && j >= 13) || (i <= 7 && j === 13)) return false;
    if ((i === 13 && j <= 7) || (i >= 13 && j === 7)) return false;

    // Datos — patrón pseudo-random basado en el código
    const v = ((seed * 1103515245 + (i * 31 + j) * 12345) & 0x7fffffff) % 100;
    return v < 50;
  };

  const size = 21;
  const cells = Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => genCell(i, j))
  );

  return (
    <svg viewBox={`0 0 ${size * 5 + 8} ${size * 5 + 8}`} className="tl-qr-svg">
      <rect width="100%" height="100%" fill="white" rx="4"/>
      {cells.map((row, i) =>
        row.map((filled, j) =>
          filled ? (
            <rect key={`${i}-${j}`}
              x={j * 5 + 4} y={i * 5 + 4}
              width="5" height="5"
              fill="#1a1a1a"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ── Componente ─────────────────────────────────────────────
export default function TarjetaLegado() {
  const navigate = useNavigate();
  const [mostrarCodigo, setMostrarCodigo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [vista, setVista] = useState<'tarjeta' | 'info'>('tarjeta');

  const usuario = USUARIO_DEMO;
  const nivel   = NIVELES[usuario.nivel];

  const copiarCodigo = () => {
    navigator.clipboard.writeText(usuario.codigoQR);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="tl-page">
      <div className="tl-bg"/>

      <div className="tl-wrap">

        {/* Header */}
        <header className="tl-header">
          <button className="tl-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} strokeWidth={1.8}/>
          </button>
          <h1 className="tl-header__titulo">Mi tarjeta Life's</h1>
          <div className="tl-header__tabs">
            <button className={`tl-tab${vista==='tarjeta'?' active':''}`}
              onClick={() => setVista('tarjeta')}>Tarjeta</button>
            <button className={`tl-tab${vista==='info'?' active':''}`}
              onClick={() => setVista('info')}>Info</button>
          </div>
        </header>

        {vista === 'tarjeta' && (
          <>
            {/* ── TARJETA FÍSICA DIGITAL ── */}
            <div className="tl-tarjeta" style={{background: nivel.gradiente}}>
              {/* Borde brillante */}
              <div className="tl-tarjeta__borde" style={{borderColor:`${nivel.borde}40`}}/>

              {/* Header tarjeta */}
              <div className="tl-tarjeta__header">
                <div className="tl-tarjeta__logo">
                  <Shield size={18} strokeWidth={1.4}/>
                  <span>Life's</span>
                </div>
                <div className="tl-tarjeta__nivel" style={{color: nivel.color, background:`${nivel.color}15`, borderColor:`${nivel.color}30`}}>
                  {nivel.label}
                </div>
              </div>

              {/* QR */}
              <div className="tl-tarjeta__qr-wrap">
                <QRCode codigo={usuario.codigoQR} color={nivel.color}/>
                <div className="tl-tarjeta__qr-factores">
                  {Array.from({length: nivel.factores}, (_, i) => (
                    <Lock key={i} size={10} strokeWidth={2} style={{color: nivel.color}}/>
                  ))}
                  <span style={{color: nivel.color}}>{nivel.factores}FA</span>
                </div>
              </div>

              {/* Datos */}
              <div className="tl-tarjeta__datos">
                <div className="tl-tarjeta__nombre">{usuario.nombre}</div>
                <div className="tl-tarjeta__email">{usuario.email}</div>
                <div className="tl-tarjeta__footer">
                  <span>#{usuario.miembro}</span>
                  <span>Vence {usuario.vence}</span>
                </div>
              </div>

              {/* Chip decorativo */}
              <div className="tl-tarjeta__chip" style={{borderColor:`${nivel.color}40`}}>
                <div className="tl-tarjeta__chip-lineas"/>
              </div>

              {/* Efecto brillo */}
              <div className="tl-tarjeta__brillo"/>
            </div>

            {/* ── Código QR ── */}
            <div className="tl-codigo-wrap">
              <div className="tl-codigo-header">
                <span className="tl-codigo-label">Código de tarjeta</span>
                <button className="tl-codigo-eye" onClick={() => setMostrarCodigo(!mostrarCodigo)}>
                  {mostrarCodigo ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              <div className="tl-codigo-display">
                <span className="tl-codigo-valor">
                  {mostrarCodigo ? usuario.codigoQR : 'LA-••••-••-••••'}
                </span>
                <button className="tl-codigo-copiar" onClick={copiarCodigo}>
                  {copiado ? <><Check size={13}/> Copiado</> : <><Copy size={13}/> Copiar</>}
                </button>
              </div>
              <p className="tl-codigo-hint">
                Usá este código en la pantalla de verificación con tarjeta
              </p>
            </div>

            {/* ── Acciones ── */}
            <div className="tl-acciones">
              <button className="tl-accion-btn" onClick={() => navigate('/acceso-seguro')}>
                <Shield size={16} strokeWidth={1.8}/>
                <span>Usar tarjeta</span>
              </button>
              <button className="tl-accion-btn" onClick={() => {}}>
                <Download size={16} strokeWidth={1.8}/>
                <span>Descargar</span>
              </button>
              <button className="tl-accion-btn" onClick={() => {}}>
                <Share2 size={16} strokeWidth={1.8}/>
                <span>Compartir</span>
              </button>
              <button className="tl-accion-btn" onClick={() => {}}>
                <Smartphone size={16} strokeWidth={1.8}/>
                <span>Wallet</span>
              </button>
            </div>
          </>
        )}

        {vista === 'info' && (
          <div className="tl-info">

            {/* Nivel actual */}
            <div className="tl-info-card" style={{borderColor:`${nivel.color}30`,background:`${nivel.color}06`}}>
              <div className="tl-info-card__header">
                <div className="tl-info-card__nivel" style={{color: nivel.color}}>{usuario.nivel}</div>
                <span style={{color: nivel.color, fontSize:'0.65rem', fontWeight:700}}>Tu nivel actual</span>
              </div>
              <p className="tl-info-card__desc">{nivel.descripcion}</p>
              <div className="tl-info-card__acceso">
                <Lock size={12} strokeWidth={2}/> {nivel.acceso}
              </div>
            </div>

            {/* Todos los niveles */}
            <h3 className="tl-info-titulo">Niveles de tarjeta</h3>
            {Object.entries(NIVELES).map(([nombre, cfg]) => (
              <div key={nombre} className={`tl-nivel-item${nombre === usuario.nivel ? ' actual' : ''}`}
                style={nombre === usuario.nivel ? {borderColor:`${cfg.color}40`} : {}}>
                <div className="tl-nivel-item__dot" style={{background: cfg.color}}/>
                <div className="tl-nivel-item__info">
                  <div className="tl-nivel-item__nombre">
                    <span style={{color: cfg.color}}>{nombre}</span>
                    <span className="tl-nivel-item__label">{cfg.label}</span>
                    {nombre === usuario.nivel && <span className="tl-nivel-item__actual">Tu nivel</span>}
                  </div>
                  <div className="tl-nivel-item__acceso">{cfg.acceso}</div>
                  <div className="tl-nivel-item__factores">
                    {Array.from({length: cfg.factores}, (_, i) => (
                      <Lock key={i} size={10} strokeWidth={2} style={{color: cfg.color}}/>
                    ))}
                    <span>{cfg.factores} {cfg.factores === 1 ? 'factor' : 'factores'} de autenticación</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Info seguridad */}
            <div className="tl-info-seguridad">
              <Info size={14} strokeWidth={1.8}/>
              <div>
                <strong>¿Cómo funciona la seguridad?</strong>
                <p>Cada nivel agrega una capa de protección. Tu tarjeta {usuario.nivel} usa <strong>{nivel.factores} factores</strong>: {nivel.factores >= 1 && 'contraseña'}{nivel.factores >= 2 && ' + código QR'}{nivel.factores >= 3 && ' + PIN secreto'}.</p>
              </div>
            </div>

            <button className="tl-btn-solicitar" onClick={() => {}}>
              <RefreshCw size={14} strokeWidth={2}/> Solicitar upgrade de tarjeta
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
