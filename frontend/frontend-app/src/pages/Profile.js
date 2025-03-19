import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaEdit, FaSave } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import '../styles/profile.css';

const profileSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: Yup.string()
    .required('El apellido es obligatorio')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: Yup.string()
    .email('Correo electrónico inválido')
    .required('El correo electrónico es obligatorio'),
});

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('La contraseña actual es obligatoria'),
  newPassword: Yup.string()
    .required('La nueva contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Las contraseñas deben coincidir')
    .required('La confirmación de contraseña es obligatoria'),
});

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleUpdateProfile = async (values, { setSubmitting, setErrors }) => {
    try {
      await updateProfile(values);
      setIsEditing(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar perfil';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (values, { setSubmitting, setErrors, resetForm }) => {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Cargando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">No se pudo cargar el perfil. Por favor, inicia sesión nuevamente.</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Mi perfil</h1>
        <p>Administra tu información personal y contraseña</p>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`} 
          onClick={() => setActiveTab('profile')}
        >
          Información personal
        </button>
        <button 
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`} 
          onClick={() => setActiveTab('security')}
        >
          Seguridad
        </button>
      </div>
      
      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Información personal</h2>
              {!isEditing && (
                <button className="btn-icon" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Editar
                </button>
              )}
            </div>

            <Formik
              initialValues={{
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
              }}
              validationSchema={profileSchema}
              onSubmit={handleUpdateProfile}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="profile-form">
                  {errors.general && (
                    <div className="form-error-message">{errors.general}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="firstName">Nombre</label>
                    <div className="input-with-icon">
                      <FaUser className="input-icon" />
                      <Field
                        type="text"
                        name="firstName"
                        id="firstName"
                        disabled={!isEditing}
                        className={`form-control ${errors.firstName && touched.firstName ? 'is-invalid' : ''}`}
                      />
                    </div>
                    <ErrorMessage name="firstName" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Apellido</label>
                    <div className="input-with-icon">
                      <FaUser className="input-icon" />
                      <Field
                        type="text"
                        name="lastName"
                        id="lastName"
                        disabled={!isEditing}
                        className={`form-control ${errors.lastName && touched.lastName ? 'is-invalid' : ''}`}
                      />
                    </div>
                    <ErrorMessage name="lastName" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Correo electrónico</label>
                    <div className="input-with-icon">
                      <FaEnvelope className="input-icon" />
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        disabled={!isEditing}
                        className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label>Rol</label>
                    <div className="input-with-icon">
                      <Field
                        type="text"
                        value={user.role}
                        disabled
                        className="form-control"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="form-buttons">
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                      >
                        <FaSave /> {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Cambiar contraseña</h2>
            </div>

            <Formik
              initialValues={{
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              }}
              validationSchema={passwordSchema}
              onSubmit={handleChangePassword}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="profile-form">
                  {errors.general && (
                    <div className="form-error-message">{errors.general}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="currentPassword">Contraseña actual</label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <Field
                        type={showPassword.current ? 'text' : 'password'}
                        name="currentPassword"
                        id="currentPassword"
                        className={`form-control ${
                          errors.currentPassword && touched.currentPassword ? 'is-invalid' : ''
                        }`}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <ErrorMessage name="currentPassword" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">Nueva contraseña</label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <Field
                        type={showPassword.new ? 'text' : 'password'}
                        name="newPassword"
                        id="newPassword"
                        className={`form-control ${
                          errors.newPassword && touched.newPassword ? 'is-invalid' : ''
                        }`}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <ErrorMessage name="newPassword" component="div" className="error-message" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                    <div className="input-with-icon">
                      <FaLock className="input-icon" />
                      <Field
                        type={showPassword.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        id="confirmPassword"
                        className={`form-control ${
                          errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''
                        }`}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="error-message" />
                  </div>

                  <div className="form-buttons">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Cambiando contraseña...' : 'Cambiar contraseña'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 