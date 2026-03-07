import { useState, useMemo, useCallback } from 'react';
import { Platform, AccessibilityInfo } from 'react-native';
import { useTranslation } from 'react-i18next';

// Stores & Interfaces
import useDateStore from '../stores/useDateStore';
import useDataStore from '../stores/useDataStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import { ViewPeriod } from '../interfaces/date.interface';
import { months, weekDaysFull } from '../constants/date';
import { darkTheme, lightTheme } from '../theme/colors';
import { Transaction } from '../interfaces/data.interface';
import { CATEGORY_COLORS } from '../constants/categories';
import { useCycleStore } from '../stores/useCycleStore';
import { useCreditCycleScreen } from '../screens/cycle/hooks/useCreditCycleScreen';

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
    const {activeCycle} = useCreditCycleScreen();
    

    // --- NUEVO: Estado del Periodo Interno ---
    // Inicializamos en 'day' o lo que prefieras por defecto
    const [currentPeriod, setCurrentPeriod] = useState<ViewPeriod>('day');

    // Estado Modal
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<CategoryModalData | null>(null);

    // --- 1. FILTRADO DE TRANSACCIONES (Usa el state currentPeriod) ---
    const filteredTransactions = useMemo(() => {
    const year  = localSelectedDay.getFullYear();
    const month = localSelectedDay.getMonth() + 1;
    const day   = localSelectedDay.getDate();
    const customStartDate = activeCycle?.startDate ? new Date(activeCycle.startDate) : null;
    const customEndDate = activeCycle?.endDate ? new Date(activeCycle.endDate) : null;

    // Semana: lunes como primer día (convención europea/latinoamericana)
    const getWeekRange = (date: Date) => {
        const dayOfWeek = date.getDay(); // 0=Dom, 1=Lun ... 6=Sáb
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // domingo retrocede 6, resto ajusta a lunes
        const start = new Date(date);
        start.setDate(date.getDate() + diff);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    };

    const { start: weekStart, end: weekEnd } = getWeekRange(localSelectedDay);

    return transactions
        .map(t => ({ ...t, _date: new Date(t.date) }))
        .filter(({ _date }) => {
            switch (currentPeriod) {
                case 'day':
                    return _date.getFullYear() === year  &&
                           _date.getMonth()   === month - 1 &&
                           _date.getDate()    === day;

                case 'week':
                    return _date >= weekStart && _date <= weekEnd;

                case 'month':
                    return _date.getFullYear() === year &&
                           _date.getMonth()   === month - 1;

                case 'year':
                    return _date.getFullYear() === year;

                case 'custom':
                    if (!customStartDate || !customEndDate) return true;
                    return _date >= customStartDate && _date <= customEndDate;

                default:
                    return true;
            }
        })
        .map(({ _date, ...tx }) => tx) // limpiamos el campo temporal antes de devolver
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

}, [transactions, localSelectedDay, currentPeriod,activeCycle]);

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
    const transactionsData = useMemo(() => {
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
        transactionsData,
        
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