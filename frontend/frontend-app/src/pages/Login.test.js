import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestWrapper } from '../test/mockProviders';
import Login from './Login';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setupTest, adminUserMock } from '../test/mockData';

// Mock de axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

// Import axios para acceder a los mocks
import axios from 'axios';

// Mock de la función de navegación
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('Login', () => {
  let mocks;
  
  beforeEach(() => {
    mocks = setupTest();
    mockNavigate.mockReset();
    vi.mocked(axios.post).mockReset();
  });

  it('renderiza el formulario de login correctamente', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra error con credenciales inválidas', async () => {
    // Mock de respuesta fallida
    vi.mocked(axios.post).mockRejectedValueOnce({
      response: {
        data: { message: 'Credenciales inválidas' }
      }
    });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    // Rellenar el formulario
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'usuario@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'contraseña123' }
    });

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Esperar que se muestre un mensaje de error
    await waitFor(() => {
      expect(mocks.toast.error).toHaveBeenCalled();
    });
  });

  it('maneja el login exitoso correctamente', async () => {
    // Mock de respuesta exitosa
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        token: 'mock.jwt.token',
        user: adminUserMock
      }
    });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    // Rellenar el formulario
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@test.com' }
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'admin123' }
    });

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Verificar redirección
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(mocks.toast.success).toHaveBeenCalled();
    });
  });
}); 