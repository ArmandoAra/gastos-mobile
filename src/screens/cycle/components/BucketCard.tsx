import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSettingsStore } from "../../../stores/settingsStore";
import { darkTheme, lightTheme } from "../../../theme/colors";
import { t } from "i18next";
import { useAuthStore } from "../../../stores/authStore";
import { globalStyles } from "../../../theme/global.styles";

// Importamos las nuevas interfaces
import { Bucket, BucketTransaction } from "../../../interfaces/cycle.interface";

// Ajustamos los props para que reciba el cofre y sus transacciones correspondientes
export function BucketCard({
  bucket,
  transactions,
  index
}: {
  bucket: Bucket;
  transactions: BucketTransaction[]; // <-- Pasamos el historial desde afuera
  index: number;
}) {
  const currencySymbol = useAuthStore((s) => s.currencySymbol);

  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);
  const [expanded, setExpanded] = useState(false);

  // Filtramos solo los depósitos (si quieres mostrar retiros, quita este filtro)
  const deposits = useMemo(() => {
    return transactions.filter(tx => tx.type === 'deposit');
  }, [transactions]);

  // El último depósito (asumiendo que vienen ordenados, o tomamos el último del array filtrado)
  const lastDeposit = deposits.length > 0 ? deposits[deposits.length - 1] : null;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()} >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          setExpanded((v) => !v);
        }}
        style={[bucket_s.card, { marginBottom: 12 }]}//Utilizar el color del icono para el background
      >
          {/* Orb decorativo */}
        <View style={[bucket_s.orb,]} />

          <View style={bucket_s.topRow}>
          <View style={[bucket_s.emojiBox]}>
            {/* Fallback de icono en caso de que iconName sea un string de Ionicons o emoji */}
            <Text style={bucket_s.emoji}>
              {bucket.iconName.length <= 2 ? bucket.iconName : '💰'}
            </Text>
            </View>
          <Text style={[globalStyles.bodyTextXl, { color: colors.text, fontWeight: 'bold' }]}>{bucket.name}</Text>
            <View style={bucket_s.badge}>
            <Text style={[globalStyles.amountXs, { color: colors.text }]}>
              {deposits.length} {t("cycle_screen.deposit_short")}.
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
            {deposits.length === 0 ? (
              <Text style={[globalStyles.bodyTextSm, { color: colors.text }]}>{t("cycle_screen.no_deposits_yet")}</Text>
              ) : (
                // Revertimos para mostrar los más recientes arriba
                [...deposits].reverse().slice(0, 5).map((d) => (
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