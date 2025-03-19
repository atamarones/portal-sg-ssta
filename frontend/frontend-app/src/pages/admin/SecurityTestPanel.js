import React, { useState } from 'react';
import { Container, Card, Button, Form, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import securityTestUtils from '../../utils/securityTest';

/**
 * Panel de administración para probar las medidas de seguridad implementadas
 */
const SecurityTestPanel = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [testType, setTestType] = useState('all');

  const handleRunTests = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      let testResults;
      
      // Ejecutar las pruebas según la selección
      switch (testType) {
        case 'rateLimit':
          testResults = { rateLimiting: await securityTestUtils.testRateLimiting() };
          break;
        case 'xss':
          testResults = { xssProtection: await securityTestUtils.testXssProtection() };
          break;
        case 'all':
        default:
          testResults = await securityTestUtils.runAllSecurityTests();
          break;
      }
      
      setResults(testResults);
      toast.success('Pruebas completadas');
    } catch (error) {
      console.error('Error al ejecutar las pruebas:', error);
      toast.error('Error al ejecutar las pruebas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Renderiza una tabla con los resultados de las pruebas
  const renderResultTable = (testResult) => {
    if (!testResult) return null;

    // Para resultados de Rate Limiting
    if (testResult.name === 'Prueba de Límite de Tasa (Rate Limiting)' && testResult.attempts) {
      return (
        <div className="mb-4">
          <h5>
            {testResult.name} 
            <Badge 
              className="ms-2" 
              bg={testResult.passed ? 'success' : 'danger'}
            >
              {testResult.passed ? 'PASÓ' : 'FALLÓ'}
            </Badge>
          </h5>
          
          {testResult.message && (
            <Alert variant={testResult.passed ? 'success' : 'warning'}>
              {testResult.message}
            </Alert>
          )}
          
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Estado</th>
                <th>Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {testResult.attempts.map((attempt, index) => (
                <tr key={index}>
                  <td>{attempt.attempt}</td>
                  <td>{attempt.status}</td>
                  <td>{attempt.message}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      );
    }

    // Para resultados de prueba XSS
    if (testResult.name === 'Prueba de Protección XSS') {
      return (
        <div className="mb-4">
          <h5>
            {testResult.name}
            <Badge 
              className="ms-2" 
              bg={testResult.passed ? 'success' : 'danger'}
            >
              {testResult.passed ? 'PASÓ' : 'FALLÓ'}
            </Badge>
          </h5>
          
          {testResult.message && (
            <Alert variant={testResult.passed ? 'success' : 'warning'}>
              {testResult.message}
            </Alert>
          )}
          
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Payload Original</th>
                <th>Payload Sanitizado</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>{testResult.originalPayload}</code></td>
                <td><code>{testResult.sanitizedPayload || 'N/A'}</code></td>
                <td>{testResult.passed ? '✅ Sanitizado' : '❌ No sanitizado'}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      );
    }

    // Para otros tipos de resultados
    return (
      <div className="mb-4">
        <h5>{testResult.name || 'Resultado de prueba'}</h5>
        <pre>{JSON.stringify(testResult, null, 2)}</pre>
      </div>
    );
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header as="h4" className="bg-primary text-white">
          Panel de Pruebas de Seguridad
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <p className="lead">
              Utilice este panel para probar las medidas de seguridad implementadas en la aplicación.
            </p>
            
            <Alert variant="info">
              <Alert.Heading>Medidas de seguridad implementadas:</Alert.Heading>
              <ul>
                <li><strong>Protección XSS</strong> - Sanitización de entradas de usuario para prevenir ataques de Cross-Site Scripting.</li>
                <li><strong>Rate Limiting</strong> - Limitación de intentos de inicio de sesión y otras operaciones sensibles.</li>
                <li><strong>Helmet</strong> - Encabezados HTTP de seguridad para proteger contra varios tipos de ataques.</li>
                <li><strong>Validación de Entrada</strong> - Verificación de todas las entradas de usuario antes de procesarlas.</li>
                <li><strong>Cookies Seguras</strong> - Configuración de cookies con flags HttpOnly, Secure y SameSite.</li>
              </ul>
            </Alert>
          </div>

          <Form className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Seleccione la prueba a ejecutar:</Form.Label>
              <Form.Select 
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                disabled={loading}
              >
                <option value="all">Todas las pruebas</option>
                <option value="rateLimit">Prueba de Rate Limiting</option>
                <option value="xss">Prueba de Protección XSS</option>
              </Form.Select>
            </Form.Group>

            <Button 
              variant="primary" 
              onClick={handleRunTests}
              disabled={loading}
              className="d-flex align-items-center"
            >
              {loading && <Spinner size="sm" animation="border" className="me-2" />}
              {loading ? 'Ejecutando pruebas...' : 'Ejecutar Pruebas'}
            </Button>
          </Form>

          {results && (
            <div className="results-container">
              <h4 className="mb-3">Resultados de las Pruebas:</h4>
              
              {results.rateLimiting && renderResultTable(results.rateLimiting)}
              {results.xssProtection && renderResultTable(results.xssProtection)}
              
              {!results.rateLimiting && !results.xssProtection && (
                <Alert variant="warning">
                  No se obtuvieron resultados de las pruebas.
                </Alert>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SecurityTestPanel; 