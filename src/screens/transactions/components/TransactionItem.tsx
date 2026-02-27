import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import WarningMessage from './WarningMessage';
import { Transaction, TransactionType } from '../../../interfaces/data.interface';
import { ThemeColors } from '../../../types/navigation';
import { useTransactionItemLogic } from '../hooks/useTransactionItemLogic';
import { useSettingsStore } from '../../../stores/settingsStore';
import { defaultCategoryNames } from '../../../constants/categories';
import { globalStyles } from '../../../theme/global.styles';

interface TransactionItemProps {
    transaction: Transaction;
    onDelete: (id: string, accountId: string, amount: number, type: TransactionType) => void;
    onEditPress: (transaction: Transaction) => void;
    colors: ThemeColors;
}

export const TransactionItemMobile = React.memo(({
    transaction,
    onDelete,
    onEditPress,
    colors,
}: TransactionItemProps) => {

    const iconsOptions = useSettingsStore(state => state.iconsOptions);

    const {
        categoryIconData,
        accountName,
        formattedDate,
        formattedAmount,
        isExpense,
        t,
        isWarningOpen,
        handleLayout,
        prepareForEdit,
        performDelete,
        handleCancelDelete,
        handleAccessibilityAction,
        panGesture,
        rStyle,
        rContainerStyle,
        rBackgroundStyle,
        accessibilityActions
    } = useTransactionItemLogic({ transaction, onDelete, colors });

    const { IconComponent, color, displayName } = categoryIconData;

    const handlePress = () => {
        prepareForEdit();
        onEditPress(transaction);
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
                    <View style={styles.deleteIconCircle}>
                        <MaterialIcons name="delete" size={20} color="#fff" />
                    </View>
                </View>
                <View style={[styles.deleteIconContainer, { right: 20 }]}>
                    <View style={styles.deleteIconCircle}>
                        <MaterialIcons name="delete" size={20} color="#fff" />
                    </View>
                </View>
            </Animated.View>

            {/* CONTENIDO PRINCIPAL */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.itemContainer,
                        rStyle,
                        { backgroundColor: colors.surface }
                    ]}
                >
                    <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={handlePress}
                        style={styles.touchableContent}
                        accessibilityRole="button"
                        accessibilityLabel={`${transaction.description}, ${formattedAmount}, ${transaction.category_icon_name}`}
                        accessibilityHint={t('accessibility.swipe_hint', 'Tap to edit, use actions to delete')}
                        accessibilityActions={accessibilityActions}
                        onAccessibilityAction={handleAccessibilityAction}
                    >
                        {/* 1. Avatar — mismo estilo que iconBox de CategoryRow */}
                        <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
                            {IconComponent ? (
                                <IconComponent
                                    color={color}
                                    style={{
                                        width: iconsOptions === 'painted' ? 52 : 26,
                                        height: iconsOptions === 'painted' ? 52 : 26,
                                        backgroundColor: 'transparent',
                                        borderRadius: 50,
                                    }}
                                />
                            ) : (
                                    <MaterialIcons name="shopping-bag" size={20} color={color} />
                            )}
                        </View>

                        {/* 2. Textos — columna central */}
                        <View style={styles.textContainer}>
                            <Text
                                style={[styles.description, { color: colors.text }]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {transaction.description || t('common.noDescription')}
                            </Text>

                            {/* Fila inferior: fecha + chip de categoría */}
                            <View style={styles.metaRow}>
                                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                    {formattedDate}
                                </Text>
                                <View style={[styles.chip, { backgroundColor: color + '22' }]}>
                                    <Text
                                        style={[styles.chipText, { color: color }]}
                                        numberOfLines={1}
                                    >
                                        {defaultCategoryNames.some(n => n === displayName)
                                            ? t(`icons.${displayName}`)
                                            : displayName}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* 3. Monto + cuenta — columna derecha */}
                        <View style={styles.amountContainer}>
                            <Text
                                style={[
                                    globalStyles.amountSm,
                                    { color: isExpense ? colors.expense : colors.income }
                                ]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.8}
                            >
                                {formattedAmount}
                            </Text>
                            <View style={[styles.accountBadge, { backgroundColor: colors.primary + '18' }]}>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={[styles.accountText, { color: colors.textSecondary }]}
                                >
                                    {accountName}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>

            {isWarningOpen && (
                <WarningMessage
                    message={t('transactions.deleteConfirm')}
                    onClose={handleCancelDelete}
                    onSubmit={performDelete}
                />
            )}
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    containerWrapper: {
        borderRadius: 14,
        minHeight: 72,
    },
    backgroundContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 16,
        backgroundColor: '#FC8181',
    },
    deleteIconContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        justifyContent: 'center',
    },
    deleteIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContainer: {
        borderRadius: 14,
        height: '100%',
        // Sin border — el color de fondo ya delimita la tarjeta
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    touchableContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
        flex: 1,
        minHeight: 72,
    },
    // Avatar — alineado con iconBox de CategoryRow
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 50,           // mismo borderRadius que iconBox (10-12)
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    // Textos
    textContainer: {
        flex: 1,
        gap: 5,
        justifyContent: 'center',
    },
    description: {
        fontSize: 14,
        fontFamily: 'FiraSans-Regular',
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 11,
        fontFamily: 'FiraSans-Regular',
        lineHeight: 14,
    },
    chip: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99, 
    },
    chipText: {
        fontSize: 10,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 14,
    },
    // Columna derecha
    amountContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 5,
        flexShrink: 0,
        minWidth: 80,
    },
    accountBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        maxWidth: 96,
    },
    accountText: {
        fontSize: 10,
        fontFamily: 'FiraSans-Regular',
        lineHeight: 14,
    },
});