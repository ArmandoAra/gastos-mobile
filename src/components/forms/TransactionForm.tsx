import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard,
    AccessibilityInfo,
    Alert
} from 'react-native';
import Animated, {
    SlideInUp,
    SlideOutUp,
    SlideInDown,
    SlideOutDown,
    FadeIn
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Stores & Interfaces
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import useDataStore from '../../stores/useDataStore';
import useBudgetsStore from '../../stores/useBudgetStore';
import useMessage from '../../stores/useMessage';

import { InputNameActive } from '../../interfaces/settings.interface';
import { Category, Transaction, TransactionType } from '../../interfaces/data.interface';
import { MessageType } from '../../interfaces/message.interface';


// Hooks
import { useTransactionForm } from '../../screens/transactions/constants/hooks/useTransactionForm';
import { useKeyboardStatus } from '../../screens/transactions/constants/hooks/useKeyboardStatus';

// Constants & Theme
import { darkTheme, lightTheme } from '../../theme/colors';
import { ThemeColors } from '../../types/navigation';
import { styles } from './stylesForm';

// Components
import SubmitButton, { addOption } from "../buttons/submitButton";
import CategoryAndAmountInput from "./Inputs/CategoryAndAmountInput";
import DescriptionInput from "./Inputs/DescriptionInput";
import AccountSelector from "./Inputs/AccoutSelector";
import ModernCalendarSelector from '../buttons/ModernDateSelector';
import { TransactionHeaderTitle } from '../headers/TransactionsHeaderInput';
import CalculatorSheet from './Inputs/CalculatorSheet';
import CategorySelectorPopover from './Inputs/CategorySelector';
import InfoPopUp from '../messages/InfoPopUp';
import { defaultCategories } from '../../constants/categories';
import { CategoryLabel, CategoryLabelPortuguese, CategoryLabelSpanish } from '../../interfaces/categories.interface';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import useCategoriesStore from '../../stores/useCategoriesStore';
import { de } from 'date-fns/locale';

interface TransactionFormProps {
    isOpen: boolean;
    onClose: (isOpen: boolean) => void;
    transactionToEdit?: Transaction | null; // Si existe, es modo Edición
}

export default function TransactionForm({ isOpen, onClose, transactionToEdit }: TransactionFormProps) {
    // --- 1. CONFIGURACIÓN & HOOKS ---
    const { theme } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { showMessage } = useMessage();

    // Stores de Cuentas para Actualización de Saldos
    const updateAccountBalance = useDataStore(state => state.updateAccountBalance);
    const deleteSomeAmountInAccount = useDataStore(state => state.deleteSomeAmountInAccount);
    const updateTransaction = useDataStore(state => state.updateTransaction);

    const {
        amount,
        description,
        selectedCategory,
        selectedAccount,
        localSelectedDay,
        allAccounts,
        isSubmitting,
        inputNameActive,
        amountInputRef,
        popoverOpen,
        defaultCategoriesOptions,
        userCategoriesOptions,
        handleDeleteCategory,
        setAmount,
        setDescription,
        setLocalSelectedDay,
        setSelectedAccount,
        handleClosePopover,
        handleSelectCategory,
        handleSave: handleSaveCreation, 
        handleCategoryClick,
        handleClose: resetForm 
    } = useTransactionForm();

    // Store de Presupuestos (Solo para Crear)
    const toTransactBudget = useBudgetsStore(state => state.toTransactBudget);
    const setToTransactBudget = useBudgetsStore(state => state.setToTransactBudget);
    const [isReady, setIsReady] = useState(false);
    const { getUserCategories } = useCategoriesStore();

    // Estados Locales UI
    const [showCalculator, setShowCalculator] = useState(false);
    const [isLoadingEdit, setIsLoadingEdit] = useState(false); // Estado de carga específico para edición

    // Monitor de Teclado
    const isKeyboardVisible = useKeyboardStatus();

    // --- 2. INICIALIZACIÓN (EFECTO UNIFICADO) ---
    useEffect(() => {
        if (isOpen) {
            if (transactionToEdit) {
                setIsReady(false);
                // === MODO EDICIÓN: Cargar datos existentes ===
                setAmount(Math.abs(transactionToEdit.amount).toString());
                setDescription(transactionToEdit.description || '');
                setSelectedAccount(transactionToEdit.account_id);
                setLocalSelectedDay(new Date(transactionToEdit.date));

                const customCategory = getUserCategories()
                const allCategories: Category[] = [...defaultCategories, ...customCategory];

                // buscar la categoria que coincida con el id guardado en la transaccion
                const matchCategory = allCategories.find(cat => cat.id === transactionToEdit.categoryId);

                handleSelectCategory(matchCategory || allCategories[0]);


                if (Platform.OS !== 'web') {
                    AccessibilityInfo.announceForAccessibility(t('accessibility.edit_form_opened', 'Edit transaction form opened'));
                }

            } else if (toTransactBudget) {
                // === MODO CREACIÓN (Desde Presupuesto) ===
                setAmount(toTransactBudget.totalAmount.toString());
                setDescription(toTransactBudget.name);
                
                const categoryName = toTransactBudget.slug_category_name[0];
                const allCategories = [...defaultCategoriesOptions, ...userCategoriesOptions];
                const foundCategory = allCategories.find(cat => cat.icon === categoryName);
                
                if (foundCategory) handleSelectCategory(foundCategory);
            
            } else {
                setAmount('');
                setDescription('');
            }
            requestAnimationFrame(() => {
                setIsReady(true);
            });

        } else {
            // Limpiar estado al cerrar el formulario
            resetForm();
            setIsReady(false);
            setIsLoadingEdit(false);
            setShowCalculator(false);   
            setToTransactBudget(null);
        }
    }, [isOpen]);

    // Cerrar calculadora si aparece el teclado
    useEffect(() => {
        if (isKeyboardVisible) setShowCalculator(false);
    }, [isKeyboardVisible]);

    // --- 3. LOGICA DE NEGOCIO ---

    // Determinar si es Gasto o Ingreso
    // En edición usamos el tipo de la transacción, en creación usamos el toggle global
    const isExpense = transactionToEdit 
        ? transactionToEdit.type === TransactionType.EXPENSE 
        : inputNameActive === InputNameActive.SPEND;

    const dateFormatted = new Date(localSelectedDay).toLocaleDateString(undefined, {
        month: '2-digit', day: '2-digit', year: 'numeric'
    });

    const handleOpenCalculator = () => {
        Keyboard.dismiss();
        setTimeout(() => {
            setShowCalculator(true);
            if (Platform.OS !== 'web') {
                AccessibilityInfo.announceForAccessibility(t('accessibility.calculator_opened'));
            }
        }, 100);
    };

    const handleCloseForm = () => {
        setToTransactBudget(null);
        setShowCalculator(false);
        onClose(false);
        resetForm(); // Limpia el hook useTransactionForm
    };

    // --- LÓGICA DE GUARDADO CENTRALIZADA ---
    const handleFinalSave = async () => {
        if (transactionToEdit) {
            // ================= MODO EDICIÓN =================
            await handleUpdateTransaction();
        } else {
            // ================= MODO CREACIÓN =================
            // Usamos la función original del hook que ya maneja la creación
            await handleSaveCreation(); 
            handleCloseForm();
        }
    };

    // Lógica específica de Actualización (Extraída del componente Edit original)
    const handleUpdateTransaction = async () => {
        if (!transactionToEdit || !selectedCategory) return;

        // Validar monto
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
            return;
        }

        setIsLoadingEdit(true);

        try {
            const finalDate = new Date(localSelectedDay);
            const originalDate = new Date(transactionToEdit.date);

            // Mantener hora original si es el mismo día
            if (finalDate.toDateString() === originalDate.toDateString()) {
                finalDate.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());
            }

            // Gestión de slugs para categorías
            const defaultCategoriesSlug: string[] = [
                CategoryLabelSpanish[selectedCategory.name as keyof typeof CategoryLabelSpanish] || "",
                CategoryLabelPortuguese[selectedCategory.name as keyof typeof CategoryLabelPortuguese] || "",
            ];
            const isNewCategory = !defaultCategoriesSlug.includes(selectedCategory.name as string);

            const updatedTransactionData: Transaction = {
                ...transactionToEdit,
                amount: transactionToEdit.type === TransactionType.EXPENSE
                    ? -Math.abs(finalAmountVal)
                    : Math.abs(finalAmountVal),
                description: description.trim(),
                date: finalDate.toISOString(),
                categoryId: selectedCategory.id,
                category_icon_name: selectedCategory.icon,
                slug_category_name: isNewCategory ? [
                    selectedCategory.name as string,
                    ...defaultCategoriesSlug
                ] : defaultCategoriesSlug,
                account_id: selectedAccount, // Cuenta posiblemente nueva
                updated_at: new Date().toISOString()
            };

            // === LÓGICA DE ACTUALIZACIÓN DE SALDOS (CRÍTICO) ===
            const oldTx = transactionToEdit;
            const fromAccount = oldTx.account_id;
            const toAccount = selectedAccount;

            if (fromAccount !== toAccount) {
                // Cambio de cuenta: Revertir en origen, aplicar en destino
                if (fromAccount) deleteSomeAmountInAccount(fromAccount, Math.abs(oldTx.amount), oldTx.type);
                if (toAccount) updateAccountBalance(toAccount, Math.abs(updatedTransactionData.amount), updatedTransactionData.type);
            } else {
                // Misma cuenta: Ajustar diferencia
                const oldReal = oldTx.type === TransactionType.EXPENSE ? -Math.abs(oldTx.amount) : Math.abs(oldTx.amount);
                const newReal = updatedTransactionData.type === TransactionType.EXPENSE ? -Math.abs(updatedTransactionData.amount) : Math.abs(updatedTransactionData.amount);
                const delta = newReal - oldReal;

                if (delta !== 0) {
                    const adjustmentType = delta > 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
                    updateAccountBalance(updatedTransactionData.account_id, Math.abs(delta), adjustmentType);
                }
            }

            // Actualizar transacción en BD/Store
            updateTransaction(updatedTransactionData);
            
            showMessage(MessageType.UPDATED, t('messages.transaction_updated', 'Transaction updated'));
            handleCloseForm();

        } catch (error) {
            console.error(error);
            showMessage(MessageType.ERROR, t('messages.error_updating', 'Error updating transaction'));
        } finally {
            setIsLoadingEdit(false);
        }
    };

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isOpen}
            onRequestClose={handleCloseForm}
            statusBarTranslucent
            accessibilityViewIsModal={true}
        >
            <InfoPopUp />
            
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
                pointerEvents="box-none"
            >
                <View style={StyleSheet.absoluteFill}>
                    {isOpen  &&  (
                        <Animated.View
                            entering={SlideInUp.duration(300)}
                            exiting={SlideOutUp.duration(200)}
                            style={[
                                styles.topSheet,
                                { backgroundColor: colors.surfaceSecondary },
                                { paddingTop: insets.top + 10 }
                            ]}
                            accessibilityRole="adjustable"
                        >
                            {/* --- HEADER --- */}
                            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                <TouchableOpacity
                                    onPress={handleCloseForm}
                                    style={[styles.closeButton, { backgroundColor: colors.text, borderColor: colors.border }]}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('common.close')}
                                >
                                    <MaterialIcons name="close" size={24} color={colors.surface} />
                                </TouchableOpacity>

                                <TransactionHeaderTitle
                                    title={
                                        transactionToEdit 
                                            ? (isExpense ? t('transactions.edit_expense') : t('transactions.edit_income'))
                                            : (isExpense ? t('transactions.new_expense') : t('transactions.new_income'))
                                    }
                                    date={dateFormatted}
                                    titleColor={colors.text}
                                />

                                <ModernCalendarSelector
                                    selectedDate={localSelectedDay}
                                    onDateChange={setLocalSelectedDay}
                                />
                            </View>

                            {/* --- CONTENIDO SCROLLABLE --- */}
                            <ScrollView
                                contentContainerStyle={[
                                    styles.scrollContent,
                                    { paddingBottom: (isKeyboardVisible || showCalculator) ? 370 : 100 }
                                ]}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                {/* 1. Categoría y Monto */}
                                <CategoryAndAmountInput
                                    isReady={isReady}
                                    selectedCategory={selectedCategory}
                                    amount={amount}
                                    setAmount={setAmount}
                                    amountInputRef={amountInputRef}
                                    handleCategoryClick={handleCategoryClick} // O handleCategoryClick si usas el del hook
                                    colors={colors}
                                    onOpenCalculator={handleOpenCalculator}
                                />

                                {/* 2. Descripción */}
                                <DescriptionInput
                                    isReady={isReady}
                                    description={description}
                                    setDescription={setDescription}
                                    colors={colors}
                                />

                                {/* 3. Selectores (Cuenta) */}
                                <View style={styles.rowSelectors}>
                                    <View style={{ flex: 1 }}>
                                        <AccountSelector
                                            label={t('accounts.label', 'Account')}
                                            accountSelected={selectedAccount}
                                            setAccountSelected={setSelectedAccount}
                                            accounts={allAccounts}
                                            colors={colors}
                                        />
                                    </View>
                                </View>

                                {/* 4. Botón de Guardar */}
                                <View >
                                    {isReady && <Animated.View
                                        entering={FadeIn.duration(300)} style={styles.footer}>
                                    <SubmitButton
                                        handleSave={handleFinalSave}
                                        selectedCategory={selectedCategory}
                                        option={isExpense ? addOption.Spend : addOption.Income}
                                        loading={isSubmitting || isLoadingEdit}
                                        disabled={!amount || parseFloat(amount) === 0 || !selectedAccount}
                                        colors={colors}
                                    />
                                    </Animated.View>
                                    
                                    }
                                    
                                </View>
                            </ScrollView>

                            {/* --- EXTRAS (Calculadora, Popover) --- */}
                            
                            {/* Calculadora */}
                            {showCalculator && (
                                <Animated.View
                                    entering={SlideInDown.duration(300)}
                                    exiting={SlideOutDown.duration(200)}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0, left: 0, right: 0,
                                        zIndex: 1000,
                                        borderTopWidth: 1,
                                        borderColor: colors.border,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: -2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 5,
                                        elevation: 20,
                                        backgroundColor: colors.surface
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
                            {popoverOpen && (
                                <CategorySelectorPopover
                                    popoverOpen={popoverOpen}
                                    handleClosePopover={handleClosePopover}
                                    handleSelectCategory={handleSelectCategory}
                                    handleDeleteCategory={handleDeleteCategory}
                                    selectedCategory={selectedCategory}
                                    colors={colors}
                                    defaultCategories={defaultCategoriesOptions}
                                    userCategories={userCategoriesOptions}
                                />
                            )}

                        </Animated.View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}