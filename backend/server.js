require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Verificar que la URI de Mongo está configurada
if (!process.env.MONGO_URI) {
  console.error('❌ Error: MONGO_URI no está definida en .env');
  process.exit(1);
}

// Conectar a MongoDB con manejo de errores
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1); // Detener la app si la conexión falla
  });

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
