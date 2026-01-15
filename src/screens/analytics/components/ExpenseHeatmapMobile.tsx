import React, { useMemo, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { format } from 'date-fns';
import { Transaction } from '../../../interfaces/data.interface';
import { styles } from './styles';
import { weekDaysShort } from '../../../constants/date';
import { es, pt, enGB } from 'date-fns/locale';
import { useExpenseHeatmapLogic } from '../hooks/useExpenseHeatmapLogic';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

// --- TAMAÑO FIJO PARA GARANTIZAR 7 COLUMNAS ---
// Usamos un tamaño fijo de celda que garantice buena legibilidad
const CELL_SIZE = isTablet ? 56 : 48; // Tamaño fijo generoso
const GAP_SIZE = 4;

// Calculamos el ancho total necesario para 7 columnas
const GRID_WIDTH = (CELL_SIZE * 7) + (GAP_SIZE * 6);

const MINI_CELL_SIZE = 24;

export default function ExpenseHeatmap() {
  const {
    t,
    colors,
    currencySymbol,
    language,
    localSelectedDay,
    year,

    viewMode,
    heatmapType,
    selectedCell,
    maxValue,
    totalDisplay,

    gridData,
    categoryData,

    getHeatColor,
    handleViewModeChange,
    handleHeatmapTypeChange,
    handleCellPress,
    handleCloseModal
  } = useExpenseHeatmapLogic();

  const renderTransaction = useCallback((t: Transaction, i: number) => (
    <View
      key={i}
      style={localStyles.txRow}
      accessible={true}
      accessibilityLabel={`${t.description || t.category_icon_name}, ${currencySymbol} ${Math.abs(t.amount).toFixed(2)}`}
    >
      <Text style={[localStyles.txName, { color: colors.text }]} numberOfLines={2} ellipsizeMode="tail">
        {t.description || t.category_icon_name}
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
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 80 }
      ]}
      accessible={true}
      accessibilityLabel={t('overviews.expenseHeatmap')}
    >
      
      {/* HEADER & CONTROLS */}
      <View style={localStyles.header}>
        <View style={localStyles.headerTop}>
          <View style={localStyles.iconTitle}>
            <View>
              <Text style={[localStyles.title, { color: colors.text }]} maxFontSizeMultiplier={1.3}>
                {t('overviews.expenseHeatmap')}
              </Text>
              <Text style={[localStyles.subtitle, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
                {t('overviews.heatMapSubtitle')}
              </Text>
            </View>
          </View>
          <View
            style={[localStyles.totalBadge, { backgroundColor: colors.surfaceSecondary }]}
            accessible={true}
            accessibilityLabel={`${t('common.total')}: ${currencySymbol} ${totalDisplay.toFixed(0)}`}
          >
            <Text
              style={[localStyles.totalText, { color: colors.text }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              maxFontSizeMultiplier={1.4}
            >
              -{currencySymbol} {totalDisplay.toFixed(0)}
            </Text>
          </View>
        </View>

        <View style={localStyles.controlsRow}>
          {/* View Mode Toggle */}
          <View style={[localStyles.toggleContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {(['month', 'year'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => handleViewModeChange(m)}
                style={[localStyles.toggleBtn, viewMode === m && { backgroundColor: colors.text }]}
                accessibilityRole="button"
                accessibilityState={{ selected: viewMode === m }}
              >
                <Text
                  style={[localStyles.toggleText, { color: viewMode === m ? colors.surface : colors.text }]}
                  maxFontSizeMultiplier={1.2}
                >
                  {m === 'month' ? t('transactions.month') : t('transactions.year')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Type Toggle */}
          <View style={[localStyles.toggleContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {(['daily', 'category'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => handleHeatmapTypeChange(type)}
                style={[localStyles.toggleBtn, heatmapType === type && { backgroundColor: colors.text }]}
                accessibilityRole="button"
                accessibilityState={{ selected: heatmapType === type }}
              >
                <Text
                  style={[localStyles.toggleText, { color: heatmapType === type ? colors.surface : colors.text }]}
                  maxFontSizeMultiplier={1.2}
                >
                  {type === 'daily' ? `${t('common.daily')}` : t('transactions.categories')}
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
              contentContainerStyle={localStyles.scrollContentContainer}
              accessible={false}
            >
              {/* Contenedor con ancho fijo para 7 columnas */}
              <View style={{ width: GRID_WIDTH }}>
                {/* Fila de días de la semana */}
                <View style={localStyles.weekDaysRow} accessible={false}>
                  {weekDaysShort[language].map((d, i) => (
                    <View key={i} style={{ width: CELL_SIZE, alignItems: 'center' }}>
                      <Text
                        style={[localStyles.weekDayText, { color: colors.textSecondary }]}
                        importantForAccessibility="no"
                        maxFontSizeMultiplier={1.5}
                      >
                        {d}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Grid de días - SIEMPRE 7 COLUMNAS */}
                <View style={localStyles.gridWrap} accessible={false}>
                  {gridData.map((cell: any, index: number) => {
                    // Celdas vacías
                    if (cell === null) return (
                      <View
                        key={`blank-${index}`}
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                        importantForAccessibility="no"
                      />
                    );

                    return (
                      <TouchableOpacity
                        key={`day-${cell.day}-${index}`}
                        activeOpacity={0.7}
                        onPress={() => handleCellPress({
                          value: cell.amount,
                          label: `${format(localSelectedDay, 'MMM', { locale: language === 'es' ? es : language === 'pt' ? pt : enGB })} ${cell.day}`,
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
                        accessibilityRole="button"
                        accessibilityLabel={`${cell.day}, ${currencySymbol} ${cell.amount.toFixed(0)}`}
                        accessibilityHint={`${t('common.tapForDetails')}`}
                      >
                        <Text 
                          style={[
                            localStyles.cellText, 
                            { 
                              color: cell.amount > (maxValue * 0.4) ? '#FFF' : colors.textSecondary,
                            }
                          ]}
                          maxFontSizeMultiplier={1.5}
                          adjustsFontSizeToFit
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

          {/* VISTA AÑO */}
          {viewMode === 'year' && (
            <View style={localStyles.gridWrapYear} accessible={false}>
              {gridData.map((cell: any, index: number) => (
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
                  accessibilityRole="button"
                  accessibilityLabel={`${cell.label}, ${currencySymbol} ${cell.amount.toFixed(0)}`}
                  accessibilityHint={`${t('common.tapForDetails')}`}
                >
                  <Text
                    style={[
                      localStyles.yearCellText,
                      { 
                        color: cell.amount > (maxValue * 0.4) ? '#FFF' : colors.textSecondary,
                      }
                    ]}
                    maxFontSizeMultiplier={1.5}
                    adjustsFontSizeToFit
                  >
                    {cell.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 2. CATEGORY MATRIX VIEW */}
      {heatmapType === 'category' && categoryData && (
        <View style={localStyles.catContainer}>
          <View style={[localStyles.catFixedColumn, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
            <View style={localStyles.catHeaderPlaceholder}>
              <Text style={[localStyles.catHeaderLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                {t('transactions.categories')}
              </Text>
            </View>
            {categoryData.map((cat, i) => (
              <View key={`cat-${i}`} style={localStyles.catNameRow} accessible={true} accessibilityLabel={cat.category}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[localStyles.catLabel, { color: colors.text }]}
                  maxFontSizeMultiplier={1.3}
                >
                  {t(`icons.${cat.category}`, cat.category)}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ paddingLeft: 4 }}>
              <View style={localStyles.catDateHeaderRow}>
                {categoryData.length > 0 && categoryData[0].data.map((d: any, i: number) => (
                  <View key={`header-${i}`} style={localStyles.catHeaderCell}>
                    <Text style={[localStyles.catColHeader, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.2}>
                      {d.label.substring(0, 3)}
                    </Text>
                  </View>
                ))}
              </View>

              {categoryData.map((cat, i) => (
                <View key={`row-${i}`} style={localStyles.catDataRow}>
                  {cat.data.map((cell: any, j: number) => (
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
                      accessibilityRole="button"
                      accessibilityLabel={`${cat.category} ${cell.label}: ${currencySymbol}${cell.amount}`}
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* LEGEND SCALE */}
      <View style={[localStyles.legend, { borderTopColor: colors.border }]} accessible={true} accessibilityLabel="Legend scale">
        <Text style={[localStyles.legendLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
          {t('common.low')}
        </Text>
        <View style={localStyles.scaleBar} importantForAccessibility="no">
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((v, i) => (
            <View key={i} style={[localStyles.scaleDot, { backgroundColor: getHeatColor(maxValue * v) }]} />
          ))}
        </View>
        <Text style={[localStyles.legendLabel, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
          {t('common.hight')}
        </Text>
      </View>

      {/* DETAIL MODAL */}
      <Modal
        visible={!!selectedCell}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
        accessibilityViewIsModal={true}
      >
        <TouchableOpacity 
          style={localStyles.modalOverlay} 
          activeOpacity={1} 
          onPress={handleCloseModal}
        >
          <Animated.View 
            entering={ZoomIn.duration(300)}
            style={[localStyles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[localStyles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={localStyles.modalHeaderLeft}>
                <Text style={[localStyles.modalTitle, { color: colors.text }]} maxFontSizeMultiplier={1.3}>
                  {t(`icons.${selectedCell?.label}`, selectedCell?.label || '')}
                </Text>
                <Text style={[localStyles.modalSub, { color: colors.textSecondary }]} maxFontSizeMultiplier={1.3}>
                  {selectedCell?.subLabel}
                </Text>
              </View>
              <Text style={[localStyles.modalAmount, { color: colors.expense }]} maxFontSizeMultiplier={1.3}>
                {currencySymbol}{selectedCell?.value.toFixed(2)}
              </Text>
            </View>

            <ScrollView style={localStyles.txScrollView} showsVerticalScrollIndicator={false}>
              {selectedCell?.transactions && selectedCell.transactions.length > 0 ? (
                selectedCell.transactions.map(renderTransaction)
              ) : (
                  <Text style={[localStyles.noTx, { color: colors.textSecondary }]}>
                    {t('transactions.noTransactions')}
                  </Text>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              onPress={handleCloseModal}
              style={[localStyles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={[localStyles.closeText, { color: colors.text }]} maxFontSizeMultiplier={1.3}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

    </Animated.View>
  );
}

// ESTILOS LOCALES
const localStyles = StyleSheet.create({
  header: { marginBottom: 16 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  iconTitle: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', lineHeight: 30 },
  subtitle: { fontSize: 14, marginTop: 2, lineHeight: 18 },
  totalBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  totalText: { fontSize: 18, fontWeight: 'bold', lineHeight: 22 },
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
  toggleText: { fontSize: 14, fontWeight: '600', lineHeight: 18 },

  // GRID CON 7 COLUMNAS FIJAS
  gridContainer: { marginBottom: 20 },
  scrollContentContainer: {
    paddingHorizontal: 4,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    width: GRID_WIDTH,
  },
  weekDayText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP_SIZE,
    width: GRID_WIDTH,
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
    lineHeight: 18 
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

  // CATEGORIES
  catContainer: { flexDirection: 'row', marginBottom: 20 },
  catFixedColumn: { borderRightWidth: 1, paddingRight: 8, minWidth: 70, maxWidth: 120 },
  catHeaderPlaceholder: { height: 40, justifyContent: 'center', paddingHorizontal: 4 },
  catHeaderLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  catNameRow: { height: MINI_CELL_SIZE + GAP_SIZE, justifyContent: 'center', paddingHorizontal: 4 },
  catLabel: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  catDateHeaderRow: { flexDirection: 'row', gap: GAP_SIZE, marginBottom: GAP_SIZE },
  catHeaderCell: { width: MINI_CELL_SIZE, height: 40, justifyContent: 'center', alignItems: 'center' },
  catColHeader: { fontSize: 10, fontWeight: '300', lineHeight: 14 },
  catDataRow: { flexDirection: 'row', gap: GAP_SIZE, marginBottom: GAP_SIZE },
  miniCell: { width: MINI_CELL_SIZE, height: MINI_CELL_SIZE, borderRadius: 4, minHeight: 24, minWidth: 24 },

  // LEGEND
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  legendLabel: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  scaleBar: { flexDirection: 'row', gap: 6 },
  scaleDot: { width: 20, height: 20, borderRadius: 4 },

  // MODAL
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalHeaderLeft: { flex: 1, marginRight: 12 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', lineHeight: 24 },
  modalSub: { fontSize: 14, marginTop: 2, lineHeight: 18 },
  modalAmount: { fontSize: 18, fontWeight: '600', lineHeight: 22 },
  txScrollView: { flexGrow: 0, maxHeight: 250, marginBottom: 12 },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',  
  },
  txName: { fontSize: 14, flex: 1, marginRight: 8, lineHeight: 18 },
  txVal: { fontSize: 14, fontWeight: '600', lineHeight: 18 },
  noTx: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', marginTop: 20, lineHeight: 18 },
  closeBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeText: { fontSize: 16, fontWeight: '600', lineHeight: 20 },
});