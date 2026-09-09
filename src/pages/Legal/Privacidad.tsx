// ============================================
// LIFE'S — Política de Privacidad
// ============================================
import { useNavigate } from 'react-router-dom';
import './Legal.scss';

export default function Privacidad() {
  const navigate = useNavigate();

  return (
    <div className="lp-root">
      <header className="lp-header">
        <button className="lp-header__logo" onClick={() => navigate('/')}>Life's</button>
      </header>

      <main className="lp-main">
        <h1 className="lp-title">Política de Privacidad</h1>
        <p className="lp-updated">Última actualización: {new Date().getFullYear()}</p>

        <section className="lp-section">
          <h2>1. Qué información recopilamos</h2>
          <p>
            Nombre, apellido, email, fecha de nacimiento (opcional), y el contenido que vos
            decidas subir: fotos, videos, textos, y datos de tu árbol genealógico. También
            guardamos datos técnicos básicos (fecha de registro, actividad de la cuenta)
            para el funcionamiento del servicio.
          </p>
        </section>

        <section className="lp-section">
          <h2>2. Cómo usamos tu información</h2>
          <p>
            Usamos tus datos únicamente para operar el servicio: mostrarte tu contenido,
            mostrárselo a las personas que vos conectaste, y para funciones de seguridad
            (como detectar intentos de acceso indebido a tu cuenta).
          </p>
          <p>
            No usamos tu información para publicidad de terceros, ni la vendemos a nadie.
          </p>
        </section>

        <section className="lp-section">
          <h2>3. Con quién compartimos tu información</h2>
          <p>
            Tu contenido solo es visible para vos, salvo que decidas conectarte con otra
            persona y vincularla en tu árbol — en ese caso, esa persona ve únicamente el
            lugar que ocupa en tu árbol, no el resto de tu contenido.
          </p>
          <p>
            Usamos proveedores externos para operar la infraestructura (almacenamiento de
            archivos, envío de emails, base de datos) que procesan datos en nuestro nombre,
            bajo acuerdos de confidencialidad — nunca para sus propios fines.
          </p>
        </section>

        <section className="lp-section">
          <h2>4. Seguridad</h2>
          <p>
            Tus contraseñas se guardan encriptadas (nunca en texto plano). Tus fotos y
            videos se almacenan de forma privada, con acceso temporal controlado — no son
            públicos en internet.
          </p>
        </section>

        <section className="lp-section">
          <h2>5. Tus derechos</h2>
          <p>
            Podés acceder, corregir o eliminar tu información cuando quieras desde tu
            perfil, o pidiéndolo a soporte@lifes.com. Si eliminás tu cuenta, borramos tu
            contenido de forma permanente.
          </p>
        </section>

        <section className="lp-section">
          <h2>6. Cambios a esta política</h2>
          <p>
            Si hacemos cambios importantes a esta política, te vamos a avisar antes de que
            entren en vigencia.
          </p>
        </section>

        <section className="lp-section">
          <h2>7. Contacto</h2>
          <p>Para cualquier consulta sobre privacidad, escribinos a soporte@lifes.com.</p>
        </section>
      </main>
    </div>
  );
}
