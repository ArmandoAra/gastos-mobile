import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSettingsStore } from "../../../stores/settingsStore";
import { darkTheme, lightTheme } from "../../../theme/colors";
import { t } from "i18next";
import { useAuthStore } from "../../../stores/authStore";
import { globalStyles } from "../../../theme/global.styles";

import { Bucket, BucketTransaction } from "../../../interfaces/cycle.interface";

// ─── TARJETA DE COFRE (BUCKET) ────────────────────────────────────────────────
export function BucketCard({
  bucket,
  transactions,
  index,
  onPress
}: {
  bucket: Bucket;
    transactions: BucketTransaction[];
  index: number;
    onPress?: () => void; // Para abrir detalles en el futuro
}) {
  const currencySymbol = useAuthStore((s) => s.currencySymbol);
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);

  const deposits = useMemo(() => {
    return transactions.filter(tx => tx.type === 'deposit');
  }, [transactions]);

  const lastDeposit = deposits.length > 0 ? deposits[deposits.length - 1] : null;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify().damping(18)}
      layout={LinearTransition.springify()}
      style={bucket_s.cardWrapper}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          if (onPress) onPress();
        }}
        style={[
          bucket_s.card,
          { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }
        ]}
      >
        {/* Orb decorativo (esquina superior derecha) */}
        <View style={[bucket_s.orb, { backgroundColor: bucket.color || colors.primary, opacity: 0.15 }]} />

        {/* Header de la tarjeta */}
        <View style={bucket_s.topRow}>
          <View style={[bucket_s.emojiBox, { backgroundColor: (bucket.color || colors.primary) + '20' }]}>
            <Text style={bucket_s.emoji}>
              {bucket.iconName?.length <= 2 ? bucket.iconName : '💰'}
            </Text>
          </View>
        </View>

        {/* Nombre del cofre */}
        <Text
          style={[globalStyles.bodyTextSm, { color: colors.textSecondary, marginTop: 8 }]}
          numberOfLines={1}
        >
          {bucket.name}
        </Text>

        {/* Monto Acumulado */}
        <Text
          style={[globalStyles.amountSm, { color: colors.text, marginVertical: 4 }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {currencySymbol}{bucket.totalAccumulated.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
        </Text>

        {/* Info adicional (Último depósito) */}
        {lastDeposit ? (
          <Text style={[globalStyles.bodyTextXs, { color: colors.success }]} numberOfLines={1}>
            +{currencySymbol}{lastDeposit.amount} ({format(new Date(lastDeposit.date), 'dd MMM', { locale: es })})
          </Text>
        ) : (
          <Text style={[globalStyles.bodyTextXs, { color: colors.textSecondary }]}>
            {t("cycle_screen.no_deposits_yet")}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}



// ─── ESTILOS ────────────────────────────────────────────────────────────────
const bucket_s = StyleSheet.create({
  // El wrapper ocupa el 48% para dejar un pequeño hueco en medio (2 columnas)
  cardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 130, // Asegura que todas las tarjetas tengan la misma altura base
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emojiBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emoji: {
    fontSize: 20 
  },

});