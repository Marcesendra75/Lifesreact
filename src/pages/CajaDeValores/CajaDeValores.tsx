// ============================================================
// LIFE'S — CajaDeValores.tsx
// Ahorro para herederos con proyección interactiva
// Lucide React | SCSS | with-navbar
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, ScrollText, TrendingUp, AlertTriangle,
  Coins, Plus, Minus, Check, X, ChevronRight,
  Landmark, Bitcoin, DollarSign, Euro, Clock, Crown,
  Users, Lock, ReceiptText,
} from 'lucide-react';
import './CajaDeValores.scss';

// ── Constantes ─────────────────────────────────────────────
const RATE      = 0.058; // 5.8% nivel oro
const INITIAL   = 12450.82;
const YEARS_BAR = [1, 2, 3, 4, 5, 7, 10];

const BAR_COLORS = [
  'rgba(3,25,46,0.15)', 'rgba(3,25,46,0.22)', 'rgba(133,83,36,0.35)',
  'rgba(133,83,36,0.45)', 'rgba(115,92,0,0.5)', 'rgba(115,92,0,0.7)', '#735c00',
];

const TIERS = [
  { emoji: '🥈', nombre: 'Nivel Base',   rango: '2-4 años',  tasa: '3.5%', desc: 'Retiro entre 2 y 4 años · pierde el 50% de intereses', activo: false, color: '#8A8279' },
  { emoji: '🥇', nombre: 'Nivel Plata',  rango: '4-7 años',  tasa: '4.8%', desc: 'Retiro con 20% de penalización sobre intereses',        activo: false, color: '#855324' },
  { emoji: '💎', nombre: 'Nivel Oro',    rango: '7-10 años', tasa: '5.8%', desc: 'Tu nivel actual ✓ · Sin penalización al vencimiento',   activo: true,  color: '#C9932A' },
  { emoji: '👑', nombre: 'Nivel Legado', rango: '+10 años',  tasa: '7.2%', desc: 'Máximo rendimiento · Los fondos pasan directo a herederos', activo: false, color: '#735c00' },
];

const MONEDAS = [
  { flag: '🇺🇸', nombre: 'Dólar USD',   sub: 'Moneda base',          code: 'USD' },
  { flag: '🇪🇺', nombre: 'Euro EUR',    sub: 'Conversión automática', code: 'EUR' },
  { flag: '₿',   nombre: 'Bitcoin BTC', sub: 'Custodia segura',       code: 'BTC' },
  { flag: 'Ξ',   nombre: 'Ethereum ETH',sub: 'Custodia segura',       code: 'ETH' },
];

const MOVIMIENTOS = [
  { tipo: 'deposito',  monto: '+$500.00', fecha: '15 Jun 2024', desc: 'Depósito mensual programado',    color: '#4a7a4e' },
  { tipo: 'interes',   monto: '+$61.23',  fecha: '01 Jun 2024', desc: 'Intereses acreditados — Mayo',   color: '#735c00' },
  { tipo: 'deposito',  monto: '+$500.00', fecha: '15 May 2024', desc: 'Depósito mensual programado',    color: '#4a7a4e' },
  { tipo: 'interes',   monto: '+$58.40',  fecha: '01 May 2024', desc: 'Intereses acreditados — Abril',  color: '#735c00' },
];

// ── Helpers ────────────────────────────────────────────────
function calcProjection(monthly: number, years: number): number {
  let total = INITIAL;
  for (let m = 0; m < years * 12; m++) {
    total += monthly;
    total *= (1 + RATE / 12);
  }
  return total;
}

