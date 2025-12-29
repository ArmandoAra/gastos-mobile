import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInRight,
    FadeInLeft,
    Layout,
    ZoomIn
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart } from 'react-native-gifted-charts';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Transaction } from '../../../interfaces/data.interface';


interface DailyExpenseViewProps {
    transactions: Transaction[];
    year: number;
    month: number;
    day: number;
}

// --- Constantes ---
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CATEGORY_COLORS = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
    '#EF4444', '#06B6D4', '#F97316', '#6366F1', '#14B8A6'
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Colores Slate Dark Theme
const COLORS = {
    bg: '#1e293b',      // slate-800
    cardBg: '#334155',  // slate-700
    text: '#ffffff',
    textMuted: '#94a3b8',
    border: 'rgba(255,255,255,0.1)',
};

export default function DailyExpenseViewMobile({
    transactions,
    year,
    month,
    day
}: DailyExpenseViewProps) {

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'timeline' | 'categories'>('categories');

    // --- Lógica de Negocio (Igual que Web) ---
    const dailyTransactions = useMemo(() => {
        return transactions.filter(t => {
            const txDate = new Date(t.date);
            return txDate.getFullYear() === year &&
                txDate.getMonth() === month - 1 &&
                txDate.getDate() === day;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions, year, month, day]);

    const dateInfo = useMemo(() => {
        const date = new Date(year, month - 1, day);
        const dayIndex = date.getDay();
        return {
            dayOfWeek: DAYS_OF_WEEK[dayIndex],
            monthName: MONTHS_FULL[month - 1],
            isWeekend: dayIndex === 0 || dayIndex === 6,
            fullDate: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        };
    }, [year, month, day]);

    const stats = useMemo(() => {
        const expenses = dailyTransactions.filter(t => t.type === 'expense');
        const income = dailyTransactions.filter(t => t.type === 'income');
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - Math.abs(totalExpenses);

        const categoryTotals: Record<string, number> = {};
        expenses.forEach(t => {
            categoryTotals[t.category_name] = (categoryTotals[t.category_name] || 0) + t.amount;
        });

        const topCategory = Object.entries(categoryTotals).reduce(
            (max, [cat, amount]) => amount > max.amount ? { category: cat, amount } : max,
            { category: '', amount: 0 }
        );

        const largestTransaction = expenses.length > 0
            ? expenses.reduce((max, t) => t.amount > max.amount ? t : max)
            : null;

        return {
            totalExpenses, totalIncome, balance,
            expenseCount: expenses.length, incomeCount: income.length,
            topCategory, largestTransaction, categoryTotals
        };
    }, [dailyTransactions]);

    // Datos para Gifted Charts
    const pieData = useMemo(() => {
        return Object.entries(stats.categoryTotals).map(([name, value], index) => ({
            value,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            text: name, // Usado para lógica, no display directo en chart
            focused: selectedCategory === name
        }));
    }, [stats.categoryTotals, selectedCategory]);

    const transactionsByHour = useMemo(() => {
        const hourGroups: Record<number, Transaction[]> = {};
        dailyTransactions.forEach(t => {
            const hour = new Date(t.date).getHours();
            if (!hourGroups[hour]) hourGroups[hour] = [];
            hourGroups[hour].push(t);
        });
        return Object.entries(hourGroups)
            .map(([hour, txs]) => ({
                hour: parseInt(hour),
                transactions: txs,
                total: txs.reduce((sum, t) => sum + t.amount, 0)
            }))
            .sort((a, b) => a.hour - b.hour);
    }, [dailyTransactions]);

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // --- Render ---

    return (
        <Animated.View entering={FadeIn.duration(600)} style={styles.container}>

            {/* 1. Header de Fecha */}
            <View style={styles.headerContainer}>
                <View style={styles.headerRow}>
                    {/* Badge del Día */}
                    <View style={styles.dateBadgeContainer}>
                        <LinearGradient
                            colors={dateInfo.isWeekend ? ['#a855f7', '#db2777'] : ['#3b82f6', '#0891b2']}
                            style={styles.dateBadge}
                        >
                            <Text style={styles.badgeMonth}>{MONTHS_SHORT[month - 1]}</Text>
                            <Text style={styles.badgeDay}>{day}</Text>
                            <Text style={styles.badgeYear}>{year}</Text>
                        </LinearGradient>
                        {dateInfo.isWeekend && (
                            <View style={styles.weekendIcon}>
                                <Text style={{ fontSize: 10 }}>🎉</Text>
                            </View>
                        )}
                    </View>

                    {/* Texto de Info */}
                    <View style={styles.headerInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Ionicons name="calendar-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                            <Text style={styles.dayOfWeek}>{dateInfo.dayOfWeek}</Text>
                        </View>
                        <Text style={styles.fullDate}>{dateInfo.fullDate}</Text>
                        {dateInfo.isWeekend && (
                            <View style={styles.weekendTag}>
                                <Text style={styles.weekendTagText}>Weekend</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'timeline' && styles.toggleBtnActive]}
                        onPress={() => setViewMode('timeline')}
                    >
                        {viewMode === 'timeline' && <LinearGradient colors={['#3b82f6', '#06b6d4']} style={StyleSheet.absoluteFill} />}
                        <Text style={[styles.toggleText, viewMode === 'timeline' && styles.textWhite]}>Timeline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleBtn, viewMode === 'categories' && styles.toggleBtnActive]}
                        onPress={() => setViewMode('categories')}
                    >
                        {viewMode === 'categories' && <LinearGradient colors={['#3b82f6', '#06b6d4']} style={StyleSheet.absoluteFill} />}
                        <Text style={[styles.toggleText, viewMode === 'categories' && styles.textWhite]}>Categories</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 2. Stats Cards Grid */}
            <View style={styles.statsGrid}>
                <StatCard label="Expenses" value={`$${stats.totalExpenses.toFixed(0)}`} sub={`${stats.expenseCount} txs`} color="#ef4444" icon="arrow-down" />
                <StatCard label="Income" value={`$${stats.totalIncome.toFixed(0)}`} sub={`${stats.incomeCount} txs`} color="#10b981" icon="arrow-up" />
                <StatCard label="Balance" value={`${stats.balance >= 0 ? '+' : ''}${stats.balance.toFixed(0)}`} sub={stats.balance >= 0 ? 'Surplus' : 'Deficit'} color={stats.balance >= 0 ? '#3b82f6' : '#f97316'} icon="wallet" />
                <StatCard label="Top Cat" value={stats.topCategory.category || 'N/A'} sub={`$${stats.topCategory.amount.toFixed(0)}`} color="#a855f7" icon="pie-chart" />
            </View>

            {/* 3. Vistas Principales (Timeline vs Categories) */}
            <View style={styles.contentContainer}>
                {viewMode === 'timeline' ? (
                    <Animated.View entering={FadeInLeft} layout={Layout.springify()}>
                        {dailyTransactions.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <View>
                                {transactionsByHour.map((group, index) => (
                                    <View key={group.hour} style={styles.timelineGroup}>
                                        {/* Línea conectora */}
                                        {index !== transactionsByHour.length - 1 && <View style={styles.timelineLine} />}

                                        <View style={styles.timelineHeader}>
                                            <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.timeBadge}>
                                                <Text style={styles.timeText}>{group.hour.toString().padStart(2, '0')}:00</Text>
                                            </LinearGradient>
                                            <View>
                                                <Text style={styles.timelineSubHeader}>{group.transactions.length} txs • ${group.total.toFixed(2)}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.timelineCards}>
                                            {group.transactions.map(tx => (
                                                <TransactionCard key={tx.id} tx={tx} formatTime={formatTime} />
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInRight} layout={Layout.springify()}>
                        {dailyTransactions.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <View>
                                {/* Chart */}
                                <View style={styles.chartContainer}>
                                    <PieChart
                                        data={pieData}
                                        donut
                                        radius={80}
                                        innerRadius={60}
                                        centerLabelComponent={() => (
                                            <View style={{ alignItems: 'center' }}>
                                                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                                                    ${stats.totalExpenses.toFixed(0)}
                                                </Text>
                                                <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>Total</Text>
                                            </View>
                                        )}
                                    />
                                </View>

                                {/* Lista de Categorías */}
                                <View style={styles.categoryList}>
                                    <View style={styles.catHeader}>
                                        <Text style={styles.sectionTitle}>CATEGORY BREAKDOWN</Text>
                                        {selectedCategory && (
                                            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                                                <Text style={{ color: '#60a5fa', fontSize: 12, fontWeight: '600' }}>Clear</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {pieData.map((item, idx) => {
                                        const percentage = ((item.value / stats.totalExpenses) * 100).toFixed(1);
                                        const isSelected = selectedCategory === item.text;

                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                onPress={() => setSelectedCategory(isSelected ? null : (item.text || ''))}
                                                style={[styles.categoryRow, isSelected && styles.categoryRowSelected]}
                                            >
                                                <View style={styles.catRowTop}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                                        <Text style={styles.catName}>{item.text}</Text>
                                                    </View>
                                                    <Text style={styles.catValue}>${item.value.toFixed(2)}</Text>
                                                </View>
                                                <View style={styles.catProgressRow}>
                                                    <View style={styles.progressBarBg}>
                                                        <View
                                                            style={[
                                                                styles.progressBarFill,
                                                                {
                                                                    width: `${percentage}%` as `${number}%`,
                                                                    backgroundColor: item.color
                                                                }
                                                            ]}
                                                        />
                                                    </View>
                                                    <Text style={styles.catPercent}>{percentage}%</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                )}
            </View>

            {/* 4. Insights */}
            {dailyTransactions.length > 0 && (
                <Animated.View entering={ZoomIn.delay(200)} style={styles.insightsContainer}>
                    <Text style={styles.sectionTitle}>DAILY INSIGHTS</Text>
                    <View style={styles.insightsGrid}>
                        {stats.largestTransaction && (
                            <InsightCard
                                label="Largest Transaction"
                                title={stats.largestTransaction.description}
                                value={`$${stats.largestTransaction.amount.toFixed(2)}`}
                                color="#f97316"
                            />
                        )}
                        {dateInfo.isWeekend && (
                            <InsightCard
                                label="Weekend Spending"
                                title={`This ${dateInfo.dayOfWeek}`}
                                value={`$${stats.totalExpenses.toFixed(2)}`}
                                color="#db2777"
                            />
                        )}
                        {stats.balance < 0 && (
                            <InsightCard
                                label="Deficit Alert"
                                title="Expenses > Income"
                                value={`-$${Math.abs(stats.balance).toFixed(2)}`}
                                color="#ef4444"
                            />
                        )}
                    </View>
                </Animated.View>
            )}

        </Animated.View>
    );
}

// --- Subcomponentes ---

const StatCard = ({ label, value, sub, color, icon }: any) => (
    <View style={[styles.statCard, { borderColor: color + '40', backgroundColor: color + '15' }]}>
        <View style={styles.statHeader}>
            <Ionicons name={icon} size={14} color={color} style={{ marginRight: 4 }} />
            <Text style={[styles.statLabel, { color: color + 'dd' }]}>{label}</Text>
        </View>
        <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
        <Text style={styles.statSub}>{sub}</Text>
    </View>
);

const TransactionCard = ({ tx, formatTime }: any) => (
    <View style={[styles.txCard, { borderColor: tx.type === 'expense' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)' }]}>
        <View style={styles.txRow}>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={[styles.txBadge, { backgroundColor: tx.type === 'expense' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)' }]}>
                        <Text style={{ fontSize: 10, color: tx.type === 'expense' ? '#fca5a5' : '#6ee7b7', fontWeight: 'bold' }}>
                            {tx.category_name}
                        </Text>
                    </View>
                    <Text style={styles.txTime}>{formatTime(tx.date)}</Text>
                </View>
                <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.type === 'expense' ? '#f87171' : '#34d399' }]}>
                {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
            </Text>
        </View>
    </View>
);

const InsightCard = ({ label, title, value, color }: { label: string; title: string; value: string; color: string }) => (
    <View style={[styles.insightCard, { backgroundColor: color + '15', borderColor: color + '30' }]}>
        <Text style={[styles.insightLabel, { color }]}>{label}</Text>
        <Text style={styles.insightTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.insightValue}>{value}</Text>
    </View>
);

const EmptyState = () => (
    <View style={styles.emptyState}>
        <Ionicons name="moon" size={48} color={COLORS.textMuted} style={{ opacity: 0.5 }} />
        <Text style={styles.emptyTitle}>No transactions</Text>
        <Text style={styles.emptySub}>Enjoy your rest day! 😊</Text>
    </View>
);

// --- Estilos ---
const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.bg,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 20,
    },
    contentContainer: { marginBottom: 20 },
    headerContainer: { marginBottom: 20 },
    headerRow: { flexDirection: 'row', marginBottom: 16 },
    dateBadgeContainer: { marginRight: 16, position: 'relative' },
    dateBadge: {
        width: 72, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
        shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
    },
    badgeMonth: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    badgeDay: { color: 'white', fontSize: 28, fontWeight: '900', lineHeight: 32 },
    badgeYear: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' },
    weekendIcon: { position: 'absolute', top: -6, right: -6, backgroundColor: '#ec4899', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    headerInfo: { justifyContent: 'center' },
    dayOfWeek: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    fullDate: { color: COLORS.textMuted, fontSize: 12 },
    weekendTag: { marginTop: 6, backgroundColor: 'rgba(236,72,153,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(236,72,153,0.3)' },
    weekendTagText: { color: '#f9a8d4', fontSize: 10, fontWeight: '700' },

    // Toggle
    toggleContainer: { flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 4 },
    toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', overflow: 'hidden' },
    toggleBtnActive: {},
    toggleText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
    textWhite: { color: 'white' },

    // Stats Grid
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
    statCard: { width: '48%', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
    statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    statValue: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    statSub: { fontSize: 10, color: COLORS.textMuted },

    // Timeline
    timelineGroup: { position: 'relative', paddingLeft: 20, paddingBottom: 24 },
    timelineLine: { position: 'absolute', left: 22, top: 40, bottom: -10, width: 2, backgroundColor: COLORS.cardBg },
    timelineHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: -20 },
    timeBadge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, zIndex: 10 },
    timeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    timelineSubHeader: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
    timelineCards: { gap: 10 },

    txCard: { backgroundColor: 'rgba(51,65,85,0.5)', borderRadius: 12, padding: 12, borderWidth: 1 },
    txRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    txBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
    txTime: { color: COLORS.textMuted, fontSize: 10 },
    txDesc: { color: 'white', fontWeight: '500', fontSize: 14 },
    txAmount: { fontSize: 16, fontWeight: 'bold' },

    // Categories
    chartContainer: { alignItems: 'center', marginBottom: 20 },
    categoryList: { gap: 8 },
    catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1 },
    categoryRow: { backgroundColor: 'rgba(51,65,85,0.4)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
    categoryRowSelected: { backgroundColor: COLORS.cardBg, borderColor: '#3b82f6' },
    catRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    colorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    catName: { color: 'white', fontWeight: '600', fontSize: 14 },
    catValue: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    catProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    progressBarBg: { flex: 1, height: 6, backgroundColor: '#475569', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    catPercent: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', width: 32, textAlign: 'right' },

    // Insights
    insightsContainer: { marginTop: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
    insightsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    insightCard: { width: '48%', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
    insightLabel: { fontSize: 10, fontWeight: '700', marginBottom: 2 },
    insightTitle: { color: COLORS.textMuted, fontSize: 12, marginBottom: 2 },
    insightValue: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    emptyState: { alignItems: 'center', padding: 30 },
    emptyTitle: { color: COLORS.textMuted, fontWeight: '600', marginTop: 10 },
    emptySub: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
});