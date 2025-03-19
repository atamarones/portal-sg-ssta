import axios from 'axios';
import { toast } from 'react-hot-toast';

// Crear una instancia de axios con la URL base del backend
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  withCredentials: true, // Habilitar envío de cookies de sesión
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar el token CSRF si existe en las cookies
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Función para obtener valor de una cookie por nombre
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Manejar errores de autenticación (401)
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Evitar mostrar toast en páginas de login/registro
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/reset-password')) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        
        // Redirigir al login, excepto si ya estamos en una página de autenticación
        window.location.href = '/login';
      }
    }
    
    // Manejar errores de servidor (500)
    if (response && response.status >= 500) {
      toast.error('Ha ocurrido un error en el servidor. Por favor, intenta más tarde.');
    }
    
    // Manejar errores de CSRF
    if (response && response.status === 403 && 
        response.data && response.data.message && 
        response.data.message.includes('CSRF')) {
      // Recargar la página para obtener un nuevo token CSRF
      window.location.reload();
    }
    
    return Promise.reject(error);
  }
);

export default api; 