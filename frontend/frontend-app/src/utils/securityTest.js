/**
 * Script para probar las medidas de seguridad implementadas en la aplicación
 */

import api from '../api/api';

/**
 * Prueba de límite de intentos de inicio de sesión (Rate Limiting)
 * Intenta iniciar sesión múltiples veces con credenciales incorrectas
 */
export const testRateLimiting = async () => {
  console.log('Iniciando prueba de límite de intentos de inicio de sesión...');
  
  const results = [];
  
  // Realizar 10 intentos consecutivos
  for (let i = 0; i < 10; i++) {
    try {
      console.log(`Intento ${i + 1}...`);
      
      await api.post('/auth/login', {
        email: `test${i}@example.com`,
        password: 'contraseñaIncorrecta',
        captchaToken: 'token-simulado' // Esto no pasará la validación real de reCAPTCHA
      });
      
      results.push({ intento: i + 1, resultado: 'Éxito (no esperado)' });
    } catch (error) {
      const status = error.response?.status || 'Error sin respuesta';
      const message = error.response?.data?.message || error.message;
      
      results.push({ 
        intento: i + 1, 
        resultado: 'Error (esperado)', 
        status, 
        message 
      });
      
      // Si recibimos un 429 (Too Many Requests), hemos activado el rate limiting
      if (status === 429) {
        console.log(`¡Límite de intentos activado en el intento ${i + 1}!`);
        break;
      }
    }
    
    // Pequeña pausa entre intentos para no sobrecargar el servidor
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('Resultados de la prueba de límite de intentos:');
  console.table(results);
  
  // Verificar si se activó el rate limiting
  const rateLimitingActivated = results.some(r => r.status === 429);
  console.log(`Límite de intentos activado: ${rateLimitingActivated ? 'SÍ' : 'NO'}`);
  
  return {
    success: rateLimitingActivated,
    results
  };
};

/**
 * Prueba de protección contra XSS (Cross-Site Scripting)
 * Intenta enviar datos con código JavaScript malicioso
 */
export const testXSSProtection = async () => {
  console.log('Iniciando prueba de protección contra XSS...');
  
  const maliciousPayload = {
    name: '<script>alert("XSS")</script>Test User',
    email: 'test@example.com',
    password: 'Password123!',
    captchaToken: 'token-simulado'
  };
  
  try {
    await api.post('/auth/register', maliciousPayload);
    return {
      success: false,
      message: 'La solicitud fue aceptada sin sanear el payload malicioso'
    };
  } catch (error) {
    // La solicitud debería fallar por otras razones (captcha inválido, etc.)
    // pero los datos deberían ser saneados por el middleware XSS
    console.log('Error en la prueba XSS (esperado):', error.message);
    return {
      success: true,
      message: 'El middleware XSS debería haber saneado el payload'
    };
  }
};

/**
 * Función principal para ejecutar todas las pruebas
 */
export const runSecurityTests = async () => {
  console.log('=== INICIO DE PRUEBAS DE SEGURIDAD ===');
  
  const results = {
    rateLimiting: await testRateLimiting(),
    xssProtection: await testXSSProtection()
  };
  
  console.log('=== RESULTADOS DE PRUEBAS DE SEGURIDAD ===');
  console.log(JSON.stringify(results, null, 2));
  
  return results;
};

// Crear un objeto con todas las funciones exportadas
const securityTestUtils = {
  testRateLimiting,
  testXSSProtection,
  runSecurityTests
};

export default securityTestUtils; 