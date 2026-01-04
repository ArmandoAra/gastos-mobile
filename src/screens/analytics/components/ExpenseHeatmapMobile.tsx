import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  Platform
} from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import { Transaction } from '../../../interfaces/data.interface';
import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { useAuthStore } from '../../../stores/authStore';
import useDateStore from '../../../stores/useDateStore';
import useDataStore from '../../../stores/useDataStore';
import { styles } from './styles';


type ViewMode = 'month' | 'year';
type HeatmapType = 'daily' | 'category';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;
const CELL_SIZE = isTablet ? 48 : (SCREEN_WIDTH - 60) / 7; // Dinámico para mobile
const MINI_CELL_SIZE = 24;
const GAP_SIZE = 4; // Espacio entre celdas

export default function ExpenseHeatmap() {
  const {transactions}  = useDataStore();
  const {localSelectedDay} =useDateStore();
  // 1. Theme & Store
  const { theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const { currencySymbol } = useAuthStore();

  // 2. Internal State
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [heatmapType, setHeatmapType] = useState<HeatmapType>('daily');
  const [selectedCell, setSelectedCell] = useState<{
    value: number;
    label: string;
    subLabel?: string;
    transactions?: Transaction[];
  } | null>(null);

  // 3. Derived Data
  const year = localSelectedDay.getFullYear();
  const monthIndex = localSelectedDay.getMonth(); // 0-11

  // Filtrar transacciones base (solo gastos)
  const expenseTransactions = useMemo(() => 
    transactions.filter(t => {
      const d = new Date(t.date);
      const matchesYear = d.getFullYear() === year;
      if (viewMode === 'year') return t.type === 'expense' && matchesYear;
      return t.type === 'expense' && matchesYear && d.getMonth() === monthIndex;
    }), 
  [transactions, viewMode, year, monthIndex]);

  // Max Value para la escala de color
  const maxValue = useMemo(() => {
    if (expenseTransactions.length === 0) return 1;
    
    if (heatmapType === 'daily') {
      const groups: Record<string, number> = {};
      expenseTransactions.forEach(t => {
        const key = viewMode === 'month' 
          ? new Date(t.date).getDate() 
          : new Date(t.date).getMonth();
        groups[key] = (groups[key] || 0) + t.amount;
      });
      return Math.max(...Object.values(groups), 1);
    } else {
      return Math.max(...expenseTransactions.map(t => t.amount), 1); 
    }
  }, [expenseTransactions, heatmapType, viewMode]);

  // Función de color interpolado
  const getHeatColor = (amount: number) => {
    if (amount === 0) return colors.surfaceSecondary;
    const intensity = Math.min(amount / maxValue, 1);
    
    if (intensity < 0.25) return colors.income + '40';
    if (intensity < 0.50) return '#facc15';
    if (intensity < 0.75) return '#fb923c';
    return '#ef4444';
  };

  // --- DATA GENERATION ---

  // A. Daily Grid
  const gridData = useMemo(() => {
    if (heatmapType !== 'daily') return null;

    if (viewMode === 'month') {
      const daysInMonth = getDaysInMonth(localSelectedDay);
      const startDay = getDay(startOfMonth(localSelectedDay)); 
      
      const blanks = Array(startDay).fill(null);
      const days = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const txs = expenseTransactions.filter(t => new Date(t.date).getDate() === day);
        const amount = txs.reduce((sum, t) => sum + t.amount, 0);
        return { day, amount, transactions: txs };
      });
      return [...blanks, ...days];
    } else {
      return Array.from({ length: 12 }, (_, i) => {
        const txs = expenseTransactions.filter(t => new Date(t.date).getMonth() === i);
        const amount = txs.reduce((sum, t) => sum + t.amount, 0);
        return { monthIndex: i, amount, transactions: txs, label: format(new Date(year, i, 1), 'MMM') };
      });
    }
  }, [viewMode, heatmapType, localSelectedDay, expenseTransactions]);

  // B. Category Matrix
  const categoryData = useMemo(() => {
    if (heatmapType !== 'category') return null;
    
    const categories = Array.from(new Set(expenseTransactions.map(t => t.category_name)));
    const periods = viewMode === 'year' 
      ? Array.from({ length: 12 }, (_, i) => ({ label: format(new Date(year, i, 1), 'MMM'), index: i }))
      : Array.from({ length: getDaysInMonth(localSelectedDay) }, (_, i) => ({ label: `${i + 1}`, index: i + 1 }));

    return categories.map(cat => {
      const data = periods.map(p => {
        const txs = expenseTransactions.filter(t => {
          const d = new Date(t.date);
          const isCat = t.category_name === cat;
          const isPeriod = viewMode === 'year' ? d.getMonth() === p.index : d.getDate() === p.index;
          return isCat && isPeriod;
        });
        return { label: p.label, amount: txs.reduce((s, t) => s + t.amount, 0), transactions: txs };
      });
      return { category: cat, data };
    });
  }, [viewMode, heatmapType, expenseTransactions, localSelectedDay]);

  const totalDisplay = useMemo(() => expenseTransactions.reduce((s, t) => s + t.amount, 0), [expenseTransactions]);

  return (
    <Animated.View 
      entering={FadeInDown.duration(600)} 
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      
      {/* HEADER & CONTROLS */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.iconTitle}>

            <View>
              <Text style={[styles.title, { color: colors.text }]}>Heatmap</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Intensity of your spending
              </Text>
            </View>
          </View>
          <View style={[styles.totalBadge, { backgroundColor: colors.surfaceSecondary }]}>
             <Text style={[styles.totalText, { color: colors.text }]}>{currencySymbol}{totalDisplay.toFixed(0)}</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          {/* View Mode Toggle */}
          <View style={[styles.toggleContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {(['month', 'year'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setViewMode(m)}
                style={[styles.toggleBtn, viewMode === m && { backgroundColor: colors.text }]}
              >
                <Text style={[styles.toggleText, { color: viewMode === m ? colors.surface : colors.text }]}>
                  {m === 'month' ? 'Month' : 'Year'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Type Toggle */}
          <View style={[styles.toggleContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {(['daily', 'category'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setHeatmapType(t)}
                style={[styles.toggleBtn, heatmapType === t && { backgroundColor: colors.text }]}
              >
                <Text style={[styles.toggleText, { color: heatmapType === t ? colors.surface : colors.text }]}>
                  {t === 'daily' ? 'Grid' : 'Cats'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* --- RENDER CONTENT --- */}
      
      {/* 1. CALENDAR / GRID VIEW */}
      {heatmapType === 'daily' && gridData && (
        <View style={styles.gridContainer}>
          {viewMode === 'month' && (
             <View style={styles.weekDaysRow}>
               {['S','M','T','W','T','F','S'].map((d, i) => (
                 <Text key={i} style={[styles.weekDayText, { color: colors.textSecondary, width: CELL_SIZE }]}>{d}</Text>
               ))}
             </View>
          )}

          <View style={[styles.gridWrap, viewMode === 'year' && styles.gridWrapYear]}>
            {gridData.map((cell: any, index: number) => {
              if (cell === null) return <View key={`blank-${index}`} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
              
              const isYearMode = viewMode === 'year';
              const displayLabel = isYearMode ? cell.label : cell.day;
              
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCell({
                    value: cell.amount,
                    label: isYearMode ? `${cell.label} ${year}` : `${format(localSelectedDay, 'MMM')} ${cell.day}`,
                    subLabel: isYearMode ? 'Monthly Total' : 'Daily Total',
                    transactions: cell.transactions
                  })}
                  style={[
                    styles.cell,
                    {
                      width: isYearMode ? '30%' : CELL_SIZE,
                      height: isYearMode ? 60 : CELL_SIZE,
                      backgroundColor: getHeatColor(cell.amount),
                      borderColor: colors.border,
                      borderWidth: cell.amount === 0 ? 1 : 0
                    }
                  ]}
                >
                  <Text style={[
                    styles.cellText, 
                    { 
                      color: cell.amount > (maxValue * 0.4) ? '#FFF' : colors.textSecondary,
                      fontSize: isYearMode ? 14 : 10
                    }
                  ]}>
                    {displayLabel}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}

      {/* 2. CATEGORY MATRIX VIEW (MODIFICADO PARA COLUMNA FIJA) */}
      {heatmapType === 'category' && categoryData && (
        <View style={styles.catContainer}>
            
            {/* COLUMNA IZQUIERDA (FIJA) */}
            <View style={[styles.catFixedColumn, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
                {/* Cabecera vacía o con título para alinear con la fila de fechas */}
                <View style={styles.catHeaderPlaceholder}>
                     <Text style={[styles.catHeaderLabel, { color: colors.textSecondary }]}>CATEGORY</Text>
                </View>

                {/* Lista de nombres de categorías */}
                {categoryData.map((cat, i) => (
                    <View key={i} style={styles.catNameRow}>
                        <Text numberOfLines={1} style={[styles.catLabel, { color: colors.text }]}>
                            {cat.category}
                        </Text>
                    </View>
                ))}
            </View>

            {/* ZONA DERECHA (SCROLLABLE) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {/* Fila de Cabeceras (Fechas/Meses) */}
                    <View style={styles.catDateHeaderRow}>
                         {categoryData.length > 0 && categoryData[0].data.map((d: any, i: number) => (
                             <View key={i} style={styles.catHeaderCell}>
                                <Text style={[styles.catColHeader, { color: colors.textSecondary }]}>
                                    {d.label.substring(0, 3)}
                                </Text>
                             </View>
                         ))}
                    </View>

                    {/* Filas de Celdas de Datos */}
                    {categoryData.map((cat, i) => (
                        <View key={i} style={styles.catDataRow}>
                            {cat.data.map((cell: any, j: number) => (
                                <TouchableOpacity
                                    key={j}
                                    onPress={() => setSelectedCell({
                                        value: cell.amount,
                                        label: cat.category,
                                        subLabel: `${viewMode === 'year' ? cell.label : 'Day ' + cell.label}`,
                                        transactions: cell.transactions
                                    })}
                                    style={[
                                        styles.miniCell, 
                                        { backgroundColor: getHeatColor(cell.amount) }
                                    ]}
                                />
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
      )}

      {/* LEGEND SCALE */}
      <View style={[styles.legend, { borderTopColor: colors.border }]}>
         <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>Less</Text>
         <View style={styles.scaleBar}>
           {[0.1, 0.3, 0.5, 0.7, 0.9].map((v, i) => (
             <View key={i} style={[styles.scaleDot, { backgroundColor: getHeatColor(maxValue * v) }]} />
           ))}
         </View>
         <Text style={[styles.legendLabel, { color: colors.textSecondary }]}>More</Text>
      </View>

      {/* DETAIL MODAL */}
      <Modal
        visible={!!selectedCell}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCell(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setSelectedCell(null)}
        >
          <Animated.View 
            entering={ZoomIn.duration(300)}
            style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
               <View>
                 <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedCell?.label}</Text>
                 <Text style={[styles.modalSub, { color: colors.textSecondary }]}>{selectedCell?.subLabel}</Text>
               </View>
               <Text style={[styles.modalAmount, { color: colors.income }]}>
                 {currencySymbol}{selectedCell?.value.toFixed(2)}
               </Text>
            </View>

            <ScrollView style={{ maxHeight: 200 }}>
              {selectedCell?.transactions && selectedCell.transactions.length > 0 ? (
                selectedCell.transactions.map((t, i) => (
                  <View key={i} style={styles.txRow}>
                    <Text style={[styles.txName, { color: colors.text }]} numberOfLines={1}>{t.description || t.category_name}</Text>
                    <Text style={[styles.txVal, { color: colors.textSecondary }]}>{currencySymbol}{t.amount.toFixed(0)}</Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.noTx, { color: colors.textSecondary }]}>No transactions.</Text>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              onPress={() => setSelectedCell(null)}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Text style={[styles.closeText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

    </Animated.View>
  );
}
