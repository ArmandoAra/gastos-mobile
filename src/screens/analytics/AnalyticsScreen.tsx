import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions 
} from 'react-native';

// 1. IMPORTACIONES DE VICTORY NATIVE XL (SKIA)
import { 
  CartesianChart, 
  Bar, 
  Line,
  useChartPressState
} from "victory-native";

// 2. IMPORTACIONES DE SKIA (Necesario para fuentes y colores)
import { useFont, Circle, vec } from "@shopify/react-native-skia";

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  startOfYear, 
  endOfYear 
} from 'date-fns';
import { es } from 'date-fns/locale';
import ExpenseLineChart from './components/ExpenseLineChart';
import useDataStore from '../../stores/useDataStore';
import ExpenseHeatmapMobile from './components/ExpenseHeatmapMobile';
import DailyExpenseViewMobile from './components/DailyExpenseView';
import TransactionsHeader from '../../components/headers/InfoHeader';
import InfoHeader from '../../components/headers/InfoHeader';
import { ViewPeriod } from '../../interfaces/date.interface';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import useDateStore from '../../stores/useDateStore';
import ExpenseBarChart from './components/ExpenseBarChart';

const { width } = Dimensions.get('window');


// Colores para el gráfico de torta
const CATEGORY_COLORS = ['#EF5350', '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA'];

export default function AnalyticsScreen() {
  const {transactions}  = useDataStore();
  const {localSelectedDay} =useDateStore();
  const {theme} = useSettingsStore();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [selectedPeriod, setSelectedPeriod] =  useState<ViewPeriod>('month');
 
  const font = useFont(require("../../../assets/fonts/Quicksand-Regular.ttf"), 12) || null; 


  // ============================================
  // LÓGICA DE DATOS (Igual que antes)
  // ============================================
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let start, end;

    switch (selectedPeriod) {
      case 'week':
        start = startOfWeek(now, { locale: es });
        end = endOfWeek(now, { locale: es });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return transactions.filter(t => {
      const date = parseISO(t.date);
      return date >= start && date <= end;
    });
  }, [selectedPeriod]);

  const expenses = filteredTransactions.filter(t => t.type === 'expense');
  const income = filteredTransactions.filter(t => t.type === 'income');

  const expensesPieData = useMemo(() => {
    const groups: Record<string, number> = {};
    expenses.forEach(t => {
      if (!groups[t.category_name]) groups[t.category_name] = 0;
      groups[t.category_name] += t.amount;
    });
    
    return Object.entries(groups)
      .map(([label, value], index) => ({
        label,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Preparar datos para Bar Chart
  const dailyExpenses = useMemo(() => {
    const days = [];
    const dayCount = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 6;
    
    for (let i = dayCount - 1; i >= 0; i--) {
      const date = new Date();
      if(selectedPeriod === 'year') {
         date.setMonth(date.getMonth() - i);
         const monthStr = format(date, 'MMM', { locale: es });
         // Suma dummy o real
         days.push({ x: monthStr, y: Math.random() * 500 + 100 }); 
      } else {
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayLabel = format(date, 'd/MM');
        
        const dayTotal = expenses
          .filter(t => format(parseISO(t.date), 'yyyy-MM-dd') === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);

        days.push({ x: dayLabel, y: dayTotal });
      }
    }
    return days;
  }, [expenses, selectedPeriod]);

  const stats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses
    };
  }, [expenses, income]);

  // Interaction State (Hook necesario para tooltips en el futuro)
  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
    
       <InfoHeader viewMode={selectedPeriod} />
       {/* Period Selector */}
       <View style={[styles.periodSelector, {backgroundColor: colors.surface}]}>
        {['day','week', 'month', 'year'].map((p) => (
          <TouchableOpacity 
            key={p}
            style={[styles.periodBtn,
               {backgroundColor: colors.surface,
                 borderColor: colors.border},
                  selectedPeriod === p && 
                  [ {backgroundColor: colors.text, 
                    borderColor: colors.border}
                  ]]}
            onPress={() => setSelectedPeriod(p as ViewPeriod)}
          >
            <Text style={[[styles.periodText, {color: colors.text}], selectedPeriod === p && [  {color: colors.surface}]]}>
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : p === 'year' ? 'Año' : 'Día'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>


    <ScrollView >

      <DailyExpenseViewMobile
        currentPeriod={selectedPeriod}
      />

       <ExpenseHeatmapMobile />

       <ExpenseBarChart 
        currentPeriod={selectedPeriod}
       />


      <View style={{ height: 40 }} />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 35 },
  periodSelector: { flexDirection: 'row', paddingHorizontal: 8, paddingTop: 4, paddingBottom: 8, gap: 8, backgroundColor: 'white' },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 24,  alignItems: 'center' , borderWidth: 0.5},
  periodText: { color: '#757575', fontWeight: '600' },
  periodTextActive: { color: 'white' },
  balanceCard: { backgroundColor: 'white', margin: 16, padding: 16, borderRadius: 16, elevation: 2 },
  balanceLabel: { color: '#757575', marginBottom: 8 },
  balanceAmount: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', gap: 16, justifyContent:'space-between' },
  balanceItemLabel: { fontSize: 12, color: '#757575' },
  chartContainer: { backgroundColor: 'white', margin: 16, marginTop: 0, padding: 16, borderRadius: 16, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});