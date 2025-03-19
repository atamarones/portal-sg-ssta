import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import { prisma } from '../../server.js';

/**
 * Configura la estrategia de autenticación de Google 
 * @param {Express.Application} app - La aplicación Express
 */
export const setupGoogleAuth = async (app) => {
  try {
    // Buscar la configuración del sistema
    const config = await prisma.systemConfig.findFirst();
    
    // Si la autenticación de Google no está habilitada o faltan configuraciones, salir
    if (!config || !config.googleAuthEnabled || 
        !config.googleClientId || !config.googleClientSecret) {
      console.log('Autenticación con Google deshabilitada o mal configurada');
      return;
    }
    
    // Configurar passport
    app.use(passport.initialize());
    
    // Configurar la estrategia de Google
    passport.use(new GoogleStrategy({
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: config.googleCallbackUrl || `${process.env.API_URL}/api/auth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Buscar si el usuario ya existe
        let user = await prisma.user.findUnique({
          where: { email: profile.emails[0].value }
        });
        
        // Si el usuario no existe, crearlo
        if (!user) {
          // Verificar si se permite el registro
          if (!config.allowRegistration) {
            return done(null, false, { message: 'El registro de nuevos usuarios está deshabilitado' });
          }
          
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              firstName: profile.name.givenName || '',
              lastName: profile.name.familyName || '',
              password: '', // No se utiliza contraseña para la autenticación con Google
              googleId: profile.id,
              isActive: true,
              profilePicture: profile.photos[0]?.value || '',
              role: 'USER', // Rol por defecto
            }
          });
        } 
        // Si el usuario existe pero no tiene googleId, actualizarlo
        else if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId: profile.id,
              profilePicture: user.profilePicture || profile.photos[0]?.value || '',
            }
          });
        }
        
        // Si el usuario está inactivo, rechazar la autenticación
        if (!user.isActive) {
          return done(null, false, { message: 'La cuenta está desactivada' });
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Error en autenticación con Google:', error);
        return done(error);
      }
    }));
    
    // Configurar las rutas de autenticación
    app.get('/api/auth/google',
      passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false
      })
    );
    
    app.get('/api/auth/google/callback',
      passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed`
      }),
      (req, res) => {
        try {
          // Generar token JWT
          const token = jwt.sign(
            { 
              userId: req.user.id,
              email: req.user.email,
              role: req.user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );
          
          // Determinar URL de redirección
          const redirectUrl = `${process.env.FRONTEND_URL}/login/callback?token=${token}`;
          res.redirect(redirectUrl);
        } catch (error) {
          console.error('Error al generar token JWT:', error);
          res.redirect(`${process.env.FRONTEND_URL}/login?error=token-generation-failed`);
        }
      }
    );
    
    console.log('✅ Autenticación con Google configurada correctamente');
  } catch (error) {
    console.error('Error al configurar autenticación con Google:', error);
  }
};

export default {
  setupGoogleAuth,
};
