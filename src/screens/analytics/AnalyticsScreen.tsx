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
import ExpenseBarChart from './components/ExpenseBarChart';
import { ViewPeriod } from '../../interfaces/date.interface';
import { useSettingsStore } from '../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../theme/colors';
import useDateStore from '../../stores/useDateStore';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import PeriodSelector from './components/subcomponents/PeriodSelector';

// Nota: Quitadas importaciones de Skia/Victory no usadas directamente en este archivo
// para limpiar el componente padre.

const { width } = Dimensions.get('window');

// Colores para el gráfico de torta (Mantenido por si se re-implementa el PieChart)
const CATEGORY_COLORS = ['#EF5350', '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA'];

export default function AnalyticsScreen() {
  const { transactions } = useDataStore();
  const { t } = useTranslation();
  const { localSelectedDay } = useDateStore();
  const { theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  const [selectedPeriod, setSelectedPeriod] =  useState<ViewPeriod>('month');

  // ============================================
  // LÓGICA DE DATOS
  // ============================================
  const filteredTransactions = useMemo(() => {
    const now = new Date(); // OJO: ¿Debería ser localSelectedDay? Usando lógica original por ahora.
    let start, end;

    switch (selectedPeriod) {
      case 'week':
        start = startOfWeek(now, { locale: es });
        end = endOfWeek(now, { locale: es });
        break;
      case 'month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'year':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default: // day
      // Nota: Para 'day' la lógica original usaba month como fallback o necesita ajuste específico
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return transactions.filter(t => {
      const date = parseISO(t.date);
      return date >= start && date <= end;
    });
  }, [selectedPeriod, transactions]);

  const expenses = filteredTransactions.filter(t => t.type === 'expense');
  const income = filteredTransactions.filter(t => t.type === 'income');

  // Stats básicos para accesibilidad o headers futuros
  const stats = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    return {
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses
    };
  }, [expenses, income]);

  const handlePeriodChange = (p: string) => {
    const newPeriod = p as ViewPeriod;
    setSelectedPeriod(newPeriod);
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(t(`transactions.${newPeriod}`) + ' selected');
    }
  };

  const PERIODS = ['day', 'week', 'month', 'year'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>

      <InfoHeader viewMode={selectedPeriod} />

      {/* Period Selector - Accesible y Escalable */}
      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        colors={colors}
        periods={PERIODS}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Daily View */}
        <View style={styles.sectionContainer}>
          <DailyExpenseViewMobile currentPeriod={selectedPeriod} />
        </View>

        {/* 2. Heatmap */}
        <View style={styles.sectionContainer}>
          <ExpenseHeatmapMobile />
        </View>

        {/* 3. Bar Chart */}
        {/* <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
          <ExpenseBarChart currentPeriod={selectedPeriod} />
        </View> */}

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
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  scrollContent: {
    paddingTop: 8,
  },
  sectionContainer: {
    marginBottom: 60,
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