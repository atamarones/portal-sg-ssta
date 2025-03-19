import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import api from '../api/api';
import '../styles/auth.css';
import { useAuth } from '../contexts/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es obligatorio'),
  password: Yup.string()
    .required('La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Procesar parámetros de URL para autenticación con Google
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    
    if (error) {
      toast.error('Error al iniciar sesión con Google');
    }
    
    // Verificar si Google Auth está habilitado
    const checkGoogleAuthStatus = async () => {
      try {
        const response = await api.get('/auth/google/status');
        setGoogleAuthEnabled(response.data.enabled);
      } catch (error) {
        console.error('Error al verificar estado de Google Auth:', error);
        setGoogleAuthEnabled(false);
      }
    };
    
    checkGoogleAuthStatus();
  }, [location]);

  // Para procesar el callback de Google Auth
  useEffect(() => {
    if (location.pathname === '/auth/google/callback') {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const userStr = params.get('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          toast.success('Inicio de sesión con Google exitoso');
          navigate('/dashboard');
        } catch (error) {
          console.error('Error al procesar respuesta de Google:', error);
          toast.error('Error al procesar respuesta de Google');
          navigate('/login');
        }
      }
    }
  }, [location, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    // Validar que el CAPTCHA se haya completado
    if (!captchaToken) {
      toast.error('Por favor, completa el captcha para continuar');
      setSubmitting(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Enviar el token del captcha junto con las credenciales
      await login(values.email, values.password, captchaToken);
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error(
        error.response?.data?.message || 
        'Error al iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/auth/google`;
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  // Si estamos en la ruta de callback, mostramos un loader
  if (location.pathname === '/auth/google/callback') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Procesando autenticación</h2>
            <p>Por favor espera mientras completamos el proceso...</p>
          </div>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Iniciar sesión</h2>
          <p>Ingresa tus credenciales para acceder</p>
        </div>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="auth-form">
              {errors.general && (
                <div className="form-error-message">{errors.general}</div>
              )}

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    placeholder="correo@ejemplo.com"
                    className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                  />
                </div>
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <Field
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    placeholder="Tu contraseña"
                    className={`form-control ${
                      errors.password && touched.password ? 'is-invalid' : ''
                    }`}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>

              <div className="form-group captcha-container">
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                  onChange={handleCaptchaChange}
                />
              </div>

              <div className="form-links">
                <Link to="/forgot-password" className="forgot-password-link">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                className="btn-primary btn-block"
                disabled={isSubmitting || isLoading || !captchaToken}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>

              {googleAuthEnabled && (
                <div className="social-login">
                  <div className="divider">
                    <span>O</span>
                  </div>
                  <button
                    type="button"
                    className="btn-google"
                    onClick={handleGoogleLogin}
                  >
                    <FaGoogle /> Iniciar sesión con Google
                  </button>
                </div>
              )}

              <div className="auth-footer">
                <p>
                  ¿No tienes una cuenta?{' '}
                  <Link to="/register" className="auth-link">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login; 