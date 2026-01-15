import { renderHook, act } from '@testing-library/react-native';
import { useDailyExpenseLogic } from '../useDailyExpenseLogic';

// Mocks de Stores
import useDataStore from '../../../../stores/useDataStore';
import useDateStore from '../../../../stores/useDateStore';
import { useSettingsStore } from '../../../../stores/settingsStore';
import { useAuthStore } from '../../../../stores/authStore';
import { TransactionType } from '../../../../types/schemas';
import { Transaction } from '../../../../interfaces/data.interface';

// ==========================================
// 1. CONFIGURACIÓN DE MOCKS
// ==========================================

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((objs) => objs.ios || objs.default),
    },
    AccessibilityInfo: {
      announceForAccessibility: jest.fn(),
    },
    Dimensions: {
      get: jest.fn().mockReturnValue({ width: 390, height: 844 }),
    },
    PixelRatio: {
      get: jest.fn(() => 1),
      getFontScale: jest.fn(() => 1),
    },
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

jest.mock('../../../../stores/useDataStore', () => ({ // Nota: Quité la extensión .ts que a veces da problemas en mocks
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../../../stores/useDateStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../../../stores/settingsStore', () => ({
  useSettingsStore: jest.fn(),
}));
jest.mock('../../../../stores/authStore', () => ({
  useAuthStore: jest.fn(),
}));

// ==========================================
// 2. DATOS DE PRUEBA
// ==========================================

// ESTRATEGIA: Usamos Viernes 10 de Enero de 2025
// - Día: Debe mostrar solo Netflix.
// - Semana (Ene 5 - 11): Debe mostrar Salary, Pets, Netflix.
// - Mes: Debe mostrar Todo.
const FIXED_DATE = new Date('2025-01-10T12:00:00'); 

const mockTransactions: Transaction[] = [
    {
        id: "tx-01",
        account_id: "acc-001",
        user_id: "user-123",
        description: "Compra en el Súper",
        amount: 85.50,
        type: TransactionType.EXPENSE,
    category_icon_name: "Food",
        date: "2025-01-01T10:30:00", 
        created_at: "", updated_at: ""
    },
    {
        id: "tx-02",
        account_id: "acc-001",
        user_id: "user-123",
        description: "Pago de Nómina",
        amount: 2500.00,
        type: TransactionType.INCOME,
      category_icon_name: "Salary",
        date: "2025-01-05T09:00:00", 
        created_at: "", updated_at: ""
    },
    {
        id: "tx-03",
        account_id: "acc-002",
        user_id: "user-123",
        description: "Veterinario - Vacunas",
        amount: 45.00,
        type: TransactionType.EXPENSE,
      category_icon_name: "Pets",
        date: "2025-01-07T16:20:00", 
        created_at: "", updated_at: ""
    },
    {
        id: "tx-04", // Esta es la del día seleccionado (10 Ene)
        account_id: "acc-001",
        user_id: "user-123",
        description: "Suscripción Netflix",
        amount: 15.99,
        type: TransactionType.EXPENSE,
      category_icon_name: "Entertainment",
        date: "2025-01-10T00:05:00", 
        created_at: "", updated_at: ""
    },
    {
        id: "tx-05",
        account_id: "acc-002",
        user_id: "user-123",
        description: "Gasolina",
        amount: 60.00,
        type: TransactionType.EXPENSE,
      category_icon_name: "Transport",
        date: "2025-01-12T13:40:45", 
        created_at: "", updated_at: ""
    }
];

