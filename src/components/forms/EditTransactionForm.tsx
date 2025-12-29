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
import { calculateDaysInMonth } from '../../utils/helpers';
import { ICON_OPTIONS, IconKey, IconOption } from '../../constants/icons';

// Hooks
import { useTransactionForm } from '../../hooks/useTransactionForm';
import useMessage from '../../stores/useMessage';
import useDateStore from '../../stores/useDateStore';

// Interfaces
import { Transaction } from '../../interfaces/data.interface';
import { MessageType } from '../../interfaces/message.interface';

// Componentes Hijos
import CategoryAndAmountInput from './Inputs/CategoryAndAmountInput'; 
import DescriptionInput from './Inputs/DescriptionInput';
import AccountSelector from './Inputs/AccoutSelector';
import IconsSelector from './Inputs/IconsSelector';
import ModernCalendarSelector from '../buttons/ModernDateSelector';
import { set } from 'date-fns';
import { TransactionHeaderTitle } from '../headers/TransactionsHeaderInput';

const { height } = Dimensions.get('window');

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


    // Hooks
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
        setSelectedAccount // Asegúrate de tener esto en tu hook o useState local
    } = useTransactionForm();

    const { showMessage } = useMessage();

    // Estados Locales
    const [newAccount, setNewAccount] = useState<string>(selectedAccount);
    const [oldDate, setOldDate] = useState<Date>(new Date(transaction?.date || new Date()));
    const [isLoading, setIsLoading] = useState(false);
    const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);

    // Inicializar Icono
    const getInitialIcon = (): IconOption | null => {
        if (!transaction) return null;
        const matchingIcon = iconOptions.find((icon) => icon.label === transaction.category_name);
        if (matchingIcon) return matchingIcon;
        const defaultList = ICON_OPTIONS[transaction.type === "income" ? IconKey.income : IconKey.spend];
        return defaultList?.[0] || null;
    };

    const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(getInitialIcon());


    const date = new Date(transaction?.date || new Date()).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const title = transaction?.type === 'expense' ? 'Edit Expense' : 'Edit Income';
    const titleColor = transaction?.type === 'expense' ? '#EF5350' : '#667eea';

    // Sincronizar estado local de cuenta con el hook si es necesario
    // O usar newAccount directamente en el submit
    useEffect(() => {
        if (transaction) {
            setSelectedAccount(transaction.account_id);
            setNewAccount(transaction.account_id);
            setOldDate(new Date(transaction.date));
            setAmount(Math.abs(transaction.amount).toString());
            setDescription(transaction.description || '');
        }
    }, [transaction]);

    // Handlers
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
            const updatedTransaction: Transaction = {
                ...transaction,
                amount: transaction.type === 'expense'
                    ? -Math.abs(parseFloat(amount))
                    : Math.abs(parseFloat(amount)),
                description,
                date: oldDate.toISOString(),
                category_name: selectedIcon.label,
                account_id: newAccount,
            };

            await onSave(updatedTransaction, transaction.account_id || null, newAccount || null);
            showMessage(MessageType.UPDATED, "Transaction updated successfully.");
            onClose(false);

        } catch (error) {
            showMessage(MessageType.ERROR, "Error updating transaction.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!transaction) return null;

    const isExpense = transaction.type === 'expense';
    const typeLabel = isExpense ? 'Expense' : 'Income';
    const headerColor = isExpense ? '#EF5350' : '#667eea';

    return (
        <Modal
            visible={open}
            transparent
            animationType="none"
            onRequestClose={() => onClose(false)}
            statusBarTranslucent
        >
            {/* Backdrop con Blur */}
            {open && (
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
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.container}
            >
                {open && (
                    <Animated.View 
                        entering={SlideInUp.duration(200)}
                        exiting={SlideOutUp.duration(200)}
                        style={[
                            styles.topSheet,
                            { paddingTop: insets.top + 10 }
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <TransactionHeaderTitle
                                title={title}
                                date={
                                    oldDate.getTime() !== new Date(transaction.date).getTime()
                                        ? oldDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
                                        : date
                                }
                                titleColor={
                                    oldDate.getTime() !== new Date(transaction.date).getTime()
                                        ? '#3B9797'
                                        : titleColor
                                }
                            />
                            <TouchableOpacity onPress={() => onClose(false)} style={styles.closeButton}>
                                <MaterialIcons name="close" size={20} color="#555" />
                            </TouchableOpacity>
                        </View>

                        {/* Content Scrollable */}
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* 1. Category & Amount */}
                            <CategoryAndAmountInput
                                selectedIcon={selectedIcon}
                                amount={amount}
                                amountInputRef={amountInputRef}
                                handleIconClick={handleIconPress}
                                setAmount={setAmount}
                            />

                            {/* 2. Description */}
                            <DescriptionInput
                                description={description}
                                setDescription={setDescription}
                            />

                            {/* 3. Row: Account & Date */}
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
                                        selectedDate={oldDate}
                                        onDateChange={setOldDate}
                                    />
                                </View>
                            </View>

                            {/* 4. Action Buttons */}
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

                        {/* Icon Selector */}
                        {isIconSelectorOpen && (
                            <IconsSelector
                                popoverOpen={isIconSelectorOpen}
                                handleClosePopover={() => setIsIconSelectorOpen(false)}
                                iconOptions={ICON_OPTIONS[
                                    transaction.type === "income" ? IconKey.income : IconKey.spend
                                ] as unknown as IconOption[]}
                                handleSelectIcon={handleSelectIcon}
                                selectedIcon={selectedIcon}
                                // Si IconsSelector necesita anchorEl, puedes pasar null o manejarlo diferente en móvil
                            />
                        )}

                    </Animated.View>
                )}
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start', // Pegado arriba
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
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
        flex: 2, // Botón de guardar más grande para énfasis
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