import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    AccessibilityInfo,
    AccessibilityActionInfo,
    LayoutChangeEvent
} from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming,
} from 'react-native-reanimated';
import { runOnJS } from "react-native-worklets"
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { formatCurrency } from '../../../utils/helpers';
import WarningMessage from './WarningMessage';
import EditTransactionForm from '../../../components/forms/EditTransactionForm';
import { Transaction, TransactionType } from '../../../interfaces/data.interface';
import { ICON_OPTIONS } from '../../../constants/icons';
import { CategoryLabel } from '../../../api/interfaces';
import { ThemeColors } from '../../../types/navigation';
import { useAuthStore } from '../../../stores/authStore';
import useDataStore from '../../../stores/useDataStore';
import { useTranslation } from 'react-i18next';
import EditTransactionFormMobile from '../../../components/forms/EditTransactionForm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface TransactionItemProps {
    transaction: Transaction;
    onSave: (updatedTransaction: Transaction) => Promise<Transaction | null | undefined>;
    onDelete: (id: string, accountId: string, amount: number, type: TransactionType) => void;
    colors: ThemeColors;
}

export const TransactionItemMobile = React.memo(({
    transaction,
    onSave,
    onDelete,
    colors,
}: TransactionItemProps) => {
    const { t } = useTranslation();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const { currencySymbol } = useAuthStore();
    const { getAccountNameById } = useDataStore();

    // Valores Animados - altura ahora es dinámica
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue<number | null>(null);
    const opacity = useSharedValue(1);
    const marginBottom = useSharedValue(8);

    // Datos Memoizados
    const categoryData = useMemo(() => {
        const categoryKey = transaction.type as keyof typeof ICON_OPTIONS;
        const categoryIcons = ICON_OPTIONS[categoryKey] || [];
        const found = categoryIcons.find(
            icon => icon.label === transaction.category_name as CategoryLabel
        );
        return {
            IconComponent: found?.icon,
            color: found?.gradientColors ? found.gradientColors[0] : '#B0BEC5',
        };
    }, [transaction.type, transaction.category_name]);

    const accountName = useMemo(() => {
        return getAccountNameById(transaction.account_id);
    }, [transaction.account_id, getAccountNameById]);

    const { IconComponent, color } = categoryData;
    const isExpense = transaction.type === TransactionType.EXPENSE;
    const formattedDate = format(new Date(transaction.date), 'MM/dd/yyyy - HH:mm');
    const formattedAmount = `${isExpense ? '-' : '+'}${currencySymbol} ${formatCurrency(Math.abs(transaction.amount))}`;

    // Callback para capturar la altura real del contenido
    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        if (itemHeight.value === null) {
            itemHeight.value = height;
        }
    }, []);

    // Lógica de Borrado
    const performDelete = () => {
        setIsWarningOpen(false);
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('common.deleted'));

        // Animación de salida
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 300 });
        itemHeight.value = withTiming(0, { duration: 300 });
        marginBottom.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, (finished) => {
            if (finished) {
                runOnJS(onDelete)(
                    transaction.id, 
                    transaction.account_id, 
                    transaction.amount, 
                    transaction.type as TransactionType
                );
            }
        });
    };

    const handleCancelDelete = () => {
        setIsWarningOpen(false);
        translateX.value = withSpring(0);
    };

    // Gesto Swipe
    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd(() => {
            if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
                runOnJS(setIsWarningOpen)(true);
            } else {
                translateX.value = withSpring(0);
            }
        });

    // Estilos Animados
    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const rContainerStyle = useAnimatedStyle(() => ({
        height: itemHeight.value === null ? undefined : itemHeight.value,
        marginBottom: marginBottom.value,
        opacity: opacity.value,
        overflow: 'hidden',
    }));

    const rBackgroundStyle = useAnimatedStyle(() => {
        const isSwipe = Math.abs(translateX.value) > 0;
        return {
            backgroundColor: isSwipe ? colors.error : 'transparent',
            justifyContent: translateX.value < 0 ? 'flex-end' : 'flex-start', 
        };
    });

    // Accesibilidad Actions
    const accessibilityActions: AccessibilityActionInfo[] = [
        { name: 'delete', label: t('common.delete') },
        { name: 'activate', label: t('common.edit') }
    ];

    const handleAccessibilityAction = (event: any) => {
        switch (event.nativeEvent.actionName) {
            case 'delete':
                setIsWarningOpen(true);
                break;
            case 'activate':
                setIsEditOpen(true);
                break;
        }
    };

    return (
        <Animated.View
            style={[styles.containerWrapper, rContainerStyle]}
            onLayout={handleLayout}
        >
            
            {/* FONDO (Swipe Actions) */}
            <Animated.View
                style={[StyleSheet.absoluteFill, styles.backgroundContainer, rBackgroundStyle]}
                importantForAccessibility="no"
            >
                <View style={[styles.deleteIconContainer, { left: 20 }]}>
                    <MaterialIcons name="delete" size={24} color={colors.text} />
                </View>
                <View style={[styles.deleteIconContainer, { right: 20 }]}>
                    <MaterialIcons name="delete" size={24} color={colors.text} />
                </View>
            </Animated.View>

            {/* CONTENIDO PRINCIPAL */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.itemContainer,
                        rStyle,
                        { borderColor: colors.border, backgroundColor: colors.surface }
                    ]}
                >
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setIsEditOpen(true)}
                        style={styles.touchableContent}
                        // Accesibilidad
                        accessibilityRole="button"
                        accessibilityLabel={`${transaction.description}, ${formattedAmount}, ${transaction.category_name}`}
                        accessibilityHint={t('accessibility.swipe_hint', 'Tap to edit, use actions to delete')}
                        accessibilityActions={accessibilityActions}
                        onAccessibilityAction={handleAccessibilityAction}
                    >
                        {/* 1. Avatar */}
                        <View style={[styles.avatar, { backgroundColor: color }]}>
                            {IconComponent ? (
                                <IconComponent size={24} color={colors.text} />
                            ) : (
                                    <MaterialIcons name="shopping-bag" size={24} color={colors.text} />
                            )}
                        </View>

                        {/* 2. Textos (Flexible) */}
                        <View style={styles.textContainer}>
                            <View style={styles.titleRow}>
                                <Text
                                    style={[styles.description, { color: colors.text }]}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {transaction.description || t('common.noDescription')}
                                </Text>
                                {/* Chip flexible */}
                                <View style={[styles.chip, { backgroundColor: color + '33' }]}>
                                    <Text
                                        style={[styles.chipText, { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {transaction.category_name}
                                    </Text>
                                </View>
                            </View>
                            <Text
                                style={[styles.dateText, { color: colors.textSecondary }]}
                                numberOfLines={2}
                            >
                                {formattedDate}
                            </Text>
                        </View>

                        {/* 3. Monto y Cuenta (Fixed/Shrink) */}
                        <View style={styles.amountContainer}>
                            <View style={[styles.accountBadgeContainer, { backgroundColor: colors.primary + '22' }]}>
                                <Text
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                    style={[styles.accountBadgeText, { color: colors.text }]}
                                >
                                    {accountName}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.amountText,
                                    { color: isExpense ? colors.expense : colors.income }
                                ]}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                                minimumFontScale={0.8}
                            >
                                {formattedAmount}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>

            {/* MODALES */}
            {isWarningOpen && (
                <WarningMessage
                    message={t('transactions.deleteConfirm')}
                    onClose={handleCancelDelete}
                    onSubmit={performDelete}
                />
            )}

            <EditTransactionFormMobile
                open={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={onSave}
                transaction={transaction}
                iconOptions={ICON_OPTIONS[transaction.type === TransactionType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE]} 
            />

        </Animated.View>
    );
});

