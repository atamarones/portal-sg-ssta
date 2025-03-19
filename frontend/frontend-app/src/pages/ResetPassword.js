import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api/api';
import '../styles/auth.css';

const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required('La nueva contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Las contraseñas deben coincidir')
    .required('La confirmación de contraseña es obligatoria'),
});

const ResetPassword = () => {
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setIsLoading(true);
    // Solo enviamos la nueva contraseña y el token
    const resetData = {
      token,
      newPassword: values.newPassword
    };
    
    try {
      await api.post('/auth/password-reset', resetData);
      setResetSuccess(true);
      toast.success('¡Contraseña restablecida con éxito!');
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 'Error al restablecer la contraseña';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Error de restablecimiento</h2>
            <p>No se ha proporcionado un token válido para restablecer la contraseña.</p>
          </div>
          <div className="auth-footer">
            <Link to="/forgot-password" className="btn-primary">
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Restablecer contraseña</h2>
          <p>Ingresa tu nueva contraseña</p>
        </div>

        {resetSuccess ? (
          <div className="success-message">
            <h3>¡Contraseña restablecida!</h3>
            <p>
              Tu contraseña ha sido restablecida correctamente. 
              Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
            <div className="auth-footer">
              <Link to="/login" className="btn-primary">
                Ir al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          <Formik
            initialValues={{ newPassword: '', confirmPassword: '' }}
            validationSchema={resetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="auth-form">
                {errors.general && (
                  <div className="form-error-message">{errors.general}</div>
                )}

                <div className="form-group">
                  <label htmlFor="newPassword">Nueva contraseña</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <Field
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      id="newPassword"
                      placeholder="Ingresa tu nueva contraseña"
                      className={`form-control ${
                        errors.newPassword && touched.newPassword ? 'is-invalid' : ''
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
                  <ErrorMessage name="newPassword" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar contraseña</label>
                  <div className="input-with-icon">
                    <FaLock className="input-icon" />
                    <Field
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      id="confirmPassword"
                      placeholder="Confirma tu nueva contraseña"
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

                <button
                  type="submit"
                  className="btn-primary btn-block"
                  disabled={isSubmitting || isLoading}
                >
                  {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
                </button>

                <div className="auth-footer">
                  <p>
                    <Link to="/login" className="auth-link">
                      Volver al inicio de sesión
                    </Link>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 