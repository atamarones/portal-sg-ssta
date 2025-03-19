import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import '../../styles/admin.css';

// Componente de pestañas simplificado
const TabPanel = ({ children, value, index }) => {
  return (
    <div 
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
    >
      {value === index && children}
    </div>
  );
};

const ConfigPanel = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    // Email
    emailEnabled: false,
    emailHost: '',
    emailPort: 587,
    emailUser: '',
    emailPassword: '',
    emailSecure: false,
    emailFromAddress: '',
    
    // Google Auth
    googleAuthEnabled: false,
    googleClientId: '',
    googleClientSecret: '',
    googleCallbackUrl: '',
    
    // App
    appName: 'Portal SG-SSTA',
    appLogo: '',
    primaryColor: '#1976d2',
    allowRegistration: true,
    maintenanceMode: false,
  });
  
  const { token, user } = useAuth();
  
  console.log('ConfigPanel: Token disponible:', !!token);
  console.log('ConfigPanel: Usuario actual:', user);
  console.log('ConfigPanel: URL API:', process.env.REACT_APP_API_URL);
  
  // Obtener la configuración del sistema al cargar el componente
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log('ConfigPanel: Intentando obtener configuración del sistema');
        console.log('ConfigPanel: URL base API:', process.env.REACT_APP_API_URL);
        const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/config`;
        console.log('ConfigPanel: Haciendo petición a:', apiUrl);
        console.log('ConfigPanel: Token utilizado:', token);
        
        // Verificar que hay token
        if (!token) {
          console.log('ConfigPanel: No hay token disponible');
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            console.log('ConfigPanel: Usando token desde localStorage');
            
            try {
              const response = await axios.get(apiUrl, {
                headers: {
                  Authorization: `Bearer ${storedToken}`,
                },
              });
              
              console.log('ConfigPanel: Respuesta recibida:', response.data);
              setFormData(response.data);
            } catch (apiError) {
              console.error('ConfigPanel: Error con token de localStorage:', apiError);
              console.log('ConfigPanel: Detalles del error:', {
                message: apiError.message,
                status: apiError.response?.status,
                data: apiError.response?.data
              });
              setError(apiError.response?.data?.message || apiError.message);
              toast.error('Error al cargar la configuración');
              
              // Si falla, usar datos de ejemplo para poder trabajar con la interfaz
              setFormDataExamplo();
            }
          } else {
            console.log('ConfigPanel: No hay token ni en contexto ni en localStorage');
            setFormDataExamplo();
            setError('No hay token de autenticación disponible');
            toast.error('No se pudo autenticar para cargar la configuración');
          }
        } else {
          // Hay token en el contexto
          const response = await axios.get(apiUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          console.log('ConfigPanel: Respuesta recibida:', response.data);
          setFormData(response.data);
        }
      } catch (error) {
        console.error('Error al obtener la configuración:', error);
        console.log('ConfigPanel: Detalles del error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        setError(error.response?.data?.message || error.message);
        toast.error('Error al cargar la configuración');
        
        // Si falla, usar datos de ejemplo para poder trabajar con la interfaz
        setFormDataExamplo();
      } finally {
        setLoading(false);
      }
    };
    
    // Función para establecer datos de ejemplo en caso de error de API
    const setFormDataExamplo = () => {
      console.log('ConfigPanel: Usando datos de ejemplo para la interfaz');
      setFormData({
        // Email
        emailEnabled: false,
        emailHost: 'smtp.example.com',
        emailPort: 587,
        emailUser: 'usuario@ejemplo.com',
        emailPassword: '',
        emailSecure: false,
        emailFromAddress: 'no-reply@example.com',
        
        // Google Auth
        googleAuthEnabled: false,
        googleClientId: '',
        googleClientSecret: '',
        googleCallbackUrl: 'http://localhost:3000/api/auth/google/callback',
        
        // App
        appName: 'Portal SG-SSTA (Modo offline)',
        appLogo: '',
        primaryColor: '#1976d2',
        allowRegistration: true,
        maintenanceMode: false,
      });
    };
    
    if (token) {
      fetchConfig();
    } else {
      console.log('ConfigPanel: No hay token disponible, no se puede obtener la configuración');
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log('ConfigPanel: Hay token en localStorage, intentando obtener configuración');
        fetchConfig();
      } else {
        setLoading(false);
        setFormDataExamplo();
      }
    }
  }, [token]);
  
  // Manejar el cambio de pestaña
  const handleTabChange = (index) => {
    setTabValue(index);
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  // Guardar la configuración
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/config`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setFormData(response.data.config);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };
  
  // Probar la configuración de correo
  const handleTestEmailConnection = async (e) => {
    e.preventDefault();
    
    if (!testEmailRecipient) {
      toast.error('Por favor, ingresa un correo de destino para la prueba');
      return;
    }
    
    setTesting(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/config/test-email`,
        {
          emailHost: formData.emailHost,
          emailPort: formData.emailPort,
          emailUser: formData.emailUser,
          emailPassword: formData.emailPassword,
          emailSecure: formData.emailSecure,
          emailFromAddress: formData.emailFromAddress,
          testEmailRecipient,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success('Correo de prueba enviado correctamente');
    } catch (error) {
      console.error('Error al probar la configuración de correo:', error);
      toast.error(`Error al probar el correo: ${error.response?.data?.details || error.message}`);
    } finally {
      setTesting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando configuración...</p>
      </div>
    );
  }
  
  return (
    <div className="config-panel">
      <h1>Panel de Configuración del Sistema</h1>
      <p className="description">
        Ajusta las configuraciones del sistema para personalizar el funcionamiento de la aplicación.
      </p>
      
      <div className="tabs">
        <button 
          className={`tab-button ${tabValue === 0 ? 'active' : ''}`} 
          onClick={() => handleTabChange(0)}
        >
          Correo Electrónico
        </button>
        <button 
          className={`tab-button ${tabValue === 1 ? 'active' : ''}`} 
          onClick={() => handleTabChange(1)}
        >
          Autenticación con Google
        </button>
        <button 
          className={`tab-button ${tabValue === 2 ? 'active' : ''}`} 
          onClick={() => handleTabChange(2)}
        >
          Aplicación
        </button>
      </div>
      
      {/* Pestaña de configuración de correo */}
      <TabPanel value={tabValue} index={0}>
        <div className="form-container">
          <h2>Configuración de Correo Electrónico</h2>
          
          <form onSubmit={handleSaveConfig}>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="emailEnabled"
                  checked={formData.emailEnabled}
                  onChange={handleInputChange}
                />
                Habilitar servicio de correo
              </label>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Host SMTP</label>
                <input
                  type="text"
                  name="emailHost"
                  value={formData.emailHost}
                  onChange={handleInputChange}
                  disabled={!formData.emailEnabled}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>Puerto SMTP</label>
                <input
                  type="number"
                  name="emailPort"
                  value={formData.emailPort}
                  onChange={handleInputChange}
                  disabled={!formData.emailEnabled}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Usuario SMTP</label>
                <input
                  type="text"
                  name="emailUser"
                  value={formData.emailUser}
                  onChange={handleInputChange}
                  disabled={!formData.emailEnabled}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>Contraseña SMTP</label>
                <input
                  type="password"
                  name="emailPassword"
                  value={formData.emailPassword}
                  onChange={handleInputChange}
                  disabled={!formData.emailEnabled}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Dirección de correo remitente</label>
                <input
                  type="text"
                  name="emailFromAddress"
                  value={formData.emailFromAddress}
                  onChange={handleInputChange}
                  disabled={!formData.emailEnabled}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="emailSecure"
                    checked={formData.emailSecure}
                    onChange={handleInputChange}
                    disabled={!formData.emailEnabled}
                  />
                  Conexión segura (SSL/TLS)
                </label>
              </div>
            </div>
            
            <hr className="divider" />
            
            <h3>Probar configuración</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Correo de destino para prueba</label>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  disabled={!formData.emailEnabled || testing}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!formData.emailEnabled || testing || !testEmailRecipient}
                  onClick={handleTestEmailConnection}
                >
                  {testing ? 'Enviando prueba...' : 'Enviar correo de prueba'}
                </button>
              </div>
            </div>
            
            <div className="button-container">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar configuración'}
              </button>
            </div>
          </form>
        </div>
      </TabPanel>
      
      {/* Pestaña de configuración de Google Auth */}
      <TabPanel value={tabValue} index={1}>
        <div className="form-container">
          <h2>Configuración de autenticación con Google</h2>
          
          <form onSubmit={handleSaveConfig}>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="googleAuthEnabled"
                  checked={formData.googleAuthEnabled}
                  onChange={handleInputChange}
                />
                Habilitar autenticación con Google
              </label>
            </div>
            
            <div className="form-group">
              <label>Google Client ID</label>
              <input
                type="text"
                name="googleClientId"
                value={formData.googleClientId}
                onChange={handleInputChange}
                disabled={!formData.googleAuthEnabled}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Google Client Secret</label>
              <input
                type="password"
                name="googleClientSecret"
                value={formData.googleClientSecret}
                onChange={handleInputChange}
                disabled={!formData.googleAuthEnabled}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>URL de callback</label>
              <input
                type="text"
                name="googleCallbackUrl"
                value={formData.googleCallbackUrl}
                onChange={handleInputChange}
                disabled={!formData.googleAuthEnabled}
                className="form-control"
                placeholder="http://localhost:3000/api/auth/google/callback"
              />
            </div>
            
            <div className="button-container">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar configuración'}
              </button>
            </div>
          </form>
        </div>
      </TabPanel>
      
      {/* Pestaña de configuración de la aplicación */}
      <TabPanel value={tabValue} index={2}>
        <div className="form-container">
          <h2>Configuración general de la aplicación</h2>
          
          <form onSubmit={handleSaveConfig}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la aplicación</label>
                <input
                  type="text"
                  name="appName"
                  value={formData.appName}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>Color primario</label>
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>URL del logo</label>
              <input
                type="text"
                name="appLogo"
                value={formData.appLogo}
                onChange={handleInputChange}
                className="form-control"
                placeholder="/logo.png"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="allowRegistration"
                    checked={formData.allowRegistration}
                    onChange={handleInputChange}
                  />
                  Permitir registro de nuevos usuarios
                </label>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={formData.maintenanceMode}
                    onChange={handleInputChange}
                  />
                  Modo de mantenimiento
                </label>
              </div>
            </div>
            
            <div className="button-container">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar configuración'}
              </button>
            </div>
          </form>
        </div>
      </TabPanel>
    </div>
  );
};

export default ConfigPanel;
