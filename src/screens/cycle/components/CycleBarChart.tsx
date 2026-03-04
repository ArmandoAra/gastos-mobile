import { t } from 'i18next';
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { BarChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';

import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { globalStyles } from '../../../theme/global.styles';
import { useCreditCycleScreen } from '../hooks/useCreditCycleScreen';
import { useAuthStore } from '../../../stores/authStore';
import { formatCurrency } from '../../../utils/helpers';

export function CycleBarChart() {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);
  const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const { width } = useWindowDimensions();

  const { activeCycle, realSpendingData, idealSpendingData } = useCreditCycleScreen();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Ritmo ideal diario — primer punto del array ya es variableBudget/totalDays*1
  const idealDailyRate = useMemo(
    () => idealSpendingData?.[0]?.value ?? 0,
    [idealSpendingData]
  );

  // ── DATOS SELECCIONADOS ───────────────────────────────────────────────────
  const selectedData = useMemo(() => {
    if (selectedIndex === null) return null;

    const realAcc  = realSpendingData?.[selectedIndex]?.value ?? null;
    const idealAcc = idealSpendingData?.[selectedIndex]?.value ?? 0;
    const label    = realSpendingData?.[selectedIndex]?.label ?? '';

    // Presupuesto disponible ese día = idealAcc[i] - realAcc[i-1]
    // Cuánto podías gastar HOY dado lo ya gastado AYER.
    // Negativo si venías sobrepasado del día anterior.
    const prevRealAcc = selectedIndex > 0
      ? ((realSpendingData?.[selectedIndex - 1]?.value as number) ?? 0)
      : 0;
    const dailyReal = realAcc !== null
      ? parseFloat((idealAcc - prevRealAcc).toFixed(2))
      : null;

    // Ideal ajustado del día = idealAcc[i] - idealAcc[i-1] = ritmo diario puro
    const prevIdealAcc = selectedIndex > 0
      ? (idealSpendingData?.[selectedIndex - 1]?.value ?? 0)
      : 0;
    const dailyIdeal = parseFloat((idealAcc - prevIdealAcc).toFixed(2));

    // Gasto real de ESE día = acumulado[i] - acumulado[i-1]
    const dailySpend = realAcc !== null
      ? parseFloat(((realAcc as number) - prevRealAcc).toFixed(2))
      : null;

    // Ideal del día = idealAcc[i] - idealAcc[i-1] = ritmo diario constante
    const prevIdealAcc2 = selectedIndex > 0
      ? (idealSpendingData?.[selectedIndex - 1]?.value ?? 0)
      : 0;
    const dailyIdealFixed = parseFloat((idealAcc - prevIdealAcc2).toFixed(2));

    const isOverAcc   = realAcc !== null && realAcc > idealAcc;
    const isOverDaily = dailyReal !== null && dailyReal < 0;
    const isOverDailySpend = dailySpend !== null && dailySpend > dailyIdealFixed;

    return { label, realAcc, idealAcc, dailyReal, dailyIdeal, dailySpend, dailyIdealFixed, isOverAcc, isOverDaily, isOverDailySpend };
  }, [selectedIndex, realSpendingData, idealSpendingData, idealDailyRate]);

  // ── DATOS DE BARRAS ───────────────────────────────────────────────────────
  // Mostramos el gasto DIARIO (delta) — no acumulado.
  // Así cada barra refleja cuánto se gastó ESE día vs el ritmo ideal diario.
  // Rojo si superó el ideal del día, verde si estuvo por debajo.
  const barData = useMemo(() => {
    if (!realSpendingData?.length) return [];
    return realSpendingData
      .map((real, i) => {
        if (real.value === null || real.value === undefined) return null;
        // Gasto diario = acumulado[i] - acumulado[i-1]
        const prevAcc = i > 0 ? ((realSpendingData[i - 1]?.value as number) ?? 0) : 0;
        const dailySpend = parseFloat(((real.value as number) - prevAcc).toFixed(2));
        const over = dailySpend > idealDailyRate;
        return {
          value:      dailySpend,
          label:      real.label ?? '',
          frontColor: over ? colors.expense : colors.income,
          _index:     i,
        };
      })
      .filter(Boolean) as { value: number; label: string; frontColor: string; _index: number }[];
  }, [realSpendingData, idealDailyRate, colors]);

  // Media de gasto diario real (solo días con datos)
  const avgDailySpend = useMemo(() => {
    if (!barData.length) return 0;
    const total = barData.reduce((sum, b) => sum + b.value, 0);
    return parseFloat((total / barData.length).toFixed(2));
  }, [barData]);

  // La línea de referencia es el ritmo ideal diario (constante)
  const lastIdealValue = idealDailyRate;

  const chartAvailableWidth = width - 22 * 2 - 16 * 2;
  const barWidth = Math.max(
    Math.floor((chartAvailableWidth - 40) / Math.max(barData.length, 1)) - 6,
    14
  );

  if (!activeCycle || barData.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(250).springify()}
      style={[styles.section, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary + '40' }]}
    >
      <LinearGradient
        colors={[
          theme === 'dark' ? colors.accentSecondary + '40' : colors.accent + '40',
          colors.accent,
        ]}
        style={{ flex: 1, borderRadius: 22, padding: 22 }}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
      >
        {/* ── HEADER ── */}
        <View style={styles.sectionHeader}>
          <View style={{ gap: 2 }}>
            <Text style={[globalStyles.headerTitleSm, { color: colors.text }]}>
              {t('cycle_screen.spending_rate')}
            </Text>
            <Text style={[globalStyles.bodyTextLg, { color: colors.textSecondary }]}>
              {t('cycle_screen.ideal_vs_exceeded', 'Recomendado vs Excedido')}
            </Text>
          </View>
          {/* Media de gasto diario */}
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={[styles.avgChip, { backgroundColor: colors.surfaceSecondary + '80' }]}>
              <Text style={[styles.avgChipLabel, { color: colors.textSecondary }]}>
                {t('cycle_screen.daily_avg', 'Media/día')}
              </Text>
              <Text style={[styles.avgChipValue, {
                color: avgDailySpend > idealDailyRate ? colors.expense : colors.income
              }]}>
                {currencySymbol}{formatCurrency(avgDailySpend)}
              </Text>
            </View>
            <Text style={[styles.avgChipSub, { color: colors.textSecondary }]}>
              {t('cycle_screen.ideal_prefix', 'ideal')} {currencySymbol}{formatCurrency(idealDailyRate)}
            </Text>
          </View>
        </View>

        {/* ── TOOLTIP ──────────────────────────────────────────────────────── */}
        {selectedData ? (
          <Animated.View
            key={selectedIndex}
            entering={FadeIn.duration(160)}
            style={[styles.tooltip, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {/* Día */}
            <Text style={[styles.tooltipDay, { color: colors.textSecondary }]}>
              {selectedData.label}  {t('cycle_screen.this_day', 'Este día')}
            </Text>

            {/* ── FILA: gasto de este día ── */}
            <View style={styles.tooltipSection}>
              <View style={styles.tooltipRow}>
                <TooltipBlock
                  label={t('cycle_screen.spent', 'Gastado')}
                  value={selectedData.dailySpend}
                  color={selectedData.isOverDailySpend ? colors.expense : colors.income}
                  currencySymbol={currencySymbol}
                />
                <View style={[styles.tooltipDivider, { backgroundColor: colors.border }]} />
                <TooltipBlock
                  label={t('cycle_screen.ideal_day', 'Ideal del día')}
                  value={selectedData.dailyIdealFixed}
                  color={colors.income}
                  currencySymbol={currencySymbol}
                />
              </View>
            </View>

            <View style={[styles.innerDivider, { backgroundColor: colors.border }]} />


            {/* ── FILA SUPERIOR: acumulados ── */}
            <View style={styles.tooltipSection}>
              <Text style={[styles.tooltipSectionLabel, { color: colors.textSecondary }]}>
                {t('cycle_screen.accumulated', 'Acumulado')}
              </Text>
              <View style={styles.tooltipRow}>
                <TooltipBlock
                  label={t('cycle_screen.your_spending')}
                  value={selectedData.realAcc}
                  color={selectedData.isOverAcc ? colors.expense : colors.income}
                  currencySymbol={currencySymbol}
                />
                <View style={[styles.tooltipDivider, { backgroundColor: colors.border }]} />
                <TooltipBlock
                  label={t('cycle_screen.ideal_spending')}
                  value={selectedData.idealAcc}
                  color={colors.income}
                  currencySymbol={currencySymbol}
                />
              </View>
            </View>

            {/* Badge diferencia acumulada */}
            {selectedData.realAcc !== null && (
              <View style={[styles.tooltipBadge, {
                backgroundColor: selectedData.isOverAcc ? colors.expense + '18' : colors.income + '18',
                borderColor:     selectedData.isOverAcc ? colors.expense + '40' : colors.income + '40',
              }]}>
                <Text style={[styles.tooltipBadgeText, {
                  color: selectedData.isOverAcc ? colors.expense : colors.income,
                }]}>
                  {selectedData.isOverAcc
                    ? `-${currencySymbol}${formatCurrency(selectedData.realAcc - selectedData.idealAcc)} ${t('cycle_screen.over_budget', 'sobre presupuesto')}`
                    : `+${currencySymbol}${formatCurrency(selectedData.idealAcc - selectedData.realAcc)} ${t('cycle_screen.under_budget', 'bajo presupuesto')}`
                  }
                </Text>
              </View>
            )}

            
          </Animated.View>
        ) : (
          <View style={[styles.tooltipEmpty, { borderColor: colors.border + '60' }]}>
            <Text style={[styles.tooltipEmptyText, { color: colors.textSecondary }]}>
              {t('cycle_screen.tap_bar_hint', 'Toca una barra para ver el detalle')}
            </Text>
          </View>
        )}

        {/* ── PILLS ── */}
        <View style={styles.metaRow}>
          {[
            { c: colors.income,  l: 'ideal_spending' },
            { c: colors.expense, l: 'exceeded_spending' },
          ].map((item) => (
            <View key={item.l} style={[styles.pill, { backgroundColor: colors.surfaceSecondary + '60' }]}>
              <View style={[styles.pillDot, { backgroundColor: item.c }]} />
              <Text style={[styles.pillText, { color: colors.text }]}>
                {t(`cycle_screen.${item.l}`)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── GRÁFICA ── */}
        <View style={styles.chartWrap}>
          <BarChart
            data={barData.map((bar, i) => ({
              ...bar,
              frontColor: selectedIndex === null
                ? bar.frontColor
                : selectedIndex === i
                  ? bar.frontColor
                  : bar.frontColor + '44',
              borderColor:    selectedIndex === i ? bar.frontColor : 'transparent',
              borderWidth:    selectedIndex === i ? 2 : 0,
              borderTopWidth: selectedIndex === i ? 2 : 0,
            }))}
            height={140}
            width={chartAvailableWidth}
            barWidth={barWidth}
            spacing={6}
            initialSpacing={8}
            endSpacing={8}
            roundedTop
            onPress={(_item: any, index: number) => {
              setSelectedIndex(index === selectedIndex ? null : index);
            }}
            showReferenceLine1
            referenceLine1Position={lastIdealValue}
            referenceLine1Config={{
              color:          colors.income + 'CC',
              width:          1.5,
              dashWidth:      6,
              dashGap:        4,
              labelText:      t('cycle_screen.ideal_spending'),
              labelTextStyle: { color: colors.income, fontSize: 9 },
            }}
            hideRules
            hideAxesAndRules={false}
            rulesColor={colors.border + '30'}
            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 9 }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 9, marginTop: 4 }}
            xAxisColor={colors.border + '40'}
            yAxisColor="transparent"
            backgroundColor="transparent"
            noOfSections={4}
            barBorderRadius={6}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ── BLOQUE DE VALOR REUTILIZABLE ─────────────────────────────────────────────
function TooltipBlock({
  label,
  value,
  color,
  currencySymbol,
  allowNegative = false,
}: {
  label: string;
  value: number | null;
  color: string;
  currencySymbol: string;
  allowNegative?: boolean;
}) {
  const display = value === null
    ? '—'
    : `${value < 0 && allowNegative ? '-' : ''}${currencySymbol}${formatCurrency(Math.abs(value))}`;

  return (
    <View style={styles.tooltipBlock}>
      <View style={styles.tooltipLabelRow}>
        <View style={[styles.tooltipDot, { backgroundColor: color }]} />
        <Text style={[styles.tooltipLabel, { color }]}>{label}</Text>
      </View>
      <Text style={[styles.tooltipValue, { color }]}>{display}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderRadius: 22, borderWidth: 0.5 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  // ── Tooltip ──
  tooltip: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  tooltipDay: {
    fontSize: 11,
    fontFamily: 'FiraSans-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tooltipSection: { gap: 6 },
  tooltipSectionLabel: {
    fontSize: 10,
    fontFamily: 'FiraSans-Bold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tooltipBlock: { flex: 1, gap: 3 },
  tooltipLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tooltipDot: { width: 6, height: 6, borderRadius: 99 },
  tooltipLabel: { fontSize: 10, fontFamily: 'FiraSans-Regular' },
  tooltipValue: { fontSize: 16, fontFamily: 'FiraSans-Bold' },
  tooltipDivider: { width: 1, height: 36 },
  innerDivider: { height: 1, marginVertical: 2 },
  tooltipBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  tooltipBadgeText: { fontSize: 11, fontFamily: 'FiraSans-Bold' },

  tooltipEmpty: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  tooltipEmptyText: { fontSize: 11, fontFamily: 'FiraSans-Regular' },

  // ── Pills ──
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  pillDot: { width: 7, height: 7, borderRadius: 99 },
  pillText: { fontSize: 11, fontFamily: 'FiraSans-Bold' },

  chartWrap: { alignItems: 'flex-start', width: '100%' },

  // ── Avg chip ──
  avgChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  avgChipLabel: { fontSize: 10, fontFamily: 'FiraSans-Regular' },
  avgChipValue: { fontSize: 13, fontFamily: 'FiraSans-Bold' },
  avgChipSub:   { fontSize: 9,  fontFamily: 'FiraSans-Regular' },
});