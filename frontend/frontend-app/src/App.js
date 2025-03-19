import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ConfigPanel from './pages/admin/ConfigPanel';
import SecurityTestPanel from './pages/admin/SecurityTestPanel';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Rutas públicas */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="login/callback" element={<Login />} />

            {/* Rutas protegidas */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Rutas para administradores */}
            <Route path="admin">
              <Route path="config" element={
                <AdminRoute>
                  <ConfigPanel />
                </AdminRoute>
              } />
              <Route path="security-test" element={
                <AdminRoute>
                  <SecurityTestPanel />
                </AdminRoute>
              } />
            </Route>

            {/* Ruta para manejar 404 */}
            <Route path="*" element={
              <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>404 - Página no encontrada</h1>
                <p>Lo sentimos, la página que buscas no existe.</p>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
