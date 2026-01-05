import React from 'react';
import { 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    View,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

// Definición de Enum y Props
export enum addOption {
    Income = "Income",
    Spend = "Spend"
}

interface SubmitButtonProps {
    handleSave: () => void;
    selectedIcon: { id: string; gradientColors: [string, string] } | null;
    option?: addOption;
    loading?: boolean;
    disabled?: boolean;
}

export default function SubmitButton({
    handleSave,
    selectedIcon,
    disabled = false,
    option,
    loading = false
}: SubmitButtonProps) {
    const { t } = useTranslation();

    // 1. Animación de Escala (Press Effect)
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        if (!disabled && !loading) {
            scale.value = withSpring(0.96);
        }
    };

    const handlePressOut = () => {
        if (!disabled && !loading) {
            scale.value = withSpring(1);
        }
    };

    // 2. Lógica de Colores (Estado Deshabilitado)
    const activeColors = selectedIcon?.gradientColors || ['#667eea', '#764ba2'];
    // Gris neutro para estado deshabilitado
    const disabledColors = ['#E0E0E0', '#BDBDBD'];

    const currentColors = disabled ? disabledColors : activeColors;
    const textColor = disabled ? '#888888' : '#FFFFFF';

    return (
        <Animated.View style={[styles.containerWrapper, animatedStyle]}>
            <TouchableOpacity
                onPress={handleSave}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.9}
                style={[styles.touchable, disabled && styles.disabledShadow]}
                // Accesibilidad
                accessibilityRole="button"
                accessibilityLabel={loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                accessibilityState={{ disabled: disabled, busy: loading }}
                accessibilityHint={disabled ? t('accessibility.fill_required', 'Complete all fields to save') : undefined}
            >
                <LinearGradient
                    colors={currentColors as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={textColor} />
                    ) : (
                            <Text
                                style={[styles.text, { color: textColor }]}
                                maxFontSizeMultiplier={1.5} // Evita que el texto crezca excesivamente rompiendo todo
                                numberOfLines={1}
                            >
                                {t('common.save', 'Save')}
                        </Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        width: '100%',
        // Importante: No ponemos height fija aquí
    },
    touchable: {
        width: '100%',
        borderRadius: 12,
        // Sombra suave (Elevation para Android, Shadow para iOS)
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    disabledShadow: {
        // Quitamos la sombra si está deshabilitado para que parezca "plano"
        ...Platform.select({
            ios: { shadowOpacity: 0 },
            android: { elevation: 0 },
        }),
    },
    gradient: {
        // Layout Flexible
        minHeight: 48, // Altura mínima táctil (Standard de accesibilidad)
        paddingVertical: 12, // Permite que el botón crezca si la fuente es gigante
        paddingHorizontal: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        // Borde sutil
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    text: {
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5,
        textAlign: 'center',
    }
});