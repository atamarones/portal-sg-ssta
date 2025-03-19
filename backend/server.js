import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import configRoutes from './routes/configRoutes.js';
import { verifyConfiguration as verifyEmailConfig } from './src/services/emailService.js';
import { setupGoogleAuth } from './src/services/googleAuthService.js';
import { configureSecurityMiddleware } from './middleware/securityMiddleware.js';
import cookieParser from 'cookie-parser';

const app = express();
const prisma = new PrismaClient();

// Configuración básica
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Aplicar middlewares de seguridad
configureSecurityMiddleware(app);

// Conectar a PostgreSQL con Prisma
async function connectPostgres() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL con Prisma');
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    process.exit(1); // Detener el proceso si no se puede conectar
  }
}
connectPostgres();

// Verificar la configuración de correo
verifyEmailConfig();

// Configurar autenticación con Google
setupGoogleAuth(app);

// Conectar a MongoDB (para módulos específicos)
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('✅ Conectado a MongoDB'))
    .catch((err) => {
      console.error('❌ Error al conectar a MongoDB:', err.message);
      process.exit(1); // Detener el proceso si no se puede conectar
    });
} else {
  console.warn('⚠️ MONGO_URI no está definida en el entorno. MongoDB no está activo.');
}

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);

app.get('/', (req, res) => res.send('Backend funcionando 🚀'));

// Manejo de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('🔥 Error en el servidor:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));

// Capturar errores no manejados
process.on('uncaughtException', (err) => {
  console.error('🛑 Excepción no manejada:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Rechazo de promesa no manejado:', reason);
});

export { prisma };