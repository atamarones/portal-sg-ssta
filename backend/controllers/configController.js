import { getSystemConfig, updateSystemConfig, isAdmin } from '../src/services/configService.js';
import { verifyConfiguration as verifyEmailConfig } from '../src/services/emailService.js';
import { setupGoogleAuth } from '../src/services/googleAuthService.js';

// Obtener todas las configuraciones del sistema
export const getConfig = async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'No tienes permisos para acceder a esta información' });
    }
    
    const config = await getSystemConfig();
    
    // Ocultar datos sensibles
    const safeConfig = {
      ...config,
      emailPass: config.emailPass ? '********' : '',
      googleClientSecret: config.googleClientSecret ? '********' : ''
    };
    
    res.status(200).json(safeConfig);
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    res.status(500).json({ message: 'Error al obtener configuraciones del sistema', error: error.message });
  }
};

// Actualizar configuraciones de la aplicación
export const updateConfig = async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar configuraciones' });
    }
    
    const { 
      // Google Auth
      googleAuthEnabled, googleClientId, googleClientSecret,
      
      // Email
      emailHost, emailPort, emailUser, emailPass, emailFrom, emailEnabled,
      
      // App
      appName, logoUrl, primaryColor, allowRegistration
    } = req.body;
    
    // Actualizar configuraciones
    const updatedConfig = await updateSystemConfig({
      // Google Auth
      googleAuthEnabled,
      googleClientId,
      googleClientSecret,
      
      // Email
      emailHost,
      emailPort,
      emailUser,
      emailPass,
      emailFrom,
      emailEnabled,
      
      // App
      appName,
      logoUrl,
      primaryColor,
      allowRegistration
    });
    
    // Reinicializar servicios
    if (emailEnabled) {
      await verifyEmailConfig();
    }
    
    if (googleAuthEnabled) {
      // En un entorno real, aquí reiniciaríamos el servicio de autenticación de Google
      // Por simplicidad, indicamos que requiere reinicio del servidor
      res.status(200).json({ 
        message: 'Configuración actualizada correctamente',
        requiresRestart: true 
      });
    } else {
      res.status(200).json({ 
        message: 'Configuración actualizada correctamente'
      });
    }
  } catch (error) {
    console.error('Error al actualizar configuraciones:', error);
    res.status(500).json({ message: 'Error al actualizar configuraciones', error: error.message });
  }
};

// Verificar conexión de email
export const testEmailConnection = async (req, res) => {
  try {
    // Verificar si el usuario es administrador
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }
    
    const { host, port, user, pass } = req.body;
    
    // Actualizar temporalmente para probar
    process.env.EMAIL_HOST = host;
    process.env.EMAIL_PORT = port;
    process.env.EMAIL_USER = user;
    process.env.EMAIL_PASS = pass;
    
    const result = await verifyEmailConfig(true);
    
    res.status(200).json({ success: result.success, message: result.message });
  } catch (error) {
    console.error('Error al probar conexión de email:', error);
    res.status(500).json({ success: false, message: 'Error al probar la conexión de email', error: error.message });
  }
};
