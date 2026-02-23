import React, { useState } from 'react';
import { 
  View, 
  StyleSheet,
  Platform,
  AccessibilityInfo
} from 'react-native';

// Stores & Components
import DailyExpenseViewMobile from './components/DailyExpenseView';
import InfoHeader from '../../components/headers/InfoHeader';
import { ViewPeriod } from '../../interfaces/date.interface';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ExpenseHeatmap from './components/ExpenseHeatmapMobile';
import { useScrollDirection } from '../../hooks/useScrollDirection';

// 1. IMPORTANTE: Usamos Animated de Reanimated
import Animated from 'react-native-reanimated';
import { ThemeColors } from '../../types/navigation';
import { globalStyles } from '../../theme/global.styles';
import { LinearGradient } from 'expo-linear-gradient';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const language = useSettingsStore((state) => state.language);
  const colors: ThemeColors = theme === 'dark' ? darkTheme : lightTheme;

  const [selectedPeriod, setSelectedPeriod] = useState<ViewPeriod>('month');

  // 2. Obtenemos el handler nativo
  const { onScroll } = useScrollDirection();

  const handlePeriodChange = (p: string) => {
    const newPeriod = p as ViewPeriod;
    setSelectedPeriod(newPeriod);
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(t(`transactions.${newPeriod}`) + ' selected');
    }
  };

  return (
    <LinearGradient
      // 1. Colores del gradiente (de arriba hacia abajo usando tu tema)
      colors={[colors.surfaceSecondary, theme === 'dark' ? colors.primary : colors.accent,]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}

      // 2. Quitamos el backgroundColor sólido para que se vea el gradiente
      style={[
        globalStyles.screenContainer,
        { paddingTop: insets.top }
      ]}
    >
      <InfoHeader viewMode={selectedPeriod} colors={colors} language={language} />

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}

        // Conectamos el handler
        onScroll={onScroll}

        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Daily View */}
        <DailyExpenseViewMobile handlePeriodChange={handlePeriodChange} />

        {/* 2. Heatmap */}
        <ExpenseHeatmap />

        {/* Espacio para que el contenido no quede tapado por la barra de navegación */}
        <View style={{ height: insets.bottom + 80 }} />

      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // ... resto de tus estilos (se mantienen igual)
  periodSelectorWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  periodSelectorContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  periodBtn: {
    flexGrow: 1,
    flexBasis: '20%',
    minWidth: 70,
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  periodText: {
    fontFamily: 'FiraSans-Bold',
    fontSize: 14,
    textAlign: 'center',
  },
  scrollContent: {
    paddingTop: 8,
  },
  sectionContainer: {},
  balanceCard: { margin: 16, padding: 16, borderRadius: 16, elevation: 2 },
  balanceLabel: { marginBottom: 8 },
  balanceAmount: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', gap: 16, justifyContent:'space-between' },
  balanceItemLabel: { fontSize: 12 },
  chartContainer: { margin: 16, marginTop: 0, padding: 16, borderRadius: 16, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});