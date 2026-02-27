import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Bucket, BucketType } from "../../../stores/useCycleStore";
import * as Haptics from "expo-haptics";
import { useSettingsStore } from "../../../stores/settingsStore";
import { darkTheme, lightTheme } from "../../../theme/colors";
import { t } from "i18next";
import { useAuthStore } from "../../../stores/authStore";
import { globalStyles } from "../../../theme/global.styles";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const BUCKET_META: Record<BucketType, { gradient: [string, string]; glow: string }> = {
  savings:    { gradient: ['#1a4731', '#2d6a4f'], glow: 'rgba(104,211,145,0.35)' },
  emergency:  { gradient: ['#4a2c0a', '#7b4a1e'], glow: 'rgba(246,173,85,0.35)' },
  investment: { gradient: ['#2d1b69', '#4a2c8a'], glow: 'rgba(183,148,244,0.35)' },
  rollover:   { gradient: ['#0d2f4f', '#1a4a7a'], glow: 'rgba(99,179,237,0.35)' },
  buffer:     { gradient: ['#4a1a1a', '#7a2b2b'], glow: 'rgba(252,129,129,0.35)' },
};

export function BucketCard({ bucket, index }: { bucket: Bucket; index: number }) {
  const currencySymbol = useAuthStore((s) => s.currencySymbol);

  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);
  const [expanded, setExpanded] = useState(false);
  const lastDeposit = bucket.deposits[bucket.deposits.length - 1];

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()} >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          setExpanded((v) => !v);
        }}
        style={[bucket_s.card, { marginBottom: 12, backgroundColor: bucket.color + "30" }]}
      >
          {/* Orb decorativo */}
          <View style={[bucket_s.orb, { backgroundColor: bucket.color + '18' }]} />

          <View style={bucket_s.topRow}>
            <View style={[bucket_s.emojiBox, { backgroundColor: bucket.color + '25' }]}>
              <Text style={bucket_s.emoji}>{bucket.emoji}</Text>

            </View>
          <Text style={[globalStyles.bodyTextXl, { color: colors.text, fontWeight: 'bold' }]}>{bucket.label}</Text>
            <View style={bucket_s.badge}>
            <Text style={[globalStyles.amountXs, { color: colors.text }]}>
              {bucket.deposits.length} {t("cycle_screen.deposit_short")}.
              </Text>
            </View>
          </View>

        <Text style={[globalStyles.amountLg, { color: colors.text }]}>
          {currencySymbol}{bucket.totalAccumulated.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
        </Text>

          {lastDeposit && (
          <Text style={[globalStyles.bodyTextSm, { color: colors.text }]}>
            {t("cycle_screen.last")}: +{currencySymbol}{lastDeposit.amount} ·{' '}
              {format(new Date(lastDeposit.date), 'dd MMM', { locale: es })}
            </Text>
          )}

          {/* Mini bar — fill relativo al mayor bucket */}
          {expanded && (
            <Animated.View entering={FadeInDown.springify()} style={bucket_s.historyBlock}>
              <View style={bucket_s.divider} />
            <Text style={[globalStyles.headerTitleSm, { color: colors.text }]}>{t("cycle_screen.deposit_history")}</Text>
              {bucket.deposits.length === 0 ? (
              <Text style={[globalStyles.bodyTextSm, { color: colors.text }]}>{t("cycle_screen.no_deposits_yet")}</Text>
              ) : (
                [...bucket.deposits].reverse().slice(0, 5).map((d) => (
                  <View key={d.id} style={bucket_s.depositRow}>
                    <Text style={[globalStyles.amountSm, { color: colors.text }]}>
                      {format(new Date(d.date), 'dd MMM yyyy', { locale: es })}
                    </Text>
                    <Text style={[globalStyles.amountXs, { color: colors.text, fontWeight: '700' }]}>
                      +{currencySymbol}{d.amount.toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </Animated.View>
          )}

          <View style={bucket_s.chevronRow}>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={14}
            color={colors.textSecondary}
            />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const bucket_s = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  emojiBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  chevronRow: { alignItems: 'center', marginTop: 12 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
  historyBlock: { marginTop: 4 },
  emptyHistory: { color: 'rgba(255,255,255,0.25)', fontSize: 12 },
  depositRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
});