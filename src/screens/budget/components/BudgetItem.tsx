
import React, { memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeColors } from '../../../types/navigation';
import { Item } from '../../../interfaces/data.interface';
import { formatCurrency } from '../../../utils/helpers';
import * as Haptics from 'expo-haptics';

interface BudgetItemProps {
    item: Item;
    colors: ThemeColors;
    fontScale: number;
    currencySymbol: string;
    t: (key: string) => string;
    onUpdate: (id: string, field: keyof Item, value: any) => void;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
    onSetRef: (ref: TextInput | null) => void;
}

const BudgetItemComponent = ({
    item,
    colors,
    fontScale,
    currencySymbol,
    t,
    onUpdate,
    onToggle,
    onRemove,
    onSetRef
}: BudgetItemProps) => {

    const isDone = item.done;
    const lineColor = isDone ? colors.income : colors.expense;

    const handleRemove = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        onRemove(item.id);
    }

    return (
        <Animated.View
            entering={FadeIn}
            layout={LinearTransition}
            style={[
                styles.itemRow,
                {
                    backgroundColor: colors.surface,
                    borderLeftColor: isDone ? colors.income : colors.expense,
                    borderTopColor: colors.border,
                    borderRightColor: colors.border,
                    borderBottomColor: colors.border,
                    opacity: isDone ? 0.72 : 1,
                }
            ]}
            accessible={true}
            accessibilityLabel={`${item.name || 'Item sin nombre'}, ${item.quantity} por ${item.price}, total ${(item.price * item.quantity).toFixed(2)}`}
        >
            {/* ── FILA SUPERIOR: nombre + acciones ── */}
            <View style={styles.itemRowHeader}>

                {/* Avatar de estado — mismo patrón que catDotBox */}
                <View style={[
                    styles.statusBox,

                    { backgroundColor: lineColor + '20', borderRadius: 99 }
                ]}>
                    <MaterialIcons
                        name={isDone ? "check" : "edit"}
                        size={16}
                        color={lineColor}
                    />
                </View>

                <TextInput
                    ref={onSetRef}
                    style={[
                        styles.itemNameInput,
                        {
                            color: colors.text,
                            minHeight: 40 * fontScale,
                        }
                    ]}
                    value={item.name}
                    onChangeText={(v) => onUpdate(item.id, 'name', v)}
                    placeholder={t('budget_form.items.item_name_placeholder')}
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    accessibilityLabel={t('budget_form.items.item_name_placeholder')}
                />

                {/* Acciones */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => onToggle(item.id)}
                        style={[styles.actionBtn, { backgroundColor: lineColor + '18' }]}
                        accessibilityRole="button"
                        accessibilityLabel={t('budget_form.items.toggle_done_action')}
                        accessibilityState={{ checked: isDone }}
                    >
                        <MaterialIcons
                            name={isDone ? "check-circle" : "radio-button-unchecked"}
                            size={22 * fontScale}
                            color={lineColor}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                        onLongPress={handleRemove}
                        style={[styles.actionBtn, { backgroundColor: colors.error + '18' }]}
                        accessibilityRole="button"
                        accessibilityLabel={t('budget_form.items.delete_action')}
                    >
                        <MaterialIcons
                            name="delete-outline"
                            size={22 * fontScale}
                            color={colors.error}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── DIVISOR ── */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* ── FILA INFERIOR: cantidad × precio = total ── */}
            <View style={styles.itemRowInputs}>

                {/* Cantidad */}
                <View style={styles.inputGroup}>
                    <Text
                        style={[styles.miniLabel, { color: colors.textSecondary }]}
                        maxFontSizeMultiplier={1.5}
                    >
                        {t('budget_form.items.quantity_label')}
                    </Text>
                    <TextInput
                        style={[
                            styles.inputSmall,
                            { color: colors.text, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                        ]}
                        keyboardType="numeric"
                        maxLength={5}
                        value={item.quantity.toString()}
                        onChangeText={(v) => {
                            const formattedValue = v.replace(/,/g, '.'); // Reemplaza comas por puntos
                            onUpdate(item.id, 'quantity', formattedValue);
                        }}
                        accessibilityLabel={t('budget_form.items.quantity_label')}
                    />
                </View>

                {/* Operador × */}
                <View style={[styles.operatorChip, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.operatorText, { color: colors.textSecondary }]}>X</Text>
                </View>

                {/* Precio */}
                <View style={styles.inputGroup}>
                    <Text
                        style={[styles.miniLabel, { color: colors.textSecondary }]}
                        maxFontSizeMultiplier={1.5}
                    >
                        {t('budget_form.items.price_label')}
                    </Text>
                    <TextInput
                        style={[
                            styles.inputSmall,
                            { color: colors.text, backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
                        ]}
                        keyboardType="numeric"
                        maxLength={8}
                        value={item.price === 0 ? '' : item.price.toString()}
                        onChangeText={(v) => {
                            const formattedValue = v.replace(/,/g, '.'); // Reemplaza comas por puntos
                            onUpdate(item.id, 'price', formattedValue);
                        }}
                        placeholder="0.00"
                        placeholderTextColor={colors.textSecondary}
                        accessibilityLabel={t('budget_form.items.price_label')}
                    />
                </View>

                {/* Total — chip de resultado, igual que percentChip de DailyExpenseView */}
                <View style={[styles.totalChip, { backgroundColor: lineColor + '18', borderColor: lineColor + '35' }]}>
                    <Text
                        style={[styles.itemTotal, { color: lineColor }]}
                        maxFontSizeMultiplier={2}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                    >
                        {currencySymbol}{formatCurrency(item.price * item.quantity)}
                    </Text>
                </View>
            </View>

        </Animated.View>
    );
};

