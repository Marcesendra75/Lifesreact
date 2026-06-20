// ============================================
// LIFE'S — Tarjeta Pendiente
// ============================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TarjetaPendiente.scss';

const ESTADOS = [
  {
    id:      'solicitada',
    icon:    'task_alt',
    label:   'Solicitud recibida',
    desc:    'Tu pedido fue procesado correctamente.',
    done:    true,
    active:  false,
  },
  {
    id:      'produccion',
    icon:    'print',
    label:   'En producción',
    desc:    'Tu tarjeta está siendo confeccionada con acabado premium.',
    done:    false,
    active:  true,
  },
  {
    id:      'envio',
    icon:    'local_shipping',
    label:   'En camino',
    desc:    'Tu tarjeta fue despachada por correo certificado.',
    done:    false,
    active:  false,
  },
  {
    id:      'activacion',
    icon:    'qr_code_scanner',
    label:   'Activación QR',
    desc:    'Escaneá el QR de tu tarjeta para activar la bóveda.',
    done:    false,
    active:  false,
  },
];

// Datos simulados — se reemplazarán con API
const MOCK_CARD = {
  nivel:       'Oro',
  nivelColor:  '#C9A84C',
  nivelIcon:   'workspace_premium',
  nombre:      'Marcelo González',
  solicitadoEl: '15 de enero, 2026',
  estimadoEl:   '25 de enero, 2026',
  ciudad:      'Mendoza, Argentina',
  trackingCode: 'LIFES-ORO-00142',
};

