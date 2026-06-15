// ============================================
// LIFE'S — Crear Cuenta
// ============================================
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CrearCuenta.scss';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  companyName?: string;
  cuit?: string;
}

function getPasswordStrength(pass: string): { level: number; label: string; color: string } {
  if (pass.length === 0) return { level: 0, label: '', color: '' };
  if (pass.length < 6)   return { level: 1, label: 'Débil',   color: '#ba1a1a' };
  if (pass.length < 10)  return { level: 2, label: 'Regular', color: '#e67e22' };
  if (!/[A-Z]/.test(pass) || !/[0-9]/.test(pass))
                          return { level: 3, label: 'Buena',   color: '#735c00' };
  return                         { level: 4, label: 'Óptima',  color: '#27ae60' };
}

export default function CrearCuenta() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEmpresa = searchParams.get('tipo') === 'empresa';

  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '',
    password: '', confirmPassword: '', birthDate: '',
    companyName: '', cuit: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Completá todos los campos obligatorios.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      navigate('/acceso-seguro');
    } catch {
      setError('Error al crear la cuenta. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cc-root">

      {/* ── Header ── */}
      <header className="cc-header">
        <div className="cc-header__inner">
          <button className="cc-header__logo" onClick={() => navigate('/')}>
            <img src="/images/landing.png" alt="Life's" className="cc-header__img" />
            <span className="cc-header__name">Life's</span>
          </button>
        </div>
      </header>

      <main className="cc-main">
        <div className="cc-grid">

          {/* ── Columna izquierda desktop ── */}
          <div className="cc-left">
            <div className="cc-left__text">
              <h1 className="cc-left__title">
                Comience su<br />
                <span className="cc-left__italic">historia eterna.</span>
              </h1>
              <div className="cc-left__divider" />
              <p className="cc-left__desc">
                No solo guardamos datos; custodiamos memorias. Nuestro compromiso
                es la preservación de su esencia a través de los siglos, garantizando
                que su legado sea una llama que nunca se apague para las generaciones venideras.
              </p>
            </div>
            <div className="cc-left__image-wrap">
              <img
                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80"
                alt="Diario de legado"
                className="cc-left__image"
              />
              <div className="cc-left__image-overlay" />
            </div>
          </div>

          {/* ── Columna derecha — formulario ── */}
          <div className="cc-right">
            <div className="cc-form-card">

              <div className="cc-form-card__header">
                <h2 className="cc-form-card__title">
                  {isEmpresa ? 'Registrar Empresa' : 'Crear Cuenta'}
                </h2>
                <p className="cc-form-card__subtitle">
                  {isEmpresa ? 'Inicie el legado de su organización' : 'Inicie su archivo personal'}
                </p>
              </div>

              {error && <div className="cc-error">{error}</div>}

              <form onSubmit={handleSubmit} className="cc-form">

                {isEmpresa && (
                  <>
                    <div className="cc-field">
                      <label className="cc-field__label">Nombre de la Empresa</label>
                      <input className="cc-field__input" name="companyName" type="text"
                        placeholder="Ej. Acme Corp S.A." value={form.companyName} onChange={handleChange} />
                    </div>
                    <div className="cc-field">
                      <label className="cc-field__label">CUIT / RUT</label>
                      <input className="cc-field__input" name="cuit" type="text"
                        placeholder="Ej. 30-12345678-9" value={form.cuit} onChange={handleChange} />
                    </div>
                  </>
                )}

                <div className="cc-field-row">
                  <div className="cc-field">
                    <label className="cc-field__label">Nombre</label>
                    <input className="cc-field__input" name="firstName" type="text"
                      placeholder="Gabriel" value={form.firstName} onChange={handleChange} />
                  </div>
                  <div className="cc-field">
                    <label className="cc-field__label">Apellido</label>
                    <input className="cc-field__input" name="lastName" type="text"
                      placeholder="García Márquez" value={form.lastName} onChange={handleChange} />
                  </div>
                </div>

                <div className="cc-field">
                  <label className="cc-field__label">Correo Electrónico</label>
                  <input className="cc-field__input" name="email" type="email"
                    placeholder="archivo@legado.com" value={form.email} onChange={handleChange} />
                </div>

                {!isEmpresa && (
                  <div className="cc-field">
                    <label className="cc-field__label">Fecha de Nacimiento</label>
                    <input className="cc-field__input" name="birthDate" type="date"
                      value={form.birthDate} onChange={handleChange} />
                  </div>
                )}

                <div className="cc-field">
                  <label className="cc-field__label">Contraseña</label>
                  <input className="cc-field__input" name="password" type="password"
                    placeholder="Mínimo 6 caracteres" value={form.password} onChange={handleChange} />
                  {form.password.length > 0 && (
                    <div className="cc-strength">
                      <div className="cc-strength__header">
                        <span className="cc-strength__text">Fuerza de seguridad</span>
                        <span className="cc-strength__label" style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                      <div className="cc-strength__bars">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="cc-strength__bar"
                            style={{ background: i <= strength.level ? strength.color : '#e4e2de' }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="cc-field">
                  <label className="cc-field__label">Confirmar Contraseña</label>
                  <input
                    className={`cc-field__input${form.confirmPassword && form.password !== form.confirmPassword ? ' cc-field__input--error' : ''}`}
                    name="confirmPassword" type="password"
                    placeholder="Repetí tu contraseña"
                    value={form.confirmPassword} onChange={handleChange} />
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <span className="cc-field__error-msg">Las contraseñas no coinciden</span>
                  )}
                </div>

                <button type="submit" className="cc-btn-submit" disabled={loading}>
                  {loading ? 'Creando tu legado...' : 'Comenzar mi Legado'}
                </button>

                <p className="cc-quote">
                  "La memoria es el único paraíso del que no podemos ser expulsados."
                </p>

                <div className="cc-login-link">
                  <span>¿Ya sos custodio de tu historia?</span>
                  <button type="button" className="cc-login-link__btn" onClick={() => navigate('/')}>
                    Iniciá Sesión
                  </button>
                </div>

              </form>
            </div>

            {/* Sellos de confianza */}
            <div className="cc-trust">
              {[
                { icon: 'lock',          label: 'Encriptación Vitalicia' },
                { icon: 'verified_user', label: 'Privacidad Absoluta' },
                { icon: 'auto_awesome',  label: 'Soporte Multigeneracional' },
              ].map(t => (
                <div key={t.label} className="cc-trust__item">
                  <span className="material-symbols-outlined cc-trust__icon">{t.icon}</span>
                  <span className="cc-trust__label">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <footer className="cc-footer">
        <div className="cc-footer__inner">
          <div className="cc-footer__brand">
            <span className="cc-footer__name">Life's</span>
            <p className="cc-footer__copy">© 2025 Life's. Preservando historias con dignidad.</p>
          </div>
          <div className="cc-footer__links">
            <button className="cc-footer__link">Privacidad</button>
            <button className="cc-footer__link">Términos</button>
            <button className="cc-footer__link">Ayuda</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
