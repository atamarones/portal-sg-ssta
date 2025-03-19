import express from 'express';
import { getConfig, updateConfig, testEmailConnection } from '../controllers/configController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Todas las rutas requieren rol de ADMIN
router.use(authorize(['ADMIN']));

// Rutas de configuración
router.get('/', getConfig);
router.put('/', updateConfig);
router.post('/test-email', testEmailConnection);

export default router;