describe('useDailyExpenseLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useDateStore as unknown as jest.Mock).mockReturnValue({
      localSelectedDay: FIXED_DATE,
    });

    (useDataStore as unknown as jest.Mock).mockReturnValue({
      transactions: mockTransactions,
    });

    (useSettingsStore as unknown as jest.Mock).mockReturnValue({
      theme: 'light',
      language: 'es',
    });

    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      currencySymbol: '$',
    });
  });

  // ==========================================
  // TESTS
  // ==========================================

  it('debe inicializarse con el periodo "day" por defecto', () => {
    const { result } = renderHook(() => useDailyExpenseLogic());
    expect(result.current.currentPeriod).toBe('day');
  });

  it('debe filtrar transacciones correctamente para el periodo "DAY" (10 Ene)', () => {
    const { result } = renderHook(() => useDailyExpenseLogic());

    // El 10 de Enero solo hay "Netflix"
    expect(result.current.filteredTransactions).toHaveLength(1);
    expect(result.current.filteredTransactions[0].description).toBe("Suscripción Netflix");
  });

  it('debe filtrar transacciones correctamente para el periodo "WEEK" (5 Ene - 11 Ene)', () => {
    const { result } = renderHook(() => useDailyExpenseLogic());

    act(() => {
      result.current.setCurrentPeriod('week');
    });

    // Debe incluir: Salary (5), Pets (7), Netflix (10).
    // Excluye: Food (1) y Gasolina (12)
    expect(result.current.filteredTransactions).toHaveLength(3);
    
    const ids = result.current.filteredTransactions.map(t => t.id);
    expect(ids).toContain('tx-02');
    expect(ids).toContain('tx-03');
    expect(ids).toContain('tx-04');
  });

  it('debe filtrar transacciones correctamente para el periodo "MONTH" (Enero)', () => {
    const { result } = renderHook(() => useDailyExpenseLogic());

    act(() => {
      result.current.setCurrentPeriod('month');
    });

    // Todas son de Enero
    expect(result.current.filteredTransactions).toHaveLength(5);
  });

  it('debe calcular estadísticas correctas para el MES', () => {
    const { result } = renderHook(() => useDailyExpenseLogic());

    // Cambiamos a 'month' para probar la suma total
    act(() => {
        result.current.setCurrentPeriod('month');
    });

    // Cálculos manuales:
    // Income: 2500
    // Expenses: 85.50 + 45.00 + 15.99 + 60.00 = 206.49
    // Balance: 2500 - 206.49 = 2293.51
    // Conteo Gastos: 4 (Super, Vet, Netflix, Gasolina)
    
    expect(result.current.stats.totalIncome).toBe(2500);
    expect(result.current.stats.totalExpenses).toBeCloseTo(206.49);
    expect(result.current.stats.balance).toBeCloseTo(2293.51);
    expect(result.current.stats.expenseCount).toBe(4);
  });

  it('debe identificar la categoría principal (Top Category) en el MES', () => {
    const { result } = renderHook(() => useDailyExpenseLogic());

    act(() => {
        result.current.setCurrentPeriod('month');
    });

    // Gastos por categoría:
    // Food: 85.50 (GANADOR)
    // Transport: 60.00
    // Pets: 45.00
    // Entertainment: 15.99
    
    expect(result.current.stats.topCategory.category).toBe('Food');
    expect(result.current.stats.topCategory.amount).toBe(85.50);
  });

  it('debe generar datos correctos para el gráfico (PieData) en el DIA', () => {
    const { result } = renderHook(() => useDailyExpenseLogic());
    
    // Default es 'day' (Netflix)
    // Solo 1 gasto -> Entertainment
    
    const pieData = result.current.pieData;
    expect(pieData).toHaveLength(1);
    expect(pieData[0].text).toBe('Entertainment');
    expect(pieData[0].value).toBe(15.99);
  });

  it('debe manejar la apertura y cierre del Modal de categoría', () => {
    const { result } = renderHook(() => useDailyExpenseLogic());

    // Estado inicial
    expect(result.current.modalVisible).toBe(false);

    // Abrir modal con "Entertainment" (Netflix)
    act(() => {
      result.current.handleCategorySelect('Entertainment', 15.99, '#FF0000');
    });

    expect(result.current.modalVisible).toBe(true);
    expect(result.current.selectedCategory).toBe('Entertainment');
    // Como estamos en vista 'day' (defecto), debe haber 1 transacción
    expect(result.current.modalData?.transactions).toHaveLength(1);
    expect(result.current.modalData?.transactions[0].description).toBe("Suscripción Netflix");

    // Cerrar modal
    act(() => {
      result.current.handleCloseModal();
    });

    expect(result.current.modalVisible).toBe(false);
    expect(result.current.selectedCategory).toBeNull();
  });
});