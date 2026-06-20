// ============================================================
// LIFE'S — Postal.tsx | Enviar Recuerdo Físico
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Postal.scss';

// ── Tipos ──────────────────────────────────────────────────
type Filtro    = 'original' | 'sepia' | 'analogico' | 'plateado' | 'polaroid' | 'cinematico';
type Fuente    = 'cursiva' | 'serifa' | 'moderna' | 'maquina';
type Soporte   = 'papel_mate' | 'papel_brillante' | 'canvas' | 'acrilico';
type TipoMarco = 'sin_marco' | 'madera' | 'digital';
type ColorMarco= 'natural' | 'oscuro' | 'blanco' | 'negro' | 'dorado';
type Tamano    = 'postal' | 'retrato' | 'arte' | 'gran_formato';

interface Precio {
  base: number;
  soporte: number;
  marco: number;
  envio: number;
}

// ── Datos configurables ────────────────────────────────────
const FILTROS: { id: Filtro; label: string; css: string }[] = [
  { id: 'original',    label: 'Original',    css: 'none' },
  { id: 'sepia',       label: 'Sepia',       css: 'sepia(80%) brightness(1.05) contrast(0.9)' },
  { id: 'analogico',   label: 'Analógico',   css: 'saturate(70%) contrast(1.1) brightness(1.02) hue-rotate(-5deg)' },
  { id: 'plateado',    label: 'Plateado',    css: 'grayscale(100%) contrast(1.15) brightness(1.05)' },
  { id: 'polaroid',    label: 'Polaroid',    css: 'saturate(80%) brightness(1.08) contrast(0.92) sepia(20%)' },
  { id: 'cinematico',  label: 'Cinemático',  css: 'saturate(85%) contrast(1.1) brightness(0.97) hue-rotate(10deg)' },
];

const FUENTES: { id: Fuente; label: string; family: string; preview: string }[] = [
  { id: 'cursiva',  label: 'Caligráfica',     family: "'Mrs Saint Delafield', cursive",  preview: 'Nunca olvidaré este viaje' },
  { id: 'serifa',   label: 'Clásica',          family: "'Newsreader', serif",             preview: 'Nunca olvidaré este viaje' },
  { id: 'moderna',  label: 'Moderna',          family: "'Manrope', sans-serif",           preview: 'Nunca olvidaré este viaje' },
  { id: 'maquina',  label: 'Máquina de escribir', family: "'Courier New', monospace",    preview: 'Nunca olvidaré este viaje' },
];

const SOPORTES: { id: Soporte; label: string; desc: string; precio: number }[] = [
  { id: 'papel_mate',    label: 'Papel Mate',       desc: 'Textura suave, sin reflejos',    precio: 0 },
  { id: 'papel_brillante', label: 'Papel Brillante', desc: 'Colores vibrantes, acabado glossy', precio: 800 },
  { id: 'canvas',        label: 'Canvas',            desc: 'Tela estirada, estilo galería',  precio: 3200 },
  { id: 'acrilico',      label: 'Acrílico',          desc: 'Vidrio moderno, máxima nitidez', precio: 6500 },
];

const MARCOS: { id: TipoMarco; label: string; desc: string; precio: number }[] = [
  { id: 'sin_marco', label: 'Sin marco',     desc: 'Solo la impresión',           precio: 0 },
  { id: 'madera',    label: 'Marco de Madera', desc: 'Madera maciza, artesanal',  precio: 2800 },
  { id: 'digital',   label: 'Marco Digital', desc: 'Portarretratos WiFi premium', precio: 18500 },
];

const COLORES_MARCO: { id: ColorMarco; label: string; hex: string }[] = [
  { id: 'natural', label: 'Natural',    hex: '#C4A265' },
  { id: 'oscuro',  label: 'Oscuro',     hex: '#2A1B0E' },
  { id: 'blanco',  label: 'Blanco',     hex: '#F5F0E8' },
  { id: 'negro',   label: 'Negro',      hex: '#1A1A1A' },
  { id: 'dorado',  label: 'Dorado',     hex: '#C9932A' },
];

const TAMANOS: { id: Tamano; label: string; desc: string; precio: number; w: number; h: number }[] = [
  { id: 'postal',       label: '📮 Postal',       desc: '10 × 15 cm',  precio: 0,     w: 280, h: 190 },
  { id: 'retrato',      label: '🖼️ Retrato',      desc: '20 × 30 cm',  precio: 1500,  w: 280, h: 420 },
  { id: 'arte',         label: '🎨 Arte',          desc: '30 × 40 cm',  precio: 3200,  w: 320, h: 430 },
  { id: 'gran_formato', label: '👑 Gran Formato',  desc: '50 × 70 cm',  precio: 7800,  w: 340, h: 476 },
];

