import express from 'express';
import passport from 'passport';
import { 
  register, 
  login, 
  getProfile, 
  requestPasswordReset, 
  resetPassword, 
  updateProfile, 
  changePassword,
  googleAuthCallback,
  checkGoogleAuthStatus,
  toggleGoogleAuth
} from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/password-reset-request', requestPasswordReset);
router.post('/password-reset', resetPassword);

// Rutas para Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleAuthCallback
);
router.get('/google/status', checkGoogleAuthStatus);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/google/toggle', authenticate, authorize(['ADMIN']), toggleGoogleAuth);

export default router;
