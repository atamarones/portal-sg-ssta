import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api/api';
import '../styles/auth.css';
import ReCAPTCHA from 'react-google-recaptcha';

// Función para validar la fortaleza de la contraseña
const validatePasswordStrength = (password) => {
  // Requisitos de la contraseña segura
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  
  // Calcular puntuación de fortaleza
  let strength = 0;
  if (password.length >= minLength) strength += 1;
  if (hasUppercase) strength += 1;
  if (hasLowercase) strength += 1;
  if (hasNumbers) strength += 1;
  if (hasSpecialChars) strength += 1;
  
  return {
    score: strength,
    feedback: strength < 3 ? {
      suggestions: [
        "Use al menos 8 caracteres",
        "Incluya mayúsculas y minúsculas",
        "Incluya números",
        "Incluya caracteres especiales"
      ].filter((_, i) => i < 5 - strength)
    } : null
  };
};

// Modificar el esquema de validación
const registerSchema = Yup.object().shape({
  name: Yup.string()
    .required('El nombre es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: Yup.string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es obligatorio'),
  password: Yup.string()
    .required('La contraseña es obligatoria')
    .test(
      'password-strength',
      'La contraseña es demasiado débil',
      function(value) {
        const result = validatePasswordStrength(value);
        // Validación fallida si la puntuación es menor a 3
        if (result.score < 3) {
          const suggestion = result.feedback.suggestions.join('. ');
          return this.createError({
            message: `La contraseña es débil. ${suggestion}`
          });
        }
        return true;
      }
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('La confirmación de contraseña es obligatoria'),
});

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [passwordScore, setPasswordScore] = useState(0);

  const handlePasswordChange = (e, setFieldValue) => {
    const password = e.target.value;
    setFieldValue('password', password);
    
    // Evaluar fortaleza
    const result = validatePasswordStrength(password);
    setPasswordScore(result.score);
  };
  
  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    // Validar que el CAPTCHA se haya completado
    if (!captchaToken) {
      toast.error('Por favor, completa el captcha para continuar');
      setSubmitting(false);
      return;
    }
    
    setIsLoading(true);
    // Eliminamos confirmPassword antes de enviar al backend
    const { confirmPassword, ...userData } = values;
    
    try {
      // Incluir el token de captcha en la solicitud
      userData.captchaToken = captchaToken;
      await api.post('/auth/register', userData);
      toast.success('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al registrar usuario';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Crear cuenta</h2>
          <p>Regístrate para acceder al sistema</p>
        </div>

        <Formik
          initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, setFieldValue, values }) => (
            <Form className="auth-form">
              {errors.general && (
                <div className="form-error-message">{errors.general}</div>
              )}

              <div className="form-group">
                <label htmlFor="name">Nombre completo</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <Field
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Tu nombre completo"
                    className={`form-control ${errors.name && touched.name ? 'is-invalid' : ''}`}
                  />
                </div>
                <ErrorMessage name="name" component="div" className="error-message" />
              </div>

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
                    onChange={(e) => handlePasswordChange(e, setFieldValue)}
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
                
                {/* Indicador de fortaleza de contraseña */}
                {values.password && (
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div 
                        className={`strength-bar strength-${passwordScore}`} 
                        style={{ width: `${passwordScore * 20}%` }} 
                      ></div>
                    </div>
                    <span className={`strength-text strength-${passwordScore}`}>
                      {passwordScore === 0 && 'Muy débil'}
                      {passwordScore === 1 && 'Débil'}
                      {passwordScore === 2 && 'Regular'}
                      {passwordScore === 3 && 'Buena'}
                      {passwordScore === 4 && 'Fuerte'}
                      {passwordScore === 5 && 'Muy fuerte'}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon" />
                  <Field
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirma tu contraseña"
                    className={`form-control ${
                      errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''
                    }`}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <ErrorMessage name="confirmPassword" component="div" className="error-message" />
              </div>

              <div className="form-group captcha-container">
                <ReCAPTCHA
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                  onChange={handleCaptchaChange}
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-block"
                disabled={isSubmitting || isLoading || !captchaToken}
              >
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </button>

              <div className="auth-footer">
                <p>
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/login" className="auth-link">
                    Inicia sesión aquí
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

export default Register; 