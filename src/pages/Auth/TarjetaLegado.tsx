// ============================================
// LIFE'S — Tarjeta del Legado
// ============================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TarjetaLegado.scss';

// ── Niveles de tarjeta ──
const NIVELES = [
  {
    id:          'plata',
    nombre:      'Nivel 1 — Plata',
    icon:        'military_tech',
    seguidores:  '0 – 999',
    color:       '#a8a9ad',
    colorBg:     'rgba(168,169,173,0.1)',
    colorBorder: 'rgba(168,169,173,0.3)',
    cardGrad:    'linear-gradient(135deg, #2a2a2a 0%, #4a4a4a 100%)',
    precio:      '$15',
    beneficios: [
      'Acceso a Caja Fuerte y Bóveda',
      'Triple Seguridad activada',
      'QR único vinculado a tu perfil',
      'Soporte estándar',
    ],
    automatico: false,
  },
  {
    id:          'oro',
    nombre:      'Nivel 2 — Oro',
    icon:        'workspace_premium',
    seguidores:  '1.000 – 9.999',
    color:       '#C9A84C',
    colorBg:     'rgba(201,168,76,0.1)',
    colorBorder: 'rgba(201,168,76,0.35)',
    cardGrad:    'linear-gradient(135deg, #03192e 0%, #1a2e44 100%)',
    precio:      '$15',
    beneficios: [
      'Todo lo de Plata',
      'Tarjeta con detalles dorados',
      'Badge dorado en tu perfil público',
      'Prioridad en soporte',
      'Descuento 10% en postales físicas',
    ],
    automatico: false,
  },
  {
    id:          'diamante',
    nombre:      'Nivel 3 — Diamante',
    icon:        'diamond',
    seguidores:  '10.000 – 99.999',
    color:       '#b9f2ff',
    colorBg:     'rgba(185,242,255,0.1)',
    colorBorder: 'rgba(185,242,255,0.35)',
    cardGrad:    'linear-gradient(135deg, #0a1628 0%, #0d2a4a 50%, #0a3d5e 100%)',
    precio:      '$15',
    beneficios: [
      'Todo lo de Oro',
      'Tarjeta con acabado holográfico',
      'Badge diamante verificado',
      'Acceso a galería de custodios VIP',
      'Descuento 20% en postales y envíos',
      '1 cápsula del tiempo extra por año',
    ],
    automatico: false,
  },
  {
    id:          'platino',
    nombre:      'Nivel 4 — Platino',
    icon:        'stars',
    seguidores:  '100.000+',
    color:       '#e8e8e8',
    colorBg:     'rgba(232,232,232,0.1)',
    colorBorder: 'rgba(232,232,232,0.4)',
    cardGrad:    'linear-gradient(135deg, #1a0533 0%, #2d0a5e 50%, #1a0533 100%)',
    precio:      'GRATIS',
    beneficios: [
      'Todo lo de Diamante',
      'Tarjeta enviada automáticamente por Life\'s',
      'Badge platino con verificación de influencer',
      'Perfil destacado en la plataforma',
      'Beneficios exclusivos y sorpresas de la empresa',
      'Acceso anticipado a nuevas funciones',
      'Línea de atención VIP directa',
    ],
    automatico: true,
  },
];

