import React from 'react';
import { 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    View,
    Platform,
    Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Category } from '../../interfaces/data.interface';
import { ThemeColors } from '../../types/navigation';
import { globalStyles } from '../../theme/global.styles';
import { Button } from 'react-native-paper';

// Definición de Enum y Props
export enum addOption {
    Income = "Income",
    Spend = "Spend"
}

interface SubmitButtonProps {
    handleSave: () => void;
    selectedCategory: Category;
    loading?: boolean;
    disabled?: boolean;
    colors: ThemeColors;
}
// Refactorizar
export default function SubmitButton({
    handleSave,
    selectedCategory,
    disabled = false,
    loading = false,
    colors,
}: SubmitButtonProps) {
    const { t } = useTranslation();

    // 1. Animación de Escala (Press Effect)
    const scale = useSharedValue(1);

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


    return (
        <Pressable
                onPress={handleSave}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
            style={[globalStyles.btnPrimary, { backgroundColor: disabled ? colors.textSecondary : selectedCategory?.color || colors.income, elevation: disabled ? 0 : 4 }]}
                // Accesibilidad
                accessibilityRole="button"
                accessibilityLabel={loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                accessibilityState={{ disabled: disabled, busy: loading }}
                accessibilityHint={disabled ? t('accessibility.fill_required', 'Complete all fields to save') : undefined}
            >
            <View
                >
                    {loading ? (
                    <ActivityIndicator size="small" color={disabled ? colors.textSecondary : colors.text} />
                    ) : (
                            <Text
                            style={[globalStyles.bodyTextXl, { fontSize: 16, color: colors.text, fontWeight: 'bold' }]}
                            maxFontSizeMultiplier={1.5} 
                                numberOfLines={1}
                            >
                            {t('common.save', 'Save')}
                        </Text>
                    )}
                </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    containerWrapper: {
        width: '100%',
    },
    disabledShadow: {
        // Quitamos la sombra si está deshabilitado para que parezca "plano"
        ...Platform.select({
            ios: { shadowOpacity: 0 },
            android: { elevation: 0 },
        }),
    },

    text: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 16,
        letterSpacing: 0.5,
        textAlign: 'center',
    }
});