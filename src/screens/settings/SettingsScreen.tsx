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
import InfoPopUp from '../../components/messages/InfoPopUp';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import { globalStyles } from '../../theme/global.styles';

export const SettingsScreen = () => {
    const { theme } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;


    return (
        <LinearGradient
            // 1. Colores del gradiente (de arriba hacia abajo usando tu tema)
            colors={[colors.surfaceSecondary, theme === 'dark' ? colors.primary : colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}

            // 2. Quitamos el backgroundColor sólido para que se vea el gradiente
            style={[
                globalStyles.screenContainer,
            ]}
        >
            <InfoPopUp />
        <ScrollView
                style={[styles.container, { backgroundColor: 'transparent' }]}
            showsVerticalScrollIndicator={false}
            >
                <UserProfileSection colors={colors} />

                <AccountManagementSection colors={colors} />

                <AppearanceSection colors={colors} />

                <LanguageSection colors={colors} />

                <SecuritySection colors={colors} />

                <DataManagementSection colors={colors} />

                <DangerZoneSection colors={colors} />

        </ScrollView>
        </LinearGradient>
    );
};