export default function TarjetaLegado() {
  const navigate = useNavigate();
  const [nivelSeleccionado, setNivelSeleccionado] = useState('plata');
  const [form, setForm] = useState({
    fullName: '', phone: '', address: '', city: '', postalCode: '', country: 'Argentina',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const nivel = NIVELES.find(n => n.id === nivelSeleccionado)!;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="tl-root">

      {/* Header */}
      <header className="tl-header">
        <div className="tl-header__inner">
          <button className="tl-header__menu">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <button className="tl-header__brand" onClick={() => navigate('/')}>
            <img src="/images/landing.png" alt="Life's" className="tl-header__img" />
            <span className="tl-header__name">Life's</span>
          </button>
          <div className="tl-header__avatar">
            <img src="https://i.pravatar.cc/40" alt="Perfil" />
          </div>
        </div>
      </header>

      <main className="tl-main">

        {/* ── HERO ── */}
        <section className="tl-hero">
          <div className="tl-hero__text">
            <span className="tl-hero__badge">
              <span className="material-symbols-outlined">local_fire_department</span>
              Edición Limitada
            </span>
            <h1 className="tl-hero__title">
              Tu Herencia,{' '}
              <em>Materializada.</em>
            </h1>
            <p className="tl-hero__sub">
              La Tarjeta del Legado Físico es más que un accesorio; es un ancla permanente
              para tus archivos digitales. Acabado con detalles premium según tu nivel de influencia.
            </p>
            <div className="tl-hero__social">
              <div className="tl-hero__avatars">
                {[1,2,3].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/40?img=${i+10}`} alt={`Miembro ${i}`} />
                ))}
              </div>
              <span className="tl-hero__social-text">
                Unido a más de <strong>12.000</strong> Custodios
              </span>
            </div>
          </div>

          {/* Preview tarjeta animada */}
          <div className="tl-hero__card-wrap">
            <div
              className="tl-card-preview"
              style={{ background: nivel.cardGrad, borderColor: nivel.color }}
            >
              <div className="tl-card-preview__top">
                <div>
                  <p className="tl-card-preview__brand">Life's</p>
                  <p className="tl-card-preview__member">Miembro Permanente</p>
                </div>
                <div className="tl-card-preview__icon-wrap" style={{ borderColor: `${nivel.color}30` }}>
                  <span className="material-symbols-outlined"
                    style={{ color: nivel.color, fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                    {nivel.icon}
                  </span>
                </div>
              </div>
              <div className="tl-card-preview__bottom">
                <div>
                  <h3 className="tl-card-preview__name">{form.fullName || 'Tu Nombre Aquí'}</h3>
                  <p className="tl-card-preview__id">ID: LIFES-{nivel.id.toUpperCase()}-001</p>
                </div>
                <div className="tl-card-preview__qr">
                  <span className="material-symbols-outlined">qr_code_2</span>
                </div>
              </div>
              {/* Nivel badge en la tarjeta */}
              <div className="tl-card-preview__nivel-badge" style={{ color: nivel.color }}>
                {nivel.nombre}
              </div>
            </div>
            <div className="tl-hero__card-glow" style={{ background: `${nivel.color}15` }} />
          </div>
        </section>

        {/* ── SISTEMA DE NIVELES ── */}
        <section className="tl-niveles">
          <div className="tl-section-header">
            <span className="tl-eyebrow">
              <span className="material-symbols-outlined">trending_up</span>
              Sistema de niveles
            </span>
            <h2 className="tl-section-title">Tu nivel crece con tu influencia</h2>
            <p className="tl-section-sub">
              A medida que crecen tus seguidores en Life's, tu tarjeta se actualiza automáticamente
              con mejores acabados y más beneficios. El nivel Platino es enviado gratuitamente por la empresa.
            </p>
          </div>

          <div className="tl-niveles__grid">
            {NIVELES.map(n => (
              <button
                key={n.id}
                className={`tl-nivel-card ${nivelSeleccionado === n.id ? 'selected' : ''} ${n.automatico ? 'automatico' : ''}`}
                style={{
                  borderColor: nivelSeleccionado === n.id ? n.color : 'rgba(196,198,205,0.15)',
                  background:  nivelSeleccionado === n.id ? n.colorBg : 'white',
                }}
                onClick={() => setNivelSeleccionado(n.id)}
              >
                {n.automatico && (
                  <div className="tl-nivel-card__auto-badge">
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Automático
                  </div>
                )}
                <div className="tl-nivel-card__icon" style={{ color: n.color }}>
                  <span className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                    {n.icon}
                  </span>
                </div>
                <div className="tl-nivel-card__name" style={{ color: nivelSeleccionado === n.id ? n.color : '#03192e' }}>
                  {n.nombre}
                </div>
                <div className="tl-nivel-card__seguidores">
                  <span className="material-symbols-outlined">group</span>
                  {n.seguidores} seguidores
                </div>
                <ul className="tl-nivel-card__beneficios">
                  {n.beneficios.slice(0, 3).map(b => (
                    <li key={b}>
                      <span className="material-symbols-outlined"
                        style={{ color: n.color, fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                        check_circle
                      </span>
                      {b}
                    </li>
                  ))}
                  {n.beneficios.length > 3 && (
                    <li className="tl-nivel-card__mas">+{n.beneficios.length - 3} beneficios más</li>
                  )}
                </ul>
                <div className="tl-nivel-card__precio" style={{ color: n.automatico ? '#27ae60' : '#03192e' }}>
                  {n.precio === 'GRATIS' ? (
                    <><span className="material-symbols-outlined">card_giftcard</span> GRATIS para vos</>
                  ) : (
                    <><span>Envío:</span> {n.precio}</>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Info nivel platino */}
          <div className="tl-platino-info">
            <span className="material-symbols-outlined">info</span>
            <p>
              <strong>Nivel Platino:</strong> Cuando Life's detecte que tu perfil supera los 100.000 seguidores,
              te enviaremos tu tarjeta Platino <strong>automáticamente y sin costo</strong>, junto con un kit
              de bienvenida exclusivo y beneficios sorpresa.
            </p>
          </div>
        </section>

        {/* ── FEATURES BENTO ── */}
        <section className="tl-bento">
          <div className="tl-bento__card tl-bento__card--wide">
            <span className="material-symbols-outlined tl-bento__icon"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              security
            </span>
            <h3 className="tl-bento__title">Triple Verificación</h3>
            <p className="tl-bento__desc">
              La tarjeta se integra con tu perfil biométrico y la app, asegurando que el acceso
              a tus bóvedas y archivos sea únicamente tuyo. Asegurado por QR, verificado por app.
            </p>
          </div>
          <div className="tl-bento__card tl-bento__card--dark">
            <span className="material-symbols-outlined tl-bento__icon">key</span>
            <h3 className="tl-bento__title tl-bento__title--light">Llave de Entrada</h3>
            <p className="tl-bento__desc tl-bento__desc--light">
              Acceso directo a tu bóveda digital, caja fuerte, testamento y herederos registrados.
            </p>
          </div>
          <div className="tl-bento__card">
            <span className="material-symbols-outlined tl-bento__icon"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              loyalty
            </span>
            <h3 className="tl-bento__title">Beneficios según nivel</h3>
            <ul className="tl-bento__list">
              {nivel.beneficios.map(b => (
                <li key={b}>
                  <span className="material-symbols-outlined">check_circle</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FORMULARIO DE ENVÍO ── */}
        {!submitted ? (
          <section className="tl-checkout">
            <div className="tl-checkout__form-side">
              <h3 className="tl-checkout__title">Información de Envío</h3>
              <p className="tl-checkout__nivel-sel">
                Solicitando tarjeta:{' '}
                <strong style={{ color: nivel.color }}>{nivel.nombre}</strong>
              </p>

              <form onSubmit={handleSubmit} className="tl-checkout__form">
                <div className="tl-checkout__row">
                  <div className="tl-checkout__field">
                    <label>Nombre Completo</label>
                    <input name="fullName" type="text" placeholder="Tu nombre legal"
                      value={form.fullName} onChange={handleChange} required />
                  </div>
                  <div className="tl-checkout__field">
                    <label>Teléfono</label>
                    <input name="phone" type="tel" placeholder="+54 9 261 555 1234"
                      value={form.phone} onChange={handleChange} required />
                  </div>
                </div>
                <div className="tl-checkout__field">
                  <label>Dirección de Envío</label>
                  <input name="address" type="text" placeholder="Calle y número, piso/depto"
                    value={form.address} onChange={handleChange} required />
                </div>
                <div className="tl-checkout__row tl-checkout__row--3">
                  <div className="tl-checkout__field">
                    <label>Ciudad</label>
                    <input name="city" type="text" placeholder="Mendoza"
                      value={form.city} onChange={handleChange} required />
                  </div>
                  <div className="tl-checkout__field">
                    <label>Código Postal</label>
                    <input name="postalCode" type="text" placeholder="M5500"
                      value={form.postalCode} onChange={handleChange} required />
                  </div>
                  <div className="tl-checkout__field">
                    <label>País</label>
                    <select name="country" value={form.country} onChange={handleChange}>
                      {['Argentina','Uruguay','Chile','Paraguay','Brasil','Colombia','México','España','Otro']
                        .map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {/* Botón submit solo en mobile — en desktop está en el resumen */}
                <button type="submit" className="tl-btn tl-checkout__submit-mobile" disabled={loading}>
                  {loading ? 'Procesando...' : 'Pedir mi Tarjeta del Legado'}
                </button>
              </form>
            </div>

            {/* Resumen del pedido */}
            <div className="tl-checkout__summary">
              <h4 className="tl-checkout__summary-title">Resumen del Pedido</h4>
              <div className="tl-checkout__summary-items">
                <div className="tl-checkout__summary-row">
                  <span>Tarjeta del Legado — {nivel.nombre}</span>
                  <span>Gratis</span>
                </div>
                <div className="tl-checkout__summary-row">
                  <span>Envío certificado</span>
                  <span>{nivel.precio === 'GRATIS' ? 'Gratis' : nivel.precio}</span>
                </div>
                <div className="tl-checkout__summary-divider" />
                <div className="tl-checkout__summary-row tl-checkout__summary-row--total">
                  <span>Total a Pagar</span>
                  <span style={{ color: '#735c00' }}>
                    {nivel.precio === 'GRATIS' ? '$0.00' : nivel.precio}
                  </span>
                </div>
              </div>

              <button className="tl-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Procesando...' : 'Pedir mi Tarjeta del Legado'}
              </button>
              <p className="tl-checkout__legal">
                Asegurado por encriptación de archivo de alta fidelidad
              </p>
            </div>
          </section>
        ) : (
          /* ── Éxito ── */
          <section className="tl-success">
            <div className="tl-success__ring">
              <span className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24", color: nivel.color }}>
                {nivel.icon}
              </span>
            </div>
            <h2 className="tl-success__title">¡Tu tarjeta <em>{nivel.nombre}</em> está en camino!</h2>
            <p className="tl-success__sub">
              Recibirás tu Tarjeta del Legado en 7 a 10 días hábiles en <strong>{form.city}, {form.country}</strong>.
            </p>
            <button className="tl-btn" onClick={() => navigate('/tarjeta-pendiente')}>
              <span className="material-symbols-outlined">visibility</span>
              Ver estado de mi tarjeta
            </button>
            <button className="tl-btn-ghost" onClick={() => navigate('/feed')}>
              Volver al inicio
            </button>
          </section>
        )}

        {/* Footer */}
        <footer className="tl-footer">
          <div className="tl-footer__divider">
            <div className="tl-footer__line" />
            <span className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
              history_edu
            </span>
            <div className="tl-footer__line" />
          </div>
          <p className="tl-footer__quote">Preservando el legado para los próximos 300 años</p>
          <p className="tl-footer__copy">© 2025 Life's · Materiales de Grado Archivo</p>
        </footer>

      </main>

      {/* Bottom nav mobile */}
      <nav className="tl-bottom-nav">
        {[
          { icon: 'auto_stories', label: 'Cronología', path: '/linea-de-vida' },
          { icon: 'account_tree', label: 'Árbol',      path: '/arbol-genealogico' },
          { icon: 'military_tech',label: 'Legado',     path: '/tarjeta-legado', active: true },
          { icon: 'edit_note',    label: 'Diario',     path: '/feed' },
        ].map(n => (
          <button key={n.path}
            className={`tl-bottom-nav__item ${n.active ? 'active' : ''}`}
            onClick={() => navigate(n.path)}>
            <span className="material-symbols-outlined"
              style={n.active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}>
              {n.icon}
            </span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
