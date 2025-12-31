import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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

// Tus imports...


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
    // 1. Estados
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isWarningOpen, setIsWarningOpen] = useState(false);

    // 2. Valores Animados
    const translateX = useSharedValue(0);
    const itemHeight = useSharedValue(75); // Altura estimada de la fila
    const opacity = useSharedValue(1);
    const marginBottom = useSharedValue(8); // Margen inferior para colapsar

    // 3. Memoize Datos (Lógica visual)
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

    const { IconComponent, color } = categoryData;
    const isExpense = transaction.type === TransactionType.EXPENSE;

    // 4. Lógica de Borrado Real (Se llama al confirmar en el Modal)
    const performDelete = () => {
        // Cerrar modal primero
        setIsWarningOpen(false);

        // Animar salida visual (colapso)
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
        // Regresar la fila a su lugar
        translateX.value = withSpring(0);
    };

    // 5. Gesto de Swipe
    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd(() => {
            if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
                // Disparar apertura del modal en el hilo JS
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
        height: itemHeight.value,
        marginBottom: marginBottom.value,
        opacity: opacity.value,
        overflow: 'hidden', // Necesario para que desaparezca al reducir altura
    }));

    const rBackgroundStyle = useAnimatedStyle(() => {
        const isSwipeLeft = translateX.value < 0;
        const isSwipeRight = translateX.value > 0;
        return {
            backgroundColor: (isSwipeLeft || isSwipeRight) ? colors.error : 'transparent',
            justifyContent: isSwipeLeft ? 'flex-end' : 'flex-start', 
        };
    });

    return (
        <Animated.View style={[styles.containerWrapper, rContainerStyle]}>
            
            {/* FONDO (Iconos de borrar) */}
            <Animated.View style={[StyleSheet.absoluteFill, styles.backgroundContainer, rBackgroundStyle]}>
                <View style={[styles.deleteIconContainer, { left: 20 }]}>
                    <MaterialIcons name="delete" size={24} color={colors.text} />
                </View>
                <View style={[styles.deleteIconContainer, { right: 20 }]}>
                    <MaterialIcons name="delete" size={24} color={colors.text} />
                </View>
            </Animated.View>

            {/* CONTENIDO (Swipeable) */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.itemContainer, rStyle, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setIsEditOpen(true)}
                        style={styles.touchableContent}
                    >
                        {/* Avatar */}
                        <View style={[styles.avatar, { backgroundColor: color }]}>
                            {IconComponent ? (
                                <IconComponent size={24} color={colors.text} />
                            ) : (
                                    <MaterialIcons name="shopping-bag" size={24} color={colors.text} />
                            )}
                        </View>

                        {/* Textos */}
                        <View style={styles.textContainer}>
                            <View style={styles.titleRow}>
                                <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
                                    {transaction.description || 'No Description'}
                                </Text>
                                <View style={[styles.chip, { backgroundColor: color + '33' }]}>
                                    <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                                        {transaction.category_name}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                {format(new Date(transaction.date), 'MM/dd/yyyy - HH:mm')}
                            </Text>
                        </View>

                        {/* Amount */}
                        <View style={styles.amountContainer}>
                            <Text style={[styles.amountText, { color: isExpense ? '#ef4444' : '#10b981' }]}>
                                {isExpense ? '-' : '+'}${formatCurrency(Math.abs(transaction.amount).toFixed(2))}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>

            {/* MODALES (Fuera de la vista animada interna, pero dentro del componente) */}
            
            {/* 1. Modal de Advertencia (Delete) */}
            {isWarningOpen && (
                <WarningMessage
                    message="Are you sure you want to delete this transaction?" //TODO - i18n
                    onClose={handleCancelDelete}
                    onSubmit={performDelete}
                />
            )}

            {/* 2. Modal de Edición */}
            <EditTransactionForm
                open={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={onSave}
                transaction={transaction}
                iconOptions={[]} // Pasa tus opciones reales aquí
            />

        </Animated.View>
    );
});

const styles = StyleSheet.create({
    containerWrapper: {
        borderRadius: 12,
        // No pongas overflow hidden aquí si quieres que la sombra se vea, 
        // pero sí es necesario para la animación de colapso de altura.
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
        borderWidth: 0.4,
        height: '100%', // Ocupar toda la altura del wrapper animado
    },
    touchableContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    description: {
        fontSize: 16,
        fontWeight: '400',
        maxWidth: 150,
    },
    chip: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    chipText: {
        fontSize: 10,
        fontWeight: '500',
    },
    dateText: {
        fontSize: 12,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '500',
    },
});