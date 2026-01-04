import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet
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
import { isTablet, styles } from './styles';
import { StatCard } from './subcomponents/StatsCard';
import { InsightCard } from './subcomponents/InsightCard';
import { EmptyState } from './subcomponents/EmptyState';

interface DailyExpenseViewProps {
    currentPeriod: ViewPeriod;
}

interface CategoryModalData {
    categoryName: string;
    totalAmount: number;
    color: string;
    transactions: any[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 420;

export default function DailyExpenseViewMobile({
    currentPeriod
}: DailyExpenseViewProps) {
    const { theme } = useSettingsStore();
    const colors = theme === 'dark' ? darkTheme : lightTheme;

    // Estado para selección visual y modal
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState<CategoryModalData | null>(null);

    const { localSelectedDay } = useDateStore();
    const { transactions } = useDataStore();
    const { currencySymbol } = useAuthStore();

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
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Ordenar descendente para el modal
    }, [transactions, localSelectedDay, currentPeriod, year, month, day]);

    // Info de fecha
    const dateInfo = useMemo(() => {
        const dayIndex = localSelectedDay.getDay();
        return {
            dayOfWeek: WEEKDAYS[dayIndex],
            monthName: MONTHS[localSelectedDay.getMonth()],
            isWeekend: dayIndex === 0 || dayIndex === 6,
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
            topCategory, largestTransaction, categoryTotals,
            expensesList: expenses // Guardamos la lista completa de gastos para el modal
        };
    }, [filteredTransactions]);

    // --- MANEJO DE SELECCIÓN ---
    const handleCategorySelect = (categoryName: string, totalValue: number, color: string) => {
        // 1. Resaltar visualmente (Chart y Lista)
        setSelectedCategory(categoryName);

        // 2. Preparar datos para el modal
        const categoryTransactions = stats.expensesList.filter(
            t => t.category_name === categoryName
        );

        setModalData({
            categoryName,
            totalAmount: totalValue,
            color,
            transactions: categoryTransactions
        });

        // 3. Abrir modal
        setModalVisible(true);
    };

    // Datos para PieChart
    const pieData = useMemo(() => {
        return Object.entries(stats.categoryTotals).map(([name, value], index) => {
            const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
            return {
                value,
                color: color,
                text: name,
                focused: selectedCategory === name, // Resaltado del Gifted Charts
                onPress: () => handleCategorySelect(name, value, color) // Click en el pedazo del pie
            };
        });
    }, [stats.categoryTotals, selectedCategory]);

    const pieRadius = isSmallScreen ? 120 : isTablet ? 140 : 85;
    const pieInnerRadius = isSmallScreen ? 50 : isTablet ? 80 : 60;

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
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
                                        // Estilo para resaltar la fila seleccionada
                                        const isSelected = selectedCategory === item.text;
                                        const rowBackgroundColor = isSelected ? item.color + '20' : 'transparent'; // 20 es transparencia hex

                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                onPress={() => handleCategorySelect(item.text, item.value, item.color)}
                                                activeOpacity={0.7}
                                                style={[
                                                    styles.categoryRow,
                                                    {
                                                        borderColor: colors.border,
                                                        backgroundColor: rowBackgroundColor,
                                                        borderRadius: 8 // Añadimos borde redondeado para cuando se resalta
                                                    }
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
                                            </TouchableOpacity>
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

                {/* MODAL DE DETALLES */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                        setSelectedCategory(null); // Limpiar selección al cerrar
                    }}
                >
                    <View style={localStyles.modalOverlay}>
                        <View style={[localStyles.modalContent, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                            {/* Header Modal */}
                            <View style={[localStyles.modalHeader, { borderBottomColor: colors.border }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={[styles.colorDot, { backgroundColor: modalData?.color }]} />
                                    <Text style={[localStyles.modalTitle, { color: colors.text }]}>
                                        {modalData?.categoryName}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => {
                                    setModalVisible(false);
                                    setSelectedCategory(null);
                                }}>
                                    <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Total Modal */}
                            <View style={localStyles.modalSummary}>
                                <Text style={[localStyles.modalTotalLabel, { color: colors.textSecondary }]}>Total Spent</Text>
                                <Text style={[localStyles.modalTotalValue, { color: modalData?.color }]}>
                                    -{currencySymbol} {modalData?.totalAmount.toFixed(2)}
                                </Text>
                            </View>

                            {/* Lista de Transacciones Modal */}
                            <FlatList
                                data={modalData?.transactions}
                                keyExtractor={(item) => item.id.toString()}
                                style={{ maxHeight: 300 }}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <View style={[localStyles.transactionRow, { borderBottomColor: colors.border }]}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[localStyles.txDescription, { color: colors.text }]} numberOfLines={1}>
                                                {item.description || "No description"}
                                            </Text>
                                            <Text style={[localStyles.txDate, { color: colors.textSecondary }]}>
                                                {new Date(item.date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <Text style={[localStyles.txAmount, { color: colors.text }]}>
                                            -{currencySymbol}{item.amount.toFixed(2)}
                                        </Text>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                </Modal>

            </Animated.View>
        </ScrollView>
    );
}

// ESTILOS LOCALES PARA EL MODAL
const localStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center', // O 'flex-end' si prefieres estilo BottomSheet
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20
    },
    modalContent: {
        borderRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 1,
        marginBottom: 10
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalSummary: {
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTotalLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    modalTotalValue: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
    },
    txDescription: {
        fontSize: 16,
        fontWeight: '500',
    },
    txDate: {
        fontSize: 12,
        marginTop: 2,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '600',
    }
});
