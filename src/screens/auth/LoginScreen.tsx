
// ============================================
// LOGIN SCREEN

import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { useAuthStore } from "../../stores/authStore";
import { styles } from "../../theme/styles2";

// ============================================
export const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth } = useAuthStore();

    const handleLogin = async () => {
        setIsLoading(true);

        // Simular llamada API
        setTimeout(() => {
            const mockUser = {
                id: '1',
                email: email,
                name: 'Usuario Demo',
                created_at: new Date().toISOString()
            };

            const mockToken = 'mock-jwt-token-123';

            setAuth(mockUser, mockToken);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <View style={styles.authContainer}>
            <View style={styles.authContent}>
                <Text style={styles.authLogo}>💰</Text>
                <Text style={styles.authTitle}>Mi Finanzas</Text>
                <Text style={styles.authSubtitle}>Controla tus gastos e ingresos</Text>

                <View style={styles.authForm}>
                    <TextInput
                        style={styles.authInput}
                        placeholder="Correo electrónico"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.authInput}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.authButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.authButtonText}>
                            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.authLink}>
                        <Text style={styles.authLinkText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    <View style={styles.authDivider}>
                        <View style={styles.authDividerLine} />
                        <Text style={styles.authDividerText}>o</Text>
                        <View style={styles.authDividerLine} />
                    </View>

                    <TouchableOpacity style={styles.authButtonSecondary}>
                        <Text style={styles.authButtonSecondaryText}>Crear cuenta nueva</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};