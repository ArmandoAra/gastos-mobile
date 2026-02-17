import React, { RefObject, useEffect } from 'react';
import { 
    View, 
    Text, 
    // TextInput, // Ya no lo necesitamos en el render
    TouchableOpacity, 
    StyleSheet, 
    Keyboard,
    AccessibilityInfo,
    Platform,
    Pressable
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring, 
    FadeInLeft,
    FadeInRight,
    SlideInRight,
    SlideOutLeft,
    SlideInLeft,
    SlideOutRight,
    FadeIn
} from 'react-native-reanimated';
import { ThemeColors } from '../../../types/navigation';
import { useTranslation } from 'react-i18next';
import { Category } from '../../../interfaces/data.interface';
import { ICON_OPTIONS } from '../../../constants/icons';
import useCategoriesStore from '../../../stores/useCategoriesStore';
import { defaultCategories } from '../../../constants/categories';
import { useSettingsStore } from '../../../stores/settingsStore';
import { formatCurrency } from '../../../utils/helpers';

interface CategoryAndAmountInputProps {
    isReady?: boolean;
    selectedCategory: Category | null;
    amount: string;
    setAmount: (value: string) => void;
    // Aunque ya no usamos TextInput, mantengo el tipo RefObject por si lo usas en el padre,
    // pero idealmente deberías quitarlo de las props si no se usa para focus.
    amountInputRef?: any; 
    handleCategoryClick: (event: any) => void;
    colors: ThemeColors;
    onOpenCalculator: () => void;
}

export default function CategoryAndAmountInput({
    isReady,
    selectedCategory,
    amount = '',
    handleCategoryClick,
    colors,
    onOpenCalculator
}: CategoryAndAmountInputProps) {
    const iconsOptions = useSettingsStore(state => state.iconsOptions);
    const { t } = useTranslation();
    const scale = useSharedValue(1);

    const handlePressIn = () => { scale.value = withSpring(0.95); };
    const handlePressOut = () => { scale.value = withSpring(1); };

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const { icon: IconCategory } = ICON_OPTIONS[iconsOptions].find(icon => icon.label === selectedCategory?.icon) || {};



    const handleAmountPress = () => {
        // Aseguramos que cualquier teclado previo se cierre
        Keyboard.dismiss();
        onOpenCalculator();
        if (Platform.OS !== 'web') {
            AccessibilityInfo.announceForAccessibility(t('accessibility.calculator_opened', 'Calculator keyboard opened'));
        }
    };

    // Helper para saber si hay valor o mostramos placeholder
    const hasAmount = amount && amount.length > 0;

    return (
        <View style={styles.container}>
            {/* 1. SELECCIÓN DE CATEGORÍA */}
            <View style={styles.categoryColumn}>
                {isReady && <Animated.View entering={FadeIn.delay(200)}>
                    <Text
                        style={[styles.label, { color: colors.textSecondary }]}
                        maxFontSizeMultiplier={1.5}
                        numberOfLines={1}
                    >
                        {t('transactions.category', 'CATEGORY')}
                    </Text>
                </Animated.View>}
                
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
                        {isReady && <Animated.View
                            entering={SlideInLeft.duration(200)}
                            exiting={SlideOutRight.duration(300)}
                            style={animatedIconStyle}>
                            <View
                                style={[styles.gradient, {
                                    borderColor: iconsOptions === 'painted' ? 'transparent' : colors.border,
                                    padding: iconsOptions === 'painted' ? 0 : 12,
                                    backgroundColor: iconsOptions === 'painted' ? 'transparent' : selectedCategory?.color || colors.surface
                                }]}
                            >
                                {selectedCategory && IconCategory ? (
                                    <IconCategory color={colors.text} style={{
                                        width: iconsOptions === 'painted' ? 60 : 32,
                                        height: iconsOptions === 'painted' ? 60 : 32,
                                        backgroundColor: iconsOptions === 'painted' ? 'transparent' : colors.surface,
                                        borderRadius: iconsOptions === 'painted' ? 0 : 50,
                                        padding: iconsOptions === 'painted' ? 0 : 4,
                                    }} />
                                ) : (
                                    <MaterialIcons name="category" size={28} color={colors.textSecondary} />
                                )}
                            </View>
                        </Animated.View>}
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* 2. ENTRADA DE MONTO (Ahora es solo visualización) */}
            <View style={styles.amountColumn}>
                {isReady && <Animated.View entering={FadeIn.delay(300)}>
                    <Text
                        style={[styles.label, { color: colors.textSecondary }]}
                        maxFontSizeMultiplier={1.5}
                        numberOfLines={1}
                    >
                        {t('transactions.amount', 'AMOUNT')}*
                    </Text>
                </Animated.View>}

                {isReady && <Animated.View
                    entering={SlideInRight.duration(300)}
                    style={[
                        styles.inputWrapper,
                        { backgroundColor: colors.surface, borderColor: colors.border }
                    ]}
                >
                    {/* Usamos Pressable como contenedor interactivo principal */}
                    <Pressable
                        onPress={handleAmountPress}
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                        accessibilityRole="button"
                        accessibilityLabel={`${t('transactions.amount')}, ${hasAmount ? amount : '0'}`}
                        accessibilityHint={t('accessibility.open_calculator', 'Double tap to open calculator')}
                    >
                        <Text
                            style={[
                                styles.textDisplay,
                                {
                                    color: hasAmount ? colors.text : colors.textSecondary,
                                    // Si quieres simular un cursor parpadeando, podrías agregar una View extra aquí
                                }
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit={true} // Útil si el número es muy largo
                            minimumFontScale={0.5}
                        >
                            {hasAmount ? amount : "0,00"}
                        </Text>
                    </Pressable>

                </Animated.View>}
            </View>
            <Animated.View />
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
        minHeight: 90,
        alignItems: 'center',
        flexShrink: 0,
        maxWidth: 80,
    },
    iconContainer: {
        minWidth: 48,
        minHeight: 48,
    },
    gradient: {
        minWidth: 48,
        minHeight: 48,
        borderRadius: 50,
        borderWidth: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },

    // --- COLUMNA MONTO ---
    amountColumn: {
        minHeight: 90,
        flex: 1, 
    },
    inputWrapper: {
        minHeight: 58,
        borderRadius: 18,
        borderWidth: 1.5,
        paddingLeft: 16,
        paddingRight: 6,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    // NUEVO ESTILO: Reemplaza al estilo 'input' anterior
    textDisplay: {
        flex: 1,
        fontSize: 22,
        fontFamily: 'FiraSans-Bold',
        // Alineación vertical para que parezca un input
        textAlignVertical: 'center',
        paddingVertical: 0,
    },
    calcButton: {
        width: 46,
        height: 46,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        aspectRatio: 1,
    },

    // --- TEXTOS ---
    label: {
        fontSize: 11,
        fontFamily: 'FiraSans-Bold',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 4,
    }
});