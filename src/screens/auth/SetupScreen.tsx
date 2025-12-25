import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, Alert, StyleSheet } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export const SetupScreen = () => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [biometric, setBiometric] = useState(false);
  const { setupAccount } = useAuthStore();

  const handleSetup = async () => {
    if (name.length < 2) return Alert.alert('Error', 'Ingresa un nombre válido');
    if (pin.length < 4) return Alert.alert('Error', 'El PIN debe tener al menos 4 dígitos');

    await setupAccount(name, pin, biometric);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a tus Finanzas 🔒</Text>
      <Text style={styles.subtitle}>Configuremos tu seguridad local</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tu Nombre</Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName} 
          placeholder="Ej: Juan Perez" 
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Crea un PIN de acceso</Text>
        <TextInput 
          style={styles.input} 
          value={pin} 
          onChangeText={setPin} 
          placeholder="****" 
          keyboardType="numeric" 
          secureTextEntry 
          maxLength={6}
        />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Habilitar Biometría (Huella/FaceID)</Text>
        <Switch value={biometric} onValueChange={setBiometric} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSetup}>
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 16, borderRadius: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  button: { backgroundColor: '#6200EE', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});