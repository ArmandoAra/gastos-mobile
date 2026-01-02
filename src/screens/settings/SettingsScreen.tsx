import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient'; // Para el texto gradiente del título

// Stores
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';

// Estilos y Constantes
import { styles } from '../../theme/styles2';
import { languages } from '../../constants/languages';
import UserProfileSection from './components/UserProfileSection';
import AccountManagementSection from './components/AccountManagementSection';
import DataManagementSection from './components/DataManagementSection';
import DangerZoneSection from './components/DangerZoneSection';
import { darkTheme, lightTheme } from '../../theme/colors';
import { ThemeColors } from '../../types/navigation';
import AppearanceSection from './components/AppearanceSection';
import LanguageSection from './components/LanguageSection';
import SecuritySection from './components/SecuritySection';

export const SettingsScreen = () => {

    const { theme, isPinEnabled, togglePin } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#F4F6F8' }]}
            showsVerticalScrollIndicator={false}
        >

            <UserProfileSection colors={colors} />

            <AccountManagementSection colors={colors} />

            {/* 4. Appearance (Del estilo RN proporcionado) */}
            <AppearanceSection colors={colors} />

            {/* 5. Language (Del estilo RN proporcionado) */}
            <LanguageSection colors={colors} />

            {/* 6. Security (Del estilo RN proporcionado) */}
            <SecuritySection
                colors={colors}
                isPinEnabled={isPinEnabled}
                isBiometricEnabled={false}
                onTogglePin={togglePin}
                onToggleBiometrics={() => { }}
            />

            {/* 7. Danger Zone (Traducido del MUI a estilos RN) */}
            <DataManagementSection colors={colors} />
            <DangerZoneSection colors={colors} />

        </ScrollView>
    );
};

// Estilos locales adicionales para lo que no estaba en styles2.ts (Header y Danger Zone específicos)
const localStyles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        marginBottom: 20,
    },
    backButton: {
        marginBottom: 15,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#333', // O el color primario de tu tema
        marginBottom: 5,
        // Nota: React Native no soporta background-clip: text nativamente sin librerías complejas (MaskedView).
        // Se usa un color sólido o LinearGradient overlay si es estrictamente necesario.
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
    },
    chevron: {
        fontSize: 20,
        color: '#ccc',
        fontWeight: 'bold',
    },
    dangerZoneSection: {
        borderColor: '#fca5a5', // Rojo claro
        borderWidth: 1,
        backgroundColor: '#fef2f2', // Fondo rojizo muy suave
    }
});