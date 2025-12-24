// ============================================
// AUTH NAVIGATOR (src/navigation/AuthNavigator.tsx)
// ============================================
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { PinScreen } from '../screens/auth/PinScreen';
import { BiometricScreen } from '../screens/auth/BiometricScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    Pin: undefined;
    Biometric: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: {
                    backgroundColor: '#6200EE',
                },
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                    title: 'Iniciar Sesión',
                }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{
                    title: 'Crear Cuenta',
                }}
            />
            <Stack.Screen
                name="Pin"
                component={PinScreen}
                options={{
                    title: 'PIN de Seguridad',
                    gestureEnabled: false, // No permitir volver con gesto
                }}
            />
            <Stack.Screen
                name="Biometric"
                component={BiometricScreen}
                options={{
                    title: 'Autenticación Biométrica',
                    gestureEnabled: false,
                }}
            />
        </Stack.Navigator>
    );
};

export default AuthNavigator;

