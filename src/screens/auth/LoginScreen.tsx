import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Extraemos acciones y estado del store
    const { login, isLoading, error, clearError } = useAuthStore();

    const handleLogin = async () => {
      if (!email || !password) {
          Alert.alert('Error', 'Por favor completa los campos');
          return;
      }

      await login(email, password);
      // Nota: No necesitas navegar manualmente aquí.
      // El RootNavigator en App.tsx detectará el cambio de 'isAuthenticated'
      // y cambiará el Stack automáticamente.
  };

    return (
      <View style={styles.container}>
          <Text style={styles.title}>Bienvenido de nuevo 👋</Text>

          {error && (
              <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity onPress={clearError}>
                      <Text style={styles.closeError}>✕</Text>
                  </TouchableOpacity>
              </View>
          )}

          <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                  style={styles.input}
                  placeholder="demo@test.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
              />
          </View>

          <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                  style={styles.input}
                  placeholder="123456"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
              />
          </View>

          <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
          >
              {isLoading ? (
                  <ActivityIndicator color="#fff" />
              ) : (
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
          </TouchableOpacity>

          <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Register')}
          >
              <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, color: '#333' },
    inputContainer: { marginBottom: 16 },
    label: { fontSize: 14, color: '#666', marginBottom: 8, fontFamily: 'FiraSans-Bold' },
    input: {
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    button: {
        backgroundColor: '#6200EE',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#6200EE',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    buttonDisabled: { backgroundColor: '#B0B0B0' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    linkButton: { marginTop: 20, alignItems: 'center' },
    linkText: { color: '#6200EE', fontFamily: 'FiraSans-Bold' },
    errorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    errorText: { color: '#D32F2F' },
    closeError: { color: '#D32F2F', fontWeight: 'bold', marginLeft: 10 },
});