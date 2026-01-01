import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    Platform 
} from 'react-native';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../../../stores/settingsStore';
import { ThemeColors } from '../../../types/navigation';

interface AppearanceSectionProps {
    colors: ThemeColors;
}

export default function AppearanceSection({ colors }: AppearanceSectionProps) {
    // 1. Store
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
                style={[
                    styles.themeBtn,
                    { 
                        backgroundColor: isActive ? colors.surfaceSecondary : colors.surface,
                        borderColor: isActive ? colors.accent : colors.border,
                        borderWidth: isActive ? 1.5 : 1,
                    }
                ]}
            >
                <View style={styles.themeContent}>
                    <MaterialIcons 
                        name={icon} 
                        size={24} 
                        color={isActive ? colors.accent : colors.textSecondary} 
                    />
                    <Text style={[
                        styles.themeBtnText, 
                        { 
                            color: isActive ? colors.text : colors.textSecondary,
                            fontWeight: isActive ? '700' : '500'
                        }
                    ]}>
                        {label}
                    </Text>
                </View>

                {isActive && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                        <MaterialIcons name="check" size={12} color={colors.text} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Animated.View 
            entering={FadeIn.duration(400)}
            layout={Layout.springify()}
            style={[
                styles.card, 
                { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border 
                }
            ]}
        >
            {/* --- HEADER --- */}
            <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Appearance</Text>
                </View>
            </View>

            {/* --- CONTENIDO --- */}
            <View style={styles.contentContainer}>
                <Text style={[styles.settingLabel, { color: colors.textSecondary }]}>
                    App Theme
                </Text>
                
                <View style={styles.themeSelectorContainer}>
                    <ThemeOption 
                        mode="light" 
                        icon="wb-sunny" 
                        label="Light Mode" 
                    />
                    <ThemeOption 
                        mode="dark" 
                        icon="nights-stay" 
                        label="Dark Mode" 
                    />
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
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
    },
    headerTitle: {
        fontSize: 24, // Coincide con AccountManagement
        fontWeight: '300',
    },
    contentContainer: {
        gap: 12,
    },
    settingLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    themeSelectorContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    // Estilos de los botones de tema
    themeBtn: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative', // Para el badge
        // Sombra suave en los botones
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    themeContent: {
        alignItems: 'center',
        gap: 8,
    },
    themeBtnText: {
        fontSize: 14,
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    }
});