export default function TarjetaPendiente() {
  const navigate = useNavigate();
  const [diasRestantes, setDiasRestantes] = useState(8);
  const progreso = 35; // % simulado

  return (
    <div className="tp-root">
      <div className="tp-orb tp-orb--1" />
      <div className="tp-orb tp-orb--2" />

      {/* Header */}
      <header className="tp-header">
        <button className="tp-header__back" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <button className="tp-header__brand" onClick={() => navigate('/')}>
          <img src="/images/landing.png" alt="Life's" className="tp-header__img" />
          <span className="tp-header__name">Life's</span>
        </button>
        <div style={{ width: 40 }} />
      </header>

      <div className="tp-container">

        {/* ── Hero estado ── */}
        <div className="tp-hero fade-up">
          <div className="tp-hero__badge">
            <span className="tp-hero__dot" />
            En producción
          </div>
          <h1 className="tp-hero__title">
            Tu tarjeta está<br /><em>en camino</em>
          </h1>
          <p className="tp-hero__sub">
            Estamos confeccionando tu <strong>Tarjeta del Legado {MOCK_CARD.nivel}</strong> con
            acabado premium. Llegará a <strong>{MOCK_CARD.ciudad}</strong> en aproximadamente
            <strong> {diasRestantes} días hábiles</strong>.
          </p>
        </div>

        {/* ── Preview tarjeta ── */}
        <div className="tp-card-wrap fade-up">
          <div className="tp-card-preview">
            <div className="tp-card-preview__top">
              <div>
                <p className="tp-card-preview__brand">Life's</p>
                <p className="tp-card-preview__member">Miembro Permanente</p>
              </div>
              <div className="tp-card-preview__icon-wrap"
                style={{ borderColor: `${MOCK_CARD.nivelColor}40` }}>
                <span className="material-symbols-outlined"
                  style={{ color: MOCK_CARD.nivelColor,
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                  {MOCK_CARD.nivelIcon}
                </span>
              </div>
            </div>
            <div className="tp-card-preview__bottom">
              <div>
                <h3 className="tp-card-preview__name">{MOCK_CARD.nombre}</h3>
                <p className="tp-card-preview__id">{MOCK_CARD.trackingCode}</p>
              </div>
              <div className="tp-card-preview__qr">
                <span className="material-symbols-outlined">qr_code_2</span>
              </div>
            </div>
            {/* Overlay de "en producción" */}
            <div className="tp-card-preview__overlay">
              <span className="material-symbols-outlined">hourglass_top</span>
              <span>En producción</span>
            </div>
          </div>
          <div className="tp-card-glow" style={{ background: `${MOCK_CARD.nivelColor}18` }} />
        </div>

        {/* ── Barra de progreso ── */}
        <div className="tp-progress fade-up">
          <div className="tp-progress__header">
            <span className="tp-progress__label">Progreso de tu pedido</span>
            <span className="tp-progress__pct">{progreso}%</span>
          </div>
          <div className="tp-progress__track">
            <div className="tp-progress__fill" style={{ width: `${progreso}%` }} />
          </div>
          <div className="tp-progress__dates">
            <span>Solicitado: {MOCK_CARD.solicitadoEl}</span>
            <span>Estimado: {MOCK_CARD.estimadoEl}</span>
          </div>
        </div>

        {/* ── Timeline de estados ── */}
        <div className="tp-timeline fade-up">
          {ESTADOS.map((e, i) => (
            <div key={e.id} className={`tp-timeline__item ${e.done ? 'done' : ''} ${e.active ? 'active' : ''}`}>
              <div className="tp-timeline__left">
                <div className="tp-timeline__dot">
                  <span className="material-symbols-outlined"
                    style={{ fontVariationSettings: e.done ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24" }}>
                    {e.icon}
                  </span>
                </div>
                {i < ESTADOS.length - 1 && <div className="tp-timeline__line" />}
              </div>
              <div className="tp-timeline__content">
                <div className="tp-timeline__label">{e.label}</div>
                <div className="tp-timeline__desc">{e.desc}</div>
                {e.active && (
                  <div className="tp-timeline__active-badge">
                    <span className="tp-timeline__active-dot" />
                    En proceso ahora
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Info tracking ── */}
        <div className="tp-tracking fade-up">
          <div className="tp-tracking__row">
            <span className="material-symbols-outlined">tag</span>
            <div>
              <div className="tp-tracking__label">Código de seguimiento</div>
              <div className="tp-tracking__value">{MOCK_CARD.trackingCode}</div>
            </div>
          </div>
          <div className="tp-tracking__row">
            <span className="material-symbols-outlined">location_on</span>
            <div>
              <div className="tp-tracking__label">Dirección de entrega</div>
              <div className="tp-tracking__value">{MOCK_CARD.ciudad}</div>
            </div>
          </div>
          <div className="tp-tracking__row">
            <span className="material-symbols-outlined">schedule</span>
            <div>
              <div className="tp-tracking__label">Entrega estimada</div>
              <div className="tp-tracking__value">{MOCK_CARD.estimadoEl}</div>
            </div>
          </div>
        </div>

        {/* ── Qué hacer cuando llegue ── */}
        <div className="tp-instrucciones fade-up">
          <div className="tp-instrucciones__title">
            <span className="material-symbols-outlined">info</span>
            ¿Qué hacer cuando llegue tu tarjeta?
          </div>
          <ol className="tp-instrucciones__list">
            <li>
              <span className="tp-instrucciones__num">1</span>
              <div>
                <strong>Abrí Life's</strong> y andá a{' '}
                <em>Acceso Seguro → Escanear QR</em>
              </div>
            </li>
            <li>
              <span className="tp-instrucciones__num">2</span>
              <div>
                <strong>Escaneá el código QR</strong> impreso en el reverso de tu tarjeta
              </div>
            </li>
            <li>
              <span className="tp-instrucciones__num">3</span>
              <div>
                <strong>Creá tu PIN</strong> de 6 dígitos para completar la activación
              </div>
            </li>
            <li>
              <span className="tp-instrucciones__num">4</span>
              <div>
                ¡Listo! Tu <strong>bóveda estará desbloqueada</strong> con triple seguridad
              </div>
            </li>
          </ol>
        </div>

        {/* ── Acciones ── */}
        <div className="tp-acciones fade-up">
          <button className="tp-btn" onClick={() => navigate('/tarjeta-legado')}>
            <span className="material-symbols-outlined">credit_card</span>
            Ver mi tarjeta
          </button>
          <button className="tp-btn-ghost" onClick={() => navigate('/feed')}>
            <span className="material-symbols-outlined">home</span>
            Ir al inicio
          </button>
        </div>

        {/* Sellos */}
        <div className="tp-trust">
          {[
            { icon: 'local_shipping', label: 'Envío certificado' },
            { icon: 'lock',           label: 'Datos encriptados' },
            { icon: 'support_agent',  label: 'Soporte 24/7' },
          ].map(t => (
            <div key={t.label} className="tp-trust__item">
              <span className="material-symbols-outlined">{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
