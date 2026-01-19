import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    PixelRatio
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Función auxiliar para escalar iconos según la configuración del dispositivo
const getScaledSize = (size: number) => size * PixelRatio.getFontScale();

export const PinScreen = () => {
    const { theme } = useSettingsStore();
    const colors = theme === 'dark' ? darkTheme : lightTheme;
    const { t } = useTranslation();

    const [pin, setPin] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const loginWithPin = useAuthStore(state => state.loginWithPin);
    const loginWithBiometrics = useAuthStore(state => state.loginWithBiometrics);
    const isBiometricEnabled = useAuthStore(state => state.isBiometricEnabled);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        if (isBiometricEnabled && !isAuthenticated && !isProcessing) {
            handleBiometricLogin();
        }
    }, []);

    const handleBiometricLogin = async () => {
        setIsProcessing(true);
        try {
            await loginWithBiometrics();
        } finally {
            setTimeout(() => setIsProcessing(false), 2000);
        }
    };

    const handleLogin = async () => {
        if (pin.length < 4 || isProcessing) return;

        setIsProcessing(true);
        const success = await loginWithPin(pin);

        if (!success) {
            Alert.alert(t('commonWarnings.warning'), t('auth.invalidPin', 'PIN Incorrecto'));
            setPin('');
            setIsProcessing(false);
        }
    };

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.surface }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ENCABEZADO */}
                    <View style={styles.headerContainer}>
                        <Text
                            style={[styles.greeting, { color: colors.text }]}
                            accessibilityRole="header"
                        >
                            {t('auth.hi')}, {user?.name}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {t('auth.inserYourPin')}
                        </Text>
                    </View>

                    {/* INPUT PIN */}
                    <TextInput
                        style={[
                            styles.pinInput,
                            { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }
                        ]}
                        value={pin}
                        onChangeText={setPin}
                        placeholder="****"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        secureTextEntry
                        maxLength={6}
                        returnKeyType='done'
                        onSubmitEditing={handleLogin}
                        editable={!isProcessing}
                        autoFocus={true} // Útil para PIN screen, pero cuidado en navegación compleja
                        accessibilityLabel={t('auth.pinInputLabel', 'Campo numérico para PIN')}
                        accessibilityHint={t('auth.pinInputHint', 'Ingresa tu código de 4 a 6 dígitos')}
                    />

                    {/* BOTÓN DESBLOQUEAR */}
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.accent, borderColor: colors.border }]}
                        onPress={handleLogin}
                        activeOpacity={0.7}
                        // ACCESIBILIDAD
                        accessibilityRole="button"
                        accessibilityLabel={t('auth.unlock')}
                        accessibilityState={{ disabled: isProcessing }}
                    >
                        <Text style={[styles.buttonText, { color: colors.text }]}>
                            {t('auth.unlock')}
                        </Text>
                    </TouchableOpacity>

                    {/* BOTÓN BIOMETRÍA */}
                    {isBiometricEnabled && (
                        <TouchableOpacity
                            style={[styles.bioButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                            onPress={loginWithBiometrics}
                            activeOpacity={0.7}
                            // ACCESIBILIDAD
                            accessibilityRole="button"
                            accessibilityLabel={t('auth.unlockWithBiometrics', 'Desbloquear con huella o rostro')}
                        >
                            {/*  */}
                            <MaterialIcons
                                name="fingerprint"
                                size={getScaledSize(24)} // Icono escala con el texto del sistema
                                color={colors.accent}
                                importantForAccessibility="no" // El botón padre ya tiene la etiqueta
                            />
                            <Text
                                style={[styles.bioText, { color: colors.accent }]}
                                maxFontSizeMultiplier={2} // Limite razonable para separadores
                                importantForAccessibility="no"
                            >
                                /
                            </Text>

                            <MaterialIcons
                                name="face"
                                size={getScaledSize(24)} // Icono escala con el texto del sistema
                                color={colors.accent}
                                importantForAccessibility="no"
                            />
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center', // Centra verticalmente si hay espacio
        alignItems: 'center',
        padding: 24,
        paddingBottom: 40, // Espacio extra para el teclado
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
        width: '100%',
    },
    greeting: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    pinInput: {
        width: '80%', // Relativo, mejor para tablets
        maxWidth: 400, // Límite para tablets
        minHeight: 60, // Altura mínima para accesibilidad táctil
        borderWidth: 1, // Mejor visibilidad que 0.5
        padding: 16,
        borderRadius: 24,
        fontSize: 24,
        textAlign: 'center',
        letterSpacing: 10,
        marginBottom: 24,
    },
    button: {
        padding: 16,
        borderRadius: 24,
        width: '80%',
        maxWidth: 400,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1, // Mejor contraste
        minHeight: 56, // Altura táctil recomendada
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    bioButton: {
        flexDirection: 'row',
        marginTop: 24,
        padding: 12,
        borderWidth: 1,
        borderRadius: 24,
        width: '80%',
        maxWidth: 400,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 56, // Altura táctil recomendada
    },
    bioText: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 24,
        marginHorizontal: 10,
    },
});