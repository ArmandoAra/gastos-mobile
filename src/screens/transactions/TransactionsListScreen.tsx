import { format, parseISO, isSameMonth, isSameYear, isSameDay } from "date-fns";
import { es, pt, enGB } from "date-fns/locale";
import React, { useState, useMemo, useCallback } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    TextInput,
    StyleSheet,
    Platform,
    AccessibilityInfo
} from "react-native";
import { styles } from "../../theme/styles"; // Estilos globales si los usas
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";

// Componentes
import AddTransactionsButton from "../../components/buttons/AddTransactionsButton";
import InfoPopUp from "../../components/messages/InfoPopUp";
import { TransactionItemMobile } from "./components/TransactionItem";

// Stores & Interfaces
import useDataStore from "../../stores/useDataStore";
import { Transaction, TransactionType } from "../../interfaces/data.interface";
import { formatCurrency } from "../../utils/helpers";
import FilterFloatingButton from "./components/FilterFloatingButton";
import useDateStore from "../../stores/useDateStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { ThemeColors } from "../../types/navigation";
import { darkTheme, lightTheme } from '../../theme/colors';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import InfoHeader from "../../components/headers/InfoHeader";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewMode = 'day' | 'month' | 'year';

type ListItem =
    | { type: 'header'; date: string; total: number; id: string }
    | { type: 'transaction'; data: Transaction };

