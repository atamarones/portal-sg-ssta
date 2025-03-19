import jwt from 'jsonwebtoken';
import { prisma } from '../../server.js';

/**
 * Middleware para verificar si el usuario está autenticado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función para continuar al siguiente middleware
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    // Obtener el token del encabezado
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No autorizado', 
        message: 'Se requiere autenticación' 
      });
    }
    
    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No autorizado', 
        message: 'Token no proporcionado' 
      });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario correspondiente
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'No autorizado', 
        message: 'Usuario no encontrado' 
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Prohibido', 
        message: 'La cuenta está desactivada' 
      });
    }
    
    // Añadir el usuario al objeto de solicitud
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'No autorizado', 
        message: 'Token expirado' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'No autorizado', 
        message: 'Token inválido' 
      });
    }
    
    console.error('Error en verificación de autenticación:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

/**
 * Middleware para verificar si el usuario tiene el rol requerido
 * @param {string|string[]} roles - Rol o roles permitidos
 * @returns {Function} Middleware de Express
 */
export const hasRole = (roles) => {
  return (req, res, next) => {
    try {
      // Verificar primero que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({ 
          error: 'No autorizado', 
          message: 'Se requiere autenticación' 
        });
      }
      
      // Convertir a array si es un solo rol
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Verificar si el usuario tiene alguno de los roles permitidos
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Prohibido', 
          message: 'No tienes permiso para acceder a este recurso' 
        });
      }
      
      // Si tiene el rol adecuado, continuar
      return next();
    } catch (error) {
      console.error('Error en verificación de roles:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  };
};

export default {
  isAuthenticated,
  hasRole,
};
