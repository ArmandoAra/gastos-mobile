import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export const PinScreen = () => {
    const [pin, setPin] = useState('');
    const { loginWithPin, loginWithBiometrics, isBiometricEnabled, user } = useAuthStore();

    useEffect(() => {
        // Si tiene biometría activada, pedirla automáticamente al abrir
        if (isBiometricEnabled) {
            loginWithBiometrics();
        }
    }, []);

    const handleLogin = async () => {
        const success = await loginWithPin(pin);
        if (!success) {
            Alert.alert('Error', 'PIN Incorrecto');
            setPin('');
        }
  };

    return (
      <View style={styles.container}>
          <Text style={styles.greeting}>Hola, {user?.name} 👋</Text>
          <Text style={styles.subtitle}>Ingresa tu PIN para acceder</Text>

          <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              placeholder="****"
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              autoFocus
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Desbloquear</Text>
          </TouchableOpacity>

          {isBiometricEnabled && (
              <TouchableOpacity style={styles.bioButton} onPress={loginWithBiometrics}>
                  <Text style={styles.bioText}>Usar Huella / FaceID 👆</Text>
              </TouchableOpacity>
          )}
      </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    greeting: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
    pinInput: { width: '80%', borderWidth: 1, borderColor: '#ddd', padding: 16, borderRadius: 12, fontSize: 24, textAlign: 'center', letterSpacing: 10, marginBottom: 24 },
    button: { backgroundColor: '#6200EE', padding: 16, borderRadius: 12, width: '80%', alignItems: 'center' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    bioButton: { marginTop: 20, padding: 10 },
    bioText: { color: '#6200EE', fontWeight: '600' },
});