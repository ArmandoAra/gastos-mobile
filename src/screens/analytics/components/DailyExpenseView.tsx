import React, { useMemo, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInRight,
    ZoomIn
} from 'react-native-reanimated';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { isTablet, styles } from './styles';
import { StatCard, TopCategories } from './subcomponents/StatsCard';
import { InsightCard } from './subcomponents/InsightCard';
import { EmptyState } from './subcomponents/EmptyState';
import { useDailyExpenseLogic } from '../hooks/useDailyExpenseLogic';
import PeriodSelector from './subcomponents/PeriodSelector';
import { ViewPeriod } from '../../../interfaces/date.interface';
import { formatCurrency } from '../../../utils/helpers';
import CloseModalButton from './subcomponents/CloseModalButton';
import { format } from 'date-fns';

export default function DailyExpenseViewMobile({ handlePeriodChange }: { handlePeriodChange: (p: ViewPeriod) => void }) {
    const {
        t,
        colors,
        currencySymbol,
        isSmallScreen,
        filteredTransactions,
        dateInfo,
        stats,
        pieData,
        modalVisible,
        modalData,
        selectedCategory,
        currentPeriod,
        setCurrentPeriod,
        handleCategorySelect,
        handleCloseModal
    } = useDailyExpenseLogic();

    const pieRadius = useMemo(() => isSmallScreen ? 120 : isTablet ? 140 : 85, [isSmallScreen]);
    const pieInnerRadius = useMemo(() => isSmallScreen ? 50 : isTablet ? 80 : 60, [isSmallScreen]);

    const renderModalTransaction = useCallback(({ item, index }: { item: any; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 40).springify()}
            style={[localStyles.transactionRow, { borderBottomColor: colors.border }]}
            accessible={true}
            accessibilityLabel={`${item.description || t('common.noDescription')}, ${currencySymbol} ${formatCurrency(Math.abs(item.amount))}, ${new Date(item.date).toLocaleDateString()}`}
        >
            {/* Color accent strip */}
            <View style={[localStyles.txStrip, { backgroundColor: modalData?.color }]} />

            <View style={localStyles.txInfoContainer}>
                <Text
                    style={[localStyles.txDescription, { color: colors.text }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {item.description || t('common.noDescription')}
                </Text>
                <Text style={[localStyles.txDate, { color: colors.textSecondary }]}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
            </View>
            <Text
                style={[localStyles.txAmount, { color: colors.expense }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
            >
                -{currencySymbol}{formatCurrency(Math.abs(item.amount))}
            </Text>
        </Animated.View>
    ), [colors, currencySymbol, t, modalData]);

    const keyExtractor = useCallback((item: any) => item.id.toString(), []);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            accessible={true}
            accessibilityLabel={t('overviews.dailyExpenseView', 'Daily expense overview')}
        >
            <PeriodSelector
                selectedPeriod={currentPeriod}
                onPeriodChange={(period) => {
                    setCurrentPeriod(period);
                    handlePeriodChange(period);
                }}
                colors={colors}
            />

            <Animated.View
                entering={FadeIn.duration(600)}
                style={[
                    styles.container,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    isTablet && styles.containerTablet
                ]}
            >
                {/* ── STATS GRID ── */}
                <View
                    style={[styles.statsGrid, isTablet && styles.statsGridTablet]}
                    accessible={false}
                >
                    <StatCard data={{
                        label: t('common.expenses'),
                        value: -stats.totalExpenses,
                        sub: `${stats.expenseCount} ${t('overviews.tsx')}`,
                        colorBgAndHeader: colors.error,
                        colorText: colors.text,
                        colorSubText: colors.textSecondary,
                        colorBorder: colors.border,
                        icon: "arrow-down",
                        isTablet,
                        currentSymbol: currencySymbol
                    }} />
                    <StatCard data={{
                        label: t('common.incomes'),
                        value: stats.totalIncome,
                        sub: `${stats.incomeCount} ${t('overviews.tsx')}`,
                        colorBgAndHeader: colors.income,
                        colorText: colors.text,
                        colorSubText: colors.textSecondary,
                        colorBorder: colors.border,
                        icon: "arrow-up",
                        isTablet,
                        currentSymbol: currencySymbol
                    }} />
                    <StatCard data={{
                        label: t('common.balance'),
                        value: stats.balance,
                        sub: `${stats.balance >= 0 ? '+' : '-'}${currencySymbol} ${formatCurrency(Math.abs(stats.balance))}`,
                        colorBgAndHeader: stats.balance >= 0 ? colors.income : colors.error,
                        colorText: colors.text,
                        colorSubText: colors.textSecondary,
                        colorBorder: colors.border,
                        icon: "wallet",
                        isTablet,
                        currentSymbol: currencySymbol
                    }} />
                    <StatCard data={{
                        label: t('common.topCat'),
                        value: stats.topCategory ? stats.topCategory.amount : 0,
                        sub: `${stats.topCategory ? (stats.topCategory.amount >= 0 ? '+' : '-') : ''}${currencySymbol} ${stats.topCategory ? formatCurrency(Math.abs(stats.topCategory.amount)) : '0.00'}`,
                        colorBgAndHeader: colors.warning,
                        colorText: colors.text,
                        colorSubText: colors.textSecondary,
                        colorBorder: colors.border,
                        icon: "pie-chart",
                        isTablet,
                        currentSymbol: currencySymbol
                    }} />
                </View>

                {/* ── CONTENT ── */}
                <View style={styles.contentContainer}>
                    <Animated.View entering={FadeInRight.duration(300)}>
                        {filteredTransactions.length === 0 ? (
                            <EmptyState period={currentPeriod} color={colors.textSecondary} />
                        ) : (
                            <View>
                                    {/* ── PIE CHART ── */}
                                    <View
                                        style={localStyles.chartContainer}
                                        accessible={true}
                                        accessibilityLabel={`${t('overviews.categoryBreakdown')}. ${t('common.total')} ${t('common.expenses')}: ${currencySymbol} ${stats.totalExpenses.toFixed(0)}`}
                                    >
                                    <PieChart
                                        data={pieData}
                                        donut
                                        radius={pieRadius}
                                        innerRadius={pieInnerRadius}
                                        innerCircleColor={colors.surface}
                                        centerLabelComponent={() => (
                                            <View style={localStyles.chartCenter}>
                                                <View style={[localStyles.chartCenterBadge, { backgroundColor: colors.error + '28' }]}>
                                                    <Text
                                                        style={[
                                                            localStyles.chartCenterValue,
                                                            { color: colors.text },
                                                            isSmallScreen && localStyles.chartCenterValueSmall,
                                                        ]}
                                                        numberOfLines={1}
                                                        adjustsFontSizeToFit
                                                        minimumFontScale={0.7}
                                                        allowFontScaling={false}
                                                    >
                                                        {formatCurrency(stats.totalExpenses)}
                                                    </Text>
                                                </View>
                                                <Text style={[localStyles.chartCenterLabel, { color: colors.text }]} allowFontScaling={false}>
                                                    {t('common.total')}
                                                </Text>
                                                <Text style={[localStyles.chartCenterSubLabel, { color: colors.textSecondary }]} allowFontScaling={false}>
                                                    {t('common.expenses')}
                                                </Text>
                                            </View>
                                        )}
                                    />
                                </View>

                                    {/* ── CATEGORY LIST ── */}
                                    <View style={localStyles.categoryList}>
                                        <View style={localStyles.catHeader}>
                                            <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                                                {t('overviews.categoryBreakdown')}
                                            </Text>
                                    </View>

                                    {pieData.map((item, idx) => {
                                        const percentage = ((item.value / stats.totalExpenses) * 100).toFixed(1);
                                        const isSelected = selectedCategory === item.text;

                                        return (
                                            <Animated.View
                                                key={`${item.text}-${idx}`}
                                                entering={FadeInDown.delay(idx * 50).springify()}
                                            >
                                                <TouchableOpacity
                                                    onPress={() => handleCategorySelect(item.text, item.value, item.color)}
                                                    activeOpacity={0.82}
                                                    style={[
                                                        localStyles.categoryRow,
                                                        {
                                                            backgroundColor: isSelected
                                                                ? item.color + '18'
                                                                : colors.surfaceSecondary,
                                                            borderColor: isSelected
                                                                ? item.color + '55'
                                                                : 'transparent',
                                                        }
                                                    ]}
                                                    accessible={true}
                                                    accessibilityRole="button"
                                                    accessibilityLabel={`${item.text}, ${currencySymbol} ${item.value.toFixed(2)}, ${percentage}% ${t('common.of')} ${t('common.total')}`}
                                                    accessibilityHint={t('accessibility.tap_view_details', 'Tap to view transaction details')}
                                                    accessibilityState={{ selected: isSelected }}
                                                >
                                                    {/* Dot de color — reemplaza el borde lateral */}
                                                    <View style={[localStyles.catAccentBar, { backgroundColor: item.color }]} />

                                                    <View style={localStyles.catInner}>
                                                        <View style={localStyles.catRowTop}>
                                                            {/* Nombre con avatar de color */}
                                                            <View style={localStyles.catNameContainer}>
                                                                <View style={[localStyles.catDotBox, { backgroundColor: item.color + '22' }]}>
                                                                    <View style={[localStyles.colorDot, { backgroundColor: item.color }]} />
                                                                </View>
                                                                <Text
                                                                    style={[
                                                                        localStyles.catName,
                                                                        { color: colors.text },
                                                                        isSmallScreen && localStyles.catNameSmall
                                                                    ]}
                                                                    numberOfLines={2}
                                                                    ellipsizeMode="tail"
                                                                >
                                                                    {t(`icons.${item.text}`, item.text)}
                                                                </Text>
                                                            </View>

                                                            {/* Monto + % */}
                                                            <View style={localStyles.catRight}>
                                                                <Text
                                                                    style={[
                                                                        localStyles.catValue,
                                                                        { color: colors.expense },
                                                                        isSmallScreen && localStyles.catValueSmall
                                                                    ]}
                                                                    numberOfLines={1}
                                                                    adjustsFontSizeToFit
                                                                    minimumFontScale={0.8}
                                                                >
                                                                    -{currencySymbol}{formatCurrency(item.value)}
                                                                </Text>
                                                                {/* Chip de porcentaje — mismo pill que chips del resto de la app */}
                                                                <View style={[localStyles.percentChip, { backgroundColor: item.color + '22' }]}>
                                                                    <Text style={[localStyles.catPercent, { color: item.color }]}>
                                                                        {percentage.replace('.', ',')}%
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </View>

                                                        {/* Barra de progreso — h6 radius 99, igual que CategoryRow */}
                                                        <View style={[localStyles.progressBarBg, { backgroundColor: colors.border }]}>
                                                            <View
                                                                style={[
                                                                    localStyles.progressBarFill,
                                                                    {
                                                                        width: `${percentage}%` as `${number}%`,
                                                                        backgroundColor: item.color
                                                                    }
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            </Animated.View>
                                        );
                                    })}
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </View>

                {/* ── INSIGHTS ── */}
                {filteredTransactions.length > 0 && (stats.largestTransaction || dateInfo.isWeekend || stats.balance < 0) && (
                    <Animated.View entering={ZoomIn.delay(200)} style={localStyles.insightsContainer}>
                        <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                            {t('overviews.insights')}
                        </Text>
                        <View style={[localStyles.insightsGrid, isTablet && localStyles.insightsGridTablet]}>
                            {stats.largestTransaction && (
                                <InsightCard
                                    label={t('overviews.largestTransaction')}
                                    title={`${t('common.expense')} - ${t(`icons.${stats.largestTransaction.category_icon_name}`, stats.largestTransaction.category_icon_name)}`}
                                    value={`-${currencySymbol} ${formatCurrency(stats.largestTransaction.amount)}`}
                                    color={colors.warning}
                                    isSmallScreen={isSmallScreen}
                                    amountColor={colors.text}
                                />
                            )}
                            {dateInfo.isWeekend && currentPeriod === 'day' && (
                                <InsightCard
                                    label={t('overviews.weekendExpense')}
                                    title={`${t('overviews.this')} ${dateInfo.dayOfWeek}`}
                                    value={`${currencySymbol} ${formatCurrency(stats.totalExpenses)}`}
                                    color={colors.accentSecondary}
                                    isSmallScreen={isSmallScreen}
                                    amountColor={colors.text}
                                />
                            )}
                            {stats.balance < 0 && (
                                <InsightCard
                                    label={t('overviews.deficitAlert')}
                                    title={`${t('common.expenses')} > ${t('common.incomes')}`}
                                    value={`-${currencySymbol} ${formatCurrency(Math.abs(stats.balance))}`}
                                    color={colors.error}
                                    isSmallScreen={isSmallScreen}
                                    amountColor={colors.text}
                                />
                            )}
                        </View>
                    </Animated.View>
                )}

                {/* ── MODAL DE DETALLES ── */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={handleCloseModal}
                    accessible={true}
                    accessibilityViewIsModal={true}
                >
                    <View style={localStyles.modalOverlay}>
                        <Animated.View
                            entering={FadeInDown.springify()}
                            style={[localStyles.modalContent, { backgroundColor: colors.surface }]}
                        >
                            {/* Drag handle */}
                            <View style={[localStyles.dragHandle, { backgroundColor: colors.border }]} />

                            {/* Header */}
                            <View
                                style={localStyles.modalHeader}
                                accessible={false}
                            >
                                {/* Avatar de color de la categoría */}
                                <View style={[localStyles.modalCatDot, { backgroundColor: modalData?.color + '28' }]}>
                                    <View style={[localStyles.colorDot, { backgroundColor: modalData?.color }]} />
                                </View>
                                <Text
                                    style={[localStyles.modalTitle, { color: colors.text }]}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.8}
                                >
                                    {t(`icons.${modalData?.categoryName}`, modalData?.categoryName || '')}
                                </Text>
                            </View>

                            {/* Total */}
                            <View
                                style={[localStyles.modalSummary, { backgroundColor: (modalData?.color ?? '#ccc') + '12', borderColor: (modalData?.color ?? '#ccc') + '30' }]}
                                accessible={true}
                                accessibilityLabel={`${t('overviews.totalSpent')} ${currencySymbol} ${formatCurrency(modalData?.totalAmount || 0)}`}
                            >
                                <Text style={[localStyles.modalTotalLabel, { color: colors.textSecondary }]}>
                                    {t('overviews.totalSpent')}
                                </Text>
                                <Text
                                    style={[localStyles.modalTotalValue, { color: modalData?.color }]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.7}
                                >
                                    -{currencySymbol}{formatCurrency(modalData?.totalAmount || 0)}
                                </Text>
                            </View>

                            {/* Lista de transacciones */}
                            <FlatList
                                data={modalData?.transactions}
                                keyExtractor={keyExtractor}
                                style={localStyles.transactionList}
                                showsVerticalScrollIndicator={false}
                                renderItem={renderModalTransaction}
                                accessible={false}
                                removeClippedSubviews={true}
                                maxToRenderPerBatch={10}
                                windowSize={5}
                            />

                            <CloseModalButton handleCloseModal={handleCloseModal} colors={colors} t={t} />
                        </Animated.View>
                    </View>
                </Modal>

            </Animated.View>
        </ScrollView>
    );
}

const localStyles = StyleSheet.create({
    // ── Pie chart ──
    chartContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    chartCenter: {
        alignItems: 'center',
    },
    chartCenterBadge: {
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginBottom: 2,
    },
    chartCenterValue: {
        fontSize: 20,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 26,
        textAlign: 'center',
    },
    chartCenterValueSmall: {
        fontSize: 16,
        lineHeight: 20,
    },
    chartCenterLabel: {
        fontSize: 11,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 16,
    },
    chartCenterSubLabel: {
        fontSize: 10,
        lineHeight: 14,
    },

    // ── Category list ──
    categoryList: {
        marginTop: 20,
        gap: 8,
    },
    catHeader: {
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 22,
    },
    // Tarjeta de categoría — mismo lenguaje visual que TransactionItem / BudgetCard
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderRadius: 14,
        borderWidth: 1,
        overflow: 'hidden',
        minHeight: 72,
    },
    // Barra lateral de color (reemplaza el colorDot suelto)
    catAccentBar: {
        width: 4,
        borderRadius: 0,
        flexShrink: 0,
    },
    catInner: {
        flex: 1,
        padding: 12,
        gap: 10,
    },
    catRowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    catNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    // Mini avatar cuadrado — igual que iconBox de CategoryRow
    catDotBox: {
        width: 28,
        height: 28,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    colorDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        flexShrink: 0,
    },
    catName: {
        fontSize: 14,
        fontFamily: 'FiraSans-Bold',
        flex: 1,
        lineHeight: 20,
    },
    catNameSmall: {
        fontSize: 13,
        lineHeight: 18,
    },
    catRight: {
        alignItems: 'flex-end',
        gap: 4,
        flexShrink: 0,
    },
    catValue: {
        fontSize: 14,
        fontFamily: 'FiraSans-Bold',
        textAlign: 'right',
        lineHeight: 20,
    },
    catValueSmall: {
        fontSize: 13,
        lineHeight: 18,
    },
    // Chip de porcentaje — pill como en el resto de la app
    percentChip: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 99,
    },
    catPercent: {
        fontSize: 11,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 14,
    },
    // Barra — h6 radius 99, igual que CategoryRow / BudgetCard
    progressBarBg: {
        height: 6,
        borderRadius: 99,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 99,
    },

    // ── Insights ──
    insightsContainer: {
        marginTop: 24,
        gap: 12,
    },
    insightsGrid: {
        gap: 10,
        marginTop: 4,
    },
    insightsGridTablet: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    // ── Modal ──
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',         // bottom sheet
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        maxHeight: '82%',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 12,
    },
    // Drag handle visual
    dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 99,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    // Avatar de color de la categoría en modal
    modalCatDot: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Tinos-Bold',
        flex: 1,
        lineHeight: 24,
    },
    // Bloque de total — fondo tintado con el color de la categoría
    modalSummary: {
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    modalTotalLabel: {
        fontSize: 11,
        fontFamily: 'FiraSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 6,
        lineHeight: 16,
    },
    modalTotalValue: {
        fontSize: 28,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 34,
    },

    // ── Transaction rows en modal ──
    transactionList: {
        maxHeight: 340,
    },
    transactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 10,
        minHeight: 56,
    },
    // Franja de color lateral — alineada con catAccentBar
    txStrip: {
        width: 3,
        height: '70%',
        borderRadius: 99,
        flexShrink: 0,
    },
    txInfoContainer: {
        flex: 1,
        gap: 3,
    },
    txDescription: {
        fontSize: 14,
        fontFamily: 'FiraSans-Regular',
        lineHeight: 20,
    },
    txDate: {
        fontSize: 11,
        fontFamily: 'FiraSans-Regular',
        lineHeight: 14,
    },
    txAmount: {
        fontSize: 14,
        fontFamily: 'FiraSans-Bold',
        textAlign: 'right',
        minWidth: 80,
        lineHeight: 20,
        flexShrink: 0,
    },
});