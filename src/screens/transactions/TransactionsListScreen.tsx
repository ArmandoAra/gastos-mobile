import { format, parseISO, isSameMonth, isSameYear, isSameDay } from "date-fns"; // Agregamos isSameDay
import { es } from "date-fns/locale";
import { useState, useMemo, useCallback } from "react";
import { View, TouchableOpacity, ScrollView, Text, TextInput, StyleSheet } from "react-native";
import { styles } from "../../theme/styles";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import React from "react";
import { LinearGradient } from "expo-linear-gradient"; // Para los botones activos

// Componentes
import AddTransactionsButton from "../../components/buttons/AddTransactionsButton";
import InfoPopUp from "../../components/messages/InfoPopUp";
import ModernDateSelector from "../../components/buttons/ModernDateSelector";
import { TransactionItemMobile } from "./components/TransactionItem";

// Stores & Interfaces
import useDataStore from "../../stores/useDataStore";
import { Transaction, TransactionType } from "../../interfaces/data.interface";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { formatCurrency } from "../../utils/helpers";
import FilterFloatingButton from "./components/FilterFloatingButton";
import TransactionsHeader from "../../components/headers/TransactionsHeader";
import useDateStore from "../../stores/useDateStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { ThemeColors } from "../../types/navigation";
import {darkTheme, lightTheme} from '../../theme/colors';

// Tipo para el modo de vista
type ViewMode = 'day' | 'month' | 'year';

