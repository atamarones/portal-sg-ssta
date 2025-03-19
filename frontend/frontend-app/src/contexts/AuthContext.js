import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

// Crear el contexto
const AuthContext = createContext();

// URL base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Verificar autenticación al cargar la página
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('AuthContext: Verificando token almacenado');
      console.log('AuthContext: URL base de API:', API_BASE_URL);
      
      if (!storedToken) {
        console.log('AuthContext: No hay token almacenado');
        setLoading(false);
        return;
      }
      
      try {
        // Verificar si el token ha expirado
        const decodedToken = jwtDecode(storedToken);
        console.log('AuthContext: Token decodificado:', decodedToken);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          // Token expirado
          console.log('AuthContext: Token expirado');
          logout();
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          setLoading(false);
          return;
        }
        
        // Token válido
        console.log('AuthContext: Token válido');
        setToken(storedToken);
        
        // Configurar el encabezado por defecto para axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Si ya tenemos datos del usuario en localStorage, usarlos como autenticación principal
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            // Asegurar compatibilidad ID
            userData.id = userData.id || userData.userId;
            console.log('AuthContext: Usando datos de usuario del localStorage:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            
            // Intentar obtener información fresca del usuario en segundo plano
            // pero no depender de esto para establecer la autenticación
            refreshUserData(storedToken);
            
            // Ya no necesitamos mantener el loading state activo, ya tenemos datos del usuario
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error al parsear datos del usuario del localStorage:', error);
          }
        }
        
        // Solo intentar obtener los datos del usuario desde la API si no tenemos datos en localStorage
        try {
          // Verificar qué URL estamos usando para obtener datos
          const apiUrl = `${API_BASE_URL}/api/auth/profile`;
          console.log('AuthContext: Solicitando información actualizada del usuario a:', apiUrl);
          
          const response = await axios.get(apiUrl, {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });
          
          console.log('AuthContext: Información del usuario recibida:', response.data);
          
          // Asegurarse de que el ID del usuario esté correctamente establecido
          const userData = response.data;
          userData.id = userData.id || userData.userId;
          
          setUser(userData);
          setIsAuthenticated(true);
          
          // Actualizar localStorage con datos frescos
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error('AuthContext: Error al obtener información actualizada del usuario:', error);
          console.error('AuthContext: Detalles del error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          });
          
          // Si ya verificamos que el token es válido, pero no podemos obtener el perfil,
          // podemos intentar con una URL alternativa o simplemente mantener la autenticación
          console.log('AuthContext: Token verificado como válido, manteniendo la sesión activa');
          setIsAuthenticated(true);
          
          // Solo hacer logout si es un error 401 explícito
          if (error.response?.status === 401) {
            console.log('AuthContext: Token rechazado por el servidor (401), cerrando sesión');
            logout();
          }
        }
      } catch (error) {
        // Error al decodificar el token
        console.error('Error al verificar el token:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Función para actualizar datos del usuario en segundo plano
  const refreshUserData = async (currentToken) => {
    try {
      // Verificar qué URL estamos usando para obtener datos
      const apiUrl = `${API_BASE_URL}/api/auth/profile`;
      console.log('AuthContext: Actualizando datos del usuario en segundo plano desde:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      if (response.data) {
        const userData = response.data;
        userData.id = userData.id || userData.userId;
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('AuthContext: Datos del usuario actualizados correctamente');
      }
    } catch (error) {
      console.error('Error al actualizar datos del usuario en segundo plano:', error);
      console.error('AuthContext: Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      // No hacemos logout ni mostramos errores si falla la actualización en segundo plano
    }
  };
  
  // Iniciar sesión
  const login = async (email, password, captchaToken) => {
    try {
      console.log('AuthContext: Intentando iniciar sesión con:', email);
      console.log('AuthContext: URL de la API:', `${API_BASE_URL}/api/auth/login`);
      
      const credentials = {
        email,
        password,
        captchaToken
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
      
      const { token, user } = response.data;
      console.log('AuthContext: Respuesta de login:', { token: !!token, user });
      
      // Asegurarse de que el ID del usuario esté correctamente establecido
      user.id = user.id || user.userId;
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Actualizar estado
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      // Configurar el encabezado para axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.success('Sesión iniciada correctamente');
      return true;
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
      return false;
    }
  };
  
  // Registrar usuario
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
      
      toast.success('Registro exitoso. Ya puedes iniciar sesión.');
      return true;
    } catch (error) {
      console.error('Error de registro:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al registrar usuario';
      toast.error(errorMessage);
      return false;
    }
  };
  
  // Cerrar sesión
  const logout = () => {
    // Eliminar token y datos del usuario
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpiar encabezado de axios
    delete axios.defaults.headers.common['Authorization'];
    
    // Actualizar estado
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Recuperar contraseña
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/password-reset-request`, { email });
      
      toast.success('Se ha enviado un enlace de recuperación a tu correo electrónico');
      return true;
    } catch (error) {
      console.error('Error de recuperación de contraseña:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al solicitar recuperación de contraseña';
      toast.error(errorMessage);
      return false;
    }
  };
  
  // Restablecer contraseña
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/password-reset`, { 
        token, 
        newPassword 
      });
      
      toast.success('Contraseña restablecida correctamente');
      return true;
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al restablecer contraseña';
      toast.error(errorMessage);
      return false;
    }
  };
  
  // Actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Actualizar datos del usuario en el estado y localStorage
      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Perfil actualizado correctamente');
      return true;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      toast.error(errorMessage);
      return false;
    }
  };
  
  // Cambiar contraseña
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/auth/change-password`, 
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Contraseña actualizada correctamente');
      return true;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      toast.error(errorMessage);
      return false;
    }
  };
  
  // Valor del contexto
  const contextValue = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    refreshUserData
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;