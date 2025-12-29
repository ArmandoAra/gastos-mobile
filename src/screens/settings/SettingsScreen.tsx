import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform
} from 'react-native';
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

export const SettingsScreen = () => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();

    // Hooks del store (combinando lógica de ambos ejemplos)
    const { theme, setTheme, isPinEnabled, togglePin, language, setLanguage } = useSettingsStore();
    const { user, logout } = useAuthStore();

    const handleLanguageChange = (code: string) => {
        setLanguage(code);
        i18n.changeLanguage(code);
    };

    // Configuración de animación para simular el "staggerChildren" de Framer Motion
    const EnteringAnimation = (delay: number) =>
        FadeInDown.duration(500).delay(delay).springify();

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#F4F6F8' }]}
            showsVerticalScrollIndicator={false}
        >
            {/* 1. Header (Traducido del MUI) */}
            <Animated.View entering={EnteringAnimation(100)} style={localStyles.headerContainer}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={localStyles.backButton}
                >
                    <Text style={[localStyles.backButtonText, { color: '#007AFF' }]}>
                        &larr; Back to Dashboard
                    </Text>
                </TouchableOpacity>

                <View>
                    {/* Simulación de gradiente de texto del MUI */}
                    <Text style={localStyles.headerTitle}>Settings</Text>
                    <Text style={localStyles.headerSubtitle}>
                        Manage your account preferences and app settings
                    </Text>
                </View>
            </Animated.View>

            <UserProfileSection />
            <AccountManagementSection />

            {/* 4. Appearance (Del estilo RN proporcionado) */}
            <Animated.View entering={EnteringAnimation(400)} style={styles.section}>
                <Text style={styles.sectionTitle}>Apariencia</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Tema</Text>
                    <View style={styles.themeSelector}>
                        <TouchableOpacity
                            style={[styles.themeBtn, theme === 'light' && styles.themeBtnActive]}
                            onPress={() => setTheme('light')}
                        >
                            <Text style={styles.themeBtnText}>☀️ Claro</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.themeBtn, theme === 'dark' && styles.themeBtnActive]}
                            onPress={() => setTheme('dark')}
                        >
                            <Text style={styles.themeBtnText}>🌙 Oscuro</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>

            {/* 5. Language (Del estilo RN proporcionado) */}
            <Animated.View entering={EnteringAnimation(500)} style={styles.section}>
                <Text style={styles.sectionTitle}>Idioma</Text>
                {languages.map(lang => (
                    <TouchableOpacity
                        key={lang.code}
                        style={styles.settingItem}
                        onPress={() => handleLanguageChange(lang.code)}
                    >
                        <Text style={styles.settingLabel}>
                            {lang.flag} {lang.name}
                        </Text>
                        {language === lang.code && (
                            <Text style={styles.checkmark}>✓</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </Animated.View>

            {/* 6. Security (Del estilo RN proporcionado) */}
            <Animated.View entering={EnteringAnimation(600)} style={styles.section}>
                <Text style={styles.sectionTitle}>Seguridad</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>PIN de Seguridad</Text>
                    <TouchableOpacity
                        style={[styles.toggle, isPinEnabled && styles.toggleActive]}
                        onPress={togglePin}
                    >
                        <View style={[styles.toggleCircle, isPinEnabled && styles.toggleCircleActive]} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingLabel}>🔐 Habilitar Biometría</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* 7. Danger Zone (Traducido del MUI a estilos RN) */}
            <DataManagementSection />
            <DangerZoneSection userId={user?.id} />

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