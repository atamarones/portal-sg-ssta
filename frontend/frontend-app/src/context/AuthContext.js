import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar el usuario desde localStorage
  const loadUserFromStorage = () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      console.log('AuthContext: Cargando datos de almacenamiento local');
      console.log('AuthContext: Token encontrado:', !!token);
      console.log('AuthContext: Usuario encontrado:', !!storedUser);
      
      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext: Datos de usuario cargados:', parsedUser);
        setUser(parsedUser);
        // Configurar el token para todas las solicitudes de axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('AuthContext: Error al cargar usuario desde localStorage:', error);
      toast.error('Error al cargar la sesión de usuario');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Iniciando login con email:', email);
      setLoading(true);
      const { data } = await axios.post('/api/auth/login', { email, password });
      console.log('AuthContext: Respuesta de login:', data);
      
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('AuthContext: Usuario guardado en localStorage:', data.user);
        
        // Configurar el token para todas las solicitudes de axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        setUser(data.user);
        toast.success('Inicio de sesión exitoso');
      } else {
        console.error('AuthContext: Datos de login incompletos', data);
        toast.error('Error en inicio de sesión: datos incompletos');
      }
    } catch (error) {
      console.error('AuthContext: Error en login:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('AuthContext: Cerrando sesión');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.info('Sesión cerrada');
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('AuthContext: Intentando obtener perfil, token existe:', !!token);
      
      if (token) {
        setLoading(true);
        // Configurar el token para todas las solicitudes de axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const { data } = await axios.get('/api/auth/profile');
        console.log('AuthContext: Perfil obtenido:', data);
        
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (error) {
      console.error('AuthContext: Error al obtener perfil:', error);
      if (error.response?.status === 401) {
        console.log('AuthContext: Token expirado o inválido, cerrando sesión');
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthContext: Inicializando...');
    loadUserFromStorage();
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
