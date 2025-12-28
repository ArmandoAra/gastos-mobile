import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MD3LightTheme, MD3DarkTheme, adaptNavigationTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SumarizeIcon, AnaliticsIcon, SettingsIcon } from './src/constants/icons';

// Importar i18n
import './src/i18n';

// Importar pantallas
import { HomeScreen } from './src/screens/home/HomeScreen';
import { TransactionsScreen } from './src/screens/transactions/TransactionsListScreen';
import DashboardScreen from './src/screens/analitics/AnaliticsScreen';
import { AccountsListScreen } from './src/screens/accounts/AccountsListScreen';
import { SettingsScreen } from './src/screens/settings/SettingsScreen';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { PinScreen } from './src/screens/auth/PinScreen';

// Importar stores
import { useAuthStore } from './src/stores/authStore';
import { useSettingsStore } from './src/stores/settingsStore';

// Importar tema
import { lightTheme, darkTheme } from './src/theme/colors';
import { SetupScreen } from './src/screens/auth/SetupScreen';
import AnaliticsScreen from './src/screens/analitics/AnaliticsScreen';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const iconNames: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  Transactions: 'summarize', // Ejemplo para Summarize
  Analitics: 'analytics',       // Ejemplo para Analytics
  Settings: 'settings',         // Ejemplo para Settings
};

// ============================================
// ICONOS PERSONALIZADOS (Emojis)
// ============================================
const TabBarIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const iconName = iconNames[name] || 'help-outline';

  return (
    <MaterialIcons
      name={iconName}
      size={focused ? 28 : 24}       // Usar prop size, no fontSize
      color={focused ? "#667eea" : "#888"} // Define tus colores aquí o usa el del theme
      style={{ opacity: focused ? 1 : 0.6 }}
    />
  );
};

// ============================================
// MAIN TAB NAVIGATOR
// ============================================
const MainTabs = () => {
  const { theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabBarIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: 'Transacciones',
          headerTitle: '📊 Transacciones'
        }}
      />
      <Tab.Screen
        name="Analitics"
        component={AnaliticsScreen}
        options={{
          title: 'Analitics',
          headerTitle: '📈 Analitics'
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ajustes',
          headerTitle: '⚙️ Configuración'
        }}
      />
    </Tab.Navigator>
  );
};

// ============================================
// APP STACK (Para modales y otras pantallas)
// ============================================
const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// ============================================
// AUTH STACK
// ============================================
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Pin" component={PinScreen} />
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
    // Pequeño delay para dejar que MMKV cargue
    setTimeout(() => setIsReady(true), 500);
  }, []);

  if (!isReady) return null; // O tu Loading Screen

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isSetupComplete ? (
        // Caso 1: Primera vez que abre la app (Crear usuario y PIN)
        <RootStack.Screen name="Setup" component={SetupScreen} />
      ) : !isAuthenticated ? (
        // Caso 2: Usuario existe pero la app está bloqueada
        <RootStack.Screen name="LockScreen" component={PinScreen} />
      ) : (
            // Caso 3: Usuario autenticado -> Entrar a la app
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
  const colors = isDark ? darkTheme : lightTheme;

  // Combinamos tu configuración de colores con el sistema MD3 de Paper
  const paperTheme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: colors.primary,
      secondary: colors.accent, // Paper usa 'secondary' en lugar de 'accent' en MD3
      background: colors.background,
      surface: colors.surface,
      error: colors.error,
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={colors.primary}
          />
          {/* Eliminamos SafeAreaView de aquí para que el Navigator controle el layout */}
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 60,
    marginBottom: 16,
  },
  loadingSubtext: {
    fontSize: 18,
    color: '#757575',
    fontWeight: '600',
  },
});

export default App;