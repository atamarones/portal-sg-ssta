import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaSignOutAlt, 
  FaUser, 
  FaTachometerAlt, 
  FaBars, 
  FaTimes,
  FaCog,
  FaShieldAlt
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import '../styles/navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Navbar: Usuario cargado del localStorage', parsedUser);
        setIsLoggedIn(true);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      console.log('Navbar: No hay token o datos de usuario en localStorage');
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    toast.success('Sesión cerrada correctamente');
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isAdmin = user && user.role === 'ADMIN';
  console.log('Navbar: ¿El usuario es admin?', isAdmin, 'Role:', user?.role);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          SG-SSTA
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={menuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              <FaHome /> Inicio
            </Link>
          </li>

          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                  <FaTachometerAlt /> Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/profile" className="nav-link" onClick={closeMenu}>
                  <FaUser /> Mi Perfil
                </Link>
              </li>
              {isAdmin && (
                <>
                  <li className="nav-item">
                    <Link to="/admin/config" className="nav-link" onClick={closeMenu}>
                      <FaCog /> Configuración
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/admin/security-test" className="nav-link" onClick={closeMenu}>
                      <FaShieldAlt /> Pruebas de Seguridad
                    </Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <button className="nav-link logout-button" onClick={handleLogout}>
                  <FaSignOutAlt /> Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={closeMenu}>
                  Iniciar sesión
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link register-link" onClick={closeMenu}>
                  Registrarse
                </Link>
              </li>
            </>
          )}
        </ul>

        {isLoggedIn && (
          <div className="user-info">
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 