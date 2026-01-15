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
    Keyboard,
    AccessibilityInfo
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp,
    SlideOutUp,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

// --- IMPORTS ---
import { ICON_OPTIONS, IconKey, IconOption } from '../../constants/icons';
import { useTransactionForm } from '../../hooks/useTransactionForm';
import useMessage from '../../stores/useMessage';
import { Category, Transaction } from '../../interfaces/data.interface';
import { MessageType } from '../../interfaces/message.interface';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import { ThemeColors } from '../../types/navigation';
import { styles } from './stylesForm';

// Componentes Hijos
import CategoryAndAmountInput from './Inputs/CategoryAndAmountInput'; 
import DescriptionInput from './Inputs/DescriptionInput';
import AccountSelector from './Inputs/AccoutSelector';
import ModernCalendarSelector from '../buttons/ModernDateSelector';
import { TransactionHeaderTitle } from '../headers/TransactionsHeaderInput';
import IconsSelectorPopover from './Inputs/CategorySelector';
import CalculatorSheet from './Inputs/CalculatorSheet';
import useDataStore from '../../stores/useDataStore';
import { useKeyboardStatus } from '../../hooks/useKeyboardStatus';
import { set } from 'date-fns';
import SubmitButton, { addOption } from '../buttons/submitButton';
import { CategoryLabel, CategoryLabelPortuguese, CategoryLabelSpanish } from '../../api/interfaces';
import { InputNameActive } from '../../interfaces/settings.interface';
import { defaultCategories } from '../../constants/categories';
import CategorySelectorPopover from './Inputs/CategorySelector';
import { de } from 'date-fns/locale';
import InfoPopUp from '../messages/InfoPopUp';
import { useAuthStore } from '../../stores/authStore';

