import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { da } from 'date-fns/locale';
import { darkTheme, lightTheme } from '../../theme/colors';
import { MaterialIcons } from '@expo/vector-icons';

export const PinScreen = () => {
    const { theme } = useSettingsStore();
    const colors = theme === 'dark' ? darkTheme : lightTheme;

    const [pin, setPin] = useState('');
    const [isProcessing, setIsProcessing] = useState(false); // Estado local para bloquear duplicados

    // Usar selectores específicos para evitar re-renders innecesarios
    const loginWithPin = useAuthStore(state => state.loginWithPin);
    const loginWithBiometrics = useAuthStore(state => state.loginWithBiometrics);
    const isBiometricEnabled = useAuthStore(state => state.isBiometricEnabled);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const user = useAuthStore(state => state.user);

    useEffect(() => {
        // Solo disparar si no estamos ya autenticados y no estamos procesando
        if (isBiometricEnabled && !isAuthenticated && !isProcessing) {
            handleBiometricLogin();
        }
    }, []);

    const handleBiometricLogin = async () => {
        setIsProcessing(true);
        try {
            await loginWithBiometrics();
        } finally {
            // No lo ponemos en false inmediatamente para evitar disparos en cadena
            setTimeout(() => setIsProcessing(false), 2000);
        }
    };

    const handleLogin = async () => {
        if (pin.length < 4 || isProcessing) return;

        setIsProcessing(true);
        const success = await loginWithPin(pin);

        if (!success) {
            Alert.alert('Error', 'PIN Incorrecto');
            setPin('');
            setIsProcessing(false);
        }
        // Si tiene éxito, el RootNavigator nos sacará de aquí automáticamente
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.greeting, { color: colors.text }]}>Hola, {user?.name}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Ingresa tu PIN para acceder</Text>

          <TextInput
                style={[styles.pinInput, { borderColor: colors.border, color: colors.text }]}
              value={pin}
              onChangeText={setPin}
              placeholder="****"
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
                placeholderTextColor={colors.textSecondary}
              autoFocus
          />

            <TouchableOpacity style={[styles.button, { backgroundColor: colors.accent, borderColor: colors.border }]} onPress={handleLogin}>
                <Text style={[styles.buttonText, { color: colors.text }]}>Desbloquear</Text>
          </TouchableOpacity>

          {isBiometricEnabled && (
                <TouchableOpacity style={[styles.bioButton, { borderColor: colors.border, backgroundColor: colors.text }]} onPress={loginWithBiometrics}>
                    <MaterialIcons name="fingerprint" size={24} color={colors.accent} />
                    <Text style={[styles.bioText, { color: colors.accent }]}> / </Text>
                    <MaterialIcons name="face" size={24} color={colors.accent} /> 
              </TouchableOpacity>
          )}
      </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, paddingTop: 200, alignItems: 'center' },
    greeting: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
    pinInput: { width: '80%', borderWidth: 0.5, padding: 16, borderRadius: 24, fontSize: 24, textAlign: 'center', letterSpacing: 10, marginBottom: 24 },
    button: { backgroundColor: '#6200EE', padding: 16, borderRadius: 24, width: '80%', alignItems: 'center', borderWidth: 0.5 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    bioButton: { display: 'flex', flexDirection: 'row', marginTop: 20, padding: 10, borderWidth: 0.5, borderRadius: 24, width: '80%', alignItems: 'center', justifyContent: 'center' },
    bioText: { fontWeight: '600', fontSize: 24, marginHorizontal: 10 },
});