const PRECIOS_BASE: Record<Tamano, number> = {
  postal:       4500,
  retrato:      7200,
  arte:         12000,
  gran_formato: 22000,
};

// ── Componente principal ───────────────────────────────────
export default function Postal() {
  const navigate        = useNavigate();
  const [params]        = useSearchParams();

  // Estado del configurador
  const [filtro,      setFiltro]      = useState<Filtro>('original');
  const [fuente,      setFuente]      = useState<Fuente>('cursiva');
  const [soporte,     setSoporte]     = useState<Soporte>('papel_mate');
  const [tipoMarco,   setTipoMarco]   = useState<TipoMarco>('sin_marco');
  const [colorMarco,  setColorMarco]  = useState<ColorMarco>('natural');
  const [tamano,      setTamano]      = useState<Tamano>('postal');
  const [dedicatoria, setDedicatoria] = useState('');
  const [firmaNombre, setFirmaNombre] = useState('');
  const [cantidad,    setCantidad]    = useState(1);

  // Destinatario
  const [destNombre,  setDestNombre]  = useState('');
  const [destDir,     setDestDir]     = useState('');
  const [destCiudad,  setDestCiudad]  = useState('');
  const [destCP,      setDestCP]      = useState('');

  // Paso activo del wizard
  const [paso, setPaso] = useState(1);

  // Info del recuerdo (viene por searchParams desde Timeline)
  const recuerdoFoto    = params.get('foto')   || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80';
  const recuerdoTitulo  = params.get('titulo') || 'Nuestro viaje';
  const recuerdoFecha   = params.get('fecha')  || '';
  const recuerdoLugar   = params.get('lugar')  || '';
  const recuerdoPersonas= params.get('personas')|| '';

  // Calcular precio
  const tamanoInfo  = TAMANOS.find(t => t.id === tamano)!;
  const soporteInfo = SOPORTES.find(s => s.id === soporte)!;
  const marcoInfo   = MARCOS.find(m => m.id === tipoMarco)!;
  const precioBase  = PRECIOS_BASE[tamano];
  const precioTotal = (precioBase + soporteInfo.precio + marcoInfo.precio + 850) * cantidad;

  // Filtro CSS activo
  const filtroCss = FILTROS.find(f => f.id === filtro)!.css;

  // Marco visual
  const colorMarcoHex = tipoMarco === 'madera' || tipoMarco === 'digital'
    ? COLORES_MARCO.find(c => c.id === colorMarco)!.hex
    : 'transparent';

  const estiloMarco = tipoMarco === 'sin_marco'
    ? {}
    : tipoMarco === 'digital'
    ? { border: `14px solid ${colorMarcoHex}`, boxShadow: `0 0 0 2px #1a1a1a, 0 0 20px ${colorMarcoHex}60, 0 20px 60px rgba(0,0,0,0.3)` }
    : { border: `18px solid ${colorMarcoHex}`, boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), 0 20px 60px rgba(0,0,0,0.25)` };

  const fuenteFamily = FUENTES.find(f => f.id === fuente)!.family;

  return (
    <div className="postal-page">

      {/* ── Header ── */}
      <header className="postal-header">
        <button className="postal-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="postal-header__title">
          <span className="postal-header__eyebrow">Monetización · Envío físico</span>
          <h1>Enviar Recuerdo</h1>
        </div>
        <div className="postal-header__recuerdo">
          <img src={recuerdoFoto} alt={recuerdoTitulo} />
          <div>
            <span>{recuerdoTitulo}</span>
            {recuerdoFecha && <small>{recuerdoFecha}</small>}
          </div>
        </div>
      </header>

      {/* ── Wizard steps ── */}
      <div className="postal-wizard">
        {[
          { n: 1, label: 'Estilo' },
          { n: 2, label: 'Dedicatoria' },
          { n: 3, label: 'Formato' },
          { n: 4, label: 'Destinatario' },
          { n: 5, label: 'Confirmar' },
        ].map(s => (
          <button
            key={s.n}
            className={`postal-wizard__step${paso === s.n ? ' active' : ''}${paso > s.n ? ' done' : ''}`}
            onClick={() => setPaso(s.n)}
          >
            <span className="postal-wizard__num">
              {paso > s.n ? '✓' : s.n}
            </span>
            <span className="postal-wizard__label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Layout principal ── */}
      <div className="postal-layout">

        {/* ════ PREVIEW EN VIVO — hoja de papel ════ */}
        <div className="postal-preview">
          <div className="postal-preview__label">Vista previa en vivo</div>
          <div className="postal-preview__paper">
            <div
              className={`postal-preview__frame postal-preview__frame--${tipoMarco}`}
              style={estiloMarco}
            >
              {/* Foto con filtro */}
              <div className="postal-preview__photo-wrap">
                <img
                  src={recuerdoFoto}
                  alt={recuerdoTitulo}
                  className="postal-preview__photo"
                  style={{ filter: filtroCss }}
                />
                {/* Overlay Polaroid */}
                {filtro === 'polaroid' && (
                  <div className="postal-preview__polaroid-overlay" />
                )}
                {/* Badge marco digital */}
                {tipoMarco === 'digital' && (
                  <div className="postal-preview__digital-badge">
                    <span>WiFi</span>
                  </div>
                )}
              </div>

              {/* Dedicatoria sobre la foto */}
              {dedicatoria && (
                <div
                  className="postal-preview__dedicatoria"
                  style={{ fontFamily: fuenteFamily }}
                >
                  <p className="postal-preview__frase">"{dedicatoria}"</p>
                  {firmaNombre && (
                    <p className="postal-preview__firma">— {firmaNombre}</p>
                  )}
                </div>
              )}
            </div>

            {/* Pie de la hoja */}
            <div className="postal-preview__pie">
              <div className="postal-preview__metadata">
                {recuerdoFecha && <span>📅 {recuerdoFecha}</span>}
                {recuerdoLugar && <span>📍 {recuerdoLugar}</span>}
                {recuerdoPersonas && <span>👥 {recuerdoPersonas}</span>}
              </div>
              <div className="postal-preview__tamano-badge">
                {tamanoInfo.desc}
              </div>
            </div>
          </div>

          {/* Precio flotante */}
          <div className="postal-preview__precio">
            <span className="postal-preview__precio-label">Total estimado</span>
            <span className="postal-preview__precio-valor">
              ${precioTotal.toLocaleString('es-AR')}
            </span>
            {cantidad > 1 && (
              <span className="postal-preview__precio-cant">×{cantidad} unidades</span>
            )}
          </div>
        </div>

        {/* ════ PANEL DE CONTROLES ════ */}
        <div className="postal-controles">

          {/* ── PASO 1: Estilo ── */}
          {paso === 1 && (
            <section className="postal-seccion">
              <div className="postal-seccion__header">
                <h2>Estilo de la foto</h2>
                <span className="postal-seccion__paso">Paso 01</span>
              </div>

              {/* Filtros */}
              <div className="postal-grupo">
                <label className="postal-label">Filtro de época</label>
                <div className="postal-filtros">
                  {FILTROS.map(f => (
                    <button
                      key={f.id}
                      className={`postal-filtro${filtro === f.id ? ' active' : ''}`}
                      onClick={() => setFiltro(f.id)}
                    >
                      <div className="postal-filtro__thumb">
                        <img
                          src={recuerdoFoto}
                          alt={f.label}
                          style={{ filter: f.css }}
                        />
                      </div>
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Soporte */}
              <div className="postal-grupo">
                <label className="postal-label">Material de impresión</label>
                <div className="postal-opciones">
                  {SOPORTES.map(s => (
                    <button
                      key={s.id}
                      className={`postal-opcion${soporte === s.id ? ' active' : ''}`}
                      onClick={() => setSoporte(s.id)}
                    >
                      <span className="postal-opcion__nombre">{s.label}</span>
                      <span className="postal-opcion__desc">{s.desc}</span>
                      {s.precio > 0 && (
                        <span className="postal-opcion__extra">+${s.precio.toLocaleString('es-AR')}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button className="postal-btn-sig" onClick={() => setPaso(2)}>
                Siguiente → Dedicatoria
              </button>
            </section>
          )}

          {/* ── PASO 2: Dedicatoria ── */}
          {paso === 2 && (
            <section className="postal-seccion">
              <div className="postal-seccion__header">
                <h2>Tu dedicatoria</h2>
                <span className="postal-seccion__paso">Paso 02</span>
              </div>

              <div className="postal-grupo">
                <label className="postal-label">Frase que quedará en la foto</label>
                <textarea
                  className="postal-textarea"
                  placeholder="Ej: Nunca voy a olvidar este viaje, amigo del alma…"
                  value={dedicatoria}
                  onChange={e => setDedicatoria(e.target.value)}
                  maxLength={120}
                  rows={3}
                />
                <span className="postal-contador">{dedicatoria.length}/120</span>
              </div>

              <div className="postal-grupo">
                <label className="postal-label">Firma</label>
                <input
                  className="postal-input"
                  type="text"
                  placeholder="Ej: Marcelo"
                  value={firmaNombre}
                  onChange={e => setFirmaNombre(e.target.value)}
                />
              </div>

              <div className="postal-grupo">
                <label className="postal-label">Tipografía de la dedicatoria</label>
                <div className="postal-fuentes">
                  {FUENTES.map(f => (
                    <button
                      key={f.id}
                      className={`postal-fuente${fuente === f.id ? ' active' : ''}`}
                      onClick={() => setFuente(f.id)}
                      style={{ fontFamily: f.family }}
                    >
                      <span className="postal-fuente__preview">{f.preview}</span>
                      <span className="postal-fuente__label">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="postal-nav">
                <button className="postal-btn-back" onClick={() => setPaso(1)}>← Volver</button>
                <button className="postal-btn-sig" onClick={() => setPaso(3)}>Siguiente → Formato</button>
              </div>
            </section>
          )}

          {/* ── PASO 3: Formato ── */}
          {paso === 3 && (
            <section className="postal-seccion">
              <div className="postal-seccion__header">
                <h2>Tamaño y marco</h2>
                <span className="postal-seccion__paso">Paso 03</span>
              </div>

              {/* Tamaños */}
              <div className="postal-grupo">
                <label className="postal-label">Tamaño de impresión</label>
                <div className="postal-tamanos">
                  {TAMANOS.map(t => (
                    <button
                      key={t.id}
                      className={`postal-tamano${tamano === t.id ? ' active' : ''}`}
                      onClick={() => setTamano(t.id)}
                    >
                      <span className="postal-tamano__emoji">{t.label.split(' ')[0]}</span>
                      <span className="postal-tamano__nombre">{t.label.split(' ').slice(1).join(' ')}</span>
                      <span className="postal-tamano__medida">{t.desc}</span>
                      {t.precio > 0 && (
                        <span className="postal-tamano__extra">+${t.precio.toLocaleString('es-AR')}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marcos */}
              <div className="postal-grupo">
                <label className="postal-label">Tipo de marco</label>
                <div className="postal-opciones">
                  {MARCOS.map(m => (
                    <button
                      key={m.id}
                      className={`postal-opcion${tipoMarco === m.id ? ' active' : ''}${m.id === 'digital' ? ' postal-opcion--premium' : ''}`}
                      onClick={() => setTipoMarco(m.id)}
                    >
                      <span className="postal-opcion__nombre">
                        {m.id === 'digital' && <span className="postal-badge-premium">PREMIUM</span>}
                        {m.label}
                      </span>
                      <span className="postal-opcion__desc">{m.desc}</span>
                      {m.precio > 0 && (
                        <span className="postal-opcion__extra">+${m.precio.toLocaleString('es-AR')}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color de marco (si aplica) */}
              {(tipoMarco === 'madera' || tipoMarco === 'digital') && (
                <div className="postal-grupo">
                  <label className="postal-label">
                    {tipoMarco === 'digital' ? 'Color del marco digital' : 'Color de la madera'}
                  </label>
                  <div className="postal-colores">
                    {COLORES_MARCO.map(c => (
                      <button
                        key={c.id}
                        className={`postal-color${colorMarco === c.id ? ' active' : ''}`}
                        onClick={() => setColorMarco(c.id)}
                        title={c.label}
                        style={{ '--color': c.hex } as React.CSSProperties}
                      >
                        <span
                          className="postal-color__chip"
                          style={{ background: c.hex }}
                        />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cantidad */}
              <div className="postal-grupo">
                <label className="postal-label">Cantidad de copias</label>
                <div className="postal-cantidad">
                  <button
                    className="postal-cantidad__btn"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  >−</button>
                  <span className="postal-cantidad__num">{cantidad}</span>
                  <button
                    className="postal-cantidad__btn"
                    onClick={() => setCantidad(Math.min(10, cantidad + 1))}
                  >+</button>
                  {cantidad > 1 && (
                    <span className="postal-cantidad__hint">🎁 Enviás a {cantidad} personas</span>
                  )}
                </div>
              </div>

              <div className="postal-nav">
                <button className="postal-btn-back" onClick={() => setPaso(2)}>← Volver</button>
                <button className="postal-btn-sig" onClick={() => setPaso(4)}>Siguiente → Destinatario</button>
              </div>
            </section>
          )}

          {/* ── PASO 4: Destinatario ── */}
          {paso === 4 && (
            <section className="postal-seccion">
              <div className="postal-seccion__header">
                <h2>¿A quién se lo enviamos?</h2>
                <span className="postal-seccion__paso">Paso 04</span>
              </div>

              <div className="postal-grupo">
                <label className="postal-label">Nombre completo</label>
                <input
                  className="postal-input"
                  type="text"
                  placeholder="Ej: Elena Martínez"
                  value={destNombre}
                  onChange={e => setDestNombre(e.target.value)}
                />
              </div>
              <div className="postal-grupo">
                <label className="postal-label">Dirección de entrega</label>
                <input
                  className="postal-input"
                  type="text"
                  placeholder="Calle, número, piso"
                  value={destDir}
                  onChange={e => setDestDir(e.target.value)}
                />
              </div>
              <div className="postal-grid-2">
                <div className="postal-grupo">
                  <label className="postal-label">Ciudad</label>
                  <input
                    className="postal-input"
                    type="text"
                    placeholder="Mendoza"
                    value={destCiudad}
                    onChange={e => setDestCiudad(e.target.value)}
                  />
                </div>
                <div className="postal-grupo">
                  <label className="postal-label">Código Postal</label>
                  <input
                    className="postal-input"
                    type="text"
                    placeholder="M5500"
                    value={destCP}
                    onChange={e => setDestCP(e.target.value)}
                  />
                </div>
              </div>

              <div className="postal-nav">
                <button className="postal-btn-back" onClick={() => setPaso(3)}>← Volver</button>
                <button
                  className="postal-btn-sig"
                  onClick={() => setPaso(5)}
                  disabled={!destNombre || !destDir || !destCiudad}
                >
                  Siguiente → Confirmar
                </button>
              </div>
            </section>
          )}

          {/* ── PASO 5: Confirmar / Pago ── */}
          {paso === 5 && (
            <section className="postal-seccion">
              <div className="postal-seccion__header">
                <h2>Resumen y pago</h2>
                <span className="postal-seccion__paso">Paso 05</span>
              </div>

              {/* Resumen tipo sobre */}
              <div className="postal-sobre">
                <div className="postal-sobre__sello">
                  <div className="postal-sobre__sello-inner">
                    <span>Life's</span>
                  </div>
                </div>

                <div className="postal-sobre__destinatario">
                  <span className="postal-sobre__para">Para:</span>
                  <strong>{destNombre}</strong>
                  <span>{destDir}</span>
                  <span>{destCiudad} {destCP}</span>
                </div>

                <div className="postal-sobre__detalle">
                  <div className="postal-sobre__linea">
                    <span>Impresión {TAMANOS.find(t=>t.id===tamano)?.label}</span>
                    <span>${PRECIOS_BASE[tamano].toLocaleString('es-AR')}</span>
                  </div>
                  {soporteInfo.precio > 0 && (
                    <div className="postal-sobre__linea">
                      <span>{soporteInfo.label}</span>
                      <span>+${soporteInfo.precio.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  {marcoInfo.precio > 0 && (
                    <div className="postal-sobre__linea">
                      <span>{marcoInfo.label}</span>
                      <span>+${marcoInfo.precio.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                  <div className="postal-sobre__linea">
                    <span>Envío certificado</span>
                    <span>$850</span>
                  </div>
                  {cantidad > 1 && (
                    <div className="postal-sobre__linea">
                      <span>× {cantidad} copias</span>
                      <span></span>
                    </div>
                  )}
                  <div className="postal-sobre__total">
                    <span>Total</span>
                    <span>${precioTotal.toLocaleString('es-AR')}</span>
                  </div>
                </div>

                <p className="postal-sobre__garantia">
                  🏛️ Impresión con estándares de archivo de museo · duración +100 años
                </p>
              </div>

              {/* Métodos de pago */}
              <div className="postal-pagos">
                <label className="postal-label">Forma de pago</label>
                <button className="postal-pago postal-pago--mp">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                  Pagar con Mercado Pago
                </button>
                <button className="postal-pago postal-pago--card">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Tarjeta de Débito / Crédito
                </button>
              </div>

              <div className="postal-nav">
                <button className="postal-btn-back" onClick={() => setPaso(4)}>← Volver</button>
              </div>
            </section>
          )}

        </div>{/* fin postal-controles */}
      </div>{/* fin postal-layout */}

    </div>
  );
}