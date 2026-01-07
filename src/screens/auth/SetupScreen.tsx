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
  Platform,
  PixelRatio
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../stores/authStore';
import useDataStore from '../../stores/useDataStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import { SpendiaryLogo } from '../../components/headers/SpendiaryLogo';

const getScaledSize = (size: number) => size * PixelRatio.getFontScale();

export const SetupScreen = () => {
  // 1. Theme Hooks
  const { theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const { t } = useTranslation();

  // 2. Local State
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [biometric, setBiometric] = useState(false);

  // 3. Stores
  const { setupAccount } = useAuthStore();
  const { createAccount } = useDataStore();

  const handleSetup = async () => {
    if (name.length < 2) return Alert.alert(t('commonWarnings.warning'), t('auth.invalidName', 'Name too short'));
    if (pin.length < 4) return Alert.alert(t('commonWarnings.warning'), t('security.pinInfo'));

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
      Alert.alert(t('commonWarnings.warning'), t('auth.setupError'));
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
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER: LOGO & ICON */}
        <View
          style={styles.headerContainer}
          accessibilityRole="header"
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceSecondary }]}>
            <Image
              style={styles.image}
              source={require('../../../assets/icon.png')}
              contentFit="cover"
              accessible={false} // Imagen decorativa
            />
          </View>

          <SpendiaryLogo colors={colors} size="medium" />

          <Text
            style={[styles.subtitle, { color: colors.textSecondary }]}
            maxFontSizeMultiplier={1.4}
          >
            {t('auth.setupProfileSubtitle', "Let's set up your local profile")}
          </Text>
        </View>

        {/* FORM CONTAINER */}
        <View style={styles.formContainer}>

          {/* NAME INPUT */}
          <View style={styles.inputGroup}>
            <Text
              style={[styles.label, { color: colors.textSecondary }]}
              maxFontSizeMultiplier={1.3}
            >
              {t('auth.name')}
            </Text>
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
              placeholder={t('auth.namePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              // A11y
              accessibilityLabel={t('profileAccessibility.name_input_label')}
              accessibilityHint={t('profileAccessibility.name_input_hint')}
            />
          </View>

          {/* PIN INPUT */}
          <View style={styles.inputGroup}>
            <Text
              style={[styles.label, { color: colors.textSecondary }]}
              maxFontSizeMultiplier={1.3}
            >
              {t('auth.pinPlaceholder', 'Secure PIN')}
            </Text>
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
              // A11y
              accessibilityLabel={t('security.pin')}
              accessibilityHint={t('security.pinInfo')}
            />
          </View>

          {/* BIOMETRIC SWITCH */}
          {/* Envolvemos en TouchableOpacity para que el texto también active el switch (mejor UX) */}
          <TouchableOpacity
            style={[
              styles.row,
              { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }
            ]}
            activeOpacity={0.8}
            onPress={() => setBiometric(!biometric)}
            // A11y: Agrupamos el switch y la etiqueta
            accessibilityRole="switch"
            accessibilityLabel={t('auth.biometricToggle')}
            accessibilityState={{ checked: biometric }}
          >
            <View style={styles.switchContent}>
              <MaterialIcons
                name="fingerprint"
                size={getScaledSize(24)}
                color={colors.text}
                importantForAccessibility="no"
              />
              <Text
                style={[styles.switchLabel, { color: colors.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {t('auth.biometricToggle')}
              </Text>
            </View>
            <Switch
              value={biometric}
              onValueChange={setBiometric}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={Platform.OS === 'android' ? '#f4f3f4' : ''}
              // El contenedor padre ya maneja la accesibilidad
              importantForAccessibility="no-hide-descendants" 
            />
          </TouchableOpacity>
        </View>

        {/* ACTION BUTTON */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent, borderColor: colors.border }]}
          onPress={handleSetup}
          activeOpacity={0.8}
          // A11y
          accessibilityRole="button"
          accessibilityLabel={t('auth.begin')}
          accessibilityHint={t('auth.beginHint', 'Creates your profile and logs you in')}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>{t('auth.begin')}</Text>
          <MaterialIcons
            name="arrow-forward"
            size={getScaledSize(20)}
            color={colors.text}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center', // Centrado vertical si hay espacio
    alignItems: 'center',
    paddingBottom: 40 // Espacio extra para scroll
  },
  headerContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20
  },
  image: {
    flex: 1,
    borderRadius: 40,
    width: '100%',
    // backgroundColor: '#0553', // Opcional
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20, // Reducido un poco
    textAlign: 'center',
    marginTop: 8
  },
  formContainer: {
    width: '100%',
    maxWidth: 500, // Limite para tablets
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
    textTransform: 'uppercase'
  },
  input: {
    borderWidth: 0.5,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    fontSize: 16,
    minHeight: 56 // Altura táctil mínima
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
    marginTop: 10,
    minHeight: 60 // Altura táctil
  },
  switchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Mejor espaciado
    flex: 1
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1 // Permite que el texto se ajuste si es largo
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    minHeight: 56
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});