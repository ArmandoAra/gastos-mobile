import React, { RefObject } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Keyboard,
    AccessibilityInfo,
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring, 
    FadeInLeft,
    FadeInRight
} from 'react-native-reanimated';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';
import { Category } from '../../../interfaces/data.interface';
import { ICON_OPTIONS } from '../../../constants/icons';
import { Icon } from 'react-native-paper';
import useCategoriesStore from '../../../stores/useCategoriesStore';
import { de } from 'date-fns/locale';
import { defaultCategories } from '../../../constants/categories';
import { useTransactionForm } from '../../../hooks/useTransactionForm';

interface CategoryAndAmountInputProps {
    selectedCategory: Category | null;
    amount: string;
    setAmount: (value: string) => void;
    amountInputRef?: RefObject<TextInput | null>;
    handleCategoryClick: (event: any) => void;
    colors: ThemeColors;
    onOpenCalculator: () => void;
}

export default function CategoryAndAmountInput({
    selectedCategory,
    amount = '',
    setAmount,
    amountInputRef,
    handleCategoryClick,
    colors,
    onOpenCalculator
}: CategoryAndAmountInputProps) {
    const { t } = useTranslation();
    const scale = useSharedValue(1);

    const handlePressIn = () => { scale.value = withSpring(0.95); };
    const handlePressOut = () => { scale.value = withSpring(1); };

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));



    const { icon: IconCategory, color } = ICON_OPTIONS.find(icon => icon.label === selectedCategory?.icon) || {};

    return (
        <View style={styles.container}>
            {/* 1. SELECCIÓN DE CATEGORÍA */}
            <View style={styles.categoryColumn}>
                <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                    maxFontSizeMultiplier={1.5} // Evita que labels auxiliares rompan el layout
                    numberOfLines={1}
                >
                    {t('transactions.category', 'CATEGORY')}
                </Text>
                
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleCategoryClick}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    accessibilityRole="button"
                    accessibilityLabel={t('accessibility.select_category', 'Select Category')}
                    accessibilityHint={selectedCategory ? `${t('common.current')}: ${selectedCategory.name}` : t('common.none_selected')}
                >
                    <Animated.View entering={FadeInLeft} style={styles.iconContainer}>
                        <Animated.View style={animatedIconStyle}>
                            <View
                                style={[styles.gradient, { borderColor: colors.border, backgroundColor: selectedCategory?.color || colors.primary }]}
                            >
                                {selectedCategory && IconCategory ? (
                                    <IconCategory size={28} color={colors.surface} />
                                ) : (
                                    <MaterialIcons name="category" size={28} color={colors.textSecondary} />
                                )}
                            </View>
                        </Animated.View>
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* 2. ENTRADA DE MONTO */}
            <View style={styles.amountColumn}>
                <Text
                    style={[styles.label, { color: colors.textSecondary }]}
                    maxFontSizeMultiplier={1.5}
                    numberOfLines={1}
                >
                    {t('transactions.amount', 'AMOUNT')}* ({amount.length}/12)
                </Text>
                
                <Animated.View
                    entering={FadeInRight}
                    style={[
                        styles.inputWrapper,
                        { backgroundColor: colors.surface, borderColor: colors.border }
                    ]}
                >
                    <TextInput
                        ref={amountInputRef}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        maxLength={12}
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="decimal-pad"
                        style={[styles.input, { color: colors.text }]}
                        // Accesibilidad
                        accessibilityLabel={t('accessibility.amount_input', 'Amount input')}
                        // Escalado dinámico
                        allowFontScaling={true} // Permitir que el input crezca
                    />

                    {/* BOTÓN CALCULADORA */}
                    <TouchableOpacity
                        onPress={() => {
                            Keyboard.dismiss();
                            onOpenCalculator();
                            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('accessibility.calculator_opened', 'Calculator keyboard opened'));
                        }}
                        style={[styles.calcButton, { backgroundColor: colors.text }]} // Alto contraste
                        accessibilityRole="button"
                        accessibilityLabel={t('accessibility.open_calculator', 'Open Calculator')}
                        accessibilityHint={t('accessibility.calculator_hint', 'Opens a numeric keypad with basic math functions')}
                    >
                        <MaterialIcons
                            name="calculate"
                            size={28} // Tamaño un poco más grande para mejor visibilidad
                            color={colors.surface}
                        />
                    </TouchableOpacity>


                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end',
        width: '100%',
        paddingVertical: 8,
    },
    // --- COLUMNA CATEGORÍA ---
    categoryColumn: {
        alignItems: 'center',
        flexShrink: 0, // No se encoge
        maxWidth: 80, // Limita el ancho para que no empuje el input
    },
    iconContainer: {
        // Wrapper para sombras si se desea en el futuro
        minWidth: 58,
        minHeight: 58,
    },
    gradient: {
        // Dimensiones flexibles con mínimos para accesibilidad
        minWidth: 58,
        minHeight: 58,
        padding: 12, // Padding interno asegura que el icono grande no toque bordes
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.8,
    },

    // --- COLUMNA MONTO ---
    amountColumn: {
        flex: 1, // Toma todo el espacio restante
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        // Altura mínima en lugar de fija para permitir crecimiento de fuente
        minHeight: 58,
        borderRadius: 18,
        borderWidth: 1.5,
        paddingLeft: 16,
        paddingRight: 6,
    },
    input: {
        flex: 1,
        fontSize: 22, // Fuente base grande
        fontWeight: '700',
        minHeight: 44, // Altura táctil mínima
        paddingVertical: 0, // Reset padding
    },
    calcButton: {
        width: 46,
        height: 46,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        // Asegura que el botón no se deforme
        aspectRatio: 1,
    },

    // --- TEXTOS ---
    label: {
        fontSize: 11,
        fontWeight: '800',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 4,
    }
});