export const BudgetItem = memo(BudgetItemComponent, (prevProps, nextProps) => {
    return (
        prevProps.item === nextProps.item &&
        prevProps.colors === nextProps.colors &&
        prevProps.fontScale === nextProps.fontScale &&
        prevProps.currencySymbol === nextProps.currencySymbol
    );
});

const styles = StyleSheet.create({
    itemRow: {
        borderRadius: 14,
        marginBottom: 10,
        // Bordes independientes para la barra lateral de acento
        borderLeftWidth: 4,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    itemRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
        paddingHorizontal: 12,
        gap: 10,
    },
    // Avatar de estado — mismo patrón que catDotBox / iconBox
    statusBox: {
        width: 32,
        height: 32,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    itemNameInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'FiraSans-Regular',
        textAlignVertical: 'center',
        paddingVertical: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    // Botones de acción con fondo tintado — mismo patrón que actionBtn de otros componentes
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        marginHorizontal: 12,
    },
    itemRowInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 8,
        flexWrap: 'wrap',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 90,
        gap: 6,
    },
    miniLabel: {
        fontSize: 11,
        fontFamily: 'FiraSans-Bold',
        letterSpacing: 0.3,
    },
    inputSmall: {
        borderWidth: 1,
        borderRadius: 30,
        paddingHorizontal: 10,
        paddingVertical: 2,
        flex: 1,
        minWidth: 56,
        textAlign: 'center',
        fontFamily: 'FiraSans-Regular',
        fontSize: 13,
        minHeight: 30,
    },
    // Chip del operador ×
    operatorChip: {
        width: 26,
        height: 26,
        borderRadius: 99,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    operatorText: {
        fontSize: 13,
        fontFamily: 'FiraSans-Bold',
    },
    // Chip de total — mismo pill que percentChip / categoryChip
    totalChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 99,
        borderWidth: 1,
        flexShrink: 0,
        minWidth: 72,
        alignItems: 'center',
    },
    itemTotal: {
        fontFamily: 'FiraSans-Bold',
        fontSize: 13,
        textAlign: 'center',
    },
});