const styles = StyleSheet.create({
    containerWrapper: {
        borderRadius: 12,
        minHeight: 80, // Altura mínima, pero puede crecer
    },
    backgroundContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 10,
    },
    deleteIconContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    itemContainer: {
        borderRadius: 12,
        borderWidth: 0.5,
        height: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    touchableContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16, // Aumentado de 12 a 16 para más espacio
        gap: 12,
        flex: 1,
        minHeight: 80, // Altura mínima para el contenido
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    textContainer: {
        flex: 1,
        gap: 6, // Aumentado de 4 a 6
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4, // Aumentado de 2 a 4
        flexWrap: 'wrap', 
    },
    description: {
        fontSize: 16,
        fontWeight: '500',
        flexShrink: 1,
        lineHeight: 22, // Agregado para mejor legibilidad
    },
    chip: {
        paddingHorizontal: 10, // Aumentado de 8 a 10
        paddingVertical: 4, // Aumentado de 2 a 4
        borderRadius: 12,
        maxWidth: 120, // Aumentado de 100 a 120
    },
    chipText: {
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 14,
    },
    dateText: {
        fontSize: 12,
        lineHeight: 16, // Agregado para mejor legibilidad
    },
    amountContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexShrink: 0,
        gap: 6, // Aumentado de 4 a 6
        minWidth: 90, // Ancho mínimo para evitar compresión
    },
    accountBadgeContainer: {
        paddingHorizontal: 10, // Aumentado de 8 a 10
        paddingVertical: 4, // Aumentado de 2 a 4
        borderRadius: 6,
        maxWidth: 100, // Aumentado de 80 a 100
        minHeight: 22, // Altura mínima para el badge
    },
    accountBadgeText: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 14,
    },
    amountText: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 20, // Agregado para mejor legibilidad
    },
});