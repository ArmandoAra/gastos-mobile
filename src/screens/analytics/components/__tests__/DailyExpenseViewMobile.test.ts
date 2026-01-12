import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DailyExpenseViewMobile from '../DailyExpenseView';
import { useDailyExpenseLogic } from '../../hooks/useDailyExpenseLogic';

// ==========================================
// 1. MOCK GLOBAL DE i18next
// ==========================================
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      // Si pasamos un string como segundo argumento (valor por defecto), lo devolvemos
      // Ejemplo: t('common.close', 'Close') -> devuelve 'Close'
      if (typeof options === 'string') return options;
      return key;
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// ==========================================
// 2. MOCKS DE DEPENDENCIAS
// ==========================================

jest.mock('../../hooks/useDailyExpenseLogic');

jest.mock('react-native-gifted-charts', () => ({
  PieChart: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'PieChart');
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  return {
    ...Reanimated,
    FadeIn: { duration: jest.fn(() => ({})) },
    FadeInRight: { duration: jest.fn(() => ({})) },
    ZoomIn: { delay: jest.fn(() => ({})) },
  };
});

jest.mock('../subcomponents/EmptyState', () => ({
  EmptyState: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'EmptyStateComponent');
  }
}));

// ==========================================
// 3. DATOS BASE (Fixtures)
// ==========================================

const mockStats = {
  totalExpenses: 500,
  totalIncome: 1000,
  balance: 500,
  expenseCount: 5,
  incomeCount: 1,
  topCategory: { category: 'food', amount: 200 },
  largestTransaction: { category_name: 'food', amount: -200 },
  categoryTotals: { food: 200 },
  expensesList: []
};

const mockPieData = [
  { value: 200, color: '#f00', text: 'food', onPress: jest.fn() }
];

const defaultHookValues = {
  t: (key: string, val?: string) => val || key,
  colors: {
    surface: '#fff',
    text: '#000',
    expense: '#f00',
    income: '#0f0',
    border: '#ccc',
    textSecondary: '#666',
  },
  currencySymbol: '$',
  isSmallScreen: false,
  filteredTransactions: [{ id: '1', amount: -100 }],
  dateInfo: { isWeekend: false, dayOfWeek: 'Monday' },
  stats: mockStats,
  pieData: mockPieData,
  modalVisible: false,
  modalData: null,
  selectedCategory: null,
  currentPeriod: 'day',
  setCurrentPeriod: jest.fn(),
  handleCategorySelect: jest.fn(),
  handleCloseModal: jest.fn(),
};

describe('DailyExpenseViewMobile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useDailyExpenseLogic as jest.Mock).mockReturnValue(defaultHookValues);
  });

  // ==========================================
  // SCENARIO 1: ESTADO CON DATOS (Happy Path)
  // ==========================================
  
  it('renderiza correctamente las tarjetas de estadísticas', () => {
    const { getByText } = render(React.createElement(DailyExpenseViewMobile));

    expect(getByText('common.expenses')).toBeTruthy();
    expect(getByText('-$ 500')).toBeTruthy(); 
    expect(getByText('common.incomes')).toBeTruthy();
    expect(getByText('$ 1000')).toBeTruthy(); 
    expect(getByText('common.balance')).toBeTruthy();
    expect(getByText('+$ 500')).toBeTruthy(); 
  });

  it('renderiza el gráfico y la lista de categorías cuando hay datos', () => {
    // CORRECCIÓN AQUÍ: Usamos getAllByText
    const { getByText, getAllByText } = render(React.createElement(DailyExpenseViewMobile));

    expect(getByText('PieChart')).toBeTruthy();
    
    // "food" aparece en 'Top Category' y en la lista de abajo.
    // getAllByText retorna un array, verificamos que tenga longitud >= 1
    expect(getAllByText('food').length).toBeGreaterThanOrEqual(1); 
    
    expect(getByText('40.0%')).toBeTruthy(); 
    expect(getByText('$ 200.00')).toBeTruthy();
  });

  // ==========================================
  // SCENARIO 2: ESTADO VACÍO
  // ==========================================

  it('muestra EmptyState cuando no hay transacciones', () => {
    (useDailyExpenseLogic as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      filteredTransactions: [], 
      stats: { ...mockStats, totalExpenses: 0 },
      pieData: []
    });

    const { getByText, queryByText } = render(React.createElement(DailyExpenseViewMobile));

    expect(getByText('EmptyStateComponent')).toBeTruthy();
    expect(queryByText('PieChart')).toBeNull();
  });

  // ==========================================
  // SCENARIO 3: INTERACCIÓN CON CATEGORÍA
  // ==========================================

  it('llama a handleCategorySelect al presionar una categoría', () => {
    const { getByLabelText } = render(React.createElement(DailyExpenseViewMobile));
    
    // Buscamos por accessibilityLabel usando regex para ser específicos
    const categoryButton = getByLabelText(/food, \$ 200.00/i);
    
    fireEvent.press(categoryButton);
    
    expect(defaultHookValues.handleCategorySelect).toHaveBeenCalledWith(
      'food', 
      200, 
      '#f00'
    );
  });

  // ==========================================
  // SCENARIO 4: MODAL DE DETALLES
  // ==========================================

  it('muestra el modal y las transacciones cuando modalVisible es true', () => {
    (useDailyExpenseLogic as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      modalVisible: true,
      modalData: {
        categoryName: 'food',
        totalAmount: 50,
        color: '#f00',
        transactions: [
          {
            id: 'tx1',
            description: 'Hamburguesa',
            amount: -50,
            date: '2025-01-01T12:00:00'
          }
        ]
      }
    });

    const { getByText, getAllByText, getByLabelText } = render(React.createElement(DailyExpenseViewMobile));

    expect(getByText('overviews.totalSpent')).toBeTruthy();
    
    // CORRECCIÓN: Usamos getAllByText porque el monto aparece en header y lista
    expect(getAllByText('-$ 50.00').length).toBeGreaterThanOrEqual(1);

    expect(getByText('Hamburguesa')).toBeTruthy();
    
    // Buscamos el botón cerrar por su label (mockeado retorna 'Close')
    const closeButton = getByLabelText('Close');
    expect(closeButton).toBeTruthy();
    
    fireEvent.press(closeButton);
    expect(defaultHookValues.handleCloseModal).toHaveBeenCalled();
  });

  // ==========================================
  // SCENARIO 5: INSIGHTS
  // ==========================================
  
  it('renderiza tarjetas de Insights si hay alertas (ej. Déficit)', () => {
     (useDailyExpenseLogic as jest.Mock).mockReturnValue({
      ...defaultHookValues,
      filteredTransactions: [{id: '1', amount: -100}],
      stats: {
          ...mockStats,
          balance: -100, 
          largestTransaction: null 
      }
    });

    const { getByText } = render(React.createElement(DailyExpenseViewMobile));
    
    expect(getByText('overviews.insights')).toBeTruthy();
    expect(getByText('overviews.deficitAlert')).toBeTruthy();
  });
});