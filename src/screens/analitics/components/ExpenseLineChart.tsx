import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../../interfaces/data.interface';


interface ExpenseLineChartProps {
  transactions: Transaction[];
  viewMode: 'year' | 'month' | 'multi-year';
  year: number;
  month?: number;
  compareYears?: number[];
  showIncome?: boolean;
  showAverage?: boolean;
  chartStyle?: 'line' | 'area';
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// --- Colores (Simulando Tailwind Slate Dark) ---
const COLORS = {
  bg: '#1e293b', // slate-800
  cardBorder: '#334155', // slate-700
  textMain: '#FFFFFF',
  textMuted: '#94a3b8', // slate-400
  expense: '#EF4444',
  income: '#10B981',
  avg: '#F59E0B',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  orange: '#F97316',
};

export default function ExpenseLineChart({
  transactions,
  viewMode,
  year,
  month,
  compareYears = [],
  showIncome = false,
  showAverage = true,
  chartStyle = 'area',
  height = 300
}: ExpenseLineChartProps) {

  const [selectedMetric, setSelectedMetric] = useState<'total' | 'average'>('total');

  // --- Lógica de Procesamiento de Datos (Idéntica a la web) ---
  const chartData = useMemo(() => {
    if (viewMode === 'year') {
      const monthlyData: Record<number, { expenses: number; income: number; count: number }> = {};
      
      transactions.forEach(t => {
        const txDate = new Date(t.date);
        if (txDate.getFullYear() !== year) return;
        const txMonth = txDate.getMonth();
        
        if (!monthlyData[txMonth]) monthlyData[txMonth] = { expenses: 0, income: 0, count: 0 };
        
        if (t.type === 'expense') {
          monthlyData[txMonth].expenses += t.amount;
          monthlyData[txMonth].count += 1;
        } else if (t.type === 'income') {
          monthlyData[txMonth].income += t.amount;
        }
      });

      return Array.from({ length: 12 }, (_, i) => {
        const data = monthlyData[i] || { expenses: 0, income: 0, count: 0 };
        return {
          label: MONTHS_SHORT[i],
          value: data.expenses, // Para el gráfico principal
          income: data.income,
          average: data.count > 0 ? data.expenses / data.count : 0,
          expenses: data.expenses, // Backup value
          count: data.count
        };
      });
      
    } else if (viewMode === 'month' && month) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const dailyData: Record<number, { expenses: number; income: number; count: number }> = {};
      
      transactions.forEach(t => {
        const txDate = new Date(t.date);
        if (txDate.getFullYear() !== year || txDate.getMonth() !== month - 1) return;
        const txDay = txDate.getDate();
        
        if (!dailyData[txDay]) dailyData[txDay] = { expenses: 0, income: 0, count: 0 };
        
        if (t.type === 'expense') {
          dailyData[txDay].expenses += t.amount;
          dailyData[txDay].count += 1;
        } else if (t.type === 'income') {
          dailyData[txDay].income += t.amount;
        }
      });

      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const data = dailyData[day] || { expenses: 0, income: 0, count: 0 };
        return {
          label: day.toString(),
          value: data.expenses,
          income: data.income,
          average: data.count > 0 ? data.expenses / data.count : 0,
          expenses: data.expenses,
          count: data.count
        };
      });
    }
    // Simplificación: Omitimos multi-year complejo para este ejemplo de traducción directa
    return [];
  }, [transactions, viewMode, year, month, compareYears]);

  // --- Estadísticas ---
  const stats = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    const expensesVals = chartData.map(d => Number(d.expenses) || 0).filter(v => v > 0);
    const avgExpense = expensesVals.length > 0 ? expensesVals.reduce((a, b) => a + b, 0) / expensesVals.length : 0;
    
    const peakThreshold = avgExpense * 1.5;
    const peaks = chartData.filter(d => (Number(d.expenses) || 0) > peakThreshold);
    
    const firstHalf = expensesVals.slice(0, Math.floor(expensesVals.length / 2));
    const secondHalf = expensesVals.slice(Math.floor(expensesVals.length / 2));
    const avgFirst = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
    const avgSecond = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
    
    const trend = avgSecond > avgFirst ? 'up' : avgSecond < avgFirst ? 'down' : 'stable';
    const trendPercent = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;
    
    return { totalExpenses, totalIncome, avgExpense, peaks: peaks.length, trend, trendPercent };
  }, [transactions, chartData]);

  // --- Preparar datos para gifted-charts ---
  const formattedChartData = chartData.map(item => ({
    value: selectedMetric === 'average' ? item.average : item.value,
    label: item.label,
    dataPointText: '', // Ocultar texto encima del punto por defecto
    // Configuración visual por punto
    labelTextStyle: { color: COLORS.textMuted, fontSize: 10 },
  }));

  const incomeChartData = showIncome ? chartData.map(item => ({
    value: item.income,
    label: item.label,
  })) : [];

  return (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.container}>
      
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <LinearGradient colors={[COLORS.blue, COLORS.purple]} style={styles.iconBox}>
             <Ionicons name="stats-chart" size={24} color="white" />
          </LinearGradient>
          <View>
            <Text style={styles.title}>Expense Trends</Text>
            <Text style={styles.subtitle}>
              {viewMode === 'year' ? `${year} - Monthly` : viewMode === 'month' ? `${MONTHS_FULL[month! - 1]} - Daily` : 'Comparison'}
            </Text>
          </View>
        </View>

        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            onPress={() => setSelectedMetric('total')}
            style={[styles.toggleBtn, selectedMetric === 'total' && styles.toggleBtnActive]}
          >
            {selectedMetric === 'total' && <LinearGradient colors={[COLORS.blue, COLORS.purple]} style={StyleSheet.absoluteFill} />}
            <Text style={[styles.toggleText, selectedMetric === 'total' && styles.textWhite]}>Total</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectedMetric('average')}
            style={[styles.toggleBtn, selectedMetric === 'average' && styles.toggleBtnActive]}
          >
            {selectedMetric === 'average' && <LinearGradient colors={[COLORS.blue, COLORS.purple]} style={StyleSheet.absoluteFill} />}
            <Text style={[styles.toggleText, selectedMetric === 'average' && styles.textWhite]}>Avg</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- STATS CARDS --- */}
      <View style={styles.statsGrid}>
        <StatsCard 
          label="Total Expenses" 
          value={`$${stats.totalExpenses.toFixed(0)}`} 
          color={COLORS.expense} 
          icon="arrow-down"
        />
        <StatsCard 
          label="Average" 
          value={`$${stats.avgExpense.toFixed(0)}`} 
          color={COLORS.blue} 
          icon="pause"
        />
        <StatsCard 
          label="Anomalies" 
          value={stats.peaks.toString()} 
          subValue="Peaks"
          color={COLORS.purple} 
          icon="alert-circle"
        />
        <StatsCard 
          label="Trend" 
          value={stats.trend} 
          subValue={`${Math.abs(stats.trendPercent).toFixed(1)}%`}
          color={stats.trend === 'up' ? COLORS.orange : stats.trend === 'down' ? COLORS.income : COLORS.textMuted} 
          icon={stats.trend === 'up' ? 'trending-up' : 'trending-down'}
        />
      </View>

      {/* --- CHART --- */}
      
    <View style={{ marginVertical: 20, marginLeft: -10 }}>
      <LineChart
        data={formattedChartData}
        data2={showIncome ? incomeChartData : undefined}
        height={height}
        width={SCREEN_WIDTH - 60}
        spacing={viewMode === 'month' ? 20 : 40}
        initialSpacing={20}
        color1={COLORS.expense}
        color2={COLORS.income}
        thickness={3}
        hideDataPoints={false}
        dataPointsColor1={COLORS.expense}
        dataPointsColor2={COLORS.income}
        startFillColor1={COLORS.expense}
        startOpacity={0.8}
        endOpacity={0.1}
        areaChart={chartStyle === 'area'}
        curved
        isAnimated
        yAxisTextStyle={{ color: COLORS.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: COLORS.textMuted, fontSize: 10 }}
        yAxisColor={COLORS.cardBorder}
        xAxisColor={COLORS.cardBorder}
        rulesColor={COLORS.cardBorder}
        rulesType="dashed"
        pointerConfig={{
        pointerStripHeight: 160,
        pointerStripColor: 'lightgray',
        pointerStripWidth: 2,
        pointerColor: 'lightgray',
        radius: 6,
        pointerLabelWidth: 100,
        pointerLabelHeight: 90,
        activatePointersOnLongPress: false,
        autoAdjustPointerLabelPosition: false,
        pointerLabelComponent: (items: Array<{ value: number; label: string; dataPointText: string; labelTextStyle: { color: string; fontSize: number } }>) => {
          const item = items[0];
          return (
            <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>{item.label}</Text>
            <Text style={styles.tooltipValue}>${Number(item.value).toFixed(2)}</Text>
            </View>
          );
        },
        }}
      />
    </View>

      {/* --- INSIGHTS --- */}
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsHeader}>INSIGHTS</Text>
        <View style={styles.insightsRow}>
            {stats.peaks > 0 && (
                <View style={[styles.insightCard, { backgroundColor: 'rgba(249, 115, 22, 0.1)', borderColor: 'rgba(249, 115, 22, 0.3)' }]}>
                    <Text style={[styles.insightTitle, { color: COLORS.orange }]}>⚠️ Spending Anomalies</Text>
                    <Text style={styles.insightText}>Detected {stats.peaks} spending spikes.</Text>
                </View>
            )}
            
            {stats.trend !== 'stable' && (
                 <View style={[styles.insightCard, { 
                     backgroundColor: stats.trend === 'up' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                     borderColor: stats.trend === 'up' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                 }]}>
                    <Text style={[styles.insightTitle, { color: stats.trend === 'up' ? COLORS.expense : COLORS.income }]}>
                        {stats.trend === 'up' ? '📈 Rising Expenses' : '📉 Decreasing Expenses'}
                    </Text>
                    <Text style={styles.insightText}>
                        {stats.trend === 'up' ? 'Increased' : 'Decreased'} by {Math.abs(stats.trendPercent).toFixed(1)}%
                    </Text>
                </View>
            )}
        </View>
      </View>

    </Animated.View>
  );
}

