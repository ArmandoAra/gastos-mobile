import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '../authStore'; // Ajusta la ruta

interface UserProfile {
    id: string;
    name: string;
    email?: string;
    currency: string;
}

// ==========================================
// 1. MOCKS
// ==========================================

// A) Mock de UUID para que el ID del usuario siempre sea el mismo
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'user-id-fixed-123'),
}));

// B) Mock de Utils de Seguridad
// Esto es vital: No queremos correr bcrypt/crypto real en los tests.
jest.mock('../../utils/security', () => ({
  // Simplemente prefijamos "hashed_" para simular encriptación
  hashPin: jest.fn(async (pin: string) => `hashed_${pin}`),
  authenticateBiometric: jest.fn(),
}));

// Importamos los mocks para poder manipularlos en los tests
import { authenticateBiometric } from '../../utils/security';

describe('useAuthStore', () => {
  
  // LIMPIEZA: Estado inicial antes de cada test
  const initialState = useAuthStore.getState();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reseteamos el store manualmente a su estado "fábrica"
    // (Zustand persiste el estado entre tests si no hacemos esto)
    act(() => {
        useAuthStore.setState({
            user: null,
            pinHash: null,
            isSetupComplete: false,
            isAuthenticated: false,
            isBiometricEnabled: false,
            isPinEnabled: false,
            currencySymbol: '$',
        }, false); // false para hacer un merge parcial, no reemplazar todo
    });
  });

  // ==========================================
  // TESTS DE CONFIGURACIÓN (SETUP)
  // ==========================================

  it('debe iniciar con el estado vacío por defecto', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('debe configurar la cuenta correctamente (setupAccount)', async () => {
    const { result } = renderHook(() => useAuthStore());

    // Ejecutamos el setup
    await act(async () => {
      await result.current.setupAccount('Armando', '1234', true);
    });

    // 1. Verificamos que el usuario se creó
    expect(result.current.user).toEqual({
        id: 'user-id-fixed-123', // Gracias al mock de uuid
        name: 'Armando',
        currency: 'USD'
    });

    // 2. Verificamos que el PIN se "hasheó" (usando nuestro mock simple)
    expect(result.current.pinHash).toBe('hashed_1234');
    
    // 3. Verificamos flags
    expect(result.current.isSetupComplete).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isBiometricEnabled).toBe(true);
  });

  // ==========================================
  // TESTS DE LOGIN CON PIN
  // ==========================================

  it('debe permitir LOGIN con el PIN correcto', async () => {
    const { result } = renderHook(() => useAuthStore());

    // 1. Primero configuramos la cuenta
    await act(async () => {
        await result.current.setupAccount('User', '5555', false);
        // Simulamos logout manual para probar el login
        result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);

    // 2. Intentamos loguear con el PIN correcto
    let success;
    await act(async () => {
        success = await result.current.loginWithPin('5555');
    });

    expect(success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('debe bloquear LOGIN con PIN incorrecto', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
        await result.current.setupAccount('User', '9999', false);
        result.current.logout();
    });

    let success;
    await act(async () => {
        // El hash guardado es "hashed_9999", el input generará "hashed_0000"
        success = await result.current.loginWithPin('0000');
    });

    expect(success).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  // ==========================================
  // TESTS DE CAMBIO DE PIN
  // ==========================================

  it('debe cambiar el PIN si el PIN anterior es correcto', async () => {
    const { result } = renderHook(() => useAuthStore());

    // Setup inicial con PIN '1111'
    await act(async () => {
        await result.current.setupAccount('User', '1111', false);
    });

    // Intentamos cambiar a '2222' enviando el '1111' correcto
    let response: { success: boolean; message?: string } | undefined;
    await act(async () => {
        response = await result.current.changePin('1111', '2222');
    });

    expect(response?.success).toBe(true);
    expect(result.current.pinHash).toBe('hashed_2222');
  });

  it('NO debe cambiar el PIN si el PIN anterior es incorrecto', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
        await result.current.setupAccount('User', '1111', false);
    });

    let response: { success: boolean; message?: string } | undefined;
    await act(async () => {
        // Enviamos '9999' como viejo PIN (Incorrecto)
        response = await result.current.changePin('9999', '2222');
    });

    expect(response?.success).toBe(false);
    // El hash debe seguir siendo el del 1111
    expect(result.current.pinHash).toBe('hashed_1111');
  });

  // ==========================================
  // TESTS DE BIOMETRÍA
  // ==========================================

  it('debe permitir LOGIN con Biometría si está habilitada y es exitosa', async () => {
    const { result } = renderHook(() => useAuthStore());

    // 1. Configuramos cuenta con biometría activada
    await act(async () => {
        await result.current.setupAccount('User', '1234', true);
        result.current.logout();
    });

    // 2. Mockeamos que la biometría fue EXITOSA
    (authenticateBiometric as jest.Mock).mockResolvedValue(true);

    let success;
    await act(async () => {
        success = await result.current.loginWithBiometrics();
    });

    expect(success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('NO debe permitir LOGIN con Biometría si está deshabilitada', async () => {
    const { result } = renderHook(() => useAuthStore());

    // 1. Configuramos cuenta con biometría DESACTIVADA (false)
    await act(async () => {
        await result.current.setupAccount('User', '1234', false);
        result.current.logout();
    });

    let success;
    await act(async () => {
        success = await result.current.loginWithBiometrics();
    });

    expect(success).toBe(false);
    // Ni siquiera debió llamar a la función nativa
    expect(authenticateBiometric).not.toHaveBeenCalled();
  });

  // ==========================================
  // TESTS DE GESTIÓN DE USUARIO
  // ==========================================

  it('debe actualizar los datos del usuario', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
        await result.current.setupAccount('Old Name', '0000', false);
    });

    act(() => {
        result.current.updateUser({ name: 'New Name', email: 'test@test.com' });
    });

    expect(result.current.user?.name).toBe('New Name');
    expect(result.current.user?.email).toBe('test@test.com');
  });

  it('debe borrar todo al eliminar usuario (deleteUser)', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
        await result.current.setupAccount('User', '0000', true);
    });

    act(() => {
        result.current.deleteUser();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.pinHash).toBeNull();
    expect(result.current.isSetupComplete).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });
});