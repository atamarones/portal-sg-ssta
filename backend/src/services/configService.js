import { prisma } from '../../server.js';

// Función para obtener todas las configuraciones del sistema
export const getSystemConfig = async () => {
  try {
    let config = await prisma.systemConfig.findUnique({
      where: { id: 'singleton' }
    });
    
    // Si no existe, crear configuración por defecto
    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          id: 'singleton',
          
          // Google Auth
          googleAuthEnabled: process.env.GOOGLE_AUTH_ENABLED === 'true',
          googleClientId: process.env.GOOGLE_CLIENT_ID || '',
          googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          
          // Email
          emailHost: process.env.EMAIL_HOST || '',
          emailPort: process.env.EMAIL_PORT || '',
          emailUser: process.env.EMAIL_USER || '',
          emailPass: process.env.EMAIL_PASS || '',
          emailFrom: process.env.EMAIL_FROM || '',
          emailEnabled: false,
          
          // App
          appName: 'Portal SG-SSTA',
          primaryColor: '#4a90e2',
          allowRegistration: true
        }
      });
    }
    
    return config;
  } catch (error) {
    console.error('Error al obtener configuración del sistema:', error);
    throw error;
  }
};

// Función para actualizar configuraciones del sistema
export const updateSystemConfig = async (updatedConfig) => {
  try {
    // Primero, obtener la configuración actual
    await getSystemConfig();
    
    // Actualizar la configuración
    const config = await prisma.systemConfig.update({
      where: { id: 'singleton' },
      data: updatedConfig
    });
    
    // Actualizar variables de entorno en memoria
    if (updatedConfig.emailHost) process.env.EMAIL_HOST = updatedConfig.emailHost;
    if (updatedConfig.emailPort) process.env.EMAIL_PORT = updatedConfig.emailPort;
    if (updatedConfig.emailUser) process.env.EMAIL_USER = updatedConfig.emailUser;
    if (updatedConfig.emailPass) process.env.EMAIL_PASS = updatedConfig.emailPass;
    if (updatedConfig.emailFrom) process.env.EMAIL_FROM = updatedConfig.emailFrom;
    
    if (updatedConfig.googleClientId) process.env.GOOGLE_CLIENT_ID = updatedConfig.googleClientId;
    if (updatedConfig.googleClientSecret) process.env.GOOGLE_CLIENT_SECRET = updatedConfig.googleClientSecret;
    if ('googleAuthEnabled' in updatedConfig) {
      process.env.GOOGLE_AUTH_ENABLED = updatedConfig.googleAuthEnabled.toString();
    }
    
    return config;
  } catch (error) {
    console.error('Error al actualizar configuración del sistema:', error);
    throw error;
  }
};

// Función para obtener la configuración de correo electrónico
export const getEmailConfig = async () => {
  try {
    const config = await getSystemConfig();
    
    return {
      host: config.emailHost,
      port: config.emailPort,
      user: config.emailUser,
      pass: config.emailPass,
      from: config.emailFrom,
      enabled: config.emailEnabled
    };
  } catch (error) {
    console.error('Error al obtener configuración de correo:', error);
    throw error;
  }
};

// Función para obtener la configuración de Google Auth
export const getGoogleAuthConfig = async () => {
  try {
    const config = await getSystemConfig();
    
    return {
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
      enabled: config.googleAuthEnabled
    };
  } catch (error) {
    console.error('Error al obtener configuración de Google Auth:', error);
    throw error;
  }
};

// Función para verificar si el usuario tiene permisos de administrador
export const isAdmin = (user) => {
  return user && user.role === 'ADMIN';
};
