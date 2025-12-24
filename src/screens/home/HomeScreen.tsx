import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Dimensions,
    StyleSheet
} from 'react-native';
import {
    VictoryBar,
    VictoryChart,
    VictoryTheme,
    VictoryLine,
    VictoryPie,
    VictoryAxis,
    VictoryTooltip,
    VictoryVoronoiContainer
} from 'victory';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { styles } from '../../theme/styles';

// ============================================
// MOCK DATA & TYPES
// ============================================

export const MOCK_ACCOUNTS = [
    { id: '1', name: 'Cuenta Principal', type: 'checking', balance: 15420.50 },
    { id: '2', name: 'Ahorros', type: 'savings', balance: 45000.00 },
    { id: '3', name: 'Efectivo', type: 'cash', balance: 1250.00 }
];

export const MOCK_TRANSACTIONS = [
    { id: '1', description: 'Supermercado', amount: 450.00, type: 'expense', category_name: 'Alimentación', date: '2024-12-20T10:30:00', account_id: '1' },
    { id: '2', description: 'Salario', amount: 8500.00, type: 'income', category_name: 'Salario', date: '2024-12-15T09:00:00', account_id: '1' },
    { id: '3', description: 'Netflix', amount: 55.90, type: 'expense', category_name: 'Entretenimiento', date: '2024-12-18T14:20:00', account_id: '1' },
    { id: '4', description: 'Gasolina', amount: 320.00, type: 'expense', category_name: 'Transporte', date: '2024-12-19T08:15:00', account_id: '1' },
    { id: '5', description: 'Freelance', amount: 2500.00, type: 'income', category_name: 'Extra', date: '2024-12-17T16:00:00', account_id: '2' },
    { id: '6', description: 'Restaurante', amount: 180.00, type: 'expense', category_name: 'Alimentación', date: '2024-12-21T19:30:00', account_id: '3' },
    { id: '7', description: 'Farmacia', amount: 95.00, type: 'expense', category_name: 'Salud', date: '2024-12-16T11:00:00', account_id: '1' },
    { id: '8', description: 'Gimnasio', amount: 150.00, type: 'expense', category_name: 'Salud', date: '2024-12-01T07:00:00', account_id: '1' },
    { id: '9', description: 'Café', amount: 45.00, type: 'expense', category_name: 'Alimentación', date: '2024-12-22T08:30:00', account_id: '3' },
    { id: '10', description: 'Uber', amount: 35.50, type: 'expense', category_name: 'Transporte', date: '2024-12-22T18:00:00', account_id: '1' },
    { id: '11', description: 'Compras', amount: 890.00, type: 'expense', category_name: 'Compras', date: '2024-12-14T15:30:00', account_id: '1' },
    { id: '12', description: 'Luz', amount: 210.00, type: 'expense', category_name: 'Servicios', date: '2024-12-05T10:00:00', account_id: '1' },
    { id: '13', description: 'Internet', amount: 120.00, type: 'expense', category_name: 'Servicios', date: '2024-12-05T10:00:00', account_id: '1' },
    { id: '14', description: 'Cine', amount: 80.00, type: 'expense', category_name: 'Entretenimiento', date: '2024-12-13T20:00:00', account_id: '1' },
    { id: '15', description: 'Supermercado', amount: 620.00, type: 'expense', category_name: 'Alimentación', date: '2024-12-10T11:00:00', account_id: '1' }
];

// ============================================
// HOME SCREEN
// ============================================

export function HomeScreen() {
    const totalBalance = MOCK_ACCOUNTS.reduce((sum, acc) => sum + acc.balance, 0);
    const recentTransactions = MOCK_TRANSACTIONS.slice(0, 5);

    const monthExpenses = MOCK_TRANSACTIONS
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const monthIncome = MOCK_TRANSACTIONS
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <ScrollView style={styles.container}>
            {/* Balance Total */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Balance Total</Text>
                <Text style={styles.balanceAmount}>
                    ${totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </Text>
                <View style={styles.balanceRow}>
                    <View style={styles.balanceItem}>
                        <Text style={styles.balanceItemLabel}>Ingresos</Text>
                        <Text style={[styles.balanceItemAmount, { color: '#4CAF50' }]}>
                            +${monthIncome.toLocaleString('es-AR')}
                        </Text>
                    </View>
                    <View style={styles.balanceItem}>
                        <Text style={styles.balanceItemLabel}>Gastos</Text>
                        <Text style={[styles.balanceItemAmount, { color: '#EF5350' }]}>
                            -${monthExpenses.toLocaleString('es-AR')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Cuentas */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mis Cuentas</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>Ver todas</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {MOCK_ACCOUNTS.map(account => (
                        <View key={account.id} style={styles.accountCard}>
                            <View style={styles.accountIcon}>
                                <Text style={styles.accountIconText}>
                                    {account.type === 'checking' ? '💳' : account.type === 'savings' ? '🏦' : '💵'}
                                </Text>
                            </View>
                            <Text style={styles.accountName}>{account.name}</Text>
                            <Text style={styles.accountBalance}>
                                ${account.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Transacciones Recientes */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>Ver todas</Text>
                    </TouchableOpacity>
                </View>
                {recentTransactions.map(transaction => (
                    <View key={transaction.id} style={styles.transactionItem}>
                        <View style={styles.transactionIcon}>
                            <Text style={styles.transactionIconText}>
                                {transaction.type === 'expense' ? '💸' : '💰'}
                            </Text>
                        </View>
                        <View style={styles.transactionDetails}>
                            <Text style={styles.transactionDescription}>{transaction.description}</Text>
                            <Text style={styles.transactionCategory}>{transaction.category_name}</Text>
                        </View>
                        <View style={styles.transactionRight}>
                            <Text style={[
                                styles.transactionAmount,
                                { color: transaction.type === 'expense' ? '#EF5350' : '#4CAF50' }
                            ]}>
                                {transaction.type === 'expense' ? '-' : '+'}
                                ${transaction.amount.toLocaleString('es-AR')}
                            </Text>
                            <Text style={styles.transactionDate}>
                                {format(parseISO(transaction.date), 'dd MMM', { locale: es })}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.quickActionBtn}>
                        <Text style={styles.quickActionIcon}>➕</Text>
                        <Text style={styles.quickActionText}>Agregar Gasto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.quickActionBtn}>
                        <Text style={styles.quickActionIcon}>💵</Text>
                        <Text style={styles.quickActionText}>Agregar Ingreso</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

