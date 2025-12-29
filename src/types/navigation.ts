// src/types/navigation.ts
import { NavigatorScreenParams } from '@react-navigation/native';

// 1. Tipos para las Tabs Principales
export type MainTabParamList = {
    Transactions: undefined;
    Analytics: undefined;
    Settings: undefined;
};

// 2. Tipos para el Stack de la App (que contiene las Tabs)
export type AppStackParamList = {
    MainTabs: NavigatorScreenParams<MainTabParamList>;
    // Aquí irían modales globales, ej:
    // AddTransactionModal: undefined;
};

// 3. Tipos para el Stack de Autenticación
export type AuthStackParamList = {
    Login: undefined;
    Pin: undefined;
    Setup: undefined;
};

// 4. Tipos para el Root Stack (El padre de todo)
export type RootStackParamList = {
    Setup: undefined;
    LockScreen: undefined;
    Auth: NavigatorScreenParams<AuthStackParamList>; // Si agrupas auth
    MainApp: NavigatorScreenParams<AppStackParamList>;
};

// 5. Interfaz para tu Tema de Colores (Adaptado a tu store)
export interface ThemeColors {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    accent: string;
}