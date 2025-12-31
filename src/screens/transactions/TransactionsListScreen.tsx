import { format, parseISO, isSameMonth, isSameYear, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import React, { useState, useMemo, useCallback } from "react";
import { View, TouchableOpacity, Text, TextInput, StyleSheet } from "react-native";
import { styles } from "../../theme/styles";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list"; // <--- IMPORTANTE

// Componentes
import AddTransactionsButton from "../../components/buttons/AddTransactionsButton";
import InfoPopUp from "../../components/messages/InfoPopUp";
import { TransactionItemMobile } from "./components/TransactionItem";

// Stores & Interfaces
import useDataStore from "../../stores/useDataStore";
import { Transaction, TransactionType } from "../../interfaces/data.interface";
import { formatCurrency } from "../../utils/helpers";
import FilterFloatingButton from "./components/FilterFloatingButton";
import TransactionsHeader from "../../components/headers/TransactionsHeader";
import useDateStore from "../../stores/useDateStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { ThemeColors } from "../../types/navigation";
import { darkTheme, lightTheme } from '../../theme/colors';
import { GestureHandlerRootView } from "react-native-gesture-handler";

type ViewMode = 'day' | 'month' | 'year';

// --- TIPO DE DATOS PARA LA LISTA PLANA ---
// Puede ser un Header (fecha) o un Item (transacción)
type ListItem =
    | { type: 'header'; date: string; total: number; id: string }
    | { type: 'transaction'; data: Transaction };

export function TransactionsScreen() {
    const { theme } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

    const { localSelectedDay } = useDateStore();
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        transactions,
        deleteTransaction,
        updateTransaction,
        deleteSomeAmountInAccount,
        updateAccountBalance,
    } = useDataStore();

    // --- 1. FILTRADO (Memoizado) ---
    const filteredTransactions = useMemo(() => {
        let result = transactions;

        // Filtro rápido para evitar procesar todo si no hay transacciones
        if (!result || result.length === 0) return [];

        result = result.filter(t => {
            const tDate = parseISO(t.date);
            // Optimización: Comparaciones simples primero
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
    // Convertimos la estructura agrupada en un array plano lineal para máximo rendimiento
    const listData = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};

        // Agrupar
        filteredTransactions.forEach(t => {
            const date = parseISO(t.date);
            const groupKey = viewMode === 'year'
                ? format(date, 'yyyy-MM')
                : format(date, 'yyyy-MM-dd');

            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(t);
        });

        // Aplanar
        const flatList: ListItem[] = [];
        Object.entries(groups).forEach(([dateKey, items]) => {
            // Calcular total del grupo
            const total = items.reduce((sum, t) =>
                t.type === 'expense' ? sum - t.amount : sum + t.amount, 0
            );

            // 1. Insertar Header
            flatList.push({
                type: 'header',
                date: dateKey,
                total,
                id: `header-${dateKey}`
            });

            // 2. Insertar Items
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
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }, [deleteTransaction, deleteSomeAmountInAccount]);

    const handleSave = useCallback(async (updatedTransaction: Transaction, fromAccount: string | null = null, toAccount: string | null = null) => {
        if (!updatedTransaction) return;
        try {
            updateTransaction(updatedTransaction);
            if (fromAccount !== toAccount) {
                if (fromAccount) deleteSomeAmountInAccount(fromAccount, Math.abs(updatedTransaction.amount), updatedTransaction.type);
                if (toAccount) updateAccountBalance(toAccount, Math.abs(updatedTransaction.amount), updatedTransaction.type);
            }
            return updatedTransaction;
        } catch (error) {
            console.error('Error updating transaction:', error);
            return null;
        }
    }, [updateTransaction, updateAccountBalance, deleteSomeAmountInAccount]);

    // Helper para títulos de fecha
    const getGroupTitle = (dateKey: string) => {
        const date = parseISO(dateKey);
        if (viewMode === 'year') return format(date, 'MMMM', { locale: es });
        return format(date, 'EEEE, d MMMM', { locale: es });
    };

    // --- RENDERIZADO DE ITEMS (OPTIMIZADO) ---
    const renderItem = useCallback(({ item }: { item: ListItem }) => {
        if (item.type === 'header') {
            return (
                <View style={[styles.dateHeader, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.dateHeaderText, { color: colors.text }]}>
                        {getGroupTitle(item.date)}
                    </Text>
                    <Text style={[
                        styles.dateHeaderTotal,
                        { color: item.total >= 0 ? colors.income : colors.expense }
                    ]}>
                        {formatCurrency(item.total)}
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

    // Key Extractor para rendimiento
    const keyExtractor = useCallback((item: ListItem) => {
        return item.type === 'header' ? item.id : item.data.id;
    }, []);

    // Determinar qué índices son sticky (pegajosos)
    const stickyHeaderIndices = useMemo(() => {
        return listData
            .map((item, index) => (item.type === 'header' ? index : null))
            .filter((item) => item !== null) as number[];
    }, [listData]);

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <InfoPopUp />
            <TransactionsHeader viewMode={viewMode} />

            {/* Filtros */}
            <View style={[localStyles.filterContainer, { borderBottomColor: colors.border }]}>
                <FilterFloatingButton
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    filter={filter}
                    setFilter={setFilter}
                    colors={colors}
                />
                <View style={{ flexDirection: 'column', alignItems: 'center', gap: 1, width: 80, paddingHorizontal: 4 }}>
                    <Text style={{ ...localStyles.modeLabel, backgroundColor: colors.accent, color: colors.text }}>{viewMode}</Text>
                    <Text style={{ ...localStyles.modeLabel, backgroundColor: colors.accent, color: colors.text }}>{filter}</Text>
                </View>

                {/* Search */}
                <View style={[localStyles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.text} style={{ marginRight: 8 }} />
                    <TextInput
                        style={[localStyles.searchInput, { color: colors.text }]}
                        placeholder={`Search in this ${viewMode}...`}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={{ height: 1 }} />

            {/* --- LISTA OPTIMIZADA (FLASHLIST) --- */}
            <View style={{ flex: 1 }}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <FlashList
                        data={listData}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        stickyHeaderIndices={stickyHeaderIndices} // Hace que los headers de fecha se peguen arriba
                        contentContainerStyle={{ paddingBottom: 200, paddingHorizontal: 8 }}
                        ListEmptyComponent={
                        <View style={localStyles.emptyState}>
                                <MaterialIcons name="receipt-long" size={48} color={colors.textSecondary} />
                            <Text style={localStyles.emptyText}>
                                No transactions found for this {viewMode}
                            </Text>
                        </View>
                    }
                    />
                </GestureHandlerRootView>
            </View>

            <AddTransactionsButton />
        </View>
    );
}

const localStyles = StyleSheet.create({
    filterContainer: {
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        paddingVertical: 8,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    modeLabel: {
        fontWeight: '400',
        width: '100%',
        textAlign: 'center',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 14,
        textTransform: 'capitalize',
        fontSize: 12
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        width: '60%',
        height: "100%",
        marginHorizontal: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 12,
        padding: 0,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        opacity: 0.7
    },
    emptyText: {
        color: '#94a3b8',
        marginTop: 10,
        fontSize: 16
    }
});