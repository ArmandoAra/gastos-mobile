// ============================================
// STYLES
// ============================================

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#6200EE',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  balanceItemAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAll: {
    color: '#6200EE',
    fontSize: 14,
  },
  accountCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginLeft: 16,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountIconText: {
    fontSize: 24,
  },
  accountName: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#757575',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#757575',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#6200EE',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#6200EE',
  },
  filterText: {
    fontSize: 14,
    color: '#757575',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  transactionsList: {
    flex: 1,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  dateHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textTransform: 'capitalize',
  },
  dateHeaderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: 'white',
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: '#6200EE',
  },
  periodText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  categoryLegend: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#757575',
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heatmapCell: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  heatmapDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#757575',
  },
  navTextActive: {
    color: '#6200EE',
    fontWeight: '600',
  },
  periodTextActive: {
    color: 'white',
    fontWeight: '700',
  },

  

  legendTextBold: {
    fontSize: 13,
    color: '#424242',
    fontWeight: '600',
  },

 

  heatmapDayLight: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9E9E9E',
  },


  statValueSecondary: {
    fontSize: 18,
    fontWeight: '700',
    color: '#424242',
  },
});

// Tipos de fuentes para mejor organización
export const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
} as const;

// Tamaños de fuente consistentes
export const fontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
} as const;

// Colores del dashboard
export const dashboardColors = {
  primary: '#6200EE',
  primaryLight: '#7C4DFF',
  primaryDark: '#4B00C3',
  
  text: {
    primary: '#000000',
    secondary: '#757575',
    disabled: '#9E9E9E',
    inverse: '#FFFFFF',
  },
  
  charts: {
    expense: '#EF5350',
    income: '#66BB6A',
    bar1: '#42A5F5',
    bar2: '#FFA726',
    bar3: '#AB47BC',
    bar4: '#26C6DA',
  },
  
  heatmap: {
    low: 'rgba(239, 83, 80, 0.1)',
    medium: 'rgba(239, 83, 80, 0.5)',
    high: 'rgba(239, 83, 80, 0.8)',
    intense: 'rgba(239, 83, 80, 1)',
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    card: '#FFFFFF',
  },
} as const;

// Ejemplo de uso completo
export const dashboardFullStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dashboardColors.background.secondary,
  },
  
  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: dashboardColors.background.primary,
  },
  
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: dashboardColors.background.secondary,
    alignItems: 'center',
  },
  
  periodBtnActive: {
    backgroundColor: dashboardColors.primary,
  },
  
  periodText: {
    fontSize: fontSizes.base,
    color: dashboardColors.text.secondary,
    fontWeight: fontWeights.semiBold,
  },
  
  periodTextActive: {
    color: dashboardColors.text.inverse,
    fontWeight: fontWeights.bold,
  },
  
  // Chart Container
  chartContainer: {
    backgroundColor: dashboardColors.background.card,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  chartTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: dashboardColors.text.primary,
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  
  // Legend
  categoryLegend: {
    marginTop: 16,
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  
  legendText: {
    fontSize: fontSizes.sm,
    color: dashboardColors.text.secondary,
    fontWeight: fontWeights.medium,
  },
  
  legendTextBold: {
    fontSize: fontSizes.sm,
    color: dashboardColors.text.primary,
    fontWeight: fontWeights.semiBold,
  },
  
  // Heatmap
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  
  heatmapCell: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  
  heatmapDay: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    color: dashboardColors.text.primary,
  },
  
  heatmapDayLight: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: dashboardColors.text.disabled,
  },
  
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: dashboardColors.background.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statLabel: {
    fontSize: fontSizes.sm,
    color: dashboardColors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: fontWeights.medium,
  },
  
  statValue: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    color: dashboardColors.primary,
  },
  
  statValueSecondary: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: dashboardColors.text.primary,
  },
  
  statChange: {
    fontSize: fontSizes.xs,
    marginTop: 4,
    fontWeight: fontWeights.medium,
  },
  
  statChangePositive: {
    color: dashboardColors.charts.income,
  },
  
  statChangeNegative: {
    color: dashboardColors.charts.expense,
  },
});

export default dashboardFullStyles;