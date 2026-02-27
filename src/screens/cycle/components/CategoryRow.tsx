import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { categories } from '../CreditCycleScreen';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { useAuthStore } from '../../../stores/authStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { globalStyles } from '../../../theme/global.styles';




/** Categorías con barras de progreso */
export function CategoryRow({ item, delay }: { item: (typeof categories)[0]; delay: number }) {
  const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);
  const ratio = item.spent / item.limit;
  const over = ratio > 1;

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={cat_s.row}>
      <View style={[cat_s.iconBox, { backgroundColor: item.color + '22' }]}>
        <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={cat_s.labelRow}>
          <Text style={[globalStyles.bodyTextBase, { color: colors.text }]}>{item.label}</Text>
          <Text style={[globalStyles.amountXs, { color: over ? colors.expense : colors.text }]}>
            {currencySymbol}{item.spent} / {currencySymbol}{item.limit}
          </Text>
        </View>
        <View style={cat_s.track}>
          <View
            style={[
              cat_s.fill,
              {
                width: `${Math.min(ratio * 100, 100)}%`,
                backgroundColor: over ? colors.expense : item.color,
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const cat_s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  amount: { fontSize: 12 },
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
  },
  fill: { height: 6, borderRadius: 99 },
});