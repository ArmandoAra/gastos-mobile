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
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Transaction } from '../../../interfaces/data.interface';


interface ExpenseHeatmapProps {
  transactions: Transaction[];
  viewMode: 'year' | 'month';
  year: number;
  month?: number;
  heatmapType?: 'daily' | 'category';
}

// Constantes
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Abreviados para móvil

// Colores (Simulando Slate Dark)
const COLORS = {
  bg: '#1e293b',
  cardBg: '#0f172a',
  border: '#334155',
  text: '#FFFFFF',
  textMuted: '#94a3b8',
  emptyCell: '#1e293b',
  cellBorder: 'rgba(148, 163, 184, 0.2)',
};

export default function ExpenseHeatmapMobile({
  transactions,
  viewMode,
  year,
  month,
  heatmapType: initialType = 'daily'
}: ExpenseHeatmapProps) {
  
  const [heatmapType, setHeatmapType] = useState(initialType);
  const [selectedCell, setSelectedCell] = useState<{
    value: number;
    label: string;
    date?: string;
    transactions?: Transaction[];
  } | null>(null);

  // --- Lógica de Negocio (Idéntica a Web) ---

  const maxValue = useMemo(() => {
    const amounts = transactions.filter(t => t.type === 'expense').map(t => t.amount);
    return Math.max(...amounts, 1);
  }, [transactions]);

  const getHeatColor = (amount: number) => {
    if (amount === 0) return COLORS.emptyCell;
    const intensity = Math.min(amount / (maxValue * 0.7), 1);
    
    // Devolvemos HEX o RGBA string
    if (intensity < 0.25) return `rgba(59, 130, 246, ${0.3 + intensity * 2})`; // Azul
    if (intensity < 0.5) return `rgba(251, 191, 36, ${0.4 + intensity})`; // Amarillo
    if (intensity < 0.75) return `rgba(249, 115, 22, ${0.5 + intensity})`; // Naranja
    return `rgba(239, 68, 68, ${0.6 + intensity * 0.4})`; // Rojo
  };

  const monthlyHeatmapData = useMemo(() => {
    if (viewMode !== 'month' || !month) return null;
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const weeks: Array<Array<{ day: number; amount: number; transactions: Transaction[]; date: Date; } | null>> = [];
    let currentWeek: typeof weeks[0] = [];
    
    for (let i = 0; i < firstDay; i++) currentWeek.push(null);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && txDate.getDate() === day && txDate.getMonth() === month - 1 && txDate.getFullYear() === year;
      });
      const amount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      currentWeek.push({ day, amount, transactions: dayTransactions, date });
      
      if (date.getDay() === 6 || day === daysInMonth) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    return weeks;
  }, [transactions, viewMode, year, month]);

  const categoryHeatmapData = useMemo(() => {
    const categories = Array.from(new Set(transactions.filter(t => t.type === 'expense').map(t => t.category_name)));
    if (viewMode === 'year') {
      return categories.map(category => {
        const data = Array.from({ length: 12 }, (_, monthIdx) => {
          const txs = transactions.filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && t.category_name === category && d.getMonth() === monthIdx && d.getFullYear() === year;
          });
          return { month: monthIdx, amount: txs.reduce((a, b) => a + b.amount, 0), transactions: txs };
        });
        return { category, data };
      });
    } else if (month) {
      const daysInMonth = new Date(year, month, 0).getDate();
      return categories.map(category => {
        const data = Array.from({ length: daysInMonth }, (_, dayIdx) => {
          const day = dayIdx + 1;
          const txs = transactions.filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && t.category_name === category && d.getDate() === day && d.getMonth() === month - 1 && d.getFullYear() === year;
          });
          return { day, amount: txs.reduce((a, b) => a + b.amount, 0), transactions: txs };
        });
        return { category, data };
      });
    }
    return [];
  }, [transactions, viewMode, year, month]);

  const stats = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((a, b) => a + b.amount, 0);
    
    const daily: Record<string, number> = {};
    expenses.forEach(t => daily[new Date(t.date).toDateString()] = (daily[new Date(t.date).toDateString()] || 0) + t.amount);
    const maxDay = Object.entries(daily).reduce((max, [d, a]) => a > max.amount ? { date: d, amount: a } : max, { date: '', amount: 0 });

    const cats: Record<string, number> = {};
    expenses.forEach(t => cats[t.category_name] = (cats[t.category_name] || 0) + t.amount);
    const maxCat = Object.entries(cats).reduce((max, [c, a]) => a > max.amount ? { category: c, amount: a } : max, { category: '', amount: 0 });

    const daysCount = new Set(expenses.map(t => new Date(t.date).toDateString())).size;
    return { total, maxDay, maxCat, avgPerDay: daysCount > 0 ? total / daysCount : 0 };
  }, [transactions]);


  // --- Render ---

  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <LinearGradient colors={['#f97316', '#dc2626']} style={styles.iconBox}>
            <MaterialIcons name="local-fire-department" size={24} color="white" />
          </LinearGradient>
          <View>
            <Text style={styles.title}>Heatmap 🔥</Text>
            <Text style={styles.subtitle}>{viewMode === 'year' ? `${year} Full` : `${MONTHS_SHORT[month! - 1]} ${year}`}</Text>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <TouchableOpacity 
            style={[styles.toggleBtn, heatmapType === 'daily' && styles.toggleBtnActive]} 
            onPress={() => setHeatmapType('daily')}
          >
             {heatmapType === 'daily' && <LinearGradient colors={['#f97316', '#dc2626']} style={StyleSheet.absoluteFill} />}
             <Text style={[styles.toggleText, heatmapType === 'daily' && styles.textWhite]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, heatmapType === 'category' && styles.toggleBtnActive]}
            onPress={() => setHeatmapType('category')}
          >
             {heatmapType === 'category' && <LinearGradient colors={['#f97316', '#dc2626']} style={StyleSheet.absoluteFill} />}
             <Text style={[styles.toggleText, heatmapType === 'category' && styles.textWhite]}>Category</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* STATS GRID */}
      <View style={styles.statsGrid}>
        <StatCard label="Total" value={`$${stats.total.toFixed(0)}`} color="#3b82f6" icon="attach-money" />
        <StatCard label="Hottest Day" value={`$${stats.maxDay.amount.toFixed(0)}`} sub={stats.maxDay.date ? new Date(stats.maxDay.date).getDate() : '-'} color="#ef4444" icon="calendar-today" />
        <StatCard label="Top Cat" value={stats.maxCat.category} sub={`$${stats.maxCat.amount.toFixed(0)}`} color="#a855f7" icon="category" />
        <StatCard label="Avg/Day" value={`$${stats.avgPerDay.toFixed(0)}`} color="#10b981" icon="show-chart" />
      </View>

      {/* HEATMAP - DAILY VIEW */}
      {heatmapType === 'daily' && viewMode === 'month' && monthlyHeatmapData && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
          <View style={styles.calendarGrid}>
            {/* Header Días */}
            <View style={styles.weekRow}>
              {DAYS_OF_WEEK.map((d, i) => (
                <Text key={i} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>
            
            {/* Semanas */}
            {monthlyHeatmapData.map((week, wIdx) => (
              <View key={wIdx} style={styles.weekRow}>
                {week.map((cell, dIdx) => (
                  <TouchableOpacity
                    key={`${wIdx}-${dIdx}`}
                    activeOpacity={0.8}
                    onPress={() => {
                        if (cell) setSelectedCell({
                            value: cell.amount,
                            label: `Day ${cell.day}`,
                            date: cell.date.toLocaleDateString(),
                            transactions: cell.transactions
                        });
                    }}
                    style={[
                      styles.cell, 
                      { 
                        backgroundColor: cell ? getHeatColor(cell.amount) : 'transparent',
                        borderColor: cell ? COLORS.cellBorder : 'transparent',
                        borderWidth: cell ? 1 : 0
                      }
                    ]}
                  >
                    {cell && <Text style={styles.cellText}>{cell.day}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* HEATMAP - CATEGORY VIEW */}
      {heatmapType === 'category' && categoryHeatmapData.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.scrollContainer}>
          <View>
             {/* Header Columnas */}
            <View style={[styles.categoryRow, { marginBottom: 8 }]}>
                <View style={styles.categoryLabelContainer}><Text style={styles.headerText}>Category</Text></View>
                {viewMode === 'year' 
                  ? MONTHS_SHORT.map(m => <Text key={m} style={styles.colHeader}>{m}</Text>)
                  : Array.from({ length: 15 }, (_, i) => <Text key={i} style={styles.colHeader}>{i+1}</Text>) // Solo muestra primeros 15 para no saturar ejemplo
                } 
                {/* Nota: En app real, esto debería scrollear o ser más ancho */}
            </View>

            {categoryHeatmapData.map((cat, idx) => (
              <View key={idx} style={styles.categoryRow}>
                 <View style={styles.categoryLabelContainer}>
                    <Text numberOfLines={1} style={styles.categoryLabel}>{cat.category}</Text>
                 </View>
                 {cat.data.map((cell: any, cIdx: number) => (
                   <TouchableOpacity
                      key={cIdx}
                      onPress={() => setSelectedCell({
                          value: cell.amount,
                          label: cat.category,
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
      )}

      {/* HEAT SCALE LEGEND */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendText}>Low</Text>
        <View style={styles.scaleBar}>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((i, idx) => (
                <View key={idx} style={[styles.scaleStep, { backgroundColor: getHeatColor(maxValue * i) }]} />
            ))}
        </View>
        <Text style={styles.legendText}>High</Text>
      </View>

      {/* MODAL DETAILS (Reemplazo del Tooltip) */}
      <Modal
        visible={!!selectedCell}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCell(null)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <View>
                        <Text style={styles.modalTitle}>{selectedCell?.label}</Text>
                        <Text style={styles.modalSubtitle}>{selectedCell?.date}</Text>
                    </View>
                    <Text style={styles.modalAmount}>${selectedCell?.value.toFixed(2)}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <ScrollView style={{ maxHeight: 200 }}>
                    {selectedCell?.transactions?.map((t, i) => (
                        <View key={i} style={styles.txRow}>
                            <Text style={styles.txDesc} numberOfLines={1}>{t.description}</Text>
                            <Text style={styles.txAmount}>${t.amount.toFixed(2)}</Text>
                        </View>
                    ))}
                    {(!selectedCell?.transactions || selectedCell.transactions.length === 0) && (
                        <Text style={styles.noTxText}>No transactions</Text>
                    )}
                </ScrollView>
                
                <TouchableOpacity onPress={() => setSelectedCell(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </Animated.View>
  );
}

// Subcomponente de Estadística
const StatCard = ({ label, value, sub, color, icon }: any) => (
    <View style={[styles.statCard, { borderColor: color + '40', backgroundColor: color + '15' }]}>
        <View style={styles.statHeader}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.statLabel, { color: color + 'dd' }]}>{label}</Text>
        </View>
        <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
        {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg,
    borderRadius: 24,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: { marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textMuted },
  toggleRow: { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: 10, padding: 3, alignSelf: 'flex-start' },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, overflow: 'hidden' },
  toggleBtnActive: {},
  toggleText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  textWhite: { color: 'white' },
  
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  statCard: { width: '48%', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statSub: { fontSize: 10, color: COLORS.textMuted },

  // Heatmap Daily
  scrollContainer: { marginBottom: 20 },
  calendarGrid: { alignSelf: 'center' }, // Centrar calendario
  weekRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  dayHeader: { width: 36, textAlign: 'center', color: COLORS.textMuted, fontSize: 10, fontWeight: 'bold' },
  cell: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontSize: 10, fontWeight: 'bold', color: 'white', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2 },

  // Heatmap Category
  categoryRow: { flexDirection: 'row', gap: 4, marginBottom: 4, alignItems: 'center' },
  categoryLabelContainer: { width: 80 },
  categoryLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  headerText: { color: COLORS.textMuted, fontSize: 10, fontWeight: 'bold' },
  colHeader: { width: 24, textAlign: 'center', color: COLORS.textMuted, fontSize: 8 },
  miniCell: { width: 24, height: 24, borderRadius: 4 },

  // Legend
  legendContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 16 },
  legendText: { fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase' },
  scaleBar: { flexDirection: 'row', gap: 2 },
  scaleStep: { width: 30, height: 12, borderRadius: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 320, backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  modalSubtitle: { fontSize: 12, color: COLORS.textMuted },
  modalAmount: { fontSize: 20, fontWeight: 'bold', color: '#10b981' },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  txRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  txDesc: { color: COLORS.textMuted, fontSize: 12, flex: 1, marginRight: 8 },
  txAmount: { color: 'white', fontSize: 12, fontWeight: '600' },
  noTxText: { color: COLORS.textMuted, fontSize: 12, fontStyle: 'italic', textAlign: 'center' },
  closeBtn: { marginTop: 16, backgroundColor: COLORS.border, padding: 10, borderRadius: 8, alignItems: 'center' },
  closeBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 }
});