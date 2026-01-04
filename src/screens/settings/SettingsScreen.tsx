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

export const SettingsScreen = () => {
    const { theme } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

    return (
        <>
            <InfoPopUp />
        <ScrollView
                style={[styles.container, { backgroundColor: theme === 'dark' ? colors.background : colors.background }]}
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
        </>
    );
};