function fmt(n: number): string {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmt2(n: number): string {
  return '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Componente ─────────────────────────────────────────────
export default function CajaDeValores() {
  const navigate = useNavigate();

  const [monthly,        setMonthly]        = useState(50);
  const [balance,        setBalance]        = useState(INITIAL);
  const [depositOpen,    setDepositOpen]    = useState(false);
  const [withdrawOpen,   setWithdrawOpen]   = useState(false);
  const [selectedCur,    setSelectedCur]    = useState('USD');
  const [depositAmount,  setDepositAmount]  = useState('');
  const [autoDeposit,    setAutoDeposit]    = useState(true);
  const [toast,          setToast]          = useState('');
  const [barHeights,     setBarHeights]     = useState<number[]>([]);
  const [tooltipIdx,     setTooltipIdx]     = useState<number | null>(null);
  const [progWidth,      setProgWidth]      = useState(0);

  const barVals = useRef<number[]>([]);

  // Calcular proyecciones
  const proj2  = calcProjection(monthly, 2);
  const proj10 = calcProjection(monthly, 10);

  // Barras de proyección
  useEffect(() => {
    const vals = YEARS_BAR.map(y => calcProjection(monthly, y));
    barVals.current = vals;
    const max = vals[vals.length - 1];
    setBarHeights(vals.map(v => Math.max(8, (v / max) * 100)));
  }, [monthly]);

  // Animar progreso al montar
  useEffect(() => {
    setTimeout(() => setProgWidth(30), 400);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const confirmDeposit = () => {
    const amt = parseFloat(depositAmount) || 50;
    setBalance(prev => prev + amt);
    setDepositOpen(false);
    setDepositAmount('');
    showToast(`✓ Depósito de ${fmt2(amt)} ${selectedCur} procesado`);
  };

  const confirmWithdraw = () => {
    setWithdrawOpen(false);
    showToast('⚠️ Solicitud de retiro enviada — se verificará tu identidad');
    setTimeout(() => navigate('/acceso-seguro'), 2000);
  };

  const pctSlider = ((monthly - 1) / 99 * 100).toFixed(1);

  return (
    <div className="cdv-page with-navbar">

      {/* ── HEADER ── */}
      <header className="cdv-header">
        <div className="cdv-header__left">
          <button className="cdv-header__back" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} strokeWidth={1.8} />
          </button>
          <div>
            <h1 className="cdv-header__title">Caja de Valores</h1>
            <p className="cdv-header__sub">Ahorro para tus herederos</p>
          </div>
        </div>
        <div className="cdv-header__actions">
          <button className="cdv-header__btn" onClick={() => navigate('/acceso-seguro')} title="Seguridad">
            <Shield size={18} strokeWidth={1.8} />
          </button>
          <button className="cdv-header__btn" title="Movimientos">
            <ReceiptText size={18} strokeWidth={1.8} />
          </button>
          <div className="cdv-header__avatar">
            <img src="https://i.pravatar.cc/32?img=11" alt="Perfil" />
          </div>
        </div>
      </header>

      <main className="cdv-main">

        {/* ══ 1. BALANCE HERO ══ */}
        <div className="cdv-balance-card fade-up">
          <div className="cdv-balance-card__bg1" />
          <div className="cdv-balance-card__bg2" />
          <div className="cdv-balance-card__inner">

            {/* Tier badge */}
            <div className="cdv-balance-card__top">
              <div className="cdv-tier-badge cdv-tier-badge--oro">
                <Crown size={11} strokeWidth={2} />
                Nivel Oro · Año 3
              </div>
              <span className="cdv-balance-card__estado">Activo · Creciendo</span>
            </div>

            {/* Balance principal */}
            <div className="cdv-balance-card__balance-wrap">
              <span className="cdv-balance-card__label">Capital acumulado</span>
              <div className="cdv-balance-card__balance">{fmt2(balance)}</div>
              <div className="cdv-balance-card__rendimiento">
                <span className="cdv-balance-card__intereses">+$647.24 generado en intereses</span>
                {' · '}Rendimiento actual:{' '}
                <span className="cdv-balance-card__tasa">5.80% anual</span>
              </div>
            </div>

            {/* Proyección herederos */}
            <div className="cdv-balance-card__proyeccion">
              <span className="cdv-balance-card__proy-label">Valor proyectado para tus herederos</span>
              <div className="cdv-balance-card__proy-valor">
                <span>{fmt(proj10)}</span>
                <span className="cdv-balance-card__proy-sub">al cumplir 10 años</span>
              </div>
            </div>

            {/* Progreso barra */}
            <div>
              <div className="cdv-balance-card__prog-header">
                <span>Progreso hacia el nivel Legado</span>
                <span>30%</span>
              </div>
              <div className="cdv-prog-track">
                <div className="cdv-prog-fill" style={{ width: `${progWidth}%` }} />
              </div>
              <div className="cdv-balance-card__prog-footer">
                <span>Año 3</span>
                <span>Meta: Año 10</span>
              </div>
            </div>

            {/* Botones */}
            <div className="cdv-balance-card__btns">
              <button className="cdv-btn-deposito" onClick={() => setDepositOpen(true)}>
                <Plus size={16} strokeWidth={2} />
                Depositar
              </button>
              <button className="cdv-btn-retiro" onClick={() => setWithdrawOpen(true)}>
                <Minus size={16} strokeWidth={2} />
                Retirar
              </button>
            </div>
          </div>
        </div>

        {/* ══ 2. STATS RÁPIDOS ══ */}
        <div className="cdv-stats fade-up" style={{ animationDelay: '0.05s' }}>
          {[
            { icono: <Clock size={16} strokeWidth={1.8} />,  label: 'Tiempo activo',   valor: '3 años 2 meses', color: '#3a5a8a' },
            { icono: <TrendingUp size={16} strokeWidth={1.8} />, label: 'Intereses totales', valor: '+$647.24',       color: '#4a7a4e' },
            { icono: <Users size={16} strokeWidth={1.8} />,  label: 'Herederos',       valor: '2 personas',     color: '#855324' },
          ].map(s => (
            <div key={s.label} className="cdv-stat">
              <span className="cdv-stat__icono" style={{ color: s.color }}>{s.icono}</span>
              <span className="cdv-stat__valor">{s.valor}</span>
              <span className="cdv-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ══ 3. PROYECCIÓN INTERACTIVA ══ */}
        <div className="cdv-card fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="cdv-card__title">
            <TrendingUp size={16} strokeWidth={1.8} />
            Proyección interactiva
          </div>
          <p className="cdv-card__desc">
            Ajustá el depósito mensual y mirá cómo crece tu legado con el tiempo.
          </p>

          {/* Slider */}
          <div className="cdv-slider-wrap">
            <div className="cdv-slider-header">
              <span>Depósito mensual</span>
              <strong className="cdv-slider-val">${monthly}/mes</strong>
            </div>
            <div className="cdv-slider-track">
              <input
                type="range" min={1} max={100} value={monthly}
                className="cdv-slider"
                style={{ '--pct': `${pctSlider}%` } as React.CSSProperties}
                onChange={e => setMonthly(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Barras de proyección */}
          <div className="cdv-bars">
            {barHeights.map((h, i) => (
              <div key={i} className="cdv-bar-wrap"
                onMouseEnter={() => setTooltipIdx(i)}
                onMouseLeave={() => setTooltipIdx(null)}>
                <div className="cdv-bar"
                  style={{ height: `${h}%`, background: BAR_COLORS[i] }}>
                  {tooltipIdx === i && (
                    <div className="cdv-bar__tooltip">
                      {fmt(barVals.current[i])} · Año {YEARS_BAR[i]}
                    </div>
                  )}
                </div>
                <span className="cdv-bar-label">Año {YEARS_BAR[i]}</span>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="cdv-proj-grid">
            <div className="cdv-proj-item">
              <span className="cdv-proj-item__label">A 2 años</span>
              <span className="cdv-proj-item__valor">{fmt(proj2)}</span>
              <span className="cdv-proj-item__sub">+ intereses</span>
            </div>
            <div className="cdv-proj-item cdv-proj-item--highlight">
              <span className="cdv-proj-item__label">A 10 años</span>
              <span className="cdv-proj-item__valor">{fmt(proj10)}</span>
              <span className="cdv-proj-item__sub">+ todos los intereses</span>
            </div>
          </div>
        </div>

        {/* ══ 4. TIERS ══ */}
        <div className="cdv-card fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="cdv-card__title">
            <Crown size={16} strokeWidth={1.8} />
            Niveles de rendimiento
          </div>
          <p className="cdv-card__desc">
            Cuanto más tiempo mantengás tus fondos sin retirar, mayor es tu rendimiento anual.
          </p>
          <div className="cdv-tiers">
            {TIERS.map(t => (
              <div key={t.nombre}
                className={`cdv-tier${t.activo ? ' cdv-tier--activo' : ''}`}>
                <span className="cdv-tier__emoji">{t.emoji}</span>
                <div className="cdv-tier__info">
                  <div className="cdv-tier__header">
                    <span className="cdv-tier__nombre">{t.nombre}</span>
                    <span className="cdv-tier__tasa" style={{ color: t.activo ? '#ffe088' : t.color }}>
                      {t.tasa}
                    </span>
                  </div>
                  <span className="cdv-tier__desc">{t.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ 5. PENALIZACIÓN ══ */}
        <div className="cdv-penalizacion fade-up" style={{ animationDelay: '0.2s' }}>
          <AlertTriangle size={20} strokeWidth={1.8} className="cdv-penalizacion__icono" />
          <div>
            <div className="cdv-penalizacion__titulo">Retiro anticipado — Condiciones</div>
            <p className="cdv-penalizacion__texto">
              Podés retirar tus fondos a partir de los <strong>2 años</strong>. Sin embargo, perdés los intereses
              generados según tu nivel. El capital base <strong>siempre se devuelve completo</strong>.
            </p>
            <div className="cdv-penalizacion__tags">
              <span className="cdv-pen-tag cdv-pen-tag--rojo">2-4 años: pierde 50% intereses</span>
              <span className="cdv-pen-tag cdv-pen-tag--ambar">4-7 años: pierde 20% intereses</span>
              <span className="cdv-pen-tag cdv-pen-tag--verde">+7 años: sin penalización</span>
            </div>
          </div>
        </div>

        {/* ══ 6. MONEDAS ══ */}
        <div className="cdv-card fade-up" style={{ animationDelay: '0.22s' }}>
          <div className="cdv-card__title">
            <Coins size={16} strokeWidth={1.8} />
            Monedas aceptadas
          </div>
          <div className="cdv-monedas">
            {MONEDAS.map(m => (
              <div key={m.code} className="cdv-moneda">
                <span className="cdv-moneda__flag">{m.flag}</span>
                <div>
                  <div className="cdv-moneda__nombre">{m.nombre}</div>
                  <div className="cdv-moneda__sub">{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ 7. DEPÓSITO AUTOMÁTICO ══ */}
        <div className="cdv-card fade-up" style={{ animationDelay: '0.25s' }}>
          <div className="cdv-toggle-row">
            <div className="cdv-card__title" style={{ marginBottom: 0 }}>
              <Landmark size={16} strokeWidth={1.8} />
              Depósito automático
            </div>
            <div
              className={`cdv-toggle${autoDeposit ? ' on' : ''}`}
              onClick={() => setAutoDeposit(!autoDeposit)}>
              <div className="cdv-toggle__thumb" />
            </div>
          </div>
          {autoDeposit && (
            <div className="cdv-auto-info">
              <Check size={13} strokeWidth={2.5} />
              Se debitarán <strong>$500 USD</strong> el día 15 de cada mes desde tu cuenta bancaria vinculada.
            </div>
          )}
        </div>

        {/* ══ 8. ÚLTIMOS MOVIMIENTOS ══ */}
        <div className="cdv-card fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="cdv-card__header">
            <div className="cdv-card__title" style={{ marginBottom: 0 }}>
              <ScrollText size={16} strokeWidth={1.8} />
              Últimos movimientos
            </div>
            <button className="cdv-card__ver-todos">Ver todos <ChevronRight size={13} /></button>
          </div>
          <div className="cdv-movimientos">
            {MOVIMIENTOS.map((m, i) => (
              <div key={i} className="cdv-movimiento">
                <div className="cdv-movimiento__dot" style={{ background: m.color }} />
                <div className="cdv-movimiento__info">
                  <span className="cdv-movimiento__desc">{m.desc}</span>
                  <span className="cdv-movimiento__fecha">{m.fecha}</span>
                </div>
                <span className="cdv-movimiento__monto" style={{ color: m.color }}>
                  {m.monto}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ 9. HEREDEROS ══ */}
        <div className="cdv-herederos-card fade-up" style={{ animationDelay: '0.35s' }}>
          <div className="cdv-herederos-card__left">
            <Users size={22} strokeWidth={1.6} />
            <div>
              <div className="cdv-herederos-card__titulo">Tus herederos</div>
              <div className="cdv-herederos-card__sub">2 personas designadas · Configuración completa</div>
            </div>
          </div>
          <button className="cdv-herederos-card__btn" onClick={() => navigate('/herederos')}>
            Gestionar <ChevronRight size={15} />
          </button>
        </div>

      </main>

      {/* ════ MODAL DEPÓSITO ════ */}
      {depositOpen && (
        <div className="cdv-overlay" onClick={() => setDepositOpen(false)}>
          <div className="cdv-modal" onClick={e => e.stopPropagation()}>
            <div className="cdv-modal__handle"><div className="cdv-modal__bar" /></div>
            <div className="cdv-modal__header">
              <h3>Nuevo depósito</h3>
              <button onClick={() => setDepositOpen(false)}><X size={18} strokeWidth={1.8} /></button>
            </div>
            <div className="cdv-modal__body">

              {/* Selector de moneda */}
              <div className="cdv-campo">
                <label className="cdv-campo__label">Moneda</label>
                <div className="cdv-cur-tabs">
                  {['USD','EUR','BTC','ETH'].map(c => (
                    <button key={c}
                      className={`cdv-cur-tab${selectedCur === c ? ' active' : ''}`}
                      onClick={() => setSelectedCur(c)}>
                      {c === 'USD' && <DollarSign size={13} strokeWidth={2} />}
                      {c === 'EUR' && <Euro size={13} strokeWidth={2} />}
                      {c === 'BTC' && <Bitcoin size={13} strokeWidth={2} />}
                      {c === 'ETH' && <Coins size={13} strokeWidth={2} />}
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monto */}
              <div className="cdv-campo">
                <label className="cdv-campo__label">Monto a depositar</label>
                <input
                  className="cdv-input"
                  type="number"
                  placeholder={selectedCur === 'BTC' ? '0.0012' : '50.00'}
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                />
              </div>

              {/* Destino */}
              <div className="cdv-campo">
                <label className="cdv-campo__label">Fuente de fondos</label>
                <select className="cdv-input">
                  <option>Cuenta bancaria vinculada ···· 4521</option>
                  <option>Mercado Pago</option>
                  <option>Transferencia manual</option>
                </select>
              </div>

              {/* Preview */}
              {depositAmount && (
                <div className="cdv-deposit-preview">
                  <div className="cdv-deposit-preview__row">
                    <span>Depósito</span>
                    <span>{depositAmount} {selectedCur}</span>
                  </div>
                  <div className="cdv-deposit-preview__row">
                    <span>Rendimiento anual estimado</span>
                    <span className="cdv-deposit-preview__green">
                      +${(parseFloat(depositAmount) * 12 * RATE).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="cdv-modal__btns">
                <button className="cdv-btn-ghost" onClick={() => setDepositOpen(false)}>Cancelar</button>
                <button className="cdv-btn-primary" onClick={confirmDeposit}>
                  <Plus size={15} strokeWidth={2} />
                  Confirmar depósito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL RETIRO ════ */}
      {withdrawOpen && (
        <div className="cdv-overlay" onClick={() => setWithdrawOpen(false)}>
          <div className="cdv-modal" onClick={e => e.stopPropagation()}>
            <div className="cdv-modal__handle"><div className="cdv-modal__bar" /></div>
            <div className="cdv-modal__header">
              <h3>Solicitar retiro</h3>
              <button onClick={() => setWithdrawOpen(false)}><X size={18} strokeWidth={1.8} /></button>
            </div>
            <div className="cdv-modal__body">
              <div className="cdv-retiro-aviso">
                <AlertTriangle size={18} strokeWidth={1.8} />
                <p>Estás en <strong>Nivel Oro (Año 3)</strong>. Un retiro ahora implica <strong>penalización del 50% sobre intereses</strong>.</p>
              </div>

              <div className="cdv-campo">
                <label className="cdv-campo__label">Monto a retirar</label>
                <input className="cdv-input" type="number" placeholder="0.00" defaultValue="5000" />
              </div>

              <div className="cdv-retiro-resumen">
                <div className="cdv-retiro-resumen__row">
                  <span>Capital base</span><span>$12,450.82</span>
                </div>
                <div className="cdv-retiro-resumen__row">
                  <span>Penalización intereses (50%)</span>
                  <span className="cdv-retiro-resumen__neg">-$323.62</span>
                </div>
                <div className="cdv-retiro-resumen__row">
                  <span>Capital a recibir</span><span>$11,803.58</span>
                </div>
                <div className="cdv-retiro-resumen__divider" />
                <div className="cdv-retiro-resumen__total">
                  <span>Total neto</span>
                  <span>$11,803.58</span>
                </div>
              </div>

              <p className="cdv-retiro-nota">
                <Lock size={12} strokeWidth={2} />
                Esta acción requiere verificación de triple seguridad y será procesada en 3-5 días hábiles.
              </p>

              <div className="cdv-modal__btns">
                <button className="cdv-btn-ghost" onClick={() => setWithdrawOpen(false)}>Cancelar</button>
                <button className="cdv-btn-danger" onClick={confirmWithdraw}>
                  <Minus size={15} strokeWidth={2} />
                  Confirmar retiro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="cdv-toast">
          <Check size={13} strokeWidth={2.5} />
          {toast}
        </div>
      )}

    </div>
  );
}
