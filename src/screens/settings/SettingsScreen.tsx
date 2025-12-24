
// ============================================
// SETTINGS SCREEN
// ============================================
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import { ScrollView, View, TouchableOpacity, Text } from 'react-native';
import { styles } from '../../theme/styles2';

export const SettingsScreen = () => {
    const { t, i18n } = useTranslation();
    const { theme, setTheme, isPinEnabled, togglePin, language, setLanguage } = useSettingsStore();
    const { user, logout } = useAuthStore();

    const languages = [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'pt', name: 'Português', flag: '🇧🇷' }
    ];

    const handleLanguageChange = (code: string) => {
        setLanguage(code);
        i18n.changeLanguage(code);
    };

    return (
        <ScrollView style={styles.container}>
            {/* User Info */}
            <View style={styles.section}>
                <View style={styles.userCard}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    </View>
                </View>
            </View>

            {/* Appearance */}
            <View style={styles.section}>
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
            </View>

            {/* Language */}
            <View style={styles.section}>
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
            </View>

            {/* Security */}
            <View style={styles.section}>
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
                <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingLabel}>🔑 Cambiar PIN</Text>
                </TouchableOpacity>
            </View>

            {/* About */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Acerca de</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Versión</Text>
                    <Text style={styles.settingValue}>1.0.0</Text>
                </View>
            </View>

            {/* Logout */}
            <TouchableOpacity
                style={styles.logoutBtn}
                onPress={logout}
            >
                <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};