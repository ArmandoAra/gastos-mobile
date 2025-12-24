
// ACCOUNTS LIST SCREEN
// ============================================
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Modal
} from 'react-native';
import { styles } from '../../theme/styles2';

const MOCK_ACCOUNTS = [
    { id: '1', name: 'Cuenta Principal', type: 'checking', balance: 15420.50 },
    { id: '2', name: 'Ahorros', type: 'savings', balance: 45000.00 },
    { id: '3', name: 'Efectivo', type: 'cash', balance: 1250.00 }
];

export const AccountsListScreen = () => {
    const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
    const [modalVisible, setModalVisible] = useState(false);
    const [newAccount, setNewAccount] = useState({ name: '', type: 'checking' });

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const getAccountIcon = (type: string) => {
        switch (type) {
            case 'checking': return '💳';
            case 'savings': return '🏦';
            case 'cash': return '💵';
            default: return '💰';
        }
    };

    const handleAddAccount = () => {
        if (newAccount.name.trim()) {
            const account = {
                id: Date.now().toString(),
                name: newAccount.name,
                type: newAccount.type,
                balance: 0
            };
            setAccounts([...accounts, account]);
            setNewAccount({ name: '', type: 'checking' });
            setModalVisible(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Total Balance */}
            <View style={styles.totalCard}>
                <Text style={styles.totalLabel}>Balance Total</Text>
                <Text style={styles.totalAmount}>
                    ${totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.totalSubtext}>{accounts.length} cuentas activas</Text>
            </View>

            {/* Accounts List */}
            <ScrollView style={styles.accountsList}>
                {accounts.map(account => (
                    <TouchableOpacity key={account.id} style={styles.accountCard}>
                        <View style={styles.accountIcon}>
                            <Text style={styles.accountIconText}>{getAccountIcon(account.type)}</Text>
                        </View>
                        <View style={styles.accountInfo}>
                            <Text style={styles.accountName}>{account.name}</Text>
                            <Text style={styles.accountType}>
                                {account.type === 'checking' ? 'Cuenta Corriente' :
                                    account.type === 'savings' ? 'Ahorros' : 'Efectivo'}
                            </Text>
                        </View>
                        <View style={styles.accountBalance}>
                            <Text style={styles.accountBalanceAmount}>
                                ${account.balance.toLocaleString('es-AR')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Add Account Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            {/* Add Account Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Nueva Cuenta</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la cuenta"
                            value={newAccount.name}
                            onChangeText={(text) => setNewAccount({ ...newAccount, name: text })}
                        />

                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeBtn, newAccount.type === 'checking' && styles.typeBtnActive]}
                                onPress={() => setNewAccount({ ...newAccount, type: 'checking' })}
                            >
                                <Text style={styles.typeBtnIcon}>💳</Text>
                                <Text style={styles.typeBtnText}>Corriente</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, newAccount.type === 'savings' && styles.typeBtnActive]}
                                onPress={() => setNewAccount({ ...newAccount, type: 'savings' })}
                            >
                                <Text style={styles.typeBtnIcon}>🏦</Text>
                                <Text style={styles.typeBtnText}>Ahorros</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, newAccount.type === 'cash' && styles.typeBtnActive]}
                                onPress={() => setNewAccount({ ...newAccount, type: 'cash' })}
                            >
                                <Text style={styles.typeBtnIcon}>💵</Text>
                                <Text style={styles.typeBtnText}>Efectivo</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalBtnConfirm]}
                                onPress={handleAddAccount}
                            >
                                <Text style={[styles.modalBtnText, { color: 'white' }]}>Crear</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};