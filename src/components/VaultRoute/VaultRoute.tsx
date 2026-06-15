// ============================================
// LIFE'S — VaultRoute
// Guard para páginas que requieren Triple Seguridad
// ============================================
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function VaultRoute() {
  const { isAuthenticated, isLoading, user, isVaultSessionActive } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#03192e',
        color: '#ffe088', fontFamily: 'Manrope, sans-serif',
        fontSize: '1rem', letterSpacing: '0.1em',
      }}>
        Verificando acceso...
      </div>
    );
  }

  // 1. No autenticado → login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 2. No tiene tarjeta activada → solicitar tarjeta
  if (user?.vaultStatus === 'no_card' || !user?.vaultStatus) {
    return <Navigate to="/solicitar-tarjeta" state={{ from: location.pathname }} replace />;
  }

  // 3. Tarjeta solicitada pero no activada → pantalla de espera
  if (user?.vaultStatus === 'requested' || user?.vaultStatus === 'shipped') {
    return <Navigate to="/tarjeta-pendiente" state={{ from: location.pathname }} replace />;
  }

  // 4. Tiene tarjeta pero no completó triple verificación en esta sesión
  if (!isVaultSessionActive()) {
    return (
      <Navigate
        to={`/acceso-seguro?acceso=${encodeURIComponent(location.pathname)}&redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // 5. Todo OK → acceso concedido
  return <Outlet />;
}
