import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { adminUserMock } from './mockData';
import { vi } from 'vitest';

// Mock del contexto de autenticación
export const AuthContext = React.createContext({
  isAuthenticated: true,
  user: adminUserMock,
  token: 'mock.jwt.token',
  login: () => {},
  logout: () => {},
  loading: false
});

// Mock del proveedor de autenticación
export const MockAuthProvider = ({ children, customValue = {} }) => {
  const defaultValue = {
    isAuthenticated: true,
    user: adminUserMock,
    token: 'mock.jwt.token',
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    ...customValue
  };

  return (
    <AuthContext.Provider value={defaultValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Wrapper que envuelve un componente con los proveedores necesarios
export const TestWrapper = ({ children, authProps = {} }) => {
  return (
    <BrowserRouter>
      <MockAuthProvider customValue={authProps}>
        {children}
      </MockAuthProvider>
    </BrowserRouter>
  );
};

// Mock del useAuth hook
export const mockUseAuth = (customValue = {}) => {
  const defaultValue = {
    isAuthenticated: true,
    user: adminUserMock,
    token: 'mock.jwt.token',
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    ...customValue
  };
  
  vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => defaultValue
  }));
  
  return defaultValue;
};

export default {
  AuthContext,
  MockAuthProvider,
  TestWrapper,
  mockUseAuth
}; 