import { format } from "date-fns";
import { es } from "date-fns/locale";
import {  View ,Text, StyleSheet} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { selectCycleHistory } from "../../../stores/useCycleStore";
import { useMemo } from "react";
import { useSettingsStore } from "../../../stores/settingsStore";
import { darkTheme, lightTheme } from "../../../theme/colors";
import { t } from "i18next";
import { globalStyles } from "../../../theme/global.styles";



export function CycleHistoryRow({ cycle, index }: { cycle: ReturnType<typeof selectCycleHistory>[0]; index: number }) {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);
  const surplus = cycle.surplusAmount ?? 0;
  const deficit = surplus < 0 ? Math.abs(surplus) : 0;
  const hasSurplus = surplus > 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={[hist_s.row, { backgroundColor: colors.surfaceSecondary }]}>
      <View style={[hist_s.indicator, { backgroundColor: hasSurplus ? colors.success : colors.error }]} />
      <View style={{ flex: 1 }}>
        <Text style={[globalStyles.bodyTextSm, { color: colors.text }]}>
          {format(new Date(cycle.startDate), 'dd MMM', { locale: es })} →{' '}
          {format(new Date(cycle.endDate), 'dd MMM yyyy', { locale: es })}
        </Text>
        <Text style={[globalStyles.bodyTextSm, { color: colors.text }]}>
          {t('cycle_screen.spent')} ${cycle.totalSpent.toLocaleString()} {t('common.of')} ${cycle.effectiveBudget.toLocaleString()}
          {cycle.rolloverBonus > 0 ? ` (+$${cycle.rolloverBonus} ${t('cycle_screen.rollover')})` : ''}
        </Text>
      </View>
      <Text style={[hist_s.amount, { color: hasSurplus ? colors.success : colors.error }]}>
        {hasSurplus ? '+' : '-'}${hasSurplus ? surplus : deficit}
      </Text>
    </Animated.View>
  );
}

const hist_s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  indicator: { width: 4, height: 36, borderRadius: 2 },
  range: { color: '#fff', fontSize: 13, fontWeight: '600' },
  detail: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
});