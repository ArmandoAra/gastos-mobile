import { t } from 'i18next';
import React, { useMemo } from 'react'
import {  View, StyleSheet,Text } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { LineChart } from 'react-native-gifted-charts';

import { realSpendingData, idealSpendingData } from '../CreditCycleScreen';
import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { globalStyles } from '../../../theme/global.styles';
import { LinearGradient } from 'expo-linear-gradient';

export function CycleLineChart() {
   const theme = useSettingsStore((s) => s.theme);
    const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);
  return (
    <Animated.View entering={FadeInDown.delay(250).springify()} style={[styles.section, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary + "40" }]}>
      <LinearGradient
                colors={[theme === 'dark' ? colors.accentSecondary + "40" : colors.accent + "40",colors.accent]}
                style={{ flex: 1, borderRadius: 22, padding:22 }}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
              >
            <View style={styles.sectionHeader}>
              <Text style={[globalStyles.headerTitleSm, { color: colors.text }]}>{t('cycle_screen.spending_rate')}</Text>
              <Text style={[globalStyles.bodyTextLg, { color: colors.textSecondary }]}>{t('cycle_screen.real_vs_ideal')}</Text>
            </View>

            <View style={styles.chartWrap}>
              <LineChart
                data={realSpendingData}
                data2={idealSpendingData}
                height={160}
                spacing={72}
                initialSpacing={20}
                color1={colors.expense}
                color2={colors.income}
                dataPointsColor1={colors.expense}
                dataPointsColor2={colors.income}
                startFillColor1="rgba(252,129,129,0.2)"
                startFillColor2="rgba(104,211,145,0.15)"
                endFillColor1="rgba(252,129,129,0)"
                endFillColor2="rgba(104,211,145,0)"
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
                {[{ c: '#FC8181', l: 'your_spending' }, { c: '#68D391', l: 'ideal_spending' }].map((i) => (
                  <View key={i.l} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: i.c }]} />
                    <Text style={[globalStyles.bodyTextBase, { color: colors.text }]}>{t(`cycle_screen.${i.l}`)}</Text>
                  </View>
                ))}
              </View>
            </View>
            </LinearGradient>
            </Animated.View>
  )
}


const styles = StyleSheet.create({
    section: {
    borderRadius: 22,
    borderWidth: 0.5,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartWrap: { alignItems: 'center' },
  legend: { flexDirection: 'row', gap: 20, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
});


