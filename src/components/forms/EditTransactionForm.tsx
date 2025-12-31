import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    Modal, 
    TouchableOpacity, 
    StyleSheet, 
    Platform, 
    KeyboardAvoidingView, 
    ScrollView,
    Alert,
    Dimensions
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp,
    SlideOutUp
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Stores & Utils
import { ICON_OPTIONS, IconKey, IconOption, transactions_icons } from '../../constants/icons';

// Hooks
import { useTransactionForm } from '../../hooks/useTransactionForm';
import useMessage from '../../stores/useMessage';

// Interfaces
import { Transaction } from '../../interfaces/data.interface';
import { MessageType } from '../../interfaces/message.interface';

// Componentes Hijos
import CategoryAndAmountInput from './Inputs/CategoryAndAmountInput'; 
import DescriptionInput from './Inputs/DescriptionInput';
import AccountSelector from './Inputs/AccoutSelector';
import IconsSelector from './Inputs/IconsSelector';
import ModernCalendarSelector from '../buttons/ModernDateSelector';
import { TransactionHeaderTitle } from '../headers/TransactionsHeaderInput';
import { IconsOptions } from '../../../../Gastos/frontend/app/dashboard/constants/icons';

const { width } = Dimensions.get('window');

interface EditTransactionFormProps {
    open: boolean;
    transaction: Transaction | null;
    iconOptions: IconOption[];
    onClose: (isOpen: boolean) => void;
    onSave: (
        updatedTransaction: Transaction,
        fromAccount: string | null,
        toAccount: string | null,
    ) => Promise<Transaction | null | undefined>;
}

export default function EditTransactionFormMobile({
    open,
    transaction,
    iconOptions,
    onClose,
    onSave,
}: EditTransactionFormProps) {
    const insets = useSafeAreaInsets();

    const {
        localSelectedDay,
        amount,
        description,
        selectedAccount,
        allAccounts,
        amountInputRef,
        setAmount,
        setDescription,
        setLocalSelectedDay,
        setSelectedAccount,
        setSelectedIcon: setStoreIcon, // Asumo que tu hook tiene esto
    } = useTransactionForm();

    const { showMessage } = useMessage();

    // Estados Locales
    const [newAccount, setNewAccount] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(null);

    // Efecto para cargar los datos de la transacción al abrir
    useEffect(() => {
        if (transaction && open) {
        // Sincronizar Stores
            setAmount(Math.abs(transaction.amount).toString());
            setDescription(transaction.description || '');
            setSelectedAccount(transaction.account_id);
            setLocalSelectedDay(new Date(transaction.date));
            setNewAccount(transaction.account_id);

            // Buscar e inicializar el icono correcto
            const icon = ICON_OPTIONS[
                transaction.type === "income" ? IconKey.income : IconKey.spend
            ].find(icon => icon.label === transaction.category_name);

            setSelectedIcon(icon as IconOption);
        }
    }, [transaction, open]);

    const handleIconPress = () => setIsIconSelectorOpen(true);

    const handleSelectIcon = (icon: IconOption) => {
        setSelectedIcon(icon);
        setIsIconSelectorOpen(false);
    };

    const handleUpdate = async () => {
        if (!transaction || !selectedIcon) return;

        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) === 0) {
            Alert.alert("Invalid Amount", "Please enter a valid amount.");
            amountInputRef.current?.focus();
            return;
        }

        setIsLoading(true);

        try {
            // Mantener la hora original si el día no ha cambiado
            const finalDate = new Date(localSelectedDay);
            const originalDate = new Date(transaction.date);

            // Si el día es el mismo, preservamos la hora exacta original
            if (finalDate.toDateString() === originalDate.toDateString()) {
                finalDate.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());
            }

            const updatedTransaction: Transaction = {
                ...transaction,
                amount: transaction.type === 'expense'
                    ? -Math.abs(parseFloat(amount))
                    : Math.abs(parseFloat(amount)),
                description: description.trim(),
                date: finalDate.toISOString(),
                category_name: selectedIcon.label,
                account_id: newAccount,
                updated_at: new Date().toISOString()
            };

            await onSave(updatedTransaction, transaction.account_id, newAccount);
            showMessage(MessageType.UPDATED, "Transaction updated successfully.");
            onClose(false);

        } catch (error) {
            console.error(error);
            showMessage(MessageType.ERROR, "Error updating transaction.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!transaction) return null;

    const isExpense = transaction.type === 'expense';
    const headerColor = isExpense ? '#EF5350' : '#667eea';
    const formattedDate = localSelectedDay.toLocaleDateString('en-US', {
        month: '2-digit', day: '2-digit', year: 'numeric'
    });

    return (
        <Modal
            visible={open}
            transparent
            animationType="none"
            onRequestClose={() => onClose(false)}
            statusBarTranslucent
        >
            <View style={StyleSheet.absoluteFill}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={StyleSheet.absoluteFill}
                >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            activeOpacity={1}
                            onPress={() => onClose(false)} 
                        />
                    </BlurView>
                </Animated.View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.container}
                >
                    <Animated.View 
                        entering={SlideInUp.duration(200)}
                        exiting={SlideOutUp.duration(200)}
                        style={[
                            styles.topSheet,
                            { paddingTop: insets.top + 10 }
                        ]}
                    >
                        <View style={styles.header}>
                            <TransactionHeaderTitle
                                title={isExpense ? 'Edit Expense' : 'Edit Income'}
                                date={formattedDate}
                                titleColor={headerColor}
                            />
                            <TouchableOpacity onPress={() => onClose(false)} style={styles.closeButton}>
                                <MaterialIcons name="close" size={20} color="#555" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <CategoryAndAmountInput
                                selectedIcon={selectedIcon}
                                amount={amount}
                                amountInputRef={amountInputRef}
                                handleIconClick={handleIconPress}
                                setAmount={setAmount}
                            />

                            <DescriptionInput
                                description={description}
                                setDescription={setDescription}
                            />

                            <View style={styles.rowSelectors}>
                                <View style={{ flex: 7 }}>
                                    <AccountSelector
                                        label="Account"
                                        accountSelected={newAccount}
                                        setAccountSelected={setNewAccount}
                                        accounts={allAccounts}
                                    />
                                </View>
                                <View style={{ width: 10 }} />
                                <View style={{ flex: 1 }}>
                                    <ModernCalendarSelector
                                        selectedDate={localSelectedDay}
                                        onDateChange={setLocalSelectedDay}
                                    />
                                </View>
                            </View>

                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    onPress={() => onClose(false)}
                                    style={styles.cancelButton}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleUpdate} 
                                    style={[styles.saveButton, { backgroundColor: headerColor }]}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        {isIconSelectorOpen && (
                            <IconsSelector
                                popoverOpen={isIconSelectorOpen}
                                handleClosePopover={() => setIsIconSelectorOpen(false)}
                                iconOptions={ICON_OPTIONS[
                                    transaction.type === "income" ? IconKey.income : IconKey.spend
                                ] as unknown as IconOption[]}
                                handleSelectIcon={handleSelectIcon}
                                selectedIcon={selectedIcon}
                            />
                        )}
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    topSheet: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        paddingBottom: 20,
        maxHeight: '85%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        marginBottom: 10,
    },
    closeButton: {
        padding: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    scrollContent: {
        paddingHorizontal: 20,
        gap: 16,
        paddingBottom: 20,
    },
    rowSelectors: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 16,
    },
    saveButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
});