export function TransactionsScreen() {
    const { theme } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

    const { localSelectedDay, setLocalSelectedDay } = useDateStore();
    const [viewMode, setViewMode] = useState<ViewMode>('month'); // Default: Mensual
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Store
    const {
        transactions,
        deleteTransaction,
        updateTransaction,
        deleteSomeAmountInAccount,
        updateAccountBalance
    } = useDataStore();

    // --- 1. LÓGICA DE FILTRADO (Por fecha y modo) ---
    const filteredTransactions = useMemo(() => {
        let result = transactions;

        // A. Filtro por FECHA según el MODO (Day/Month/Year)
        result = result.filter(t => {
            const tDate = parseISO(t.date);
            switch (viewMode) {
                case 'day':
                    return isSameDay(tDate, localSelectedDay);
                case 'month':
                    return isSameMonth(tDate, localSelectedDay) && isSameYear(tDate, localSelectedDay);
                case 'year':
                    return isSameYear(tDate, localSelectedDay);
                default:
                    return true;
            }
        });

        // B. Filtro por TIPO (Ingreso/Gasto)
        if (filter !== 'all') {
            result = result.filter(t => t.type === filter);
        }

        // C. Filtro por BÚSQUEDA
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(t =>
                (t.description || '').toLowerCase().includes(query) ||
                (t.category_name || '').toLowerCase().includes(query)
            );
        }

        // Ordenar: Más recientes primero
        return result.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [filter, searchQuery, transactions, localSelectedDay, viewMode]);

    // --- 2. AGRUPACIÓN DINÁMICA ---
    const groupedData = useMemo(() => {
        const groups: Record<string, typeof filteredTransactions> = {};

        filteredTransactions.forEach(transaction => {
            let groupKey = '';
            const date = parseISO(transaction.date);

            // La clave de agrupación cambia según el modo
            if (viewMode === 'year') {
                // En modo Año, agrupamos por MES (ej: "2023-10")
                groupKey = format(date, 'yyyy-MM');
            } else {
                // En modo Mes o Día, agrupamos por DÍA (ej: "2023-10-25")
                groupKey = format(date, 'yyyy-MM-dd');
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(transaction);
        });

        return groups;
    }, [filteredTransactions, viewMode]);

    // --- MANEJADORES ---
    const handleDelete = useCallback(async (
        id: string, account_id?: string, amount?: number, transactionType?: TransactionType
    ) => {
        try {
            deleteTransaction(id);
            if (account_id && amount && transactionType) {
                deleteSomeAmountInAccount(account_id, Math.abs(amount), transactionType);
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }, [deleteTransaction, deleteSomeAmountInAccount]);

    const handleSave = useCallback(async (
        updatedTransaction: Transaction, fromAccount: string | null = null, toAccount: string | null = null,
    ) => {
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

    // Helper para formatear el título del grupo
    const getGroupTitle = (dateKey: string) => {
        const date = parseISO(dateKey); // dateKey es 'yyyy-MM' o 'yyyy-MM-dd'
        if (viewMode === 'year') {
            // Si agrupamos por mes, mostrar nombre del mes
            return format(date, 'MMMM', { locale: es });
        }
        // Si agrupamos por día, mostrar fecha completa
        return format(date, 'EEEE, d MMMM', { locale: es });
    };

    return (
        <View style={styles.container}>
            <InfoPopUp />
            <TransactionsHeader
                viewMode={viewMode}
            />
            <View style={{ paddingHorizontal: 16, marginBottom: 8, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <FilterFloatingButton
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    filter={filter}
                    setFilter={setFilter}
                />
                <View style={{ flexDirection: 'column', alignItems: 'center', gap: 1, width: 100, paddingHorizontal: 4 }}>
                    <Text style={{ ...localStyles.modeLabel, backgroundColor: colors.background }}>{viewMode}</Text>
                    <Text style={{ ...localStyles.modeLabel, backgroundColor: colors.background }}>{filter}</Text>
                </View>
                {/* --- BARRA DE BÚSQUEDA --- */}
                <View style={[localStyles.searchContainer, { backgroundColor: colors.surface }]}>
                    <Ionicons name="search" size={20} color={colors.background} style={{ marginRight: 8 }} />
                    <TextInput
                        style={[localStyles.searchInput, {color: colors.text}]}
                        placeholder={`Search in this ${viewMode}...`}
                        placeholderTextColor={colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.background} />
                        </TouchableOpacity>
                    )}

                </View>
            </View>


            {/* Espaciador superior */}
            <View style={{ height: 1 }} />

            {/* --- LISTA --- */}
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ScrollView
                    style={styles.transactionsList}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Estado Vacío */}
                    {Object.keys(groupedData).length === 0 && (
                        <View style={localStyles.emptyState}>
                            <MaterialIcons name="receipt-long" size={48} color={colors.background} />
                            <Text style={localStyles.emptyText}>
                                No transactions found for this {viewMode}
                            </Text>
                        </View>
                    )}

                    {Object.entries(groupedData).map(([key, trans]) => {
                        // Calcular total del grupo
                        const groupTotal = trans.reduce((sum, t) =>
                            t.type === 'expense' ? sum - t.amount : sum + t.amount, 0
                        );

                        return (
                            <View key={key}>
                                <View style={styles.dateHeader}>
                                    {/* Título dinámico (Día o Mes) */}
                                    <Text style={styles.dateHeaderText}>
                                        {getGroupTitle(key)}
                                    </Text>

                                    <Text style={[
                                        styles.dateHeaderTotal,
                                        { color: groupTotal >= 0 ? colors.income : colors.expense }
                                    ]}>
                                        {formatCurrency(groupTotal)}
                                    </Text>
                                </View>
                                {trans.map(transaction => (
                                    <TransactionItemMobile
                                        key={transaction.id}
                                        transaction={transaction}
                                        onDelete={handleDelete}
                                        onSave={handleSave}
                                    />
                                ))}
                            </View>
                        );
                    })}
                </ScrollView>
            </GestureHandlerRootView>

            <AddTransactionsButton />
        </View>
    );
}

// Estilos Locales
const localStyles = StyleSheet.create({
    // Selector de Modo (Day/Month/Year)
    modeSelectorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    modeBtnWrapper: {
        flex: 1,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
    },
    modeBtnActive: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modeBtnInactive: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e293b',
        borderWidth: 1,
        borderColor: '#334155',
        borderRadius: 18,
    },
    modeLabel:
    {
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 14,
        textTransform: 'capitalize',
        fontSize: 12
    },
    modeTextActive: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },
    modeTextInactive: {
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: 13,
    },

    // Búsqueda
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
        borderColor: '#061E29',
    },
    searchInput: {
        flex: 1,
        fontSize: 12,
        padding: 0,
    },

    // Estado Vacío
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