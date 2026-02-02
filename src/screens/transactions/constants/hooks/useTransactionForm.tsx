'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { TextInput } from "react-native";
import { MessageType } from "../../../../interfaces/message.interface";
import useMessage from "../../../../stores/useMessage";
import useDateStore from "../../../../stores/useDateStore";
import { InputNameActive } from "../../../../interfaces/settings.interface";
import { useSettingsStore } from "../../../../stores/settingsStore";
import useDataStore from "../../../../stores/useDataStore";
import { IconKey } from "../../../../constants/icons";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from "../../../../stores/authStore";
import { useTranslation } from "react-i18next";
import { Category, Transaction, TransactionType } from "../../../../interfaces/data.interface";
// import { CategoryLabelPortuguese, CategoryLabelSpanish } from "../../../../api/interfaces";
import { filterCategoriesByType } from "../../../../utils/categories";
import useCategoriesStore from "../../../../stores/useCategoriesStore";
import { LanguageCode } from "../../../../constants/languages";
import { defaultCategories } from "../../../../constants/categories";
import { CategoryLabelPortuguese, CategoryLabelSpanish } from "../../../../interfaces/categories.interface";


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
    const { getUserCategories, disableCategory } = useCategoriesStore();
    const [anchorEl, setAnchorEl] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const amountInputRef = useRef<TextInput | null>(null);
    const userCategories: Category[] = getUserCategories();

    const defaultCategoriesOptions: Category[] = filterCategoriesByType(defaultCategories, inputNameActive);
    const userCategoriesOptions: Category[] = filterCategoriesByType(userCategories, inputNameActive); // Aquí se podrían cargar las categorías del usuario desde un store si es necesario
    const allCategories = [...defaultCategoriesOptions, ...userCategoriesOptions];

    // Determinar icono
    const iconsKey = useMemo(() => {
        return inputNameActive === InputNameActive.INCOME ? IconKey.income : IconKey.spend;
    }, [inputNameActive]);

    const [selectedCategory, setSelectedCategory] = useState<Category>(allCategories[0]);

    const handleCategoryClick = useCallback((event: any) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const popoverOpen = Boolean(anchorEl);

    useEffect(() => {
        // si la categoria seleccionada no esta en todas las categorias filtradas, se selecciona la primera
        if (!allCategories.find(cat => cat.name === selectedCategory.name)) {
            setSelectedCategory(allCategories[0]);
        }
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

    const handleSelectCategory = useCallback((category: Category) => {
        setSelectedCategory(category);
        handleClosePopover();
    }, [handleClosePopover]);

    const handleDeleteCategory = useCallback((categoryId: string) => {
        // Si la categoría eliminada es la seleccionada, cambiar a la primera disponible
        disableCategory(categoryId);
        if (selectedCategory.id === categoryId) {
            const remainingCategories = allCategories.filter(cat => cat.id !== categoryId);
            setSelectedCategory(remainingCategories[0] || null);
        }
    }, [selectedCategory, allCategories]);

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
        const language = useSettingsStore.getState().language;
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

        const finalAmount = isIncome ? parsedAmount : -parsedAmount;
        const currentTimeISO = now.toISOString();

        const defaultCategoriesSlug: string[] = [
            selectedCategory.name,
            CategoryLabelSpanish[selectedCategory.name as keyof typeof CategoryLabelSpanish] || "",
            CategoryLabelPortuguese[selectedCategory.name as keyof typeof CategoryLabelPortuguese] || "",
        ];

        const defaultDescription = language === LanguageCode.PT
            ? CategoryLabelPortuguese[selectedCategory.name as keyof typeof CategoryLabelPortuguese]
            : CategoryLabelSpanish[selectedCategory.name as keyof typeof CategoryLabelSpanish];

        const isNewCategory = !defaultCategoriesSlug.includes(selectedCategory.name as string);

        return {
            id: uuidv4(),
            account_id: selectedAccount,
            user_id: user?.id || "current-user-id",
            description: description.trim() || (language === LanguageCode.EN ? selectedCategory.name : defaultDescription),
            amount: finalAmount,
            type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
            categoryId: selectedCategory.id,
            category_icon_name: selectedCategory.icon,
            slug_category_name: isNewCategory ? [selectedCategory.name as string, ...defaultCategoriesSlug] : defaultCategoriesSlug,
            date: transactionDate.toISOString(),
            created_at: currentTimeISO,
            updated_at: currentTimeISO,
        };
    }, [localSelectedDay, inputNameActive, amount, description, selectedCategory.id, selectedAccount, user?.id]);

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
                transactionType,
            );

            showMessage(MessageType.SUCCESS, t("messagesInfo.transactionAdded"));
            // handleClose();
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
        selectedCategory,
        selectedAccount,
        allAccounts,
        anchorEl,
        isSubmitting,
        iconsKey,
        inputNameActive,
        amountInputRef,
        localSelectedDay,
        popoverOpen,
        defaultCategoriesOptions,
        userCategoriesOptions,
        setAmount,
        setDescription,
        setLocalSelectedDay,
        setSelectedAccount,
        setSelectedCategory,
        handleCategoryClick,
        handleDeleteCategory,
        handleClosePopover,
        handleSelectCategory,
        handleSave,
        handleClose,
    };
}