import { MaterialIcons } from "@expo/vector-icons";
import { t } from "i18next";
import { TouchableOpacity, View, Text } from "react-native";
import { useSettingsStore } from "../../../stores/settingsStore";
import { styles } from "../styles/settingsStyles";
import { ThemeColors } from "../../../types/navigation";


type ThemeOptions = 'light' | 'dark';


 export const ThemeOption = ({ 
        mode, 
        icon, 
        label ,
        colors
    }: { 
        mode: ThemeOptions, 
        icon: keyof typeof MaterialIcons.glyphMap, 
        label: string ,
        colors: ThemeColors
    }) => {
        
        const { theme, setTheme } = useSettingsStore();
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