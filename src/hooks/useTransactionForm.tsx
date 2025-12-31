'use client';


import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { TextInput } from "react-native";
import { MessageType } from "../interfaces/message.interface";
import useMessage from "../stores/useMessage";
import useDateStore from "../stores/useDateStore";
import { calculateDaysInMonth } from "../utils/helpers";
import { InputNameActive } from "../interfaces/settings.interface";
import { useSettingsStore } from "../stores/settingsStore";
import useDataStore from "../stores/useDataStore";
import { IconKey, IconOption, ICON_OPTIONS } from "../constants/icons";
import { Transaction, TransactionType } from "../types/schemas";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from "../stores/authStore";
import { se } from "date-fns/locale";


// ============================================
// 💡 CONSTANTES
// ============================================
const INITIAL_FORM_STATE = {
    amount: "",
    description: "",
    selectedDay: new Date(),
};

// ============================================
// 💡 CUSTOM HOOK: useTransactionForm
// ============================================



export function useTransactionForm() {
    const {user} =useAuthStore();
    const { selectedAccount, allAccounts, setSelectedAccount, addTransactionStore, updateAccountBalance } = useDataStore();
    const { showMessage } = useMessage();
    const { setInputNameActive, inputNameActive } = useSettingsStore();
    
    const [amount, setAmount] = useState(INITIAL_FORM_STATE.amount);
    const [description, setDescription] = useState(INITIAL_FORM_STATE.description);
    const { localSelectedDay, setLocalSelectedDay } = useDateStore();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const amountInputRef = useRef<TextInput | null>(null);

    // Determinar el tipo de icono según el inputNameActive
    const iconsKey = useMemo(() => {
        return inputNameActive === InputNameActive.INCOME ? IconKey.income : IconKey.spend;
    }, [inputNameActive]);

    const [selectedIcon, setSelectedIcon] = useState<IconOption>(() => ICON_OPTIONS[iconsKey][0]);

    const handleIconClick = useCallback((event: any) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const popoverOpen = Boolean(anchorEl);



    // Actualizar icono cuando cambia el tipo de transacción
    useEffect(() => {
        setSelectedIcon(ICON_OPTIONS[iconsKey][0]);
    }, [iconsKey]);

    // Reset form cuando se cierra el dialog
    useEffect(() => {
        if (inputNameActive === InputNameActive.NONE) {
            setAmount(INITIAL_FORM_STATE.amount);
            setDescription(INITIAL_FORM_STATE.description);
            setIsSubmitting(false);
        }
    }, [inputNameActive]);

    // ========================================
    // HANDLERS
    // ========================================

    const handleClosePopover = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleSelectIcon = useCallback((icon: IconOption) => {
        setSelectedIcon(icon);
        handleClosePopover();
    }, [handleClosePopover]);

    const handleClose = useCallback(() => {
        setInputNameActive(InputNameActive.NONE);
    }, [setInputNameActive]);

    // Validar formulario
    const validateForm = useCallback((): boolean => {
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) === 0) {
            amountInputRef.current?.focus();
            showMessage(MessageType.INFO, "Please enter a valid amount.");
            return false;
        }
        
        if (!selectedAccount) {
            showMessage(MessageType.INFO, "Please select an account.");
            return false;
        }
        
        return true;
    }, [amount, selectedAccount, showMessage]);

    // Preparar datos de la transacción
    const prepareTransactionData: () => Transaction = useCallback(() => {
        const now = new Date();

    // 1. Clonamos la fecha seleccionada
    const transactionDate = new Date(localSelectedDay || now);

    // 2. Si el usuario eligió un día pero queremos mantener la hora actual:
    // Solo ajustamos la hora si localSelectedDay existe (para no sobreescribir si ya es 'now')
    if (localSelectedDay) {
        transactionDate.setHours(now.getHours());
        transactionDate.setMinutes(now.getMinutes());
        transactionDate.setSeconds(now.getSeconds());
        transactionDate.setMilliseconds(now.getMilliseconds());
    }

    const isIncome = inputNameActive === InputNameActive.INCOME;
    const parsedAmount = parseFloat(amount);

    // Usamos una constante para ISO string y evitar milisegundos de diferencia entre campos
    const currentTimeISO = now.toISOString();

    return {
        id: uuidv4(),
        account_id: selectedAccount,
        user_id: user?.id || "current-user-id",
        description: description.trim() || `${selectedIcon.label} - ${isIncome ? 'Income' : 'Expense'}`,
        amount: parsedAmount,
        type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
        category_name: selectedIcon.label,
        // 'date' es el momento del gasto (Día elegido + Hora actual)
        date: transactionDate.toISOString(),
        // 'created_at' es el registro técnico de cuándo se insertó en la DB
        created_at: currentTimeISO,
        updated_at: currentTimeISO,
    };
}, [localSelectedDay, inputNameActive, amount, description, selectedIcon, selectedAccount, user?.id]);

    // Manejar guardado
    const handleSave = useCallback(async () => {
        if (!selectedAccount || selectedAccount.trim() === "") {
            showMessage(MessageType.INFO, "Please select an account.");
            return;
        }
        console.log("Selected Account:", selectedAccount);
        try {
            const transactionData = prepareTransactionData();
                addTransactionStore(transactionData);
                const transactionType = inputNameActive === InputNameActive.SPEND ? TransactionType.EXPENSE : TransactionType.INCOME;
                updateAccountBalance(selectedAccount, parseFloat(amount), transactionType as TransactionType);
                showMessage(MessageType.SUCCESS, `${TransactionType.EXPENSE} added successfully!`);
                handleClose();
          
        } catch (error) {
            console.error("Error adding transaction:", error);
            showMessage(MessageType.ERROR, "Error adding transaction. Please try again.");
        } 
    }, [validateForm, prepareTransactionData, addTransactionStore, inputNameActive, showMessage, handleClose]);

    return {
        // State
        amount,
        description,
        selectedIcon,
        selectedAccount,
        allAccounts,
        anchorEl,
        isSubmitting,
        inputNameActive,
        amountInputRef,
        localSelectedDay,
        popoverOpen,
        
        // Setters
        setAmount,
        setDescription,
        setLocalSelectedDay,
        setSelectedAccount,
        setSelectedIcon,
        
        // Handlers
        handleIconClick,
        handleClosePopover,
        handleSelectIcon,
        handleSave,
        handleClose,
    };
}
