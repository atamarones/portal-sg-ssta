import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Perfil de Usuario</h1>
      <p>Nombre: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Rol: {user.role}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
};

export default Profile;
