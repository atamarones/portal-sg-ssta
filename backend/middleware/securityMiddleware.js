import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import { randomBytes } from 'crypto';

// Variable para controlar si CSRF está activo
const CSRF_ENABLED = false; // Desactivamos temporalmente CSRF

// Middleware para establecer encabezados de seguridad
export const configureHelmet = (app) => {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https://www.google.com"],
          connectSrc: ["'self'", "https://www.google.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'", "https://www.google.com"]
        }
      },
      xssFilter: true,
      noSniff: true,
      referrerPolicy: { policy: 'same-origin' }
    })
  );
  console.log('✅ Helmet configurado correctamente');
};

// Middleware para prevenir ataques de inyección de scripts (XSS)
export const configureXss = (app) => {
  app.use(xss());
  console.log('✅ Protección XSS configurada correctamente');
};

// Middleware para proteger contra CSRF
export const configureCsrf = (app) => {
  if (!CSRF_ENABLED) {
    console.warn('⚠️ Protección CSRF desactivada');
    return;
  }
  
  console.warn('⚠️ No se pudo activar la protección CSRF');
};

// Middleware para limitar solicitudes (rate limiting)
export const configureRateLimit = (app) => {
  // Limitador global para todas las rutas
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 500, // límite de solicitudes por IP
    message: 'Demasiadas solicitudes desde esta IP, inténtelo de nuevo más tarde'
  });
  
  // Limitador específico para rutas de autenticación
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // límite de solicitudes de auth por IP
    message: 'Demasiados intentos de acceso, inténtelo de nuevo más tarde'
  });
  
  app.use('/api/', globalLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  
  console.log('✅ Rate limiting configurado correctamente');
};

// Función para configurar todas las medidas de seguridad
export const configureSecurityMiddleware = (app) => {
  configureHelmet(app);
  configureXss(app);
  configureCsrf(app);
  configureRateLimit(app);
  
  console.log('✅ Medidas de seguridad configuradas correctamente');
};

export default {
  configureHelmet,
  configureXss,
  configureCsrf,
  configureRateLimit,
  configureSecurityMiddleware
}; 