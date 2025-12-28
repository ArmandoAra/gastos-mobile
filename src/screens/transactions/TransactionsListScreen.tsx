import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useMemo, useCallback } from "react";
import { View, TouchableOpacity, ScrollView, Text } from "react-native";
import { styles } from "../../theme/styles";
import { MOCK_TRANSACTIONS } from "../home/HomeScreen";
import AddTransactionsButton from "../../components/buttons/AddTransactionsButton";
import InfoPopUp from "../../components/messages/InfoPopUp";
import useDataStore from "../../stores/useDataStore";
import { formatCurrency } from "../../utils/helpers";
import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { IconCategory } from "./components/IconCategory";
import { Transaction, TransactionType } from "../../interfaces/data.interface";
import { updateTransaction } from '../../../../Gastos/frontend/app/actions/db/Gastos_API';
import { TransactionItemMobile } from "./components/TransactionItem";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ModernDateSelector from "../../components/buttons/ModernDateSelector";


export function TransactionsScreen() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { deleteTransaction, updateTransaction, deleteSomeAmountInAccount, updateAccountBalance } = useDataStore();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { transactions } = useDataStore();

    const filteredTransactions = useMemo(() => {
        let filtered = transactions;

        if (filter !== 'all') {
            filtered = filtered.filter(t => t.type === filter);
        }

        if (searchQuery) {
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.category_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [filter, searchQuery, transactions]);

    const groupedByDate = useMemo(() => {
        const groups: Record<string, typeof filteredTransactions> = {};
        filteredTransactions.forEach(transaction => {
            const dateKey = format(parseISO(transaction.date), 'yyyy-MM-dd');
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(transaction);
        });
        return groups;
    }, [filteredTransactions, transactions]);

    // Manejadores de acciones
    const handleDelete = useCallback(async (
        id: string,
        account_id?: string,
        amount?: number,
        transactionType?: TransactionType
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
        updatedTransaction: Transaction,
        fromAccount: string | null = null,
        toAccount: string | null = null,
    ): Promise<Transaction | null | undefined> => {
        if (!updatedTransaction) return;
        try {
            updateTransaction(updatedTransaction);
            if (fromAccount !== toAccount) {
                if (fromAccount) updateAccountBalance(fromAccount, updatedTransaction.amount, updatedTransaction.type as TransactionType);
                if (toAccount) updateAccountBalance(toAccount, updatedTransaction.amount, updatedTransaction.type as TransactionType);
            }

        } catch (error) {
            console.error('Error updating transaction:', error);
        }
    }, [updateTransaction, updateAccountBalance]);


    return (
        <View style={styles.container}>
            {/* message popup */}
            <InfoPopUp />
            <ModernDateSelector
                selectedDate={currentDate}
                onDateChange={setCurrentDate}
            />
            {/* Filtros */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'income' && styles.filterBtnActive]}
                    onPress={() => setFilter('income')}
                >
                    <Text style={[styles.filterText, filter === 'income' && styles.filterTextActive]}>
                        Incomes
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'expense' && styles.filterBtnActive]}
                    onPress={() => setFilter('expense')}
                >
                    <Text style={[styles.filterText, filter === 'expense' && styles.filterTextActive]}>
                        Expenses
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Lista de Transacciones */}
            <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView style={styles.transactionsList}>
                    {Object.entries(groupedByDate).map(([date, trans]) => (
                    <View key={date}>
                        <View style={styles.dateHeader}>
                            <Text style={styles.dateHeaderText}>
                                {format(parseISO(date), 'EEEE, d MMMM', { locale: es })}
                            </Text>
                            <Text style={styles.dateHeaderTotal}>
                                    ${trans.reduce((sum, t) =>
                                    t.type === 'expense' ? sum - t.amount : sum + t.amount, 0
                                    )}
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
                ))}
            </ScrollView>
            </GestureHandlerRootView>

            {/* Botón flotante */}
            <AddTransactionsButton />

        </View>
    );
};


