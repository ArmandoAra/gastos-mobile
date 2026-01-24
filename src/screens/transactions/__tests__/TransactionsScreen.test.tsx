import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Importamos el componente
import { TransactionsScreen } from '../TransactionsListScreen'; // Asegúrate que la ruta sea correcta

// Importamos los stores
import useDataStore from '../../../stores/useDataStore';
import useDateStore from '../../../stores/useDateStore';

// ==========================================
// 1. MOCKS (INLINE PARA EVITAR ERRORES DE HOISTING)
// ==========================================

// 1. Safe Area Context: Soluciona "No safe area value available" y "TypeError"
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaView: jest.fn(({ children }) => children),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 0, height: 0 })),
  };
});

// 2. FlashList: Soluciona que no encuentre el texto cuando la lista está vacía
jest.mock("@shopify/flash-list", () => {
  const { View } = require("react-native");
  return {
    FlashList: ({ data, renderItem, ListEmptyComponent }: any) => {
      // Si el array es vacío, renderizamos explícitamente el componente vacío
      if (!data || data.length === 0) {
        return <View testID="flash-list-empty">{ListEmptyComponent}</View>;
      }
      // Si hay datos, renderizamos los items
      return (
        <View testID="flash-list-content">
          {data.map((item: any, index: number) => (
            <View key={index}>{renderItem({ item, index })}</View>
          ))}
        </View>
      );
    },
  };
});

// 3. UI Helpers
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// 4. Stores
jest.mock('../../../stores/settingsStore', () => ({
  useSettingsStore: () => ({
    theme: 'light',
    language: 'es',
    isAddOptionsOpen: false,
    setIsAddOptionsOpen: jest.fn()
  }),
}));

jest.mock('../../../stores/useDataStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../stores/useDateStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// 5. Componentes Hijos (Opcional pero recomendado para aislar el test)
// Esto evita errores si TransactionForm tiene lógica compleja interna
jest.mock('../../../components/forms/TransactionForm.tsx', () => 'TransactionForm');
jest.mock('../../../components/buttons/AddTransactionsButton.tsx', () => 'AddTransactionsButton');


// ==========================================
// 2. DATOS DE PRUEBA
// ==========================================

const TEST_DATE = new Date('2023-10-15T12:00:00Z');
const DIFFERENT_DATE = new Date('2023-11-01T12:00:00Z');

const mockTransactions = [
  {
    id: '1',
    description: 'Supermercado Octubre',
    amount: -50,
    type: 'expense',
    date: '2023-10-15T10:00:00Z', 
    category_icon_name: 'Comida',
    slug_category_name: ['Comida'],
    account_id: 'acc1'
  },
  {
    id: '2',
    description: 'Netflix Noviembre',
    amount: -15,
    type: 'expense',
    date: '2023-11-01T10:00:00Z',
    category_icon_name: 'Ocio',
    slug_category_name: ['Ocio'],
    account_id: 'acc1'
  }
];

const defaultStoreValues = {
  transactions: mockTransactions,
  allAccounts: [], 
  selectedAccount: '',
  setSelectedAccount: jest.fn(),
  deleteTransaction: jest.fn(),
  deleteSomeAmountInAccount: jest.fn(),
  updateTransaction: jest.fn(),
  updateAccountBalance: jest.fn(),
  getUserTransactions: jest.fn(() => mockTransactions),
  getTransactionsByAccount: jest.fn(() => mockTransactions),
  getAccountNameById: jest.fn(() => 'Cuenta Mock'),
};

// ==========================================
// 3. TESTS
// ==========================================

describe('<TransactionsScreen />', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    // Mockeamos el Data Store con datos por defecto
    (useDataStore as unknown as jest.Mock).mockReturnValue(defaultStoreValues);

    // Mockeamos el Date Store en Octubre
    (useDateStore as unknown as jest.Mock).mockReturnValue({
      localSelectedDay: TEST_DATE, 
      selectedYear: 2023,
      selectedMonth: 10,
    });
  });

  // Test 1: Renderizado básico con filtrado por fecha
  it('debe renderizar solo las transacciones del mes seleccionado (Octubre)', () => {
    render(<TransactionsScreen />);

    expect(screen.getByText('Supermercado Octubre')).toBeTruthy();
    // Netflix es de Noviembre, no debería aparecer
    expect(screen.queryByText('Netflix Noviembre')).toBeNull();
  });

  // Test 2: Cambio de fecha
  it('debe actualizar la lista si cambia la fecha seleccionada en el store', () => {
    // Cambiamos el store a Noviembre
    (useDateStore as unknown as jest.Mock).mockReturnValue({
      localSelectedDay: DIFFERENT_DATE,
    });

    render(<TransactionsScreen />);

    expect(screen.queryByText('Supermercado Octubre')).toBeNull();
    expect(screen.getByText('Netflix Noviembre')).toBeTruthy();
  });

  // Test 3: Buscador
  it('debe filtrar transacciones usando el buscador (Search)', () => {
    render(<TransactionsScreen />);

    // El placeholder contiene "transactions.searchPlaceholder" debido al mock de t()
    const searchInput = screen.getByPlaceholderText(/transactions.searchPlaceholder/i);

    // Escribimos algo que no existe
    fireEvent.changeText(searchInput, 'Gimnasio');
    expect(screen.queryByText('Supermercado Octubre')).toBeNull();

    // Escribimos algo que existe
    fireEvent.changeText(searchInput, 'Super');
    expect(screen.getByText('Supermercado Octubre')).toBeTruthy();
  });

  // Test 4: Lista Vacía (El que te fallaba)
  it('debe mostrar el mensaje de "No encontrado" si la lista está vacía', () => {
    // Simulamos que el store devuelve array vacío
    (useDataStore as unknown as jest.Mock).mockReturnValue({
      ...defaultStoreValues,
      transactions: [],
      getUserTransactions: jest.fn(() => []), // Retorno vacío
    });

    render(<TransactionsScreen />);

    // Gracias al mock de FlashList, esto ahora funcionará
    expect(screen.getByText(/transactions.notFound/i)).toBeTruthy();
  });
});