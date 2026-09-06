// ============================================
// LIFE'S — Términos y Condiciones
// ============================================
import { useNavigate } from 'react-router-dom';
import './Legal.scss';

export default function Terminos() {
  const navigate = useNavigate();

  return (
    <div className="lp-root">
      <header className="lp-header">
        <button className="lp-header__logo" onClick={() => navigate('/')}>Life's</button>
      </header>

      <main className="lp-main">
        <h1 className="lp-title">Términos y Condiciones</h1>
        <p className="lp-updated">Última actualización: {new Date().getFullYear()}</p>

        <section className="lp-section">
          <h2>1. Aceptación de los términos</h2>
          <p>
            Al crear una cuenta en Life's aceptás estos Términos y Condiciones y nuestra
            Política de Privacidad. Si no estás de acuerdo con alguna parte, no debés usar
            el servicio.
          </p>
        </section>

        <section className="lp-section">
          <h2>2. Descripción del servicio</h2>
          <p>
            Life's es una plataforma para guardar y compartir recuerdos, fotos, videos y
            vínculos familiares con las personas que elijas conectar. Algunas funciones
            (como la Bóveda) requieren verificación adicional de identidad.
          </p>
        </section>

        <section className="lp-section">
          <h2>3. Cuentas y edad mínima</h2>
          <p>
            Tenés que tener al menos 13 años para crear una cuenta (o la edad mínima que
            exija la ley de tu país, si es mayor). Sos responsable de mantener la
            confidencialidad de tu contraseña y de toda actividad que ocurra en tu cuenta.
          </p>
        </section>

        <section className="lp-section">
          <h2>4. Contenido que subís</h2>
          <p>
            Vos sos el dueño del contenido que subís (fotos, videos, textos). Nos das
            permiso para almacenarlo y mostrarlo únicamente a las personas que vos elijas,
            con el único fin de operar el servicio. No vendemos tu contenido a terceros.
          </p>
          <p>
            No está permitido subir contenido que sea ilegal, que viole derechos de
            terceros, o que incluya pornografía infantil, violencia extrema, discurso de
            odio o cualquier forma de abuso. Las cuentas que violen esto van a ser
            suspendidas, y cuando la ley lo exija, reportadas a las autoridades
            correspondientes.
          </p>
        </section>

        <section className="lp-section">
          <h2>5. Conducta prohibida</h2>
          <p>
            No podés usar Life's para acosar a otras personas, suplantar identidades,
            intentar acceder a cuentas ajenas, ni usar el servicio con fines comerciales no
            autorizados.
          </p>
        </section>

        <section className="lp-section">
          <h2>6. Suspensión y cierre de cuenta</h2>
          <p>
            Podemos suspender o cerrar tu cuenta si violás estos términos. Vos también
            podés cerrar tu cuenta cuando quieras desde la configuración, y podés pedir la
            eliminación de tus datos.
          </p>
        </section>

        <section className="lp-section">
          <h2>7. Limitación de responsabilidad</h2>
          <p>
            Life's se ofrece "tal cual". Hacemos nuestro mejor esfuerzo para mantener tus
            recuerdos seguros y disponibles, pero no garantizamos que el servicio esté
            libre de errores o interrupciones.
          </p>
        </section>

        <section className="lp-section">
          <h2>8. Cambios a estos términos</h2>
          <p>
            Podemos actualizar estos términos con el tiempo. Si hacemos cambios
            importantes, te vamos a avisar antes de que entren en vigencia.
          </p>
        </section>

        <section className="lp-section">
          <h2>9. Contacto</h2>
          <p>Si tenés preguntas sobre estos términos, escribinos a soporte@lifes.com.</p>
        </section>
      </main>
    </div>
  );
}