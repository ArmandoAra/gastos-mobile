import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "i18next";
import { useMemo } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { FadeInDown } from "react-native-reanimated";
import { useSettingsStore } from "../../../stores/settingsStore";
import { useCycleStore } from "../../../stores/useCycleStore";
import { darkTheme, lightTheme } from "../../../theme/colors";
import { globalStyles } from "../../../theme/global.styles";
import { rollover_s, SAFE_TO_SPEND } from "../CreditCycleScreen";
import Animated from "react-native-reanimated";
import * as Haptics from 'expo-haptics';



export function CloseCycleCard() {
  const theme = useSettingsStore((s) => s.theme);
  const colors = useMemo(() => theme === 'dark' ? darkTheme : lightTheme, [theme]);
  const startCycle = useCycleStore((s) => s.startNewCycle);
  const addExpense = useCycleStore((s) => s.addExpense);
  const closeCycle = useCycleStore((s) => s.closeCycle);
  const activeCycleId = useCycleStore((s) => s.activeCycleId);

  function closeCycleHandler() {

    // clearAllCycleData();
    if (activeCycleId) return;
    const cycle = startCycle({
      baseBudget: 1000,
      startDate: new Date(Date.now() - 30 * 86400000),
      endDate: new Date(Date.now() - 1 * 86400000),
      fixedExpenses: 120,
    });
    addExpense(cycle.id, 650);
    closeCycle(cycle.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  return (
    <Animated.View entering={FadeInDown.delay(480).springify()}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          closeCycleHandler();
        }}
        style={rollover_s.card}
      >
        <LinearGradient
          colors={[colors.accent, colors.primary]}
          style={rollover_s.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View >
            <Text style={[globalStyles.bodyTextXl, { color: colors.text, fontWeight: 'bold' }]}>🎯 {t("cycle_screen.plan_your_surplus")}</Text>
            <Text style={[globalStyles.bodyTextXl, { color: colors.text, fontWeight: 'bold' }]}>
              {t("cycle_screen.if_you_close_today")}{'\n'}{t("cycle_screen.you_would_have")} ${SAFE_TO_SPEND}
            </Text>
            <Text style={[globalStyles.bodyTextSm, { color: colors.text }]}>{t("cycle_screen.tap_to_close_cycle")}</Text>
          </View>
          <View style={rollover_s.arrow}>
            <Ionicons name="arrow-forward" size={22} color={colors.text} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}