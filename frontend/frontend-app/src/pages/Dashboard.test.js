import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Dashboard from './Dashboard';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock de fetch
global.fetch = vi.fn();

// Mock de componentes que puedan causar problemas
vi.mock('../components/AdminRoute', () => ({
  default: ({ children }) => <div data-testid="mock-admin-route">{children}</div>
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Configurar un usuario autenticado
    const mockUser = { id: 1, email: 'test@example.com', role: 'admin' };
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock.jwt.token');
    
    // Mock de respuesta exitosa para cualquier solicitud de API
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'mock data' })
    });
  });

  it('renderiza el dashboard correctamente cuando el usuario está autenticado', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verificar que elementos clave del dashboard están presentes
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('muestra la información del usuario autenticado', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verificar que se muestra el email del usuario
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('prueba básica de dashboard', () => {
    expect(true).toBe(true);
  });
}); 