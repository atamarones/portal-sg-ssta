import { vi } from 'vitest';

// Mock de localStorage
export const setupLocalStorageMock = () => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = typeof value === 'string' ? value : JSON.stringify(value);
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      getStore: () => store
    };
  })();
  
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  return localStorageMock;
};

// Mock de fetch
export const setupFetchMock = () => {
  global.fetch = vi.fn();
  return global.fetch;
};

// Mock de react-hot-toast
export const setupToastMock = () => {
  const toastMock = {
    error: vi.fn(),
    success: vi.fn(),
    promise: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    custom: vi.fn()
  };
  
  vi.mock('react-hot-toast', () => ({
    toast: toastMock
  }));
  
  return toastMock;
};

// Datos de ejemplo para un usuario administrador
export const adminUserMock = {
  id: 1,
  email: 'admin@test.com',
  role: 'ADMIN'
};

// Datos de ejemplo para un usuario normal
export const regularUserMock = {
  id: 2,
  email: 'usuario@test.com',
  role: 'USER'
};

// Datos de ejemplo para configuración del panel
export const configPanelDataMock = {
  emailEnabled: false,
  emailHost: 'smtp.example.com',
  emailPort: 587,
  emailUser: 'usuario@ejemplo.com',
  emailPassword: '',
  emailSecure: false,
  emailFromAddress: 'no-reply@example.com',
  
  googleAuthEnabled: false,
  googleClientId: '',
  googleClientSecret: '',
  googleCallbackUrl: 'http://localhost:3000/api/auth/google/callback',
  
  appName: 'Portal SG-SSTA (Modo test)',
  appLogo: '',
  primaryColor: '#1976d2',
  allowRegistration: true,
  maintenanceMode: false
};

// Función para configurar mocks para un test específico
export const setupTest = () => {
  const localStorage = setupLocalStorageMock();
  const fetch = setupFetchMock();
  const toast = setupToastMock();
  
  // Función para limpiar todos los mocks
  const cleanup = () => {
    vi.clearAllMocks();
    localStorage.clear();
  };
  
  return {
    localStorage,
    fetch,
    toast,
    cleanup
  };
};

export default {
  setupLocalStorageMock,
  setupFetchMock,
  setupToastMock,
  adminUserMock,
  regularUserMock,
  configPanelDataMock,
  setupTest
}; 