export function TransactionsScreen() {
    const { theme, language } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
    const { t } = useTranslation();

    const { localSelectedDay } = useDateStore();
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        transactions = [],
        deleteTransaction,
        updateTransaction,
        deleteSomeAmountInAccount,
        updateAccountBalance,
    } = useDataStore();

    // --- 1. FILTRADO (Memoizado) ---
    const filteredTransactions = useMemo(() => {
        let result = transactions;
        if (!result || result.length === 0) return [];

        result = result.filter(t => {
            const tDate = parseISO(t.date);
            if (viewMode === 'day') return isSameDay(tDate, localSelectedDay);
            if (viewMode === 'month') return isSameMonth(tDate, localSelectedDay) && isSameYear(tDate, localSelectedDay);
            if (viewMode === 'year') return isSameYear(tDate, localSelectedDay);
            return true;
        });

        if (filter !== 'all') {
            result = result.filter(t => t.type === filter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                (t.description || '').toLowerCase().includes(query) ||
                (t.category_name || '').toLowerCase().includes(query)
            );
        }

        return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filter, searchQuery, transactions, localSelectedDay, viewMode]);

    // --- 2. PREPARAR DATOS PARA FLASHLIST (Aplanado) ---
    const listData = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};

        filteredTransactions.forEach(t => {
            const date = parseISO(t.date);
            const groupKey = viewMode === 'year'
                ? format(date, 'yyyy-MM')
                : format(date, 'yyyy-MM-dd');

            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(t);
        });

        const flatList: ListItem[] = [];
        Object.entries(groups).forEach(([dateKey, items]) => {
            const total = items.reduce((sum, t) =>
                t.type === 'expense' ? sum - Math.abs(t.amount) : sum + Math.abs(t.amount), 0
            );

            flatList.push({
                type: 'header',
                date: dateKey,
                total,
                id: `header-${dateKey}`
            });

            items.forEach(t => {
                flatList.push({ type: 'transaction', data: t });
            });
        });

        return flatList;
    }, [filteredTransactions, viewMode]);

    // --- MANEJADORES ---
    const handleDelete = useCallback(async (id: string, account_id?: string, amount?: number, transactionType?: TransactionType) => {
        try {
            deleteTransaction(id);
            if (account_id && amount && transactionType) {
                deleteSomeAmountInAccount(account_id, Math.abs(amount), transactionType);
            }
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('common.deleted'));
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }, [deleteTransaction, deleteSomeAmountInAccount, t]);

    const handleSave = useCallback(async (
        updatedTransaction: Transaction,
        fromAccount: string | null = null,
        toAccount: string | null = null
    ) => {
        if (!updatedTransaction) return;

        // 1. Buscamos la transacción original para conocer el estado previo
        const oldTx = transactions.find(t => t.id === updatedTransaction.id);
        if (!oldTx) return;

        try {
            updateTransaction(updatedTransaction);
            if (fromAccount !== toAccount) {
                if (fromAccount) deleteSomeAmountInAccount(fromAccount, oldTx.amount, updatedTransaction.type);
                if (toAccount) updateAccountBalance(toAccount, updatedTransaction.amount, updatedTransaction.type);
            }

            else {
                // Calculamos los valores reales con signo (+ para ingreso, - para gasto)
                const oldReal = oldTx.type === TransactionType.EXPENSE ? -Math.abs(oldTx.amount) : Math.abs(oldTx.amount);
                const newReal = updatedTransaction.type === TransactionType.EXPENSE ? -Math.abs(updatedTransaction.amount) : Math.abs(updatedTransaction.amount);

                // Delta = Nuevo - Viejo. 
                // Si el resultado es positivo, la cuenta debe subir. Si es negativo, bajar.
                const delta = newReal - oldReal;

                if (delta !== 0) {
                    const adjustmentType = delta > 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
                    updateAccountBalance(updatedTransaction.account_id, Math.abs(delta), adjustmentType);
                }
            }

            // 2. Actualizamos el registro técnico de la transacción
            updateTransaction(updatedTransaction);

            return updatedTransaction;

        } catch (error) {
            console.error('❌ Error updating transaction:', error);
            return null;
        }
    }, [transactions, updateTransaction, updateAccountBalance, deleteSomeAmountInAccount]);

    const getGroupTitle = (dateKey: string) => {
        const date = parseISO(dateKey);
        // Nota: Asegúrate de manejar el locale dinámicamente si soportas múltiples idiomas en date-fns
        if (viewMode === 'year') return format(date, 'MMMM', { locale: language === 'es' ? es : language === 'pt' ? pt : enGB });
        return format(date, 'EEEE, d MMMM', { locale: language === 'es' ? es : language === 'pt' ? pt : enGB });
    };

    // --- RENDERIZADO DE ITEMS ---
    const renderItem = useCallback(({ item }: { item: ListItem }) => {
        if (item.type === 'header') {
            const title = getGroupTitle(item.date);
            const totalFormatted = formatCurrency(item.total);

            return (
                <View
                    style={[localStyles.dateHeader, { backgroundColor: colors.surfaceSecondary }]}
                    accessibilityRole="header"
                    accessibilityLabel={`${title}, total ${totalFormatted}`}
                >
                    <Text
                        style={[localStyles.dateHeaderText, { color: colors.text }]}
                        maxFontSizeMultiplier={1.5}
                    >
                        {title}
                    </Text>
                    <Text
                        style={[
                            localStyles.dateHeaderTotal,
                            { color: item.total < 0 ? colors.error : colors.success }
                        ]}
                        maxFontSizeMultiplier={1.5}
                    >
                        {totalFormatted}
                    </Text>
                </View>
            );
        }

        return (
            <TransactionItemMobile
                transaction={item.data}
                onDelete={handleDelete}
                onSave={handleSave}
                colors={colors}
            />
        );
    }, [colors, handleDelete, handleSave, viewMode]);

    const keyExtractor = useCallback((item: ListItem) => {
        return item.type === 'header' ? item.id : item.data.id;
    }, []);

    const stickyHeaderIndices = useMemo(() => {
        return listData
            .map((item, index) => (item.type === 'header' ? index : null))
            .filter((item) => item !== null) as number[];
    }, [listData]);

    return (
        <SafeAreaView style={[localStyles.container, { backgroundColor: colors.surface }]}>
            <InfoPopUp />
            <InfoHeader viewMode={viewMode} />

            {/* --- CONTROLES Y FILTROS (Refactorizado para Wrap) --- */}
            <View style={[localStyles.controlsContainer, { borderBottomColor: colors.border }]}>

                {/* Grupo Izquierdo: Botón Filtro + Badges */}
                <View style={localStyles.filterGroup}>
                    <FilterFloatingButton
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        filter={filter}
                        setFilter={setFilter}
                        colors={colors}
                    />
                    <View style={localStyles.badgesContainer}>
                        <Text
                            style={[localStyles.modeLabel, { backgroundColor: colors.text, color: colors.surface }]}
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.5}
                        >
                            {t(`transactions.${viewMode}`)}
                        </Text>
                        <Text
                            style={[localStyles.modeLabel, { backgroundColor: colors.text, color: colors.surface }]}
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.5}
                        >
                            {t(`transactions.${filter}Plural`)}
                        </Text>
                    </View>
                </View>

                {/* Grupo Derecho: Búsqueda */}
                <View style={[localStyles.searchContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} importantForAccessibility="no" />
                    <TextInput
                        style={[localStyles.searchInput, { color: colors.text }]}
                        // concatenar el tipo de vista al placeholder
                        placeholder={`${t('transactions.searchPlaceholder')} ${t(`transactions.${viewMode}`).toLowerCase()}`}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                        accessibilityLabel={t('transactions.searchPlaceholder', 'Search transactions')}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            accessibilityRole="button"
                            accessibilityLabel={t('common.clear', 'Clear search')}
                            style={{ padding: 4 }}
                        >
                            <Ionicons name="close-circle" size={20} color={colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={{ height: 1 }} />

            {/* --- LISTA --- */}
            <View style={{ flex: 1 }}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <FlashList
                        data={listData}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        style={{ height: 150 }}
                        stickyHeaderIndices={stickyHeaderIndices}
                        contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 8 }}
                        keyboardDismissMode="on-drag"
                        ListEmptyComponent={
                            <View style={localStyles.emptyState} accessible={true}>
                                <MaterialIcons name="receipt-long" size={48} color={colors.textSecondary} importantForAccessibility="no" />
                                <Text style={[localStyles.emptyText, { color: colors.textSecondary }]}>
                                    {`${t('transactions.notFound')} ${t(`transactions.${viewMode}`).toLowerCase()}.`}
                                </Text>
                            </View>
                        }
                    />
                </GestureHandlerRootView>
            </View>

            <AddTransactionsButton />
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    controlsContainer: {
        paddingHorizontal: 8,
        borderBottomWidth: 0.5,
        paddingVertical: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    // Grupo Izquierdo (Botón Flotante + Badges)
    filterGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0, // No se encoge, prioridad al filtro
    },
    badgesContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start', // Alineado a la izq para texto variable
        gap: 4,
        maxWidth: 100, // Límite máximo para que no empuje demasiado
    },
    modeLabel: {
        fontWeight: '500',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 14,
        textTransform: 'capitalize',
        fontSize: 11,
        overflow: 'hidden',
    },
    // Grupo Derecho (Búsqueda)
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1, // Toma el espacio restante
        minWidth: 200, // Si es menor a 200px, baja a la siguiente línea (wrap)
        minHeight: 44, // Altura táctil accesible
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 8, // Área de toque vertical
        height: '100%',
    },
    // Headers de Fecha
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
        marginTop: 0,
        borderRadius: 8,
    },
    dateHeaderText: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    dateHeaderTotal: {
        fontSize: 14,
        fontWeight: '700',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        opacity: 0.7,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    }
});