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

interface AppearanceSectionProps {
    colors: ThemeColors;
}

export default function AppearanceSection({ colors }: AppearanceSectionProps) {
    const { t } = useTranslation();
    const { theme, setTheme } = useSettingsStore();

    // Helper para renderizar opciones de tema
    const ThemeOption = ({ 
        mode, 
        icon, 
        label 
    }: { 
        mode: 'light' | 'dark', 
        icon: keyof typeof MaterialIcons.glyphMap, 
        label: string 
    }) => {
        const isActive = theme === mode;
        
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setTheme(mode)}
                // 1. Accesibilidad: Rol de Radio Button
                accessibilityRole="radio"
                accessibilityState={{ checked: isActive }}
                accessibilityLabel={`${t('theme.switch_to')} ${label}`}
                accessibilityHint={isActive ? t('theme.already_active') : t('theme.activate_hint')}

                style={[
                    styles.themeBtn,
                    { 
                        backgroundColor: isActive ? colors.surfaceSecondary : colors.surface,
                        borderColor: isActive ? colors.accent : colors.border,
                        borderWidth: isActive ? 2 : 1, // Borde un poco más grueso para mejor visibilidad
                    }
                ]}
            >
                <View style={styles.themeContent}>
                    {/* Icono decorativo */}
                    <MaterialIcons 
                        name={icon} 
                        size={28} // Icono ligeramente más grande
                        color={isActive ? colors.accent : colors.textSecondary} 
                        importantForAccessibility="no"
                    />
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
                    />
                    <ThemeOption 
                        mode="dark" 
                        icon="nights-stay" 
                        label={t('theme.dark')} 
                    />
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 0.5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Permite que el contenedor crezca
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'FiraSans-Regular',
        flexShrink: 1, // Permite wrap si el texto es gigante
    },
    contentContainer: {
        gap: 12,
    },
    settingLabel: {
        fontSize: 12,
        fontFamily: 'FiraSans-Bold',
        letterSpacing: 0.5,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    themeSelectorContainer: {
        flexDirection: 'row',
        gap: 12,
        // CLAVE PARA ACCESIBILIDAD VISUAL:
        flexWrap: 'wrap', // Permite que los botones bajen si el texto crece mucho
    },
    // Estilos de los botones de tema
    themeBtn: {
        flex: 1,
        // Ancho mínimo para que no se hagan minúsculos en wrap. 
        // 40% asegura que quepan 2 en fila normal, pero 1 en fila si crece.
        minWidth: '40%',
        minHeight: 80, // Altura mínima táctil grande para este tipo de tarjeta
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    themeContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
    },
    themeBtnText: {
        fontSize: 16, // Texto base un poco más grande
        textAlign: 'center',
    },
    checkBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 24, // Área un poco más grande
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    }
});