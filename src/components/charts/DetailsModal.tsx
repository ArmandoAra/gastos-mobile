import { t } from 'i18next'
import React, { JSX, useCallback } from 'react'
import { Modal, View, FlatList, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native'
import { FadeInDown } from 'react-native-reanimated'
import { formatCurrency } from '../../utils/helpers'
import Animated from 'react-native-reanimated'
import { Theme } from '@react-navigation/native'
import { ThemeColors } from '../../types/navigation'
import { CategoryModalData } from '../../hooks/useDailyExpenseLogic'
import { globalStyles } from '../../theme/global.styles'
import { MaterialIcons } from '@expo/vector-icons'


interface DetailsModalProps {
    modalVisible: boolean;
    handleCloseModal: () => void;
    modalData: CategoryModalData | null;
    colors: ThemeColors;
    currencySymbol: string;
}

export const DetailsModal = ({ modalVisible, handleCloseModal, modalData, colors, currencySymbol }: DetailsModalProps) => {

    const renderModalTransaction = useCallback(({ item, index }: { item: any; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 40).springify()}
            style={[localStyles.transactionRow]}
            accessible={true}
            accessibilityLabel={`${item.description || t('common.noDescription')}, ${currencySymbol} ${formatCurrency(Math.abs(item.amount))}, ${new Date(item.date).toLocaleDateString()}`}
        >
            {/* Color accent strip */}
            <View style={[localStyles.txStrip, { backgroundColor: modalData?.color }]} />

            <View style={localStyles.txInfoContainer}>
                <Text
                    style={[localStyles.txDescription, { color: colors.text }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {item.description || t('common.noDescription')}
                </Text>
                <Text style={[localStyles.txDate, { color: colors.textSecondary }]}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
            </View>
            <Text
                style={[localStyles.txAmount, { color: colors.expense }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
            >
                -{currencySymbol} {formatCurrency(Math.abs(item.amount))}
            </Text>
        </Animated.View>
    ), [colors, currencySymbol, t, modalData]);


    const keyExtractor = useCallback((item: any) => item.id.toString(), []);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={handleCloseModal}
            accessible={true}
            accessibilityViewIsModal={true}
        >
                <Pressable onPress={handleCloseModal} style={localStyles.backdrop}/>

            <View style={localStyles.modalOverlay}>
                <Animated.View
                    entering={FadeInDown.springify()}
                    style={[localStyles.modalContent, { backgroundColor: colors.surface }]}
                >
                    {/* Drag handle */}
                    <View style={[localStyles.dragHandle, { backgroundColor: colors.border }]} />

                    {/* Header */}
                    <View
                        style={localStyles.modalHeader}
                        accessible={false}
                    >
                        {/* Avatar de color de la categoría */}
                        <View style={[localStyles.modalCatDot, { backgroundColor: modalData?.color + '28' }]}>
                            <View style={[localStyles.colorDot, { backgroundColor: modalData?.color }]} />
                        </View>
                        <Text
                            style={[globalStyles.bodyTextLg, { color: colors.text }]}
                            numberOfLines={2}
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                        >
                            {t(`icons.${modalData?.categoryName}`, modalData?.categoryName || '')}
                        </Text>
                    </View>

                    {/* Total */}
                    <View
                        style={[localStyles.modalSummary, { backgroundColor: (modalData?.color ?? '#ccc') + '12', borderColor: (modalData?.color ?? '#ccc') + '30' }]}
                        accessible={true}
                        accessibilityLabel={`${t('overviews.totalSpent')} ${currencySymbol} ${formatCurrency(modalData?.totalAmount || 0)}`}
                    >
                        <Text style={[localStyles.modalTotalLabel, { color: colors.textSecondary }]}>
                            {t('overviews.totalSpent')}
                        </Text>
                        <Text
                            style={[localStyles.modalTotalValue, { color: modalData?.color }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.7}
                        >
                            -{currencySymbol}{formatCurrency(modalData?.totalAmount || 0)}
                        </Text>
                    </View>

                    {/* Lista de transacciones */}
                    <FlatList
                        data={modalData?.transactions}
                        keyExtractor={keyExtractor}
                        style={localStyles.transactionList}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderModalTransaction}
                        accessible={false}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                    />

                </Animated.View>
            </View>
        </Modal>
    )
}


const localStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',         // bottom sheet
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        maxHeight: '82%',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
    },
    // Drag handle visual
    dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 99,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    // Avatar de color de la categoría en modal
    modalCatDot: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    // Bloque de total — fondo tintado con el color de la categoría
    modalSummary: {
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    modalTotalLabel: {
        fontSize: 11,
        fontFamily: 'FiraSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 6,
        lineHeight: 16,
    },
    modalTotalValue: {
        fontSize: 28,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 34,
    },

    // ── Transaction rows en modal ──
    transactionList: {
        maxHeight: 340,
    },
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minHeight: 56,
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        flexShrink: 0,
    },
    // Franja de color lateral — alineada con catAccentBar
    txStrip: {
        width: 3,
        height: '70%',
        borderRadius: 99,
        flexShrink: 0,
    },
    txInfoContainer: {
        flex: 1,
        gap: 3,
    },
    txDescription: {
        fontSize: 14,
        fontFamily: 'FiraSans-Regular',
        lineHeight: 20,
    },
    txDate: {
        fontSize: 11,
        fontFamily: 'FiraSans-Regular',
        lineHeight: 14,
    },
    txAmount: {
        fontSize: 14,
        fontFamily: 'FiraSans-Bold',
        textAlign: 'right',
        minWidth: 80,
        lineHeight: 20,
        flexShrink: 0,
    },
})

