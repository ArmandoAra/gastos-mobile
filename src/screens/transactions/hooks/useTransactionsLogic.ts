import { useState, useMemo, useCallback } from "react";
import { Platform, AccessibilityInfo } from "react-native";
import { format, parseISO, isSameMonth, isSameYear, isSameDay } from "date-fns";
import { es, pt, enGB } from "date-fns/locale";
import { useTranslation } from "react-i18next";

// Stores & Interfaces
import useDataStore from "../../../stores/useDataStore";
import useDateStore from "../../../stores/useDateStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { Transaction, TransactionType } from "../../../interfaces/data.interface";
import { darkTheme, lightTheme } from '../../../theme/colors';
import { ThemeColors } from "../../../types/navigation";
import { ViewPeriod } from "../../../interfaces/date.interface";

type ViewMode = 'day' | 'month' | 'year';

export type ListItem =
    | { type: 'header'; date: string; total: number; id: string }
    | { type: 'transaction'; data: Transaction };

export const useTransactionsLogic = () => {
    const { theme, language } = useSettingsStore();
    const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;
    const { t } = useTranslation();
    const { localSelectedDay } = useDateStore();
    const [selectedPeriod, setSelectedPeriod] =  useState<ViewPeriod>('month');

    // Estados Locales
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // --- NUEVO: Estado para filtro por cuenta ---
    const [accountSelected, setAccountSelected] = useState<string>('all');

    // Store de Datos
    const {
        transactions,
        allAccounts: accounts, // Obtenemos las cuentas del store
        getUserTransactions,
        deleteTransaction,
        updateTransaction,
        deleteSomeAmountInAccount,
        updateAccountBalance,
    } = useDataStore();

    // --- NUEVO: Todas las cuentas disponibles ---
    const allAccounts = useMemo(() => accounts || [], [accounts]);

    // --- 1. LÓGICA DE FILTRADO ---
    const filteredTransactions = useMemo(() => {
        let result = getUserTransactions() 
        if (!result || result.length === 0) return [];

        // --- NUEVO: Filtro por Cuenta Seleccionada ---
        if (accountSelected !== 'all') {
            result = result.filter(t => t.account_id === accountSelected);
        }

        // Filtro por fecha
        result = result.filter(transaction => {
            const tDate = parseISO(transaction.date);
            if (viewMode === 'day') return isSameDay(tDate, localSelectedDay);
            if (viewMode === 'month') return isSameMonth(tDate, localSelectedDay) && isSameYear(tDate, localSelectedDay);
            if (viewMode === 'year') return isSameYear(tDate, localSelectedDay);
            return true;
        });


        // Filtro por tipo (Income/Expense)
        if (filter !== 'all') {
            result = result.filter(t => t.type === filter);
        }

        // Filtro por búsqueda
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1);

            result = result.filter(transaction => {
                const description = (transaction.description || '').toLowerCase();
                const category = (transaction.category_icon_name || '').toLowerCase();
                const slugCategories = transaction.slug_category_name || [];

                return (
                    description.includes(query) ||
                    category.includes(query) ||
                    slugCategories.some(slug => slug.toLowerCase().includes(query) || slug.includes(capitalizedQuery))
                );
            });
        }

        // Ordenar por fecha (descendente)
        return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filter, searchQuery, transactions, localSelectedDay, viewMode, t, accountSelected]);
    // --- 2. LÓGICA DE AGRUPACIÓN (FlashList Data) ---
    const listData = useMemo(() => {
        const groups: Record<string, Transaction[]> = {};

        filteredTransactions.forEach(t => {
            const date = parseISO(t.date);
            const groupKey = viewMode === 'year'
                ? format(date, 'yyyy-MM')
                : format(date, 'yyyy-MM-dd');

            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(t);
        });

        const flatList: ListItem[] = [];
        Object.entries(groups).forEach(([dateKey, items]) => {
            const total = items.reduce((sum, t) =>
                t.type === 'expense' ? sum - Math.abs(t.amount) : sum + Math.abs(t.amount), 0
            );

            flatList.push({
                type: 'header',
                date: dateKey,
                total,
                id: `header-${dateKey}`
            });

            items.forEach(t => {
                flatList.push({ type: 'transaction', data: t });
            });
        });

        return flatList;
    }, [filteredTransactions, viewMode]);

    // Calcular índices pegajosos (Sticky Headers)
    const stickyHeaderIndices = useMemo(() => {
        return listData
            .map((item, index) => (item.type === 'header' ? index : null))
            .filter((item) => item !== null) as number[];
    }, [listData]);

     const handlePeriodChange = (p: string) => {
        const newPeriod = p as ViewPeriod;
        setSelectedPeriod(newPeriod);
        if (Platform.OS !== 'web') {
          AccessibilityInfo.announceForAccessibility(t(`transactions.${newPeriod}`) + ' selected');
        }
      };

    // --- 3. MANEJADORES ---
    const handleDelete = useCallback(async (id: string, account_id?: string, amount?: number, transactionType?: TransactionType) => {
        try {
            deleteTransaction(id);
            if (account_id && amount && transactionType) {
                deleteSomeAmountInAccount(account_id, Math.abs(amount), transactionType);
            }
            if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(t('common.deleted'));
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }, [deleteTransaction, deleteSomeAmountInAccount, t]);

    const handleSave = useCallback(async (
        updatedTransaction: Transaction,
        fromAccount: string | null = null,
        toAccount: string | null = null
    ) => {
        if (!updatedTransaction) return;

        const oldTx = transactions.find(t => t.id === updatedTransaction.id);
        if (!oldTx) return;

        try {
            updateTransaction(updatedTransaction);
            if (fromAccount !== toAccount) {
                if (fromAccount) deleteSomeAmountInAccount(fromAccount, oldTx.amount, updatedTransaction.type);
                if (toAccount) updateAccountBalance(toAccount, updatedTransaction.amount, updatedTransaction.type);
            } else {
                const oldReal = oldTx.type === TransactionType.EXPENSE ? -Math.abs(oldTx.amount) : Math.abs(oldTx.amount);
                const newReal = updatedTransaction.type === TransactionType.EXPENSE ? -Math.abs(updatedTransaction.amount) : Math.abs(updatedTransaction.amount);
                const delta = newReal - oldReal;

                if (delta !== 0) {
                    const adjustmentType = delta > 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
                    updateAccountBalance(updatedTransaction.account_id, Math.abs(delta), adjustmentType);
                }
            }
            updateTransaction(updatedTransaction);
            return updatedTransaction;
        } catch (error) {
            console.error('❌ Error updating transaction:', error);
            return null;
        }
    }, [transactions, updateTransaction, updateAccountBalance, deleteSomeAmountInAccount]);

    // Helper para formato de fecha
    const getGroupTitle = useCallback((dateKey: string) => {
        const date = parseISO(dateKey);
        const localeMap = { es, pt, en: enGB };
        const currentLocale = localeMap[language as keyof typeof localeMap] || enGB;

        if (viewMode === 'year') return format(date, 'MMMM', { locale: currentLocale });
        return format(date, 'EEEE, d MMMM', { locale: currentLocale });
    }, [language, viewMode]);

    return {
        // Estado UI
        viewMode,
        setViewMode,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        colors,
        selectedPeriod,
        setSelectedPeriod,
        handlePeriodChange,

        // --- NUEVO: Estado de Cuentas ---
        accountSelected,
        setAccountSelected,
        allAccounts,

        // Traducción
        t,
        
        // Datos Procesados
        listData,
        stickyHeaderIndices,
        
        // Funciones
        handleDelete,
        handleSave,
        getGroupTitle
    };
};