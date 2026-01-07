'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { TextInput, View } from "react-native";
import { MessageType } from "../interfaces/message.interface";
import useMessage from "../stores/useMessage";
import useDateStore from "../stores/useDateStore";
import { InputNameActive } from "../interfaces/settings.interface";
import { useSettingsStore } from "../stores/settingsStore";
import useDataStore from "../stores/useDataStore";
import { IconKey, IconOption, ICON_OPTIONS } from "../constants/icons";
import { Transaction, TransactionType } from "../types/schemas";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from "../stores/authStore";
import { useTranslation } from "react-i18next";

const INITIAL_FORM_STATE = {
    amount: "",
    description: "",
};

export function useTransactionForm() {
    const { user } = useAuthStore();
    const { t } = useTranslation();
    const { selectedAccount, allAccounts, setSelectedAccount, addTransactionStore, updateAccountBalance } = useDataStore();
    const { showMessage } = useMessage();
    const { setInputNameActive, inputNameActive } = useSettingsStore();
    
    const [amount, setAmount] = useState(INITIAL_FORM_STATE.amount);
    const [description, setDescription] = useState(INITIAL_FORM_STATE.description);
    const { localSelectedDay, setLocalSelectedDay } = useDateStore();
    const [anchorEl, setAnchorEl] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const amountInputRef = useRef<TextInput | null>(null);

    // Determinar icono
    const iconsKey = useMemo(() => {
        return inputNameActive === InputNameActive.INCOME ? IconKey.income : IconKey.spend;
    }, [inputNameActive]);

    const [selectedIcon, setSelectedIcon] = useState<IconOption>(() => ICON_OPTIONS[iconsKey][0]);

    const handleIconClick = useCallback((event: any) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const popoverOpen = Boolean(anchorEl);

    useEffect(() => {
        setSelectedIcon(ICON_OPTIONS[iconsKey][0]);
    }, [iconsKey]);

    useEffect(() => {
        if (inputNameActive === InputNameActive.NONE) {
            setAmount(INITIAL_FORM_STATE.amount);
            setDescription(INITIAL_FORM_STATE.description);
            setIsSubmitting(false);
            setAnchorEl(null);
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

    const validateForm = useCallback((): boolean => {
        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount === 0) {
            amountInputRef.current?.focus();
            showMessage(MessageType.INFO, t("messagesInfo.validAmmount"));
            return false;
        }
        if (!selectedAccount) {
            showMessage(MessageType.INFO, t("messagesInfo.selectAccount"));
            return false;
        }
        return true;
    }, [amount, selectedAccount, showMessage, t]);

    const prepareTransactionData = useCallback((): Transaction => {
        const now = new Date();
        const baseDate = localSelectedDay ? new Date(localSelectedDay) : now;

        const transactionDate = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            baseDate.getDate(),
            now.getHours(),
            now.getMinutes(),
            now.getSeconds(),
            now.getMilliseconds()
        );

        const isIncome = inputNameActive === InputNameActive.INCOME;
        const parsedAmount = Math.abs(parseFloat(amount)); // Aseguramos positivo primero

        // CORRECCIÓN: Si NO es ingreso (es gasto), lo volvemos negativo
        const finalAmount = isIncome ? parsedAmount : -parsedAmount;
        console.log("Final Amount Prepared:", finalAmount);

        const currentTimeISO = now.toISOString();

        return {
            id: uuidv4(),
            account_id: selectedAccount,
            user_id: user?.id || "current-user-id",
            description: description.trim() || `${selectedIcon.label} - ${isIncome ? 'Income' : 'Expense'}`,
            amount: finalAmount, // Usamos el valor con el signo corregido
            type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
            category_name: selectedIcon.label,
            date: transactionDate.toISOString(),
            created_at: currentTimeISO,
            updated_at: currentTimeISO,
        };
    }, [localSelectedDay, inputNameActive, amount, description, selectedIcon, selectedAccount, user?.id]);

    const handleSave = useCallback(async () => {
        // 1. Validar antes de procesar
        if (!validateForm()) return;

        // 2. Evitar doble click
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const transactionData = prepareTransactionData();
            addTransactionStore(transactionData);

            const transactionType = inputNameActive === InputNameActive.SPEND
                ? TransactionType.EXPENSE
                : TransactionType.INCOME;

            updateAccountBalance(
                selectedAccount,
                Math.abs(parseFloat(amount)),
                transactionType
            );

            showMessage(MessageType.SUCCESS, t("messagesInfo.transactionAdded"));
            handleClose();
        } catch (error) {
            console.error(error);
            showMessage(MessageType.ERROR, t("messagesInfo.transactionAddError"));
        } finally {
            setIsSubmitting(false);
        }
    }, [validateForm, isSubmitting, prepareTransactionData, addTransactionStore, updateAccountBalance, inputNameActive, selectedAccount, amount, showMessage, handleClose, t]);

    return {
        amount,
        description,
        selectedIcon,
        selectedAccount,
        allAccounts,
        anchorEl,
        isSubmitting,
        iconsKey,
        inputNameActive,
        amountInputRef,
        localSelectedDay,
        popoverOpen,
        setAmount,
        setDescription,
        setLocalSelectedDay,
        setSelectedAccount,
        setSelectedIcon,
        handleIconClick,
        handleClosePopover,
        handleSelectIcon,
        handleSave,
        handleClose,
    };
}