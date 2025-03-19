import csrf from 'csurf';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import { randomBytes } from 'crypto';

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
};

// Middleware para prevenir ataques de inyección de scripts (XSS)
export const configureXss = (app) => {
  app.use(xss());
};

// Middleware para proteger contra CSRF
export const configureCsrf = (app) => {
  app.use(
    csrf({
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        httpOnly: true
      }
    })
  );
  
  // Middleware para enviar token CSRF al cliente
  app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    next();
  });
  
  // Manejador de errores CSRF
  app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({
        message: 'Sesión inválida o caducada, por favor recargue la página'
      });
    }
    next(err);
  });
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
};

// Función para configurar todas las medidas de seguridad
export const configureSecurityMiddleware = (app) => {
  configureHelmet(app);
  configureXss(app);
  configureCsrf(app);
  configureRateLimit(app);
};

export default {
  configureHelmet,
  configureXss,
  configureCsrf,
  configureRateLimit,
  configureSecurityMiddleware
}; 