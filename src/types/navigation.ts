// src/types/navigation.ts
import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
    Transactions: undefined;
    Analytics: undefined;
    Settings: undefined;
};

export type AppStackParamList = {
    MainTabs: NavigatorScreenParams<MainTabParamList>;
    // Aquí irían modales globales, ej:
    // AddTransactionModal: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Pin: undefined;
    Setup: undefined;
};

export type RootStackParamList = {
    Setup: undefined;
    LockScreen: undefined;
    Auth: NavigatorScreenParams<AuthStackParamList>; 
    MainApp: NavigatorScreenParams<AppStackParamList>;
};

export interface ThemeColors {
    primary: string;
    background: string;
    surface: string;
    surfaceSecondary: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    accent: string;
    shadow: string;
    income: string;
    expense: string;
    success: string;
    warning: string;
}