import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useState, useMemo } from "react";
import { View, TouchableOpacity, ScrollView, Text } from "react-native";
import { styles } from "../../theme/styles";
import { MOCK_TRANSACTIONS } from "../home/HomeScreen";
import AddTransactionsButton from "../../components/buttons/AddTransactionsButton";
import InfoPopUp from "../../components/messages/InfoPopUp";


export function TransactionsScreen() {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTransactions = useMemo(() => {
        let filtered = MOCK_TRANSACTIONS;

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
    }, [filter, searchQuery]);

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
    }, [filteredTransactions]);

    return (
        <View style={styles.container}>
            {/* message popup */}
            <InfoPopUp />
            {/* Filtros */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        Todas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'income' && styles.filterBtnActive]}
                    onPress={() => setFilter('income')}
                >
                    <Text style={[styles.filterText, filter === 'income' && styles.filterTextActive]}>
                        Ingresos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterBtn, filter === 'expense' && styles.filterBtnActive]}
                    onPress={() => setFilter('expense')}
                >
                    <Text style={[styles.filterText, filter === 'expense' && styles.filterTextActive]}>
                        Gastos
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Lista de Transacciones */}
            <ScrollView style={styles.transactionsList}>
                {Object.entries(groupedByDate).map(([date, transactions]) => (
                    <View key={date}>
                        <View style={styles.dateHeader}>
                            <Text style={styles.dateHeaderText}>
                                {format(parseISO(date), 'EEEE, d MMMM', { locale: es })}
                            </Text>
                            <Text style={styles.dateHeaderTotal}>
                                ${transactions.reduce((sum, t) =>
                                    t.type === 'expense' ? sum - t.amount : sum + t.amount, 0
                                ).toLocaleString('es-AR')}
                            </Text>
                        </View>
                        {transactions.map(transaction => (
                            <View key={transaction.id} style={styles.transactionItem}>
                                <View style={styles.transactionIcon}>
                                    <Text style={styles.transactionIconText}>
                                        {transaction.type === 'expense' ? '💸' : '💰'}
                                    </Text>
                                </View>
                                <View style={styles.transactionDetails}>
                                    <Text style={styles.transactionDescription}>
                                        {transaction.description}
                                    </Text>
                                    <Text style={styles.transactionCategory}>
                                        {transaction.category_name} • {format(parseISO(transaction.date), 'HH:mm')}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.transactionAmount,
                                    { color: transaction.type === 'expense' ? '#EF5350' : '#4CAF50' }
                                ]}>
                                    {transaction.type === 'expense' ? '-' : '+'}
                                    ${transaction.amount.toLocaleString('es-AR')}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>

            {/* Botón flotante */}
            <AddTransactionsButton />

        </View>
    );
};
