import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaClipboardList, 
  FaClipboardCheck, 
  FaExclamationTriangle, 
  FaCalendarCheck 
} from 'react-icons/fa';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Obtener información del usuario del localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Datos de ejemplo para mostrar en el dashboard
  const dashboardData = {
    pendingTasks: 5,
    completedTasks: 12,
    incidents: 2,
    upcomingEvents: 3
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Cargando información...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Panel de Control</h1>
        <p>Bienvenido, {user.name}</p>
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <div className="card-icon pending">
            <FaClipboardList />
          </div>
          <div className="card-content">
            <h3>Tareas Pendientes</h3>
            <p className="card-value">{dashboardData.pendingTasks}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon completed">
            <FaClipboardCheck />
          </div>
          <div className="card-content">
            <h3>Tareas Completadas</h3>
            <p className="card-value">{dashboardData.completedTasks}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon warning">
            <FaExclamationTriangle />
          </div>
          <div className="card-content">
            <h3>Incidentes</h3>
            <p className="card-value">{dashboardData.incidents}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon info">
            <FaCalendarCheck />
          </div>
          <div className="card-content">
            <h3>Próximos Eventos</h3>
            <p className="card-value">{dashboardData.upcomingEvents}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Acciones rápidas</h2>
          </div>
          <div className="quick-actions">
            <Link to="/profile" className="action-card">
              <div className="action-icon">
                <FaUser />
              </div>
              <div className="action-content">
                <h3>Mi Perfil</h3>
                <p>Administra tu información personal</p>
              </div>
            </Link>
            
            {/* Aquí se pueden añadir más acciones rápidas según los requerimientos */}
            <div className="action-card">
              <div className="action-icon">
                <FaClipboardList />
              </div>
              <div className="action-content">
                <h3>Mis Tareas</h3>
                <p>Visualiza y gestiona tus tareas</p>
              </div>
            </div>

            <div className="action-card">
              <div className="action-icon">
                <FaExclamationTriangle />
              </div>
              <div className="action-content">
                <h3>Reportar Incidente</h3>
                <p>Reporta un nuevo incidente</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Sistema SG-SSTA</h2>
          </div>
          <div className="welcome-message">
            <p>
              Bienvenido al Sistema de Gestión de Seguridad, Salud en el Trabajo y Ambiente (SG-SSTA).
              Este sistema te permite gestionar y dar seguimiento a todos los procesos relacionados con 
              la seguridad y salud laboral, así como aspectos ambientales.
            </p>
            <p>
              Utiliza la barra de navegación lateral para acceder a los diferentes módulos del sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
