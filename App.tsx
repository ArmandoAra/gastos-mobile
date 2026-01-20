import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { 
  MD3LightTheme,
  MD3DarkTheme,
  Provider as PaperProvider,
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

// Polyfill para Buffer en React Native
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;

// Importamos nuestros tipos y componentes tipados
import {
  RootStackParamList,
  AppStackParamList,
  MainTabParamList,
  ThemeColors
} from './src/types/navigation';
import { CustomTabBar } from './src/components/TabBar/CustomTabBar';
import { ModernHeader } from './src/components/navigation/ModernHeader';
import AnalyticsScreen from './src/screens/analytics/AnalyticsScreen';
import { useTranslation } from 'react-i18next';
import { BudgetScreen } from './src/screens/budget/BudgetScreen';
import useDataStore from './src/stores/useDataStore';


// --- Creación de Navigators Tipados ---
const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// ============================================
// MAIN TAB NAVIGATOR
// ============================================
const MainTabs = () => {
  const { t } = useTranslation();
  const { theme } = useSettingsStore();
  const currentColors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

  const renderTabBar = React.useCallback(
    (props: any) => <CustomTabBar {...props} colors={currentColors} />,
    [currentColors]
  );

  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        // Aquí decimos: "Usa mi header custom"
        header: ({ options, route }) => {
          // Lógica para decidir qué mostrar según la pantalla
          const isHome = route.name === 'Transactions'; // O 'Home' si tienes una dashboard
          if (route.name === "Settings" || route.name === "Budget") {
            // En Settings no mostramos header
            return (
              <ModernHeader
                title={options.title}
              showAvatar={isHome}
              showNotification={isHome}
              showBack={false} // En tabs no suele haber back
              colors={currentColors}
            />
          );
          }

        },
        tabBarStyle: { /* ... tu estilo transparente ... */ },
      }}
    >
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: t('navigation.transactions'),
          headerTitle: t('navigation.transactions')
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: t('navigation.analytics'),
          headerTitle: t('navigation.analytics')
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          title: t('navigation.budget'),
          headerTitle: t('navigation.budget')
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('navigation.settings'),
          headerTitle: t('navigation.settings')
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
  const isSetupComplete = useAuthStore(state => state.isSetupComplete);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // CORRECCIÓN: Leemos directamente el booleano del estado, no la existencia del hash
  const isPinEnabled = useAuthStore(state => state.isPinEnabled);
  const isBiometricEnabled = useAuthStore(state => state.isBiometricEnabled);

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <View style={styles.loadingContainer} />;
  }

  // Lógica: Solo mostramos bloqueo si el setup está listo, el PIN está habilitado y no está autenticado
  const showLockScreen = isSetupComplete && !isAuthenticated && (isPinEnabled || isBiometricEnabled);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isSetupComplete ? (
        <RootStack.Screen name="Setup" component={SetupScreen} />
      ) : showLockScreen ? (
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
// Evita que la pantalla de carga se oculte automáticamente
SplashScreen.preventAutoHideAsync();
const App = () => {
  const themeMode = useSettingsStore(state => state.theme);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          // El nombre de la izquierda es como la llamarás en tu CSS
          'Tinos-Bold': require('./src/theme/fonts/Tinos-Bold.ttf'),
          'Tinos-Regular': require('./src/theme/fonts/Tinos-Regular.ttf'),
          'Tinos-Italic': require('./src/theme/fonts/Tinos-Italic.ttf'),
          'FiraSans-Bold': require('./src/theme/fonts/FiraSans-Bold.ttf'),
          'FiraSans-Regular': require('./src/theme/fonts/FiraSans-Regular.ttf'),
          'FiraSans-Thin': require('./src/theme/fonts/FiraSans-Thin.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync(); // Oculta la pantalla de carga
      }
    }

    loadFonts();
  }, []);

  const paperTheme = React.useMemo(() => {
    const isDark = themeMode === 'dark';
    const customColors = isDark ? darkTheme : lightTheme;
    const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: customColors.primary,
        secondary: customColors.accent,
        background: customColors.background,
        surface: customColors.surface,
        error: customColors.error,
      },
    };
  }, [themeMode]);

  if (!fontsLoaded) return null; // O un componente de carga

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer>
          <StatusBar
            barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
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