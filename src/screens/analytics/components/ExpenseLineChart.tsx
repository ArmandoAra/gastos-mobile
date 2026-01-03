import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, getDaysInMonth, startOfYear, endOfYear, eachMonthOfInterval, isSameDay, isSameMonth } from 'date-fns';

import { Transaction } from '../../../interfaces/data.interface';
import useDataStore from '../../../stores/useDataStore';
import useDateStore from '../../../stores/useDateStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useAuthStore } from '../../../stores/authStore';
import { darkTheme, lightTheme } from '../../../theme/colors';

interface ExpenseLineChartProps {
  currentPeriod: 'day' | 'week' | 'month' | 'year';
  showIncome?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive breakpoints
const isSmallScreen = SCREEN_WIDTH < 380;
const isTablet = SCREEN_WIDTH >= 768;

export default function ExpenseLineChart({
  currentPeriod,
  showIncome = false,
}: ExpenseLineChartProps) {
  // 1. Hooks & Stores
  const { transactions } = useDataStore();
  const { localSelectedDay } = useDateStore();
  const { theme } = useSettingsStore();
  const { currencySymbol } = useAuthStore();
  
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  // 2. Internal State
  const [selectedMetric, setSelectedMetric] = useState<'total' | 'average'>('total');
  const [chartStyle, setChartStyle] = useState<'area' | 'line'>('area');

  // 3. Data Processing
  const chartData = useMemo(() => {
    const dataPoints: any[] = [];
    const expenseTxs = transactions.filter(t => t.type === 'expense');
    const incomeTxs = transactions.filter(t => t.type === 'income');

    const processDataPoint = (label: string, dateCheck: (date: Date) => boolean, subLabel: string) => {
      const pExpenses = expenseTxs.filter(t => dateCheck(new Date(t.date)));
      const pIncome = incomeTxs.filter(t => dateCheck(new Date(t.date)));
      
      const expenseSum = pExpenses.reduce((a, b) => a + b.amount, 0);
      const incomeSum = pIncome.reduce((a, b) => a + b.amount, 0);
      const count = pExpenses.length;

      return {
        value: expenseSum,
        income: incomeSum,
        average: count > 0 ? expenseSum / count : 0,
        label,
        subLabel, // Para el tooltip
        count
      };
    };

    switch (currentPeriod) {
      case 'day':
        // 24 Horas
        for (let i = 0; i < 24; i++) {
          dataPoints.push(processDataPoint(
            `${i}h`, 
            (d) => isSameDay(d, localSelectedDay) && d.getHours() === i,
            `${format(localSelectedDay, 'MMM d')} at ${i}:00`
          ));
        }
        break;

      case 'week':
        // 7 Días
        const start = startOfWeek(localSelectedDay, { weekStartsOn: 0 }); // Domingo
        const end = endOfWeek(localSelectedDay, { weekStartsOn: 0 });
        const days = eachDayOfInterval({ start, end });
        
        days.forEach(day => {
          dataPoints.push(processDataPoint(
            format(day, 'EEE'),
            (d) => isSameDay(d, day),
            format(day, 'MMM d, yyyy')
          ));
        });
        break;

      case 'month':
        // Días del mes (1-31)
        const daysInMonth = getDaysInMonth(localSelectedDay);
        for (let i = 1; i <= daysInMonth; i++) {
          dataPoints.push(processDataPoint(
            `${i}`,
            (d) => d.getDate() === i && d.getMonth() === localSelectedDay.getMonth() && d.getFullYear() === localSelectedDay.getFullYear(),
            format(new Date(localSelectedDay.getFullYear(), localSelectedDay.getMonth(), i), 'MMM d, yyyy')
          ));
        }
        break;

      case 'year':
        // 12 Meses
        const months = eachMonthOfInterval({
          start: startOfYear(localSelectedDay),
          end: endOfYear(localSelectedDay)
        });
        
        months.forEach(month => {
          dataPoints.push(processDataPoint(
            format(month, 'MMM'),
            (d) => isSameMonth(d, month) && d.getFullYear() === localSelectedDay.getFullYear(),
            format(month, 'MMMM yyyy')
          ));
        });
        break;
    }

    return dataPoints;
  }, [transactions, localSelectedDay, currentPeriod]);

  // 4. Statistics
  const stats = useMemo(() => {
    const validPoints = chartData.map(d => d.value).filter(v => v > 0);
    const totalExpenses = chartData.reduce((a, b) => a + b.value, 0);
    const avgExpense = validPoints.length > 0 ? validPoints.reduce((a, b) => a + b, 0) / validPoints.length : 0;
    
    // Detect Peaks (1.5x average)
    const peakThreshold = avgExpense * 1.5;
    const peaks = chartData.filter(d => d.value > peakThreshold).length;

    // Detect Trend (First half vs Second half)
    const mid = Math.floor(validPoints.length / 2);
    const firstHalfAvg = validPoints.slice(0, mid).reduce((a, b) => a + b, 0) / (mid || 1);
    const secondHalfAvg = validPoints.slice(mid).reduce((a, b) => a + b, 0) / (validPoints.length - mid || 1);
    
    const trendPercent = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    const trend = trendPercent > 5 ? 'up' : trendPercent < -5 ? 'down' : 'stable';

    return { totalExpenses, avgExpense, peaks, trend, trendPercent };
  }, [chartData]);

  // 5. Chart Props Preparation
  const formattedData = chartData.map(item => ({
    value: selectedMetric === 'average' ? item.average : item.value,
    label: item.label,
    subLabel: item.subLabel, // Pasamos esto para usarlo en el tooltip pointer
    dataPointText: '',
    labelTextStyle: { color: colors.textSecondary, fontSize: isSmallScreen ? 8 : 10 },
  }));

  const incomeData = showIncome ? chartData.map(item => ({
    value: item.income,
    label: item.label,
  })) : [];

  // Dimensions & Scrolling Logic
  const chartHeight = isSmallScreen ? 220 : isTablet ? 300 : 260;
  const baseWidth = SCREEN_WIDTH - (isSmallScreen ? 40 : 60);
  
  // Calcular si necesitamos scroll horizontal basado en densidad de puntos
  const points = formattedData.length;
  const minSpacing = isSmallScreen ? 25 : 35;
  const requiredWidth = points * minSpacing;
  const isScrollable = requiredWidth > baseWidth;
  const spacing = isScrollable ? minSpacing : baseWidth / (points || 1);

  // Labels
  const getSubtitle = () => {
    const d = localSelectedDay;
    switch(currentPeriod) {
      case 'day': return format(d, 'MMMM d, yyyy');
      case 'week': return `Week of ${format(startOfWeek(d), 'MMM d')}`;
      case 'month': return format(d, 'MMMM yyyy');
      case 'year': return format(d, 'yyyy');
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Animated.View 
        entering={FadeInUp.duration(600)} 
        style={[
          styles.container, 
          { backgroundColor: colors.surface, borderColor: colors.border },
          isTablet && styles.containerTablet
        ]}
      >
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <LinearGradient 
              colors={[colors.accent, '#8B5CF6']} 
              style={[styles.iconBox, isSmallScreen && styles.iconBoxSmall]}
            >
              <Ionicons name="stats-chart" size={isSmallScreen ? 18 : 22} color="#FFF" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.text }, isSmallScreen && styles.titleSmall]}>
                Spending Trends
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }, isSmallScreen && styles.subtitleSmall]}>
                {getSubtitle()}
              </Text>
            </View>
          </View>

          {/* CONTROLS ROW */}
          <View style={styles.controlsRow}>
            {/* Metric Toggle */}
            <View style={[styles.toggleGroup, { backgroundColor: colors.surfaceSecondary }]}>
              <TouchableOpacity 
                onPress={() => setSelectedMetric('total')}
                style={[styles.toggleBtn, selectedMetric === 'total' && { backgroundColor: colors.background }]}
              >
                <Text style={[styles.toggleText, { color: selectedMetric === 'total' ? colors.text : colors.textSecondary }]}>Total</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setSelectedMetric('average')}
                style={[styles.toggleBtn, selectedMetric === 'average' && { backgroundColor: colors.background }]}
              >
                <Text style={[styles.toggleText, { color: selectedMetric === 'average' ? colors.text : colors.textSecondary }]}>Avg</Text>
              </TouchableOpacity>
            </View>

            {/* Style Toggle */}
            <View style={[styles.toggleGroup, { backgroundColor: colors.surfaceSecondary }]}>
              <TouchableOpacity 
                onPress={() => setChartStyle('area')}
                style={[styles.toggleBtnIcon, chartStyle === 'area' && { backgroundColor: colors.background }]}
              >
                <MaterialCommunityIcons name="chart-areaspline" size={16} color={chartStyle === 'area' ? colors.text : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setChartStyle('line')}
                style={[styles.toggleBtnIcon, chartStyle === 'line' && { backgroundColor: colors.background }]}
              >
                <MaterialCommunityIcons name="chart-line" size={16} color={chartStyle === 'line' ? colors.text : colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* STATS ROW */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <StatsCard 
            label="Total Spent" 
            value={`${currencySymbol}${stats.totalExpenses.toFixed(0)}`} 
            icon="arrow-down" color={colors.expense} 
            colors={colors}
          />
          <StatsCard 
            label="Daily Avg" 
            value={`${currencySymbol}${stats.avgExpense.toFixed(0)}`} 
            icon="pause" color={colors.accent} 
            colors={colors}
          />
          <StatsCard 
            label="Peaks" 
            value={stats.peaks.toString()} 
            sub="Anomalies" 
            icon="alert-circle" color={colors.income} // Reusing green for contrast or define another
            colors={colors}
          />
          <StatsCard 
            label="Trend" 
            value={stats.trend === 'stable' ? 'Stable' : `${Math.abs(stats.trendPercent).toFixed(0)}%`} 
            sub={stats.trend === 'up' ? 'Increasing' : stats.trend === 'down' ? 'Decreasing' : ''}
            icon={stats.trend === 'up' ? 'trending-up' : stats.trend === 'down' ? 'trending-down' : 'remove'} 
            color={stats.trend === 'up' ? colors.expense : stats.trend === 'down' ? colors.income : colors.textSecondary}
            colors={colors}
          />
        </ScrollView>

        {/* CHART AREA */}
        <ScrollView 
          horizontal={isScrollable} 
          showsHorizontalScrollIndicator={false}
          style={styles.chartScrollContainer}
        >
          <View style={{ marginVertical: 10, marginLeft: -10 }}>
            <LineChart
              data={formattedData}
              data2={showIncome ? incomeData : undefined}
              height={chartHeight}
              width={isScrollable ? formattedData.length * spacing : baseWidth}
              spacing={spacing}
              initialSpacing={20}
              
              // Colors & Style
              color1={colors.expense}
              color2={colors.income}
              thickness={2}
              startFillColor1={colors.expense}
              startOpacity={chartStyle === 'area' ? 0.3 : 0}
              endOpacity={chartStyle === 'area' ? 0.05 : 0}
              areaChart={chartStyle === 'area'}
              curved
              isAnimated
              animationDuration={600}
              
              // Points
              hideDataPoints={formattedData.length > 20}
              dataPointsColor1={colors.expense}
              dataPointsRadius={4}
              
              // Axes
              yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
              yAxisColor="transparent"
              xAxisColor={colors.border}
              rulesColor={colors.border}
              rulesType="dashed"
              showVerticalLines={false}

              // Pointer / Tooltip
              pointerConfig={{
                pointerStripHeight: chartHeight - 10,
                pointerStripColor: colors.border,
                pointerStripWidth: 1,
                pointerColor: colors.text,
                radius: 5,
                pointerLabelWidth: 100,
                pointerLabelHeight: 80,
                activatePointersOnLongPress: false,
                autoAdjustPointerLabelPosition: true,
                pointerLabelComponent: (items: any) => {
                  const item = items[0];
                  return (
                    <View style={[styles.tooltip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.tooltipTitle, { color: colors.textSecondary }]}>{item.subLabel || item.label}</Text>
                      <Text style={[styles.tooltipValue, { color: colors.text }]}>{currencySymbol}{Number(item.value).toFixed(2)}</Text>
                      {item.count !== undefined && (
                        <Text style={[styles.tooltipCount, { color: colors.textSecondary }]}>{item.count} txs</Text>
                      )}
                    </View>
                  );
                },
              }}
            />
          </View>
        </ScrollView>

        {/* INSIGHTS */}
        {(stats.peaks > 0 || stats.trend !== 'stable') && (
          <Animated.View entering={FadeInDown.delay(200)} style={[styles.insightBox, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb" size={16} color={colors.accent} />
              <Text style={[styles.insightTitle, { color: colors.text }]}>Insights</Text>
            </View>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {stats.trend === 'up' 
                ? `Spending is trending up by ${stats.trendPercent.toFixed(1)}% compared to the first half of this period.` 
                : stats.trend === 'down'
                  ? `Great job! Spending is down by ${Math.abs(stats.trendPercent).toFixed(1)}%.`
                  : `Spending is relatively stable.`}
              {stats.peaks > 0 ? ` Detected ${stats.peaks} periods of unusually high activity.` : ''}
            </Text>
          </Animated.View>
        )}

      </Animated.View>
    </ScrollView>
  );
}

// SUBCOMPONENTS
const StatsCard = ({ label, value, sub, icon, color, colors }: any) => (
  <View style={[styles.statCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
      <Ionicons name={icon} size={12} color={color} style={{ marginRight: 4 }} />
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
    <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
    {sub ? <Text style={[styles.statSub, { color: colors.textSecondary }]}>{sub}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 16,
    marginVertical: 10,
    marginBottom: 60,
    marginHorizontal: 4,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  containerTablet: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  header: { marginBottom: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  iconBoxSmall: { width: 36, height: 36 },
  title: { fontSize: 18, fontWeight: '700' },
  titleSmall: { fontSize: 16 },
  subtitle: { fontSize: 12 },
  subtitleSmall: { fontSize: 11 },
  
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleGroup: { flexDirection: 'row', padding: 3, borderRadius: 10 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  toggleBtnIcon: { padding: 6, borderRadius: 8, width: 32, alignItems: 'center' },
  toggleText: { fontSize: 11, fontWeight: '600' },
  
  statsScroll: { paddingRight: 20, marginBottom: 10 },
  statCard: { width: 100, padding: 10, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  statLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  statValue: { fontSize: 15, fontWeight: '700', marginVertical: 2 },
  statSub: { fontSize: 9 },

  chartScrollContainer: { marginLeft: -5 },
  tooltip: { padding: 8, borderRadius: 8, borderWidth: 1, minWidth: 90 },
  tooltipTitle: { fontSize: 10, marginBottom: 2 },
  tooltipValue: { fontSize: 14, fontWeight: 'bold' },
  tooltipCount: { fontSize: 9, marginTop: 2 },

  insightBox: { padding: 12, borderRadius: 12, marginTop: 16 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  insightTitle: { fontSize: 12, fontWeight: '700', marginLeft: 6 },
  insightText: { fontSize: 11, lineHeight: 16 }
});