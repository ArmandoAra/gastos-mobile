import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Importamos los stores
import useDataStore from '../../../stores/useDataStore';
import useDateStore from '../../../stores/useDateStore';
import { TransactionsScreen } from '../TransactionsListScreen';

// ==========================================
// 1. MOCKS
// ==========================================

// Mock de Dependencias Nativas / UI
jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ data, renderItem, ListEmptyComponent }: any) => {
    if (!data || data.length === 0) return ListEmptyComponent;

    const { View } = require('react-native');
    return (
      <View testID="flash-list-mock">
        {data.map((item: any, index: number) => (
          <View key={index}>
            {renderItem({ item, index })}
          </View>
        ))}
      </View>
    );
  },
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../../stores/settingsStore', () => ({
  useSettingsStore: () => ({ theme: 'light', language: 'es' }),
}));

jest.mock('../../../stores/useDataStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../stores/useDateStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

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
    slug_category_name: ['Comida'], // Asegúrate de tener esto si tu componente lo usa
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

// Objeto Base del Mock (Completo)
const defaultStoreValues = {
  transactions: mockTransactions,
  allAccounts: [], 
  selectedAccount: '',
  setSelectedAccount: jest.fn(),
  deleteTransaction: jest.fn(),
  deleteSomeAmountInAccount: jest.fn(),
  updateTransaction: jest.fn(),
  updateAccountBalance: jest.fn(),

  // ✅ FUNCIONES CLAVE QUE FALTABAN O SE SOBREESCRIBÍAN
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

    // ✅ CORRECCIÓN PRINCIPAL: Solo llamamos una vez a mockReturnValue
    // Usamos el objeto defaultStoreValues que YA tiene getUserTransactions
    (useDataStore as unknown as jest.Mock).mockReturnValue(defaultStoreValues);

    // Configuración del DateStore
    (useDateStore as unknown as jest.Mock).mockReturnValue({
      localSelectedDay: TEST_DATE, 
      selectedYear: 2023,
      selectedMonth: 10,
    });
  });

  it('debe renderizar solo las transacciones del mes seleccionado (Octubre)', () => {
    render(<TransactionsScreen />);
    expect(screen.getByText('Supermercado Octubre')).toBeTruthy();
    expect(screen.queryByText('Netflix Noviembre')).toBeNull();
  });

  it('debe actualizar la lista si cambia la fecha seleccionada en el store', () => {
    (useDateStore as unknown as jest.Mock).mockReturnValue({
      localSelectedDay: DIFFERENT_DATE,
    });

    render(<TransactionsScreen />);

    expect(screen.queryByText('Supermercado Octubre')).toBeNull();
    expect(screen.getByText('Netflix Noviembre')).toBeTruthy();
  });

  it('debe filtrar transacciones usando el buscador (Search)', () => {
    render(<TransactionsScreen />);
    const searchInput = screen.getByPlaceholderText(/transactions.searchPlaceholder/i);

    fireEvent.changeText(searchInput, 'Gimnasio');
    expect(screen.queryByText('Supermercado Octubre')).toBeNull();

    fireEvent.changeText(searchInput, 'Super');
    expect(screen.getByText('Supermercado Octubre')).toBeTruthy();
  });

  it('debe mostrar el mensaje de "No encontrado" si la lista está vacía', () => {
    // Simulamos store vacío
    (useDataStore as unknown as jest.Mock).mockReturnValue({
      ...defaultStoreValues,
      transactions: [],

      getUserTransactions: jest.fn(() => []),
      getTransactionsByAccount: jest.fn(() => []),
    });

    render(<TransactionsScreen />);

    expect(screen.getByText(/transactions.notFound/i)).toBeTruthy();
  });
});