import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { 
  MD3LightTheme,
  MD3DarkTheme,
  Provider as PaperProvider,
  MD3Theme
} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Imports Locales (Ajusta las rutas según tu proyecto) ---
import './src/i18n';
import { TransactionsScreen } from './src/screens/transactions/TransactionsListScreen';
import { SettingsScreen } from './src/screens/settings/SettingsScreen';
import { PinScreen } from './src/screens/auth/PinScreen';
import { SetupScreen } from './src/screens/auth/SetupScreen';

import { useAuthStore } from './src/stores/authStore';
import { useSettingsStore } from './src/stores/settingsStore';
import { lightTheme, darkTheme } from './src/theme/colors';

// Importamos nuestros tipos y componentes tipados
import {
  RootStackParamList,
  AppStackParamList,
  MainTabParamList,
  ThemeColors
} from './src/types/navigation';
import { CustomTabBar } from './src/components/TabBar/CustomTabBar';
import { ModernHeader } from './src/components/navigation/ModernHeader';
import AnalyticsScreen from './src/screens/analitics/AnalyticsScreen';


// --- Creación de Navigators Tipados ---
const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// ============================================
// MAIN TAB NAVIGATOR
// ============================================
const MainTabs = () => {
  const { theme } = useSettingsStore();

  // Aserción de tipo o fallback seguro
  const currentColors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

  // Fallback si textSecondary no existe en tu tema original
  const safeColors: ThemeColors = {
    ...currentColors,
    textSecondary: currentColors.textSecondary
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} colors={currentColors} />}
      screenOptions={{
        // Aquí decimos: "Usa mi header custom"
        header: ({ options, route }) => {
          // Lógica para decidir qué mostrar según la pantalla
          const isHome = route.name === 'Transactions'; // O 'Home' si tienes una dashboard

          return (
            <ModernHeader
              // Si es la pantalla principal, mostramos Avatar y saludo. Si no, título normal.
              title={options.title}
              subtitle={isHome ? undefined : 'View Details'} // undefined deja que el saludo automático actúe
              showAvatar={isHome}
              showNotification={isHome}
              showBack={false} // En tabs no suele haber back
              colors={currentColors}
            />
          );
        },
        tabBarStyle: { /* ... tu estilo transparente ... */ },
      }}
    >
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Transactions',
          headerTitle: 'Transacciones'
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'Analytics',
          headerTitle: 'Analytics'
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: 'Configuración'
        }}
      />
    </Tab.Navigator>
  );
};

// ============================================
// APP STACK
// ============================================
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Ocultamos header del stack porque las Tabs tienen el suyo
        presentation: 'card', // 'modal' si prefieres animaciones verticales
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />
      {/* Aquí podrías agregar pantallas secundarias que tapen la tab bar */}
    </Stack.Navigator>
  );
};

// ============================================
// ROOT NAVIGATOR
// ============================================
const RootNavigator = () => {
  const { isSetupComplete, isAuthenticated } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simular carga de persistencia
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    // Retornar null o un componente de Splash Screen real
    return <View style={styles.loadingContainer} />;
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isSetupComplete ? (
        <RootStack.Screen name="Setup" component={SetupScreen} />
      ) : !isAuthenticated ? (
        <RootStack.Screen name="LockScreen" component={PinScreen} />
        ) : (
        <RootStack.Screen name="MainApp" component={AppStack} />
      )}
    </RootStack.Navigator>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
const App = () => {
  const { theme } = useSettingsStore();
  const isDark = theme === 'dark';
  const customColors = isDark ? darkTheme : lightTheme;

  // Fusión de temas (Paper + Custom) con tipado seguro
  const paperTheme: MD3Theme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: customColors.primary,
      secondary: customColors.accent,
      background: customColors.background,
      surface: customColors.surface,
      error: customColors.error,
      // elevation es necesario en MD3, lo dejamos por defecto
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={customColors.primary}
          />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1e293b', // Color de carga seguro
  },
});

export default App;