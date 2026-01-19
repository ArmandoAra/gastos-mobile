import React, { useMemo, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    AccessibilityInfo,
    Platform
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInRight,
    ZoomIn
} from 'react-native-reanimated';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { isTablet, styles } from './styles';
import { StatCard } from './subcomponents/StatsCard';
import { InsightCard } from './subcomponents/InsightCard';
import { EmptyState } from './subcomponents/EmptyState';
import { useDailyExpenseLogic } from '../hooks/useDailyExpenseLogic';
import PeriodSelector from './subcomponents/PeriodSelector';

export default function DailyExpenseViewMobile() {
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

    const pieRadius = isSmallScreen ? 120 : isTablet ? 140 : 85;
    const pieInnerRadius = isSmallScreen ? 50 : isTablet ? 80 : 60;

    // Render optimizado de transacciones en modal
    const renderModalTransaction = useCallback(({ item }: { item: any }) => (
        <View
            style={[localStyles.transactionRow, { borderBottomColor: colors.border }]}
            accessible={true}
            accessibilityLabel={`${item.description || t('common.noDescription')}, ${currencySymbol} ${Math.abs(item.amount).toFixed(2)}, ${new Date(item.date).toLocaleDateString()}`}
        >
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
                style={[localStyles.txAmount, { color: colors.text }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
            >
                -{currencySymbol} {Math.abs(item.amount).toFixed(2)}
            </Text>
        </View>
    ), [colors, currencySymbol, t]);

    const keyExtractor = useCallback((item: any) => item.id.toString(), []);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            accessible={true}
            accessibilityLabel={t('overviews.dailyExpenseView', 'Daily expense overview')}
        >
            <PeriodSelector
                selectedPeriod={currentPeriod}
                onPeriodChange={setCurrentPeriod}
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
                {/* STATS GRID */}
                <View
                    style={[styles.statsGrid, isTablet && styles.statsGridTablet]}
                    accessible={false}
                >
                    <StatCard
                        label={t('common.expenses')}
                        value={`-${currencySymbol} ${stats.totalExpenses.toFixed(0)}`}
                        sub={`${stats.expenseCount} ${t('overviews.tsx')}`}
                        colorBgAndHeader={colors.expense}
                        colorText={colors.text}
                        colorSubText={colors.textSecondary}
                        colorBorder={colors.border}
                        icon="arrow-down"
                        isTablet={isTablet}
                    />
                    <StatCard
                        label={t('common.incomes')}
                        value={`${currencySymbol} ${stats.totalIncome.toFixed(0)}`}
                        sub={`${stats.incomeCount} ${t('overviews.tsx')}`}
                        colorBgAndHeader={colors.income}
                        colorText={colors.text}
                        colorSubText={colors.textSecondary}
                        colorBorder={colors.border}
                        icon="arrow-up"
                        isTablet={isTablet}
                    />
                    <StatCard
                        label={t('common.balance')}
                        value={`${stats.balance >= 0 ? '+' : '-'}${currencySymbol} ${Math.abs(stats.balance).toFixed(0)}`}
                        sub={stats.balance >= 0 ? t('overviews.surPlus') : t('overviews.deficit')}
                        colorBgAndHeader={stats.balance >= 0 ? colors.accent : colors.warning}
                        colorText={colors.text}
                        colorSubText={colors.textSecondary}
                        colorBorder={colors.border}
                        icon="wallet"
                        isTablet={isTablet}
                    />
                    <StatCard
                        label={t('common.topCat')}
                        value={t(`icons.${stats.topCategory.category}`, stats.topCategory.category) || 'N/A'}
                        sub={`${currencySymbol} ${stats.topCategory.amount.toFixed(0)}`}
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
                            <EmptyState period={currentPeriod} color={colors.textSecondary} />
                        ) : (
                            <View>
                                {/* PieChart */}
                                    <View
                                        style={[localStyles.chartContainer]}
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
                                            <View style={{ alignItems: 'center' }}>
                                                <Text
                                                    style={[
                                                        localStyles.chartCenterValue,
                                                        { color: colors.text },
                                                        isSmallScreen && localStyles.chartCenterValueSmall
                                                    ]}
                                                    numberOfLines={1}
                                                    adjustsFontSizeToFit
                                                    minimumFontScale={0.7}
                                                    allowFontScaling={false}
                                                >
                                                    -{currencySymbol} {stats.totalExpenses.toFixed(0)}
                                                </Text>
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

                                {/* Lista de Categorías */}
                                    <View style={localStyles.categoryList}>
                                        <View style={localStyles.catHeader}>
                                            <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                                                {t('overviews.categoryBreakdown')}
                                            </Text>
                                    </View>

                                    {pieData.map((item, idx) => {
                                        const percentage = ((item.value / stats.totalExpenses) * 100).toFixed(1);
                                        const isSelected = selectedCategory === item.text;
                                        const rowBackgroundColor = isSelected ? item.color + '20' : 'transparent';

                                        return (
                                            <TouchableOpacity
                                                key={`${item.text}-${idx}`}
                                                onPress={() => handleCategorySelect(item.text, item.value, item.color)}
                                                activeOpacity={0.7}
                                                style={[
                                                    localStyles.categoryRow,
                                                    {
                                                        borderColor: colors.border,
                                                        backgroundColor: rowBackgroundColor,
                                                    }
                                                ]}
                                                accessible={true}
                                                accessibilityRole="button"
                                                accessibilityLabel={`${item.text}, ${currencySymbol} ${item.value.toFixed(2)}, ${percentage}% ${t('common.of')} ${t('common.total')}`}
                                                accessibilityHint={t('accessibility.tap_view_details', 'Tap to view transaction details')}
                                                accessibilityState={{ selected: isSelected }}
                                            >
                                                <View style={localStyles.catRowTop}>
                                                    <View style={localStyles.catNameContainer}>
                                                        <View
                                                            style={[localStyles.colorDot, { backgroundColor: item.color }]}
                                                            importantForAccessibility="no"
                                                        />
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
                                                    <Text
                                                        style={[
                                                            localStyles.catValue,
                                                            { color: colors.text },
                                                            isSmallScreen && localStyles.catValueSmall
                                                        ]}
                                                        numberOfLines={1}
                                                        adjustsFontSizeToFit
                                                        minimumFontScale={0.8}
                                                    >
                                                        {currencySymbol} {item.value.toFixed(2)}
                                                    </Text>
                                                </View>
                                                <View style={localStyles.catProgressRow}>
                                                    <View
                                                        style={[localStyles.progressBarBg, { backgroundColor: colors.border }]}
                                                        importantForAccessibility="no"
                                                    >
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
                                                    <Text style={[localStyles.catPercent, { color: colors.text }]}>
                                                        {percentage}%
                                                    </Text>
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
                    <Animated.View entering={ZoomIn.delay(200)} style={localStyles.insightsContainer}>
                        <Text style={[localStyles.sectionTitle, { color: colors.text }]}>
                            {t('overviews.insights')}
                        </Text>
                        <View style={[localStyles.insightsGrid, isTablet && localStyles.insightsGridTablet]}>
                            {stats.largestTransaction && (
                                <InsightCard
                                    label={t('overviews.largestTransaction')}
                                    title={`${t('common.expense')} - ${t(`icons.${stats.largestTransaction.category_icon_name}`, stats.largestTransaction.category_icon_name)}`}
                                    value={`-${currencySymbol} ${Math.abs(stats.largestTransaction.amount).toFixed(2)}`}
                                    color={colors.warning}
                                    isSmallScreen={isSmallScreen}
                                    amountColor={colors.text}
                                />
                            )}
                            {dateInfo.isWeekend && currentPeriod === 'day' && (
                                <InsightCard
                                    label={t('overviews.weekendExpense')}
                                    title={`${t('overviews.this')} ${dateInfo.dayOfWeek}`}
                                    value={`${currencySymbol} ${stats.totalExpenses.toFixed(2)}`}
                                    color={colors.accentSecondary}
                                    isSmallScreen={isSmallScreen}
                                    amountColor={colors.text}
                                />
                            )}
                            {stats.balance < 0 && (
                                <InsightCard
                                    label={t('overviews.deficitAlert')}
                                    title={`${t('common.expenses')} > ${t('common.incomes')}`}
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
                    onRequestClose={handleCloseModal}
                    accessible={true}
                    accessibilityViewIsModal={true}
                >
                    <View style={localStyles.modalOverlay}>
                        <View style={[localStyles.modalContent, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                            {/* Header Modal */}
                            <View
                                style={[localStyles.modalHeader, { borderBottomColor: colors.border }]}
                                accessible={false}
                            >
                                <View style={localStyles.modalHeaderLeft}>
                                    <View
                                        style={[localStyles.colorDot, { backgroundColor: modalData?.color }]}
                                        importantForAccessibility="no"
                                    />
                                    <Text
                                        style={[localStyles.modalTitle, { color: colors.text }]}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                        minimumFontScale={0.8}
                                    >
                                        {t(`icons.${modalData?.categoryName}`, modalData?.categoryName || '')}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleCloseModal}
                                    accessible={true}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('common.close', 'Close')}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Total Modal */}
                            <View
                                style={localStyles.modalSummary}
                                accessible={true}
                                accessibilityLabel={`${t('overviews.totalSpent')} ${currencySymbol} ${modalData?.totalAmount.toFixed(2)}`}
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
                                    -{currencySymbol} {modalData?.totalAmount.toFixed(2)}
                                </Text>
                            </View>

                            {/* Lista de Transacciones Modal */}
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
                        </View>
                    </View>
                </Modal>

            </Animated.View>
        </ScrollView>
    );
}

// ESTILOS LOCALES
const localStyles = StyleSheet.create({
    chartContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    chartCenterValue: {
        fontSize: 22,
        fontWeight: 'bold',
        lineHeight: 26,
        textAlign: 'center',
    },
    chartCenterValueSmall: {
        fontSize: 18,
        lineHeight: 22,
    },
    chartCenterLabel: {
        fontSize: 12,
        fontFamily: 'FiraSans-Bold',
        marginTop: 2,
        lineHeight: 16,
    },
    chartCenterSubLabel: {
        fontSize: 10,
        lineHeight: 14,
    },
    categoryList: {
        marginTop: 20,
    },
    catHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    categoryRow: {
        padding: 14,
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 0.5,
        minHeight: 70,
    },
    catRowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 12,
    },
    catNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        flexShrink: 0,
    },
    catName: {
        fontSize: 15,
        fontFamily: 'FiraSans-Bold',
        flex: 1,
        lineHeight: 20,
    },
    catNameSmall: {
        fontSize: 14,
        lineHeight: 18,
    },
    catValue: {
        fontSize: 16,
        fontFamily: 'FiraSans-Bold',
        flexShrink: 0,
        textAlign: 'right',
        minWidth: 100,
        lineHeight: 20,
    },
    catValueSmall: {
        fontSize: 14,
        lineHeight: 18,
    },
    catProgressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    catPercent: {
        fontSize: 13,
        fontFamily: 'FiraSans-Bold',
        textAlign: 'right',
        lineHeight: 18,
    },
    insightsContainer: {
        marginTop: 24,
    },
    insightsGrid: {
        gap: 12,
        marginTop: 12,
    },
    insightsGridTablet: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 20,
        maxHeight: '80%',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 15,
        borderBottomWidth: 1,
        marginBottom: 15,
        gap: 12,
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Tinos-Bold',
        flex: 1,
        lineHeight: 26,
    },
    modalSummary: {
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 10,
    },
    modalTotalLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
        lineHeight: 16,
        fontFamily: 'FiraSans-Bold',
    },
    modalTotalValue: {
        fontSize: 28,
        fontFamily: 'FiraSans-Bold',
        lineHeight: 34,
    },
    transactionList: {
        maxHeight: 350,
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        gap: 12,
        minHeight: 60,
    },
    txInfoContainer: {
        flex: 1,
        gap: 4,
    },
    txDescription: {
        fontSize: 16,
        fontFamily: 'FiraSans-Regular',
        lineHeight: 20,
    },
    txDate: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: 'FiraSans-Regular',
    },
    txAmount: {
        fontSize: 16,
        fontFamily: 'FiraSans-Bold',
        textAlign: 'right',
        minWidth: 90,
        lineHeight: 20,
    }
});