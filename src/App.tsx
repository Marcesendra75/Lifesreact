// ============================================
// LIFE'S — App.tsx con rutas completas + bóveda
// ============================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/main.scss';

// ── Contexto ──
import { AuthProvider }  from './context/AuthContext';
import PrivateRoute      from './components/PrivateRoute/PrivateRoute';
import VaultRoute        from './components/VaultRoute/VaultRoute';

// ── Páginas públicas ──
import Landing           from './pages/Landing/Landing';
import CrearCuenta       from './pages/Auth/CrearCuenta';
import Login             from './pages/Auth/Login';
import TripleSeguridad   from './pages/Auth/TripleSeguridad';
import ForgotPassword    from './pages/Auth/ForgotPassword';
import SolicitarTarjeta  from './pages/Auth/SolicitarTarjeta';
import TarjetaPendiente  from './pages/Auth/TarjetaPendiente';

// ── Empresas (públicas) ──
import EmpresasLanding   from './pages/Empresas/EmpresasLanding';
import PlanesEmpresa     from './pages/Empresas/PlanesEmpresa';

// ── Páginas privadas — Nivel Estándar ──
import Feed              from './pages/Feed/Feed';
import MuroBiografico    from './pages/MuroBiografico/MuroBiografico';
import Profile           from './pages/Profile/Profile';
import Timeline          from './pages/Timeline/Timeline';
import FamilyTree        from './pages/FamilyTree/FamilyTree';
import DigitalEcho       from './pages/DigitalEcho/DigitalEcho';
import Settings          from './pages/Settings/Settings';

// ── Páginas privadas — Nivel Bóveda (Triple Seguridad OBLIGATORIA) ──
import SafeBox           from './pages/SafeBox/SafeBox';
import Herederos         from './pages/Herederos/Herederos';
import Testamento        from './pages/Testamento/Testamento';
import Savings           from './pages/Savings/Savings';
import FarewellVideo     from './pages/FarewellVideo/FarewellVideo';
import CajaDeValores     from './pages/CajaDeValores/CajaDeValores';

// ── Páginas privadas — Triple Seguridad OPCIONAL ──
import TimeCapsule       from './pages/TimeCapsule/TimeCapsule';
import Postal            from './pages/Postal/Postal';

// ── Empresas privadas ──
import PerfilEmpresa     from './pages/Empresas/PerfilEmpresa';
import LineaVidaEmpresa  from './pages/Empresas/LineaVidaEmpresa';

// ── Shared ──
import NotFound          from './pages/NotFound/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ══ RUTAS PÚBLICAS ══ */}
          <Route path="/"                  element={<Landing />} />
          <Route path="/crear-cuenta"      element={<CrearCuenta />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/acceso-seguro"     element={<TripleSeguridad />} />
          <Route path="/recuperar"         element={<ForgotPassword />} />
          <Route path="/empresas"          element={<EmpresasLanding />} />
          <Route path="/empresas/planes"   element={<PlanesEmpresa />} />

          {/* ══ RUTAS PRIVADAS — NIVEL ESTÁNDAR ══ */}
          <Route element={<PrivateRoute />}>
            <Route path="/feed"                        element={<Feed />} />
            <Route path="/muro-biografico"             element={<MuroBiografico />} />
            <Route path="/muro-biografico/:userId"     element={<MuroBiografico />} />
            <Route path="/perfil"                      element={<Profile />} />
            <Route path="/perfil/:userId"              element={<Profile />} />
            <Route path="/linea-de-vida"               element={<Timeline />} />
            <Route path="/linea-de-vida/:userId"       element={<Timeline />} />
            <Route path="/arbol-genealogico"           element={<FamilyTree />} />
            <Route path="/arbol-genealogico/:userId"   element={<FamilyTree />} />
            <Route path="/ecos/:userId"                element={<DigitalEcho />} />
            <Route path="/configuracion"               element={<Settings />} />

            {/* Solicitar tarjeta y estado pendiente */}
            <Route path="/solicitar-tarjeta"           element={<SolicitarTarjeta />} />
            <Route path="/tarjeta-pendiente"           element={<TarjetaPendiente />} />

            {/* Opcional: el usuario elige si activa triple seguridad */}
            <Route path="/capsula-del-tiempo"          element={<TimeCapsule />} />
            <Route path="/postal"                      element={<Postal />} />

            {/* Empresas privadas */}
            <Route path="/empresas/perfil"                   element={<PerfilEmpresa />} />
            <Route path="/empresas/perfil/:empresaId"        element={<PerfilEmpresa />} />
            <Route path="/empresas/linea-de-vida"            element={<LineaVidaEmpresa />} />
            <Route path="/empresas/linea-de-vida/:empresaId" element={<LineaVidaEmpresa />} />
          </Route>

          {/* ══ RUTAS BÓVEDA — TRIPLE SEGURIDAD OBLIGATORIA ══ */}
          <Route element={<PrivateRoute />}>
            <Route element={<VaultRoute />}>
              <Route path="/caja-fuerte"      element={<SafeBox />} />
              <Route path="/caja-de-valores"  element={<CajaDeValores />} />
              <Route path="/testamento"       element={<Testamento />} />
              <Route path="/herederos"        element={<Herederos />} />
              <Route path="/ahorro"           element={<Savings />} />
              <Route path="/ultimo-tributo"   element={<FarewellVideo />} />
            </Route>
          </Route>

          {/* ══ 404 ══ */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*"    element={<Navigate to="/404" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
