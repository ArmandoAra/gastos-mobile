import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Dimensions, Switch, Platform, AccessibilityInfo, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, getDaysInMonth, startOfYear, endOfYear, eachMonthOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { useTranslation } from 'react-i18next'; 

import useDataStore from '../../../stores/useDataStore';
import useDateStore from '../../../stores/useDateStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useAuthStore } from '../../../stores/authStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { isTablet, styles } from './styles';
import { StatCard } from './subcomponents/StatsCard';

interface ExpenseBarChartProps {
  currentPeriod: 'day' | 'week' | 'month' | 'year';
  initialShowIncome?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 380;

// CONSTANTE CLAVE: Bloquea el crecimiento del texto en el gráfico para que no rompa el layout
const CHART_FONT_SCALE_LOCK = 1.0;
const UI_FONT_SCALE_LIMIT = 1.2; // Permite un poco de crecimiento en títulos, pero no infinito

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
  const { t } = useTranslation();

  const [isIncomeVisible, setIsIncomeVisible] = useState(initialShowIncome);

  // 1. Procesamiento de datos
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
        expenseTotal: Math.abs(expenseTotal),
        incomeTotal: Math.abs(incomeTotal),
        label,
        fullLabel,
      };
    };

    switch (currentPeriod) {
      case 'day':
        for (let i = 0; i < 24; i += 3) {
          dataPoints.push(processDataPoint(
            `${i}h`,
            (d) => isSameDay(d, localSelectedDay) && d.getHours() >= i && d.getHours() < i + 3,
            `${format(localSelectedDay, 'MMM d')} ${i}:00 - ${i + 3}:00`
          ));
        }
        break;
      case 'week':
        const days = eachDayOfInterval({ start: startOfWeek(localSelectedDay), end: endOfWeek(localSelectedDay) });
        days.forEach(day => dataPoints.push(processDataPoint(format(day, 'EEE'), (d) => isSameDay(d, day), format(day, 'MMM d'))));
        break;
      case 'month':
        const daysInMonth = getDaysInMonth(localSelectedDay);
        // Agrupar cada 2 o 3 días en pantallas pequeñas para que las etiquetas quepan
        const step = isSmallScreen ? 2 : 1;
        for (let i = 1; i <= daysInMonth; i += step) {
          dataPoints.push(processDataPoint(
            `${i}`,
            (d) => {
              const day = d.getDate();
              return day >= i && day < i + step && d.getMonth() === localSelectedDay.getMonth() && d.getFullYear() === localSelectedDay.getFullYear();
            },
            format(new Date(localSelectedDay.getFullYear(), localSelectedDay.getMonth(), i), 'MMM d')
          ));
        }
        break;
      case 'year':
        const months = eachMonthOfInterval({ start: startOfYear(localSelectedDay), end: endOfYear(localSelectedDay) });
        months.forEach(m => dataPoints.push(processDataPoint(format(m, 'MMM'), (d) => isSameMonth(d, m) && d.getFullYear() === localSelectedDay.getFullYear(), format(m, 'MMMM yyyy'))));
        break;
    }
    return dataPoints;
  }, [transactions, localSelectedDay, currentPeriod, isSmallScreen]);

  // 2. Configuración del Gráfico
  const chartConfig = useMemo(() => {
    const rawMax = Math.max(
      ...rawChartData.map(d => Math.max(d.expenseTotal, isIncomeVisible ? d.incomeTotal : 0)),
      10 
    );
    const targetMax = rawMax * 1.1; 
    const niceMax = roundToNearestNiceNumber(targetMax);
    const finalMax = niceMax < targetMax ? roundToNearestNiceNumber(targetMax * 1.5) : niceMax;

    return { maxValue: finalMax, noOfSections: 4, stepValue: finalMax / 4 };
  }, [rawChartData, isIncomeVisible]);

  // 3. Transformación de datos
  const barData = useMemo(() => {
    const result: any[] = [];
    rawChartData.forEach((item) => {
      result.push({
        value: item.expenseTotal,
        label: item.label,
        frontColor: colors.expense,
        gradientColor: '#F87171',
        spacing: isIncomeVisible ? 4 : (isSmallScreen ? 12 : 20),
        labelTextStyle: {
          color: colors.textSecondary, 
          fontSize: 10, // Tamaño fijo
          width: isIncomeVisible ? 40 : 30,
          textAlign: 'center'
        },
        fullLabel: item.fullLabel,
        isIncome: false,
      });

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
  }, [rawChartData, isIncomeVisible, colors, isSmallScreen]);

  // 4. Estadísticas
  const stats = useMemo(() => {
    const expenseValues = rawChartData.map(d => d.expenseTotal);
    const incomeValues = rawChartData.map(d => d.incomeTotal);
    const totalExpenses = expenseValues.reduce((a, b) => a + b, 0);
    const totalIncome = incomeValues.reduce((a, b) => a + b, 0);

    const validPoints = expenseValues.filter(v => v > 0);
    const mid = Math.floor(validPoints.length / 2);
    const firstHalfAvg = validPoints.slice(0, mid).reduce((a, b) => a + b, 0) / (mid || 1);
    const secondHalfAvg = validPoints.slice(mid).reduce((a, b) => a + b, 0) / (validPoints.length - mid || 1);
    const trendPercent = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
    const trend = trendPercent > 5 ? 'up' : trendPercent < -5 ? 'down' : 'stable';

    return { totalExpenses, totalIncome, trend, trendPercent };
  }, [rawChartData]);

  // --- Dimensiones & Scroll ---

  // SOLUCIÓN AL EJE X CORTADO:
  // 1. Calculamos el ancho del contenido.
  // 2. Añadimos un buffer generoso (+80px) al final para que la etiqueta del último mes/día tenga espacio.
  const estimatedBarGroupWidth = isIncomeVisible ? 45 : 35;
  const totalChartContentWidth = (rawChartData.length * estimatedBarGroupWidth) + 80;
  const chartVisibleWidth = SCREEN_WIDTH - (isSmallScreen ? 32 : 48);
  const needsHorizontalScroll = totalChartContentWidth > chartVisibleWidth;

  const getBarWidth = () => {
    if (isIncomeVisible) return isSmallScreen ? 8 : 10;
    return isSmallScreen ? 16 : 22;
  };

  const handleToggleIncome = (val: boolean) => {
    setIsIncomeVisible(val);
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(val ? "Income bars shown" : "Income bars hidden");
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Animated.View
        entering={FadeInUp.duration(600)}
        style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 60 }]}
      >
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
              {/* Títulos: Permitimos un poco de escalado (UI_FONT_SCALE_LIMIT), pero no infinito */}
              <Text
                style={[styles.title, { color: colors.text }]}
                maxFontSizeMultiplier={UI_FONT_SCALE_LIMIT}
              >
                {t('common.analytics', 'Analytics')}
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.textSecondary }]}
                maxFontSizeMultiplier={UI_FONT_SCALE_LIMIT}
              >
                {t('common.overview_per', 'Overview per')} {currentPeriod}
              </Text>
            </View>

            <View
              style={styles.switchContainer}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel={t('analytics.toggle_income', 'Toggle income visibility')}
            >
              <Text
                style={[styles.switchLabel, { color: colors.textSecondary }]}
                maxFontSizeMultiplier={UI_FONT_SCALE_LIMIT}
              >
                {isIncomeVisible ? t('common.hide_income', 'Hide') : t('common.show_income', 'Show')}
                </Text>
              <Switch
                value={isIncomeVisible}
                onValueChange={handleToggleIncome}
                trackColor={{ false: colors.border, true: colors.income + '80' }}
                thumbColor={isIncomeVisible ? colors.accent : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* STATS ROW */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
        >
          {/* StatCards: Son flexibles por dentro, pero limitamos el texto para que no exploten */}
          <StatCard 
            label={t('overviews.totalSpent', 'Total Spent')}
            value={`-${currencySymbol} ${stats.totalExpenses.toFixed(0)}`} 
            icon="arrow-down" 
            colorBgAndHeader={colors.expense}
            colorText={colors.text}
            colorSubText={colors.textSecondary}
            colorBorder={colors.border}
            isTablet={isTablet}
          />
          <StatCard 
            label={t('overviews.totalIncome', 'Total Income')}
            value={`${currencySymbol} ${stats.totalIncome.toFixed(0)}`} 
            icon="arrow-up" 
            colorBgAndHeader={colors.income}
            colorText={colors.text}
            colorSubText={colors.textSecondary}
            colorBorder={colors.border}
            isTablet={isTablet}
          />
          <StatCard 
            label={t('common.trend', 'Trend')}
            value={stats.trend === 'stable' ? 'Stable' : `${Math.abs(stats.trendPercent).toFixed(0)}%`} 
            icon={stats.trend === 'up' ? 'trending-up' : stats.trend === 'down' ? 'trending-down' : 'remove'} 
            colorBgAndHeader={stats.trend === 'up' ? colors.income : stats.trend === 'down' ? colors.expense : colors.textSecondary}
            colorText={colors.text}
            colorSubText={colors.textSecondary}
            colorBorder={colors.border}
            isTablet={isTablet}
          />
        </ScrollView>

        {/* CHART AREA */}
        <View
          style={styles.chartWrapper}
          accessible={true}
          accessibilityLabel={t('accessibility.chart_desc', `Bar chart of expenses.`)}
        >
          {/* ScrollView horizontal con paddingRight extra para arreglar el corte de etiquetas */}
          <ScrollView
            horizontal={needsHorizontalScroll}
            scrollEnabled={needsHorizontalScroll}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingRight: 40 // SOLUCIÓN: Espacio extra al final para que quepa "Dec" o "31"
            }}
          >
            <BarChart
              key={`${currentPeriod}-${isIncomeVisible}-${localSelectedDay.getTime()}`}
              data={barData}
              height={220}
              // Si hay scroll, usamos el ancho calculado grande, si no, el ancho de pantalla
              width={needsHorizontalScroll ? totalChartContentWidth : chartVisibleWidth}

              initialSpacing={15}

              barWidth={getBarWidth()}
              // Spacing se maneja dentro de barData para agrupación

              maxValue={chartConfig.maxValue}
              noOfSections={chartConfig.noOfSections}
              stepValue={chartConfig.stepValue}

              roundedTop
              barBorderRadius={2}
              showGradient

              // --- BLOQUEO DE ESCALADO DE TEXTO ---
              // Forzamos un fontSize fijo y un ancho fijo para las etiquetas del eje Y
              yAxisTextStyle={{
                color: colors.textSecondary,
                fontSize: 10,
              }}
              // NOTA: GiftedCharts no soporta maxFontSizeMultiplier directamente en el objeto de estilo,
              // pero al definir fontSize explícito aquí, generalmente evita el escalado agresivo del sistema
              // si el contenedor padre no fuerza lo contrario.

              // EJE X (ETIQUETAS)
              xAxisLabelTextStyle={{
                color: colors.textSecondary, 
                fontSize: 9,
                width: isIncomeVisible ? 50 : 40,
                textAlign: 'center',
              }}

              yAxisColor="transparent"
              xAxisColor={colors.border}
              rulesColor={colors.border}
              rulesType="solid"
              rulesThickness={0.5}
              yAxisLabelWidth={45}

              isAnimated
              animationDuration={600}

              renderTooltip={(item: any) => (
                <View style={[styles.tooltip, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                  {/* Tooltip sí permitimos escalar un poco porque flota sobre el contenido */}
                  <Text style={{ fontSize: 10, color: colors.textSecondary }} maxFontSizeMultiplier={1.2}>
                    {item.fullLabel}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: item.isIncome ? colors.income : colors.expense }} maxFontSizeMultiplier={1.2}>
                    {currencySymbol}{item.value.toFixed(0)}
                  </Text>
                </View>
              )}
              autoCenterTooltip
            />
          </ScrollView>
        </View>

        <View style={styles.footer}>
          {/* Texto informativo con límite de escalado */}
          <Text style={[styles.footerText, { color: colors.textSecondary }]} maxFontSizeMultiplier={UI_FONT_SCALE_LIMIT}>
             Scale Max: <Text style={{ color: colors.text }}>{currencySymbol}{chartConfig.maxValue}</Text>
           </Text>
        </View>

        {stats.trend !== 'stable' && (
          <Animated.View entering={FadeInDown.delay(200)} style={[styles.insightBox, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.insightHeader}>
              {/* Bloqueamos tamaño de icono para que no rompa la cabecera */}
              <Ionicons name="bulb" size={18} color={colors.accent} />
              <Text style={[styles.insightTitle, { color: colors.text }]} maxFontSizeMultiplier={UI_FONT_SCALE_LIMIT}>
                {t('overviews.insights', 'Insights')}
              </Text>
            </View>
            <Text style={[styles.insightText, { color: colors.textSecondary }]} maxFontSizeMultiplier={UI_FONT_SCALE_LIMIT}>
              {stats.trend === 'up' 
                ? t('insights.spending_up', { percent: stats.trendPercent.toFixed(1), defaultValue: `Spending up by ${stats.trendPercent.toFixed(1)}%` })
                : t('insights.spending_down', { percent: Math.abs(stats.trendPercent).toFixed(1), defaultValue: `Spending down by ${Math.abs(stats.trendPercent).toFixed(1)}%` })}
            </Text>
          </Animated.View>
        )}

      </Animated.View>
    </ScrollView>
  );
}