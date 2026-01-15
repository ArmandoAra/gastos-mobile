import { useState, useMemo, useCallback } from 'react';
import { Platform, AccessibilityInfo } from 'react-native';
import { useTranslation } from 'react-i18next';

// Stores & Interfaces
import useDateStore from '../../../stores/useDateStore';
import useDataStore from '../../../stores/useDataStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useAuthStore } from '../../../stores/authStore';
import { ViewPeriod } from '../../../interfaces/date.interface';
import { months, weekDaysFull } from '../../../constants/date';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { Transaction } from '../../../interfaces/data.interface';
import { CATEGORY_COLORS } from '../../../constants/categories';

export interface CategoryModalData {
    categoryName: string;
    totalAmount: number;
    color: string;
    transactions: Transaction[];
}

// YA NO recibe argumentos
export const useDailyExpenseLogic = () => {
    const { theme, language } = useSettingsStore();
    const colors = theme === 'dark' ? darkTheme : lightTheme;
    const { t } = useTranslation();
    const { currencySymbol } = useAuthStore();
    const { localSelectedDay } = useDateStore();
    const { transactions } = useDataStore();

    // --- NUEVO: Estado del Periodo Interno ---
    // Inicializamos en 'day' o lo que prefieras por defecto
    const [currentPeriod, setCurrentPeriod] = useState<ViewPeriod>('day');

    // Estado Modal
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<CategoryModalData | null>(null);

    // --- 1. FILTRADO DE TRANSACCIONES (Usa el state currentPeriod) ---
    const filteredTransactions = useMemo(() => {
        const year = localSelectedDay.getFullYear();
        const month = localSelectedDay.getMonth() + 1;
        const day = localSelectedDay.getDate();


        return transactions.filter(t => {
            const txDate = new Date(t.date);

            switch (currentPeriod) {
                case 'day':
                    return txDate.getFullYear() === year &&
                        txDate.getMonth() === month - 1 &&
                        txDate.getDate() === day;
                case 'week': {
                    const startOfWeek = new Date(localSelectedDay);
                    startOfWeek.setDate(localSelectedDay.getDate() - localSelectedDay.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    endOfWeek.setHours(23, 59, 59, 999);
                    return txDate >= startOfWeek && txDate <= endOfWeek;
                }
                case 'month':
                    return txDate.getFullYear() === year &&
                        txDate.getMonth() === month - 1;
                case 'year':
                    return txDate.getFullYear() === year;
                default:
                    return true;
            }
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, localSelectedDay, currentPeriod]);

    // --- 2. INFORMACIÓN DE FECHA ---
    const dateInfo = useMemo(() => {
        const dayIndex = localSelectedDay.getDay();
        return {
            dayOfWeek: weekDaysFull[language][dayIndex],
            monthName: months[language][localSelectedDay.getMonth()],
            isWeekend: dayIndex === 0 || dayIndex === 6,
            periodLabel: currentPeriod.charAt(0).toUpperCase() + currentPeriod.slice(1)
        };
    }, [localSelectedDay, currentPeriod, language]);

    // --- 3. CÁLCULO DE ESTADÍSTICAS ---
    const stats = useMemo(() => {
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        const income = filteredTransactions.filter(t => t.type === 'income');
        const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalIncome = income.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const balance = totalIncome - totalExpenses;

        const categoryTotals: Record<string, number> = {};
        expenses.forEach(t => {
            const amount = Math.abs(t.amount);
            categoryTotals[t.category_icon_name] = (categoryTotals[t.category_icon_name] || 0) + amount;
        });

        const topCategory = Object.entries(categoryTotals).reduce(
            (max, [cat, amount]) => amount > max.amount ? { category: cat, amount } : max,
            { category: '', amount: 0 }
        );

        const largestTransaction = expenses.length > 0
            ? expenses.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max)
            : null;

        return {
            totalExpenses,
            totalIncome,
            balance,
            expenseCount: expenses.length,
            incomeCount: income.length,
            topCategory,
            largestTransaction,
            categoryTotals,
            expensesList: expenses
        };
    }, [filteredTransactions]);

    // --- 4. MANEJO DEL MODAL ---
    const handleCategorySelect = useCallback((categoryName: string, totalValue: number, color: string) => {
        setSelectedCategory(categoryName);
        const categoryTransactions = stats.expensesList.filter(
            t => t.category_icon_name === categoryName
        );

        setModalData({
            categoryName,
            totalAmount: totalValue,
            color,
            transactions: categoryTransactions
        });
        setModalVisible(true);

        if (Platform.OS !== 'web') {
            AccessibilityInfo.announceForAccessibility(
                `${categoryName}, ${t('overviews.totalSpent')} ${currencySymbol} ${totalValue.toFixed(2)}, ${categoryTransactions.length} ${t('overviews.tsx')}`
            );
        }
    }, [stats.expensesList, currencySymbol, t]);

    const handleCloseModal = useCallback(() => {
        setModalVisible(false);
        setSelectedCategory(null);
        if (Platform.OS !== 'web') {
            AccessibilityInfo.announceForAccessibility(t('common.closed', 'Modal closed'));
        }
    }, [t]);

    // --- 5. DATOS GRÁFICO ---
    const pieData = useMemo(() => {
        return Object.entries(stats.categoryTotals).map(([name, value], index) => {
            const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
            return {
                value,
                color,
                text: name,
                focused: selectedCategory === name,
                onPress: () => handleCategorySelect(name, value, color)
            };
        });
    }, [stats.categoryTotals, selectedCategory, handleCategorySelect]);

    return {
        // UI Helpers
        t,
        colors,
        currencySymbol,
        isSmallScreen: Platform.OS !== 'web' && require('react-native').Dimensions.get('window').width < 420,
        
        // Data
        filteredTransactions,
        dateInfo,
        stats,
        pieData,
        
        // Period State (NUEVO: Exponemos el control del periodo)
        currentPeriod,
        setCurrentPeriod,
        
        // Modal State
        modalVisible,
        modalData,
        selectedCategory,
        
        // Actions
        handleCategorySelect,
        handleCloseModal
    };
};