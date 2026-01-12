import '@testing-library/jest-native/extend-expect';

// Mock de AsyncStorage para Zustand persist
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock de Reanimated (si lo usas en UI)
global.ReanimatedDataProxy = (n) => n;

// 1. Mock de MMKV (Vital para tu store)
jest.mock('react-native-mmkv', () => {
  return {
    createMMKV: jest.fn(() => ({
      set: jest.fn(),
      getString: jest.fn(),
      getNumber: jest.fn(),
      getBoolean: jest.fn(),
      delete: jest.fn(),
      getAllKeys: jest.fn(),
      clearAll: jest.fn(),
    })),
  };
});

// 2. Mock de UUID (Para que los IDs no sean aleatorios en los tests)
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-id-123'),
}));

// Mock del Store de Zustand
// jest.mock('./src/stores/useDataStore', () => ({
//   __esModule: true,
//   default: jest.fn(),
// }));



// 1. Mock de FlashList (Jest no renderiza listas virtualizadas complejas)
jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    FlashList: ({ data, renderItem, ListEmptyComponent }) => {
      if (data.length === 0) return ListEmptyComponent;
      return (
        <View testID="flash-list-mock">
          {data.map((item, index) => (
            <View key={index}>
              {renderItem({ item, index })}
            </View>
          ))}
        </View>
      );
    },
  };
});

// 2. Mock de Iconos
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
}));

// 3. Mock de Componentes Hijos complejos (Opcional pero recomendado para aislar)
jest.mock('./src/screens/transactions/components/FilterFloatingButton', () => 'FilterFloatingButton');
jest.mock('./src/screens/transactions/components/TransactionItem', () => ({
  TransactionItemMobile: ({ transaction, onDelete }) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={() => onDelete(transaction.id)} testID={`tx-item-${transaction.id}`}>
        <Text>{transaction.description}</Text>
      </TouchableOpacity>
    );
  }
}));

/// === SOLUCIÓN GESTURE HANDLER CORREGIDA ===
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    
    // --- CAMBIO AQUÍ ---
    // Simplemente asignamos View directamente. 
    // React Native sabe cómo renderizar una View con children.
    GestureHandlerRootView: View, 
    // -------------------

    RNGestureHandlerModule: {
      attachGestureHandler: jest.fn(),
      createGestureHandler: jest.fn(),
      dropGestureHandler: jest.fn(),
      updateGestureHandler: jest.fn(),
      State: {},
      Directions: {},
    },
  };
});