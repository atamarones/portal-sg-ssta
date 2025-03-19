import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { FaEnvelope } from 'react-icons/fa';
import api from '../api/api';
import '../styles/auth.css';

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es obligatorio'),
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    setIsLoading(true);
    try {
      await api.post('/auth/password-reset-request', values);
      setEmailSent(true);
      toast.success('Se ha enviado un enlace de recuperación a tu correo electrónico');
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 'Error al solicitar recuperación de contraseña';
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
          <h2>Recuperar contraseña</h2>
          <p>Ingresa tu correo electrónico para recuperar tu contraseña</p>
        </div>

        {emailSent ? (
          <div className="success-message">
            <h3>¡Correo enviado!</h3>
            <p>
              Hemos enviado un enlace de recuperación a tu correo electrónico. 
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <div className="auth-footer">
              <Link to="/login" className="btn-secondary">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          <Formik
            initialValues={{ email: '' }}
            validationSchema={forgotPasswordSchema}
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

                <button
                  type="submit"
                  className="btn-primary btn-block"
                  disabled={isSubmitting || isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
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

export default ForgotPassword; 