// ============================================
// BIOMETRIC SCREEN (src/screens/auth/BiometricScreen.tsx)
// ============================================
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useSettingsStore } from '../../stores/settingsStore';
import { styles } from '../../theme/styles';


const rnBiometrics = new ReactNativeBiometrics();

export const BiometricScreen = ({ navigation }: any) => {
    const [biometryType, setBiometryType] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { setUnlocked } = useSettingsStore();

    useEffect(() => {
        checkBiometryAvailability();
    }, []);

    const checkBiometryAvailability = async () => {
        try {
            const { available, biometryType } = await rnBiometrics.isSensorAvailable();
            if (available) {
                setBiometryType(biometryType || 'Biometría');
            } else {
                setError('Biometría no disponible en este dispositivo');
            }
        } catch (err) {
            setError('Error al verificar biometría');
            console.error(err);
        }
    };

    const handleBiometricAuth = async () => {
        setIsLoading(true);
        setError('');

        try {
            const { success } = await rnBiometrics.simplePrompt({
                promptMessage: 'Confirma tu identidad',
                cancelButtonText: 'Cancelar',
            });

            if (success) {
                setUnlocked(true);
                // La navegación se maneja automáticamente por el RootNavigator
            } else {
                setError('Autenticación cancelada');
            }
        } catch (err: any) {
            setError('Error en la autenticación biométrica');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getBiometricIcon = () => {
        if (biometryType === 'FaceID') return '👤';
        if (biometryType === 'TouchID' || biometryType === 'Biometrics') return '👆';
        return '🔒';
    };

    const getBiometricText = () => {
        if (biometryType === 'FaceID') return 'Face ID';
        if (biometryType === 'TouchID') return 'Touch ID';
        if (biometryType === 'Biometrics') return 'Huella Digital';
        return 'Biometría';
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>{getBiometricIcon()}</Text>
                <Text style={styles.title}>Autenticación Biométrica</Text>
                <Text style={styles.subtitle}>
                    Usa {getBiometricText()} para acceder a tu información
                </Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleBiometricAuth}
                    disabled={isLoading || !biometryType}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Autenticar</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => navigation.navigate('Pin')}
                >
                    <Text style={styles.linkText}>Usar PIN en su lugar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const biometricStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6200EE',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    icon: {
        fontSize: 80,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        marginBottom: 40,
    },
    error: {
        color: '#FF6B6B',
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#03DAC6',
        paddingVertical: 16,
        paddingHorizontal: 48,
        borderRadius: 12,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 24,
        padding: 12,
    },
    linkText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16,
    },
});