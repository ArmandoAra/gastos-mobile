import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
// Ajusta la ruta a tu pantalla real

// Importamos los stores para poder tipar los mocks
import useDataStore from '../../../stores/useDataStore';
import useDateStore from '../../../stores/useDateStore';
import { TransactionsScreen } from '../TransactionsListScreen';



// ==========================================
// 1. MOCKS (Definidos aquí, localmente)
// ==========================================

// Mock de Dependencias Nativas / UI
jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ data, renderItem, ListEmptyComponent }: any) => {
    // Si no hay datos, mostramos el componente vacío
    if (!data || data.length === 0) return ListEmptyComponent;
    
    // Si hay datos, renderizamos una View simple (FlashList es muy complejo para Jest)
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

// Mock de i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock de Settings
jest.mock('../../../stores/settingsStore', () => ({
  useSettingsStore: () => ({ theme: 'light', language: 'es' }),
}));

// Mock de useDataStore (Tu store de MMKV)
jest.mock('../../../stores/useDataStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock de useDateStore (Tu nuevo store de fechas)
jest.mock('../../../stores/useDateStore', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// ==========================================
// 2. DATOS DE PRUEBA
// ==========================================

// Fecha "Hoy" para el test: 15 de Octubre 2023
const TEST_DATE = new Date('2023-10-15T12:00:00Z');
// Una fecha diferente: 1 de Noviembre 2023
const DIFFERENT_DATE = new Date('2023-11-01T12:00:00Z');

const mockTransactions = [
  {
    id: '1',
    description: 'Supermercado Octubre',
    amount: -50,
    type: 'expense',
    date: '2023-10-15T10:00:00Z', // Coincide con TEST_DATE
    category_icon_name: 'Comida',
    account_id: 'acc1'
  },
  {
    id: '2',
    description: 'Netflix Noviembre',
    amount: -15,
    type: 'expense',
    date: '2023-11-01T10:00:00Z', // Coincide con DIFFERENT_DATE
    category_icon_name: 'Ocio',
    account_id: 'acc1'
  }
];

const defaultStoreValues = {
  transactions: mockTransactions,
  allAccounts: [], 
  selectedAccount: '',
  setSelectedAccount: jest.fn(),       // <--- ¡Importante!
  deleteTransaction: jest.fn(),
  deleteSomeAmountInAccount: jest.fn(),
  updateTransaction: jest.fn(),
  updateAccountBalance: jest.fn(),
  // ...agrega aquí cualquier otra función que uses
};

// ==========================================
// 3. TESTS
// ==========================================

describe('<TransactionsScreen />', () => {
  const mockDeleteTransaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDataStore as unknown as jest.Mock).mockReturnValue(defaultStoreValues);
    // Configuración por defecto del DataStore
    (useDataStore as unknown as jest.Mock).mockReturnValue({
      transactions: mockTransactions,
      allAccounts: [],
      selectedAccount: "",
      setSelectedAccount: jest.fn(),
      deleteTransaction: mockDeleteTransaction,
      deleteSomeAmountInAccount: jest.fn(),
      updateTransaction: jest.fn(),
      updateAccountBalance: jest.fn(),
    });

    // Configuración por defecto del DateStore (Simulamos que "hoy" es Octubre)
    (useDateStore as unknown as jest.Mock).mockReturnValue({
      localSelectedDay: TEST_DATE, 
      // Añadimos las otras propiedades por si acaso, aunque no se usen en el render
      selectedYear: 2026,
      selectedMonth: 10,
    });
  });

  it('debe renderizar solo las transacciones del mes seleccionado (Octubre)', () => {
    render(<TransactionsScreen />);

    // Octubre debe aparecer
    expect(screen.getByText('Supermercado Octubre')).toBeTruthy();

    // Noviembre NO debe aparecer (porque filtramos por localSelectedDay)
    expect(screen.queryByText('Netflix Noviembre')).toBeNull();
  });

  it('debe actualizar la lista si cambia la fecha seleccionada en el store', () => {
    // CAMBIO DE ESCENARIO: Simulamos que el usuario cambió la fecha a Noviembre
    (useDateStore as unknown as jest.Mock).mockReturnValue({
      localSelectedDay: DIFFERENT_DATE, // Ahora es Noviembre
    });

    // Re-renderizamos con el nuevo valor del mock
    render(<TransactionsScreen />);

    // Ahora Octubre NO debe estar
    expect(screen.queryByText('Supermercado Octubre')).toBeNull();

    // Y Noviembre SÍ debe estar
    expect(screen.getByText('Netflix Noviembre')).toBeTruthy();
  });

  it('debe filtrar transacciones usando el buscador (Search)', () => {
    render(<TransactionsScreen />);

    const searchInput = screen.getByPlaceholderText(/transactions.searchPlaceholder/i);

    // Escribimos algo que no existe
    fireEvent.changeText(searchInput, 'Gimnasio');
    expect(screen.queryByText('Supermercado Octubre')).toBeNull();

    // Escribimos algo que sí existe
    fireEvent.changeText(searchInput, 'Super');
    expect(screen.getByText('Supermercado Octubre')).toBeTruthy();
  });

  it('debe mostrar el mensaje de "No encontrado" si la lista está vacía', () => {
    // Simulamos store vacío
    (useDataStore as unknown as jest.Mock).mockReturnValue({
        ...defaultStoreValues,
      transactions: [],
      deleteTransaction: jest.fn(),
    });

    render(<TransactionsScreen />);

    expect(screen.getByText(/transactions.notFound/i)).toBeTruthy();
  });
});