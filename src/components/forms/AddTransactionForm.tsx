import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView // Agregamos ScrollView para pantallas pequeñas
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInUp, // Animación para que entre desde arriba
    SlideOutUp
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Hooks y Stores
import { useTransactionForm } from '../../hooks/useTransactionForm';
import { InputNameActive } from '../../interfaces/settings.interface';
import { ICON_OPTIONS, IconKey, IconOption } from '../../constants/icons';

// Componentes Hijos
import CloseInputButton from "../buttons/closeInput";
import SubmitButton, { addOption } from "../buttons/submitButton";
import IconsSelectorPopover from "./Inputs/IconsSelector";
import CategoryAndAmountInput from "./Inputs/CategoryAndAmountInput";
import DescriptionInput from "./Inputs/DescriptionInput";
import AccountSelector from "./Inputs/AccoutSelector";
import ModernCalendarSelector from '../buttons/ModernDateSelector';
import { formatDate } from '../../utils/formatters';
import { TransactionHeaderTitle } from '../headers/TransactionsHeaderInput';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import { ThemeColors } from '../../types/navigation';
import { styles } from './stylesForm';

const { width } = Dimensions.get('window');

export default function AddTransactionForm() {
    const { theme } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
    const insets = useSafeAreaInsets();

    const {
        amount,
        description,
        selectedIcon,
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

    const isOpen = inputNameActive !== InputNameActive.NONE;
    const date = new Date(localSelectedDay).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    const title = inputNameActive === InputNameActive.SPEND ? 'New Expense' : 'New Income';
    const titleColor = inputNameActive === InputNameActive.SPEND ? '#EF5350' : '#667eea';

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isOpen}
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            {/* Fondo Oscuro / Blur */}
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
                            onPress={handleClose} 
                        />
                    </BlurView>
                </Animated.View>
            )}



            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                {/* Tarjeta del Formulario (Animación SlideInUp) */}
                {isOpen && (
                    <Animated.View
                        entering={SlideInUp}
                        exiting={SlideOutUp.duration(200)}
                        style={[
                            styles.topSheet,
                            { backgroundColor: colors.surfaceSecondary },
                            { paddingTop: insets.top + 10 } 
                        ]}
                    >
                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: colors.border }]}>
                            <TransactionHeaderTitle
                                title={title}
                                date={date}
                                titleColor={titleColor}
                            />
                            <ModernCalendarSelector
                                selectedDate={localSelectedDay}
                                onDateChange={setLocalSelectedDay}
                            />
                        </View>

                        {/* ScrollView para asegurar que todo sea accesible si la pantalla es chica */}
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* 1. Categoría y Monto (Lo más importante) */}
                            <CategoryAndAmountInput
                                selectedIcon={selectedIcon}
                                amount={amount}
                                setAmount={setAmount}
                                amountInputRef={amountInputRef}
                                handleIconClick={handleIconClick}
                                colors={colors}
                            />

                            {/* 2. Descripción */}
                            <DescriptionInput
                                description={description}
                                setDescription={setDescription}
                                colors={colors}
                            />

                            {/* 3. Fila de Selectores (Cuenta y Fecha) en horizontal para ahorrar espacio */}
                            <View style={styles.rowSelectors}>
                                <View style={{ flex: 7 }}>
                                    <AccountSelector
                                        label="Accounts"
                                        accountSelected={selectedAccount}
                                        setAccountSelected={setSelectedAccount}
                                        accounts={allAccounts}
                                        colors={colors}
                                    />
                                </View>
                            </View>

                            {/* 4. Botones de Acción */}
                            <View style={styles.footer}>
                                <SubmitButton
                                    handleSave={handleSave}
                                    selectedIcon={selectedIcon}
                                    option={inputNameActive === InputNameActive.SPEND ? addOption.Spend : addOption.Income}
                                    loading={isSubmitting}
                                    // Deshabilitar si no hay monto o cuenta
                                    disabled={amount.trim() === '' || selectedAccount === null}
                                />
                            </View>
                        </ScrollView>

                        {/* Popover de Iconos (Renderizado condicionalmente aquí o fuera) */}
                        {popoverOpen && (
                            <IconsSelectorPopover
                                popoverOpen={popoverOpen}
                                anchorEl={anchorEl}
                                handleClosePopover={handleClosePopover}
                                handleSelectIcon={handleSelectIcon}
                                selectedIcon={selectedIcon}
                                iconOptions={ICON_OPTIONS[
                                    inputNameActive === InputNameActive.INCOME ? IconKey.income : IconKey.spend
                                ] as unknown as IconOption[]}
                                colors={colors}
                            />
                        )}

                    </Animated.View>
                )}
            </KeyboardAvoidingView>
        </Modal>
    );
}
