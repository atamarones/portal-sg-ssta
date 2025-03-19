import React, { useState } from 'react';
import { runSecurityTests, testRateLimiting, testXSSProtection } from '../../utils/securityTest';
import { toast } from 'react-hot-toast';
import '../../styles/admin.css';

const SecurityTestPanel = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [testType, setTestType] = useState('all');

  const handleRunTests = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      let testResults;
      
      switch(testType) {
        case 'rateLimiting':
          testResults = { rateLimiting: await testRateLimiting() };
          break;
        case 'xss':
          testResults = { xssProtection: await testXSSProtection() };
          break;
        case 'all':
        default:
          testResults = await runSecurityTests();
          break;
      }
      
      setResults(testResults);
      toast.success('Pruebas de seguridad completadas');
    } catch (error) {
      console.error('Error al ejecutar pruebas de seguridad:', error);
      toast.error('Error al ejecutar pruebas de seguridad');
    } finally {
      setLoading(false);
    }
  };

  const renderResultTable = (test, data) => {
    if (!data || !data.results) return null;
    
    return (
      <div className="test-results">
        <h3>{test} - Resultado: {data.success ? '✅ PASADO' : '❌ FALLIDO'}</h3>
        
        {Array.isArray(data.results) && (
          <table className="results-table">
            <thead>
              <tr>
                {Object.keys(data.results[0] || {}).map(key => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.results.map((result, index) => (
                <tr key={index}>
                  {Object.values(result).map((value, idx) => (
                    <td key={idx}>{value.toString()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {data.message && (
          <div className="test-message">
            <p><strong>Mensaje:</strong> {data.message}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Panel de Pruebas de Seguridad</h1>
        <p>Este panel permite probar las diferentes medidas de seguridad implementadas en la aplicación.</p>
      </div>

      <div className="admin-content">
        <div className="card">
          <div className="card-header">
            <h2>Ejecutar Pruebas</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="testType">Tipo de Prueba:</label>
              <select 
                id="testType" 
                value={testType} 
                onChange={(e) => setTestType(e.target.value)}
                className="form-control"
              >
                <option value="all">Todas las pruebas</option>
                <option value="rateLimiting">Límite de intentos (Rate Limiting)</option>
                <option value="xss">Protección contra XSS</option>
              </select>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleRunTests}
              disabled={loading}
            >
              {loading ? 'Ejecutando...' : 'Ejecutar Pruebas de Seguridad'}
            </button>

            {loading && (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Ejecutando pruebas de seguridad...</p>
              </div>
            )}
          </div>
        </div>

        {results && (
          <div className="card mt-4">
            <div className="card-header">
              <h2>Resultados de las Pruebas</h2>
            </div>
            <div className="card-body">
              {results.rateLimiting && renderResultTable('Límite de Intentos', results.rateLimiting)}
              {results.xssProtection && renderResultTable('Protección XSS', results.xssProtection)}
            </div>
          </div>
        )}

        <div className="card mt-4">
          <div className="card-header">
            <h2>Información de Seguridad Implementada</h2>
          </div>
          <div className="card-body">
            <h3>1. Google reCAPTCHA</h3>
            <p>Implementado en los formularios de login y registro para verificar que los usuarios son humanos.</p>
            
            <h3>2. Límite de intentos de inicio de sesión</h3>
            <p>Se limitan los intentos fallidos de inicio de sesión por dirección IP, bloqueando temporalmente el acceso después de 5 intentos fallidos.</p>
            
            <h3>3. Validación de contraseñas seguras</h3>
            <p>Las contraseñas deben cumplir requisitos de seguridad como longitud mínima, mayúsculas, minúsculas, números y caracteres especiales.</p>
            
            <h3>4. Protección contra XSS</h3>
            <p>Saneamiento de entrada de datos para prevenir ataques de Cross-Site Scripting.</p>
            
            <h3>5. Protección contra CSRF</h3>
            <p>Uso de tokens para validar que las solicitudes provienen de tu sitio.</p>
            
            <h3>6. Rate Limiting</h3>
            <p>Restricciones en el número de solicitudes a la API para evitar ataques de fuerza bruta.</p>
            
            <h3>7. Encabezados de seguridad</h3>
            <p>Implementación de Helmet para establecer varios encabezados HTTP de seguridad.</p>
            
            <h3>8. Manejo seguro de cookies</h3>
            <p>Configuración de cookies seguras con las opciones HttpOnly, Secure y SameSite.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTestPanel; 