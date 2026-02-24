// src/types/navigation.ts
import { NavigatorScreenParams } from '@react-navigation/native';
import CreditCycleScreen from '../screens/cycle/CreditCircleScreen';

export type MainTabParamList = {
    Transactions: undefined;
    Analytics: undefined;
    Budget: undefined;
    CreditCircle: undefined;
    Settings: undefined;
};

export type AppStackParamList = {
    MainTabs: NavigatorScreenParams<MainTabParamList>;
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
    accentSecondary: string;
    shadow: string;
    income: string;
    expense: string;
    success: string;
    warning: string;
}