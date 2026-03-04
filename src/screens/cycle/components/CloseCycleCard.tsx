import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "i18next";
import { useMemo } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { FadeInDown } from "react-native-reanimated";
import Animated from "react-native-reanimated";
import * as Haptics from 'expo-haptics';

import { useSettingsStore } from "../../../stores/settingsStore";
import { useCycleStore } from "../../../stores/useCycleStore";
import { darkTheme, lightTheme } from "../../../theme/colors";
import { globalStyles } from "../../../theme/global.styles";
import { useCreditCycleScreen } from "../hooks/useCreditCycleScreen";

export function CloseCycleCard() {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);

  const closeCycle = useCycleStore((s) => s.closeCycle);

  // Extraemos lo que necesitamos del hook principal
  const {
    activeCycle,
    totalSpentInCycle, // ¡Esto es vital! Es el gasto real calculado de la base de datos
    safeToSpendToday
  } = useCreditCycleScreen();

  // Si no hay ciclo activo, este botón ni siquiera debería renderizarse
  if (!activeCycle) return null;

  // Calculamos cuánto sobraría si cerramos AHORA MISMO
  // (Presupuesto efectivo - lo que llevamos gastado hasta hoy)
  const currentSurplus = activeCycle.effectiveBudget - totalSpentInCycle;

  function closeCycleHandler() {
    if (!activeCycle) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Le pasamos el ID del ciclo y el gasto total REAL para que el store 
    // lo use y calcule el excedente (surplus) correctamente.
    closeCycle(activeCycle.id, totalSpentInCycle);
  }

  return (
    <Animated.View entering={FadeInDown.delay(480).springify()}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={closeCycleHandler}
        style={rollover_s.card}
      >
        <LinearGradient
          colors={[colors.accent, colors.primary]}
          style={rollover_s.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[globalStyles.bodyTextXl, { color: colors.text, fontWeight: 'bold', marginBottom: 4 }]}>
              🎯 {t("cycle_screen.plan_your_surplus")}
            </Text>

            <Text style={[globalStyles.bodyTextBase, { color: colors.text, marginBottom: 8 }]}>
              {t("cycle_screen.if_you_close_today")}{'\n'}
              <Text style={{ fontWeight: 'bold' }}>
                {t("cycle_screen.you_would_have")} ${currentSurplus > 0 ? currentSurplus.toFixed(2) : "0.00"} {t("cycle_screen.unallocated_surplus")}
              </Text>
            </Text>

            <Text style={[globalStyles.bodyTextSm, { color: colors.text, opacity: 0.8 }]}>
              {t("cycle_screen.tap_to_close_cycle")}
            </Text>
          </View>

          <View style={rollover_s.arrow}>
            <Ionicons name="arrow-forward" size={24} color={colors.text} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const rollover_s = StyleSheet.create({
  card: {
    borderRadius: 22, // Un poco más redondo para que pegue con el resto de la UI
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', // Añade un borde sutil
  },
  gradient: {
    padding: 20, // Más padding para que respire
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)', // Fondo sutil para la flecha
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
});