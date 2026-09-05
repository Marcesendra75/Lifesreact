// ============================================
// LIFE'S — Backend Express principal
// ============================================
// IMPORTANTE: esto tiene que ser el primer import del archivo,
// así el .env queda cargado antes de que cualquier otro módulo
// (rutas, controllers, prisma) intente leer process.env
import 'dotenv/config';

import express from 'express';
import cors from 'cors';

// Rutas
import authRoutes from './routes/auth.routes';
// TODO: descomentar a medida que construyamos cada módulo
import userRoutes from './routes/user.routes';
import memoryRoutes from './routes/memory.routes';
import familyRoutes from './routes/family.routes';
import connectionRoutes from './routes/connection.routes';
// import capsuleRoutes from './routes/capsule.routes';
// import farewellRoutes from './routes/farewell.routes';
// import echoRoutes from './routes/echo.routes';
// import postalRoutes from './routes/postal.routes';
// import savingsRoutes from './routes/savings.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rutas ──
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/connections', connectionRoutes);
// app.use('/api/capsules', capsuleRoutes);
// app.use('/api/farewells',farewellRoutes);
// app.use('/api/echo',     echoRoutes);
// app.use('/api/postals',  postalRoutes);
// app.use('/api/savings',  savingsRoutes);

// ── Health check ──
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: "Life's API", version: '1.0.0' });
});

// ── 404 ──
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

// ── Error handler ──
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🌿 Life's API corriendo en http://localhost:${PORT}`);
});

export default app;