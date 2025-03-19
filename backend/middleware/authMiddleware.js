import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  console.log('Verificando token de autenticación...');
  console.log('Headers recibidos:', req.headers);
  
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    console.log('No se encontró token en la solicitud');
    return res.status(401).json({ message: 'No autorizado, token no proporcionado' });
  }
  
  try {
    console.log('Decodificando token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);
    
    // Asignar la información decodificada al objeto de solicitud
    req.user = decoded;
    // Asegurar compatibilidad: si existe userId, usarlo; si no, intentar con id
    req.user.id = decoded.userId || decoded.id;
    
    console.log('Usuario autenticado:', req.user);
    next();
  } catch (error) {
    console.log('Error al verificar token:', error);
    return res.status(401).json({ message: 'No autorizado, token inválido' });
  }
};

const authorize = (roles) => (req, res, next) => {
  console.log('Middleware authorize: Verificando rol del usuario');
  console.log('Middleware authorize: Roles permitidos:', roles);
  console.log('Middleware authorize: Rol del usuario:', req.user?.role);
  
  if (!roles.includes(req.user?.role)) {
    console.log('Middleware authorize: Acceso denegado, rol no permitido');
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  
  console.log('Middleware authorize: Acceso permitido');
  next();
};

export { authenticate, authorize };
