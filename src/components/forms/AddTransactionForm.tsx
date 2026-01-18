import React, { useState, useEffect, useMemo, use } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard,
    AccessibilityInfo
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp,
    SlideOutUp,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Hooks y Stores
import { useSettingsStore } from '../../stores/settingsStore';
import { InputNameActive } from '../../interfaces/settings.interface';
import { IconKey, IconOption } from '../../constants/icons';

// Temas y Tipos
import { darkTheme, lightTheme } from '../../theme/colors';
import { ThemeColors } from '../../types/navigation';
import { styles } from './stylesForm';

// Componentes Hijos
import SubmitButton, { addOption } from "../buttons/submitButton";
import IconsSelectorPopover from "./Inputs/CategorySelector";
import CategoryAndAmountInput from "./Inputs/CategoryAndAmountInput";
import DescriptionInput from "./Inputs/DescriptionInput";
import AccountSelector from "./Inputs/AccoutSelector";
import ModernCalendarSelector from '../buttons/ModernDateSelector';
import { TransactionHeaderTitle } from '../headers/TransactionsHeaderInput';
import CalculatorSheet from './Inputs/CalculatorSheet';
import InfoPopUp from '../messages/InfoPopUp';
import { useKeyboardStatus } from '../../screens/transactions/constants/hooks/useKeyboardStatus';
import { useTransactionForm } from '../../screens/transactions/constants/hooks/useTransactionForm';
import CategorySelectorPopover from './Inputs/CategorySelector';
import useBudgetsStore from '../../stores/useBudgetStore';
import { Category } from '../../interfaces/data.interface';
import { set } from 'date-fns';

export default function AddTransactionForm({ isOpen, onClose }: { isOpen: boolean; onClose: (isOpen: boolean) => void }) {
    const { theme } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const {
        amount,
        description,
        selectedCategory,
        selectedAccount,
        localSelectedDay,
        allAccounts,
        anchorEl, 
        isSubmitting,
        inputNameActive,
        amountInputRef,
        popoverOpen,
        defaultCategoriesOptions,
        userCategoriesOptions,
        setAmount,
        setDescription,
        setLocalSelectedDay,
        setSelectedAccount,
        handleClosePopover,
        handleSelectCategory,
        handleSave,
        handleClose,
        handleCategoryClick
    } = useTransactionForm();

    const dataToTransact = useBudgetsStore(state => state.toTransactBudget); //Obtener los datos que obtuvimos del presupuesto que queremos convertir
    const setDataToTransact = useBudgetsStore(state => state.setToTransactBudget);


    useEffect(() => {
        if (dataToTransact) {
            setAmount(dataToTransact.totalAmount.toString());
            setDescription(dataToTransact.name);
            const categoryName = dataToTransact.slug_category_name[0];
            const allCategories = [...defaultCategoriesOptions, ...userCategoriesOptions];
            const foundCategory = allCategories.find(cat => cat.name === categoryName);
            if (foundCategory) {
                handleSelectCategory(foundCategory);
            }
        }
    }, [dataToTransact]);


    const isExpense = inputNameActive === InputNameActive.SPEND;

    // Formateo de fecha seguro
    const dateFormatted = new Date(localSelectedDay).toLocaleDateString(undefined, {
        month: '2-digit', day: '2-digit', year: 'numeric'
    });

    // Estados Locales para UI
    const [showCalculator, setShowCalculator] = useState(false);

    // Monitor de Teclado Nativo
    const isKeyboardVisible = useKeyboardStatus();

    // Cerrar calculadora si aparece el teclado nativo
    useEffect(() => {
        if (isKeyboardVisible) {
            setShowCalculator(false);
        }
    }, [isKeyboardVisible]);

    // Handlers
    const handleOpenCalculator = () => {
        // Cierra el teclado nativo primero
        Keyboard.dismiss();

        // Pequeño delay para permitir que el teclado baje antes de subir la calculadora
        // Esto evita conflictos visuales y saltos de layout
        setTimeout(() => {
            setShowCalculator(true);
            if (Platform.OS !== 'web') {
                AccessibilityInfo.announceForAccessibility(t('accessibility.calculator_opened', 'Calculator keypad opened'));
            }
        }, 100);
    };

    const handleCloseForm = () => {
        setDataToTransact(null); // Limpiar los datos al cerrar el formulario
        setShowCalculator(false);
        onClose(false);
        handleClose();
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
            {/* 2. CONTENEDOR PRINCIPAL (KeyboardAvoidingView) */}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.container}
                    pointerEvents="box-none" // Permite tocar el backdrop detrás
                >
                <View style={StyleSheet.absoluteFill} >

                    {isOpen && (
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
                            {/* HEADER */}
                            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                <TouchableOpacity
                                    onPress={handleCloseForm}
                                    style={[styles.closeButton, { backgroundColor: colors.text, borderColor: colors.border }]}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('common.close', 'Close')}
                                >
                                    <MaterialIcons name="close" size={24} color={colors.surface} />
                                </TouchableOpacity>

                                <TransactionHeaderTitle
                                    title={isExpense ? t('transactions.new_expense', 'New Expense') : t('transactions.new_income', 'New Income')}
                                    date={dateFormatted}
                                    titleColor={colors.text}
                                />

                                <ModernCalendarSelector
                                    selectedDate={localSelectedDay}
                                    onDateChange={setLocalSelectedDay}
                                />
                            </View>

                            {/* CONTENIDO SCROLLABLE */}
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
                                    selectedCategory={selectedCategory}
                                    amount={amount}
                                    setAmount={setAmount}
                                    amountInputRef={amountInputRef}
                                    handleCategoryClick={handleCategoryClick}
                                    colors={colors}
                                    onOpenCalculator={handleOpenCalculator} // Pasamos la función para abrir calc
                                />

                                {/* 2. Descripción */}
                                <DescriptionInput
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
                                <View style={styles.footer}>
                                    <SubmitButton
                                        handleSave={() => {
                                            handleSave();
                                            onClose(false);
                                        }}
                                        selectedCategory={selectedCategory}
                                        option={isExpense ? addOption.Spend : addOption.Income}
                                        loading={isSubmitting}
                                        // Validación simple para deshabilitar
                                        disabled={!amount || parseFloat(amount) === 0 || !selectedAccount}
                                        colors={colors}
                                    />
                                </View>
                            </ScrollView>

                            {/* CALCULADORA (Posición absoluta al fondo) */}
                            {showCalculator && (
                                <Animated.View
                                    entering={SlideInDown.duration(300)}
                                    exiting={SlideOutDown.duration(200)}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        zIndex: 1000,
                                        borderTopWidth: 1,
                                        borderColor: colors.border,
                                        // Sombra para elevación visual
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

                            {/* Popover de Iconos */}
                            {popoverOpen && (
                                <CategorySelectorPopover
                                    popoverOpen={popoverOpen}
                                    anchorEl={anchorEl}
                                    handleClosePopover={handleClosePopover}
                                    handleSelectCategory={handleSelectCategory}
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