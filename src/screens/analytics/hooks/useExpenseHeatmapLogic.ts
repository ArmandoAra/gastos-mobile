import { useState, useMemo, useCallback } from 'react';
import { Platform, AccessibilityInfo } from 'react-native';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import { es, pt, enGB } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

// Stores & Interfaces
import useDateStore from '../../../stores/useDateStore';
import useDataStore from '../../../stores/useDataStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useAuthStore } from '../../../stores/authStore';
import { Transaction } from '../../../interfaces/data.interface';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { monthsShort } from '../../../constants/date';

// Tipos Locales
export type ViewHeatMapMode = 'month' | 'year';
export type HeatmapType = 'daily' | 'category';

export interface SelectedCellProps {
    value: number;
    label: string;
    subLabel?: string;
    transactions?: Transaction[];
}

export const useExpenseHeatmapLogic = () => {
    const { t } = useTranslation();
    const { transactions } = useDataStore();
    const { localSelectedDay } = useDateStore();
    const { theme, language } = useSettingsStore();
    const { currencySymbol } = useAuthStore();
    
    const colors = theme === 'dark' ? darkTheme : lightTheme;

    // --- ESTADOS LOCALES ---
    const [viewMode, setViewMode] = useState<ViewHeatMapMode>('month');
    const [heatmapType, setHeatmapType] = useState<HeatmapType>('daily');
    const [selectedCell, setSelectedCell] = useState<SelectedCellProps | null>(null);

    const year = localSelectedDay.getFullYear();
    const monthIndex = localSelectedDay.getMonth();

    // --- 1. FILTRADO INICIAL (Solo Gastos del periodo) ---
    const expenseTransactions = useMemo(() => 
        transactions.filter(t => {
            const d = new Date(t.date);
            const matchesYear = d.getFullYear() === year;
            if (viewMode === 'year') return t.type === 'expense' && matchesYear;
            // Si es month, filtramos por mes
            return t.type === 'expense' && matchesYear && d.getMonth() === monthIndex;
        }), 
    [transactions, viewMode, year, monthIndex]);

    // --- 2. CÁLCULO DEL VALOR MÁXIMO (Para la escala de calor) ---
    const maxValue = useMemo(() => {
        if (expenseTransactions.length === 0) return 1;
        
        if (heatmapType === 'daily') {
            const groups: Record<string, number> = {};
            expenseTransactions.forEach(t => {
                const key = viewMode === 'month' 
                    ? new Date(t.date).getDate() 
                    : new Date(t.date).getMonth();
                groups[key] = (groups[key] || 0) + Math.abs(t.amount);
            });
            return Math.max(...Object.values(groups), 1);
        } else {
            // Para categorías buscamos la transacción o agrupación más grande
            // Nota: Tu lógica original usaba map(t => abs(amount)), que es el valor de transacción individual más alto.
            // Si quisieras el "Total de categoría por periodo" más alto, habría que agrupar primero. 
            // Mantengo tu lógica original aquí:
            return Math.max(...expenseTransactions.map(t => Math.abs(t.amount)), 1); 
        }
    }, [expenseTransactions, heatmapType, viewMode]);

    // --- 3. HELPER DE COLOR (Memorizado para no recalcular colores) ---
    const getHeatColor = useCallback((amount: number) => {
        if (amount === 0) return colors.surfaceSecondary;
        const intensity = Math.min(amount / maxValue, 1);
        
        if (intensity < 0.25) return colors.income + '40';
        if (intensity < 0.50) return '#facc15';
        if (intensity < 0.75) return '#fb923c';
        return '#ef4444';
    }, [maxValue, colors]);

    // --- 4. DATA PARA EL GRID (Diario/Mensual) ---
    const gridData = useMemo(() => {
        if (heatmapType !== 'daily') return null;

        if (viewMode === 'month') {
            const daysInMonth = getDaysInMonth(localSelectedDay);
            const startDay = getDay(startOfMonth(localSelectedDay)); 

            const blanks = Array(startDay).fill(null);
            const days = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const txs = expenseTransactions.filter(t => new Date(t.date).getDate() === day);
                const amount = txs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                return { day, amount, transactions: txs };
            });
            return [...blanks, ...days];
        } else {
            return Array.from({ length: 12 }, (_, i) => {
                const txs = expenseTransactions.filter(t => new Date(t.date).getMonth() === i);
                const amount = txs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                return { monthIndex: i, amount, transactions: txs, label: monthsShort[language][i] };
            });
        }
    }, [viewMode, heatmapType, localSelectedDay, expenseTransactions, year, language]);

    // --- 5. DATA PARA CATEGORÍAS (Matriz) ---
    const categoryData = useMemo(() => {
        if (heatmapType !== 'category') return null;
        
        const categories = Array.from(new Set(expenseTransactions.map(t => t.category_name)));
        const periods = viewMode === 'year' 
            ? Array.from({ length: 12 }, (_, i) => ({ label: format(new Date(year, i, 1), 'MMM'), index: i }))
            : Array.from({ length: getDaysInMonth(localSelectedDay) }, (_, i) => ({ label: `${i + 1}`, index: i + 1 }));

        return categories.map(cat => {
            const data = periods.map(p => {
                const txs = expenseTransactions.filter(t => {
                    const d = new Date(t.date);
                    const isCat = t.category_name === cat;
                    const isPeriod = viewMode === 'year'
                        ? d.getMonth() === p.index
                        : d.getDate() === p.index;

                    return isCat && isPeriod;
                });

                const labelData = (viewMode === 'year') ? monthsShort[language][p.index] : p.label;
                return { label: labelData, amount: txs.reduce((s, t) => s + Math.abs(t.amount), 0) + txs.reduce((sum, t) => sum + Math.abs(t.amount), 0), transactions: txs };
                // Nota: Corrección menor en tu reduce original, simplificado arriba:
                // return { label: labelData, amount: txs.reduce((s, t) => s + Math.abs(t.amount), 0), transactions: txs };
            });
            return { category: cat, data };
        });
    }, [viewMode, heatmapType, expenseTransactions, localSelectedDay, year, language]);

    // --- 6. TOTAL VISIBLE ---
    const totalDisplay = useMemo(() =>
        expenseTransactions.reduce((s, t) => s + Math.abs(t.amount), 0),
        [expenseTransactions]
    );

    // --- HANDLERS ---
    const handleViewModeChange = useCallback((mode: ViewHeatMapMode) => {
        setViewMode(mode);
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(`View mode changed to ${mode}`);
    }, []);

    const handleHeatmapTypeChange = useCallback((type: HeatmapType) => {
        setHeatmapType(type);
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility(`Heatmap type changed to ${type === 'daily' ? 'grid' : 'categories'}`);
    }, []);

    const handleCellPress = useCallback((cellData: SelectedCellProps) => {
        setSelectedCell(cellData);
        if (Platform.OS !== 'web') {
            const txCount = cellData.transactions?.length || 0;
            AccessibilityInfo.announceForAccessibility(
                `${cellData.label}, ${cellData.subLabel || ''}, ${currencySymbol} ${cellData.value.toFixed(2)}, ${txCount} transactions`
            );
        }
    }, [currencySymbol]);

    const handleCloseModal = useCallback(() => {
        setSelectedCell(null);
        if (Platform.OS !== 'web') AccessibilityInfo.announceForAccessibility('Details closed');
    }, []);

    return {
        // UI Helpers
        t,
        colors,
        currencySymbol,
        language,
        localSelectedDay,
        year,
        
        // Data & State
        viewMode,
        heatmapType,
        selectedCell,
        maxValue,
        totalDisplay,
        
        // Processed Data
        gridData,
        categoryData,
        
        // Functions
        getHeatColor,
        handleViewModeChange,
        handleHeatmapTypeChange,
        handleCellPress,
        handleCloseModal
    };
};