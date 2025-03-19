import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (!token) {
      toast.error('Sesión no válida. Por favor, inicia sesión nuevamente.');
    }
  }, [token]);
  
  if (!token) {
    // Redirigir al login si no hay token, pero recordar la ruta actual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute; 