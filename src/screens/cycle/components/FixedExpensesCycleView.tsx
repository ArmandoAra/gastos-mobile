import { LinearGradient } from 'expo-linear-gradient'
import { t } from 'i18next'
import React, { useMemo } from 'react'
import { Text,View,  StyleSheet} from 'react-native'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import { FixedTransactionsManager } from './FixedTranasactionsManager'
import { useAuthStore } from '../../../stores/authStore'
import { useSettingsStore } from '../../../stores/settingsStore'
import { darkTheme, lightTheme } from '../../../theme/colors'
import { useCreditCycleScreen } from '../hooks/useCreditCycleScreen';


export const FixedExpensesCycleView = () => {
    const theme = useSettingsStore((s) => s.theme);
    const currentUserId = useAuthStore((s) => s.user?.id || '');
    const colors = useMemo(() => (theme === 'dark' ? darkTheme : lightTheme), [theme]);
     const {
        accountSelected,
        activeCycle,
       availableCycleDays
      } = useCreditCycleScreen();


  return (
    <Animated.View
                  entering={FadeInDown.delay(150)}
                  exiting={FadeOutDown.delay(200)}
                  style={[styles.section, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary + '40' }]}
                >
                  <LinearGradient
                    colors={[
                      theme === 'dark' ? colors.accentSecondary + '40' : colors.accent + '40',
                      colors.primary,
                    ]}
                    style={{ flex: 1, borderRadius: 22, padding: 22 }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <View style={{ height: 8 }} />
    
                    <FixedTransactionsManager
                      accountId={accountSelected}
                      userId={currentUserId}
                      cycleId={activeCycle?.id}
          availableCycleDays={availableCycleDays}
                    />
                  </LinearGradient>
                </Animated.View>
  )
}

const styles = StyleSheet.create({
    section: { borderRadius: 22, borderWidth: 0.5 },
})
