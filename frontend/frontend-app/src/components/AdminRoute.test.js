import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import AdminRoute from './AdminRoute';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setupTest, adminUserMock, regularUserMock } from '../test/mockData';

// Mock del componente loading spinner
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

// Mock del componente Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => {
      window.location.pathname = to;
      return null;
    }
  };
});

describe('AdminRoute', () => {
  let mocks;
  
  beforeEach(() => {
    mocks = setupTest();
    // Resetear pathname
    window.location.pathname = '/admin';
  });
  
  it('muestra el contenido cuando el usuario es administrador', async () => {
    // Configurar un usuario administrador
    mocks.localStorage.setItem('user', adminUserMock);
    mocks.localStorage.setItem('token', 'mock.jwt.token');

    render(
      <BrowserRouter>
        <AuthProvider>
          <AdminRoute>
            <div data-testid="contenido-admin">Contenido Admin</div>
          </AdminRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('contenido-admin')).toBeInTheDocument();
    });
  });

  it('redirige a login cuando no hay token', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <AdminRoute>
            <div>Contenido Admin</div>
          </AdminRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('redirige a login cuando el usuario no es administrador', async () => {
    // Configurar un usuario no administrador
    mocks.localStorage.setItem('user', regularUserMock);
    mocks.localStorage.setItem('token', 'mock.jwt.token');

    render(
      <BrowserRouter>
        <AuthProvider>
          <AdminRoute>
            <div>Contenido Admin</div>
          </AdminRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('muestra el spinner de carga mientras verifica', () => {
    mocks.localStorage.setItem('token', 'mock.jwt.token');
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <AdminRoute>
            <div>Contenido Admin</div>
          </AdminRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/verificando permisos/i)).toBeInTheDocument();
  });

  it('maneja errores de API correctamente', async () => {
    // Configurar un usuario administrador
    mocks.localStorage.setItem('user', adminUserMock);
    mocks.localStorage.setItem('token', 'mock.jwt.token');

    // Simular error de API
    mocks.fetch.mockRejectedValueOnce(new Error('Error de API'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <AdminRoute>
            <div data-testid="contenido-admin">Contenido Admin</div>
          </AdminRoute>
        </AuthProvider>
      </BrowserRouter>
    );

    // Debería mostrar el contenido incluso si hay error de API
    await waitFor(() => {
      expect(screen.queryByTestId('contenido-admin')).toBeInTheDocument();
    });
  });
}); 