// ============================================
// LIFE'S — Backend Express principal
// ============================================
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import memoryRoutes from './routes/memory.routes';
import familyRoutes from './routes/family.routes';
import capsuleRoutes from './routes/capsule.routes';
import farewellRoutes from './routes/farewell.routes';
import echoRoutes from './routes/echo.routes';
import postalRoutes from './routes/postal.routes';
import savingsRoutes from './routes/savings.routes';

dotenv.config();

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
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/family',   familyRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/farewells',farewellRoutes);
app.use('/api/echo',     echoRoutes);
app.use('/api/postals',  postalRoutes);
app.use('/api/savings',  savingsRoutes);

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