// Componente auxiliar para tarjetas de estadísticas
const StatsCard = ({ label, value, subValue, color, icon }: any) => (
  <View style={[styles.statsCard, { borderColor: color + '40', backgroundColor: color + '15' }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
      <Ionicons name={icon as any} size={12} color={color} style={{ marginRight: 4 }} />
      <Text style={[styles.statsLabel, { color: color + 'CC' }]}>{label}</Text>
    </View>
    <Text style={styles.statsValue}>{value}</Text>
    {subValue && <Text style={styles.statsSubValue}>{subValue}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg,
    borderRadius: 24,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBorder,
    borderRadius: 12,
    padding: 4,
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtnActive: {
    // estilos activos manejados por el gradiente hijo
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    zIndex: 1,
  },
  textWhite: {
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  statsCard: {
    width: '48%', // Grid de 2 columnas
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  statsLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
    textTransform: 'capitalize',
  },
  statsSubValue: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  // Tooltip del gráfico
  tooltip: {
    backgroundColor: COLORS.bg,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tooltipTitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  tooltipValue: {
    color: COLORS.textMain,
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Insights
  insightsContainer: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  insightsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 12,
    letterSpacing: 1,
  },
  insightsRow: {
      gap: 10
  },
  insightCard: {
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
  },
  insightTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 4,
  },
  insightText: {
      fontSize: 12,
      color: COLORS.textMuted
  }
});