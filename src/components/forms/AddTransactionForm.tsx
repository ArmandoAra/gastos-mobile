import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Dimensions,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { BlurView } from 'expo-blur'; // Instalar: npx expo install expo-blur
import Animated, {
    FadeIn,
    FadeOut,
    ZoomIn,
    ZoomOut
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Hooks y Stores (Asumiendo que ya tienes estos archivos adaptados o son lógicos)
import { useSettingsStore } from '../../stores/settingsStore';

import { useTransactionForm } from '../../hooks/useTransactionForm';


// Componentes Hijos (Debes tener sus versiones móviles)
import CloseInputButton from "../buttons/closeInput";
import SubmitButton, { addOption } from "../buttons/submitButton";
import IconsSelectorPopover from "./Inputs/IconsSelector"; // En RN esto suele ser un Modal aparte o una vista condicional
import CategoryAndAmountInput from "./Inputs/CategoryAndAmountInput";
import DaySelectorInput from "./Inputs/DaySelectorInput";
import DescriptionInput from "./Inputs/DescriptionInput";
import AccountSelector from "./Inputs/AccoutSelector";
import { InputNameActive } from '../../interfaces/settings.interface';
import { ICON_OPTIONS, IconKey, IconOption } from '../../constants/icons';
import useDateStore from '../../stores/useDateStore';

const { width, height } = Dimensions.get('window');


export default function AddTransactionForm() {
    const insets = useSafeAreaInsets();

    // Hooks de lógica
    const {
        amount,
        description,
        selectedIcon,
        selectedAccount,
        localSelectedDay,
        allAccounts,
        anchorEl, 
        isSubmitting,
        days,
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

    const { selectedDay } = useDateStore();

    // Determinar si el modal está visible
    const isOpen = inputNameActive !== InputNameActive.NONE;

    // Título dinámico
    const title = inputNameActive === InputNameActive.SPEND ? 'Add new Expense' : 'Add new Income';
    const titleColor = inputNameActive === InputNameActive.SPEND ? '#EF5350' : '#667eea'; // Rojo para gasto, Azul para ingreso

    return (
        <Modal
            animationType="none" // Usamos Reanimated para la animación interna
            transparent={true}
            visible={isOpen}
            onRequestClose={handleClose} // Hardware back button en Android
            statusBarTranslucent
        >
            {/* Contenedor Principal: KeyboardAvoidingView mueve todo cuando sale el teclado */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardContainer}
            >
                {/* Fondo Borroso (Backdrop) */}
                {isOpen && (
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        style={StyleSheet.absoluteFill}
                    >
                        <BlurView
                            intensity={20}
                            tint="dark"
                            style={StyleSheet.absoluteFill}
                        >
                            {/* Capa extra oscura si el blur no es suficiente */}
                            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
                        </BlurView>

                        {/* Área tocable para cerrar al hacer clic fuera */}
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            activeOpacity={1}
                            onPress={handleClose}
                        />
                    </Animated.View>
                )}

                {/* Tarjeta del Formulario */}
                {isOpen && (
                    <View
                        style={[styles.card, { marginTop: insets.top + 20 }]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: titleColor }]}>
                                {title}
                            </Text>
                            <TouchableOpacity
                                onPress={handleClose}
                                disabled={isSubmitting}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={24} color="#757575" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>

                            {/* Amount & Icon */}
                            <CategoryAndAmountInput
                                selectedIcon={selectedIcon}
                                amount={amount}
                                setAmount={setAmount}
                                amountInputRef={amountInputRef}
                                handleIconClick={handleIconClick}
                            />

                            {/* Description */}
                            <DescriptionInput
                                description={description}
                                setDescription={setDescription}
                            />

                            {/* Day Selector (Solo si no hay día seleccionado globalmente) */}
                            {(selectedDay === null || selectedDay === 0) && (
                                <DaySelectorInput
                                    label="Day of Month"
                                    selectedDay={localSelectedDay}
                                    setSelectedDay={setLocalSelectedDay}
                                    days={days}
                                />
                            )}

                            {/* Account Selector */}
                            <AccountSelector
                                label="Select Account"
                                accountSelected={selectedAccount}
                                setAccountSelected={setSelectedAccount}
                                accounts={allAccounts}
                            />

                            {/* Action Buttons */}
                            <View style={styles.footer}>
                                <CloseInputButton />
                                {amount.trim() !== '' && selectedAccount !== null &&

                                    <SubmitButton
                                        handleSave={handleSave}
                                        selectedIcon={selectedIcon}
                                        option={inputNameActive === InputNameActive.SPEND ? addOption.Spend : addOption.Income}
                                    loading={isSubmitting} // Asumiendo que tu botón soporta prop de carga
                                />
                                }
                            </View>
                        </View>

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
                            />
                        )}

                    </View>
                )}
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ============================================
// 🎨 ESTILOS (Sin Sombras)
// ============================================
const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // No background color here, handled by BlurView
    },
    card: {
        width: width * 0.9, // 90% del ancho de pantalla
        maxWidth: 500,
        backgroundColor: '#FFFFFF', // Fondo sólido para evitar glitches
        borderRadius: 24,

        // BORDE EN LUGAR DE SOMBRA
        borderWidth: 1,
        borderColor: '#E0E0E0',

        // Cero elevación para evitar destellos
        elevation: 0,
        shadowOpacity: 0,

        overflow: 'hidden', // Asegura que nada se salga de los bordes redondeados
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5', // Separador sutil
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
    },
    content: {
        padding: 20,
        gap: 16, // Espacio vertical entre inputs
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        marginTop: 10,
    }
});
