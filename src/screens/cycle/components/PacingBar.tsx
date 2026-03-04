import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { globalStyles } from '../../../theme/global.styles';
import { t } from 'i18next';
import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';

// ─── PROPS ───────────────────────────────────────────────────────────────────
// PacingBar recibe los valores calculados como props en lugar de llamar al hook.
// Esto evita que el hook se instancie múltiples veces con estados independientes.
// El padre (HeroCard o CreditCycleScreen) es el único que llama useCreditCycleScreen.
interface PacingBarProps {
  timeProgress: number;  // 0–1
  spendProgress: number; // 0–1
}

export function PacingBar({ timeProgress, spendProgress }: PacingBarProps) {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);

  const overSpend = spendProgress > timeProgress;

  return (
    <View style={pacing.wrapper}>
      {/* Tiempo transcurrido */}
      <View style={pacing.row}>
        <Text style={[globalStyles.bodyTextSm, { color: colors.text, width: 52 }]}>
          {t('cycle_screen.time')}
        </Text>
        <View style={[pacing.track, { backgroundColor: colors.surfaceSecondary }]}>
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={[pacing.fill, { width: `${timeProgress * 100}%`, backgroundColor: colors.text }]}
          />
          <View style={[pacing.marker, { left: `${timeProgress * 100}%` as `${number}%` }]}>
            <Text style={globalStyles.bodyTextSm}>{Math.round(timeProgress * 100)}%</Text>
          </View>
        </View>
      </View>

      {/* Gasto */}
      <View style={pacing.row}>
        <Text style={[globalStyles.bodyTextSm, { color: colors.text, width: 52 }]}>
          {t('cycle_screen.spend')}
        </Text>
        <View style={[pacing.track, { backgroundColor: colors.surfaceSecondary }]}>
          <Animated.View
            entering={FadeInDown.delay(350)}
            style={[
              pacing.fill,
              {
                width: `${spendProgress * 100}%`,
                backgroundColor: overSpend ? colors.error : colors.success,
              },
            ]}
          />
          <View style={[pacing.marker, { left: `${spendProgress * 100}%` as `${number}%` }]}>
            <Text style={globalStyles.bodyTextSm}>{Math.round(spendProgress * 100)}%</Text>
          </View>
        </View>
      </View>

      <Text style={[pacing.hint, { color: overSpend ? colors.error : colors.success }]}>
        {overSpend ? t('cycle_screen.overpacing') : t('cycle_screen.onTrack')}
      </Text>
    </View>
  );
}

const pacing = StyleSheet.create({
  wrapper: { gap: 10, paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 99,
    overflow: 'visible',
    position: 'relative',
  },
  fill: { height: 10, borderRadius: 99, minWidth: 8 },
  marker: {
    position: 'absolute',
    top: -20,
    transform: [{ translateX: -10 }],
  },
  hint: { fontSize: 12, marginTop: 4 },
});