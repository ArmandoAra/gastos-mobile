import { t } from 'i18next';
import React, { useMemo } from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';

import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { globalStyles } from '../../../theme/global.styles';
import { useCreditCycleScreen } from '../hooks/useCreditCycleScreen'; // <-- IMPORTAMOS EL HOOK

// ─── TIPOS ────────────────────────────────────────────────────────────────────
interface ChartPoint {
  value: number;
  label?: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// 1. Gifted Charts crashea con valores negativos en gráficos de área.
function toPositive(data: ChartPoint[]): ChartPoint[] {
  if (!data) return [];
  return data.map((p) => ({ ...p, value: Math.abs(p.value) }));
}

// 2. Adelgazamos las etiquetas del eje X para que no se amontonen si hay muchos días
function thinLabels(data: ChartPoint[], maxVisible = 6): ChartPoint[] {
  if (!data || data.length === 0) return [];
  const step = Math.max(1, Math.ceil(data.length / maxVisible)); // Evita dividir por cero
  return data.map((p, i) => ({
    ...p,
    label: i % step === 0 ? p.label : '', // Deja el texto vacío pero mantiene el punto en la gráfica
  }));
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export function CycleLineChart() {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);
  const { width } = useWindowDimensions();

  // Obtenemos los datos directamente del hook (así no dependes de pasar props)
  const { activeCycle, realSpendingData, idealSpendingData } = useCreditCycleScreen();

  // Ancho de la "ventana" de la gráfica (ancho total - paddings)
  const chartAvailableWidth = width - 22 * 2 - 16 * 2;

  // Procesamos los datos
  const processedReal = useMemo(() => {
    return thinLabels(toPositive(realSpendingData));
  }, [realSpendingData]);

  const processedIdeal = useMemo(() => {
    return thinLabels(idealSpendingData);
  }, [idealSpendingData]);

  // Si no hay ciclo o no hay datos, no renderizamos nada
  if (!activeCycle || processedReal.length === 0 || processedIdeal.length === 0) {
    return null;
  }

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
        <View style={styles.sectionHeader}>
          <Text style={[globalStyles.headerTitleSm, { color: colors.text }]}>
            {t('cycle_screen.spending_rate')}
          </Text>
          <Text style={[globalStyles.bodyTextLg, { color: colors.textSecondary }]}>
            {t('cycle_screen.real_vs_ideal')}
          </Text>
        </View>

        {/* Contenedor alineado a la izquierda para que el scroll empiece desde el inicio */}
        <View style={styles.chartWrap}>
          <LineChart
            data={processedReal}
            data2={processedIdeal}
            height={160}

            // ─── CONFIGURACIÓN DE SCROLL HORIZONTAL ───
            width={chartAvailableWidth} // Límite de la ventana
            // Habilita el scroll
            spacing={45}                // Espaciado FIJO para que la gráfica crezca a lo ancho y se pueda scrollear
            initialSpacing={10}
            endSpacing={20}

            color1={colors.expense}
            color2={colors.income}
            dataPointsColor1={colors.expense}
            dataPointsColor2={colors.income}
            startFillColor1={colors.expense + '40'} // El '40' añade transparencia al hex
            startFillColor2={colors.income + '40'}
            endFillColor1="transparent"
            endFillColor2="transparent"
            areaChart
            thickness={2.5}
            hideRules
            hideAxesAndRules={false}
            rulesColor="rgba(255,255,255,0.06)"
            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisColor="rgba(255,255,255,0.08)"
            yAxisColor="transparent"
            backgroundColor="transparent"
          />

          {/* Leyenda */}
          <View style={styles.legend}>
            {[
              { c: colors.expense, l: 'your_spending' },
              { c: colors.income, l: 'ideal_spending' },
            ].map((item) => (
              <View key={item.l} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: item.c }]} />
                <Text style={[globalStyles.bodyTextBase, { color: colors.text }]}>
                  {t(`cycle_screen.${item.l}`)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 22, 
    borderWidth: 0.5 
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartWrap: {
    alignItems: 'flex-start', // Importante para que el scroll funcione desde el borde izquierdo
    width: '100%',
  },
  legend: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
    alignSelf: 'center', // Centramos la leyenda independientemente de la gráfica
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
});