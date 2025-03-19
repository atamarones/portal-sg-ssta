import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

/**
 * Componente que protege rutas solo para administradores
 * Redirige a la página principal si el usuario no está autenticado o no es administrador
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [accessGranted, setAccessGranted] = useState(false);
  const [localChecked, setLocalChecked] = useState(false);
  
  console.log('AdminRoute [Renderizando]', {
    pathname: location.pathname,
    isAuthenticated,
    userRole: user?.role,
    loading,
    accessGranted,
    localChecked
  });
  
  // Primer nivel de verificación: comprobación directa de localStorage
  useEffect(() => {
    try {
      console.log('AdminRoute [useEffect]: Comprobando localStorage directamente');
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        console.log('AdminRoute [useEffect]: Datos de usuario encontrados', parsedUser);
        
        if (parsedUser.role === 'ADMIN') {
          console.log('AdminRoute [useEffect]: ES ADMINISTRADOR según localStorage, concediendo acceso');
          setAccessGranted(true);
        } else {
          console.log('AdminRoute [useEffect]: NO es administrador según localStorage');
          // No hacemos setAccessGranted(false) aquí porque podría anular el contexto
        }
      } else {
        console.log('AdminRoute [useEffect]: No hay token o datos de usuario en localStorage');
      }
    } catch (error) {
      console.error('AdminRoute [useEffect]: Error al verificar localStorage', error);
    } finally {
      setLocalChecked(true);
    }
  }, [location.pathname]); // Re-verificar cuando cambie la ruta
  
  // Si se ha concedido acceso en base a la verificación local, mostrar el contenido
  if (accessGranted) {
    console.log('AdminRoute: Acceso concedido por verificación local');
    return children;
  }
  
  // Si isAuthenticated es true y el usuario es admin, mostrar el contenido
  if (isAuthenticated && user && user.role === 'ADMIN') {
    console.log('AdminRoute: Acceso concedido por contexto de autenticación');
    return children;
  }
  
  // Si estamos cargando pero aún no hemos hecho la verificación local, mostrar spinner
  if (loading && !localChecked) {
    console.log('AdminRoute: Mostrando spinner mientras carga');
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verificando permisos de administrador...</p>
      </div>
    );
  }
  
  // Si ya terminamos de cargar, o hemos verificado localmente y no pasó, tomamos una decisión final
  
  // Verificar token en localStorage incluso si el contexto dice que no está autenticado
  const hasToken = !!localStorage.getItem('token');
  
  if (!isAuthenticated && !hasToken) {
    // Solo si realmente no hay token, mostrar mensaje y redirigir al login
    console.log('AdminRoute: No hay token, redirigiendo al login');
    toast.error('Debe iniciar sesión para acceder a esta sección');
    return <Navigate to="/login" />;
  }
  
  if (hasToken && user && user.role !== 'ADMIN') {
    // Si hay token pero el usuario no es admin, redirigir a inicio
    console.log('AdminRoute: Usuario no es administrador', user?.role);
    toast.error('No tiene permisos para acceder a esta sección');
    return <Navigate to="/" />;
  }
  
  // Si llegamos aquí, es posible que haya un token pero estamos esperando a que el usuario se cargue
  // En lugar de redirigir, mostramos el spinner
  console.log('AdminRoute: Mostrando spinner hasta confirmación final');
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Verificando permisos de administrador...</p>
    </div>
  );
};

export default AdminRoute;
