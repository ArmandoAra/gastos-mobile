import { renderHook } from '@testing-library/react-native';
import { useCreditCycleScreen } from './useCreditCycleScreen';
import { useCycleStore } from '../../../stores/useCycleStore';
import useDataStore from '../../../stores/useDataStore';

// Mock de las dependencias de Zustand
jest.mock('../../../stores/useCycleStore');
jest.mock('../../../stores/useDataStore');
jest.mock('../../../stores/settingsStore', () => ({
  useSettingsStore: jest.fn(() => ({ theme: 'dark', language: 'es' }))
}));
jest.mock('../../../stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({ currencySymbol: '$', user: { id: 'user1' } }))
}));

describe('useCreditCycleScreen Hook', () => {
  const mockStartDate = '2023-10-01T00:00:00.000Z';
  const mockEndDate = '2023-10-31T23:59:59.000Z';
  
  const mockActiveCycle = {
    id: 'cycle-1',
    startDate: mockStartDate,
    endDate: mockEndDate,
    baseBudget: 1000,
    fixedExpenses: 200,
    status: 'active',
    rolloverBonus: 0,
    accountId: 'acc-1'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Fijamos la fecha del sistema al 15 de Octubre de 2023 para cálculos deterministas
    jest.useFakeTimers().setSystemTime(new Date('2023-10-15T12:00:00Z').getTime());

    (useCycleStore as unknown as jest.Mock).mockImplementation((selector) => selector({
      selectedCycleAccount: 'acc-1',
      cycles: [mockActiveCycle],
      bucketsByAccount: { 'acc-1': [] },
      bucketTransactions: [],
      getFixedTransactionsByAccount: () => [],
      setSelectedCycleAccount: jest.fn(),
    }));

    (useDataStore as unknown as jest.Mock).mockImplementation((selector) => selector({
      getAccoutTransactionsByCycle: () => [],
      transactions: [],
      allAccounts: [{ id: 'acc-1', name: 'Cuenta Test' }],
      selectedAccount: 'acc-1',
    }));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('debe calcular correctamente los días restantes del ciclo', () => {
    const { result } = renderHook(() => useCreditCycleScreen());
    
    // Del 15 al 31 de Octubre hay 16 días de diferencia
    expect(result.current.remainingDays).toBe(16);
  });

  it('debe calcular correctamente el monto "Seguro para gastar hoy"', () => {
    const { result } = renderHook(() => useCreditCycleScreen());
    
    /**
     * Presupuesto Variable = 1000 - 200 = 800
     * Días Totales (Octubre) = 31
     * Días Transcurridos (del 1 al 15) = 15
     * Gasto esperado diario = 800 / 31 = 25.806
     * Gasto acumulado ideal al día 15 = 25.806 * 15 = 387.09
     * Gasto real = 0
     * Resultado = 387.09
     */
    expect(result.current.safeToSpendToday).toBe(387.1);
  });
});
