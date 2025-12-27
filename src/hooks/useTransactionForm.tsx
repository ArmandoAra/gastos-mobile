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
import { useTransactionsStore } from "../stores/transactionsStore";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from "../stores/authStore";


// ============================================
// 💡 CONSTANTES
// ============================================
const INITIAL_FORM_STATE = {
    amount: "",
    description: "",
    selectedDay: new Date().getDate(),
};

// ============================================
// 💡 CUSTOM HOOK: useTransactionForm
// ============================================



export function useTransactionForm() {
    const {user} =useAuthStore();
    const { selectedAccount, allAccounts, setSelectedAccount, addTransactionStore, updateAccountBalance } = useDataStore();
    const { selectedYear, selectedMonth, selectedDay } = useDateStore();
    const { showMessage } = useMessage();
    const { setInputNameActive, inputNameActive } = useSettingsStore();
    
    const [amount, setAmount] = useState(INITIAL_FORM_STATE.amount);
    const [description, setDescription] = useState(INITIAL_FORM_STATE.description);
    const [localSelectedDay, setLocalSelectedDay] = useState(INITIAL_FORM_STATE.selectedDay);
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

    // Calcular días del mes (memoizado)
    const daysInMonth = useMemo(
        () => calculateDaysInMonth(selectedYear, selectedMonth),
        [selectedYear, selectedMonth]
    );

    const days = useMemo(
        () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
        [daysInMonth]
    );

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
        const date = new Date(
            selectedYear,
            selectedMonth - 1,
            (selectedDay === null || selectedDay === 0) ? localSelectedDay : selectedDay,
            now.getHours(),
            now.getMinutes(),
            now.getSeconds()
        );

        const isIncome = inputNameActive === InputNameActive.INCOME;
        const parsedAmount = parseFloat(amount);
      
    return {
            id: uuidv4(),
            account_id: selectedAccount,
            user_id: user?.id || "current-user-id", // Reemplazar con el ID del usuario actual
            description: description.trim() || `${selectedIcon.label} - ${isIncome ? 'Income' : 'Expense'}`,
            amount: parsedAmount,   
            type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
            category_name: selectedIcon.label,
            date: date.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
    }, [selectedYear, selectedMonth, selectedDay, inputNameActive, amount, description, selectedIcon, selectedAccount]);

    // Manejar guardado
    const handleSave = useCallback(async () => {
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
        selectedDay,
        selectedIcon,
        selectedAccount,
        allAccounts,
        anchorEl,
        isSubmitting,
        days,
        inputNameActive,
        amountInputRef,
        localSelectedDay,
        popoverOpen,
        
        // Setters
        setAmount,
        setDescription,
        setLocalSelectedDay,
        setSelectedAccount,
        
        // Handlers
        handleIconClick,
        handleClosePopover,
        handleSelectIcon,
        handleSave,
        handleClose,
    };
}
