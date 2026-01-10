import React, { useMemo, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
  Platform,
  AccessibilityInfo
} from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
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

// --- TAMAÑO FIJO PARA CELDAS ---
// Usamos un tamaño fijo que garantiza buena legibilidad y área táctil (44pt mínimo)
const CELL_SIZE = isTablet ? 56 : 50; // Tamaño fijo y generoso
const GAP_SIZE = 6;
const MINI_CELL_SIZE = 24;

// Calculamos el ancho total que ocupará una semana completa (7 columnas)
const WEEK_WIDTH = (CELL_SIZE * 7) + (GAP_SIZE * 6);

export default function ExpenseHeatmap() {
  const { transactions } = useDataStore();
  const { localSelectedDay } = useDateStore();

  const { theme } = useSettingsStore();
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  const { currencySymbol } = useAuthStore();

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [heatmapType, setHeatmapType] = useState<HeatmapType>('daily');
  const [selectedCell, setSelectedCell] = useState<{
    value: number;
    label: string;
    subLabel?: string;
    transactions?: Transaction[];
  } | null>(null);

  const year = localSelectedDay.getFullYear();
  const monthIndex = localSelectedDay.getMonth();

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
        groups[key] = (groups[key] || 0) + Math.abs(t.amount);
      });
      return Math.max(...Object.values(groups), 1);
    } else {
      return Math.max(...expenseTransactions.map(t => Math.abs(t.amount)), 1); 
    }
  }, [expenseTransactions, heatmapType, viewMode]);

  // Función de color interpolado
  const getHeatColor = useCallback((amount: number) => {
    if (amount === 0) return colors.surfaceSecondary;
    const intensity = Math.min(amount / maxValue, 1);
    
    if (intensity < 0.25) return colors.income + '40';
    if (intensity < 0.50) return '#facc15';
    if (intensity < 0.75) return '#fb923c';
    return '#ef4444';
  }, [maxValue, colors]);

  // --- DATA GENERATION ---
  const gridData = useMemo(() => {
    if (heatmapType !== 'daily') return null;

    if (viewMode === 'month') {
      const daysInMonth = getDaysInMonth(localSelectedDay);
      const startDay = getDay(startOfMonth(localSelectedDay)); 

      const blanks = Array(startDay).fill(null);
      const days = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const txs = expenseTransactions.filter(t => new Date(t.date).getDate() === day);
        const amount = txs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return { day, amount, transactions: txs };
      });
      return [...blanks, ...days];
    } else {
      return Array.from({ length: 12 }, (_, i) => {
        const txs = expenseTransactions.filter(t => new Date(t.date).getMonth() === i);
        const amount = txs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return { monthIndex: i, amount, transactions: txs, label: format(new Date(year, i, 1), 'MMM') };
      });
    }
  }, [viewMode, heatmapType, localSelectedDay, expenseTransactions, year]);

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
        return { label: p.label, amount: txs.reduce((s, t) => s + Math.abs(t.amount), 0), transactions: txs };
      });
      return { category: cat, data };
    });
  }, [viewMode, heatmapType, expenseTransactions, localSelectedDay, year]);

  const totalDisplay = useMemo(() =>
    expenseTransactions.reduce((s, t) => s + Math.abs(t.amount), 0), 
    [expenseTransactions]
  );

  // --- HANDLERS ---
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(`View mode changed to ${mode}`);
    }
  }, []);

  const handleHeatmapTypeChange = useCallback((type: HeatmapType) => {
    setHeatmapType(type);
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility(`Heatmap type changed to ${type === 'daily' ? 'grid' : 'categories'}`);
    }
  }, []);

  const handleCellPress = useCallback((cellData: {
    value: number;
    label: string;
    subLabel?: string;
    transactions?: Transaction[];
  }) => {
    setSelectedCell(cellData);
    if (Platform.OS !== 'web') {
      const txCount = cellData.transactions?.length || 0;
      AccessibilityInfo.announceForAccessibility(
        `${cellData.label}, ${cellData.subLabel}, ${currencySymbol} ${cellData.value.toFixed(2)}, ${txCount} transactions`
      );
    }
  }, [currencySymbol]);

  const handleCloseModal = useCallback(() => {
    setSelectedCell(null);
    if (Platform.OS !== 'web') {
      AccessibilityInfo.announceForAccessibility('Details closed');
    }
  }, []);

  const renderTransaction = useCallback((t: Transaction, i: number) => (
    <View
      key={i} 
      style={localStyles.txRow}
      accessible={true}
      accessibilityLabel={`${t.description || t.category_name}, ${currencySymbol} ${Math.abs(t.amount).toFixed(2)}`}
    >
      <Text
        style={[localStyles.txName, { color: colors.text }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {t.description || t.category_name}
      </Text>
      <Text 
        style={[localStyles.txVal, { color: colors.textSecondary }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {currencySymbol}{Math.abs(t.amount).toFixed(0)}
      </Text>
    </View>
  ), [colors, currencySymbol]);

  return (
    <Animated.View 
      entering={FadeInDown.duration(600)} 
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessible={true}
      accessibilityLabel="Expense heatmap view"
    >
      
      {/* HEADER & CONTROLS */}
      <View style={localStyles.header}>
        <View style={localStyles.headerTop}>
          <View style={localStyles.iconTitle}>
            <View>
              <Text style={[localStyles.title, { color: colors.text }]}>Heatmap</Text>
              <Text style={[localStyles.subtitle, { color: colors.textSecondary }]}>
                Intensity of your spending
              </Text>
            </View>
          </View>
          <View 
            style={[localStyles.totalBadge, { backgroundColor: colors.surfaceSecondary }]}
            accessible={true}
            accessibilityLabel={`Total expenses: ${currencySymbol} ${totalDisplay.toFixed(0)}`}
          >
            <Text 
              style={[localStyles.totalText, { color: colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              -{currencySymbol}{totalDisplay.toFixed(0)}
            </Text>
          </View>
        </View>

        <View style={localStyles.controlsRow}>
          {/* View Mode Toggle */}
          <View
            style={[localStyles.toggleContainer, { backgroundColor: colors.background, borderColor: colors.border }]}
            accessible={false}
          >
            {(['month', 'year'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => handleViewModeChange(m)}
                style={[localStyles.toggleBtn, viewMode === m && { backgroundColor: colors.text }]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`View ${m}`}
                accessibilityState={{ selected: viewMode === m }}
                accessibilityHint={`Switch to ${m} view`}
              >
                <Text style={[localStyles.toggleText, { color: viewMode === m ? colors.surface : colors.text }]}>
                  {m === 'month' ? 'Month' : 'Year'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Type Toggle */}
          <View
            style={[localStyles.toggleContainer, { backgroundColor: colors.background, borderColor: colors.border }]}
            accessible={false}
          >
            {(['daily', 'category'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => handleHeatmapTypeChange(t)}
                style={[localStyles.toggleBtn, heatmapType === t && { backgroundColor: colors.text }]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={t === 'daily' ? 'Grid view' : 'Categories view'}
                accessibilityState={{ selected: heatmapType === t }}
                accessibilityHint={`Switch to ${t === 'daily' ? 'grid' : 'categories'} view`}
              >
                <Text style={[localStyles.toggleText, { color: heatmapType === t ? colors.surface : colors.text }]}>
                  {t === 'daily' ? 'Grid' : 'Cats'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* --- RENDER CONTENT --- */}
      
      {/* 1. CALENDAR / GRID VIEW CON SCROLL HORIZONTAL */}
      {heatmapType === 'daily' && gridData && (
        <View style={localStyles.gridContainer}>
          {viewMode === 'month' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={localStyles.scrollContent}
              accessible={false}
            >
              <View style={{ minWidth: WEEK_WIDTH }}>
                {/* Fila de días de la semana */}
                <View style={localStyles.weekDaysRow}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <View
                      key={i} 
                      style={[localStyles.weekDayCell, { width: CELL_SIZE }]}
                    >
                      <Text
                        style={[localStyles.weekDayText, { color: colors.textSecondary }]}
                        importantForAccessibility="no"
                      >
                        {d}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Grid de días */}
                <View style={localStyles.gridWrap}>
                  {gridData.map((cell: any, index: number) => {
                    if (cell === null) return (
                      <View
                        key={`blank-${index}`} 
                        style={[localStyles.cell, { width: CELL_SIZE, height: CELL_SIZE }]}
                        importantForAccessibility="no"
                      />
                    );

                    const txCount = cell.transactions?.length || 0;

                    return (
                      <TouchableOpacity
                        key={`day-${cell.day}-${index}`}
                        activeOpacity={0.7}
                        onPress={() => handleCellPress({
                          value: cell.amount,
                          label: `${format(localSelectedDay, 'MMM')} ${cell.day}`,
                          subLabel: 'Daily Total',
                          transactions: cell.transactions
                        })}
                        style={[
                          localStyles.cell,
                          {
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            backgroundColor: getHeatColor(cell.amount),
                            borderColor: colors.border,
                            borderWidth: cell.amount === 0 ? 1 : 0
                          }
                        ]}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Day ${cell.day}, ${currencySymbol} ${cell.amount.toFixed(0)}, ${txCount} transactions`}
                        accessibilityHint="Tap to view details"
                      >
                        <Text
                          style={[
                            localStyles.cellText,
                            { 
                              color: cell.amount > (maxValue * 0.4) ? '#FFF' : colors.textSecondary
                            }
                          ]}
                          numberOfLines={1}
                        >
                          {cell.day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          )}

          {/* VISTA AÑO - Sin scroll, normal */}
          {viewMode === 'year' && (
            <View style={[localStyles.gridWrapYear]} accessible={false}>
              {gridData.map((cell: any, index: number) => {
                const txCount = cell.transactions?.length || 0;
                return (
                  <TouchableOpacity
                    key={`month-${cell.label}-${index}`}
                    activeOpacity={0.7}
                    onPress={() => handleCellPress({
                      value: cell.amount,
                      label: `${cell.label} ${year}`,
                      subLabel: 'Monthly Total',
                      transactions: cell.transactions
                    })}
                    style={[
                      localStyles.yearCell,
                      {
                        backgroundColor: getHeatColor(cell.amount),
                        borderColor: colors.border,
                        borderWidth: cell.amount === 0 ? 1 : 0
                      }
                    ]}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${cell.label}, ${currencySymbol} ${cell.amount.toFixed(0)}, ${txCount} transactions`}
                    accessibilityHint="Tap to view details"
                  >
                    <Text
                      style={[
                        localStyles.yearCellText,
                        {
                          color: cell.amount > (maxValue * 0.4) ? '#FFF' : colors.textSecondary
                        }
                      ]}
                    >
                      {cell.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* 2. CATEGORY MATRIX VIEW */}
      {heatmapType === 'category' && categoryData && (
        <View style={localStyles.catContainer}>
          {/* COLUMNA IZQUIERDA (FIJA) */}
          <View style={[localStyles.catFixedColumn, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
            <View style={localStyles.catHeaderPlaceholder}>
              <Text
                style={[localStyles.catHeaderLabel, { color: colors.textSecondary }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                CATEGORY
              </Text>
            </View>

            {categoryData.map((cat, i) => (
              <View
                key={`cat-${i}`}
                style={localStyles.catNameRow}
                accessible={true}
                accessibilityLabel={cat.category}
              >
                <Text 
                  numberOfLines={2} 
                  ellipsizeMode="tail"
                  style={[localStyles.catLabel, { color: colors.text }]}
                >
                  {cat.category}
                </Text>
              </View>
            ))}
          </View>

          {/* ZONA DERECHA (SCROLLABLE) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            accessible={false}
          >
            <View>
              <View style={localStyles.catDateHeaderRow} accessible={false}>
                {categoryData.length > 0 && categoryData[0].data.map((d: any, i: number) => (
                  <View key={`header-${i}`} style={localStyles.catHeaderCell}>
                    <Text style={[localStyles.catColHeader, { color: colors.textSecondary }]}>
                      {d.label.substring(0, 3)}
                    </Text>
                  </View>
                ))}
              </View>

              {categoryData.map((cat, i) => (
                <View key={`row-${i}`} style={localStyles.catDataRow} accessible={false}>
                  {cat.data.map((cell: any, j: number) => {
                    const txCount = cell.transactions?.length || 0;
                    return (
                      <TouchableOpacity
                        key={`cell-${i}-${j}`}
                        onPress={() => handleCellPress({
                          value: cell.amount,
                          label: cat.category,
                          subLabel: `${viewMode === 'year' ? cell.label : 'Day ' + cell.label}`,
                          transactions: cell.transactions
                        })}
                        style={[
                          localStyles.miniCell,
                          {
                            backgroundColor: getHeatColor(cell.amount),
                            borderColor: colors.border,
                            borderWidth: cell.amount === 0 ? 0.5 : 0
                          }
                        ]}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`${cat.category}, ${cell.label}, ${currencySymbol} ${cell.amount.toFixed(0)}, ${txCount} transactions`}
                        accessibilityHint="Tap to view details"
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* LEGEND SCALE */}
      <View
        style={[localStyles.legend, { borderTopColor: colors.border }]}
        accessible={true}
        accessibilityLabel="Color scale: from less to more spending intensity"
      >
        <Text style={[localStyles.legendLabel, { color: colors.textSecondary }]}>Less</Text>
        <View style={localStyles.scaleBar} importantForAccessibility="no">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v, i) => (
            <View key={i} style={[localStyles.scaleDot, { backgroundColor: getHeatColor(maxValue * v) }]} />
          ))}
        </View>
        <Text style={[localStyles.legendLabel, { color: colors.textSecondary }]}>More</Text>
      </View>

      {/* DETAIL MODAL */}
      <Modal
        visible={!!selectedCell}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <TouchableOpacity 
          style={localStyles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleCloseModal}
          accessible={false}
        >
          <Animated.View 
            entering={ZoomIn.duration(300)}
            style={[localStyles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessible={true}
            accessibilityLabel="Transaction details"
          >
            <View
              style={[localStyles.modalHeader, { borderBottomColor: colors.border }]}
              accessible={false}
            >
              <View style={localStyles.modalHeaderLeft}>
                <Text
                  style={[localStyles.modalTitle, { color: colors.text }]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {selectedCell?.label}
                </Text>
                <Text
                  style={[localStyles.modalSub, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {selectedCell?.subLabel}
                </Text>
              </View>
              <Text
                style={[localStyles.modalAmount, { color: colors.expense }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {currencySymbol}{selectedCell?.value.toFixed(2)}
              </Text>
            </View>

            <ScrollView
              style={localStyles.txScrollView}
              showsVerticalScrollIndicator={false}
              accessible={false}
            >
              {selectedCell?.transactions && selectedCell.transactions.length > 0 ? (
                selectedCell.transactions.map(renderTransaction)
              ) : (
                  <Text
                    style={[localStyles.noTx, { color: colors.textSecondary }]}
                    accessible={true}
                  >
                    No transactions.
                  </Text>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              onPress={handleCloseModal}
              style={[localStyles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close details"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[localStyles.closeText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

    </Animated.View>
  );
}

// ESTILOS LOCALES
const localStyles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  iconTitle: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 18,
  },
  totalBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 3,
  },
  toggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  gridContainer: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 4,
  },
  weekDaysRow: {
    flexDirection: 'row',
    gap: GAP_SIZE,
    marginBottom: 8,
  },
  weekDayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP_SIZE,
    width: WEEK_WIDTH,
  },
  gridWrapYear: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  cell: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  cellText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  yearCell: {
    width: '30%',
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 70,
  },
  yearCellText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  catContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    maxHeight: 400,
  },
  catFixedColumn: {
    borderRightWidth: 1,
    paddingRight: 8,
    minWidth: 100,
  },
  catHeaderPlaceholder: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  catHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  catNameRow: {
    height: MINI_CELL_SIZE + GAP_SIZE,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  catDateHeaderRow: {
    flexDirection: 'row',
    gap: GAP_SIZE,
    marginBottom: GAP_SIZE,
  },
  catHeaderCell: {
    width: MINI_CELL_SIZE,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catColHeader: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  catDataRow: {
    flexDirection: 'row',
    gap: GAP_SIZE,
    marginBottom: GAP_SIZE,
  },
  miniCell: {
    width: MINI_CELL_SIZE,
    height: MINI_CELL_SIZE,
    borderRadius: 4,
    minHeight: 24,
    minWidth: 24,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  scaleBar: {
    flexDirection: 'row',
    gap: 6,
  },
  scaleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    maxHeight: '80%',
  },
  modalHeader: {  
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 12,
  },
  modalHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  modalSub: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 18,
  },
  modalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  txScrollView: {
    flexGrow: 0,
    maxHeight: 300,
    marginBottom: 12,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
  },
  txName: { 
    fontSize: 14, 
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
  },
  txVal: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  noTx: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  closeBtn: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
});