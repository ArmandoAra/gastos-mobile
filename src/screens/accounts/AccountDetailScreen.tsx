// ACCOUNT DETAIL SCREEN (src/screens/accounts/AccountDetailScreen.tsx)
// ============================================
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTransactionsStore } from '../../stores/transactionsStore';
import { useAccountsStore } from '../../stores/accountsStore';
import { useState, useEffect } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { StyleSheet } from 'react-native';

export const AccountDetailScreen = ({ route, navigation }: any) => {
    const { accountId } = route.params;
    const { getAccountById, updateAccount, deleteAccount } = useAccountsStore();
    const { transactions, deleteTransaction } = useTransactionsStore();
    const [isEditing, setIsEditing] = useState(false);
    const [accountName, setAccountName] = useState('');

    const account = getAccountById(accountId);

    useEffect(() => {
        if (account) {
            setAccountName(account.name);
            navigation.setOptions({ title: account.name });
        }
    }, [account]);

    if (!account) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Cuenta no encontrada</Text>
            </View>
        );
    }

    const accountTransactions = transactions.filter(
        (t) => t.account_id === accountId
    );

    const income = accountTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = accountTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const handleSaveName = () => {
        if (accountName.trim()) {
            updateAccount(accountId, { name: accountName });
            setIsEditing(false);
            navigation.setOptions({ title: accountName });
        }
    };

    const handleDeleteAccount = () => {
        // Aquí podrías agregar un Alert para confirmar
        deleteAccount(accountId);
        navigation.goBack();
    };

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'checking':
                return '💳';
            case 'savings':
                return '🏦';
            case 'cash':
                return '💵';
            default:
                return '💰';
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Account Header */}
            <View style={styles.headerCard}>
                <View style={styles.accountIconLarge}>
                    <Text style={styles.accountIconLargeText}>
                        {getAccountIcon(account.type)}
                    </Text>
                </View>

                {isEditing ? (
                    <View style={styles.editContainer}>
                        <TextInput
                            style={styles.editInput}
                            value={accountName}
                            onChangeText={setAccountName}
                            autoFocus
                        />
                        <View style={styles.editButtons}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={handleSaveName}
                            >
                                <Text style={styles.editButtonText}>Guardar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.editButton, styles.editButtonCancel]}
                                onPress={() => {
                                    setAccountName(account.name);
                                    setIsEditing(false);
                                }}
                            >
                                <Text style={styles.editButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.accountHeader}>
                        <Text style={styles.accountNameLarge}>{account.name}</Text>
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Text style={styles.editIcon}>✏️</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.accountTypeLarge}>
                    {account.type === 'checking'
                        ? 'Cuenta Corriente'
                        : account.type === 'savings'
                            ? 'Ahorros'
                            : 'Efectivo'}
                </Text>

                <Text style={styles.balanceLarge}>
                    ${account.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </Text>
            </View>

            {/* Statistics */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>📈</Text>
                    <Text style={styles.statLabel}>Ingresos</Text>
                    <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                        ${income.toLocaleString('es-AR')}
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>📉</Text>
                    <Text style={styles.statLabel}>Gastos</Text>
                    <Text style={[styles.statValue, { color: '#EF5350' }]}>
                        ${expenses.toLocaleString('es-AR')}
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statIcon}>💳</Text>
                    <Text style={styles.statLabel}>Transacciones</Text>
                    <Text style={styles.statValue}>{accountTransactions.length}</Text>
                </View>
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Transacciones Recientes</Text>
                {accountTransactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>📭</Text>
                        <Text style={styles.emptyStateText}>
                            No hay transacciones en esta cuenta
                        </Text>
                    </View>
                ) : (
                    accountTransactions
                        .sort(
                            (a, b) =>
                                new Date(b.date).getTime() - new Date(a.date).getTime()
                        )
                        .slice(0, 10)
                        .map((transaction) => (
                            <TouchableOpacity
                                key={transaction.id}
                                style={styles.transactionItem}
                                onPress={() => {
                                    // Navegar a detalle de transacción o mostrar opciones
                                }}
                            >
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
                                        {transaction.category_name} •{' '}
                                        {format(parseISO(transaction.date), 'dd MMM yyyy', {
                                            locale: es,
                                        })}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.transactionAmount,
                                        {
                                            color:
                                                transaction.type === 'expense' ? '#EF5350' : '#4CAF50',
                                        },
                                    ]}
                                >
                                    {transaction.type === 'expense' ? '-' : '+'}$
                                    {transaction.amount.toLocaleString('es-AR')}
                                </Text>
                            </TouchableOpacity>
                        ))
                )}
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                        navigation.navigate('AddTransaction', { accountId: account.id })
                    }
                >
                    <Text style={styles.actionButtonText}>➕ Agregar Transacción</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDeleteAccount}
                >
                    <Text style={[styles.actionButtonText, { color: 'white' }]}>
                        🗑️ Eliminar Cuenta
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const accountDetailStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    errorText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginTop: 40,
    },
    headerCard: {
        backgroundColor: '#6200EE',
        margin: 16,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
    },
    accountIconLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    accountIconLargeText: {
        fontSize: 40,
    },
    editContainer: {
        width: '100%',
        marginBottom: 12,
    },
    editInput: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    editButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#03DAC6',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButtonCancel: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    editButtonText: {
        color: '#000',
        fontWeight: '600',
    },
    accountHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    accountNameLarge: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 8,
    },
    editIcon: {
        fontSize: 20,
    },
    accountTypeLarge: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 16,
    },
    balanceLarge: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    section: {
        backgroundColor: 'white',
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#757575',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transactionIconText: {
        fontSize: 20,
    },
    transactionDetails: {
        flex: 1,
    },
    transactionDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    transactionCategory: {
        fontSize: 12,
        color: '#757575',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionsContainer: {
        paddingHorizontal: 16,
        gap: 12,
    },
    actionButton: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    deleteButton: {
        backgroundColor: '#EF5350',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6200EE',
    },
});