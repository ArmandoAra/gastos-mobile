import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Detectar pantalla pequeña
const isSmallScreen = SCREEN_WIDTH < 380;
const isMediumScreen = SCREEN_WIDTH >= 380 && SCREEN_WIDTH < 768;

const COLORS = {
  bg: '#1e293b',
  cardBorder: '#334155',
  textMain: '#FFFFFF',
  textMuted: '#94a3b8',
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
  height = isSmallScreen ? 220 : isMediumScreen ? 260 : 300
}: ExpenseLineChartProps) {

  const [selectedMetric, setSelectedMetric] = useState<'total' | 'average'>('total');

  // Lógica de Procesamiento de Datos
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
          value: data.expenses,
          income: data.income,
          average: data.count > 0 ? data.expenses / data.count : 0,
          expenses: data.expenses,
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
    return [];
  }, [transactions, viewMode, year, month]);

  // Estadísticas
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

  // Preparar datos para gifted-charts
  const formattedChartData = chartData.map(item => ({
    value: selectedMetric === 'average' ? item.average : item.value,
    label: item.label,
    dataPointText: '',
    labelTextStyle: { color: COLORS.textMuted, fontSize: isSmallScreen ? 8 : 9 },
  }));

  const incomeChartData = showIncome ? chartData.map(item => ({
    value: item.income,
    label: item.label,
  })) : [];

  // Calcular ancho dinámico del chart
  const chartWidth = SCREEN_WIDTH - (isSmallScreen ? 40 : 60);
  const spacing = viewMode === 'month'
    ? (isSmallScreen ? 10 : 15)
    : (isSmallScreen ? 20 : 30);

  return (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <LinearGradient colors={[COLORS.blue, COLORS.purple]} style={styles.iconBox}>
            <Ionicons name="stats-chart" size={isSmallScreen ? 20 : 24} color="white" />
          </LinearGradient>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Expense Trends</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {viewMode === 'year'
                ? `${year} - Monthly`
                : viewMode === 'month'
                  ? `${MONTHS_FULL[month! - 1]} - Daily`
                  : 'Comparison'}
            </Text>
          </View>
        </View>

        {/* Toggle Buttons */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            onPress={() => setSelectedMetric('total')}
            style={[styles.toggleBtn, selectedMetric === 'total' && styles.toggleBtnActive]}
            activeOpacity={0.7}
          >
            {selectedMetric === 'total' && (
              <LinearGradient
                colors={[COLORS.blue, COLORS.purple]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
            <Text style={[styles.toggleText, selectedMetric === 'total' && styles.textWhite]}>
              Total
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setSelectedMetric('average')}
            style={[styles.toggleBtn, selectedMetric === 'average' && styles.toggleBtnActive]}
            activeOpacity={0.7}
          >
            {selectedMetric === 'average' && (
              <LinearGradient
                colors={[COLORS.blue, COLORS.purple]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            )}
            <Text style={[styles.toggleText, selectedMetric === 'average' && styles.textWhite]}>
              Avg
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* STATS CARDS - ScrollView horizontal en pantallas pequeñas */}
      <ScrollView
        horizontal={isSmallScreen}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsScrollContent}
      >
        <View style={styles.statsGrid}>
          <StatsCard 
            label="Total"
            value={`$${stats.totalExpenses.toFixed(0)}`}
            color={COLORS.expense}
            icon="arrow-down"
            isSmall={isSmallScreen}
          />
          <StatsCard
            label="Average"
            value={`$${stats.avgExpense.toFixed(0)}`}
            color={COLORS.blue}
            icon="pause"
            isSmall={isSmallScreen}
          />
          <StatsCard 
            label="Peaks"
            value={stats.peaks.toString()} 
            subValue="Anomalies"
            color={COLORS.purple}
            icon="alert-circle"
            isSmall={isSmallScreen}
          />
          <StatsCard
            label="Trend"
            value={stats.trend}
            subValue={`${Math.abs(stats.trendPercent).toFixed(1)}%`}
            color={stats.trend === 'up' ? COLORS.orange : stats.trend === 'down' ? COLORS.income : COLORS.textMuted}
            icon={stats.trend === 'up' ? 'trending-up' : 'trending-down'}
            isSmall={isSmallScreen}
          />
        </View>
      </ScrollView>

      {/* CHART - ScrollView horizontal para días del mes */}
      <ScrollView
        horizontal={viewMode === 'month'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartScrollContent}
      >
        <View style={styles.chartWrapper}>
          <LineChart
            data={formattedChartData}
            data2={showIncome ? incomeChartData : undefined}
            height={height}
            width={viewMode === 'month' ? Math.max(chartWidth, chartData.length * spacing) : chartWidth}
            spacing={spacing}
            initialSpacing={isSmallScreen ? 10 : 15}
            color1={COLORS.expense}
            color2={COLORS.income}
            thickness={isSmallScreen ? 2 : 3}
            hideDataPoints={viewMode === 'month' && chartData.length > 15}
            dataPointsRadius={isSmallScreen ? 3 : 4}
            dataPointsColor1={COLORS.expense}
            dataPointsColor2={COLORS.income}
            startFillColor1={COLORS.expense}
            startOpacity={0.8}
            endOpacity={0.1}
            areaChart={chartStyle === 'area'}
            curved
            isAnimated
            animationDuration={800}
            yAxisTextStyle={{ color: COLORS.textMuted, fontSize: isSmallScreen ? 8 : 9 }}
            xAxisLabelTextStyle={{ color: COLORS.textMuted, fontSize: isSmallScreen ? 8 : 9 }}
            yAxisColor={COLORS.cardBorder}
            xAxisColor={COLORS.cardBorder}
            rulesColor={COLORS.cardBorder}
            rulesType="dashed"
            showVerticalLines={!isSmallScreen}
            verticalLinesColor={COLORS.cardBorder + '40'}
            pointerConfig={{
              pointerStripHeight: height - 20,
              pointerStripColor: COLORS.textMuted,
              pointerStripWidth: 1,
              pointerColor: COLORS.textMuted,
              radius: 5,
              pointerLabelWidth: isSmallScreen ? 80 : 100,
              pointerLabelHeight: isSmallScreen ? 70 : 85,
              activatePointersOnLongPress: false,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: Array<{ value: number; label: string }>) => {
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
      </ScrollView>

      {/* INSIGHTS */}
      {(stats.peaks > 0 || stats.trend !== 'stable') && (
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsHeader}>INSIGHTS</Text>
          <View style={styles.insightsColumn}>
            {stats.peaks > 0 && (
              <Animated.View
                entering={FadeInDown.delay(100)}
                style={[styles.insightCard, {
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                  borderColor: 'rgba(249, 115, 22, 0.3)'
                }]}
              >
                <View style={styles.insightHeader}>
                  <Ionicons name="alert-circle" size={16} color={COLORS.orange} />
                  <Text style={[styles.insightTitle, { color: COLORS.orange }]}>
                    Spending Spikes
                  </Text>
                </View>
                <Text style={styles.insightText}>
                  Detected {stats.peaks} anomalies above average
                </Text>
              </Animated.View>
            )}
            
            {stats.trend !== 'stable' && (
              <Animated.View
                entering={FadeInDown.delay(200)}
                style={[styles.insightCard, {
                  backgroundColor: stats.trend === 'up'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(16, 185, 129, 0.1)',
                  borderColor: stats.trend === 'up'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(16, 185, 129, 0.3)'
                }]}
              >
                <View style={styles.insightHeader}>
                  <Ionicons
                    name={stats.trend === 'up' ? 'trending-up' : 'trending-down'}
                    size={16}
                    color={stats.trend === 'up' ? COLORS.expense : COLORS.income}
                  />
                  <Text style={[styles.insightTitle, {
                    color: stats.trend === 'up' ? COLORS.expense : COLORS.income
                  }]}>
                    {stats.trend === 'up' ? 'Rising Trend' : 'Declining Trend'}
                  </Text>
                </View>
                <Text style={styles.insightText}>
                  {stats.trend === 'up' ? 'Increased' : 'Decreased'} by {Math.abs(stats.trendPercent).toFixed(1)}% vs previous period
                </Text>
              </Animated.View>
            )}
          </View>
        </View>
      )}

    </Animated.View>
  );
}

// Componente auxiliar para tarjetas de estadísticas
interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSmall?: boolean;
}

const StatsCard = ({ label, value, subValue, color, icon, isSmall }: StatsCardProps) => (
  <View style={[
    styles.statsCard,
    { borderColor: color + '40', backgroundColor: color + '15' },
    isSmall && styles.statsCardSmall
  ]}>
    <View style={styles.statsCardHeader}>
      <Ionicons name={icon} size={isSmall ? 10 : 12} color={color} />
      <Text style={[styles.statsLabel, { color: color + 'CC' }, isSmall && styles.statsLabelSmall]}>
        {label}
      </Text>
    </View>
    <Text style={[styles.statsValue, isSmall && styles.statsValueSmall]} numberOfLines={1}>
      {value}
    </Text>
    {subValue && (
      <Text style={[styles.statsSubValue, isSmall && styles.statsSubValueSmall]}>
        {subValue}
      </Text>
    )}
  </View>
);

const viewMode = 'month'; // This should be passed as a prop or state in real usage

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg,
    borderRadius: isSmallScreen ? 16 : 20,
    padding: isSmallScreen ? 12 : 16,
    marginVertical: 10,
    marginHorizontal: isSmallScreen ? 8 : 0,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      }
    }),
  },
  header: {
    marginBottom: isSmallScreen ? 12 : 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: isSmallScreen ? 40 : 48,
    height: isSmallScreen ? 40 : 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: isSmallScreen ? 11 : 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBorder,
    borderRadius: 10,
    padding: 3,
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    paddingVertical: isSmallScreen ? 5 : 6,
    paddingHorizontal: isSmallScreen ? 12 : 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleBtnActive: {},
  toggleText: {
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    zIndex: 1,
  },
  textWhite: {
    color: 'white',
  },
  statsScrollContent: {
    paddingRight: isSmallScreen ? 16 : 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: isSmallScreen ? 'nowrap' : 'wrap',
    gap: isSmallScreen ? 8 : 10,
    marginBottom: 16,
  },
  statsCard: {
    width: isSmallScreen ? 110 : isMediumScreen ? '48%' : '48%',
    padding: isSmallScreen ? 10 : 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statsCardSmall: {
    padding: 8,
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  statsLabel: {
    fontSize: isSmallScreen ? 9 : 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsLabelSmall: {
    fontSize: 8,
  },
  statsValue: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
    textTransform: 'capitalize',
  },
  statsValueSmall: {
    fontSize: 14,
  },
  statsSubValue: {
    fontSize: isSmallScreen ? 9 : 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsSubValueSmall: {
    fontSize: 8,
  },
  chartScrollContent: {
    paddingRight: viewMode === 'month' ? 16 : 0,
  },
  chartWrapper: {
    marginVertical: isSmallScreen ? 12 : 16,
    marginLeft: isSmallScreen ? -5 : -10,
  },
  tooltip: {
    backgroundColor: COLORS.bg,
    padding: isSmallScreen ? 6 : 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    minWidth: isSmallScreen ? 70 : 80,
  },
  tooltipTitle: {
    color: COLORS.textMuted,
    fontSize: isSmallScreen ? 10 : 11,
    marginBottom: 4,
  },
  tooltipValue: {
    color: COLORS.textMain,
    fontWeight: 'bold',
    fontSize: isSmallScreen ? 12 : 14,
  },
  insightsContainer: {
    marginTop: isSmallScreen ? 8 : 12,
    paddingTop: isSmallScreen ? 12 : 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  insightsHeader: {
    fontSize: isSmallScreen ? 10 : 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 10,
    letterSpacing: 1,
  },
  insightsColumn: {
    gap: 8,
  },
  insightCard: {
    padding: isSmallScreen ? 10 : 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  insightTitle: {
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: 'bold',
  },
  insightText: {
    fontSize: isSmallScreen ? 10 : 11,
    color: COLORS.textMuted,
    lineHeight: isSmallScreen ? 14 : 16,
  }
});