interface EditTransactionFormProps {
    open: boolean;
    transaction: Transaction | null;
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
    onClose,
    onSave,
}: EditTransactionFormProps) {
    const { t } = useTranslation();
    const { theme } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
    const insets = useSafeAreaInsets();

    const {
        localSelectedDay,
        amount,
        description,
        selectedAccount,
        amountInputRef,
        defaultCategoriesOptions,
        userCategoriesOptions,
        setAmount,
        setDescription,
        setLocalSelectedDay,
        setSelectedAccount,
    } = useTransactionForm();

    const { user } = useAuthStore();

    const { showMessage } = useMessage();
    const { allAccounts } = useDataStore();

    // Estados Locales
    const [newAccount, setNewAccount] = useState<string>(selectedAccount || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);

    const allCategories = [...defaultCategories, ...userCategoriesOptions];

    const [selectedCategory, setSelectedCategory] = useState<Category>(allCategories[0]);

    // Monitorizamos el estado del teclado nativo
    const isKeyboardVisible = useKeyboardStatus();

    // Estado para la calculadora
    const [showCalculator, setShowCalculator] = useState(false);

    // Efecto de inicialización
    useEffect(() => {
        if (transaction && open) {
            setAmount(Math.abs(transaction.amount).toString());
            setDescription(transaction.description || '');
            setSelectedAccount(transaction.account_id);
            setLocalSelectedDay(new Date(transaction.date));
            setNewAccount(transaction.account_id);

            const categoryName = transaction.slug_category_name[0] as CategoryLabel;

            const customCategory = userCategoriesOptions.find(
                cat => cat.name === categoryName && cat.userId === user?.id
            );

            const defaultCategory = defaultCategories.find(
                cat => cat.name === categoryName && cat.userId === 'default'
            );

            const found = customCategory || defaultCategory;
            setSelectedCategory(found || allCategories[0]);

            if (Platform.OS !== 'web') {
                AccessibilityInfo.announceForAccessibility(t('accessibility.edit_form_opened', 'Edit transaction form opened'));
            }
        }
    }, [transaction, open]);

    // Efecto: Cerrar calculadora si se abre teclado nativo
    useEffect(() => {
        if (isKeyboardVisible) {
            setShowCalculator(false);
        }
    }, [isKeyboardVisible]);

    const handleOpenCalculator = () => {
        if (showCalculator) { return setShowCalculator(false) };
        Keyboard.dismiss();
        // Pequeño delay para permitir que el teclado baje
        setTimeout(() => {
            setShowCalculator(true);
            if (Platform.OS !== 'web') {
                AccessibilityInfo.announceForAccessibility(t('accessibility.calculator_opened', 'Calculator keypad opened'));
            }
        }, 100);
    };

    const handleSelectCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsCategorySelectorOpen(false);
    };

    const handleUpdate = async () => {
        if (!transaction || !selectedCategory) return;

        // Validamos evaluando la expresión matemática
        let finalAmountVal = 0;
        try {
            // eslint-disable-next-line no-new-func
            finalAmountVal = new Function('return ' + amount)();
        } catch {
            finalAmountVal = parseFloat(amount);
        }

        if (!finalAmountVal || isNaN(finalAmountVal) || finalAmountVal === 0) {
            const msg = t('validation.invalid_amount', 'Please enter a valid amount');
            Alert.alert(t('common.error'), msg);
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(msg);
            amountInputRef.current?.focus();
            return;
        }

        setIsLoading(true);

        try {
            const finalDate = new Date(localSelectedDay);
            const originalDate = new Date(transaction.date);

            // Mantener hora original si es el mismo día
            if (finalDate.toDateString() === originalDate.toDateString()) {
                finalDate.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());
            }
            const defaultCategoriesSlug: string[] = [
                CategoryLabelSpanish[selectedCategory.name as keyof typeof CategoryLabelSpanish] || "",
                CategoryLabelPortuguese[selectedCategory.name as keyof typeof CategoryLabelPortuguese] || "",
            ];

            const isNewCategory = !defaultCategoriesSlug.includes(selectedCategory.name as string);

            const updatedTransaction: Transaction = {
                ...transaction,
                amount: transaction.type === 'expense'
                    ? -Math.abs(finalAmountVal)
                    : Math.abs(finalAmountVal),
                description: description.trim(),
                date: finalDate.toISOString(),
                category_icon_name: selectedCategory.name,
                slug_category_name: isNewCategory ? [
                    selectedCategory.name as string,
                    ...defaultCategoriesSlug
                ] : defaultCategoriesSlug,
                account_id: newAccount,
                updated_at: new Date().toISOString()
            };
            await onSave(updatedTransaction, transaction.account_id, newAccount);
            showMessage(MessageType.UPDATED, t('messages.transaction_updated', 'Transaction updated'));
            onClose(false);

        } catch (error) {
            console.error(error);
            showMessage(MessageType.ERROR, t('messages.error_updating', 'Error updating transaction'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!transaction) return null;

    const isExpense = transaction.type === 'expense';
    const formattedDate = localSelectedDay.toLocaleDateString();

    return (
        <Modal
            visible={open}
            transparent
            animationType="none"
            onRequestClose={() => onClose(false)}
            statusBarTranslucent
            accessibilityViewIsModal={true}
        >
            <InfoPopUp />

            <View style={StyleSheet.absoluteFill}>
                {/* Backdrop Accesible */}
                {/* Main Sheet */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.container}
                    pointerEvents="box-none"
                >
                    <Animated.View 
                        entering={SlideInUp.duration(200)}
                        exiting={SlideOutUp.duration(200)}
                        style={[
                            styles.topSheet,
                            { backgroundColor: colors.surfaceSecondary, paddingTop: insets.top + 10 }
                        ]}
                        accessibilityRole="adjustable"
                    >
                        {/* Header */}
                        <View style={styles.header} accessibilityRole="header">
                            <TouchableOpacity
                                onPress={() => {
                                    onClose(false);
                                    setShowCalculator(false);
                                }}
                                style={[styles.closeButton, { backgroundColor: colors.text, borderColor: colors.border }]}
                                accessibilityRole="button"
                                accessibilityLabel={t('common.close', 'Close')}
                            >
                                <MaterialIcons name="close" size={24} color={colors.surface} />
                            </TouchableOpacity>

                            <TransactionHeaderTitle
                                title={isExpense ? t('transactions.edit_expense', 'Edit Expense') : t('transactions.edit_income', 'Edit Income')}
                                date={formattedDate}
                                titleColor={colors.text}
                            />
                            <ModernCalendarSelector
                                selectedDate={localSelectedDay}
                                onDateChange={setLocalSelectedDay}
                            />
                        </View>

                        {/* Contenido Scrollable */}
                        <ScrollView
                            contentContainerStyle={[
                                styles.scrollContent,
                                // Padding dinámico para que la calculadora no tape el botón guardar
                                { paddingBottom: (isKeyboardVisible || showCalculator) ? 370 : 100 }
                            ]}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <CategoryAndAmountInput
                                selectedCategory={selectedCategory}
                                amount={amount}
                                amountInputRef={amountInputRef}
                                handleCategoryClick={() => setIsCategorySelectorOpen(true)}
                                setAmount={setAmount}
                                colors={colors}
                                onOpenCalculator={handleOpenCalculator}
                            />

                            <DescriptionInput
                                description={description}
                                setDescription={setDescription}
                                colors={colors}
                            />

                            <View style={styles.rowSelectors}>
                                <View style={{ flex: 1 }}>
                                    <AccountSelector
                                        label={t('accounts.label', 'Account')}
                                        accountSelected={newAccount}
                                        setAccountSelected={setNewAccount}
                                        accounts={allAccounts}
                                        colors={colors}
                                    />
                                </View>
                            </View>

                            <View style={styles.actionButtons}>
                                <SubmitButton
                                    handleSave={handleUpdate}
                                    selectedCategory={selectedCategory}
                                    option={isExpense ? addOption.Spend : addOption.Income}
                                    // Validación simple para deshabilitar
                                    disabled={!amount || parseFloat(amount) === 0 || !selectedAccount}
                                    colors={colors}
                                />
                            </View>
                        </ScrollView>

                        {/* CALCULADORA (Posicionada Fixed al fondo) */}
                        {showCalculator && (
                            <Animated.View
                                entering={SlideInDown.duration(300)}
                                exiting={SlideOutDown.duration(100)}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 1000,
                                    borderTopWidth: 1,
                                    borderColor: colors.border,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: -2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 5,
                                    elevation: 20,
                                }}
                            >
                                <CalculatorSheet
                                    colors={colors}
                                    value={amount}
                                    onChange={setAmount}
                                    onClose={() => setShowCalculator(false)}
                                />
                            </Animated.View>
                        )}

                        {/* Popover Categorías */}
                        {isCategorySelectorOpen && (
                            <CategorySelectorPopover
                                popoverOpen={isCategorySelectorOpen}
                                handleClosePopover={() => setIsCategorySelectorOpen(false)}
                                handleSelectCategory={handleSelectCategory}
                                selectedCategory={selectedCategory}
                                colors={colors}
                                defaultCategories={defaultCategoriesOptions}
                                userCategories={userCategoriesOptions}
                            />
                        )}
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}