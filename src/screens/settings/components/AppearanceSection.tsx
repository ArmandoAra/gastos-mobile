import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Platform 
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../../../stores/settingsStore';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';
import useCallback from 'react';
import { IconOption } from '../../../constants/icons';
import { styles } from '../styles/settingsStyles';
import { ThemeOption } from '../subcomponents/ThemeOption';
import { IconThemeOptions } from '../subcomponents/IconThemeOptions';

interface AppearanceSectionProps {
    colors: ThemeColors;
}

export default function AppearanceSection({ colors }: AppearanceSectionProps) {
    const { t } = useTranslation();
    const { theme, setTheme, iconsOptions, setIconsOptions } = useSettingsStore();

    // Helper para renderizar opciones de tema


    const IconOption = ({
        option,
        icon,
        label
    }: {
            option: 'material' | 'painted',
            icon: React.ComponentType<any>,
            label: string
    }) => {
        const isActive = iconsOptions === option;
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIconsOptions(option)}
                // 1. Accesibilidad: Rol de Radio Button
                accessibilityRole="radio"
                accessibilityState={{ checked: isActive }}
                accessibilityLabel={`${t('icons.switch_to')} ${label}`}
                accessibilityHint={isActive ? t('icons.already_active') : t('icons.activate_hint')}
                style={[
                    {
                        backgroundColor: isActive ? colors.surfaceSecondary : colors.surface,
                        borderColor: isActive ? colors.accent : colors.border,
                        borderWidth: isActive ? 2 : 1, // Borde un poco más grueso para mejor visibilidad
                    }
                ]}
            >
                <View style={styles.themeContent}>
                    {/* Icono decorativo */}
                    <Text
                        style={[
                            styles.themeBtnText,
                            {
                                color: isActive ? colors.text : colors.textSecondary,
                                fontWeight: isActive ? '700' : '500'
                            }
                        ]}
                        maxFontSizeMultiplier={2} // Limita crecimiento extremo solo si rompe mucho el diseño
                    >
                        {label}
                    </Text>
                </View>
                {/* El Badge es visual. Para accesibilidad usamos accessibilityState={{ checked: true }} */}
                {isActive && (
                    <View
                        style={[styles.checkBadge, { backgroundColor: colors.accent }]}
                        importantForAccessibility="no"
                    >
                        <MaterialIcons name="check" size={14} color={colors.surface} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Animated.View 
            entering={FadeIn.duration(400)}
            style={[
                styles.card, 
                { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border 
                }
            ]}
        >
            {/* --- HEADER --- */}
            <View style={styles.headerRow} accessibilityRole="header">
                <View style={styles.titleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        {t('theme.titleHeader')}
                    </Text>
                </View>
            </View>

            {/* --- CONTENIDO --- */}
            <View
                style={styles.contentContainer}
                // Agrupamos los radios para que el lector sepa que pertenecen al mismo set
                accessibilityRole="radiogroup"
                accessibilityLabel={t('theme.choose_theme_label')}
            >
                <Text
                    style={[styles.settingLabel, { color: colors.textSecondary }]}
                    importantForAccessibility="no" // Opcional: si el radiogroup ya tiene label, esto puede ser redundante
                >
                    {t('theme.title')}
                </Text>
                
                <View style={styles.themeSelectorContainer}>
                    <ThemeOption 
                        mode="light" 
                        icon="wb-sunny" 
                        label={t('theme.light')}
                        colors={colors}
                    />
                    <ThemeOption 
                        mode="dark" 
                        icon="nights-stay" 
                        label={t('theme.dark')} 
                        colors={colors}
                    />
                </View>

                <View style={{ height: 5 }} />

                <Text
                    style={[styles.settingLabel, { color: colors.textSecondary }]}
                    importantForAccessibility="no" // Opcional: si el radiogroup ya tiene label, esto puede ser redundante
                >
                    {t('icons.title')}
                </Text>
                <View style={styles.themeSelectorContainer}>
                    <IconThemeOptions
                        mode="material"
                        icon="apps"
                        label={t('icons.material')}
                        colors={colors}
                    />
                    <IconThemeOptions
                        mode="painted"
                        icon="brush"
                        label={t('icons.painted')}
                        colors={colors}
                    />
                </View>

            </View>
        </Animated.View>
    );
}
