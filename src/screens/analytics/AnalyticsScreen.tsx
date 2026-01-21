import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  Platform,
  AccessibilityInfo
} from 'react-native';

// Date-fns
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  startOfYear, 
  endOfYear 
} from 'date-fns';
import { es } from 'date-fns/locale';

// Stores & Components
import useDataStore from '../../stores/useDataStore';
import ExpenseHeatmapMobile from './components/ExpenseHeatmapMobile';
import DailyExpenseViewMobile from './components/DailyExpenseView';
import InfoHeader from '../../components/headers/InfoHeader';
import { ViewPeriod } from '../../interfaces/date.interface';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import useDateStore from '../../stores/useDateStore';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PeriodSelector from './components/subcomponents/PeriodSelector';
import ExpenseHeatmap from './components/ExpenseHeatmapMobile';

// Nota: Quitadas importaciones de Skia/Victory no usadas directamente en este archivo
// para limpiar el componente padre.


export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [selectedPeriod, setSelectedPeriod] =  useState<ViewPeriod>('month');


  const handlePeriodChange = (p: string) => {
    const newPeriod = p as ViewPeriod;
    setSelectedPeriod(newPeriod);
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(t(`transactions.${newPeriod}`) + ' selected');
    }
  };



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <InfoHeader viewMode={selectedPeriod} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        { /* Period Selector - Accesible y Escalable */}

        {/* 1. Daily View */}
        <DailyExpenseViewMobile handlePeriodChange={handlePeriodChange} />

        {/* 2. Heatmap */}
        <ExpenseHeatmap />

        <View style={{ height: insets.bottom + 40 }} />

    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodSelectorWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
  },
  // Contenido flex-wrap para escalabilidad
  periodSelectorContent: {
    flexDirection: 'row',
    flexWrap: 'wrap', // CLAVE: Permite que los botones bajen si la fuente es gigante
    gap: 8,
    justifyContent: 'center', // Centrado si sobran espacios o hacen wrap
  },
  periodBtn: {
    // Flex grow ayuda a llenar espacios, minWidth asegura tocabilidad
    flexGrow: 1,
    flexBasis: '20%', // Base aproximada para 4 items
    minWidth: 70,
    minHeight: 44, // Altura táctil mínima recomendada
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, // Cambiado a 1 para mejor visibilidad en bordes
  },
  periodText: {
    fontFamily: 'FiraSans-Bold',
    fontSize: 14,
    textAlign: 'center',
  },
  scrollContent: {
    paddingTop: 8,
  },
  sectionContainer: {
    // marginBottom: 60,
    // No forzamos altura, dejamos que el hijo decida
  },
  // Estilos legacy mantenidos por si acaso, aunque no usados directamente en el JSX actual
  balanceCard: { margin: 16, padding: 16, borderRadius: 16, elevation: 2 },
  balanceLabel: { marginBottom: 8 },
  balanceAmount: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', gap: 16, justifyContent:'space-between' },
  balanceItemLabel: { fontSize: 12 },
  chartContainer: { margin: 16, marginTop: 0, padding: 16, borderRadius: 16, elevation: 2 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
});