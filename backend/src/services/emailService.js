import nodemailer from 'nodemailer';
import { prisma } from '../../server.js';

let transporter = null;

/**
 * Verifica la configuración de correo electrónico y configura el transportador si está habilitado
 * @returns {Object|null} El transportador de correo o null si no está configurado
 */
export const verifyConfiguration = async () => {
  try {
    const config = await prisma.systemConfig.findFirst();
    
    if (!config || !config.emailEnabled) {
      console.log('Servicio de correo electrónico está deshabilitado');
      return null;
    }
    
    if (!config.emailHost || !config.emailPort || !config.emailUser || !config.emailPassword) {
      console.warn('Configuración de correo incompleta');
      return null;
    }
    
    // Configurar el transportador de nodemailer
    transporter = nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      secure: config.emailSecure,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
      // Opciones adicionales para desarrollo
      ...(process.env.NODE_ENV === 'development' && {
        tls: {
          rejectUnauthorized: false, // Útil para desarrollo con certificados autofirmados
        },
      }),
    });
    
    // Verificar la conexión
    await transporter.verify();
    console.log('✅ Servicio de correo electrónico configurado correctamente');
    return transporter;
  } catch (error) {
    console.error('Error al configurar el servicio de correo:', error);
    transporter = null;
    return null;
  }
};

/**
 * Función para probar la conexión de correo electrónico con una configuración específica
 * @param {Object} config - Configuración a probar
 * @returns {Promise<Object>} Resultado de la prueba
 */
export const testEmailConnection = async (config) => {
  try {
    // Crear un transportador temporal para la prueba
    const testTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      // Opciones adicionales para desarrollo
      ...(process.env.NODE_ENV === 'development' && {
        tls: {
          rejectUnauthorized: false, // Útil para desarrollo con certificados autofirmados
        },
      }),
    });
    
    // Verificar la conexión
    await testTransporter.verify();
    
    // Enviar un correo de prueba
    const info = await testTransporter.sendMail({
      from: config.from,
      to: config.to,
      subject: 'Prueba de configuración de correo electrónico',
      text: 'Esta es una prueba para verificar la configuración de correo electrónico.',
      html: '<p>Esta es una prueba para verificar la configuración de correo electrónico.</p>',
    });
    
    return {
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    // Relanzar el error para que el controlador lo maneje
    throw new Error(`Error al probar la conexión de correo: ${error.message}`);
  }
};

/**
 * Envía un correo electrónico utilizando la configuración del sistema
 * @param {Object} options - Opciones del correo electrónico
 * @returns {Promise<Object>} Información del correo enviado
 */
export const sendEmail = async (options) => {
  try {
    // Si el transportador no está inicializado, intentar inicializarlo
    if (!transporter) {
      transporter = await verifyConfiguration();
    }
    
    if (!transporter) {
      throw new Error('El servicio de correo electrónico no está configurado');
    }
    
    const config = await prisma.systemConfig.findFirst();
    
    // Enviar el correo
    const info = await transporter.sendMail({
      from: options.from || config.emailFromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Error al enviar correo electrónico:', error);
    throw new Error(`Error al enviar correo: ${error.message}`);
  }
};

export default {
  verifyConfiguration,
  testEmailConnection,
  sendEmail,
};
