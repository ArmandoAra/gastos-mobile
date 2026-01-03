import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import useDataStore from '../../stores/useDataStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import { Image } from 'expo-image';
import { SpendiaryLogo } from '../../components/headers/SpendiaryLogo';

export const SetupScreen = () => {
  // 1. Theme Hooks
  const { theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  // 2. Local State
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [biometric, setBiometric] = useState(false);

  // 3. Stores
  const { setupAccount } = useAuthStore();
  const { createAccount } = useDataStore();

  const handleSetup = async () => {
    if (name.length < 2) return Alert.alert('Error', 'Ingresa un nombre válido');
    if (pin.length < 4) return Alert.alert('Error', 'El PIN debe tener al menos 4 dígitos');

    try {
      // A. Crear usuario en Auth Store
      const newUser = await setupAccount(name, pin, biometric);

      // B. Crear cuenta por defecto en Data Store
      await createAccount({
        name: 'Main Account',
        type: 'Cash',
        balance: 0,
        userId: newUser.id,
      });

    } catch (error) {
      console.error("Setup failed", error);
      Alert.alert('Error', 'No se pudo completar la configuración.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
          <Image
            style={styles.image}
            source={require('../../../assets/icon.png')}
            contentFit="cover"
          />
        </View>

        <SpendiaryLogo colors={colors} size="medium" />
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Let's set up your local profile
        </Text>

        {/* Form Container */}
        <View style={styles.formContainer}>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>TU NOMBRE</Text>
            <TextInput 
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surfaceSecondary
                }
              ]}
              value={name}
              onChangeText={setName} 
              placeholder="Ej: Alex Doe"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* PIN Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>CREA UN PIN (4-6 DÍGITOS)</Text>
            <TextInput 
              style={[
                styles.input,
                styles.pinInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surfaceSecondary
                }
              ]}
              value={pin}
              onChangeText={setPin}
              placeholder="****" 
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
            />
          </View>

          {/* Biometric Switch */}
          <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MaterialIcons name="fingerprint" size={24} color={colors.text} />
              <Text style={[styles.switchLabel, { color: colors.text }]}>Habilitar Biometría</Text>
            </View>
            <Switch
              value={biometric}
              onValueChange={setBiometric}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={Platform.OS === 'android' ? '#f4f3f4' : ''}
            />
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent, borderColor: colors.border }]}
          onPress={handleSetup}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Comenzar</Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.text} style={{ marginLeft: 8 }} />
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    flex: 1,
    borderRadius: 40,
    width: '100%',
    backgroundColor: '#0553',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',

    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center'
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 8,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 0.5,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    fontSize: 16,
  },
  pinInput: {
    fontSize: 20,
    letterSpacing: 4,
    fontWeight: '600',
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 0.5,
    borderRadius: 24,
    marginTop: 10
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});