import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestWrapper } from '../../test/mockProviders';
import ConfigPanel from './ConfigPanel';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { setupTest, adminUserMock, configPanelDataMock } from '../../test/mockData';

// Mock de axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}));

// Import axios para acceder a los mocks
import axios from 'axios';

describe('ConfigPanel', () => {
  let mocks;
  
  beforeEach(() => {
    mocks = setupTest();
    // Configurar un usuario administrador
    mocks.localStorage.setItem('user', JSON.stringify(adminUserMock));
    mocks.localStorage.setItem('token', 'mock.jwt.token');
    
    // Resetear axios mocks
    vi.mocked(axios.get).mockReset();
    vi.mocked(axios.post).mockReset();
    vi.mocked(axios.put).mockReset();
  });

  it('muestra datos de ejemplo cuando no hay datos reales', async () => {
    // Simular error de API
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Error de API'));

    render(
      <TestWrapper>
        <ConfigPanel />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/modo offline/i)).toBeInTheDocument();
    });
  });

  it('carga y muestra datos reales correctamente', async () => {
    const mockData = {
      data: configPanelDataMock
    };

    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockData });

    render(
      <TestWrapper>
        <ConfigPanel />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Portal SG-SSTA/i)).toBeInTheDocument();
    });
  });

  it('actualiza la configuración correctamente', async () => {
    // Mock de respuesta exitosa para GET
    vi.mocked(axios.get).mockResolvedValueOnce({ 
      data: configPanelDataMock
    });

    // Mock de respuesta exitosa para PUT
    vi.mocked(axios.put).mockResolvedValueOnce({
      data: {
        message: 'Configuración actualizada',
        config: {
          ...configPanelDataMock,
          appName: 'Nombre Actualizado'
        }
      }
    });

    render(
      <TestWrapper>
        <ConfigPanel />
      </TestWrapper>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText(/Portal SG-SSTA/i)).toBeInTheDocument();
    });

    // Cambiar el valor del nombre de la aplicación
    const nameInput = screen.getByLabelText(/nombre de la aplicación/i);
    fireEvent.change(nameInput, { target: { value: 'Nombre Actualizado' } });

    // Guardar cambios
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    // Verificar que se llamó a la API con los datos correctos
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          appName: 'Nombre Actualizado'
        }),
        expect.any(Object)
      );
      expect(mocks.toast.success).toHaveBeenCalled();
    });
  });

  it('muestra error cuando falla la actualización', async () => {
    // Mock de respuesta exitosa para GET
    vi.mocked(axios.get).mockResolvedValueOnce({ 
      data: configPanelDataMock
    });

    // Mock de respuesta fallida para PUT
    vi.mocked(axios.put).mockRejectedValueOnce({
      response: {
        data: {
          message: 'Error al actualizar'
        }
      }
    });

    render(
      <TestWrapper>
        <ConfigPanel />
      </TestWrapper>
    );

    // Esperar a que se carguen los datos
    await waitFor(() => {
      expect(screen.getByText(/Portal SG-SSTA/i)).toBeInTheDocument();
    });

    // Guardar cambios
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    // Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(mocks.toast.error).toHaveBeenCalled();
    });
  });

  it('muestra el spinner de carga mientras obtiene datos', () => {
    vi.mocked(axios.get).mockImplementation(() => new Promise(() => {})); // Nunca se resuelve

    render(
      <TestWrapper>
        <ConfigPanel />
      </TestWrapper>
    );

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });
}); 