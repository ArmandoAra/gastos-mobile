import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    Platform
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInRight,
    ZoomIn
} from 'react-native-reanimated';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORY_COLORS, MONTHS, WEEKDAYS } from '../../../constants/date';
import { ViewPeriod } from '../../../interfaces/date.interface';
import useDateStore from '../../../stores/useDateStore';
import useDataStore from '../../../stores/useDataStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import { darkTheme, lightTheme } from '../../../theme/colors';
import { useAuthStore } from '../../../stores/authStore';

interface DailyExpenseViewProps {
    currentPeriod: ViewPeriod;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 420;
const isTablet = SCREEN_WIDTH >= 768;

export default function DailyExpenseViewMobile({
    currentPeriod
}: DailyExpenseViewProps) {
    const { theme } = useSettingsStore();
    const colors = theme === 'dark' ? darkTheme : lightTheme;

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { localSelectedDay } = useDateStore();
    const { transactions } = useDataStore();
    const { currencySymbol } = useAuthStore();

    // Extraer componentes de fecha
    const year = localSelectedDay.getFullYear();
    const month = localSelectedDay.getMonth() + 1;
    const day = localSelectedDay.getDate();

    // Filtrar transacciones según período
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const txDate = new Date(t.date);

            switch (currentPeriod) {
                case 'day':
                    return txDate.getFullYear() === year &&
                        txDate.getMonth() === month - 1 &&
                        txDate.getDate() === day;

                case 'week': {
                    const startOfWeek = new Date(localSelectedDay);
                    startOfWeek.setDate(localSelectedDay.getDate() - localSelectedDay.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);

                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    endOfWeek.setHours(23, 59, 59, 999);

                    return txDate >= startOfWeek && txDate <= endOfWeek;
                }

                case 'month':
                    return txDate.getFullYear() === year &&
                        txDate.getMonth() === month - 1;

                case 'year':
                    return txDate.getFullYear() === year;

                default:
                    return true;
            }
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions, localSelectedDay, currentPeriod, year, month, day]);

    // Info de fecha
    const dateInfo = useMemo(() => {
        const dayIndex = localSelectedDay.getDay();
        const isWeekend = dayIndex === 0 || dayIndex === 6;

        return {
            dayOfWeek: WEEKDAYS[dayIndex],
            monthName: MONTHS[localSelectedDay.getMonth()],
            isWeekend,
            periodLabel: currentPeriod.charAt(0).toUpperCase() + currentPeriod.slice(1)
        };
    }, [localSelectedDay, currentPeriod]);

    // Estadísticas
    const stats = useMemo(() => {
        const expenses = filteredTransactions.filter(t => t.type === 'expense');
        const income = filteredTransactions.filter(t => t.type === 'income');
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
    }, [filteredTransactions]);

    // Datos para PieChart
    const pieData = useMemo(() => {
        return Object.entries(stats.categoryTotals).map(([name, value], index) => ({
            value,
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            text: name,
            focused: selectedCategory === name
        }));
    }, [stats.categoryTotals, selectedCategory]);

    // Calcular tamaño del PieChart según pantalla
    const pieRadius = isSmallScreen ? 120 : isTablet ? 140 : 85;
    const pieInnerRadius = isSmallScreen ? 50 : isTablet ? 80 : 60;

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
            <Animated.View
                entering={FadeIn.duration(600)}
                style={[
                    styles.container,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isTablet && styles.containerTablet
                ]}
            >

                {/* STATS GRID */}
                <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
                    <StatCard
                        label="Expenses"
                        value={`-${currencySymbol} ${stats.totalExpenses.toFixed(0)}`}
                        sub={`${stats.expenseCount} txs`}
                        colorBgAndHeader={colors.expense}
                        colorText={colors.text}
                        colorSubText={colors.textSecondary}
                        colorBorder={colors.border}
                        icon="arrow-down"
                        isTablet={isTablet}
                    />
                    <StatCard
                        label="Income"
                        value={`${currencySymbol} ${stats.totalIncome.toFixed(0)}`}
                        sub={`${stats.incomeCount} txs`}
                        colorBgAndHeader={colors.income}
                        colorText={colors.text}
                        colorSubText={colors.textSecondary}
                        colorBorder={colors.border}
                        icon="arrow-up"
                        isTablet={isTablet}
                    />
                    <StatCard
                        label="Balance"
                        value={`${stats.balance >= 0 ? '+' : '-'}${currencySymbol} ${Math.abs(stats.balance).toFixed(0)}`}
                        sub={stats.balance >= 0 ? 'Surplus' : 'Deficit'}
                        colorBgAndHeader={stats.balance >= 0 ? colors.accent : colors.warning}
                        colorText={colors.text}
                        colorSubText={colors.textSecondary}
                        colorBorder={colors.border}
                        icon="wallet"
                        isTablet={isTablet}
                    />
                    <StatCard
                        label="Top Cat"
                        value={stats.topCategory.category || 'N/A'}
                        sub={`$${stats.topCategory.amount.toFixed(0)}`}
                        colorBgAndHeader={colors.accentSecondary}
                        colorText={colors.text}
                        colorSubText={colors.textSecondary}
                        colorBorder={colors.border}
                        icon="pie-chart"
                        isTablet={isTablet}
                    />
                </View>

                {/* CONTENT */}
                <View style={styles.contentContainer}>
                    <Animated.View entering={FadeInRight.duration(300)}>
                        {filteredTransactions.length === 0 ? (
                            <EmptyState period={dateInfo.periodLabel} color={colors.textSecondary} />
                        ) : (
                            <View>
                                {/* PieChart */}
                                <View style={[styles.chartContainer]}>
                                    <PieChart
                                        data={pieData}
                                        donut
                                        radius={pieRadius}
                                        innerRadius={pieInnerRadius}
                                        innerCircleColor={colors.surface}
                                        centerLabelComponent={() => (
                                            <View style={{ alignItems: 'center' }}>
                                                <Text style={[
                                                    styles.chartCenterValue,
                                                    { color: colors.text },
                                                    isSmallScreen && styles.chartCenterValueSmall
                                                ]}>
                                                    -{currencySymbol} {stats.totalExpenses.toFixed(0)}
                                                </Text>
                                                <Text style={[styles.chartCenterLabel, { color: colors.text }]}>Total</Text>
                                                <Text style={[{ fontSize: isSmallScreen ? 8 : 10, color: colors.textSecondary }]}>Expenses</Text>
                                            </View>
                                        )}
                                    />
                                </View>

                                {/* Lista de Categorías */}
                                <View style={styles.categoryList}>
                                    <View style={styles.catHeader}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>CATEGORY BREAKDOWN</Text>
                                    </View>

                                    {pieData.map((item, idx) => {
                                        const percentage = ((item.value / stats.totalExpenses) * 100).toFixed(1);

                                        return (
                                            <View
                                                key={idx}
                                                style={[
                                                    styles.categoryRow,
                                                    { borderColor: colors.border },
                                                ]}
                                            >
                                                <View style={styles.catRowTop}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                                        <Text style={[
                                                            styles.catName,
                                                            { color: colors.text },
                                                            isSmallScreen && styles.catNameSmall
                                                        ]}>
                                                            {item.text}
                                                        </Text>
                                                    </View>
                                                    <Text style={[
                                                        styles.catValue,
                                                        { color: colors.text },
                                                        isSmallScreen && styles.catValueSmall
                                                    ]}>
                                                        {currencySymbol}{item.value.toFixed(2)}
                                                    </Text>
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
                                                    <Text style={[styles.catPercent, { color: colors.text }]}>{percentage}%</Text>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </View>

                {/* INSIGHTS */}
                {filteredTransactions.length > 0 && (stats.largestTransaction || dateInfo.isWeekend || stats.balance < 0) && (
                    <Animated.View entering={ZoomIn.delay(200)} style={styles.insightsContainer}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>INSIGHTS</Text>
                        <View style={[styles.insightsGrid, isTablet && styles.insightsGridTablet]}>
                            {stats.largestTransaction && (
                                <InsightCard
                                    label="Largest Transaction"
                                    title={stats.largestTransaction.description}
                                    value={`-${currencySymbol} ${stats.largestTransaction.amount.toFixed(2)}`}
                                    color={colors.warning}
                                    isSmallScreen={isSmallScreen}
                                    amountColor={colors.text}
                                />
                            )}
                            {dateInfo.isWeekend && currentPeriod === 'day' && (
                                <InsightCard
                                    label="Weekend Spending"
                                    title={`This ${dateInfo.dayOfWeek}`}
                                    value={`${currencySymbol} ${stats.totalExpenses.toFixed(2)}`}
                                    color={colors.accentSecondary}
                                    isSmallScreen={isSmallScreen}
                                    amountColor={colors.text}
                                />
                            )}
                            {stats.balance < 0 && (
                                <InsightCard
                                    label="Deficit Alert"
                                    title="Expenses > Income"
                                    value={`-${currencySymbol} ${Math.abs(stats.balance).toFixed(2)}`}
                                    color={colors.error}
                                    isSmallScreen={isSmallScreen}
                                    amountColor={colors.text}
                                />
                            )}
                        </View>
                    </Animated.View>
                )}

            </Animated.View>
        </ScrollView>
    );
}

// SUBCOMPONENTES

interface StatCardProps {
    label: string;
    value: string;
    sub: string;
    colorBgAndHeader: string;
    colorText: string;
    colorSubText: string;
    colorBorder: string;
    icon: keyof typeof Ionicons.glyphMap;
    isTablet: boolean;
}

const StatCard = ({ label, value, sub, colorBgAndHeader, colorText, colorSubText, colorBorder, icon, isTablet }: StatCardProps) => (
    <View style={[
        styles.statCard,
        { borderColor: colorBorder, backgroundColor: colorBgAndHeader + '15' },
        isTablet && styles.statCardTablet
    ]}>
        <View style={styles.statHeader}>
            <Ionicons name={icon} size={isSmallScreen ? 12 : 14} color={colorBgAndHeader} style={{ marginRight: 4 }} />
            <Text style={[styles.statLabel, { color: colorBgAndHeader + 'dd' }, isSmallScreen && styles.statLabelSmall]}>
                {label}
            </Text>
        </View>
        <Text style={[styles.statValue, isSmallScreen && styles.statValueSmall, { color: colorText }]} numberOfLines={1}>
            {value}
        </Text>
        <Text style={[styles.statSub, isSmallScreen && styles.statSubSmall, { color: colorSubText }]}>{sub}</Text>
    </View>
);

interface InsightCardProps {
    label: string;
    title: string;
    value: string;
    color: string;
    isSmallScreen: boolean;
    amountColor?: string;
}

const InsightCard = ({ label, title, value, color, isSmallScreen, amountColor }: InsightCardProps) => (
    <View style={[
        styles.insightCard,
        { backgroundColor: color + '15', borderColor: color + '30' }
    ]}>
        <Text style={[styles.insightLabel, { color }, isSmallScreen && styles.insightLabelSmall]}>
            {label}
        </Text>
        <Text style={[styles.insightTitle, isSmallScreen && styles.insightTitleSmall, { color }]} numberOfLines={1}>
            {title}
        </Text>
        <Text style={[styles.insightValue, isSmallScreen && styles.insightValueSmall, { color: amountColor }]}>{value}</Text>
    </View>
);

const EmptyState = ({ period, color }: { period: string, color: string }) => (
    <View style={styles.emptyState}>
        <Ionicons name="moon" size={isSmallScreen ? 40 : 48} color={color} style={{ opacity: 0.5 }} />
        <Text style={[styles.emptyTitle, isSmallScreen && styles.emptyTitleSmall, { color }]}>
            No transactions this {period.toLowerCase()}
        </Text>
        <Text style={[styles.emptySub, isSmallScreen && styles.emptySubSmall, { color }]}>
            {period === 'Day' ? 'Enjoy your rest day! 😊' : 'Time to add some transactions'}
        </Text>
    </View>
);

// STYLES

const styles = StyleSheet.create({
    container: {
        borderRadius: isSmallScreen ? 16 : 20,
        padding: isSmallScreen ? 12 : 16,
        borderWidth: 0.5,
        marginHorizontal: 4,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
            },
            android: {
                elevation: 6,
            }
        }),
    },
    containerTablet: {
        maxWidth: 900,
        alignSelf: 'center',
        width: '100%',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: isSmallScreen ? 12 : 16,
        justifyContent: 'space-between',
        marginBottom: isSmallScreen ? 16 : 20,
    },
    statsGridTablet: {
        flexWrap: 'wrap',
        gap: isSmallScreen ? 12 : 16,
        justifyContent: 'center',
    },
    statCard: {
        flex: 1,
        padding: isSmallScreen ? 12 : 16,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: isSmallScreen ? 4 : 6,
        marginBottom: isSmallScreen ? 0 : 0,
        minWidth: isSmallScreen ? 120 : 100,
    },
    statCardTablet: {
        marginHorizontal: isSmallScreen ? 6 : 8,
        maxWidth: 200,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: isSmallScreen ? 11 : 12,
        fontWeight: '600',
    },
    statLabelSmall: {
        fontSize: 10,
    },
    statValue: {
        fontSize: isSmallScreen ? 18 : 20,
        fontWeight: '700',
    },
    statValueSmall: {
        fontSize: 16,
    },
    statSub: {
        fontSize: isSmallScreen ? 10 : 11,
        marginTop: 4,
    },
    statSubSmall: {
        fontSize: 9,
    },
    contentContainer: {
        marginBottom: isSmallScreen ? 16 : 20,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: isSmallScreen ? 20 : 24,
    },
    chartCenterValue: {
        fontSize: isSmallScreen ? 18 : 22,
        fontWeight: '500',
    },
    chartCenterValueSmall: {
        fontSize: 16,
    },
    chartCenterLabel: {
        fontSize: isSmallScreen ? 11 : 12,
        marginTop: 4,
    },
    categoryList: {
        marginTop: 8,
    },
    catHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: isSmallScreen ? 12 : 13,
        fontWeight: '300',
        letterSpacing: 0.5,
    },
    categoryRow: {
        paddingHorizontal: isSmallScreen ? 10 : 12,
        paddingVertical: isSmallScreen ? 8 : 10,
        borderBottomWidth: 0.5,
    },
    catRowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    colorDot: {
        width: isSmallScreen ? 10 : 12,
        height: isSmallScreen ? 10 : 12,
        borderRadius: 6,
        marginRight: 8,
    },
    catName: {
        fontSize: isSmallScreen ? 12 : 13,
        fontWeight: '600',
    },
    catNameSmall: {
        fontSize: 11,
    },
    catValue: {
        fontSize: isSmallScreen ? 12 : 13,
        fontWeight: '600',
    },
    catValueSmall: {
        fontSize: 11,
    },
    catProgressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBarBg: {
        flex: 1,
        height: isSmallScreen ? 6 : 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    catPercent: {
        fontSize: isSmallScreen ? 10 : 11,
        fontWeight: '600',
    },
    insightsContainer: {
        marginTop: isSmallScreen ? 16 : 20,
    },
    insightsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: isSmallScreen ? 12 : 16,
    },
    insightsGridTablet: {
        flexWrap: 'wrap',
        gap: isSmallScreen ? 12 : 16,
        justifyContent: 'center',
    },
    insightCard: {
        flex: 1,
        padding: isSmallScreen ? 12 : 16,
        borderRadius: 16,
        borderWidth: 1,
        marginHorizontal: isSmallScreen ? 4 : 6,
        marginBottom: isSmallScreen ? 0 : 0,
        minWidth: isSmallScreen ? 120 : 150,
    },
    insightLabel: {
        fontSize: isSmallScreen ? 11 : 12,
        fontWeight: '600',
    },
    insightLabelSmall: {
        fontSize: 10,
    },
    insightTitle: {
        fontSize: isSmallScreen ? 14 : 16,
        fontWeight: '700',
        marginVertical: 6,
    },
    insightTitleSmall: {
        fontSize: 13,
    },
    insightValue: {
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: '700',
    },
    insightValueSmall: {
        fontSize: 15,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: isSmallScreen ? 40 : 48,
    },
    emptyTitle: {
        fontSize: isSmallScreen ? 16 : 18,
        fontWeight: '700',
        marginTop: 12,
    },
    emptyTitleSmall: {
        fontSize: 15,
    },
    emptySub: {
        fontSize: isSmallScreen ? 12 : 13,
        marginTop: 6,
    },
    emptySubSmall: {
        fontSize: 11,
    },
});