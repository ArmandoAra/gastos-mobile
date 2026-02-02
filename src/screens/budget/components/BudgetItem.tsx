import React, { memo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeColors } from '../../../types/navigation'; // Ajusta tus rutas de importación
import { Item } from '../../../interfaces/data.interface'; // Ajusta tus rutas
import { formatCurrency } from '../../../utils/helpers';

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

    return (
        <Animated.View
            entering={FadeIn}
            layout={LinearTransition}
            style={[
                styles.itemRow,
                {
                    backgroundColor: item.done ? colors.surface : colors.surface,
                    borderColor: item.done ? colors.accent : colors.border,
                }
            ]}
            accessible={true}
            accessibilityLabel={`${item.name || 'Item sin nombre'}, ${item.quantity} por ${item.price}, total ${(item.price * item.quantity).toFixed(2)}`}
        >
            {/* Fila superior: Nombre y acciones */}
            <View style={styles.itemRowHeader}>
                <TextInput
                    ref={onSetRef}
                    style={[styles.itemNameInput, { color: colors.text, minHeight: 40 * fontScale }]}
                    value={item.name}
                    onChangeText={(t) => onUpdate(item.id, 'name', t)}
                    placeholder={t('budget_form.items.item_name_placeholder')}
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    accessibilityLabel={t('budget_form.items.item_name_placeholder')}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <TouchableOpacity
                        onPress={() => onToggle(item.id)}
                        style={styles.touchableAction}
                        accessibilityRole="button"
                        accessibilityLabel={t('budget_form.items.toggle_done_action')}
                        accessibilityState={{ checked: item.done }}
                    >
                        <MaterialIcons
                            name={item.done ? "check-circle" : "radio-button-unchecked"}
                            size={28 * fontScale}
                            color={item.done ? colors.success || '#34C759' : colors.accent + 'CC'}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onRemove(item.id)}
                        style={styles.touchableAction}
                        accessibilityRole="button"
                        accessibilityLabel={t('budget_form.items.delete_action')}
                    >
                        <MaterialIcons name="delete-outline" size={28 * fontScale} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Fila inferior: Cálculos (Flexible wrap) */}
            <View style={styles.itemRowInputs}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.miniLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.5}>
                        {t('budget_form.items.quantity_label')}
                    </Text>
                    <TextInput
                        style={[styles.inputSmall, { color: colors.text, borderColor: colors.border, minHeight: 44 }]}
                        keyboardType="numeric"
                        maxLength={5}
                        value={item.quantity.toString()}
                        onChangeText={(t) => onUpdate(item.id, 'quantity', Math.abs(parseInt(t)) || 0)}
                        accessibilityLabel={t('budget_form.items.quantity_label')}
                    />
                </View>

                <Text style={[styles.operatorText, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.5}>x</Text>

                <View style={styles.inputGroup}>
                    <Text style={[styles.miniLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.5}>
                        {t('budget_form.items.price_label')}
                    </Text>
                    <TextInput
                        style={[styles.inputSmall, { color: colors.text, borderColor: colors.border, minHeight: 44 }]}
                        keyboardType="numeric"
                        maxLength={8}
                        value={item.price === 0 ? '' : item.price.toString()}
                        onChangeText={(t) => onUpdate(item.id, 'price', Math.abs(parseFloat(t)) || 0)}
                        placeholder="0.00"
                        placeholderTextColor={colors.textSecondary}
                        accessibilityLabel={t('budget_form.items.price_label')}
                    />
                </View>

                <Text style={[styles.operatorText, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.5}>=</Text>

                <Text
                    style={[styles.itemTotal, { color: colors.text }]}
                    maxFontSizeMultiplier={2}
                >
                    {currencySymbol}{formatCurrency(item.price * item.quantity)}
                </Text>
            </View>
        </Animated.View>
    );
};

// Optimizamos con React.memo para evitar re-renders innecesarios en listas largas
export const BudgetItem = memo(BudgetItemComponent, (prevProps, nextProps) => {
    return (
        prevProps.item === nextProps.item &&
        prevProps.colors === nextProps.colors &&
        prevProps.fontScale === nextProps.fontScale &&
        prevProps.currencySymbol === nextProps.currencySymbol
    );
});

const styles = StyleSheet.create({
    itemRow: { padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
    itemRowHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 10 },
    itemNameInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'FiraSans-Regular',
        textAlignVertical: 'center',
        paddingVertical: 5
    },
    touchableAction: { padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
    itemRowInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 100
    },
    miniLabel: { fontSize: 12, marginRight: 8, fontFamily: 'FiraSans-Regular' },
    inputSmall: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        flex: 1,
        minWidth: 60,
        textAlign: 'center',
        paddingVertical: 8,
        fontFamily: 'FiraSans-Regular',
    },
    operatorText: { marginHorizontal: 2, fontSize: 14 },
    itemTotal: { fontFamily: 'FiraSans-Bold', fontSize: 16, minWidth: 70, textAlign: 'right', paddingVertical: 5 }
});