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
import TransactionForm from '../../../components/forms/TransactionForm';

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

    // Llamada al Hook que contiene toda la lógica
    const {
        categoryIconData,
        accountName,
        formattedDate,
        formattedAmount,
        isExpense,
        t,
        isEditOpen,
        setIsEditOpen,
        isWarningOpen,
        handleLayout,
        handleEditPress,
        performDelete,
        handleCancelDelete,
        handleAccessibilityAction,
        panGesture,
        rStyle,
        rContainerStyle,
        rBackgroundStyle,
        accessibilityActions
    } = useTransactionItemLogic({ transaction, onDelete, colors });

    const { IconComponent, color } = categoryIconData;

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
                        onPress={handleEditPress}
                        style={styles.touchableContent}
                        accessibilityRole="button"
                        accessibilityLabel={`${transaction.description}, ${formattedAmount}, ${transaction.category_icon_name}`}
                        accessibilityHint={t('accessibility.swipe_hint', 'Tap to edit, use actions to delete')}
                        accessibilityActions={accessibilityActions}
                        onAccessibilityAction={handleAccessibilityAction}
                    >
                        {/* 1. Avatar */}
                        <View style={[styles.avatar, { backgroundColor: color }]}>
                            {IconComponent ? (
                                <IconComponent size={28} color={colors.text} style={{
                                    backgroundColor: colors.surface,
                                    borderRadius: 50,
                                    padding: 4,
                                }} />
                            ) : (
                                    <MaterialIcons name="shopping-bag" size={22} color={colors.text} />
                            )}
                        </View>

                        {/* 2. Textos */}
                        <View style={styles.textContainer}>
                            <View style={styles.titleRow}>
                                <Text
                                    style={[styles.description, { color: colors.text }]}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {transaction.description || t('common.noDescription')}
                                </Text>
                                <View style={[styles.chip, { backgroundColor: color + '33' }]}>
                                    <Text
                                        style={[styles.chipText, { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {t(`icons.${transaction.slug_category_name[0]}`, transaction.slug_category_name[0])}
                                    </Text>
                                </View>
                            </View>
                            <Text
                                style={[styles.dateText, { color: colors.text }]}
                                numberOfLines={2}
                            >
                                {formattedDate}
                            </Text>
                        </View>

                        {/* 3. Monto y Cuenta */}
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
            <TransactionForm
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                transactionToEdit={transaction}
            />

        </Animated.View>
    );
});

const styles = StyleSheet.create({
    containerWrapper: {
        borderRadius: 12,
        minHeight: 80,
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
        padding: 16,
        gap: 12,
        flex: 1,
        minHeight: 80,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        elevation: 5,
    },
    textContainer: {
        flex: 1,
        gap: 6,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        flexWrap: 'wrap', 
    },
    description: {
        fontSize: 16,
        fontFamily: 'FiraSans-Regular',
        flexShrink: 1,
        lineHeight: 22,
    },
    chip: {
        paddingHorizontal: 10,
        paddingVertical: 1,
        borderRadius: 12,
        maxWidth: 120,
    },
    chipText: {
        fontSize: 11,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 14,
    },
    dateText: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'FiraSans-Regular',
    },
    amountContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexShrink: 0,
        gap: 6,
        minWidth: 90,
    },
    accountBadgeContainer: {
        paddingHorizontal: 10,
        paddingVertical: 1,
        borderRadius: 6,
        maxWidth: 100,
        minHeight: 22,
    },
    accountBadgeText: {
        fontSize: 11,
        fontFamily: 'FiraSans-Regular',
        lineHeight: 14,
    },
    amountText: {
        fontSize: 16,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 20,
    },
});