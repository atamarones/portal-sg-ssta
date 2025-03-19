/**
 * Script para probar las medidas de seguridad implementadas en la aplicación
 */

import api from '../api/api';

/**
 * Realiza pruebas de límite de tasa (rate limiting) intentando múltiples 
 * solicitudes en sucesión rápida
 * @returns {Promise<Object>} Resultados de la prueba
 */
export const testRateLimiting = async () => {
  const results = {
    name: 'Prueba de Límite de Tasa (Rate Limiting)',
    passed: false,
    attempts: [],
    error: null
  };

  try {
    // Intenta hacer 15 solicitudes de login con credenciales incorrectas
    for (let i = 0; i < 15; i++) {
      try {
        const startTime = Date.now();
        const response = await api.post('/api/auth/login', {
          email: `test${i}@example.com`,
          password: 'wrongpassword123'
        });
        
        results.attempts.push({
          attempt: i + 1,
          status: response.status,
          time: Date.now() - startTime,
          message: 'Solicitud completada'
        });
      } catch (error) {
        const status = error.response?.status || 0;
        const message = error.response?.data?.message || error.message;
        
        results.attempts.push({
          attempt: i + 1,
          status: status,
          message: message
        });
        
        // Si recibimos un 429, la prueba ha pasado
        if (status === 429) {
          results.passed = true;
          break;
        }
      }
      
      // Espera 100ms entre solicitudes para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Si no recibimos un 429 después de todos los intentos, la prueba falló
    if (!results.passed) {
      results.message = 'No se detectó limit rate después de múltiples intentos';
    } else {
      results.message = `Limit rate activado después de ${results.attempts.length} intentos`;
    }
  } catch (error) {
    results.error = error.message;
  }
  
  return results;
};

/**
 * Prueba la protección XSS intentando enviar una carga útil maliciosa
 * @returns {Promise<Object>} Resultados de la prueba
 */
export const testXssProtection = async () => {
  const results = {
    name: 'Prueba de Protección XSS',
    passed: false,
    originalPayload: '<script>alert("XSS")</script>',
    sanitizedPayload: null,
    error: null
  };

  try {
    // Intenta enviar una carga útil XSS a un endpoint de prueba
    const response = await api.post('/api/auth/register', {
      name: results.originalPayload,
      email: 'test@example.com',
      password: 'Password123!'
    });
    
    // Verifica si la carga útil fue sanitizada
    if (response.data) {
      results.sanitizedPayload = response.data.name || 'No disponible';
      results.passed = results.sanitizedPayload !== results.originalPayload;
      results.message = results.passed 
        ? 'La carga útil XSS fue sanitizada correctamente' 
        : 'La carga útil XSS no fue sanitizada';
    }
  } catch (error) {
    // Si obtenemos un error 400, puede significar que la validación atrapó el intento XSS
    if (error.response?.status === 400) {
      results.passed = true;
      results.message = 'La validación del servidor bloqueó el intento XSS';
    } else {
      results.error = error.message;
      results.message = 'Error al probar la protección XSS';
    }
  }
  
  return results;
};

/**
 * Ejecuta todas las pruebas de seguridad disponibles
 * @returns {Promise<Object>} Resultados de todas las pruebas
 */
export const runAllSecurityTests = async () => {
  const results = {
    rateLimiting: null,
    xssProtection: null
  };
  
  try {
    // Ejecutar las pruebas en paralelo
    [results.rateLimiting, results.xssProtection] = await Promise.all([
      testRateLimiting(),
      testXssProtection()
    ]);
  } catch (error) {
    console.error('Error al ejecutar pruebas de seguridad:', error);
  }
  
  return results;
};

export default {
  testRateLimiting,
  testXssProtection,
  runAllSecurityTests
}; 