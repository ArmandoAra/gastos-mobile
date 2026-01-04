import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Platform, Switch } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, getDaysInMonth, startOfYear, endOfYear, eachMonthOfInterval, isSameDay, isSameMonth } from 'date-fns';

import { Transaction } from '../../../interfaces/data.interface';
import useDataStore from '../../../stores/useDataStore';
import useDateStore from '../../../stores/useDateStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useAuthStore } from '../../../stores/authStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { isTablet, styles } from './styles';
import { StatCard } from './subcomponents/StatsCard';

interface ExpenseBarChartProps {
  currentPeriod: 'day' | 'week' | 'month' | 'year';
  initialShowIncome?: boolean; // Renombrado para indicar que es el valor inicial
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 380;

// Función auxiliar para redondear el Eje Y
const roundToNearestNiceNumber = (num: number) => {
  if (num === 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(num)));
  const normalized = num / magnitude;
  let niceNormalized;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;
  return niceNormalized * magnitude;
};

export default function ExpenseBarChart({
  currentPeriod,
  initialShowIncome = false,
}: ExpenseBarChartProps) {
  const { transactions } = useDataStore();
  const { localSelectedDay } = useDateStore();
  const { theme } = useSettingsStore();
  const { currencySymbol } = useAuthStore();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  // ESTADO: Controlar la visibilidad de Ingresos internamente
  const [isIncomeVisible, setIsIncomeVisible] = useState(initialShowIncome);

  // 1. Procesamiento de datos (Calculamos ambos siempre para tener los totales)
  const rawChartData = useMemo(() => {
    const dataPoints: any[] = [];
    const expenseTxs = transactions.filter(t => t.type === 'expense');
    const incomeTxs = transactions.filter(t => t.type === 'income');

    const processDataPoint = (label: string, dateCheck: (date: Date) => boolean, fullLabel: string) => {
      const pExpenses = expenseTxs.filter(t => dateCheck(new Date(t.date)));
      const pIncome = incomeTxs.filter(t => dateCheck(new Date(t.date)));
      
      const expenseTotal = pExpenses.reduce((a, b) => a + b.amount, 0);
      const incomeTotal = pIncome.reduce((a, b) => a + b.amount, 0);

      return {
        expenseTotal,
        incomeTotal,
        label,
        fullLabel,
      };
    };

    switch (currentPeriod) {
      case 'day':
        for (let i = 0; i < 24; i++) {
          dataPoints.push(processDataPoint(`${i}h`, (d) => isSameDay(d, localSelectedDay) && d.getHours() === i, `${format(localSelectedDay, 'MMM d')} ${i}:00`));
        }
        break;
      case 'week':
        const days = eachDayOfInterval({ start: startOfWeek(localSelectedDay), end: endOfWeek(localSelectedDay) });
        days.forEach(day => dataPoints.push(processDataPoint(format(day, 'EEE'), (d) => isSameDay(d, day), format(day, 'MMM d'))));
        break;
      case 'month':
        const daysInMonth = getDaysInMonth(localSelectedDay);
        for (let i = 1; i <= daysInMonth; i++) {
          dataPoints.push(processDataPoint(`${i}`, (d) => d.getDate() === i && d.getMonth() === localSelectedDay.getMonth() && d.getFullYear() === localSelectedDay.getFullYear(), format(new Date(localSelectedDay.getFullYear(), localSelectedDay.getMonth(), i), 'MMM d')));
        }
        break;
      case 'year':
        const months = eachMonthOfInterval({ start: startOfYear(localSelectedDay), end: endOfYear(localSelectedDay) });
        months.forEach(m => dataPoints.push(processDataPoint(format(m, 'MMM'), (d) => isSameMonth(d, m) && d.getFullYear() === localSelectedDay.getFullYear(), format(m, 'MMMM yyyy'))));
        break;
    }
    return dataPoints;
  }, [transactions, localSelectedDay, currentPeriod]);

  // 2. Configuración del Gráfico (Max Value dinámico según el switch)
  const chartConfig = useMemo(() => {
    // Buscar el valor más alto real (considerando si income está visible o no)
    const rawMax = Math.max(
      ...rawChartData.map(d => Math.max(d.expenseTotal, isIncomeVisible ? d.incomeTotal : 0)),
      10 
    );

    const targetMax = rawMax * 1.1; 
    const niceMax = roundToNearestNiceNumber(targetMax);
    const finalMax = niceMax < targetMax ? roundToNearestNiceNumber(targetMax * 1.5) : niceMax;

    return {
      maxValue: finalMax,
      noOfSections: 4,
      stepValue: finalMax / 4,
    };
  }, [rawChartData, isIncomeVisible, localSelectedDay]);

  // 3. Transformación de datos para la librería
  const barData = useMemo(() => {
    const result: any[] = [];
    rawChartData.forEach((item) => {
      // Gasto
      result.push({
        value: item.expenseTotal,
        label: item.label,
        frontColor: colors.expense,
        gradientColor: '#F87171',
        spacing: isIncomeVisible ? 15 : (isSmallScreen ? 10 : 30),
       labelTextStyle: { 
        color: colors.textSecondary, 
        fontSize: isIncomeVisible ? 10 : 10,
        width: 50, // Importante para que no se corte
        textAlign: 'center'
      },
        fullLabel: item.fullLabel,
        isIncome: false,
      });

      // Ingreso (Solo si el switch está activo)
      if (isIncomeVisible) {
        result.push({
          value: item.incomeTotal,
          frontColor: colors.income,
          gradientColor: '#34D399',
          spacing: isSmallScreen ? 16 : 24,
          fullLabel: item.fullLabel,
          isIncome: true,
        });
      }
    });
    return result;
  }, [rawChartData, isIncomeVisible, colors, currentPeriod, localSelectedDay]);

  // 4. Estadísticas (Calculamos Totales para las Cards)
  const stats = useMemo(() => {
    const expenseValues = rawChartData.map(d => d.expenseTotal);
    const incomeValues = rawChartData.map(d => d.incomeTotal);

    const totalExpenses = expenseValues.reduce((a, b) => a + b, 0);
    const totalIncome = incomeValues.reduce((a, b) => a + b, 0);
    
    // Trend calculation (Expenses)
    const validPoints = expenseValues.filter(v => v > 0);
    const mid = Math.floor(validPoints.length / 2);
    const firstHalfAvg = validPoints.slice(0, mid).reduce((a, b) => a + b, 0) / (mid || 1);
    const secondHalfAvg = validPoints.slice(mid).reduce((a, b) => a + b, 0) / (validPoints.length - mid || 1);
    
    const trendPercent = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    const trend = trendPercent > 5 ? 'up' : trendPercent < -5 ? 'down' : 'stable';

    return { totalExpenses, totalIncome, trend, trendPercent };
  }, [rawChartData]);

  // --- Dimensiones ---
  const chartVisibleWidth = SCREEN_WIDTH - (isSmallScreen ? 48 : 64);
  
  const getBarWidth = () => {
    if (currentPeriod === 'year') return isIncomeVisible ? 14 : 28;
    if (currentPeriod === 'month') return isIncomeVisible ? 4 : 8;
    return isIncomeVisible ? 10 : 18;
  };

  const getSpacing = () => {
     if (currentPeriod === 'year') return isIncomeVisible ? 10 : 25;
     if (currentPeriod === 'month') return isIncomeVisible ? 6 : 14;
     return 20;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInUp.duration(600)} style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 60 }]}>
        
        {/* HEADER CON SWITCH */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Overview per {currentPeriod}
              </Text>
            </View>

            {/* SWITCH PARA ACTIVAR INGRESOS */}
            <View style={styles.switchContainer}>
                <Text style={[styles.switchLabel, { color: colors.textSecondary }]}>
                {isIncomeVisible ? 'Hide Income' : 'Show Income'}
                </Text>
              <Switch
                value={isIncomeVisible}
                onValueChange={setIsIncomeVisible}
                trackColor={{ false: colors.border, true: colors.income + '80' }}
                thumbColor={isIncomeVisible ? colors.accent : colors.textSecondary}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        {/* STATS ROW */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <StatCard 
            label="Total Spent" 
            value={`-${currencySymbol} ${stats.totalExpenses.toFixed(0)}`} 
            icon="arrow-down" 
            colorBgAndHeader={colors.expense}
            colorText={colors.text}
            colorSubText={colors.textSecondary}
            colorBorder={colors.border}
            isTablet={isTablet}
          />
          
          {/* NUEVA CARD: TOTAL INCOME */}
          <StatCard 
            label="Total Income" 
            value={`${currencySymbol} ${stats.totalIncome.toFixed(0)}`} 
            icon="arrow-up" 
            colorBgAndHeader={colors.income}
            colorText={colors.text}
            colorSubText={colors.textSecondary}
            colorBorder={colors.border}
            isTablet={isTablet}
          />

          <StatCard 
            label="Trend" 
            value={stats.trend === 'stable' ? 'Stable' : `${Math.abs(stats.trendPercent).toFixed(0)}%`} 
            sub={stats.trend === 'up' ? 'Increasing' : stats.trend === 'down' ? 'Decreasing' : ''}
            icon={stats.trend === 'up' ? 'trending-up' : stats.trend === 'down' ? 'trending-down' : 'remove'} 
            colorBgAndHeader={stats.trend === 'up' ? colors.income : stats.trend === 'down' ? colors.expense : colors.textSecondary}
            colorText={colors.text}
            colorSubText={colors.textSecondary}
            colorBorder={colors.border}
            isTablet={isTablet}
          />
        </ScrollView>

        {/* CHART AREA */}
        <View style={styles.chartWrapper}>
  <BarChart
            key={`${currentPeriod}-${isIncomeVisible}-${localSelectedDay.getTime()}`} 
    data={barData}
    height={220}
    width={chartVisibleWidth}
    

    initialSpacing={20} 
    xAxisTextNumberOfLines={1}

    barWidth={getBarWidth()}
    spacing={getSpacing()}
    
    maxValue={chartConfig.maxValue}
    noOfSections={chartConfig.noOfSections}
    stepValue={chartConfig.stepValue}
    
    roundedTop
    barBorderRadius={1}
    showGradient
    yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
    xAxisLabelTextStyle={{ 
      color: colors.textSecondary, 
      fontSize: 9, // Reducimos un poco el tamaño para que quepan mejor
      width: isIncomeVisible ? 30 : 20, // Damos un ancho fijo a la etiqueta
      textAlign: 'center' 
    }}
    yAxisColor="transparent"
    xAxisColor={colors.border}
    rulesColor={colors.border}
    rulesType="dashed"
    yAxisLabelWidth={45}
    isAnimated
    animationDuration={600}
    renderTooltip={(item: any) => (
      <View style={[styles.tooltip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={{ fontSize: 10, color: colors.textSecondary }}>{item.fullLabel}</Text>
        <Text style={{ fontSize: 12, fontWeight: 'bold', color: item.isIncome ? colors.income : colors.expense }}>
          {currencySymbol}{item.value.toFixed(0)}
        </Text>
      </View>
    )}
    autoCenterTooltip
  />
        </View>

        <View style={styles.footer}>
           <Text style={[styles.footerText, { color: colors.textSecondary }]}>
             Scale Max: <Text style={{ color: colors.text }}>{currencySymbol}{chartConfig.maxValue}</Text>
           </Text>
        </View>

        {/* INSIGHTS */}
        {stats.trend !== 'stable' && (
          <Animated.View entering={FadeInDown.delay(200)} style={[styles.insightBox, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb" size={16} color={colors.accent} />
              <Text style={[styles.insightTitle, { color: colors.text }]}>Insights</Text>
            </View>
            <Text style={[styles.insightText, { color: colors.textSecondary }]}>
              {stats.trend === 'up' 
                ? `Spending is up by ${stats.trendPercent.toFixed(1)}% compared to the first half of this period.`
                : stats.trend === 'down'
                  ? `Great job! Spending is down by ${Math.abs(stats.trendPercent).toFixed(1)}% compared to the first half.`
                  : `Spending is relatively stable.`}
            </Text>
          </Animated.View>
        )}

      </Animated.View>
    </ScrollView>
  );
}