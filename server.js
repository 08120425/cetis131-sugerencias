require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database'); // Ajusta la ruta si es necesario

const app = express();

// Conectar a MongoDB (para la caja de sugerencias)
connectDB();

// ========================
// SEGURIDAD Y MIDDLEWARES
// ========================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging sencillo
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rate limiting general
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Rate limiting específico para crear sugerencias
const suggestionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/suggestions', (req, res, next) => {
  if (req.method === 'POST') return suggestionLimiter(req, res, next);
  next();
});

// ========================
// SERVIR ARCHIVOS ESTÁTICOS
// ========================
// 1. Página principal del CETIS 131 (raíz del proyecto)
app.use(express.static(path.join(__dirname)));

// 2. Caja de sugerencias pública desde carpeta www
app.use('/caja-sugerencias', express.static(path.join(__dirname, 'www')));

// 3. Panel de administración
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// ========================
// RUTAS ESPECÍFICAS
// ========================
// Raíz → index.html del CETIS 131
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Caja de sugerencias - formulario público (carga cajasug.html)
app.get('/caja-sugerencias', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'cajasug.html'));
});

// Admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'online', timestamp: new Date().toISOString() });
});

// Rutas de la API de sugerencias
app.use('/api/suggestions', require('./routes/suggestions')); // Ajusta la ruta si tu archivo está en otro lado

// ========================
// SPA FALLBACK (importante para que funcione el menú del CETIS)
// ========================
app.get('*', (req, res) => {
  // Si la ruta empieza con /api, /admin o /caja-sugerencias, no hacemos fallback
  if (req.path.startsWith('/api') || req.path.startsWith('/admin') || req.path.startsWith('/caja-sugerencias')) {
    return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
  }
  // En cualquier otro caso, devolvemos el index.html principal
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ========================
// MANEJO DE ERRORES
// ========================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Página no encontrada' });
});

app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// ========================
// INICIAR SERVIDOR
// ========================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.clear();
  console.log('═══════════════════════════════════════════════════');
  console.log(' APP OFICIAL CETIS 131 + CAJA DE SUGERENCIAS');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Puerto: ${PORT}`);
  console.log(`Web principal: http://localhost:${PORT}`);
  console.log(`Caja sugerencias: http://localhost:${PORT}/caja-sugerencias`);
  console.log(`Panel admin: http://localhost:${PORT}/admin`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log('═══════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nDeteniendo servidor...');
  server.close(() => process.exit(0));
});

module.exports = app;
