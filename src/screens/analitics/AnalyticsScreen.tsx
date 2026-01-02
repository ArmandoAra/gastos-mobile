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

const { width } = Dimensions.get('window');


// Colores para el gráfico de torta
const CATEGORY_COLORS = ['#EF5350', '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA'];

export default function AnalyticsScreen() {
  const {transactions}  = useDataStore();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
 
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

  // Preparar datos para Line Chart
  const trendData = useMemo(() => {
     // Generamos datos dummy para que se vea la línea si no hay suficientes transacciones
     return [
       { x: 'Ene', y: 1200 }, { x: 'Feb', y: 900 }, { x: 'Mar', y: 1500 },
       { x: 'Abr', y: 800 }, { x: 'May', y: 1100 }, { x: 'Jun', y: 1300 }
     ];
  }, []);

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
    <ScrollView style={styles.container}>
      {/* Selector de Periodo */}
       <View style={styles.periodSelector}>
        {['week', 'month', 'year'].map((p) => (
          <TouchableOpacity 
            key={p}
            style={[styles.periodBtn, selectedPeriod === p && styles.periodBtnActive]}
            onPress={() => setSelectedPeriod(p as any)}
          >
            <Text style={[styles.periodText, selectedPeriod === p && styles.periodTextActive]}>
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <DailyExpenseViewMobile
        transactions={filteredTransactions}
        year={new Date().getFullYear()}
        month={new Date().getMonth() + 1}
        day={new Date().getDate()}
      />



        <ExpenseHeatmapMobile 
        transactions={filteredTransactions}
        viewMode={selectedPeriod === 'year' ? 'year' : selectedPeriod === 'month' ? 'month' : 'year'}
        year={new Date().getFullYear()}
        month={new Date().getMonth() + 1}
        heatmapType="daily"
        />

      <ExpenseLineChart
        transactions={filteredTransactions}
        viewMode={selectedPeriod === 'year' ? 'year' : selectedPeriod === 'month' ? 'month' : 'year'} year={new Date().getFullYear()} month={new Date().getMonth() + 1}
        showIncome={true}
        showAverage={true}
        chartStyle="area"
        height={300}
      />






      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingHorizontal: 2 },
  periodSelector: { flexDirection: 'row', padding: 16, gap: 8, backgroundColor: 'white' },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', alignItems: 'center' },
  periodBtnActive: { backgroundColor: '#6200EE' },
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