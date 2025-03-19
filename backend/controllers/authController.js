import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';
import crypto from 'crypto';
import { sendEmail } from '../src/services/emailService.js';
import axios from 'axios';

// Función para crear la plantilla de restablecimiento de contraseña
const passwordResetTemplate = (name, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #333;">Recuperación de contraseña</h2>
      <p>Hola ${name},</p>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Restablecer contraseña
        </a>
      </p>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no has solicitado cambiar tu contraseña, puedes ignorar este correo.</p>
      <p>Saludos,<br>El equipo de Portal SG-SSTA</p>
    </div>
  `;
};

// Mapa para rastrear intentos fallidos de inicio de sesión
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos en milisegundos

// Función para limpiar intentos antiguos
const cleanupLoginAttempts = () => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > LOCKOUT_TIME) {
      loginAttempts.delete(ip);
    }
  }
};

// Programar limpieza cada hora
setInterval(cleanupLoginAttempts, 60 * 60 * 1000);

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'El usuario ya existe' });

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = await prisma.user.create({
      data: { firstName, lastName, email, password: hashedPassword, role },
    });

    res.status(201).json({ message: 'Usuario registrado correctamente', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, captchaToken } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;
    
    // Verificar si la IP está bloqueada por demasiados intentos fallidos
    if (loginAttempts.has(clientIp)) {
      const attempts = loginAttempts.get(clientIp);
      const now = Date.now();
      
      if (attempts.count >= MAX_LOGIN_ATTEMPTS && now - attempts.lastAttempt < LOCKOUT_TIME) {
        const remainingTime = Math.ceil((attempts.lastAttempt + LOCKOUT_TIME - now) / 60000);
        return res.status(429).json({
          message: `Demasiados intentos fallidos. Por favor, inténtelo de nuevo en ${remainingTime} minutos.`
        });
      }
      
      // Si ha pasado el tiempo de bloqueo, reiniciar contador
      if (now - attempts.lastAttempt >= LOCKOUT_TIME) {
        loginAttempts.delete(clientIp);
      }
    }
    
    // Verificar el token del captcha (si está habilitado)
    if (process.env.RECAPTCHA_ENABLED === 'true' && !captchaToken) {
      return res.status(400).json({ message: 'Se requiere completar el captcha' });
    }
    
    if (process.env.RECAPTCHA_ENABLED === 'true') {
      try {
        const recaptchaResponse = await axios.post(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
        );
        
        if (!recaptchaResponse.data.success) {
          // Registrar intento fallido por captcha incorrecto
          recordFailedAttempt(clientIp);
          return res.status(400).json({ message: 'Verificación de captcha fallida' });
        }
      } catch (error) {
        console.error('Error verificando captcha:', error);
        return res.status(500).json({ message: 'Error verificando captcha' });
      }
    }
    
    // Buscar el usuario
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Registrar intento fallido
      recordFailedAttempt(clientIp);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Registrar intento fallido
      recordFailedAttempt(clientIp);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Éxito - generar token y responder
    // Resetear intentos fallidos
    if (loginAttempts.has(clientIp)) {
      loginAttempts.delete(clientIp);
    }
    
    // Generar token JWT
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Inicio de sesión exitoso', token, user });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor', details: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Verificar que exista el usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'Si el correo existe, se enviará un enlace de recuperación' });
    }
    
    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry
      }
    });
    
    // Construir URL de restablecimiento
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password/${resetToken}`;
    
    // Enviar correo con enlace de restablecimiento
    const emailSubject = 'Recuperación de contraseña - Portal SG-SSTA';
    const emailHtml = passwordResetTemplate(`${user.firstName} ${user.lastName}`, resetUrl);
    
    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: `Hola ${user.firstName} ${user.lastName}, usa este enlace para restablecer tu contraseña: ${resetUrl}`
    });
    
    res.status(200).json({ 
      message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico'
    });
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// Restablecer contraseña con token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Convertir el token a hash para comparar con el almacenado
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Buscar usuario con token válido y no expirado
    const user = await prisma.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }
    
    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña y limpiar campos de reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    
    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// Actualizar perfil de usuario
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, email },
      select: { id: true, firstName: true, lastName: true, email: true, role: true }
    });
    
    res.status(200).json({ 
      message: 'Perfil actualizado correctamente',
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// Cambiar contraseña (usuario autenticado)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Obtener usuario con contraseña
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id }
    });
    
    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }
    
    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });
    
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

// Callback después de la autenticación con Google
const googleAuthCallback = async (req, res) => {
  try {
    // Verificar si el usuario existe
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?error=failed`);
    }
    
    // Generar token
    const token = jwt.sign(
      { 
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Guardar datos del usuario
    const userData = {
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.profilePicture
    };
    
    // Redirigir al frontend con el token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`);
  } catch (error) {
    console.error('Error en el callback de Google Auth:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?error=failed`);
  }
};

// Verificar si Google Auth está habilitado
const checkGoogleAuthStatus = async (req, res) => {
  try {
    // Obtener la configuración del sistema directamente desde Prisma
    const config = await prisma.systemConfig.findUnique({
      where: { id: 'singleton' },
      select: { googleAuthEnabled: true }
    });
    
    res.status(200).json({ enabled: config?.googleAuthEnabled || false });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar el estado de Google Auth', error });
  }
};

// Toggle Google Auth (solo para administradores)
const toggleGoogleAuth = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    // Verificar si el usuario es administrador
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }
    
    // Actualizar configuración directamente
    const config = await prisma.systemConfig.update({
      where: { id: 'singleton' },
      data: { googleAuthEnabled: enabled }
    });
    
    res.status(200).json({ 
      message: `Google Auth ${enabled ? 'habilitado' : 'deshabilitado'} correctamente`,
      config
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado de Google Auth', error });
  }
};

// Función para registrar intentos fallidos
function recordFailedAttempt(ip) {
  if (loginAttempts.has(ip)) {
    const attempts = loginAttempts.get(ip);
    attempts.count += 1;
    attempts.lastAttempt = Date.now();
  } else {
    loginAttempts.set(ip, {
      count: 1,
      lastAttempt: Date.now()
    });
  }
}

export { 
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
};
