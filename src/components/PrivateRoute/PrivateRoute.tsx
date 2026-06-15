// ============================================
// LIFE'S — PrivateRoute
// ============================================
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#03192e',
        color: '#C9A84C',
        fontFamily: 'Manrope, sans-serif',
        fontSize: '1rem',
        letterSpacing: '0.1em',
      }}>
        Cargando Life's...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
