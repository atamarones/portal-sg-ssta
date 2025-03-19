import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUsers, FaChartLine, FaClipboardCheck } from 'react-icons/fa';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Sistema de Gestión SG-SSTA</h1>
          <p>
            Gestiona de manera eficiente la seguridad, salud en el trabajo y medio ambiente
            con nuestra plataforma integral.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">
              Iniciar sesión
            </Link>
            <Link to="/register" className="btn-secondary">
              Registrarse
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Características principales</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>
            <h3>Gestión de Seguridad</h3>
            <p>
              Identifica, evalúa y controla los riesgos de seguridad en tu organización de manera
              eficiente y centralizada.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaUsers />
            </div>
            <h3>Salud Ocupacional</h3>
            <p>
              Lleva un seguimiento detallado de la salud de tus colaboradores y gestiona los
              programas de prevención.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaChartLine />
            </div>
            <h3>Análisis y Reportes</h3>
            <p>
              Accede a información en tiempo real y genera reportes detallados para la toma de
              decisiones estratégicas.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaClipboardCheck />
            </div>
            <h3>Cumplimiento Normativo</h3>
            <p>
              Asegura el cumplimiento de las normativas nacionales e internacionales en materia
              de seguridad y medio ambiente.
            </p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-content">
          <h2>¿Listo para empezar?</h2>
          <p>
            Únete a nuestra plataforma y lleva la gestión de seguridad, salud en el trabajo y medio
            ambiente al siguiente nivel.
          </p>
          <Link to="/register" className="btn-primary">
            Crear cuenta ahora
          </Link>
        </div>
      </div>

      <div className="info-section">
        <div className="info-content">
          <h2>¿Por qué elegirnos?</h2>
          <div className="info-grid">
            <div className="info-item">
              <h3>Solución Integral</h3>
              <p>
                Una plataforma que unifica todos los aspectos del sistema de gestión SG-SSTA,
                facilitando su administración.
              </p>
            </div>
            <div className="info-item">
              <h3>Fácil de Usar</h3>
              <p>
                Interfaz intuitiva diseñada para que cualquier usuario pueda utilizarla sin
                necesidad de capacitación extensiva.
              </p>
            </div>
            <div className="info-item">
              <h3>Personalizable</h3>
              <p>
                Adapta el sistema a las necesidades específicas de tu organización y sector de
                actividad.
              </p>
            </div>
            <div className="info-item">
              <h3>Soporte Permanente</h3>
              <p>
                Equipo de soporte dedicado a resolver cualquier duda o inconveniente que pueda
                surgir durante el uso del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
