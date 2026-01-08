import React, { useState, useEffect } from 'react';
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
import { useTransactionForm } from '../../hooks/useTransactionForm';
import { useKeyboardStatus } from '../../hooks/useKeyboardStatus'; // Asegúrate de tener este hook
import { useSettingsStore } from '../../stores/settingsStore';
import { InputNameActive } from '../../interfaces/settings.interface';
import { IconKey, IconOption } from '../../constants/icons';

// Temas y Tipos
import { darkTheme, lightTheme } from '../../theme/colors';
import { ThemeColors } from '../../types/navigation';
import { styles } from './stylesForm';

// Componentes Hijos
import SubmitButton, { addOption } from "../buttons/submitButton";
import IconsSelectorPopover from "./Inputs/IconsSelector";
import CategoryAndAmountInput from "./Inputs/CategoryAndAmountInput";
import DescriptionInput from "./Inputs/DescriptionInput";
import AccountSelector from "./Inputs/AccoutSelector";
import ModernCalendarSelector from '../buttons/ModernDateSelector';
import { TransactionHeaderTitle } from '../headers/TransactionsHeaderInput';
import CalculatorSheet from './Inputs/CalculatorSheet';

export default function AddTransactionForm({ isOpen, onClose }: { isOpen: boolean; onClose: (isOpen: boolean) => void }) {
    const { theme } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const {
        amount,
        description,
        selectedIcon,
        iconsKey,
        selectedAccount,
        localSelectedDay,
        allAccounts,
        anchorEl, 
        isSubmitting,
        inputNameActive,
        amountInputRef,
        popoverOpen,
        setAmount,
        setDescription,
        setLocalSelectedDay,
        setSelectedAccount,
        handleClosePopover,
        handleSelectIcon,
        handleSave,
        handleClose,
        handleIconClick
    } = useTransactionForm();

    // const isOpen = inputNameActive !== InputNameActive.NONE;
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
            <View style={StyleSheet.absoluteFill}>

                {/* 1. BACKDROP (Fondo borroso interactivo) */}
                {isOpen && (
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        style={StyleSheet.absoluteFill}
                    >
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                            <TouchableOpacity
                                style={StyleSheet.absoluteFill}
                                activeOpacity={1}
                                onPress={handleCloseForm}
                                accessibilityRole="button"
                                accessibilityLabel={t('common.close_modal', 'Close form')}
                                accessibilityHint={t('accessibility.dismiss_hint', 'Double tap to close without saving')}
                            />
                        </BlurView>
                    </Animated.View>
                )}

                {/* 2. CONTENEDOR PRINCIPAL (KeyboardAvoidingView) */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.container}
                    pointerEvents="box-none" // Permite tocar el backdrop detrás
                >
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
                                    selectedIcon={selectedIcon}
                                    amount={amount}
                                    setAmount={setAmount}
                                    amountInputRef={amountInputRef}
                                    handleIconClick={handleIconClick}
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
                                        selectedIcon={selectedIcon}
                                        option={isExpense ? addOption.Spend : addOption.Income}
                                        loading={isSubmitting}
                                        // Validación simple para deshabilitar
                                        disabled={!amount || parseFloat(amount) === 0 || !selectedAccount}
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
                                <IconsSelectorPopover
                                    popoverOpen={popoverOpen}
                                    anchorEl={anchorEl}
                                    handleClosePopover={handleClosePopover}
                                    handleSelectIcon={handleSelectIcon}
                                    selectedIcon={selectedIcon}
                                    colors={colors}
                                />
                            )}

                        </Animated.View>
                    )}
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}